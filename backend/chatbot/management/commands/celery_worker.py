"""
Management command wrapper to run Celery worker
Usage: python manage.py celery_worker
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
import subprocess
import sys


class Command(BaseCommand):
    help = 'Start Celery worker'

    def add_arguments(self, parser):
        parser.add_argument(
            '--loglevel',
            type=str,
            default='info',
            help='Logging level (debug, info, warning, error)',
        )

    def handle(self, *args, **options):
        loglevel = options['loglevel']
        
        self.stdout.write(self.style.SUCCESS('Starting Celery worker...'))
        self.stdout.write(self.style.WARNING('Make sure Redis is running!'))
        
        try:
            # Run celery worker
            subprocess.run([
                sys.executable, '-m', 'celery',
                '-A', 'mymental_backend',
                'worker',
                '--loglevel', loglevel,
                '--pool', 'solo',  # Use solo pool for Windows/WSL compatibility
            ])
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('\nCelery worker stopped.'))

