"""
Management command to seed initial crisis keywords
Run with: python manage.py seed_crisis_keywords
"""
from django.core.management.base import BaseCommand
from chatbot.models import CrisisKeyword


class Command(BaseCommand):
    help = 'Seed initial crisis keywords for detection'

    def handle(self, *args, **options):
        # Critical keywords (Severity 9-10, auto-escalate)
        critical_keywords = [
            {'keyword': 'suicide', 'severity': 10, 'auto_escalate': True},
            {'keyword': 'kill myself', 'severity': 10, 'auto_escalate': True},
            {'keyword': 'end my life', 'severity': 10, 'auto_escalate': True},
            {'keyword': 'want to die', 'severity': 10, 'auto_escalate': True},
            {'keyword': 'going to kill myself', 'severity': 10, 'auto_escalate': True},
            {'keyword': 'take my own life', 'severity': 10, 'auto_escalate': True},
            {'keyword': 'self harm', 'severity': 9, 'auto_escalate': True},
            {'keyword': 'cut myself', 'severity': 9, 'auto_escalate': True},
            {'keyword': 'hurt myself', 'severity': 9, 'auto_escalate': True},
            {'keyword': 'self injury', 'severity': 9, 'auto_escalate': True},
        ]
        
        # High severity keywords (Severity 7-8)
        high_keywords = [
            {'keyword': 'no reason to live', 'severity': 8, 'auto_escalate': True},
            {'keyword': 'nothing matters', 'severity': 8, 'auto_escalate': True},
            {'keyword': 'everyone would be better', 'severity': 8, 'auto_escalate': True},
            {'keyword': 'world be better without me', 'severity': 8, 'auto_escalate': True},
            {'keyword': 'hopeless', 'severity': 7, 'auto_escalate': False},
            {'keyword': 'no way out', 'severity': 7, 'auto_escalate': False},
            {'keyword': 'trapped', 'severity': 7, 'auto_escalate': False},
        ]
        
        # Medium severity keywords (Severity 5-6)
        medium_keywords = [
            {'keyword': 'depressed', 'severity': 6, 'auto_escalate': False},
            {'keyword': 'helpless', 'severity': 6, 'auto_escalate': False},
            {'keyword': 'worthless', 'severity': 6, 'auto_escalate': False},
            {'keyword': 'overwhelmed', 'severity': 5, 'auto_escalate': False},
            {'keyword': "can't cope", 'severity': 5, 'auto_escalate': False},
            {'keyword': 'give up', 'severity': 5, 'auto_escalate': False},
            {'keyword': 'feeling empty', 'severity': 5, 'auto_escalate': False},
        ]
        
        all_keywords = critical_keywords + high_keywords + medium_keywords
        created_count = 0
        updated_count = 0
        
        for kw_data in all_keywords:
            keyword_obj, created = CrisisKeyword.objects.get_or_create(
                keyword=kw_data['keyword'],
                defaults={
                    'severity': kw_data['severity'],
                    'auto_escalate': kw_data['auto_escalate'],
                    'is_active': True
                }
            )
            
            if not created:
                # Update existing keyword
                keyword_obj.severity = kw_data['severity']
                keyword_obj.auto_escalate = kw_data['auto_escalate']
                keyword_obj.is_active = True
                keyword_obj.save()
                updated_count += 1
            else:
                created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully seeded crisis keywords: {created_count} created, {updated_count} updated'
            )
        )

