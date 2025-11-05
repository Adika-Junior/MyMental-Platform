import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import get_user_model
from chatbot.models import Conversation, Message, EmotionalCheckIn
from chatbot.services import MentalHealthChatbot
from graphql import GraphQLError


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()
        fields = ("id", "username", "email")


class ConversationType(DjangoObjectType):
    messages = graphene.List(lambda: MessageType)

    class Meta:
        model = Conversation
        fields = ("id", "session_id", "is_escalated", "created_at", "updated_at", "messages")

    def resolve_messages(self, info):
        user = info.context.user
        if not user or not user.is_authenticated:
            raise GraphQLError("Authentication required")
        if self.user_id != user.id:
            raise GraphQLError("Not allowed")
        # Query by session_id since Message is in MongoDB
        return Message.objects.filter(session_id=self.session_id).order_by('created_at')


class MessageType(DjangoObjectType):
    class Meta:
        model = Message
        fields = ("id", "message_type", "content", "created_at")


class CheckInType(DjangoObjectType):
    class Meta:
        model = EmotionalCheckIn
        fields = ("id", "mood", "notes", "created_at")


class Query(graphene.ObjectType):
    me = graphene.Field(UserType)
    conversations = graphene.List(ConversationType)
    check_ins = graphene.List(CheckInType)
    messages = graphene.List(MessageType, session_id=graphene.String(required=True))

    def resolve_me(self, info):
        user = info.context.user
        if not user or not user.is_authenticated:
            raise GraphQLError("Authentication required")
        return user

    def resolve_conversations(self, info):
        user = info.context.user
        if not user or not user.is_authenticated:
            raise GraphQLError("Authentication required")
        return Conversation.objects.filter(user=user)

    def resolve_check_ins(self, info):
        user = info.context.user
        if not user or not user.is_authenticated:
            raise GraphQLError("Authentication required")
        # Query by user_id since CheckIn is in MongoDB
        return EmotionalCheckIn.objects.filter(user_id=user.id)

    def resolve_messages(self, info, session_id):
        user = info.context.user
        if not user or not user.is_authenticated:
            raise GraphQLError("Authentication required")
        try:
            convo = Conversation.objects.get(user=user, session_id=session_id)
        except Conversation.DoesNotExist:
            raise GraphQLError("Conversation not found")
        # Query by session_id since Message is in MongoDB
        return Message.objects.filter(session_id=session_id).order_by('created_at')


class CreateCheckIn(graphene.Mutation):
    class Arguments:
        mood = graphene.Int(required=True)
        notes = graphene.String(required=False)

    ok = graphene.Boolean()
    check_in = graphene.Field(CheckInType)

    def mutate(self, info, mood, notes=None):
        user = info.context.user
        if not user or not user.is_authenticated:
            raise GraphQLError("Authentication required")
        # Use user_id instead of user ForeignKey
        check_in = EmotionalCheckIn.objects.create(user_id=user.id, mood=mood, notes=notes or "")
        return CreateCheckIn(ok=True, check_in=check_in)


class SendMessage(graphene.Mutation):
    class Arguments:
        session_id = graphene.String(required=True)
        message = graphene.String(required=True)

    ok = graphene.Boolean()
    bot_response = graphene.String()
    crisis_detected = graphene.Boolean()

    def mutate(self, info, session_id, message):
        user = info.context.user
        if not user or not user.is_authenticated:
            raise GraphQLError("Authentication required")
        
        conversation, _ = Conversation.objects.get_or_create(user=user, session_id=session_id)
        
        # Use chatbot service
        from chatbot.services import MentalHealthChatbot
        chatbot = MentalHealthChatbot()
        
        # Detect crisis (with user and conversation for alert creation)
        crisis_detection = chatbot.detect_crisis(message, user=user, conversation=conversation)
        
        # Save user message (using IDs for cross-database compatibility)
        Message.objects.create(
            session_id=session_id,
            user_id=user.id,
            conversation_id=conversation.id,
            message_type='user',
            content=message,
            metadata={'crisis_detection': crisis_detection}
        )
        
        # Get previous messages for context
        previous_messages = list(
            Message.objects.filter(session_id=session_id)
            .order_by('created_at')
            .values('message_type', 'content')
        )
        
        # Generate bot response (with crisis detection context)
        bot_text = chatbot.generate_response(message, previous_messages, crisis_detection=crisis_detection)
        
        # Save bot response
        Message.objects.create(
            session_id=session_id,
            user_id=user.id,
            conversation_id=conversation.id,
            message_type='bot',
            content=bot_text,
            metadata={'crisis_detected': crisis_detection.get('is_crisis', False)}
        )
        
        # If crisis detected, escalate
        if crisis_detection.get('is_crisis'):
            conversation.is_escalated = True
            conversation.save()
        
        return SendMessage(
            ok=True, 
            bot_response=bot_text,
            crisis_detected=crisis_detection.get('is_crisis', False)
        )


class StartConversation(graphene.Mutation):
    ok = graphene.Boolean()
    session_id = graphene.String()

    def mutate(self, info):
        import uuid
        user = info.context.user
        if not user or not user.is_authenticated:
            raise GraphQLError("Authentication required")
        session_id = str(uuid.uuid4())
        Conversation.objects.create(user=user, session_id=session_id)
        return StartConversation(ok=True, session_id=session_id)


class Mutation(graphene.ObjectType):
    create_check_in = CreateCheckIn.Field()
    send_message = SendMessage.Field()
    start_conversation = StartConversation.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)


