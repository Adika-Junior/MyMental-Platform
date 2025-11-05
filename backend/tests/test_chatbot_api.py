"""
Integration tests for chatbot API endpoints
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from chatbot.models import Conversation, Message

User = get_user_model()


class ChatbotAPITestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            username='testuser'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_start_conversation(self):
        """Test starting a new conversation"""
        response = self.client.post('/api/chatbot/start/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('session_id', response.data)
        self.assertIn('message', response.data)
        
        # Verify conversation was created
        session_id = response.data['session_id']
        conversation = Conversation.objects.get(session_id=session_id)
        self.assertEqual(conversation.user, self.user)
    
    def test_send_message(self):
        """Test sending a message"""
        # Start conversation first
        start_response = self.client.post('/api/chatbot/start/')
        session_id = start_response.data['session_id']
        
        # Send message
        response = self.client.post('/api/chatbot/send/', {
            'session_id': session_id,
            'message': 'Hello, I need help'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('bot_response', response.data)
        
        # Verify messages were created
        messages = Message.objects.filter(session_id=session_id)
        self.assertEqual(messages.count(), 2)  # User message + bot response
        
        user_msg = messages.filter(message_type='user').first()
        bot_msg = messages.filter(message_type='bot').first()
        
        self.assertIsNotNone(user_msg)
        self.assertIsNotNone(bot_msg)
        self.assertEqual(user_msg.content, 'Hello, I need help')
    
    def test_list_conversations(self):
        """Test listing user conversations"""
        # Create some conversations
        Conversation.objects.create(user=self.user, session_id='session1')
        Conversation.objects.create(user=self.user, session_id='session2')
        
        response = self.client.get('/api/chatbot/list/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('conversations', response.data)
        self.assertGreaterEqual(len(response.data['conversations']), 2)
    
    def test_get_conversation(self):
        """Test getting a specific conversation"""
        conversation = Conversation.objects.create(
            user=self.user,
            session_id='test_session'
        )
        
        # Add some messages
        Message.objects.create(
            session_id='test_session',
            user_id=self.user.id,
            conversation_id=conversation.id,
            message_type='user',
            content='User message'
        )
        
        response = self.client.get(f'/api/chatbot/test_session/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('messages', response.data)
    
    def test_search_psychoeducation(self):
        """Test searching psychoeducation content"""
        response = self.client.get('/api/chatbot/search/?q=depression&scope=psycho')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
    
    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access chat"""
        self.client.logout()
        
        response = self.client.post('/api/chatbot/start/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

