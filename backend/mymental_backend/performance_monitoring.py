"""
Performance monitoring and metrics collection
"""
import time
import logging
from functools import wraps
from django.core.cache import cache
from django.db import connection
from mymental_backend.audit_log import log_event

logger = logging.getLogger(__name__)


def monitor_performance(threshold_ms=1000):
    """
    Decorator to monitor function execution time
    Logs slow operations for optimization
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                execution_time = (time.time() - start_time) * 1000  # Convert to ms
                
                if execution_time > threshold_ms:
                    logger.warning(
                        f"Slow operation detected: {func.__name__} took {execution_time:.2f}ms "
                        f"(threshold: {threshold_ms}ms)"
                    )
                    
                    # Log to audit system
                    try:
                        log_event(
                            event_type='performance_warning',
                            description=f'{func.__name__} exceeded performance threshold',
                            metadata={
                                'function': func.__name__,
                                'execution_time_ms': execution_time,
                                'threshold_ms': threshold_ms,
                            },
                            severity='warning'
                        )
                    except Exception:
                        pass
                
                return result
            except Exception as e:
                execution_time = (time.time() - start_time) * 1000
                logger.error(
                    f"Error in {func.__name__} after {execution_time:.2f}ms: {str(e)}"
                )
                raise
        return wrapper
    return decorator


def monitor_db_queries(func):
    """
    Decorator to monitor database query count and execution time
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        initial_queries = len(connection.queries)
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            
            final_queries = len(connection.queries)
            query_count = final_queries - initial_queries
            execution_time = (time.time() - start_time) * 1000
            
            # Warn if too many queries (N+1 problem indicator)
            if query_count > 10:
                logger.warning(
                    f"High query count in {func.__name__}: {query_count} queries "
                    f"in {execution_time:.2f}ms"
                )
            
            # Warn if slow
            if execution_time > 500:
                logger.warning(
                    f"Slow database operation in {func.__name__}: "
                    f"{query_count} queries in {execution_time:.2f}ms"
                )
            
            return result
        except Exception as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            raise
    return wrapper


class PerformanceMetrics:
    """
    Collect and store performance metrics
    """
    
    @staticmethod
    def record_api_request(path, method, duration_ms, status_code):
        """Record API request metrics"""
        metrics_key = f'metrics:api:{path}:{method}'
        metrics = cache.get(metrics_key, {
            'count': 0,
            'total_duration': 0,
            'avg_duration': 0,
            'max_duration': 0,
            'min_duration': float('inf'),
            'error_count': 0,
        })
        
        metrics['count'] += 1
        metrics['total_duration'] += duration_ms
        metrics['avg_duration'] = metrics['total_duration'] / metrics['count']
        metrics['max_duration'] = max(metrics['max_duration'], duration_ms)
        metrics['min_duration'] = min(metrics['min_duration'], duration_ms)
        
        if status_code >= 400:
            metrics['error_count'] += 1
        
        # Store for 1 hour
        cache.set(metrics_key, metrics, 3600)
        
        return metrics
    
    @staticmethod
    def get_metrics(path=None, method=None):
        """Get performance metrics"""
        if path and method:
            key = f'metrics:api:{path}:{method}'
            return cache.get(key, {})
        # Return all metrics (requires pattern matching)
        return {}

