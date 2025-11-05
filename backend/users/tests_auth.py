from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rest_framework import status


User = get_user_model()


class AuthTests(APITestCase):
    """Comprehensive tests for authentication endpoints"""
    
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.me_url = reverse('me')
        self.refresh_url = reverse('token_refresh')
    
    def test_user_registration_success(self):
        """Test successful user registration"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123!',
            'phone_number': '1234567890',
            'user_type': 'client'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['user_type'], 'client')
        
        # Verify user was created
        user = User.objects.get(username='testuser')
        self.assertIsNotNone(user)
        self.assertTrue(user.check_password('TestPass123!'))
    
    def test_user_registration_duplicate_username(self):
        """Test registration with duplicate username"""
        # Create first user
        User.objects.create_user(username='existing', password='Pass123!')
        
        # Try to register with same username
        data = {
            'username': 'existing',
            'password': 'AnotherPass123!',
            'email': 'different@example.com'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
    
    def test_user_registration_weak_password(self):
        """Test registration with weak password"""
        data = {
            'username': 'weakpass',
            'password': '123',  # Too weak
            'email': 'test@example.com'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
    
    def test_login_success(self):
        """Test successful login with cookie refresh token"""
        # Create user
        user = User.objects.create_user(
            username='testlogin',
            password='TestPass123!',
            email='testlogin@example.com'
        )
        
        # Login
        data = {'username': 'testlogin', 'password': 'TestPass123!'}
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh_token', response.cookies)
        
        # Verify access token works
        access_token = response.data['access']
        me_response = self.client.get(
            self.me_url,
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data['username'], 'testlogin')
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        # Create user
        User.objects.create_user(username='valid', password='ValidPass123!')
        
        # Try wrong password
        data = {'username': 'valid', 'password': 'WrongPass123!'}
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_token_refresh(self):
        """Test token refresh endpoint"""
        # Create user and login
        user = User.objects.create_user(username='refreshuser', password='TestPass123!')
        login_response = self.client.post(
            self.login_url,
            {'username': 'refreshuser', 'password': 'TestPass123!'},
            format='json'
        )
        
        # Get refresh token from cookie
        refresh_token = login_response.cookies.get('refresh_token').value
        
        # Refresh access token
        refresh_response = self.client.post(
            self.refresh_url,
            {'refresh': refresh_token},
            format='json'
        )
        
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)
    
    def test_me_endpoint_requires_authentication(self):
        """Test that /api/users/me/ requires authentication"""
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_me_endpoint_returns_user_data(self):
        """Test /api/users/me/ returns correct user data"""
        user = User.objects.create_user(
            username='meuser',
            password='TestPass123!',
            email='me@example.com',
            user_type='counselor'
        )
        
        # Login and get token
        login_response = self.client.post(
            self.login_url,
            {'username': 'meuser', 'password': 'TestPass123!'},
            format='json'
        )
        access_token = login_response.data['access']
        
        # Get user data
        response = self.client.get(
            self.me_url,
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'meuser')
        self.assertEqual(response.data['email'], 'me@example.com')
        self.assertEqual(response.data['user_type'], 'counselor')
    
    def test_user_types(self):
        """Test registration with different user types"""
        user_types = ['client', 'counselor', 'admin']
        
        for user_type in user_types:
            data = {
                'username': f'user_{user_type}',
                'password': 'TestPass123!',
                'user_type': user_type
            }
            response = self.client.post(self.register_url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(response.data['user_type'], user_type)
            
            user = User.objects.get(username=f'user_{user_type}')
            self.assertEqual(user.user_type, user_type)


