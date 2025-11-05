#!/bin/bash
set -e

# Production deployment script for MyMental Platform
# Usage: ./scripts/deploy.sh [environment]

ENVIRONMENT=${1:-production}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Starting deployment for environment: $ENVIRONMENT"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Load environment variables
if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production not found. Creating from template..."
    cp .env.production.example .env.production
    echo "⚠️  Please edit .env.production with your production values before continuing."
    exit 1
fi

# Source environment variables
set -a
source .env.production
set +a

# Validate required environment variables
REQUIRED_VARS=("SECRET_KEY" "DB_PASSWORD" "ALLOWED_HOSTS" "CSRF_TRUSTED_ORIGINS")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set. Aborting."
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build and start services
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🗄️  Starting database services..."
docker-compose -f docker-compose.prod.yml up -d postgres mongo redis

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput

# Create superuser if needed (optional)
# docker-compose -f docker-compose.prod.yml run --rm backend python manage.py createsuperuser

# Start all services
echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Health check
echo "🏥 Performing health checks..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health/ || echo "000")
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed (HTTP $BACKEND_HEALTH)"
    docker-compose -f docker-compose.prod.yml logs backend | tail -20
    exit 1
fi

if [ "$FRONTEND_HEALTH" = "200" ]; then
    echo "✅ Frontend is healthy"
else
    echo "⚠️  Frontend health check returned HTTP $FRONTEND_HEALTH (may be normal if behind nginx)"
fi

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Service status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "📝 View logs with: docker-compose -f docker-compose.prod.yml logs -f [service]"
echo "🛑 Stop services with: docker-compose -f docker-compose.prod.yml down"

