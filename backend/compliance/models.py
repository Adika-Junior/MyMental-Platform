"""
Compliance models for privacy, consent, and data retention
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class PrivacyConsent(models.Model):
    """Track user privacy consents and preferences"""
    CONSENT_TYPES = [
        ('data_collection', 'Data Collection'),
        ('analytics', 'Analytics Tracking'),
        ('marketing', 'Marketing Communications'),
        ('third_party', 'Third-Party Sharing'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='privacy_consents')
    consent_type = models.CharField(max_length=50, choices=CONSENT_TYPES)
    granted = models.BooleanField(default=False)
    granted_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    version = models.CharField(max_length=20, default='1.0')  # Policy version

    class Meta:
        db_table = 'compliance_privacy_consent'
        unique_together = ['user', 'consent_type']
        ordering = ['-granted_at']

    def __str__(self):
        status = 'Granted' if self.granted else 'Revoked'
        return f"{self.user.username} - {self.consent_type}: {status}"

    def grant(self, ip_address=None, user_agent=None):
        """Grant consent"""
        self.granted = True
        self.granted_at = timezone.now()
        self.revoked_at = None
        if ip_address:
            self.ip_address = ip_address
        if user_agent:
            self.user_agent = user_agent
        self.save()

    def revoke(self):
        """Revoke consent"""
        self.granted = False
        self.revoked_at = timezone.now()
        self.save()


class DataRetentionPolicy(models.Model):
    """Data retention policies and schedules"""
    DATA_TYPES = [
        ('chat_messages', 'Chat Messages'),
        ('check_ins', 'Emotional Check-ins'),
        ('user_activity', 'User Activity Logs'),
        ('analytics', 'Analytics Data'),
        ('conversations', 'Conversations'),
    ]

    data_type = models.CharField(max_length=50, choices=DATA_TYPES, unique=True)
    retention_days = models.IntegerField(help_text="Number of days to retain data before deletion")
    auto_delete = models.BooleanField(default=True)
    last_cleanup = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'compliance_data_retention'
        ordering = ['data_type']

    def __str__(self):
        return f"{self.data_type}: {self.retention_days} days"

    def should_delete(self, created_at):
        """Check if data should be deleted based on retention policy"""
        if not self.retention_days:
            return False
        cutoff_date = timezone.now() - timedelta(days=self.retention_days)
        return created_at < cutoff_date


class UserDataRequest(models.Model):
    """Track user data requests (GDPR compliance)"""
    REQUEST_TYPES = [
        ('export', 'Data Export'),
        ('deletion', 'Data Deletion'),
        ('access', 'Data Access Request'),
        ('portability', 'Data Portability'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='data_requests')
    request_type = models.CharField(max_length=50, choices=REQUEST_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'compliance_user_data_request'
        ordering = ['-requested_at']
        indexes = [
            models.Index(fields=['user', '-requested_at']),
            models.Index(fields=['status', '-requested_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.request_type} ({self.status})"

