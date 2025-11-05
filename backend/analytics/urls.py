"""
URL configuration for analytics app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('track/', views.TrackActivityView.as_view(), name='track_activity'),
    path('safety-incidents/', views.SafetyIncidentsView.as_view(), name='safety_incidents'),
    path('stats/', views.UsageStatsView.as_view(), name='usage_stats'),
]

