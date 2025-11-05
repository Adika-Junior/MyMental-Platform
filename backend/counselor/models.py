from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class CounselorAssignment(models.Model):
    """Assignment of counselors to conversations"""
    conversation = models.ForeignKey('chatbot.Conversation', on_delete=models.CASCADE)
    counselor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-assigned_at']
    
    def __str__(self):
        return f"{self.counselor.username} assigned to {self.conversation.session_id}"


class SessionNote(models.Model):
    """Counselor notes on a session"""
    session = models.ForeignKey('chatbot.CounselingSession', on_delete=models.CASCADE, related_name='notes')
    counselor = models.ForeignKey(User, on_delete=models.CASCADE)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note by {self.counselor.username} for Session {self.session.id}"
