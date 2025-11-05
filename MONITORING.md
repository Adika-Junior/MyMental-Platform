# Monitoring and Alerting Guide

This document describes the monitoring and alerting setup for MyMental Platform.

## Monitoring Endpoints

### Health Check
```
GET /health/
```
Returns comprehensive health status including:
- Database connectivity
- Redis/Cache status
- MongoDB status (if configured)
- Overall system health

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "checks": {
    "database": "ok",
    "cache": "ok",
    "mongodb": "ok"
  }
}
```

### Metrics
```
GET /metrics/
```
Returns application metrics (requires staff authentication):
- Request counts per endpoint
- Error counts by status code
- Response times (avg, min, max)
- Database query counts
- Cache statistics

### Uptime
```
GET /uptime/
```
Returns system resource information:
- CPU usage
- Memory usage
- Disk usage
- Process information
- System uptime

## Monitoring Dashboard

A simple HTML dashboard is provided for viewing metrics:

```bash
# Open in browser
open scripts/monitoring-dashboard.html

# Or serve via HTTP
python3 -m http.server 8080
# Then open http://localhost:8080/scripts/monitoring-dashboard.html
```

The dashboard auto-refreshes every 30 seconds and displays:
- Health status
- Request metrics
- Response times
- Error counts
- System resources

## Alerting

### Automated Alerting Script

The alerting script checks health endpoints and sends alerts when thresholds are exceeded.

**Setup:**
```bash
# Configure environment variables
export API_BASE_URL=http://localhost:8000
export ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
export ALERT_EMAIL=admin@example.com

# Run manually
python3 scripts/alerting.py

# Set up cron job (runs every 5 minutes)
*/5 * * * * cd /path/to/MyMental-Platform && python3 scripts/alerting.py
```

**Alert Thresholds:**
- Error rate > 10%
- Response time > 2000ms
- CPU usage > 90%
- Memory usage > 90%
- Disk usage > 90%
- Health status != "healthy"

### Sentry Integration

Sentry is already configured for error tracking. Ensure `SENTRY_DSN` is set in your environment:

```bash
export SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

Sentry will automatically track:
- Unhandled exceptions
- API errors
- Performance issues
- User feedback

## Prometheus Integration (Optional)

For production deployments, you can integrate with Prometheus:

```python
# Install prometheus-client
pip install prometheus-client

# Add to settings.py
INSTALLED_APPS = [
    ...
    'django_prometheus',
]

# Add middleware
MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    ...
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]

# Add metrics endpoint
urlpatterns = [
    ...
    path('metrics/', include('django_prometheus.urls')),
]
```

## Grafana Dashboards (Optional)

For advanced monitoring, set up Grafana:

1. Install Grafana
2. Configure Prometheus as data source
3. Import dashboard templates
4. Set up alerts in Grafana

## Best Practices

1. **Monitor Critical Endpoints**
   - `/health/` - System health
   - `/api/chatbot/send/` - Chat functionality
   - `/api/users/login/` - Authentication

2. **Set Up Alerts For**
   - Health check failures
   - High error rates (>5%)
   - Slow response times (>1s)
   - Resource exhaustion (CPU/Memory >90%)

3. **Regular Reviews**
   - Review metrics weekly
   - Adjust thresholds based on actual usage
   - Document incidents and resolutions

4. **Logging**
   - Structured JSON logs with request IDs
   - Centralized log aggregation (ELK, Loki, etc.)
   - Retention policies for compliance

## Troubleshooting

### Metrics Not Showing
- Ensure Redis is running (required for metrics storage)
- Check authentication (metrics endpoint requires staff user)
- Verify cache is working: `python manage.py shell` then `from django.core.cache import cache; cache.set('test', 'ok')`

### Alerts Not Sending
- Verify webhook URL is correct
- Check network connectivity
- Review alert script logs

### High Response Times
- Check database query performance
- Review cache hit rates
- Monitor system resources
- Consider scaling horizontally

