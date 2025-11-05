#!/bin/bash
# Test runner script with coverage reporting for MyMental Platform backend

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

# Check if coverage is installed
if ! command -v coverage &> /dev/null; then
    echo "Installing coverage..."
    pip install coverage==7.5.3
fi

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

echo ""
echo "=========================================="
echo "Running Tests with Coverage"
echo "=========================================="

# Run tests with coverage
coverage run --source='.' manage.py test

echo ""
echo "=========================================="
echo "Generating Coverage Report"
echo "=========================================="

# Generate terminal report
coverage report

echo ""
echo "=========================================="
echo "Generating HTML Coverage Report"
echo "=========================================="

# Generate HTML report
coverage html

echo ""
echo "=========================================="
echo "Coverage Report Generated!"
echo "=========================================="
echo "HTML report available at: htmlcov/index.html"
echo "XML report available at: coverage.xml"
echo ""

# Optionally open HTML report
if command -v xdg-open &> /dev/null; then
    echo "Opening HTML coverage report..."
    xdg-open htmlcov/index.html
elif command -v open &> /dev/null; then
    echo "Opening HTML coverage report..."
    open htmlcov/index.html
fi

