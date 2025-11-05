"""
Management command wrapper to run Celery Beat (periodic tasks)
Usage: python manage.py celery_beat
"""
from django.core.management.base import BaseCommand
import subprocess
import sys


class Command(BaseCommand):
    help = 'Start Celery Beat scheduler for periodic tasks'

    def add_arguments(self, parser):
        parser.add_argument(
            '--loglevel',
            type=str,
            default='info',
            help='Logging level (debug, info, warning, error)',
        )

    def handle(self, *args, **options):
        loglevel = options['loglevel']
        
        self.stdout.write(self.style.SUCCESS('Starting Celery Beat...'))
        self.stdout.write(self.style.WARNING('Make sure Redis is running!'))
        
        try:
            # Run celery beat
            subprocess.run([
                sys.executable, '-m', 'celery',
                '-A', 'mymental_backend',
                'beat',
                '--loglevel', loglevel,
            ])
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('\nCelery Beat stopped.'))

