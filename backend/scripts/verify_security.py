#!/usr/bin/env python
"""
Security and Performance Verification Script
Tests OWASP security headers, rate limiting, caching, and performance features
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymental_backend.settings')
django.setup()

from django.test import RequestFactory
from django.http import HttpResponse
from mymental_backend.security_headers import SecurityHeadersMiddleware
from mymental_backend.rate_limiting import IPRateThrottle
from django.core.cache import cache

print("=" * 60)
print("Security and Performance Verification")
print("=" * 60)
print()

# Test 1: Security Headers
print("1. Testing Security Headers...")
try:
    factory = RequestFactory()
    request = factory.get('/')
    
    middleware = SecurityHeadersMiddleware(lambda req: HttpResponse())
    response = middleware(request)
    
    headers_to_check = {
        'Content-Security-Policy': 'CSP',
        'X-Frame-Options': 'Clickjacking Protection',
        'X-Content-Type-Options': 'MIME Sniffing Protection',
        'X-XSS-Protection': 'XSS Protection',
        'Referrer-Policy': 'Referrer Policy',
        'Permissions-Policy': 'Permissions Policy',
    }
    
    all_present = True
    for header, name in headers_to_check.items():
        if header in response:
            print(f"   ✅ {name}: Present")
        else:
            print(f"   ❌ {name}: Missing")
            all_present = False
    
    if all_present:
        print("   ✅ All security headers configured correctly")
    else:
        print("   ⚠️  Some security headers are missing")
except Exception as e:
    print(f"   ❌ Error testing security headers: {e}")

print()

# Test 2: Cache Connection
print("2. Testing Cache Connection...")
try:
    test_key = 'security_test_key'
    test_value = 'test_value_123'
    
    cache.set(test_key, test_value, 10)
    retrieved = cache.get(test_key)
    
    if retrieved == test_value:
        print("   ✅ Cache is working correctly")
        cache.delete(test_key)
    else:
        print(f"   ⚠️  Cache retrieval mismatch: expected '{test_value}', got '{retrieved}'")
except Exception as e:
    print(f"   ❌ Cache connection failed: {e}")
    print("   💡 Make sure Redis is running: redis-server")

print()

# Test 3: Rate Limiting
print("3. Testing Rate Limiting...")
try:
    throttle = IPRateThrottle()
    factory = RequestFactory()
    request = factory.get('/')
    request.META['REMOTE_ADDR'] = '127.0.0.1'
    
    # Should allow first request
    allowed = throttle.allow_request(request, None)
    if allowed:
        print("   ✅ Rate limiting class initialized correctly")
    else:
        print("   ⚠️  Rate limiting blocking too aggressively")
except Exception as e:
    print(f"   ❌ Error testing rate limiting: {e}")

print()

# Test 4: Database Indexes
print("4. Checking Database Indexes...")
try:
    from chatbot.models import Conversation, CrisisAlert, CrisisKeyword
    
    # Check if models have Meta.indexes
    models_to_check = [
        ('Conversation', Conversation),
        ('CrisisAlert', CrisisAlert),
        ('CrisisKeyword', CrisisKeyword),
    ]
    
    for model_name, model in models_to_check:
        if hasattr(model._meta, 'indexes') and model._meta.indexes:
            print(f"   ✅ {model_name}: Has indexes defined")
        else:
            print(f"   ⚠️  {model_name}: No indexes found")
except Exception as e:
    print(f"   ❌ Error checking indexes: {e}")

print()

# Test 5: Settings Configuration
print("5. Checking Settings Configuration...")
try:
    from django.conf import settings
    
    checks = [
        ('CACHES configured', hasattr(settings, 'CACHES')),
        ('Security middleware', 'mymental_backend.security_headers.SecurityHeadersMiddleware' in settings.MIDDLEWARE),
        ('Performance middleware', 'mymental_backend.middleware.performance_middleware.PerformanceMiddleware' in settings.MIDDLEWARE),
        ('Rate limiting in DRF', 'mymental_backend.rate_limiting.IPRateThrottle' in str(settings.REST_FRAMEWORK.get('DEFAULT_THROTTLE_CLASSES', []))),
    ]
    
    all_configured = True
    for check_name, check_result in checks:
        if check_result:
            print(f"   ✅ {check_name}")
        else:
            print(f"   ⚠️  {check_name}: Not configured")
            all_configured = False
    
    if all_configured:
        print("   ✅ All settings configured correctly")
except Exception as e:
    print(f"   ❌ Error checking settings: {e}")

print()
print("=" * 60)
print("Verification Complete")
print("=" * 60)

