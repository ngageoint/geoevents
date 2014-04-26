# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.conf.urls import patterns, url
from django.core.urlresolvers import reverse_lazy
from django.contrib.auth.decorators import permission_required
from django.views.generic import ArchiveIndexView, YearArchiveView, MonthArchiveView, DayArchiveView, DetailView, ListView, RedirectView
from django.views.generic.edit import DeleteView
from geoevents.core.views import CreateViewWithMessages, UpdateViewWithMessages
from geoevents.operations.forms import DeploymentForm, NewDeploymentForm, EventForm, LessonLearnedForm, ServiceForm, SitRepForm
from geoevents.operations.models import Deployment, Event, LessonLearned, SitRep, Service
from geoevents.operations.views import CreateService, EventsDashboard, EventPage, NewDeploymentFromIncident, \
    SitRepCreateView, MustBeOwnerDeleteView, ServiceLists, KMLReponse, DeploymentView
from geoevents.operations.proxies import proxy_to


urlpatterns = patterns('',
                       url(r'^activeEvents/$', EventsDashboard.as_view(), name='active-incidents'),
                       url(r'^incidents/(?P<pk>\d+)/$', EventPage.as_view(), name='operations-view-incident'),
                       url(r'^incidents/(?P<pk>\d+)/(?P<slug>[\w\d\-]+)/$', EventPage.as_view(),
                           name='operations-view-incident-slug'),
                       url(r'^activeEvents/full/$',
                           EventsDashboard.as_view(template_name='event-list-dashboard-fullscreen.html'),
                           name='operations-view-full-dashboard'),
                       url(r'^incidents/full/(?P<pk>\d+)/', EventPage.as_view(template_name='incident-fullscreen.html'),
                           name='operations-view-full-incident'),

                       url(r'^incidents/manage/(?P<pk>\d+)/$',
                           permission_required('operations.change_event', reverse_lazy('home'))(
                               UpdateViewWithMessages.as_view(form_class=EventForm,
                                                              pk_url_kwarg='pk',
                                                              queryset=Event.objects.all(),
                                                              template_name='generic_form_page.html')),
                           name='operations-manage-incident-pk'),

                       url(r'^incidents/manage/$',
                           permission_required('operations.add_event', reverse_lazy('home'))(
                               CreateViewWithMessages.as_view(form_class=EventForm,
                                                              template_name='generic_form_page.html')),
                           name='operations-manage-incident'),

                       url(r'^incidents/archives/$', ArchiveIndexView.as_view(queryset=Event.objects.all(),
                                                                              date_field='created',
                                                                              template_name='incident-archive.html',
                                                                              context_object_name='object_list'),
                           name='operations-view-incident-archive'),

                       url(r'^incidents/archives/(?P<year>\d{4})/$',
                           YearArchiveView.as_view(queryset=Event.objects.all(),
                                                   date_field='created',
                                                   template_name='incident-archive-year.html',
                                                   context_object_name='events'),
                           name='operations-view-incident-archive-year'),

                       url(r'^incidents/archives/(?P<year>\d{4})/(?P<month>\d{2})/$',
                           MonthArchiveView.as_view(queryset=Event.objects.all(),
                                                    date_field='created',
                                                    template_name='incident-archive-month.html',
                                                    month_format='%m'), name='operations-view-incident-archive-month'),

                       url(r'^incidents/archives/(?P<year>\d{4})/(?P<month>\d{2})/(?P<day>\d{2})/$',
                           DayArchiveView.as_view(queryset=Event.objects.all(),
                                                  date_field='created',
                                                  template_name='incident-archive-day.html',
                                                  month_format='%m',
                           ), name='operations-view-incident-archive-day'),

                       url(r'^incidents/delete/(?P<pk>\d+)/$',
                           permission_required('operations.delete_event', reverse_lazy('home'))(
                               DeleteView.as_view(model=Event,
                                                  template_name='generic-delete.html',
                                                  success_url=reverse_lazy('active-incidents'))),
                           name='operations-delete-incident-pk'),

                       url(r'^incidents/kml/(?P<pk>\d+)/$', KMLReponse.as_view(queryset=Event.objects.all(),
                                                                               template_name='incidents.kml',
                                                                               context_object_name='incident'),
                           name='operations-view-incident-kml'),

                       url(r'^deployments/manage/$',
                           permission_required('operations.add_deployment', reverse_lazy('home'))(
                               NewDeploymentFromIncident.as_view(form_class=NewDeploymentForm,
                                                                 template_name='generic_form_page.html')),
                           name='operations-manage-deployment'),
                       url(r'^deployments/manage/(?P<pk>\d+)/$',
                           permission_required('operations.change_deployment', reverse_lazy('home'))(
                               UpdateViewWithMessages.as_view(form_class=DeploymentForm,
                                                              queryset=Deployment.objects.all(),
                                                              template_name='generic_form_page.html',
                                                              pk_url_kwarg='pk',
                               )), name='operations-manage-deployment-pk'),
                       url(r'^deployments/delete/(?P<pk>\d+)/$',
                           permission_required('operations.delete_deployment', reverse_lazy('home'))(
                               DeleteView.as_view(model=Deployment,
                                                  template_name='generic-delete.html',
                                                  success_url=reverse_lazy('home'))),
                           name='operations-delete-deployment-pk'),
                       url(r'^deployments/(?P<pk>\d+)/', DeploymentView.as_view(queryset=Deployment.objects.all(),
                                                                                template_name='deployment-detail.html',
                                                                                context_object_name='item',
                       ), name='operations-view-deployment-pk'),

                       url(r'^lessons-learned/manage/$',
                           permission_required('operations.add_lessonlearned', reverse_lazy('home'))(
                               CreateViewWithMessages.as_view(form_class=LessonLearnedForm,
                                                              template_name='generic_form_page.html',
                               )), name='operations-manage-lesson-learned'),
                       url(r'^lessons-learned/manage/(?P<pk>\d+)/$',
                           permission_required('operations.change_lessonlearned', reverse_lazy('home'))(
                               UpdateViewWithMessages.as_view(form_class=LessonLearnedForm,
                                                              queryset=LessonLearned.objects.all(),
                                                              pk_url_kwarg='pk',
                                                              template_name='generic_form_page.html',
                               )), name='operations-manage-lesson-learned-pk'),
                       url(r'^lessons-learned/(?P<pk>\d+)/', DetailView.as_view(queryset=LessonLearned.objects.all(),
                                                                                template_name='lesson-learned-detail.html',
                                                                                context_object_name='item',
                       ), name='operations-view-lesson-learned-pk'),

                       url(r'^lessons-learned/delete/(?P<pk>\d+)/$',
                           permission_required('operations.delete_lessonlearned', reverse_lazy('home'))(
                               DeleteView.as_view(model=LessonLearned,
                                                  template_name='generic-delete.html',
                                                  success_url=reverse_lazy('home'))),
                           name='operations-delete-lesson-learned-pk'),
                       url(r'sitreps/$', ListView.as_view(queryset=SitRep.objects.filter(status=1),
                                                          template_name='sitreps-list.html',
                                                          paginate_by=25,
                                                          context_object_name='events'),
                           name='operations-view-sitreps'),

                       url(r'^sitreps/(?P<pk>\d+)/', DetailView.as_view(queryset=SitRep.objects.all(),
                                                                        template_name='sitrep-detail.html',
                                                                        context_object_name='item',
                       ), name='operations-view-sitrep-pk'),

                       url(r'^sitreps/manage/$', permission_required('operations.add_sitrep', reverse_lazy('home'))(
                           SitRepCreateView.as_view(form_class=SitRepForm, template_name='generic_form_page.html')),
                           name='operations-manage-sitrep'),
                       url(r'^sitreps/manage/(?P<pk>\d+)/$',
                           permission_required('operations.change_sitrep', reverse_lazy('home'))(
                               UpdateViewWithMessages.as_view(form_class=SitRepForm, template_name='sitrep-manage.html',
                                                              queryset=SitRep.objects.all(), pk_url_kwarg='pk')),
                           name='operations-manage-sitrep-pk'),
                       url(r'^sitreps/delete/(?P<pk>\d+)/$',
                           permission_required('operations.delete_sitrep', reverse_lazy('home'))(
                               MustBeOwnerDeleteView.as_view(model=SitRep, template_name='generic-delete.html',
                                                             owner_field='owner', success_url=reverse_lazy('home'))),
                           name='operations-delete-sitrep-pk'),

                       ## Services
                       url(r'^services/(?P<pk>\d+)/$', 'geoevents.operations.views.view_service',
                           name='operations-view-service'),

                       url(r'^services/manage/(?P<pk>\d+)/$',
                           permission_required('operations.change_service',
                                               reverse_lazy('home'))(
                               UpdateViewWithMessages.as_view(form_class=ServiceForm,
                                                              template_name='service-manage.html',
                                                              queryset=Service.objects.all())),
                           name='operations-manage-service-pk'),

                       url(r'^services/manage/$',
                           permission_required('operations.add_service',
                                               reverse_lazy('home'))(
                               CreateViewWithMessages.as_view(form_class=ServiceForm,
                                                              template_name='service-manage.html',
                               )), name='operations-manage-service'),

                       url(r'^services/manage/(?P<model>\w+)/(?P<model_pk>\d+)/$',
                           permission_required('operations.add_service',
                                               reverse_lazy('home'))(CreateService.as_view()),
                           name='operations-manage-service-model'),


                       url(r'^services/delete/(?P<pk>\d+)/$',
                           permission_required('operations.delete_service', reverse_lazy('home'))(
                               DeleteView.as_view(model=Service,
                                                  template_name='generic-delete.html',
                                                  success_url=reverse_lazy('home'))),
                           name='operations-delete-service-pk'),
                       url(r'^services/$', ServiceLists.as_view(template_name='service-list.html', ),
                           name='operations-view-services'),
                       url(r'^proxy/(?P<path>.*)$', proxy_to, {'target_url': ''}),

                       url(r'^incidents/$', RedirectView.as_view(url=reverse_lazy('active-incidents')), name='home'),

)


