from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Conversation(models.Model):
    """Represents a conversation session between user and chatbot"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_escalated = models.BooleanField(default=False)
    escalated_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='escalated_conversations')
    summary = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['is_escalated', '-updated_at']),
            models.Index(fields=['session_id']),
        ]
    
    def __str__(self):
        return f"Conversation {self.session_id} - {self.user.username}"


class Message(models.Model):
    """Individual messages in a conversation
    Note: Stored in MongoDB - uses session_id and user_id instead of ForeignKeys
    to avoid cross-database relationships.
    """
    MESSAGE_TYPE_CHOICES = [
        ('user', 'User'),
        ('bot', 'Bot'),
        ('system', 'System'),
    ]
    
    # Store session_id and user_id as integers to avoid cross-database foreign keys
    session_id = models.CharField(max_length=100, db_index=True)
    user_id = models.IntegerField(db_index=True)  # Reference to User in PostgreSQL
    conversation_id = models.IntegerField(null=True, blank=True, db_index=True)  # Reference to Conversation in PostgreSQL
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session_id', 'created_at']),
            models.Index(fields=['user_id', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."
    
    @property
    def conversation(self):
        """Lazy-load conversation from PostgreSQL"""
        if self.conversation_id:
            return Conversation.objects.get(pk=self.conversation_id)
        return None
    
    @property
    def user(self):
        """Lazy-load user from PostgreSQL"""
        return User.objects.get(pk=self.user_id)


class EmotionalCheckIn(models.Model):
    """Emotional check-ins from users
    Note: Stored in MongoDB - uses user_id instead of ForeignKey
    to avoid cross-database relationships.
    """
    MOOD_CHOICES = [
        (1, 'Very Sad'),
        (2, 'Sad'),
        (3, 'Neutral'),
        (4, 'Happy'),
        (5, 'Very Happy'),
    ]
    
    user_id = models.IntegerField(db_index=True)  # Reference to User in PostgreSQL
    mood = models.IntegerField(choices=MOOD_CHOICES)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id', '-created_at']),
        ]
    
    def __str__(self):
        username = getattr(self, '_cached_username', None) or f"User #{self.user_id}"
        return f"{username} - {self.get_mood_display()}"
    
    @property
    def user(self):
        """Lazy-load user from PostgreSQL"""
        return User.objects.get(pk=self.user_id)


class Psychoeducation(models.Model):
    """Psychoeducation content and modules"""
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50)
    content = models.TextField()
    resources = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class CrisisKeyword(models.Model):
    """Keywords for crisis detection"""
    keyword = models.CharField(max_length=100, unique=True)
    severity = models.IntegerField(default=5)  # 1-10 scale
    auto_escalate = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-severity', 'keyword']
        indexes = [
            models.Index(fields=['is_active', '-severity']),
            models.Index(fields=['keyword']),
        ]
    
    def __str__(self):
        return f"{self.keyword} (Severity: {self.severity})"


class CrisisAlert(models.Model):
    """Alerts generated from crisis detection"""
    ALERT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
        ('false_positive', 'False Positive'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='crisis_alerts')
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='crisis_alerts', null=True, blank=True)
    message = models.TextField()  # The message that triggered the alert
    severity = models.IntegerField()  # 1-10 scale
    matched_keywords = models.JSONField(default=list)  # List of matched keywords
    status = models.CharField(max_length=20, choices=ALERT_STATUS_CHOICES, default='pending')
    escalated_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='handled_alerts')
    notes = models.TextField(blank=True)  # Counselor/admin notes
    created_at = models.DateTimeField(auto_now_add=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"Crisis Alert - {self.user.username} ({self.get_severity_display()}) - {self.created_at}"
    
    def get_severity_display(self):
        if self.severity >= 9:
            return 'Critical'
        elif self.severity >= 7:
            return 'High'
        elif self.severity >= 5:
            return 'Medium'
        else:
            return 'Low'


class CounselingSession(models.Model):
    """Sessions between users and counselors"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_sessions')
    counselor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='counselor_sessions')
    conversation = models.OneToOneField(Conversation, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='pending')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Session {self.id} - {self.user.username} with {self.counselor.username}"


class PreSessionQuestionnaire(models.Model):
    """Pre-therapy questionnaire filled before starting sessions (stored in PostgreSQL)."""
    STRESS_LEVEL_CHOICES = [
        (1, 'Very Low'),
        (2, 'Low'),
        (3, 'Moderate'),
        (4, 'High'),
        (5, 'Very High'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pre_session_questionnaires')
    mood = models.IntegerField(choices=EmotionalCheckIn.MOOD_CHOICES)
    stress_level = models.IntegerField(choices=STRESS_LEVEL_CHOICES)
    main_concerns = models.TextField(help_text='Primary concerns or topics to discuss')
    goals = models.TextField(blank=True, help_text='Goals or outcomes hoped for')
    has_crisis_history = models.BooleanField(default=False)
    consent_to_contact = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"Questionnaire #{self.id} - {self.user.username}"


class NotificationDevice(models.Model):
    """Stores FCM device tokens per user for push notifications."""
    PLATFORM_CHOICES = [
        ("web", "Web"),
        ("android", "Android"),
        ("ios", "iOS"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_devices')
    token = models.CharField(max_length=512, unique=True)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default="web")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'active', '-created_at']),
        ]

    def __str__(self):
        return f"{self.platform} token for {self.user.username}"


class ChatReport(models.Model):
    """User-submitted reports for abusive or inappropriate messages/conversations."""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('reviewing', 'Reviewing'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]

    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_reports')
    session_id = models.CharField(max_length=100, db_index=True)
    message_id = models.IntegerField(null=True, blank=True, db_index=True)
    reason = models.CharField(max_length=50)
    details = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    handled_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='handled_reports')
    action_taken = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    handled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['reporter', '-created_at']),
            models.Index(fields=['session_id', '-created_at']),
        ]

    def __str__(self):
        return f"Report #{self.id} by {self.reporter.username} ({self.status})"
