"""
Background tasks for the chatbot app using Celery
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Conversation, CrisisAlert, Message, NotificationDevice
from django.conf import settings
import requests
from .services import MentalHealthChatbot
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def generate_conversation_summary(self, session_id):
    """
    Generate a summary for an escalated conversation
    
    Args:
        session_id: Session ID of the conversation
        
    Returns:
        str: Generated summary or None if failed
    """
    try:
        conversation = Conversation.objects.get(session_id=session_id)
        
        # Skip if summary already exists (unless explicitly regenerating)
        if conversation.summary:
            logger.info(f"Summary already exists for conversation {session_id}")
            return conversation.summary
        
        # Get all messages for the conversation
        messages = Message.objects.filter(session_id=session_id).order_by('created_at')
        
        if not messages.exists():
            logger.warning(f"No messages found for conversation {session_id}")
            return None
        
        messages_list = [
            {
                'message_type': msg.message_type,
                'content': msg.content,
                'created_at': msg.created_at.isoformat()
            }
            for msg in messages
        ]
        
        # Generate summary using chatbot service
        chatbot = MentalHealthChatbot()
        summary = chatbot.summarize_conversation(messages_list)
        
        # Save summary to conversation
        conversation.summary = summary
        conversation.save()
        
        logger.info(f"Successfully generated summary for conversation {session_id}")
        
        # Log summary generation in audit log
        try:
            from mymental_backend.audit_log import log_event
            log_event(
                event_type='summary_generated',
                description=f'Summary auto-generated for conversation {session_id}',
                user=conversation.user,
                metadata={
                    'session_id': session_id,
                    'conversation_id': conversation.id,
                    'auto_generated': True
                }
            )
        except Exception as e:
            logger.warning(f"Failed to log summary generation: {str(e)}")
        
        return summary
        
    except Conversation.DoesNotExist:
        logger.error(f"Conversation {session_id} not found")
        return None
    except Exception as exc:
        logger.error(f"Error generating summary for {session_id}: {str(exc)}")
        # Retry the task
        raise self.retry(exc=exc, countdown=60)  # Retry after 60 seconds


@shared_task
def auto_generate_summaries_for_escalated():
    """
    Periodically generate summaries for escalated conversations that don't have one yet
    Run this task periodically (e.g., every hour)
    """
    try:
        # Find escalated conversations without summaries
        escalated_conversations = Conversation.objects.filter(
            is_escalated=True,
            summary__isnull=True
        )
        
        logger.info(f"Found {escalated_conversations.count()} escalated conversations without summaries")
        
        for conversation in escalated_conversations:
            # Check if conversation has messages
            message_count = Message.objects.filter(session_id=conversation.session_id).count()
            
            if message_count > 0:
                # Generate summary asynchronously
                generate_conversation_summary.delay(conversation.session_id)
                logger.info(f"Queued summary generation for conversation {conversation.session_id}")
        
        return f"Queued {escalated_conversations.count()} summary generations"
    except Exception as e:
        logger.error(f"Error in auto_generate_summaries_for_escalated: {str(e)}")
        raise


@shared_task
def notify_counselors_of_critical_alerts():
    """
    Notify counselors of pending critical alerts
    Run this task periodically (e.g., every 15 minutes)
    """
    try:
        # Find critical pending alerts (severity >= 9)
        critical_alerts = CrisisAlert.objects.filter(
            status='pending',
            severity__gte=9
        ).order_by('-created_at', '-severity')
        
        logger.info(f"Found {critical_alerts.count()} critical pending alerts")
        
        # In a real implementation, this would send emails/notifications
        # For now, we'll just log them
        for alert in critical_alerts[:10]:  # Limit to top 10
            logger.warning(
                f"CRITICAL ALERT: User {alert.user.username} - "
                f"Severity {alert.severity} - "
                f"Keywords: {', '.join(alert.matched_keywords)}"
            )
        
        return f"Processed {critical_alerts.count()} critical alerts"
    except Exception as e:
        logger.error(f"Error in notify_counselors_of_critical_alerts: {str(e)}")
        raise


@shared_task
def cleanup_old_alerts():
    """
    Mark resolved alerts older than 90 days as archived (or delete if needed)
    Run this task daily
    """
    try:
        cutoff_date = timezone.now() - timedelta(days=90)
        
        old_resolved_alerts = CrisisAlert.objects.filter(
            status='resolved',
            resolved_at__lt=cutoff_date
        )
        
        count = old_resolved_alerts.count()
        
        # For now, just log. In production, you might want to archive or delete
        logger.info(f"Found {count} resolved alerts older than 90 days")
        
        # Option: Archive or delete old alerts
        # old_resolved_alerts.delete()  # Uncomment if you want to delete
        
        return f"Processed {count} old resolved alerts"
    except Exception as e:
        logger.error(f"Error in cleanup_old_alerts: {str(e)}")
        raise


@shared_task
def generate_summary_for_alert(alert_id):
    """
    Generate summary for a conversation when a crisis alert is created
    
    Args:
        alert_id: ID of the crisis alert
    """
    try:
        alert = CrisisAlert.objects.get(pk=alert_id)
        
        if not alert.conversation:
            logger.warning(f"Alert {alert_id} has no associated conversation")
            return None
        
        # Generate summary for the conversation
        return generate_conversation_summary.delay(alert.conversation.session_id)
        
    except CrisisAlert.DoesNotExist:
        logger.error(f"Alert {alert_id} not found")
        return None
    except Exception as e:
        logger.error(f"Error generating summary for alert {alert_id}: {str(e)}")
        raise


@shared_task
def send_daily_checkin_reminders():
    """Send a gentle daily reminder to users who have registered notification devices."""
    if not getattr(settings, 'FCM_SERVER_KEY', None):
        logger.info('FCM server key not configured; skipping daily reminders')
        return 'FCM not configured'
    url = 'https://fcm.googleapis.com/fcm/send'
    headers = {
        'Authorization': f'key={settings.FCM_SERVER_KEY}',
        'Content-Type': 'application/json',
    }
    devices = NotificationDevice.objects.filter(active=True).select_related('user')[:5000]
    sent = 0
    for dev in devices:
        payload = {
            'to': dev.token,
            'notification': {
                'title': 'Daily check-in',
                'body': 'How are you feeling today? Open the app to record a quick check-in.'
            }
        }
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=8)
            sent += 1 if resp.status_code == 200 else 0
        except Exception as e:
            logger.warning(f"Failed to send reminder to {dev.user_id}: {e}")
    msg = f"Sent daily reminders to {sent} device(s)"
    logger.info(msg)
    return msg

