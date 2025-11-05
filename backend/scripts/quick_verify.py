#!/usr/bin/env python
"""
Quick verification script that doesn't require all dependencies
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import django
import os

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymental_backend.settings')

try:
    django.setup()
    from django.conf import settings
    
    print("=" * 60)
    print("Settings Verification")
    print("=" * 60)
    print()
    
    # Check CACHES
    if hasattr(settings, 'CACHES'):
        print("✅ CACHES configuration: Present")
        if 'default' in settings.CACHES:
            print(f"   Backend: {settings.CACHES['default'].get('BACKEND', 'Not set')}")
            print(f"   Location: {settings.CACHES['default'].get('LOCATION', 'Not set')}")
    else:
        print("❌ CACHES configuration: Missing")
    
    print()
    
    # Check Security Middleware
    middleware_str = str(settings.MIDDLEWARE)
    checks = [
        ('SecurityHeadersMiddleware', 'Security Headers'),
        ('PerformanceMiddleware', 'Performance Monitoring'),
        ('AuditMiddleware', 'Audit Logging'),
    ]
    
    print("Middleware Configuration:")
    for check, name in checks:
        if check in middleware_str:
            print(f"   ✅ {name}: Present")
        else:
            print(f"   ❌ {name}: Missing")
    
    print()
    
    # Check REST Framework throttling
    if hasattr(settings, 'REST_FRAMEWORK'):
        rf = settings.REST_FRAMEWORK
        if 'IPRateThrottle' in str(rf.get('DEFAULT_THROTTLE_CLASSES', [])):
            print("✅ Rate limiting: Configured")
        else:
            print("⚠️  Rate limiting: Not configured in REST_FRAMEWORK")
    else:
        print("❌ REST_FRAMEWORK: Not configured")
    
    print()
    
    # Check database indexes (via models)
    try:
        from chatbot.models import Conversation, CrisisAlert, CrisisKeyword
        
        models_to_check = [
            ('Conversation', Conversation),
            ('CrisisAlert', CrisisAlert),
            ('CrisisKeyword', CrisisKeyword),
        ]
        
        print("Database Indexes:")
        for model_name, model in models_to_check:
            if hasattr(model._meta, 'indexes') and model._meta.indexes:
                count = len(model._meta.indexes)
                print(f"   ✅ {model_name}: {count} index(es) defined")
            else:
                print(f"   ⚠️  {model_name}: No indexes found")
    except Exception as e:
        print(f"⚠️  Could not check models: {e}")
    
    print()
    print("=" * 60)
    print("✅ Basic configuration verification complete!")
    print("=" * 60)
    print()
    print("Note: Full verification requires all dependencies installed.")
    print("Run 'python manage.py check' for complete Django validation.")
    
except Exception as e:
    print(f"❌ Error loading settings: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

