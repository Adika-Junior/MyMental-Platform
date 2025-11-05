"""
Test utilities for MyMental Platform backend tests
"""
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse


User = get_user_model()


class TestHelperMixin:
    """Mixin class providing common test helper methods"""
    
    def create_test_user(self, username='testuser', password='TestPass123!', **kwargs):
        """Create a test user with default or custom parameters"""
        defaults = {
            'email': f'{username}@example.com',
            'user_type': 'client'
        }
        defaults.update(kwargs)
        return User.objects.create_user(username=username, password=password, **defaults)
    
    def create_test_counselor(self, username='counselor', password='Counselor123!'):
        """Create a test counselor user"""
        return self.create_test_user(
            username=username,
            password=password,
            user_type='counselor'
        )
    
    def get_auth_headers(self, username, password='TestPass123!'):
        """Get authentication headers for a user"""
        if isinstance(username, User):
            user = username
            username = user.username
            # Try to guess password or use default
            password = 'TestPass123!'
        else:
            user = User.objects.get(username=username)
        
        client = APIClient()
        response = client.post(
            reverse('token_obtain_pair'),
            {'username': username, 'password': password},
            format='json'
        )
        access = response.data['access']
        return {'HTTP_AUTHORIZATION': f'Bearer {access}'}
    
    def login_user(self, username, password='TestPass123!'):
        """Login a user and return access token"""
        client = APIClient()
        response = client.post(
            reverse('token_obtain_pair'),
            {'username': username, 'password': password},
            format='json'
        )
        return response.data.get('access')


def create_crisis_keyword(keyword='test crisis', severity=9, auto_escalate=True):
    """Helper to create a crisis keyword for testing"""
    from chatbot.models import CrisisKeyword
    return CrisisKeyword.objects.create(
        keyword=keyword,
        severity=severity,
        auto_escalate=auto_escalate,
        is_active=True
    )

