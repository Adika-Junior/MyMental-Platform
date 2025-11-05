"""
Signals for automatic analytics tracking
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import SafetyIncident

User = get_user_model()


@receiver(post_save, sender=SafetyIncident)
def log_safety_incident(sender, instance, created, **kwargs):
    """Log safety incident creation"""
    if created:
        from mymental_backend.audit_log import log_event
        log_event(
            event_type='safety_incident_created',
            description=f'Safety incident {instance.incident_type} created',
            user=instance.user,
            metadata={
                'incident_id': instance.id,
                'incident_type': instance.incident_type,
                'severity': instance.severity,
            },
            severity='warning' if instance.severity in ['high', 'critical'] else 'info'
        )

