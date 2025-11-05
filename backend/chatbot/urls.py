"""
URL configuration for chatbot app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.start_conversation, name='start_conversation'),
    path('send/', views.send_message, name='send_message'),
    path('<str:session_id>/', views.get_conversation, name='get_conversation'),
    path('list/', views.list_conversations, name='list_conversations'),
    path('check-in/create/', views.create_check_in, name='create_check_in'),
    path('check-in/list/', views.get_check_ins, name='get_check_ins'),
    path('alerts/', views.list_crisis_alerts, name='list_crisis_alerts'),
    path('alerts/<int:alert_id>/acknowledge/', views.acknowledge_alert, name='acknowledge_alert'),
    path('escalated/', views.list_escalated_conversations, name='list_escalated_conversations'),
    path('counselor/<str:session_id>/', views.get_conversation_for_counselor, name='get_conversation_for_counselor'),
    path('counselor/<str:session_id>/summary/', views.generate_summary, name='generate_summary'),
    # Psychoeducation
    path('psychoeducation/', views.list_psychoeducation, name='list_psychoeducation'),
    path('psychoeducation/<int:pk>/', views.get_psychoeducation, name='get_psychoeducation'),
    path('psychoeducation/category/<str:category>/', views.list_psychoeducation_by_category, name='list_psychoeducation_by_category'),
    # Search
    path('search/', views.search, name='search'),
    # Anonymous chat
    path('anon/start/', views.anon_start_conversation, name='anon_start_conversation'),
    path('anon/send/', views.anon_send_message, name='anon_send_message'),
    # Reporting & moderation
    path('report/', views.report_message, name='report_message'),
    path('reports/', views.list_reports, name='list_reports'),
    path('reports/<int:report_id>/handle/', views.handle_report, name='handle_report'),
    # Pre-therapy questionnaire
    path('questionnaire/submit/', views.submit_pre_session_questionnaire, name='submit_pre_session_questionnaire'),
    path('questionnaire/my/', views.list_my_questionnaires, name='list_my_questionnaires'),
    # Notifications
    path('notifications/register/', views.register_device, name='register_device'),
    path('notifications/unregister/', views.unregister_device, name='unregister_device'),
    path('notifications/devices/', views.list_devices, name='list_devices'),
    path('notifications/test/', views.send_test_notification, name='send_test_notification'),
    path('notifications/preferences/', views.get_notification_preferences, name='get_notification_preferences'),
    path('notifications/preferences/update/', views.update_notification_preferences, name='update_notification_preferences'),
    path('notifications/deactivate/', views.deactivate_device, name='deactivate_device'),
]

