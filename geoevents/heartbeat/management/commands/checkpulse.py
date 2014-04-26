# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.core.management.base import BaseCommand
from geoevents.heartbeat.models import Test, TestRun, run_tests


class Command(BaseCommand):
    help = 'Run tests'
    #args = "Test [...]"

    def handle(self, *args, **options):
        n = run_tests(in_test_run=True)
        self.stdout.write('{0} tests ran\n'.format(len(n)))

