"""
Database routing for dual database setup:
- PostgreSQL (default) - Structured data, users, counselors
- MongoDB - Chat messages, real-time interactions
"""

class DatabaseRouter:
    """
    Router to determine which database to use for read/write operations.
    
    PostreSQL (default) - Used for:
    - User authentication
    - Counselor profiles
    - Conversation metadata
    
    MongoDB - Used for:
    - Chat messages
    - Real-time chat data
    - Analytics and logs
    """
    
    app_labels_for_postgres = {'users', 'counselor'}
    # Route specific chatbot models to MongoDB
    mongo_models = {
        ('chatbot', 'message'),
        ('chatbot', 'emotionalcheckin'),
    }
    
    def db_for_read(self, model, **hints):
        """Choose database for read operations"""
        # Check hints for database preference
        if 'database' in hints:
            return hints['database']
            
        # Send selected models to MongoDB
        if (model._meta.app_label, model._meta.model_name) in self.mongo_models:
            return 'mongodb'
        # Else default (PostgreSQL)
        return 'default'
    
    def db_for_write(self, model, **hints):
        """Choose database for write operations"""
        # Check hints for database preference
        if 'database' in hints:
            return hints['database']
            
        if (model._meta.app_label, model._meta.model_name) in self.mongo_models:
            return 'mongodb'
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """Allow relations if both models are in the same database"""
        return True
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Control which apps get migrated to which database
        """
        if db == 'default':
            # Users and counselor stay in Postgres, plus chatbot models not explicitly routed to Mongo
            return True
        if db == 'mongodb':
            # Migrate only routed chatbot models on MongoDB
            return (app_label, (model_name or '')) in self.mongo_models
        return None

