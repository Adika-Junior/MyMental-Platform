"""
URL configuration for users app
"""
from django.urls import path
from . import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', csrf_exempt(views.CookieTokenObtainPairView.as_view()), name='token_obtain_pair'),
    path('refresh/', csrf_exempt(views.CookieTokenRefreshView.as_view()), name='token_refresh'),
    path('me/', views.MeView.as_view(), name='me'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('password/change/', views.PasswordChangeView.as_view(), name='password_change'),
    path('password/reset/request/', csrf_exempt(views.PasswordResetRequestView.as_view()), name='password_reset_request'),
    path('password/reset/confirm/', csrf_exempt(views.PasswordResetConfirmView.as_view()), name='password_reset_confirm'),
]

