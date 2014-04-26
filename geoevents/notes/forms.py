# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.forms import ModelForm
from geoevents.notes.models import Note


class NoteForm(ModelForm):
    class Meta:
        model = Note
        exclude = ('owner')


class NoteFormMinimal(ModelForm):
    class Meta:
        model = Note
        exclude = ('owner', 'content_type', 'object_id')
