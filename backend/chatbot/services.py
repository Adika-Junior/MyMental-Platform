"""
Chatbot service using LangChain and Ollama
"""
try:
    from langchain_community.llms import Ollama
except ImportError:
    # Fallback for older LangChain versions
    from langchain.llms import Ollama

from django.conf import settings
from .models import CrisisKeyword, CrisisAlert, EmotionalCheckIn
from django.utils import timezone
import re
from datetime import timedelta


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
        mood_profile = None
        
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
        
        # Optionally incorporate longitudinal mood profile (last 30 days)
        if user is not None:
            mood_profile = self._get_longitudinal_mood(user_id=user.id, window_days=30)

        # Determine if this is a crisis (severity >= 7 or auto-escalate)
        is_crisis = max_severity >= 7 or should_escalate
        
        # Derive risk level (1 = low, 2 = moderate, 3 = high)
        negative_ratio = None
        if mood_profile and mood_profile.get('has_data'):
            negative_ratio = mood_profile.get('negative_ratio')

        if is_crisis:
            risk_level = 3
        elif max_severity >= 5 or (negative_ratio is not None and negative_ratio >= 0.6):
            risk_level = 2
        else:
            risk_level = 1

        risk_label = {1: 'low', 2: 'moderate', 3: 'high'}[risk_level]

        # Action recommendation aligned with risk level
        if risk_level == 3:
            action = 'immediate_escalation'
        elif risk_level == 2:
            action = 'monitor'
        else:
            action = 'none'

        # Build an explainable rationale string
        rationale_parts = []
        if matched_keywords:
            keyword_list = ', '.join([kw['keyword'] for kw in matched_keywords])
            rationale_parts.append(f"Matched crisis keywords in message: {keyword_list}.")
        if mood_profile and mood_profile.get('has_data'):
            avg_mood = mood_profile.get('average_mood')
            neg_ratio = mood_profile.get('negative_ratio')
            rationale_parts.append(
                f"Recent emotional check-ins show average mood {avg_mood:.2f} on a 1–5 scale "
                f"with approximately {neg_ratio:.0%} of check-ins in the negative range."
            )
        if risk_level == 3:
            rationale_parts.append("Combined indicators place this interaction in a HIGH risk band requiring immediate attention.")
        elif risk_level == 2:
            rationale_parts.append("Signals suggest MODERATE risk; additional monitoring and potential clinician review are recommended.")
        else:
            rationale_parts.append("No elevated risk indicators detected; proceeding with standard supportive interaction.")

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
            'alert_id': alert.id if alert else None,
            'risk_level': risk_level,
            'risk_label': risk_label,
            'action': action,
            'mood_profile': mood_profile,
            'rationale': " ".join(rationale_parts).strip(),
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

    def _get_longitudinal_mood(self, user_id, window_days=30):
        """
        Compute a simple longitudinal mood profile from recent check-ins.

        The model aggregates emotional check-ins over a sliding time window
        and derives:
        - average_mood: mean of 1–5 Likert mood ratings
        - negative_ratio: fraction of check-ins in the negative range (1–2)
        - count: number of check-ins considered
        """
        now = timezone.now()
        window_start = now - timedelta(days=window_days)
        qs = EmotionalCheckIn.objects.filter(
            user_id=user_id,
            created_at__gte=window_start
        ).order_by('-created_at')

        count = qs.count()
        if count == 0:
            return {
                'has_data': False,
                'average_mood': None,
                'negative_ratio': None,
                'count': 0,
            }

        moods = list(qs.values_list('mood', flat=True))
        average_mood = sum(moods) / float(count)
        negative_count = sum(1 for m in moods if m <= 2)
        negative_ratio = negative_count / float(count)

        return {
            'has_data': True,
            'average_mood': average_mood,
            'negative_ratio': negative_ratio,
            'count': count,
        }
    
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

