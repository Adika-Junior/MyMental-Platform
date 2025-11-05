"""
Middleware for auditing API requests and responses
"""
import time
import logging
from django.utils.deprecation import MiddlewareMixin
from ..audit_log import log_api_access

logger = logging.getLogger('audit')


class AuditMiddleware(MiddlewareMixin):
    """
    Middleware to log API requests for auditing purposes
    """
    
    def process_request(self, request):
        """Record request start time"""
        request._audit_start_time = time.time()
        return None
    
    def process_response(self, request, response):
        """Log API access after response"""
        # Skip logging for static files, admin, etc.
        if request.path.startswith(('/static/', '/media/', '/admin/', '/favicon.ico')):
            return response
        
        # Calculate duration
        duration_ms = None
        if hasattr(request, '_audit_start_time'):
            duration_ms = int((time.time() - request._audit_start_time) * 1000)
        
        # Get user if authenticated
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            user = user
        else:
            user = None
        
        # Log API access
        log_api_access(
            endpoint=request.path,
            method=request.method,
            user=user,
            status_code=response.status_code,
            duration_ms=duration_ms
        )
        
        return response

