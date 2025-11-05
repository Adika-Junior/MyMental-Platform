"""
Serializers for the chatbot app
"""
from rest_framework import serializers
from .models import Conversation, Message, EmotionalCheckIn, Psychoeducation, PreSessionQuestionnaire, NotificationDevice, ChatReport


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'message_type', 'content', 'created_at', 'metadata']
        read_only_fields = ['created_at']


class ConversationSerializer(serializers.ModelSerializer):
    # Messages loaded separately via session_id (not via related_name due to cross-database)
    
    class Meta:
        model = Conversation
        fields = ['id', 'session_id', 'created_at', 'updated_at', 
                  'is_escalated', 'escalated_to', 'summary']
        read_only_fields = ['created_at', 'updated_at']


class CheckInSerializer(serializers.ModelSerializer):
    mood_display = serializers.CharField(source='get_mood_display', read_only=True)
    
    class Meta:
        model = EmotionalCheckIn
        fields = ['id', 'mood', 'mood_display', 'notes', 'created_at']
        read_only_fields = ['created_at']


class PsychoeducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Psychoeducation
        fields = ['id', 'title', 'category', 'content', 'resources', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class PreSessionQuestionnaireSerializer(serializers.ModelSerializer):
    mood_display = serializers.CharField(source='get_mood_display', read_only=True)
    stress_level_display = serializers.CharField(source='get_stress_level_display', read_only=True)

    class Meta:
        model = PreSessionQuestionnaire
        fields = [
            'id', 'mood', 'mood_display', 'stress_level', 'stress_level_display',
            'main_concerns', 'goals', 'has_crisis_history', 'consent_to_contact', 'created_at'
        ]
        read_only_fields = ['created_at']


class NotificationDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationDevice
        fields = ['id', 'token', 'platform', 'active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChatReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatReport
        fields = [
            'id', 'reporter', 'session_id', 'message_id', 'reason', 'details',
            'status', 'handled_by', 'action_taken', 'created_at', 'handled_at'
        ]
        read_only_fields = ['id', 'reporter', 'status', 'handled_by', 'action_taken', 'created_at', 'handled_at']

