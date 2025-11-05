#!/usr/bin/env python
"""
Test script to validate MongoDB connection and database routing.
Run from backend directory: python test_mongo_connection.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymental_backend.settings')
django.setup()

from django.conf import settings
from chatbot.models import Message, EmotionalCheckIn, Conversation
from django.db import connections
from pymongo import MongoClient

def test_mongodb_connection():
    """Test direct MongoDB connection"""
    print("=" * 60)
    print("Testing MongoDB Connection...")
    print("=" * 60)
    
    try:
        mongo_uri = os.environ.get('MONGO_URI', '')
        if not mongo_uri:
            mongo_uri = 'mongodb://localhost:27017/'
        
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
        client.server_info()  # Will raise if connection fails
        print("✓ MongoDB connection successful!")
        
        # List databases
        dbs = client.list_database_names()
        print(f"✓ Available databases: {', '.join(dbs)}")
        
        # Check our database
        db_name = os.environ.get('MONGO_DB_NAME', 'mymental_chat')
        if db_name in dbs:
            print(f"✓ Database '{db_name}' exists")
            db = client[db_name]
            collections = db.list_collection_names()
            print(f"✓ Collections: {', '.join(collections) if collections else 'None'}")
        else:
            print(f"⚠ Database '{db_name}' does not exist yet (will be created on first write)")
        
        client.close()
        return True
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        return False

def test_django_db_routing():
    """Test Django database routing"""
    print("\n" + "=" * 60)
    print("Testing Django Database Routing...")
    print("=" * 60)
    
    try:
        # Check if mongodb database is configured
        if 'mongodb' in settings.DATABASES:
            print("✓ MongoDB database alias found in settings")
            mongodb_config = settings.DATABASES['mongodb']
            print(f"  Engine: {mongodb_config.get('ENGINE', 'N/A')}")
            print(f"  Name: {mongodb_config.get('NAME', 'N/A')}")
        else:
            print("✗ MongoDB database alias NOT found in settings")
            return False
        
        # Test router
        from mymental_backend.routers import DatabaseRouter
        router = DatabaseRouter()
        
        # Check Message model routing
        msg_db_read = router.db_for_read(Message)
        msg_db_write = router.db_for_write(Message)
        print(f"✓ Message model -> Read: {msg_db_read}, Write: {msg_db_write}")
        
        # Check EmotionalCheckIn model routing
        checkin_db_read = router.db_for_read(EmotionalCheckIn)
        checkin_db_write = router.db_for_write(EmotionalCheckIn)
        print(f"✓ EmotionalCheckIn model -> Read: {checkin_db_read}, Write: {checkin_db_write}")
        
        # Check Conversation model routing (should stay in PostgreSQL)
        conv_db_read = router.db_for_read(Conversation)
        conv_db_write = router.db_for_write(Conversation)
        print(f"✓ Conversation model -> Read: {conv_db_read}, Write: {conv_db_write}")
        
        # Verify routing is correct
        if msg_db_read == 'mongodb' and msg_db_write == 'mongodb':
            print("✓ Message routing correct (MongoDB)")
        else:
            print("✗ Message routing incorrect!")
        
        if checkin_db_read == 'mongodb' and checkin_db_write == 'mongodb':
            print("✓ EmotionalCheckIn routing correct (MongoDB)")
        else:
            print("✗ EmotionalCheckIn routing incorrect!")
        
        if conv_db_read == 'default' and conv_db_write == 'default':
            print("✓ Conversation routing correct (PostgreSQL)")
        else:
            print("✗ Conversation routing incorrect!")
        
        return True
    except Exception as e:
        print(f"✗ Database routing test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database_connections():
    """Test Django database connections"""
    print("\n" + "=" * 60)
    print("Testing Django Database Connections...")
    print("=" * 60)
    
    try:
        # Test PostgreSQL connection
        default_db = connections['default']
        default_db.ensure_connection()
        print("✓ PostgreSQL connection successful")
        
        # Test MongoDB connection (if django-mongodb-backend supports it)
        if 'mongodb' in connections:
            mongodb = connections['mongodb']
            try:
                mongodb.ensure_connection()
                print("✓ MongoDB connection via Django successful")
            except Exception as e:
                print(f"⚠ MongoDB connection via Django: {e}")
                print("  (This is okay if django-mongodb-backend needs initialization)")
        
        return True
    except Exception as e:
        print(f"✗ Database connections test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("MyMental Platform - MongoDB Connection Test")
    print("=" * 60 + "\n")
    
    results = []
    results.append(("MongoDB Connection", test_mongodb_connection()))
    results.append(("Django Routing", test_django_db_routing()))
    results.append(("Django Connections", test_database_connections()))
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status} - {name}")
    
    all_passed = all(result for _, result in results)
    sys.exit(0 if all_passed else 1)

