"""
Chatbot service using LangChain and Ollama
"""
try:
    from langchain_community.llms import Ollama
except ImportError:
    # Fallback for older LangChain versions
    from langchain.llms import Ollama

from django.conf import settings
from .models import CrisisKeyword, CrisisAlert
from django.utils import timezone
import re


class MentalHealthChatbot:
    """Chatbot service for mental health support using LangChain and Ollama"""
    
    def __init__(self):
        self.llm = Ollama(
            model=settings.OLLAMA_MODEL,
            base_url=settings.OLLAMA_BASE_URL
        )
        self.system_prompt = """You are a compassionate and empathetic mental health chatbot designed to provide pre-counseling support. 

Your role is to:
- Listen actively and respond with empathy
- Provide emotional support and validation
- Offer psychoeducation and coping strategies
- NEVER diagnose or provide medical advice
- Escalate crisis situations immediately

Important guidelines:
- Be warm, non-judgmental, and patient
- Use simple, accessible language
- Ask open-ended questions to understand the user better
- Provide practical coping strategies
- Always remind users you are not a replacement for professional therapy

Remember: You are creating a safe space for users who may be hesitant to seek professional help."""
        
    def generate_response(self, user_message, conversation_history=None, crisis_detection=None):
        """
        Generate a response using the LLM
        
        Args:
            user_message: Current user message
            conversation_history: Previous messages for context
            crisis_detection: Optional crisis detection results
            
        Returns:
            str: Bot response
        """
        try:
            # Modify system prompt if crisis detected
            system_prompt = self.system_prompt
            if crisis_detection and crisis_detection.get('is_crisis'):
                system_prompt += "\n\n⚠️ CRISIS ALERT: User message indicates potential crisis. " \
                               "Be extremely supportive and provide immediate resources. " \
                               "Encourage them to contact emergency services if needed."
            
            # Build context from conversation history
            context = ""
            if conversation_history:
                context = "\n".join([f"{msg.get('message_type', 'user')}: {msg.get('content', '')}" 
                                    for msg in conversation_history[-5:]])  # Last 5 messages
            
            # Combine system prompt, context, and current message
            full_prompt = f"""{system_prompt}

Previous conversation context:
{context}

Current user message: {user_message}

Provide a supportive response:"""
            
            # Generate response
            response = self.llm(full_prompt)
            
            # If crisis detected, append resources
            if crisis_detection and crisis_detection.get('is_crisis'):
                response += "\n\n⚠️ **If you're having thoughts of harming yourself, please reach out for help immediately:**\n" \
                           "• National Suicide Prevention Lifeline: 988 (24/7)\n" \
                           "• Crisis Text Line: Text HOME to 741741\n" \
                           "• In immediate danger: Call 911"
            
            return response
        except Exception as e:
            print(f"Error generating response: {str(e)}")
            return "I'm sorry, I'm having trouble processing that right now. Please try again in a moment."
    
    def detect_crisis(self, message, user=None, conversation=None):
        """
        Detect crisis keywords in the message using database keywords
        
        Args:
            message: User message to analyze
            user: User object (optional, for creating alerts)
            conversation: Conversation object (optional, for creating alerts)
            
        Returns:
            dict: Crisis detection results with matched keywords
        """
        message_lower = message.lower()
        matched_keywords = []
        max_severity = 0
        should_escalate = False
        
        # Load active crisis keywords from database
        active_keywords = CrisisKeyword.objects.filter(is_active=True).order_by('-severity')
        
        # Check against database keywords
        for keyword_obj in active_keywords:
            keyword_lower = keyword_obj.keyword.lower()
            # Use word boundary matching for better accuracy
            pattern = r'\b' + re.escape(keyword_lower) + r'\b'
            if re.search(pattern, message_lower, re.IGNORECASE):
                matched_keywords.append({
                    'keyword': keyword_obj.keyword,
                    'severity': keyword_obj.severity,
                    'auto_escalate': keyword_obj.auto_escalate
                })
                max_severity = max(max_severity, keyword_obj.severity)
                if keyword_obj.auto_escalate:
                    should_escalate = True
        
        # Determine if this is a crisis (severity >= 7)
        is_crisis = max_severity >= 7 or should_escalate
        
        # Create alert if crisis detected and user provided
        alert = None
        if is_crisis and user:
            alert = self._create_crisis_alert(
                user=user,
                conversation=conversation,
                message=message,
                severity=max_severity,
                matched_keywords=[kw['keyword'] for kw in matched_keywords]
            )
            
            # Trigger background task to generate summary if conversation exists
            if alert and alert.conversation:
                try:
                    from .tasks import generate_summary_for_alert
                    generate_summary_for_alert.delay(alert.id)
                    # Log crisis detection
                    from mymental_backend.audit_log import log_crisis_event
                    log_crisis_event(alert, action='detected')
                except Exception as e:
                    # Log but don't fail if task scheduling fails
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Failed to queue summary generation task: {str(e)}")
        
        return {
            'is_crisis': is_crisis,
            'severity': max_severity,
            'matched_keywords': [kw['keyword'] for kw in matched_keywords],
            'action': 'immediate_escalation' if is_crisis else ('monitor' if max_severity >= 4 else 'none'),
            'alert_id': alert.id if alert else None
        }
    
    def _create_crisis_alert(self, user, message, severity, matched_keywords, conversation=None):
        """
        Create a crisis alert in the database
        
        Args:
            user: User object
            message: The message that triggered the alert
            severity: Severity level (1-10)
            matched_keywords: List of matched keywords
            conversation: Optional Conversation object
            
        Returns:
            CrisisAlert: Created alert object
        """
        return CrisisAlert.objects.create(
            user=user,
            conversation=conversation,
            message=message,
            severity=severity,
            matched_keywords=matched_keywords,
            status='pending'
        )
    
    def summarize_conversation(self, messages):
        """
        Summarize a conversation for counselor handoff
        
        Args:
            messages: List of message dictionaries
            
        Returns:
            str: Conversation summary
        """
        try:
            conversation_text = "\n".join([
                f"{msg.get('message_type', 'user')}: {msg.get('content', '')}" 
                for msg in messages
            ])
            
            summary_prompt = f"""Summarize this mental health conversation in 3-5 sentences for a counselor:

Conversation:
{conversation_text}

Provide a brief summary focusing on:
- Main concerns expressed
- Emotional state indicators
- Key topics discussed
- Recommended next steps for the counselor"""
            
            summary = self.llm(summary_prompt)
            return summary
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            return "Unable to generate summary automatically."

