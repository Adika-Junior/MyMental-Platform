"""
MongoDB client configuration and utilities for MyMental Platform.

This module provides MongoDB connection management using PyMongo
for handling chat messages and real-time data storage.
"""

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Global MongoDB client instance
_mongo_client = None
_mongo_db = None

def get_mongo_client():
    """
    Get or create MongoDB client instance with connection pooling.
    
    Returns:
        MongoClient: MongoDB client instance
        
    Raises:
        ConnectionFailure: If unable to connect to MongoDB server
    """
    global _mongo_client
    
    if _mongo_client is None:
        try:
            mongo_settings = settings.MONGO_SETTINGS
            
            # Build connection string
            if mongo_settings.get('username') and mongo_settings.get('password'):
                connection_string = f"mongodb://{mongo_settings['username']}:{mongo_settings['password']}@{mongo_settings['host']}:{mongo_settings['port']}"
            else:
                connection_string = f"mongodb://{mongo_settings['host']}:{mongo_settings['port']}"
            
            _mongo_client = MongoClient(
                connection_string,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000,
                maxPoolSize=50,
                minPoolSize=10
            )
            
            # Test connection
            _mongo_client.admin.command('ping')
            logger.info(f"Successfully connected to MongoDB at {mongo_settings['host']}:{mongo_settings['port']}")
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            _mongo_client = None
            raise
    
    return _mongo_client

def get_mongo_db():
    """
    Get MongoDB database instance.
    
    Returns:
        Database: MongoDB database instance
    """
    global _mongo_db
    
    if _mongo_db is None:
        client = get_mongo_client()
        mongo_settings = settings.MONGO_SETTINGS
        _mongo_db = client[mongo_settings['database']]
    
    return _mongo_db

def close_mongo_connection():
    """
    Close MongoDB connection. Useful for cleanup during testing.
    """
    global _mongo_client, _mongo_db
    
    if _mongo_client:
        _mongo_client.close()
        _mongo_client = None
        _mongo_db = None
        logger.info("MongoDB connection closed")

# Collection names
CHAT_MESSAGES_COLLECTION = 'chat_messages'
CONVERSATIONS_COLLECTION = 'conversations'
ANALYTICS_COLLECTION = 'analytics'

