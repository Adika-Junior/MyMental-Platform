import httpx
from typing import Optional

from django.conf import settings
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


def _authguard_is_enabled() -> bool:
    return bool(getattr(settings, "AUTHGUARD_INTEGRATION_ENABLED", False))


def _authguard_base_url() -> str:
    return str(getattr(settings, "AUTHGUARD_BASE_URL", "")).rstrip("/")


def _authguard_client() -> httpx.Client:
    verify = not bool(getattr(settings, "AUTHGUARD_TLS_INSECURE_SKIP_VERIFY", False))
    timeout_seconds = int(getattr(settings, "AUTHGUARD_CLIENT_TIMEOUT_SECONDS", 10))
    return httpx.Client(verify=verify, timeout=timeout_seconds)


def _authguard_json_response(res: httpx.Response) -> dict:
    try:
        data = res.json()
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return {}


def _authguard_post_json(path: str, payload: dict, headers: Optional[dict] = None) -> tuple[int, dict]:
    """
    POST JSON to AuthGuard. Returns (status_code, json_body).
    """
    if not _authguard_base_url():
        return 500, {"error": "AUTHGUARD_BASE_URL not configured"}

    url = f"{_authguard_base_url()}{path}"
    with _authguard_client() as client:
        res = client.post(url, json=payload, headers=headers)
        return res.status_code, _authguard_json_response(res)


def _authguard_get_json(path: str, headers: Optional[dict] = None) -> tuple[int, dict]:
    if not _authguard_base_url():
        return 500, {"error": "AUTHGUARD_BASE_URL not configured"}

    url = f"{_authguard_base_url()}{path}"
    with _authguard_client() as client:
        res = client.get(url, headers=headers)
        return res.status_code, _authguard_json_response(res)


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

        if _authguard_is_enabled():
            # AuthGuard is the source of truth for credentials; we don't store password in Django.
            authguard_email = (email or "").strip().lower()
            authguard_payload = {
                "email": authguard_email,
                "password": password,
                "display_name": username,
            }
            ag_status, ag_json = _authguard_post_json("/v1/auth/signup", authguard_payload)
            if ag_status not in (200, 201):
                return Response(
                    {"detail": "AuthGuard signup failed"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            ag_user_id = ag_json.get("id")
            if not ag_user_id:
                # Duplicate/edge cases: attempt to fetch canonical ID via login+me.
                login_status, login_json = _authguard_post_json("/v1/auth/login", {"email": authguard_email, "password": password})
                if login_status == 200 and login_json.get("access_token"):
                    me_status, me_json = _authguard_get_json(
                        "/v1/auth/me",
                        headers={"Authorization": f"Bearer {login_json['access_token']}"},
                    )
                    if me_status == 200:
                        ag_user_id = me_json.get("id")

            user = User(
                username=username,
                email=authguard_email,
                user_type=user_type,
                phone_number=phone_number,
                is_verified=bool(ag_json.get("is_email_verified", False)),
                authguard_user_id=ag_user_id,
            )
            user.set_unusable_password()
            user.save()

        else:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                user_type=user_type,
                phone_number=phone_number,
            )

        # Log user registration
        log_user_action('registered', user)

        return Response(
            {'id': user.id, 'username': user.username, 'email': user.email, 'user_type': user.user_type},
            status=status.HTTP_201_CREATED,
        )


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
        if _authguard_is_enabled():
            username = request.data.get("username")
            password = request.data.get("password")
            if not username or not password:
                return Response({"detail": "Missing credentials"}, status=status.HTTP_400_BAD_REQUEST)

            # Accept either email or username; AuthGuard requires email.
            if isinstance(username, str) and "@" in username:
                ag_email = username.strip().lower()
                django_user = User.objects.filter(email=ag_email).first()
            else:
                django_user = User.objects.filter(username=username).first()
                if not django_user or not django_user.email:
                    return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
                ag_email = django_user.email.strip().lower()

            ag_status, ag_json = _authguard_post_json(
                "/v1/auth/login",
                {"email": ag_email, "password": password},
            )

            # AuthGuard returns a token pair on success.
            if ag_status == 200 and ag_json.get("access_token"):
                access_token = ag_json["access_token"]
                refresh_token = ag_json.get("refresh_token")
                response = Response({"access": access_token}, status=status.HTTP_200_OK)

                if refresh_token:
                    response.set_cookie(
                        key="refresh_token",
                        value=refresh_token,
                        httponly=True,
                        secure=bool(getattr(settings, "AUTHGUARD_COOKIE_SECURE", False)),
                        samesite="Lax",
                        max_age=7 * 24 * 60 * 60,
                        path="/",
                    )

                # Ensure Django <-> AuthGuard identity mapping exists.
                try:
                    if django_user and not django_user.authguard_user_id:
                        me_status, me_json = _authguard_get_json(
                            "/v1/auth/me",
                            headers={"Authorization": f"Bearer {access_token}"},
                        )
                        if me_status == 200 and me_json.get("id"):
                            django_user.authguard_user_id = me_json["id"]
                            django_user.save(update_fields=["authguard_user_id"])

                    if django_user:
                        log_user_action("logged_in", django_user)
                except Exception:
                    pass

                return response

            # Handle non-token outcomes (e.g., MFA required).
            if ag_status == 200 and ag_json.get("mfa_required"):
                return Response(ag_json, status=status.HTTP_200_OK)

            # Normalize auth errors.
            if ag_status in (401, 403, 429):
                return Response({"detail": ag_json.get("error", "Authentication failed")}, status=ag_status)

            return Response({"detail": "Login failed"}, status=status.HTTP_400_BAD_REQUEST)

        # Local (SimpleJWT) mode fallback.
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
                    secure=bool(getattr(settings, "SESSION_COOKIE_SECURE", False)),  # set True in production
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
        if _authguard_is_enabled():
            refresh_token = request.data.get("refresh") or request.COOKIES.get("refresh_token")
            if not refresh_token:
                return Response({"detail": "Missing refresh token"}, status=status.HTTP_400_BAD_REQUEST)

            ag_status, ag_json = _authguard_post_json(
                "/v1/auth/refresh",
                {"refresh_token": refresh_token},
            )

            if ag_status == 200 and ag_json.get("access_token"):
                access_token = ag_json["access_token"]
                new_refresh_token = ag_json.get("refresh_token")
                response = Response({"access": access_token}, status=status.HTTP_200_OK)

                if new_refresh_token:
                    response.set_cookie(
                        key="refresh_token",
                        value=new_refresh_token,
                        httponly=True,
                        secure=bool(getattr(settings, "AUTHGUARD_COOKIE_SECURE", False)),
                        samesite="Lax",
                        max_age=7 * 24 * 60 * 60,
                        path="/",
                    )

                return response

            if ag_status in (401, 403, 429):
                return Response({"detail": ag_json.get("error", "Refresh failed")}, status=ag_status)

            return Response({"detail": "Refresh failed"}, status=status.HTTP_400_BAD_REQUEST)

        # Local (SimpleJWT) mode fallback.
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

        if _authguard_is_enabled():
            # New password strength validation using Django validators (keeps UI feedback consistent).
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return Response({'new_password': e.messages}, status=status.HTTP_400_BAD_REQUEST)

            auth_header = request.META.get("HTTP_AUTHORIZATION", "")
            access_token = auth_header.split(" ", 1)[1] if auth_header.lower().startswith("bearer ") else ""
            if not access_token:
                return Response({"detail": "Missing bearer token"}, status=status.HTTP_401_UNAUTHORIZED)

            ag_status, _ = _authguard_post_json(
                "/v1/auth/change-password",
                {"current_password": old_password, "new_password": new_password},
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if ag_status == 200:
                log_user_action('password_changed', user)
                return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
            if ag_status in (401, 403, 429):
                return Response({"detail": "Password change failed"}, status=ag_status)
            return Response({"detail": "Password change failed"}, status=status.HTTP_400_BAD_REQUEST)

        # Local (SimpleJWT) mode fallback.
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

        if _authguard_is_enabled():
            ag_status, ag_json = _authguard_post_json("/v1/auth/forgot-password", {"email": email})
            if ag_status == 200:
                return Response({"message": ag_json.get("message", "Reset requested")}, status=status.HTTP_200_OK)
            return Response({"detail": "Password reset request failed"}, status=ag_status)
        
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

        if _authguard_is_enabled():
            ag_status, ag_json = _authguard_post_json(
                "/v1/auth/reset-password",
                {"token": token, "new_password": new_password},
            )
            if ag_status == 200:
                return Response({"message": ag_json.get("message", "Password reset successfully")}, status=status.HTTP_200_OK)
            if ag_status in (400, 401, 403, 429):
                return Response({"token": ["Invalid or expired reset token."]}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"detail": "Password reset failed"}, status=ag_status)
        
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
