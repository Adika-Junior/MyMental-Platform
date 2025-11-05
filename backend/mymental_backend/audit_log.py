"""
Audit logging utilities for tracking important system events
"""
import logging
from datetime import datetime
from django.contrib.auth import get_user_model
from django.db import models
import json

logger = logging.getLogger('audit')

User = get_user_model()


def log_event(event_type, description, user=None, metadata=None, severity='info'):
    """
    Log an audit event with structured data
    
    Args:
        event_type: Type of event (e.g., 'user_login', 'crisis_detected', 'summary_generated')
        description: Human-readable description
        user: User object (optional)
        metadata: Additional data as dict (optional)
        severity: Log level ('info', 'warning', 'error', 'critical')
    """
    log_data = {
        'event_type': event_type,
        'description': description,
        'timestamp': datetime.utcnow().isoformat(),
        'user_id': user.id if user else None,
        'username': user.username if user else None,
        'metadata': metadata or {}
    }
    
    # Use appropriate log level
    log_method = getattr(logger, severity, logger.info)
    log_method(json.dumps(log_data, default=str))


def log_user_action(action, user, details=None):
    """Log a user action"""
    log_event(
        event_type=f'user_{action}',
        description=f'User {user.username} {action}',
        user=user,
        metadata={'action': action, 'details': details}
    )


def log_crisis_event(alert, action='detected'):
    """Log a crisis-related event"""
    log_event(
        event_type=f'crisis_{action}',
        description=f'Crisis {action}: Alert #{alert.id}',
        user=alert.user,
        metadata={
            'alert_id': alert.id,
            'severity': alert.severity,
            'matched_keywords': alert.matched_keywords,
            'session_id': alert.conversation.session_id if alert.conversation else None
        },
        severity='warning' if alert.severity >= 7 else 'info'
    )


def log_api_access(endpoint, method, user=None, status_code=None, duration_ms=None):
    """Log API endpoint access"""
    log_event(
        event_type='api_access',
        description=f'{method} {endpoint}',
        user=user,
        metadata={
            'endpoint': endpoint,
            'method': method,
            'status_code': status_code,
            'duration_ms': duration_ms
        }
    )


def log_data_access(model_name, action, user, object_id=None, details=None):
    """Log data access (for compliance)"""
    log_event(
        event_type='data_access',
        description=f'{action} {model_name}',
        user=user,
        metadata={
            'model': model_name,
            'action': action,
            'object_id': object_id,
            'details': details
        }
    )

