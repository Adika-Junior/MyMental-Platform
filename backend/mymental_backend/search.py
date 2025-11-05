"""
Search and retrieval optimization utilities
"""
from django.db.models import Q
from django.core.cache import cache
from mymental_backend.caching import CacheManager
import logging

logger = logging.getLogger(__name__)


class SearchOptimizer:
    """
    Optimize database searches with caching and query optimization
    """
    
    @staticmethod
    def search_messages(query, session_id=None, user_id=None, limit=50):
        """
        Search messages with full-text search optimization
        Uses indexes on session_id, user_id, and content
        """
        from chatbot.models import Message
        
        # Build query with filters
        q_objects = Q(content__icontains=query)
        
        if session_id:
            q_objects &= Q(session_id=session_id)
        
        if user_id:
            q_objects &= Q(user_id=user_id)
        
        # Use select_related/prefetch_related if needed
        # For MongoDB models, we use direct queries
        messages = Message.objects.filter(q_objects).order_by('-created_at')[:limit]
        
        return messages
    
    @staticmethod
    def search_conversations(query, user_id=None, limit=50):
        """
        Search conversations with optimized queries
        """
        from chatbot.models import Conversation
        
        # Cache user's conversations list
        cache_key = CacheManager.get_cache_key('user_conversations', user_id)
        conversations = cache.get(cache_key)
        
        if conversations is None:
            q_objects = Q()
            
            if user_id:
                q_objects &= Q(user_id=user_id)
            
            if query:
                # Search in summary or session_id
                q_objects &= (Q(summary__icontains=query) | Q(session_id__icontains=query))
            
            conversations = Conversation.objects.filter(q_objects).select_related('user').order_by('-updated_at')[:limit]
            cache.set(cache_key, list(conversations.values()), 300)
        
        return conversations
    
    @staticmethod
    def get_conversation_history(session_id, use_cache=True):
        """
        Get conversation history with caching
        """
        from chatbot.models import Message
        
        cache_key = CacheManager.get_cache_key('conversation_history', session_id)
        
        if use_cache:
            cached = cache.get(cache_key)
            if cached is not None:
                return cached
        
        # Fetch from database
        messages = Message.objects.filter(session_id=session_id).order_by('created_at')
        message_list = list(messages.values('message_type', 'content', 'created_at'))
        
        # Cache for 5 minutes
        if use_cache:
            cache.set(cache_key, message_list, 300)
        
        return message_list


class FullTextSearch:
    """
    Full-text search capabilities using PostgreSQL and MongoDB
    """
    
    @staticmethod
    def setup_fulltext_indexes():
        """
        Setup full-text search indexes
        Run via migration or management command
        """
        # PostgreSQL full-text search
        # CREATE INDEX CONCURRENTLY idx_conversation_summary_fts 
        # ON chatbot_conversation USING gin(to_tsvector('english', summary));
        
        # MongoDB text index
        # db.messages.createIndex({ "content": "text" })
        pass
    
    @staticmethod
    def search_fulltext_pg(query, model_name, field_name):
        """
        Full-text search in PostgreSQL
        """
        from django.contrib.postgres.search import SearchVector, SearchQuery
        
        model = __import__(f'chatbot.models', fromlist=[model_name]).__dict__[model_name]
        
        vector = SearchVector(field_name, config='english')
        search_query = SearchQuery(query, config='english')
        
        results = model.objects.annotate(
            search=vector
        ).filter(search=search_query)
        
        return results


def invalidate_search_cache(session_id=None, user_id=None):
    """
    Invalidate search-related cache entries
    """
    patterns = []
    
    if session_id:
        patterns.append(f'conversation_history:{session_id}*')
    
    if user_id:
        patterns.append(f'user_conversations:{user_id}*')
    
    for pattern in patterns:
        CacheManager.delete_pattern(pattern)

