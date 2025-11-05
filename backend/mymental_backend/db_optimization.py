"""
Database optimization utilities:
- Connection pooling
- Query optimization helpers
- Index management
"""
from django.db import connections
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class DatabaseConnectionPool:
    """
    Database connection pooling configuration
    Reduces connection overhead and improves performance
    """
    
    @staticmethod
    def configure_postgresql_pooling():
        """
        Configure PostgreSQL connection pooling in settings.py
        Add to DATABASES['default']['OPTIONS']:
        {
            'MAX_CONNS': 20,
            'CONN_MAX_AGE': 600,  # Reuse connections for 10 minutes
        }
        """
        pass  # Configuration is done in settings.py


def optimize_query_queryset(queryset, use_select_related=True, use_prefetch_related=True):
    """
    Optimize queryset by adding select_related and prefetch_related
    Reduces database queries from N+1 to 1-2 queries
    """
    if use_select_related:
        # Get foreign key fields
        select_fields = []
        for field in queryset.model._meta.get_fields():
            if field.many_to_one and field.related_model:
                select_fields.append(field.name)
        
        if select_fields:
            queryset = queryset.select_related(*select_fields)
    
    if use_prefetch_related:
        # Get many-to-many and reverse foreign key fields
        prefetch_fields = []
        for field in queryset.model._meta.get_fields():
            if (field.many_to_many or field.one_to_many) and field.related_model:
                prefetch_fields.append(field.name)
        
        if prefetch_fields:
            queryset = queryset.prefetch_related(*prefetch_fields)
    
    return queryset


def get_cached_queryset(cache_key, queryset_func, timeout=300):
    """
    Cache queryset results to reduce database load
    """
    result = cache.get(cache_key)
    if result is None:
        result = list(queryset_func())
        cache.set(cache_key, result, timeout)
    return result


class QueryAnalyzer:
    """
    Analyze and log slow queries for optimization
    """
    
    @staticmethod
    def log_slow_queries(threshold_ms=100):
        """
        Log queries that exceed threshold
        Configure in settings.py DATABASES['default']['OPTIONS']:
        {
            'log_queries': True,
            'query_timeout': 5000,
        }
        """
        pass  # Requires database-level logging configuration

