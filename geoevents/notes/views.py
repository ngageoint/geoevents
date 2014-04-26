# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.views.generic.edit import CreateView
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse_lazy
from .forms import NoteForm, NoteFormMinimal
from .models import Note


class NoteCreateView(CreateView):
    '''Displays and processes a view to create new notes without requiring the user to set the content_type or object_id.'''

    model = Note
    form_class = NoteForm

    def form_valid(self, form):
        if self.request.user.is_authenticated():
            form.instance.owner = self.request.user
        else:
            form.instance.owner = User.objects.all()[0]
        if self.kwargs.get('pk'):
            form.instance.object_id = self.kwargs['pk']

        if self.kwargs.get('model'):
            form.instance.content_type = ContentType.objects.get(model=self.kwargs['model'])

        self.valid = super(NoteCreateView, self).form_valid(form)
        return self.valid

    def get(self, request, *args, **kwargs):
        self.object = None

        if self.kwargs.get('pk') and self.kwargs.get('model'):
            self.form_class = NoteFormMinimal
        else:
            self.form_class = NoteForm

        return super(NoteCreateView, self).get(request, *args, **kwargs)

    def get_success_url(self):
        if 'source_url' in self.kwargs:
            success_url = self.kwargs['source_url'] or reverse_lazy('home')
        else:
            success_url = reverse_lazy('home')
        success_url = "/" + str(success_url)
        return success_url



