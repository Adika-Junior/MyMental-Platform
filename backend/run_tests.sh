#!/bin/bash
# Test runner script for MyMental Platform backend

set -e

echo "=========================================="
echo "Running MyMental Platform Backend Tests"
echo "=========================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "manage.py" ]; then
    echo "Error: Please run this script from the backend directory"
    exit 1
fi

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

echo ""
echo "=========================================="
echo "Running Authentication Tests"
echo "=========================================="
python manage.py test users.tests_auth --verbosity=2

echo ""
echo "=========================================="
echo "Running Chatbot API Tests"
echo "=========================================="
python manage.py test chatbot.tests_api --verbosity=2

echo ""
echo "=========================================="
echo "Running GraphQL Tests"
echo "=========================================="
python manage.py test graphql_app.tests --verbosity=2

echo ""
echo "=========================================="
echo "All Tests Completed!"
echo "=========================================="
