from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from graphene.test import Client
from graphql_app.schema import schema
from chatbot.models import Conversation, Message, EmotionalCheckIn, CrisisKeyword


User = get_user_model()


class GraphQLAuthTest(TestCase):
    """Test GraphQL authentication and user queries"""
    
    def setUp(self):
        self.client = Client(schema)
        self.user = User.objects.create_user(
            username='gqluser',
            password='TestPass123!',
            email='gqluser@example.com'
        )
    
    def _get_context(self):
        """Create a mock context with authenticated user"""
        class MockRequest:
            def __init__(self, user):
                self.user = user
        return MockRequest(self.user)
    
    def test_me_query_authenticated(self):
        """Test me query with authenticated user"""
        result = self.client.execute(
            '''
            query {
                me {
                    id
                    username
                    email
                }
            }
            ''',
            context_value=self._get_context()
        )
        
        self.assertIsNone(result.get('errors'))
        self.assertEqual(result['data']['me']['username'], 'gqluser')
        self.assertEqual(result['data']['me']['email'], 'gqluser@example.com')
    
    def test_me_query_unauthenticated(self):
        """Test me query without authentication"""
        class UnauthenticatedRequest:
            user = None
        
        result = self.client.execute(
            '''
            query {
                me {
                    id
                    username
                }
            }
            ''',
            context_value=UnauthenticatedRequest()
        )
        
        self.assertIsNotNone(result.get('errors'))
        self.assertIn('Authentication required', result['errors'][0]['message'])


class GraphQLConversationTest(TestCase):
    """Test GraphQL conversation queries and mutations"""
    
    def setUp(self):
        self.client = Client(schema)
        self.user = User.objects.create_user(
            username='convuser',
            password='TestPass123!',
            email='conv@example.com'
        )
    
    def _get_context(self):
        class MockRequest:
            def __init__(self, user):
                self.user = user
        return MockRequest(self.user)
    
    def test_start_conversation_mutation(self):
        """Test starting a new conversation via GraphQL"""
        result = self.client.execute(
            '''
            mutation {
                startConversation {
                    ok
                    sessionId
                }
            }
            ''',
            context_value=self._get_context()
        )
        
        self.assertIsNone(result.get('errors'))
        self.assertTrue(result['data']['startConversation']['ok'])
        self.assertIsNotNone(result['data']['startConversation']['sessionId'])
        
        # Verify conversation was created
        session_id = result['data']['startConversation']['sessionId']
        conversation = Conversation.objects.get(session_id=session_id)
        self.assertEqual(conversation.user, self.user)
    
    def test_send_message_mutation(self):
        """Test sending a message via GraphQL"""
        # First, start a conversation
        start_result = self.client.execute(
            '''
            mutation {
                startConversation {
                    sessionId
                }
            }
            ''',
            context_value=self._get_context()
        )
        session_id = start_result['data']['startConversation']['sessionId']
        
        # Send a message
        result = self.client.execute(
            '''
            mutation SendMessage($sessionId: String!, $message: String!) {
                sendMessage(sessionId: $sessionId, message: $message) {
                    ok
                    botResponse
                    crisisDetected
                }
            }
            ''',
            variables={'sessionId': session_id, 'message': 'Hello, I need help'},
            context_value=self._get_context()
        )
        
        self.assertIsNone(result.get('errors'))
        self.assertTrue(result['data']['sendMessage']['ok'])
        self.assertIsNotNone(result['data']['sendMessage']['botResponse'])
        self.assertFalse(result['data']['sendMessage']['crisisDetected'])
        
        # Verify messages were saved
        messages = Message.objects.filter(session_id=session_id)
        self.assertEqual(messages.count(), 2)  # User message + bot response
    
    def test_send_message_crisis_detection(self):
        """Test crisis detection in GraphQL sendMessage mutation"""
        # Create crisis keyword
        CrisisKeyword.objects.create(
            keyword='test crisis',
            severity=9,
            auto_escalate=True,
            is_active=True
        )
        
        # Start conversation
        start_result = self.client.execute(
            '''
            mutation {
                startConversation {
                    sessionId
                }
            }
            ''',
            context_value=self._get_context()
        )
        session_id = start_result['data']['startConversation']['sessionId']
        
        # Send message with crisis keyword
        result = self.client.execute(
            '''
            mutation SendMessage($sessionId: String!, $message: String!) {
                sendMessage(sessionId: $sessionId, message: $message) {
                    ok
                    botResponse
                    crisisDetected
                }
            }
            ''',
            variables={
                'sessionId': session_id,
                'message': 'I am having thoughts of test crisis'
            },
            context_value=self._get_context()
        )
        
        self.assertIsNone(result.get('errors'))
        self.assertTrue(result['data']['sendMessage']['crisisDetected'])
        
        # Verify conversation was escalated
        conversation = Conversation.objects.get(session_id=session_id)
        self.assertTrue(conversation.is_escalated)
    
    def test_conversations_query(self):
        """Test querying user's conversations"""
        # Create some conversations
        for i in range(3):
            Conversation.objects.create(
                user=self.user,
                session_id=f'session-{i}'
            )
        
        result = self.client.execute(
            '''
            query {
                conversations {
                    id
                    sessionId
                    isEscalated
                }
            }
            ''',
            context_value=self._get_context()
        )
        
        self.assertIsNone(result.get('errors'))
        self.assertEqual(len(result['data']['conversations']), 3)
    
    def test_messages_query(self):
        """Test querying messages for a conversation"""
        # Create conversation and messages
        conversation = Conversation.objects.create(
            user=self.user,
            session_id='msg-session'
        )
        Message.objects.create(
            session_id='msg-session',
            user_id=self.user.id,
            conversation_id=conversation.id,
            message_type='user',
            content='Hello'
        )
        Message.objects.create(
            session_id='msg-session',
            user_id=self.user.id,
            conversation_id=conversation.id,
            message_type='bot',
            content='Hi there'
        )
        
        result = self.client.execute(
            '''
            query GetMessages($sessionId: String!) {
                messages(sessionId: $sessionId) {
                    id
                    messageType
                    content
                }
            }
            ''',
            variables={'sessionId': 'msg-session'},
            context_value=self._get_context()
        )
        
        self.assertIsNone(result.get('errors'))
        self.assertEqual(len(result['data']['messages']), 2)
        self.assertEqual(result['data']['messages'][0]['messageType'], 'user')
        self.assertEqual(result['data']['messages'][1]['messageType'], 'bot')
    
    def test_messages_query_unauthorized(self):
        """Test that users can't query other users' messages"""
        # Create another user
        other_user = User.objects.create_user(
            username='other',
            password='OtherPass123!'
        )
        
        # Create conversation for other user
        conversation = Conversation.objects.create(
            user=other_user,
            session_id='other-session'
        )
        
        # Try to query as first user
        result = self.client.execute(
            '''
            query GetMessages($sessionId: String!) {
                messages(sessionId: $sessionId) {
                    id
                    content
                }
            }
            ''',
            variables={'sessionId': 'other-session'},
            context_value=self._get_context()
        )
        
        self.assertIsNotNone(result.get('errors'))
        self.assertIn('not found', result['errors'][0]['message'].lower())


class GraphQLCheckInTest(TestCase):
    """Test GraphQL check-in queries and mutations"""
    
    def setUp(self):
        self.client = Client(schema)
        self.user = User.objects.create_user(
            username='checkinuser',
            password='TestPass123!',
            email='checkin@example.com'
        )
    
    def _get_context(self):
        class MockRequest:
            def __init__(self, user):
                self.user = user
        return MockRequest(self.user)
    
    def test_create_check_in_mutation(self):
        """Test creating an emotional check-in via GraphQL"""
        result = self.client.execute(
            '''
            mutation CreateCheckIn($mood: Int!, $notes: String) {
                createCheckIn(mood: $mood, notes: $notes) {
                    ok
                    checkIn {
                        id
                        mood
                        notes
                    }
                }
            }
            ''',
            variables={'mood': 4, 'notes': 'Feeling good today'},
            context_value=self._get_context()
        )
        
        self.assertIsNone(result.get('errors'))
        self.assertTrue(result['data']['createCheckIn']['ok'])
        self.assertEqual(result['data']['createCheckIn']['checkIn']['mood'], 4)
        self.assertEqual(result['data']['createCheckIn']['checkIn']['notes'], 'Feeling good today')
        
        # Verify check-in was saved
        check_ins = EmotionalCheckIn.objects.filter(user_id=self.user.id)
        self.assertTrue(check_ins.exists())
    
    def test_check_ins_query(self):
        """Test querying user's check-ins"""
        # Create some check-ins
        EmotionalCheckIn.objects.create(
            user_id=self.user.id,
            mood=3,
            notes='First check-in'
        )
        EmotionalCheckIn.objects.create(
            user_id=self.user.id,
            mood=5,
            notes='Second check-in'
        )
        
        result = self.client.execute(
            '''
            query {
                checkIns {
                    id
                    mood
                    notes
                }
            }
            ''',
            context_value=self._get_context()
        )
        
        self.assertIsNone(result.get('errors'))
        self.assertEqual(len(result['data']['checkIns']), 2)
    
    def test_check_in_mutation_unauthenticated(self):
        """Test that check-in mutation requires authentication"""
        class UnauthenticatedRequest:
            user = None
        
        result = self.client.execute(
            '''
            mutation {
                createCheckIn(mood: 4) {
                    ok
                }
            }
            ''',
            context_value=UnauthenticatedRequest()
        )
        
        self.assertIsNotNone(result.get('errors'))
        self.assertIn('Authentication required', result['errors'][0]['message'])

