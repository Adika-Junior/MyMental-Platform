"""
WebSocket routing for chatbot
"""
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/chatbot/<str:session_id>/', consumers.ChatConsumer.as_asgi()),
]

