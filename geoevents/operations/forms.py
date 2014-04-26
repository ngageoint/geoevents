# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from datetime import datetime, timedelta
from django import forms
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils._os import safe_join
from geoevents.core.forms import StyledModelForm
from geoevents.maps.models import Map
from geoevents.operations.models import Service, Event, Deployment, LessonLearned, SitRep


class DeploymentForm(StyledModelForm):
    class Meta:
        exclude = ('point', 'closed')
        model = Deployment


class NewDeploymentForm(DeploymentForm):
    def __init__(self, *args, **kwargs):
        super(NewDeploymentForm, self).__init__(*args, **kwargs)

        self.fields['event'].queryset = Event.objects.filter(status=1)
        self.fields['deployers'].queryset = User.objects.filter(is_active=True).order_by('username')


class EventForm(StyledModelForm):
    def __init__(self, *args, **kwargs):
        super(EventForm, self).__init__(*args, **kwargs)
        self.fields['map'].initial = Map.objects.filter(title='Base Map').get()

    class Meta:
        exclude = ['point', 'slug', 'closed']
        model = Event


class ServiceForm(StyledModelForm):
    form_title = 'test'

    class Meta:
        model = Service


class LessonLearnedBasicForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(LessonLearnedBasicForm, self).__init__(*args, **kwargs)
        self.fields['description'].label = ''
        self.fields['name'].label = ''

    class Meta:
        fields = (['name', 'description'])
        model = LessonLearned
        widgets = {
        'description': forms.Textarea(attrs={'style': 'width:95%', 'placeholder': 'Enter the lesson learned here.  '}),
        'name': forms.TextInput(attrs={'style': 'width:95%', 'placeholder': 'Enter a title here.  '}), }


class LessonLearnedForm(StyledModelForm):
    def __init__(self, *args, **kwargs):
        super(LessonLearnedForm, self).__init__(*args, **kwargs)

        self.fields['event'].queryset = Event.objects.filter(
            Q(closed__gte=datetime.now() + timedelta(days=-90)) | Q(status=1))
        ## Filter event dropdown to show events closed w/in the last 90 days and active incidents

    class Meta:
        exclude = ('closed', 'submitted_by')
        order = ['name']
        model = LessonLearned
        widgets = {'due': forms.DateTimeInput(attrs={'class': 'date-pick'}), }


class SitRepForm(StyledModelForm):
    def __init__(self, *args, **kwargs):
        super(SitRepForm, self).__init__(*args, **kwargs)
        self.fields['event'].queryset = Event.objects.filter(status=1)
        ## Filter event dropdown to show active events

    class Meta:
        exclude = ('date_closed')
        fields = ['name', 'content', 'event']
        model = SitRep
        widgets = {'name': forms.TextInput(attrs={'placeholder': 'Title of SitRep'}),
        }