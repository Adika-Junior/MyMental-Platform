from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from chatbot.models import Message
from compliance.models import DataRetentionPolicy


class Command(BaseCommand):
    help = 'Delete chat messages older than retention policy'

    def handle(self, *args, **options):
        try:
            policy = DataRetentionPolicy.objects.get(data_type='chat_messages')
            days = policy.retention_days
            cutoff = timezone.now() - timedelta(days=days)
        except DataRetentionPolicy.DoesNotExist:
            self.stdout.write(self.style.WARNING('No retention policy for chat_messages; skipping'))
            return

        deleted, _ = Message.objects.filter(created_at__lt=cutoff).delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} old messages'))


