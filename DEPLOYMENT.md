# Production Deployment Guide

This guide covers deploying the MyMental Platform to production using Docker and nginx.

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured with DNS pointing to your server
- Server with at least 2GB RAM and 20GB disk space
- Ports 80, 443, and optionally 8000, 3000 open (or use nginx reverse proxy)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MyMental-Platform
   ```

2. **Configure environment variables**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your production values
   ```

3. **Set up SSL certificates**
   ```bash
   ./scripts/ssl-setup.sh
   ```

4. **Deploy**
   ```bash
   ./scripts/deploy.sh
   ```

## Manual Deployment Steps

### 1. Environment Configuration

Create `.env.production` with all required variables:

```bash
cp .env.production.example .env.production
nano .env.production
```

**Required variables:**
- `SECRET_KEY`: Generate a strong secret key (at least 50 characters)
- `DB_PASSWORD`: Strong PostgreSQL password
- `ALLOWED_HOSTS`: Your domain(s), comma-separated
- `CSRF_TRUSTED_ORIGINS`: HTTPS URLs of your domain(s)
- `DOMAIN`: Your domain name
- `EMAIL`: Email for Let's Encrypt certificates

**Generate SECRET_KEY:**
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2. SSL Certificate Setup

#### Option A: Self-Signed (Development/Testing)
```bash
./scripts/ssl-setup.sh
```

#### Option B: Let's Encrypt (Production)
1. Ensure nginx is accessible on port 80
2. Install certbot:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```
3. Obtain certificate:
   ```bash
   sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
   ```
4. Copy certificates:
   ```bash
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
   ```
5. Set up auto-renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

### 3. Build and Deploy

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput
```

### 4. Create Superuser

```bash
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py createsuperuser
```

## Service Management

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart [service-name]
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Update and Redeploy
```bash
git pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py migrate
```

## Health Checks

- Backend: `http://yourdomain.com/health/`
- Frontend: `http://yourdomain.com/`
- API: `http://yourdomain.com/api/chatbot/list/`

## Database Backups

Automated backups are configured via the `scripts/db_backup.sh` script. Set up a cron job:

```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * /path/to/MyMental-Platform/scripts/db_backup.sh
```

## Monitoring

- Check service status: `docker-compose -f docker-compose.prod.yml ps`
- Monitor resource usage: `docker stats`
- View nginx access logs: `docker-compose -f docker-compose.prod.yml logs nginx`

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Verify environment variables
docker-compose -f docker-compose.prod.yml config
```

### Database connection issues
- Verify database is running: `docker-compose -f docker-compose.prod.yml ps postgres`
- Check connection string in `.env.production`
- Ensure database container is healthy

### SSL certificate errors
- Verify certificates exist: `ls -la nginx/ssl/`
- Check certificate expiration: `openssl x509 -in nginx/ssl/cert.pem -noout -dates`
- Renew Let's Encrypt: `sudo certbot renew`

### Static files not loading
- Run collectstatic: `docker-compose -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput`
- Check nginx static file configuration
- Verify volume mounts in docker-compose.prod.yml

## Security Checklist

- [ ] Strong SECRET_KEY set
- [ ] DEBUG=False in production
- [ ] ALLOWED_HOSTS configured correctly
- [ ] CSRF_TRUSTED_ORIGINS includes all HTTPS domains
- [ ] SSL certificates valid and auto-renewing
- [ ] Database passwords are strong
- [ ] Redis password set (if using authentication)
- [ ] Sentry DSN configured for error tracking
- [ ] Regular database backups scheduled
- [ ] Firewall rules configured (only 80, 443 open)
- [ ] Non-root users in Docker containers
- [ ] Security headers enabled in nginx

## Scaling

### Horizontal Scaling
- Add more backend workers: Set `GUNICORN_WORKERS` in `.env.production`
- Add more Celery workers: Scale `celery_worker` service
- Use load balancer in front of nginx for multiple instances

### Vertical Scaling
- Increase container resources in docker-compose.prod.yml
- Optimize database (connection pooling, indexes)
- Enable Redis caching for frequently accessed data

## Production Best Practices

1. **Environment Variables**: Never commit `.env.production` to version control
2. **Secrets Management**: Use a secrets manager (AWS Secrets Manager, HashiCorp Vault) for sensitive data
3. **Monitoring**: Set up Sentry, application logs aggregation, and uptime monitoring
4. **Backups**: Automated daily backups with tested restore procedures
5. **Updates**: Schedule regular security updates and dependency updates
6. **Logging**: Centralized logging with log rotation
7. **Rate Limiting**: Configured in nginx and Django middleware
8. **CDN**: Consider using a CDN for static assets

## Support

For issues or questions, refer to:
- Main README.md for setup instructions
- FEATURES.md for feature documentation
- Backend logs: `docker-compose -f docker-compose.prod.yml logs backend`
- Frontend logs: `docker-compose -f docker-compose.prod.yml logs frontend`

