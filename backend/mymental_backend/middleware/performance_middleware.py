"""
Performance monitoring middleware
Tracks request performance and database queries
"""
import time
from django.utils.deprecation import MiddlewareMixin
from django.db import connection
from mymental_backend.performance_monitoring import PerformanceMetrics
from mymental_backend.audit_log import log_event


class PerformanceMiddleware(MiddlewareMixin):
    """
    Middleware to monitor request performance
    Logs slow requests and high database query counts
    """
    
    def process_request(self, request):
        request._performance_start_time = time.time()
        request._performance_initial_queries = len(connection.queries)
        return None
    
    def process_response(self, request, response):
        if hasattr(request, '_performance_start_time'):
            duration_ms = (time.time() - request._performance_start_time) * 1000
            query_count = len(connection.queries) - getattr(request, '_performance_initial_queries', 0)
            
            # Record metrics
            PerformanceMetrics.record_api_request(
                request.path,
                request.method,
                duration_ms,
                response.status_code
            )
            
            # Log slow requests
            if duration_ms > 1000:  # 1 second threshold
                log_event(
                    event_type='slow_request',
                    description=f'Slow request detected: {request.method} {request.path}',
                    user=getattr(request, 'user', None),
                    metadata={
                        'path': request.path,
                        'method': request.method,
                        'duration_ms': duration_ms,
                        'query_count': query_count,
                        'status_code': response.status_code,
                    },
                    severity='warning'
                )
            
            # Add performance headers for monitoring
            response['X-Response-Time'] = f"{duration_ms:.2f}ms"
            response['X-Query-Count'] = str(query_count)
        
        return response

