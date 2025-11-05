"""
Analytics models for tracking usage and safety incidents
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class UserActivity(models.Model):
    """Track user activities and usage patterns"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50)  # login, chat_session, check_in, etc.
    activity_data = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analytics_user_activity'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['activity_type', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} at {self.created_at}"


class SafetyIncident(models.Model):
    """Track safety-related incidents for compliance and monitoring"""
    INCIDENT_TYPES = [
        ('crisis_detected', 'Crisis Detected'),
        ('self_harm_mention', 'Self-Harm Mention'),
        ('abuse_reported', 'Abuse Reported'),
        ('content_violation', 'Content Violation'),
        ('system_alert', 'System Alert'),
    ]

    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='safety_incidents', null=True, blank=True)
    incident_type = models.CharField(max_length=50, choices=INCIDENT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='medium')
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_incidents')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analytics_safety_incident'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['incident_type', '-created_at']),
            models.Index(fields=['severity', '-created_at']),
            models.Index(fields=['resolved', '-created_at']),
        ]

    def __str__(self):
        return f"{self.incident_type} - {self.severity} ({self.created_at})"

    def resolve(self, resolved_by_user):
        """Mark incident as resolved"""
        self.resolved = True
        self.resolved_at = timezone.now()
        self.resolved_by = resolved_by_user
        self.save()


class UsageMetrics(models.Model):
    """Aggregated usage metrics for reporting"""
    date = models.DateField()
    metric_type = models.CharField(max_length=50)  # daily_active_users, total_sessions, etc.
    metric_value = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'analytics_usage_metrics'
        unique_together = ['date', 'metric_type']
        ordering = ['-date', 'metric_type']
        indexes = [
            models.Index(fields=['date', 'metric_type']),
        ]

    def __str__(self):
        return f"{self.metric_type} - {self.date}: {self.metric_value}"

