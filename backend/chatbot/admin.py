from django.contrib import admin
from .models import Conversation, Message, EmotionalCheckIn, Psychoeducation, CrisisKeyword, CrisisAlert, PreSessionQuestionnaire


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'user', 'created_at', 'is_escalated', 'escalated_to')
    list_filter = ('is_escalated', 'created_at')
    search_fields = ('session_id', 'user__username')
    readonly_fields = ('session_id', 'created_at', 'updated_at')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'message_type', 'content_preview', 'created_at')
    list_filter = ('message_type', 'created_at')
    search_fields = ('content', 'conversation__session_id')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(EmotionalCheckIn)
class EmotionalCheckInAdmin(admin.ModelAdmin):
    list_display = ('user', 'mood', 'created_at')
    list_filter = ('mood', 'created_at')
    search_fields = ('user__username', 'notes')


@admin.register(Psychoeducation)
class PsychoeducationAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('title', 'content')


@admin.register(CrisisKeyword)
class CrisisKeywordAdmin(admin.ModelAdmin):
    list_display = ('keyword', 'severity', 'auto_escalate', 'is_active')
    list_filter = ('severity', 'auto_escalate', 'is_active')
    search_fields = ('keyword',)
    list_editable = ('is_active', 'severity', 'auto_escalate')


@admin.register(CrisisAlert)
class CrisisAlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_severity_display', 'status', 'created_at', 'escalated_to')
    list_filter = ('status', 'severity', 'created_at')
    search_fields = ('user__username', 'message', 'matched_keywords')
    readonly_fields = ('created_at', 'acknowledged_at', 'resolved_at')
    fieldsets = (
        ('Alert Information', {
            'fields': ('user', 'conversation', 'message', 'severity', 'matched_keywords', 'status')
        }),
        ('Escalation', {
            'fields': ('escalated_to', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'acknowledged_at', 'resolved_at')
        }),
    )
    
    actions = ['mark_acknowledged', 'mark_resolved']
    
    def mark_acknowledged(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='acknowledged', acknowledged_at=timezone.now())
    mark_acknowledged.short_description = 'Mark selected alerts as acknowledged'
    
    def mark_resolved(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='resolved', resolved_at=timezone.now())
    mark_resolved.short_description = 'Mark selected alerts as resolved'


@admin.register(PreSessionQuestionnaire)
class PreSessionQuestionnaireAdmin(admin.ModelAdmin):
    list_display = ('user', 'mood', 'stress_level', 'has_crisis_history', 'consent_to_contact', 'created_at')
    list_filter = ('stress_level', 'has_crisis_history', 'consent_to_contact', 'created_at')
    search_fields = ('user__username', 'main_concerns', 'goals')
