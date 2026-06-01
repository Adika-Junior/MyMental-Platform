from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    USER_TYPE_CHOICES = [
        ('client', 'Client'),
        ('counselor', 'Counselor'),
        ('admin', 'Admin'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='client', db_index=True)
    phone_number = models.CharField(max_length=15, blank=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Django provides a unique index on username; add index for email lookups
    email = models.EmailField(blank=True, db_index=True)

    # Canonical identity mapping when using AuthGuard as the identity provider.
    # AuthGuard's access token `sub` is set to this UUID.
    authguard_user_id = models.UUIDField(null=True, blank=True, db_index=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class ClientProfile(models.Model):
    """Extended profile for clients"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    anonymous_mode = models.BooleanField(default=False, db_index=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return f"Client Profile - {self.user.username}"

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['anonymous_mode']),
        ]


class CounselorProfile(models.Model):
    """Extended profile for counselors"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='counselor_profile')
    license_number = models.CharField(max_length=50, blank=True)
    specialties = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    is_online = models.BooleanField(default=False, db_index=True)
    current_clients = models.ManyToManyField(User, related_name='assigned_counselor', blank=True)
    
    def __str__(self):
        return f"Counselor Profile - {self.user.username}"

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['is_online']),
        ]
