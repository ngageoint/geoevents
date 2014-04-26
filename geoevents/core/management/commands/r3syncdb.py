# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command

class Command(BaseCommand):
    #args = ''
    help = 'Runs a standard syncdb process'

    def handle(self, *args, **options):
        options['migrate']=True
        call_command('syncdb', **options)
        call_command('loaddata', 'sites.site.json')
        call_command('loaddata', 'maps.layer.json')
        call_command('loaddata', 'maps.map.json')
        call_command('loaddata', 'operations.geowidget.json')
        self.stdout.write('Successfully synced the DB\n')
