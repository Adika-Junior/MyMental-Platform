"""
Redis caching configuration for performance optimization
"""
from django.core.cache import cache
from django.core.cache.backends.redis import RedisCache
from django.conf import settings
import json
import hashlib


class CacheManager:
    """
    High-level caching utilities with automatic key generation and expiration
    """
    
    DEFAULT_TIMEOUT = 300  # 5 minutes
    
    @staticmethod
    def get_cache_key(prefix, *args, **kwargs):
        """Generate consistent cache key from arguments"""
        key_parts = [prefix] + [str(arg) for arg in args]
        if kwargs:
            sorted_kwargs = sorted(kwargs.items())
            key_parts.extend([f"{k}:{v}" for k, v in sorted_kwargs])
        key_string = ':'.join(key_parts)
        # Create hash for long keys
        if len(key_string) > 200:
            key_hash = hashlib.md5(key_string.encode()).hexdigest()
            return f"{prefix}:{key_hash}"
        return key_string
    
    @staticmethod
    def get_or_set(key, default, timeout=DEFAULT_TIMEOUT):
        """Get from cache or set default value"""
        return cache.get_or_set(key, default, timeout)
    
    @staticmethod
    def get_many(keys):
        """Get multiple cache entries at once"""
        return cache.get_many(keys)
    
    @staticmethod
    def set_many(data_dict, timeout=DEFAULT_TIMEOUT):
        """Set multiple cache entries at once"""
        return cache.set_many(data_dict, timeout)
    
    @staticmethod
    def delete_pattern(pattern):
        """Delete all keys matching pattern (Redis only)"""
        # Note: This requires Redis and proper backend
        # In production, use django-redis with delete_pattern support
        try:
            from django_redis import get_redis_connection
            redis_client = get_redis_connection("default")
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)
            return len(keys)
        except ImportError:
            # Fallback: manual key management
            return 0


# Cache decorators for view optimization
def cache_response(timeout=300, key_prefix='view'):
    """
    Decorator to cache view responses
    """
    def decorator(func):
        def wrapper(request, *args, **kwargs):
            # Generate cache key from request
            cache_key = CacheManager.get_cache_key(
                key_prefix,
                func.__name__,
                request.path,
                request.user.id if request.user.is_authenticated else 'anon',
                request.GET.urlencode(),
            )
            
            # Try to get from cache
            cached_response = cache.get(cache_key)
            if cached_response:
                return cached_response
            
            # Execute view
            response = func(request, *args, **kwargs)
            
            # Cache successful responses only
            if response.status_code == 200:
                cache.set(cache_key, response, timeout)
            
            return response
        return wrapper
    return decorator


def cache_queryset(timeout=300):
    """
    Decorator to cache queryset results
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = CacheManager.get_cache_key(
                'queryset',
                func.__name__,
                *args,
                **kwargs,
            )
            
            # Try cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Cache result (convert queryset to list for JSON serialization)
            if hasattr(result, '__iter__') and not isinstance(result, str):
                cache.set(cache_key, list(result), timeout)
            else:
                cache.set(cache_key, result, timeout)
            
            return result
        return wrapper
    return decorator

