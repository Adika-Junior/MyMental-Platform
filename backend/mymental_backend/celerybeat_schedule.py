"""
Periodic task schedule for Celery Beat
Add this to settings.py: CELERY_BEAT_SCHEDULE
"""
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    # Generate summaries for escalated conversations without summaries (every hour)
    'auto-generate-summaries': {
        'task': 'chatbot.tasks.auto_generate_summaries_for_escalated',
        'schedule': crontab(minute=0),  # Run at the top of every hour
    },
    # Notify counselors of critical alerts (every 15 minutes)
    'notify-critical-alerts': {
        'task': 'chatbot.tasks.notify_counselors_of_critical_alerts',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
    # Cleanup old resolved alerts (daily at 2 AM)
    'cleanup-old-alerts': {
        'task': 'chatbot.tasks.cleanup_old_alerts',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
    # Daily check-in reminders (09:00 UTC)
    'daily-checkin-reminders': {
        'task': 'chatbot.tasks.send_daily_checkin_reminders',
        'schedule': crontab(hour=9, minute=0),
    },
}

