"""
Advanced rate limiting with IP-based and user-based throttling
OWASP A07:2021 - Identification and Authentication Failures
"""
from django.core.cache import cache
from django.core.exceptions import PermissionDenied
from rest_framework.throttling import BaseThrottle
import time


class IPRateThrottle(BaseThrottle):
    """
    Rate limiting based on IP address to prevent DDoS and brute force attacks
    """
    def __init__(self, rate='100/hour', burst=10):
        self.rate = rate
        self.burst = burst
        self.num_requests, self.duration = self.parse_rate(rate)

    def parse_rate(self, rate):
        """Parse rate string like '100/hour' into (requests, duration)"""
        if '/' not in rate:
            return (100, 3600)  # Default: 100/hour
        
        num, period = rate.split('/')
        num_requests = int(num)
        
        duration_map = {
            'second': 1,
            'minute': 60,
            'hour': 3600,
            'day': 86400,
        }
        duration = duration_map.get(period.strip().lower(), 3600)
        
        return (num_requests, duration)

    def get_cache_key(self, request, view):
        """Generate cache key based on IP address"""
        ip = self.get_ident(request)
        return f'throttle_ip_{ip}'

    def allow_request(self, request, view):
        """Check if request should be allowed"""
        if request.user.is_authenticated and request.user.is_superuser:
            return True  # Bypass for superusers

        key = self.get_cache_key(request, view)
        now = time.time()
        
        # Get current request count and window start
        history = cache.get(key, [])
        
        # Remove old entries outside the time window
        history = [timestamp for timestamp in history if timestamp > now - self.duration]
        
        # Check burst limit
        if len(history) >= self.burst:
            # Check if requests are too fast (burst protection)
            recent = [t for t in history if t > now - 1]  # Last second
            if len(recent) >= self.burst:
                return False  # Too many requests in short time
        
        # Check rate limit
        if len(history) >= self.num_requests:
            return False
        
        # Add current request
        history.append(now)
        cache.set(key, history, self.duration)
        
        return True

    def wait(self):
        """Return seconds to wait before next request"""
        return self.duration


class LoginRateThrottle(IPRateThrottle):
    """
    Stricter rate limiting for login endpoints to prevent brute force
    """
    def __init__(self):
        super().__init__(rate='5/hour', burst=3)


class PasswordResetRateThrottle(IPRateThrottle):
    """
    Rate limiting for password reset to prevent abuse
    """
    def __init__(self):
        super().__init__(rate='3/hour', burst=2)


class ReportRateThrottle(IPRateThrottle):
    """
    Throttle for abuse/report submissions to prevent spam
    """
    def __init__(self):
        super().__init__(rate='5/hour', burst=3)

class ReportRateThrottle(IPRateThrottle):
    """
    Throttle for user-generated reports to prevent abuse
    """
    def __init__(self):
        super().__init__(rate='10/hour', burst=5)

