#!/bin/bash
set -e

# SSL Certificate Setup Script using Let's Encrypt
# This script sets up SSL certificates for production deployment

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "🔒 Setting up SSL certificates..."

# Check prerequisites
command -v certbot >/dev/null 2>&1 || { 
    echo "❌ certbot is required but not installed."
    echo "   Install with: sudo apt-get install certbot (Ubuntu/Debian)"
    echo "   Or: brew install certbot (macOS)"
    exit 1
}

# Load environment variables
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found. Please create it first."
    exit 1
fi

source .env.production

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "❌ DOMAIN and EMAIL must be set in .env.production"
    exit 1
fi

echo "📋 Domain: $DOMAIN"
echo "📧 Email: $EMAIL"

# Create nginx/ssl directory
mkdir -p nginx/ssl

# Generate self-signed certificate for development (can be replaced with Let's Encrypt)
echo "🔐 Generating self-signed certificate for $DOMAIN..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=MyMental/CN=$DOMAIN"

echo ""
echo "✅ Self-signed certificate generated in nginx/ssl/"
echo ""
echo "⚠️  For production, replace with Let's Encrypt certificate:"
echo "   1. Ensure nginx is running and accessible on port 80"
echo "   2. Run: sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN"
echo "   3. Copy certificates to nginx/ssl/:"
echo "      sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/cert.pem"
echo "      sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/key.pem"
echo "   4. Set up auto-renewal: sudo certbot renew --dry-run"

