from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

from .serializers import (
    RegisterSerializer, 
    UserSerializer, 
    UserUpdateSerializer, 
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .password_reset import create_reset_token, verify_reset_token
from mymental_backend.audit_log import log_user_action
from mymental_backend.cache_utils import (
    get_or_set,
    build_cache_key,
    get_user_namespace_version,
    bump_user_namespace,
)
from mymental_backend.rate_limiting import LoginRateThrottle, PasswordResetRateThrottle

User = get_user_model()


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        email = serializer.validated_data.get('email')
        password = serializer.validated_data['password']
        user_type = serializer.validated_data.get('user_type', 'client')
        phone_number = serializer.validated_data.get('phone_number', '')

        try:
            validate_password(password)
        except ValidationError as e:
            return Response({'password': e.messages}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'username': ['A user with that username already exists.']}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type=user_type,
            phone_number=phone_number,
        )

        # Log user registration
        log_user_action('registered', user)

        return Response({'id': user.id, 'username': user.username, 'email': user.email, 'user_type': user.user_type}, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        v = get_user_namespace_version('me', request.user.id)
        key = build_cache_key('me', request.user.id, version=v)
        data = get_or_set(key, lambda: {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'user_type': getattr(request.user, 'user_type', 'client')
        }, ttl=120)
        return Response(data)


class CookieTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        return super().get_token(user)


class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = CookieTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle, UserRateThrottle, AnonRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        try:
            data = response.data
            refresh = data.get('refresh')
            if refresh:
                # Move refresh to httpOnly cookie and remove from body
                response.set_cookie(
                    key='refresh_token',
                    value=refresh,
                    httponly=True,
                    secure=False,  # set True in production
                    samesite='Lax',
                    max_age=7 * 24 * 60 * 60,
                    path='/'
                )
                del response.data['refresh']
            
            # Log successful login
            if response.status_code == 200:
                from rest_framework_simplejwt.tokens import UntypedToken
                from rest_framework_simplejwt.exceptions import InvalidToken
                try:
                    access = data.get('access')
                    if access:
                        decoded_token = UntypedToken(access)
                        user_id = decoded_token.get('user_id')
                        user = User.objects.get(pk=user_id)
                        log_user_action('logged_in', user)
                except (InvalidToken, User.DoesNotExist):
                    pass
        except Exception:
            pass
        return response


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Read refresh token from cookie if not in body
        if not request.data.get('refresh'):
            cookie_refresh = request.COOKIES.get('refresh_token')
            if cookie_refresh:
                request.data['refresh'] = cookie_refresh
        return super().post(request, *args, **kwargs)


class ProfileView(APIView):
    """Get and update user profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_user_action('profile_updated', user, metadata={'updated_fields': list(serializer.validated_data.keys())})
            bump_user_namespace('me', user.id)
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """Change password for authenticated user"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = PasswordChangeSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        # Verify old password
        if not user.check_password(old_password):
            return Response({'old_password': ['Current password is incorrect.']}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password strength
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'new_password': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        log_user_action('password_changed', user)
        
        return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Request password reset (sends reset token)"""
    authentication_classes = []
    permission_classes = []
    throttle_classes = [PasswordResetRateThrottle, AnonRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            # Generate reset token
            token = create_reset_token(user)
            
            # In production, send email with reset link
            # For now, return token in response (remove in production!)
            # TODO: Send email with reset link containing token
            log_user_action('password_reset_requested', user, metadata={'email': email})
            
            # In development, return token. In production, only return success message
            return Response({
                'message': 'If an account exists with this email, a reset link has been sent.',
                # Remove this in production:
                'reset_token': token if __debug__ else None
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Don't reveal if email exists or not (security best practice)
            return Response({
                'message': 'If an account exists with this email, a reset link has been sent.'
            }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token"""
    authentication_classes = []
    permission_classes = []
    throttle_classes = [PasswordResetRateThrottle, AnonRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        # Verify token
        user = verify_reset_token(token)
        if not user:
            return Response({'token': ['Invalid or expired reset token.']}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password strength
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'new_password': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        log_user_action('password_reset_completed', user)
        
        return Response({'message': 'Password reset successfully.'}, status=status.HTTP_200_OK)
