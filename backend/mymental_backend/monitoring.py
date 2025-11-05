"""
Monitoring and metrics collection for MyMental Platform
"""
import time
import logging
from functools import wraps
from django.core.cache import cache
from django.db import connection
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class MetricsCollector:
    """Collects application metrics"""
    
    def __init__(self):
        self.request_count_key = 'metrics:request_count'
        self.error_count_key = 'metrics:error_count'
        self.response_time_key = 'metrics:response_times'
    
    def increment_request_count(self, endpoint=None):
        """Increment request counter"""
        cache_key = f"{self.request_count_key}:{endpoint or 'all'}"
        cache.incr(cache_key, ignore_missing=True) or cache.set(cache_key, 1, timeout=86400)
    
    def increment_error_count(self, status_code=None):
        """Increment error counter"""
        cache_key = f"{self.error_count_key}:{status_code or 'all'}"
        cache.incr(cache_key, ignore_missing=True) or cache.set(cache_key, 1, timeout=86400)
    
    def record_response_time(self, endpoint, duration_ms):
        """Record response time"""
        cache_key = f"{self.response_time_key}:{endpoint}"
        times = cache.get(cache_key, [])
        times.append(duration_ms)
        # Keep last 100 response times
        if len(times) > 100:
            times = times[-100:]
        cache.set(cache_key, times, timeout=3600)
    
    def get_metrics(self):
        """Get all metrics"""
        metrics = {
            'requests': {},
            'errors': {},
            'response_times': {},
            'database': {},
            'cache': {},
        }
        
        # Get request counts for common endpoints
        endpoints = ['/api/chatbot/send/', '/api/chatbot/list/', '/api/users/login/', '/health/']
        for endpoint in endpoints:
            count = cache.get(f"{self.request_count_key}:{endpoint}", 0)
            if count > 0:
                metrics['requests'][endpoint] = count
        
        # Get error counts
        for status in [500, 502, 503, 504]:
            count = cache.get(f"{self.error_count_key}:{status}", 0)
            if count > 0:
                metrics['errors'][f'status_{status}'] = count
        
        # Get average response times
        for endpoint in endpoints:
            times = cache.get(f"{self.response_time_key}:{endpoint}", [])
            if times:
                avg_time = sum(times) / len(times)
                metrics['response_times'][endpoint] = {
                    'avg_ms': round(avg_time, 2),
                    'min_ms': round(min(times), 2),
                    'max_ms': round(max(times), 2),
                    'count': len(times)
                }
        
        # Database metrics
        db_queries = len(connection.queries)
        metrics['database']['queries_in_request'] = db_queries
        metrics['database']['connections'] = len(connection.queries)
        
        # Cache metrics
        try:
            cache_info = cache.get('metrics:cache_info', {})
            metrics['cache'] = cache_info
        except:
            pass
        
        return metrics


metrics_collector = MetricsCollector()


def track_metrics(view_func):
    """Decorator to track request metrics"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        start_time = time.time()
        endpoint = request.path
        
        try:
            response = view_func(request, *args, **kwargs)
            duration_ms = (time.time() - start_time) * 1000
            
            # Track metrics
            metrics_collector.increment_request_count(endpoint)
            metrics_collector.record_response_time(endpoint, duration_ms)
            
            # Track errors
            if response.status_code >= 400:
                metrics_collector.increment_error_count(response.status_code)
            
            # Add response time header
            response['X-Response-Time'] = f"{duration_ms:.2f}ms"
            
            return response
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            metrics_collector.increment_error_count(500)
            logger.error(f"Error in {endpoint}: {str(e)}", exc_info=True)
            raise
    
    return wrapper


def health_check(request):
    """Comprehensive health check endpoint"""
    health_status = {
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'checks': {}
    }
    
    # Database check
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        User.objects.count()
        health_status['checks']['database'] = 'ok'
    except Exception as e:
        health_status['checks']['database'] = f'error: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Redis/Cache check
    try:
        cache.set('health_check', 'ok', timeout=10)
        cache.get('health_check')
        health_status['checks']['cache'] = 'ok'
    except Exception as e:
        health_status['checks']['cache'] = f'error: {str(e)}'
        health_status['status'] = 'degraded'
    
    # MongoDB check (if used)
    try:
        from pymongo import MongoClient
        from django.conf import settings
        if hasattr(settings, 'MONGO_URI') and settings.MONGO_URI:
            client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            health_status['checks']['mongodb'] = 'ok'
    except Exception as e:
        health_status['checks']['mongodb'] = f'error: {str(e)}'
        if health_status['status'] == 'healthy':
            health_status['status'] = 'degraded'
    
    status_code = 200 if health_status['status'] == 'healthy' else 503
    return JsonResponse(health_status, status=status_code)


def metrics_endpoint(request):
    """Metrics endpoint for monitoring"""
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    metrics = metrics_collector.get_metrics()
    return JsonResponse(metrics)


def uptime_endpoint(request):
    """Uptime and system information"""
    import psutil
    import os
    
    uptime_info = {
        'uptime_seconds': time.time() - psutil.boot_time(),
        'system': {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
        },
        'process': {
            'pid': os.getpid(),
            'cpu_percent': psutil.Process().cpu_percent(),
            'memory_mb': psutil.Process().memory_info().rss / 1024 / 1024,
        },
        'timestamp': timezone.now().isoformat()
    }
    
    return JsonResponse(uptime_info)

