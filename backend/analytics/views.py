"""
Analytics API views for usage tracking and safety incidents
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta, date

from .models import UserActivity, SafetyIncident, UsageMetrics
from mymental_backend.audit_log import log_event


class TrackActivityView(APIView):
    """Track user activity"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        activity_type = request.data.get('activity_type')
        activity_data = request.data.get('activity_data', {})
        
        if not activity_type:
            return Response({'error': 'activity_type is required'}, status=status.HTTP_400_BAD_REQUEST)

        UserActivity.objects.create(
            user=request.user,
            activity_type=activity_type,
            activity_data=activity_data,
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        return Response({'message': 'Activity tracked'}, status=status.HTTP_201_CREATED)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SafetyIncidentsView(APIView):
    """List safety incidents (counselor/admin only)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.user_type not in ['counselor', 'admin']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        incidents = SafetyIncident.objects.filter(resolved=False).order_by('-created_at')[:100]
        
        data = [{
            'id': inc.id,
            'incident_type': inc.incident_type,
            'severity': inc.severity,
            'description': inc.description,
            'metadata': inc.metadata,
            'user_id': inc.user.id if inc.user else None,
            'username': inc.user.username if inc.user else 'Anonymous',
            'created_at': inc.created_at,
        } for inc in incidents]

        return Response(data, status=status.HTTP_200_OK)


class UsageStatsView(APIView):
    """Get usage statistics (admin only)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.user_type != 'admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Get stats for last 30 days
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)

        # Daily active users
        daily_active = UserActivity.objects.filter(
            created_at__date__gte=start_date,
            activity_type='login'
        ).values('created_at__date').distinct().count()

        # Total sessions
        total_sessions = UserActivity.objects.filter(
            created_at__date__gte=start_date,
            activity_type='chat_session_start'
        ).count()

        # Safety incidents
        incidents = SafetyIncident.objects.filter(
            created_at__date__gte=start_date,
            resolved=False
        ).count()

        return Response({
            'daily_active_users_30d': daily_active,
            'total_sessions_30d': total_sessions,
            'pending_safety_incidents': incidents,
            'period': {
                'start': start_date,
                'end': end_date,
            }
        }, status=status.HTTP_200_OK)

