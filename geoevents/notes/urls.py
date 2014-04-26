# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import permission_required
from django.core.urlresolvers import reverse_lazy
from geoevents.common import menu
from .forms import NoteForm, NoteFormMinimal
from .models import Note
from .views import NoteCreateView
from django.views.generic.edit import DeleteView, UpdateView
from django.views.generic import ListView, DetailView

#permission_required('operations.change_lessonlearned', reverse_lazy('home'))(update_object)

urlpatterns = patterns('',
                       url(r'^$', ListView.as_view(queryset=Note.objects.filter(public=1),
                                                   template_name='note-list.html',
                                                   paginate_by=25,
                       ), name='notes-view-notes'),

                       url(r'^(?P<pk>\d+)/$', DetailView.as_view(queryset=Note.objects.all(),
                                                                 template_name='note.html',
                       ), name='notes-view-note'),

                       url(r'^manage/$', (NoteCreateView.as_view(template_name='note-manage.html',
                                                                 success_url=reverse_lazy('notes-view-notes'),
                       )), name='notes-manage-note'),

                       url(r'^manage/(?P<pk>\d+)/$', (UpdateView.as_view(queryset=Note.objects.all(),
                                                                         form_class=NoteForm,
                                                                         template_name='note-manage.html',
                       )), name='notes-manage-note-id'),

                       url(r'^manage/(?P<model>\w+)/(?P<pk>\d+)/(?P<source_url>.*)$',
                           (NoteCreateView.as_view(template_name='note-manage.html',
                                                   form_class=NoteFormMinimal)),
                           name='notes-manage-note-model-id',
                       ),

                       url(r'^manage/(?P<model>\w+)/(?P<pk>\d+)/$',
                           (NoteCreateView.as_view(template_name='note-manage.html',
                                                   success_url=reverse_lazy('notes-view-notes'),
                                                   form_class=NoteFormMinimal)),
                           name='notes-manage-note-model-id',
                       ),


                       url(r'^delete/(?P<pk>\d+)/$',
                           permission_required('notes.delete_note', reverse_lazy('home'))(DeleteView.as_view(model=Note,
                                                                                                             template_name='generic-delete.html',
                                                                                                             success_url=reverse_lazy('notes-view-notes'))
                           ), name='notes-delete-note-id'),
)
