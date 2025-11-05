"""
URL configuration for mymental_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def health_check(request):
    """Simple health check endpoint for load balancers and monitoring"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'mymental_backend',
        'version': '1.0.0'
    })

from .monitoring import health_check, metrics_endpoint, uptime_endpoint

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('metrics/', metrics_endpoint, name='metrics'),
    path('uptime/', uptime_endpoint, name='uptime'),
    path('api/users/', include('users.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    path('api/counselor/', include('counselor.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/compliance/', include('compliance.urls')),
    path('graphql/', include('graphene_django.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
