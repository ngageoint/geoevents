# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib import messages
from django.core import serializers
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, DeleteView
from geoevents.common import menu, paginate
from geoevents.core.views import CreateViewWithMessages, PageHeaderMixin, UpdateViewWithMessages
from geoevents.core.models import Setting
from geoevents.maps.models import Map
from geoevents.operations.forms import EventForm, ServiceForm, LessonLearnedBasicForm
from geoevents.operations.models import Event, Deployment, Service, ServiceType, SitRep
from geoevents.timeline.forms import TimelineItemForm


class FormParametersFromGetParamsMixin(object):
    """
    This mixin sets the initial value of the event field based on the event url parameter
    """

    def set_initial_params(self):
        n = {}
        object_keys = None

        if self.form_class:
            object_keys = self.form_class.base_fields.keys()
        elif self.model:
            object_keys = [f.name for f in self.model._meta.fields]

        for k, v in self.request.GET.items():
            if k in object_keys:
                n[k] = v

        return n

    def get(self, request, *args, **kwargs):
        self.initial = self.set_initial_params()
        self.object = None
        return super(FormParametersFromGetParamsMixin, self).get(request, *args, **kwargs)


class EventPage(DetailView):
    """
    View used for Event detail views.
    """
    template_name = 'incident-detail.html'
    model = Event
    context_object_name = 'item'

    def get_context_data(self, **kwargs):
        cv = super(EventPage, self).get_context_data(**kwargs)
        cv['lesson_learned_form'] = LessonLearnedBasicForm
        cv['timeline_item_form'] = TimelineItemForm
        return cv


class EventsDashboard(ListView):
    context_object_name = 'items'
    model = Event
    paginate_by = 25
    template_name = 'events-list-dashboard.html'
    queryset = Event.active_objects.all().order_by('name')

    try:
        map = Map.objects.get(title='Dashboard')
    except:
        try:
            map = Map.objects.get(title='Base Map')
        except:
            map = None

    def get_context_data(self, **kwargs):
        cv = super(EventsDashboard, self).get_context_data(**kwargs)
        cv['map'] = self.map
        cv['active_deployments'] = Deployment.active_objects.all()
        cv['latest_sitreps'] = SitRep.objects.all().order_by('-created')[:5]
        low_priority_events = ['exercise', 'special event']
        page_categories = ['monitoring', 'low_priority_events', 'active']

        for category in page_categories:
            cv[category] = []

        def categorize(i):
            if i.posture.lower() == 'monitoring' and i.event_type.lower() not in low_priority_events:
                cv['monitoring'].append(i)
            elif i.event_type.lower() in low_priority_events:
                cv['low_priority_events'].append(i)
            else:
                cv['active'].append(i)

        map(categorize, self.object_list)
        return cv


class SitRepCreateView(CreateViewWithMessages):
    def form_valid(self, form):
        form.instance.owner = self.request.user
        return super(SitRepCreateView, self).form_valid(form)


#TODO: Write test cases for MustBeOwnerDeleteView
class MustBeOwnerDeleteView(DeleteView):
    """
    Only allows the owner of an object, or a superuser to delete a record.  The "owner" field can be passed in through owner_field variable.
    """
    owner_field = 'owner'

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        if (request.user == self.object.__getattribute__(self.owner_field) or self.request.user.is_superuser):
            self.object.delete()
            return HttpResponseRedirect(self.get_success_url())
        else:
            raise PermissionDenied


class NewDeploymentFromIncident(PageHeaderMixin, FormParametersFromGetParamsMixin, CreateView):
    """
    Sets the initial value of the event field based on the event url parameter.
    """
    page_header = 'Create Deployment'


class ServiceLists(ListView):
    paginate_by = 25
    model = Service
    context_object_name = 'items'
    allow_empty = True


    def get_queryset(self):
        kwargs = {}
        fields = [f.name for f in self.model._meta.fields]
        exclude_fields = []

        def filter_fields(f):
            '''Returns True if the name of the field is in the GET parameter'''
            return True if (f in self.request.GET and f not in exclude_fields) else False

        if 'event' in self.request.GET:
            kwargs['event__id__exact'] = self.request.GET.get('event')

        object_keys = filter(filter_fields, fields)

        for k in object_keys:
            kwargs[k] = self.request.GET.get(k)

        return Service.objects.filter(**kwargs)


class CreateService(CreateViewWithMessages):
    form_class = ServiceForm
    template_name = 'service-manage.html'

    def form_valid(self, form):
        self.object = form.save()

        if self.kwargs.get('model') and self.kwargs.get('model_pk'):
            e = Event.objects.get(id=self.kwargs.get('model_pk'))
            e.services.add(self.object)
            e.save()

        return super(CreateService, self).form_valid(form)

    def get_context_data(self, **kwargs):
        cv = super(CreateService, self).get_context_data(**kwargs)
        cv['model'] = self.kwargs['model']
        return cv


class KMLReponse(DetailView):
    def render_to_response(self, context, **response_kwargs):
        return super(KMLReponse, self).render_to_response(
            context,
            mimetype='application/vnd.google-earth.kml+xml',
            **response_kwargs)


class DeploymentView(DetailView):
    try:
        map = Map.objects.get(title='Base Map')
    except:
        map = None

    def get_context_data(self, **kwargs):
        cv = super(DeploymentView, self).get_context_data(**kwargs)
        cv['map'] = self.map
        return cv


def service_type(request, name):
    service_type = ServiceType.objects.filter(name__iexact=name).get()

    if not service_type: return Http404

    return HttpResponse(service_type.description)


def service_types(request):
    x = serializers.serialize("json", ServiceType.objects.all())
    return HttpResponse(x)


def view_service(request, pk):
    service = get_object_or_404(Service, pk=pk)
    return render_to_response('service-detail.html', {'menu_items': menu('Services'), 'item': service},
                              RequestContext(request))


def view_services(request):
    services_list = Service.objects.all()
    services = paginate(services_list, 50, request.GET.get('page'))

    return render_to_response('service-list.html', {'menu_items': menu('Services'), 'items': services},
                              RequestContext(request))

