from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from chatbot.models import Conversation, Message, EmotionalCheckIn, CrisisAlert, CrisisKeyword


User = get_user_model()


class ChatApiTests(APITestCase):
    """Comprehensive tests for chatbot API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='bob',
            password='StrongPass123!',
            email='bob@example.com'
        )
        self.counselor = User.objects.create_user(
            username='counselor1',
            password='Counselor123!',
            email='counselor@example.com',
            user_type='counselor'
        )
        self.auth_headers = self._get_auth_headers(self.user)
        self.counselor_headers = self._get_auth_headers(self.counselor)
        
        # Create some crisis keywords for testing
        CrisisKeyword.objects.create(keyword='test crisis', severity=9, auto_escalate=True, is_active=True)
    
    def _get_auth_headers(self, user):
        """Get authentication headers for a user"""
        response = self.client.post(
            reverse('token_obtain_pair'),
            {'username': user.username, 'password': 'StrongPass123!' if user.username == 'bob' else 'Counselor123!'},
            format='json'
        )
        access = response.data['access']
        return {'HTTP_AUTHORIZATION': f'Bearer {access}'}
    
    def test_start_conversation(self):
        """Test starting a new conversation"""
        response = self.client.post(
            reverse('start_conversation'),
            {},
            format='json',
            **self.auth_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('session_id', response.data)
        
        # Verify conversation was created
        session_id = response.data['session_id']
        conversation = Conversation.objects.get(session_id=session_id)
        self.assertEqual(conversation.user, self.user)
        self.assertFalse(conversation.is_escalated)
    
    def test_send_message_success(self):
        """Test sending a message successfully"""
        # Start conversation
        start_response = self.client.post(
            reverse('start_conversation'),
            {},
            format='json',
            **self.auth_headers
        )
        session_id = start_response.data['session_id']
        
        # Send message
        message_data = {
            'session_id': session_id,
            'message': 'Hello, I need help'
        }
        response = self.client.post(
            reverse('send_message'),
            message_data,
            format='json',
            **self.auth_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('bot_response', response.data)
        self.assertIn('session_id', response.data)
        self.assertFalse(response.data.get('crisis_detected', False))
        
        # Verify messages were saved
        messages = Message.objects.filter(session_id=session_id)
        self.assertEqual(messages.count(), 2)  # User message + bot response
    
    def test_send_message_crisis_detection(self):
        """Test crisis detection in messages"""
        # Start conversation
        start_response = self.client.post(
            reverse('start_conversation'),
            {},
            format='json',
            **self.auth_headers
        )
        session_id = start_response.data['session_id']
        
        # Send message with crisis keyword
        message_data = {
            'session_id': session_id,
            'message': 'I am having thoughts of test crisis'
        }
        response = self.client.post(
            reverse('send_message'),
            message_data,
            format='json',
            **self.auth_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('crisis_detected', False))
        
        # Verify alert was created
        alerts = CrisisAlert.objects.filter(user=self.user)
        self.assertTrue(alerts.exists())
        alert = alerts.first()
        self.assertEqual(alert.severity, 9)
        self.assertIn('test crisis', alert.matched_keywords)
        
        # Verify conversation was escalated
        conversation = Conversation.objects.get(session_id=session_id)
        self.assertTrue(conversation.is_escalated)
    
    def test_get_conversation(self):
        """Test retrieving conversation history"""
        # Start conversation and send message
        start_response = self.client.post(
            reverse('start_conversation'),
            {},
            format='json',
            **self.auth_headers
        )
        session_id = start_response.data['session_id']
        
        self.client.post(
            reverse('send_message'),
            {'session_id': session_id, 'message': 'Hello'},
            format='json',
            **self.auth_headers
        )
        
        # Get conversation
        response = self.client.get(
            reverse('get_conversation', args=[session_id]),
            **self.auth_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('conversation', response.data)
        self.assertGreater(len(response.data['conversation']), 0)
    
    def test_get_conversation_unauthorized(self):
        """Test that users can't access other users' conversations"""
        # Create another user
        other_user = User.objects.create_user(username='other', password='OtherPass123!')
        other_headers = self._get_auth_headers(other_user)
        
        # First user starts conversation
        start_response = self.client.post(
            reverse('start_conversation'),
            {},
            format='json',
            **self.auth_headers
        )
        session_id = start_response.data['session_id']
        
        # Second user tries to access it
        response = self.client.get(
            reverse('get_conversation', args=[session_id]),
            **other_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_list_conversations(self):
        """Test listing user's conversations"""
        # Create multiple conversations
        for i in range(3):
            self.client.post(
                reverse('start_conversation'),
                {},
                format='json',
                **self.auth_headers
            )
        
        # List conversations
        response = self.client.get(
            reverse('list_conversations'),
            **self.auth_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
    
    def test_create_check_in(self):
        """Test creating an emotional check-in"""
        data = {
            'mood': 4,
            'notes': 'Feeling good today'
        }
        response = self.client.post(
            reverse('create_check_in'),
            data,
            format='json',
            **self.auth_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['mood'], 4)
        
        # Verify check-in was saved
        check_ins = EmotionalCheckIn.objects.filter(user_id=self.user.id)
        self.assertTrue(check_ins.exists())
    
    def test_get_check_ins(self):
        """Test retrieving user's check-ins"""
        # Create some check-ins
        EmotionalCheckIn.objects.create(user_id=self.user.id, mood=3, notes='First')
        EmotionalCheckIn.objects.create(user_id=self.user.id, mood=5, notes='Second')
        
        # Get check-ins
        response = self.client.get(
            reverse('get_check_ins'),
            **self.auth_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_list_crisis_alerts_for_user(self):
        """Test that users can see their own alerts"""
        # Create an alert for the user
        conversation = Conversation.objects.create(user=self.user, session_id='test-session')
        alert = CrisisAlert.objects.create(
            user=self.user,
            conversation=conversation,
            message='Test crisis message',
            severity=9,
            matched_keywords=['test crisis']
        )
        
        # Get alerts
        response = self.client.get(
            reverse('list_crisis_alerts'),
            **self.auth_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], alert.id)
    
    def test_list_crisis_alerts_for_counselor(self):
        """Test that counselors can see pending alerts"""
        # Create an alert
        conversation = Conversation.objects.create(user=self.user, session_id='test-session')
        alert = CrisisAlert.objects.create(
            user=self.user,
            conversation=conversation,
            message='Test crisis',
            severity=9,
            matched_keywords=['test crisis'],
            status='pending'
        )
        
        # Counselor gets alerts
        response = self.client.get(
            reverse('list_crisis_alerts') + '?status=pending',
            **self.counselor_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_acknowledge_alert_counselor(self):
        """Test that counselors can acknowledge alerts"""
        # Create an alert
        conversation = Conversation.objects.create(user=self.user, session_id='test-session')
        alert = CrisisAlert.objects.create(
            user=self.user,
            conversation=conversation,
            message='Test crisis',
            severity=9,
            matched_keywords=['test'],
            status='pending'
        )
        
        # Counselor acknowledges
        response = self.client.post(
            reverse('acknowledge_alert', args=[alert.id]),
            {},
            format='json',
            **self.counselor_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify alert was updated
        alert.refresh_from_db()
        self.assertEqual(alert.status, 'acknowledged')
        self.assertEqual(alert.escalated_to, self.counselor)
        
        # Verify conversation was escalated
        conversation.refresh_from_db()
        self.assertTrue(conversation.is_escalated)
        self.assertEqual(conversation.escalated_to, self.counselor)
    
    def test_acknowledge_alert_unauthorized(self):
        """Test that regular users can't acknowledge alerts"""
        # Create an alert
        conversation = Conversation.objects.create(user=self.user, session_id='test-session')
        alert = CrisisAlert.objects.create(
            user=self.user,
            conversation=conversation,
            message='Test crisis',
            severity=9,
            matched_keywords=['test'],
            status='pending'
        )
        
        # Regular user tries to acknowledge
        response = self.client.post(
            reverse('acknowledge_alert', args=[alert.id]),
            {},
            format='json',
            **self.auth_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_list_escalated_conversations_counselor(self):
        """Test that counselors can see escalated conversations"""
        # Create escalated conversation
        conversation = Conversation.objects.create(
            user=self.user,
            session_id='escalated-session',
            is_escalated=True,
            escalated_to=self.counselor
        )
        
        # Counselor gets escalated conversations
        response = self.client.get(
            reverse('list_escalated_conversations'),
            **self.counselor_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['session_id'], 'escalated-session')
    
    def test_generate_summary(self):
        """Test generating conversation summary"""
        # Create conversation with messages
        conversation = Conversation.objects.create(user=self.user, session_id='summary-session')
        Message.objects.create(
            session_id='summary-session',
            user_id=self.user.id,
            conversation_id=conversation.id,
            message_type='user',
            content='I am feeling sad'
        )
        Message.objects.create(
            session_id='summary-session',
            user_id=self.user.id,
            conversation_id=conversation.id,
            message_type='bot',
            content='I understand you are feeling sad'
        )
        
        # Generate summary
        response = self.client.post(
            reverse('generate_summary', args=['summary-session']),
            {},
            format='json',
            **self.counselor_headers
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        
        # Verify summary was saved
        conversation.refresh_from_db()
        self.assertIsNotNone(conversation.summary)
        self.assertEqual(conversation.summary, response.data['summary'])


