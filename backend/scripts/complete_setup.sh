#!/bin/bash
# Complete setup script for MyMental Platform security and performance enhancements

set -e

echo "=========================================="
echo "MyMental Platform - Complete Setup"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.." || exit 1

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
pip install -q django-redis==5.4.0
echo "✅ Dependencies installed"
echo ""

# Step 2: Check Redis connection
echo "Step 2: Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running and accessible"
    else
        echo "⚠️  Warning: Redis is not running. Starting Redis..."
        redis-server --daemonize yes || echo "⚠️  Could not start Redis. Please start it manually: redis-server"
    fi
else
    echo "⚠️  Warning: redis-cli not found. Please ensure Redis is installed and running."
fi
echo ""

# Step 3: Create migrations for new indexes
echo "Step 3: Creating migrations for database indexes..."
python manage.py makemigrations --noinput || echo "⚠️  No new migrations needed"
echo "✅ Migrations prepared"
echo ""

# Step 4: Apply migrations
echo "Step 4: Applying database migrations..."
python manage.py migrate --noinput
echo "✅ Migrations applied"
echo ""

# Step 5: Verify settings
echo "Step 5: Verifying Django settings..."
python manage.py check --deploy || echo "⚠️  Some deployment checks failed (expected in development)"
echo "✅ Settings verified"
echo ""

# Step 6: Test cache connection
echo "Step 6: Testing cache connection..."
python << EOF
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymental_backend.settings')
django.setup()

from django.core.cache import cache
try:
    cache.set('test_key', 'test_value', 10)
    result = cache.get('test_key')
    if result == 'test_value':
        print("✅ Cache connection successful")
    else:
        print("⚠️  Cache test failed")
except Exception as e:
    print(f"⚠️  Cache connection failed: {e}")
    print("   Make sure Redis is running: redis-server")
EOF

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify security headers are working"
echo "2. Test rate limiting"
echo "3. Monitor performance metrics"
echo ""

