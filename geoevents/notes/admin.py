# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.gis import admin
from geoevents.notes.models import Note
from datetime import datetime


class NoteAdmin(admin.ModelAdmin):
    model = Note
    date_hierarchy = 'last_updated'
    list_display = ['title', 'owner', 'last_updated', 'public']
    list_filter = ['owner', 'last_updated', 'public']


admin.site.register(Note, NoteAdmin)
