"""
Password reset utilities using JWT tokens
"""
import secrets
import hashlib
from datetime import timedelta
from django.utils import timezone
from django.core.cache import cache
from django.contrib.auth import get_user_model

User = get_user_model()

# Cache key prefix for reset tokens
RESET_TOKEN_PREFIX = 'password_reset_token:'
RESET_TOKEN_EXPIRY = timedelta(hours=1)  # 1 hour expiry

def generate_reset_token():
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)

def create_reset_token(user):
    """
    Create and store a password reset token for a user
    Returns the token string
    """
    token = generate_reset_token()
    cache_key = f"{RESET_TOKEN_PREFIX}{token}"
    
    # Store token with user ID, expires in 1 hour
    cache.set(cache_key, user.id, timeout=int(RESET_TOKEN_EXPIRY.total_seconds()))
    
    return token

def verify_reset_token(token):
    """
    Verify a password reset token
    Returns User object if valid, None otherwise
    """
    if not token:
        return None
    
    cache_key = f"{RESET_TOKEN_PREFIX}{token}"
    user_id = cache.get(cache_key)
    
    if user_id:
        try:
            user = User.objects.get(pk=user_id)
            # Token is valid, delete it after verification
            cache.delete(cache_key)
            return user
        except User.DoesNotExist:
            return None
    
    return None

def invalidate_reset_token(token):
    """Manually invalidate a reset token"""
    cache_key = f"{RESET_TOKEN_PREFIX}{token}"
    cache.delete(cache_key)

