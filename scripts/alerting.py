#!/usr/bin/env python3
"""
Alerting script for MyMental Platform
Checks health endpoints and sends alerts if thresholds are exceeded
Run as cron job: */5 * * * * python3 scripts/alerting.py
"""
import requests
import json
import os
import sys
from datetime import datetime

# Configuration
API_BASE = os.getenv('API_BASE_URL', 'http://localhost:8000')
ALERT_WEBHOOK = os.getenv('ALERT_WEBHOOK_URL', '')  # Slack, Discord, etc.
ALERT_EMAIL = os.getenv('ALERT_EMAIL', '')

# Thresholds
MAX_ERROR_RATE = 0.1  # 10% error rate
MAX_RESPONSE_TIME_MS = 2000  # 2 seconds
MIN_HEALTH_SCORE = 0.8  # 80% health


def send_alert(message, severity='warning'):
    """Send alert via webhook or email"""
    timestamp = datetime.now().isoformat()
    alert = {
        'timestamp': timestamp,
        'severity': severity,
        'message': message,
        'service': 'mymental-platform'
    }
    
    print(f"[{severity.upper()}] {message}")
    
    # Send to webhook (Slack, Discord, etc.)
    if ALERT_WEBHOOK:
        try:
            requests.post(ALERT_WEBHOOK, json={
                'text': f"[{severity.upper()}] MyMental Platform Alert",
                'attachments': [{
                    'color': 'danger' if severity == 'critical' else 'warning',
                    'fields': [
                        {'title': 'Message', 'value': message, 'short': False},
                        {'title': 'Timestamp', 'value': timestamp, 'short': True}
                    ]
                }]
            }, timeout=5)
        except Exception as e:
            print(f"Failed to send webhook alert: {e}")
    
    # Send email (if configured)
    if ALERT_EMAIL:
        try:
            import smtplib
            from email.mime.text import MIMEText
            
            msg = MIMEText(f"{message}\n\nTimestamp: {timestamp}")
            msg['Subject'] = f"[{severity.upper()}] MyMental Platform Alert"
            msg['From'] = 'alerts@mymental.com'
            msg['To'] = ALERT_EMAIL
            
            # Configure SMTP server
            # smtp = smtplib.SMTP('smtp.example.com', 587)
            # smtp.send_message(msg)
            print(f"Email alert would be sent to {ALERT_EMAIL}")
        except Exception as e:
            print(f"Failed to send email alert: {e}")


def check_health():
    """Check health endpoint"""
    try:
        response = requests.get(f"{API_BASE}/health/", timeout=5)
        if response.status_code != 200:
            send_alert(f"Health check returned status {response.status_code}", 'critical')
            return False
        
        data = response.json()
        if data.get('status') != 'healthy':
            send_alert(f"System status: {data.get('status')}", 'warning')
            
            # Check individual components
            for check, status in data.get('checks', {}).items():
                if status != 'ok':
                    send_alert(f"Component {check} is unhealthy: {status}", 'critical')
        
        return True
    except requests.exceptions.RequestException as e:
        send_alert(f"Health check failed: {str(e)}", 'critical')
        return False


def check_metrics():
    """Check metrics for threshold violations"""
    try:
        response = requests.get(f"{API_BASE}/metrics/", timeout=5)
        if response.status_code != 200:
            return
        
        metrics = response.json()
        
        # Check error rate
        total_errors = sum(metrics.get('errors', {}).values())
        total_requests = sum(metrics.get('requests', {}).values())
        
        if total_requests > 0:
            error_rate = total_errors / total_requests
            if error_rate > MAX_ERROR_RATE:
                send_alert(
                    f"High error rate: {error_rate*100:.1f}% ({total_errors}/{total_requests} errors)",
                    'critical'
                )
        
        # Check response times
        for endpoint, times in metrics.get('response_times', {}).items():
            avg_ms = times.get('avg_ms', 0)
            if avg_ms > MAX_RESPONSE_TIME_MS:
                send_alert(
                    f"Slow response time for {endpoint}: {avg_ms}ms (threshold: {MAX_RESPONSE_TIME_MS}ms)",
                    'warning'
                )
    
    except requests.exceptions.RequestException as e:
        print(f"Failed to check metrics: {e}")


def check_uptime():
    """Check system uptime and resources"""
    try:
        response = requests.get(f"{API_BASE}/uptime/", timeout=5)
        if response.status_code != 200:
            return
        
        uptime = response.json()
        system = uptime.get('system', {})
        
        # Check CPU usage
        cpu_percent = system.get('cpu_percent', 0)
        if cpu_percent > 90:
            send_alert(f"High CPU usage: {cpu_percent}%", 'warning')
        
        # Check memory usage
        memory_percent = system.get('memory_percent', 0)
        if memory_percent > 90:
            send_alert(f"High memory usage: {memory_percent}%", 'warning')
        
        # Check disk usage
        disk_percent = system.get('disk_percent', 0)
        if disk_percent > 90:
            send_alert(f"High disk usage: {disk_percent}%", 'warning')
    
    except requests.exceptions.RequestException as e:
        print(f"Failed to check uptime: {e}")


def main():
    """Run all health checks"""
    print(f"Running health checks at {datetime.now().isoformat()}")
    
    if not check_health():
        sys.exit(1)
    
    check_metrics()
    check_uptime()
    
    print("Health checks completed successfully")


if __name__ == '__main__':
    main()

