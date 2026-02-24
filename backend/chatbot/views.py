"""
API views for the chatbot
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import uuid
from .models import Conversation, Message, EmotionalCheckIn, CrisisKeyword, CrisisAlert, Psychoeducation, PreSessionQuestionnaire, NotificationDevice
from .services import MentalHealthChatbot
from .serializers import ConversationSerializer, MessageSerializer, CheckInSerializer, PsychoeducationSerializer, PreSessionQuestionnaireSerializer, NotificationDeviceSerializer, ChatReportSerializer
from django.conf import settings
import requests
from mymental_backend.audit_log import log_user_action, log_event
from mymental_backend.cache_utils import (
    get_or_set,
    build_cache_key,
    get_user_namespace_version,
    bump_user_namespace,
)
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from mymental_backend.rate_limiting import ReportRateThrottle


chatbot = MentalHealthChatbot()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_conversation(request):
    """Start a new conversation"""
    user = request.user
    session_id = str(uuid.uuid4())
    
    conversation = Conversation.objects.create(
        user=user,
        session_id=session_id
    )
    # Invalidate user's conversations cache
    bump_user_namespace('conversations', user.id)
    
    return Response({
        'session_id': session_id,
        'message': 'Conversation started successfully'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """Send a message to the chatbot"""
    user = request.user
    session_id = request.data.get('session_id')
    user_message = request.data.get('message')
    
    if not session_id or not user_message:
        return Response(
            {'error': 'session_id and message are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get or create conversation
    conversation, created = Conversation.objects.get_or_create(
        user=user,
        session_id=session_id,
        defaults={'user': user, 'session_id': session_id}
    )
    
    # Detect crisis (with user and conversation for alert creation)
    crisis_detection = chatbot.detect_crisis(user_message, user=user, conversation=conversation)
    
    # Save user message (using IDs for cross-database compatibility)
    user_msg = Message.objects.create(
        session_id=session_id,
        user_id=user.id,
        conversation_id=conversation.id,
        message_type='user',
        content=user_message,
        metadata={'crisis_detection': crisis_detection}
    )
    
    # Generate bot response (pass crisis detection for context-aware response)
    # Get previous messages by session_id
    previous_messages = list(Message.objects.filter(session_id=session_id).order_by('created_at').values('message_type', 'content'))
    bot_response = chatbot.generate_response(user_message, previous_messages, crisis_detection=crisis_detection)
    
    # Save bot response
    bot_msg = Message.objects.create(
        session_id=session_id,
        user_id=user.id,
        conversation_id=conversation.id,
        message_type='bot',
        content=bot_response,
        metadata={'crisis_detected': crisis_detection}
    )
    # Invalidate caches affected by new messages
    bump_user_namespace('messages', user.id)
    bump_user_namespace('conversations', user.id)
    
    # If crisis detected, escalate
    if crisis_detection.get('is_crisis'):
        conversation.is_escalated = True
        conversation.save()
        # Log escalation
        log_event(
            event_type='conversation_escalated',
            description=f'Conversation {session_id} escalated due to crisis detection',
            user=user,
            metadata={
                'session_id': session_id,
                'severity': crisis_detection.get('severity'),
                'matched_keywords': crisis_detection.get('matched_keywords', [])
            },
            severity='warning'
        )
        return Response({
            'bot_response': bot_response,
            'crisis_detected': True,
            'message': 'Your message has been flagged for immediate attention. A counselor will reach out to you shortly.',
            'emergency_resources': [
                'National Suicide Prevention Lifeline: 988',
                'Crisis Text Line: Text HOME to 741741'
            ],
            'risk_level': crisis_detection.get('risk_level', 3),
            'risk_label': crisis_detection.get('risk_label', 'high'),
            'rationale': crisis_detection.get('rationale'),
            'mood_profile': crisis_detection.get('mood_profile'),
        })
    
    return Response({
        'bot_response': bot_response,
        'crisis_detected': False,
        'session_id': session_id,
        'risk_level': crisis_detection.get('risk_level', 1),
        'risk_label': crisis_detection.get('risk_label', 'low'),
        'rationale': crisis_detection.get('rationale'),
        'mood_profile': crisis_detection.get('mood_profile'),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation(request, session_id):
    """Get conversation history"""
    conversation = get_object_or_404(Conversation, session_id=session_id, user=request.user)
    # Get messages by session_id from MongoDB, cached per user namespace
    v = get_user_namespace_version('messages', request.user.id)
    cache_key = build_cache_key('messages', session_id, 'list', version=v)
    data = get_or_set(
        cache_key,
        lambda: MessageSerializer(
            Message.objects.filter(session_id=session_id).order_by('created_at'),
            many=True
        ).data,
        ttl=120
    )
    return Response({'conversation': data, 'session_id': session_id})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    """List all conversations for the user"""
    v = get_user_namespace_version('conversations', request.user.id)
    cache_key = build_cache_key('conversations', request.user.id, 'list', version=v)
    data = get_or_set(
        cache_key,
        lambda: ConversationSerializer(Conversation.objects.filter(user=request.user), many=True).data,
        ttl=120
    )
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_check_in(request):
    """Create an emotional check-in"""
    serializer = CheckInSerializer(data=request.data)
    if serializer.is_valid():
        # Save with user_id instead of user ForeignKey
        check_in = serializer.save(user_id=request.user.id)
        return Response(CheckInSerializer(check_in).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_check_ins(request):
    """Get emotional check-ins for the user"""
    check_ins = EmotionalCheckIn.objects.filter(user_id=request.user.id)
    serializer = CheckInSerializer(check_ins, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_crisis_alerts(request):
    """
    List crisis alerts
    - Regular users: Only their own alerts
    - Counselors/Admins: All pending alerts or alerts assigned to them
    """
    user = request.user
    user_type = getattr(user, 'user_type', 'client')
    
    if user_type in ['counselor', 'admin']:
        # Show all pending alerts or alerts assigned to them
        status_filter = request.query_params.get('status', 'pending')
        alerts = CrisisAlert.objects.filter(status=status_filter)
        
        # If not admin, show only alerts assigned to counselor
        if user_type == 'counselor':
            alerts = alerts.filter(escalated_to=user)
    else:
        # Regular users see only their own alerts
        alerts = CrisisAlert.objects.filter(user=user)
    
    # Serialize alerts
    alerts_data = []
    for alert in alerts.order_by('-created_at')[:50]:  # Limit to 50 most recent
        alerts_data.append({
            'id': alert.id,
            'user': alert.user.username,
            'message': alert.message[:100] + '...' if len(alert.message) > 100 else alert.message,
            'severity': alert.severity,
            'severity_display': alert.get_severity_display(),
            'matched_keywords': alert.matched_keywords,
            'status': alert.status,
            'created_at': alert.created_at.isoformat(),
            'escalated_to': alert.escalated_to.username if alert.escalated_to else None,
        })
    
    return Response(alerts_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def acknowledge_alert(request, alert_id):
    """Acknowledge a crisis alert (counselors/admins only)"""
    user = request.user
    user_type = getattr(user, 'user_type', 'client')
    
    if user_type not in ['counselor', 'admin']:
        return Response(
            {'error': 'Only counselors and admins can acknowledge alerts'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        alert = CrisisAlert.objects.get(pk=alert_id)
    except CrisisAlert.DoesNotExist:
        return Response(
            {'error': 'Alert not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    from django.utils import timezone
    from mymental_backend.audit_log import log_crisis_event
    alert.status = 'acknowledged'
    alert.acknowledged_at = timezone.now()
    alert.escalated_to = user
    alert.save()
    
    # Also escalate the conversation if it exists
    if alert.conversation:
        alert.conversation.is_escalated = True
        alert.conversation.escalated_to = user
        alert.conversation.save()
    
    # Log alert acknowledgment
    log_crisis_event(alert, action='acknowledged')
    
    return Response({
        'message': 'Alert acknowledged successfully',
        'alert_id': alert.id
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_escalated_conversations(request):
    """List escalated conversations for counselors/admins"""
    user = request.user
    user_type = getattr(user, 'user_type', 'client')
    
    if user_type not in ['counselor', 'admin']:
        return Response(
            {'error': 'Only counselors and admins can view escalated conversations'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get conversations escalated to this counselor, or all if admin
    if user_type == 'admin':
        conversations = Conversation.objects.filter(is_escalated=True)
    else:
        conversations = Conversation.objects.filter(is_escalated=True, escalated_to=user)
    
    conversations_data = []
    for conv in conversations.order_by('-updated_at'):
        conversations_data.append({
            'id': conv.id,
            'session_id': conv.session_id,
            'user': conv.user.username,
            'user_id': conv.user.id,
            'created_at': conv.created_at.isoformat(),
            'updated_at': conv.updated_at.isoformat(),
            'summary': conv.summary,
            'escalated_to': conv.escalated_to.username if conv.escalated_to else None,
        })
    
    return Response(conversations_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_for_counselor(request, session_id):
    """Get conversation details with messages for counselors"""
    user = request.user
    user_type = getattr(user, 'user_type', 'client')
    
    if user_type not in ['counselor', 'admin']:
        return Response(
            {'error': 'Only counselors and admins can view conversations'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        conversation = Conversation.objects.get(session_id=session_id)
        # Check if counselor is assigned or if admin
        if user_type != 'admin' and conversation.escalated_to != user:
            return Response(
                {'error': 'You do not have access to this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get messages from MongoDB
        messages = Message.objects.filter(session_id=session_id).order_by('created_at')
        messages_data = []
        for msg in messages:
            messages_data.append({
                'id': msg.id,
                'message_type': msg.message_type,
                'content': msg.content,
                'created_at': msg.created_at.isoformat(),
                'metadata': msg.metadata,
            })
        
        return Response({
            'conversation': {
                'id': conversation.id,
                'session_id': conversation.session_id,
                'user': conversation.user.username,
                'user_id': conversation.user.id,
                'is_escalated': conversation.is_escalated,
                'summary': conversation.summary,
                'created_at': conversation.created_at.isoformat(),
                'updated_at': conversation.updated_at.isoformat(),
            },
            'messages': messages_data
        })
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_summary(request, session_id):
    """Generate a summary for a conversation (counselors/admins only)"""
    user = request.user
    user_type = getattr(user, 'user_type', 'client')
    
    if user_type not in ['counselor', 'admin']:
        return Response(
            {'error': 'Only counselors and admins can generate summaries'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        conversation = Conversation.objects.get(session_id=session_id)
        
        # Check access
        if user_type != 'admin' and conversation.escalated_to != user:
            return Response(
                {'error': 'You do not have access to this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all messages for the conversation
        messages = Message.objects.filter(session_id=session_id).order_by('created_at')
        messages_list = [
            {
                'message_type': msg.message_type,
                'content': msg.content,
                'created_at': msg.created_at.isoformat()
            }
            for msg in messages
        ]
        
        # Generate summary using chatbot service
        summary = chatbot.summarize_conversation(messages_list)
        
        # Save summary to conversation
        conversation.summary = summary
        conversation.save()
        
        # Log summary generation
        log_event(
            event_type='summary_generated',
            description=f'Summary generated for conversation {session_id}',
            user=user,
            metadata={
                'session_id': session_id,
                'conversation_id': conversation.id
            }
        )
        
        return Response({
            'summary': summary,
            'session_id': session_id
        })
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to generate summary: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_psychoeducation(request):
    """List psychoeducation modules with optional search and category filter"""
    qs = Psychoeducation.objects.all()
    category = request.query_params.get('category')
    search = request.query_params.get('q')
    if category:
        qs = qs.filter(category__iexact=category)
    if search:
        qs = qs.filter(title__icontains=search)
    serializer = PsychoeducationSerializer(qs.order_by('-created_at')[:100], many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_psychoeducation(request, pk: int):
    """Retrieve a single psychoeducation module by id"""
    v = get_user_namespace_version('psycho', request.user.id)
    cache_key = build_cache_key('psycho', pk, version=v)
    data = get_or_set(cache_key, lambda: PsychoeducationSerializer(get_object_or_404(Psychoeducation, pk=pk)).data, ttl=600)
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_psychoeducation_by_category(request, category: str):
    """List psychoeducation modules by category"""
    qs = Psychoeducation.objects.filter(category__iexact=category)
    serializer = PsychoeducationSerializer(qs.order_by('-created_at')[:100], many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search(request):
    """Full-text search across psychoeducation and user's conversations (secure).
    Params:
      - q: query string (required, 2-100 chars)
      - scope: psycho|conversations|all (default all)
      - limit: max items per section (default 20)
    """
    q = (request.query_params.get('q') or '').strip()
    if len(q) < 2 or len(q) > 100:
        return Response({'error': 'Query must be 2-100 characters'}, status=status.HTTP_400_BAD_REQUEST)

    scope = (request.query_params.get('scope') or 'all').lower()
    try:
        limit = max(1, min(int(request.query_params.get('limit', 20)), 50))
    except Exception:
        limit = 20

    # Cache per user and query
    v = get_user_namespace_version('search', request.user.id)
    cache_key = build_cache_key('search', request.user.id, scope, q, limit, version=v)
    def _do_search():
        result = {}
        if scope in ('psycho', 'all'):
            vector = SearchVector('title', weight='A') + SearchVector('content', weight='B')
            query = SearchQuery(q)
            qs = Psychoeducation.objects.annotate(rank=SearchRank(vector, query)).filter(rank__gte=0.001).order_by('-rank')[:limit]
            result['psychoeducation'] = PsychoeducationSerializer(qs, many=True).data

        if scope in ('conversations', 'all'):
            # Restrict to current user
            vector = SearchVector('session_id', weight='A') + SearchVector('summary', weight='B')
            query = SearchQuery(q)
            qs = Conversation.objects.filter(user=request.user).annotate(rank=SearchRank(vector, query)).filter(rank__gte=0.001).order_by('-rank')[:limit]
            result['conversations'] = ConversationSerializer(qs, many=True).data

        return result

    data = get_or_set(cache_key, _do_search, ttl=60)
    return Response({'q': q, 'scope': scope, 'results': data})


@api_view(['POST'])
@permission_classes([AllowAny])
def anon_start_conversation(request):
    """Start an anonymous conversation (no auth, no DB persistence)"""
    session_id = str(uuid.uuid4())
    return Response({
        'session_id': session_id,
        'message': 'Anonymous conversation started'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def anon_send_message(request):
    """Send a message anonymously (stateless, no DB writes)"""
    session_id = request.data.get('session_id')
    user_message = request.data.get('message')
    previous_messages = request.data.get('previous_messages', [])
    if not session_id or not user_message:
        return Response({'error': 'session_id and message are required'}, status=status.HTTP_400_BAD_REQUEST)
    crisis_detection = chatbot.detect_crisis(user_message, user=None, conversation=None)
    bot_response = chatbot.generate_response(user_message, previous_messages, crisis_detection=crisis_detection)
    return Response({
        'bot_response': bot_response,
        'crisis_detected': bool(crisis_detection.get('is_crisis')),
        'session_id': session_id,
        'risk_level': crisis_detection.get('risk_level'),
        'risk_label': crisis_detection.get('risk_label'),
        'rationale': crisis_detection.get('rationale'),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_message(request):
    """Submit a report for a message or conversation session."""
    request.throttle_classes = [ReportRateThrottle, UserRateThrottle, AnonRateThrottle]
    data = {
        'session_id': request.data.get('session_id'),
        'message_id': request.data.get('message_id'),
        'reason': request.data.get('reason'),
        'details': request.data.get('details', ''),
    }
    if not data['session_id'] or not data['reason']:
        return Response({'error': 'session_id and reason are required'}, status=status.HTTP_400_BAD_REQUEST)
    from .models import ChatReport
    report = ChatReport.objects.create(
        reporter=request.user,
        session_id=data['session_id'],
        message_id=data.get('message_id'),
        reason=data['reason'],
        details=data['details']
    )
    return Response(ChatReportSerializer(report).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_reports(request):
    """List reports: users see own; counselors/admin see open/reviewing.
    Optional query: status
    """
    from .models import ChatReport
    role = getattr(request.user, 'user_type', 'client')
    status_filter = request.query_params.get('status')
    if role in ['counselor', 'admin']:
        qs = ChatReport.objects.all()
        if role == 'counselor':
            qs = qs.filter(status__in=['open', 'reviewing'])
    else:
        qs = ChatReport.objects.filter(reporter=request.user)
    if status_filter:
        qs = qs.filter(status=status_filter)
    data = ChatReportSerializer(qs.order_by('-created_at')[:100], many=True).data
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handle_report(request, report_id: int):
    """Counselor/Admin handles a report.
    body: { action: resolve|dismiss|review, action_taken?: string }
    """
    role = getattr(request.user, 'user_type', 'client')
    if role not in ['counselor', 'admin']:
        return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
    from .models import ChatReport
    try:
        report = ChatReport.objects.get(pk=report_id)
    except ChatReport.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    action = (request.data.get('action') or '').lower()
    if action not in ['resolve', 'dismiss', 'review']:
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
    from django.utils import timezone
    if action == 'resolve':
        report.status = 'resolved'
        report.handled_at = timezone.now()
    elif action == 'dismiss':
        report.status = 'dismissed'
        report.handled_at = timezone.now()
    else:
        report.status = 'reviewing'
    report.handled_by = request.user
    report.action_taken = request.data.get('action_taken', '')
    report.save()
    return Response(ChatReportSerializer(report).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_pre_session_questionnaire(request):
    """Submit pre-therapy questionnaire (auth required)"""
    serializer = PreSessionQuestionnaireSerializer(data=request.data)
    if serializer.is_valid():
        item = serializer.save(user=request.user)
        return Response(PreSessionQuestionnaireSerializer(item).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_my_questionnaires(request):
    """List questionnaires submitted by the authenticated user"""
    qs = PreSessionQuestionnaire.objects.filter(user=request.user).order_by('-created_at')
    return Response(PreSessionQuestionnaireSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_device(request):
    """Register or update an FCM device token for the authenticated user."""
    serializer = NotificationDeviceSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        platform = serializer.validated_data.get('platform', 'web')
        # Ensure unique token maps to current user; reassign if necessary
        device, _ = NotificationDevice.objects.update_or_create(
            token=token,
            defaults={'user': request.user, 'platform': platform, 'active': True}
        )
        return Response(NotificationDeviceSerializer(device).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unregister_device(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'token is required'}, status=status.HTTP_400_BAD_REQUEST)
    NotificationDevice.objects.filter(user=request.user, token=token).delete()
    return Response({'message': 'Device unregistered'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_devices(request):
    devices = NotificationDevice.objects.filter(user=request.user)
    return Response(NotificationDeviceSerializer(devices, many=True).data)


def _send_fcm_message(server_key: str, token: str, title: str, body: str) -> tuple[int, dict]:
    url = 'https://fcm.googleapis.com/fcm/send'
    headers = {
        'Authorization': f'key={server_key}',
        'Content-Type': 'application/json'
    }
    payload = {
        'to': token,
        'notification': {
            'title': title,
            'body': body
        }
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=10)
    try:
        data = resp.json()
    except Exception:
        data = {'text': resp.text}
    return resp.status_code, data


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_test_notification(request):
    """Send a test push notification to one of the user's registered devices."""
    if not getattr(settings, 'FCM_SERVER_KEY', None):
        return Response({'error': 'FCM server key not configured'}, status=status.HTTP_501_NOT_IMPLEMENTED)
    token = request.data.get('token')
    if not token:
        dev = NotificationDevice.objects.filter(user=request.user, active=True).first()
        if not dev:
            return Response({'error': 'No active device token found for user'}, status=status.HTTP_400_BAD_REQUEST)
        token = dev.token
    code, data = _send_fcm_message(settings.FCM_SERVER_KEY, token, 'MyMental Test', 'Notifications are working!')
    # If FCM indicates invalid token, deactivate it
    invalid = False
    if isinstance(data, dict):
        if 'failure' in data and data.get('failure', 0) > 0:
            invalid = True
        if 'results' in data and isinstance(data['results'], list):
            for r in data['results']:
                if isinstance(r, dict) and r.get('error') in {'NotRegistered', 'InvalidRegistration'}:
                    invalid = True
    if invalid or code >= 400:
        NotificationDevice.objects.filter(user=request.user, token=token).update(active=False)
    return Response({'status_code': code, 'response': data, 'deactivated': bool(invalid or code >= 400)})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_preferences(request):
    """Return push notification preferences stored in ClientProfile.preferences."""
    user = request.user
    profile = getattr(user, 'client_profile', None)
    prefs = {
        'push_enabled': True,
        'alerts_enabled': True,
        'marketing_enabled': False,
        'quiet_hours': {
            'start': None,
            'end': None,
            'timezone': None,
        }
    }
    if profile and isinstance(profile.preferences, dict):
        prefs.update(profile.preferences or {})
    return Response(prefs)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_notification_preferences(request):
    """Update push notification preferences with basic validation."""
    allowed_keys = {'push_enabled', 'alerts_enabled', 'marketing_enabled', 'quiet_hours'}
    data = request.data if isinstance(request.data, dict) else {}
    update = {k: data[k] for k in data.keys() if k in allowed_keys}
    if 'quiet_hours' in update and not isinstance(update['quiet_hours'], dict):
        return Response({'quiet_hours': 'must be an object'}, status=status.HTTP_400_BAD_REQUEST)
    user = request.user
    profile = getattr(user, 'client_profile', None)
    if not profile:
        from users.models import ClientProfile
        profile = ClientProfile.objects.create(user=user, preferences={})
    new_prefs = dict(profile.preferences or {})
    new_prefs.update(update)
    profile.preferences = new_prefs
    profile.save(update_fields=['preferences'])
    return Response(new_prefs)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_device(request):
    """Deactivate a specific device token without deleting it."""
    token = request.data.get('token')
    if not token:
        return Response({'error': 'token is required'}, status=status.HTTP_400_BAD_REQUEST)
    updated = NotificationDevice.objects.filter(user=request.user, token=token).update(active=False)
    if not updated:
        return Response({'error': 'Device not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'Device deactivated'})
