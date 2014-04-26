# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import permission_required
from django.core.urlresolvers import reverse_lazy
from django.views.generic.edit import DeleteView, UpdateView

from .views import *
from .models import Report

urlpatterns = patterns('',
                       url(r'^$', DirectorDashboardViewList.as_view(), name='director-dashboards'),
                       url(r'^board/$', DirectorDashboardViewList.as_view(), name='director-dashboards'),
                       url(r'^board/(?P<pk>\d+)/$', 'geoevents.director.views.DirectorDashboardView',
                           name='director-dashboard-view'),
                       url(r'^board/(?P<pk>\d+)/(?P<slug>[\w\d\-]+)/$',
                           'geoevents.director.views.DirectorDashboardView', name='director-dashboard-view-slug'),
                       url(r'^board/(?P<org>\w+)/$', 'geoevents.director.views.DirectorDashboardViewOrg',
                           name='director-dashboard-view-org'),

                       url(r'^rate/(?P<model>\w+)/(?P<pk>\d+)/$', 'geoevents.director.views.SocialRate',
                           name='social-rate'),

                       url(r'^quadchart/(?P<pk>\d+)/$', 'geoevents.director.views.QuadChartView',
                           name='prog-obs-quad-chart'),

                       url(r'^note/new/$', 'geoevents.director.views.NoteNew', name='notes-submit-new'),
                       url(r'^report/new/$', 'geoevents.director.views.ReportNew', name='reports-submit-new'),

                       url(r'^report/link/(?P<pk_report>\d+)/(?P<model>\w+)/(?P<pk_target>\d+)/$',
                           'geoevents.director.views.ReportLink', name='reports-linkage'),
                       url(r'^report/$', ListView.as_view(queryset=Report.objects.filter(public=1),
                                                          template_name='report-list.html',
                                                          paginate_by=25,
                       ), name='reports-view-reports'),
                       url(r'^report/(?P<pk>\d+)/$', DetailView.as_view(queryset=Report.objects.all(),
                                                                        template_name='report.html',
                       ), name='reports-view-report'),
                       url(r'^report/add/$', permission_required('director.add_report', reverse_lazy('home'))(
                           ReportCreateView.as_view(template_name='report-manage.html',
                                                    success_url=reverse_lazy('reports-view-reports'),
                           )), name='reports-manage-report'),
                       url(r'^report/manage/(?P<pk>\d+)/$',
                           permission_required('director.change_report', reverse_lazy('home'))(
                               UpdateView.as_view(queryset=Report.objects.all(),
                                                  form_class=ReportForm,
                                                  template_name='report-manage.html',
                               )), name='reports-manage-report-id'),
                       url(r'^report/delete/(?P<pk>\d+)/$',
                           permission_required('director.delete_report', reverse_lazy('home'))(
                               DeleteView.as_view(model=Report,
                                                  template_name='generic-delete.html',
                                                  success_url=reverse_lazy('reports-view-reports'))
                           ), name='reports-delete-report-id'),


                       url(r'^action/(?P<pk>\d+)/$', DetailView.as_view(queryset=Actions.objects.all(),
                                                                        template_name='report.html',
                       ), name='actions-view-report'),
                       url(r'^action/new/$', 'geoevents.director.views.ActionNew', name='actions-submit-new'),
                       url(r'^action/add/(?P<success_url>.*)$',
                           ActionCreateView.as_view(template_name='report-manage.html', ),
                           name='actions-manage-report-return'),
                       url(r'^action/add/$', permission_required('director.add_actions', reverse_lazy('home'))(
                           ActionCreateView.as_view(template_name='report-manage.html',
                                                    success_url=reverse_lazy('actions-view-reports'),
                           )), name='actions-manage-report'),
                       url(r'^action/manage/(?P<pk>\d+)/$',
                           permission_required('director.change_actions', reverse_lazy('home'))(
                               UpdateView.as_view(queryset=Actions.objects.all(),
                                                  form_class=ActionForm,
                                                  template_name='report-manage.html',
                               )), name='actions-manage-report-id'),

                       url(r'^action/delete/(?P<pk>\d+)/$',
                           permission_required('director.delete_actions', reverse_lazy('home'))(
                               DeleteView.as_view(model=Report,
                                                  template_name='generic-delete.html',
                                                  success_url=reverse_lazy('actions-view-reports'))
                           ), name='actions-delete-report-id'),

                       url(r'^billet/(?P<pk>\d+)/$', DetailView.as_view(queryset=Billet.objects.all(),
                                                                        template_name='report.html',
                       ), name='billets-view-report'),
                       ##    url(r'^billet/new/$', 'geoevents.director.views.BilletNew', name='billets-submit-new'),
                       url(r'^billet/add/$', permission_required('director.add_billet', reverse_lazy('home'))(
                           BilletCreateView.as_view(template_name='report-manage.html',
                                                    success_url=reverse_lazy('billets-view-reports'),
                           )), name='billets-manage-report'),
                       url(r'^billet/manage/(?P<pk>\d+)/$',
                           permission_required('director.change_billet', reverse_lazy('home'))(
                               UpdateView.as_view(queryset=Billet.objects.all(),
                                                  form_class=BilletForm,
                                                  template_name='report-manage.html',
                               )), name='billets-manage-report-id'),
                       url(r'^billet/delete/(?P<pk>\d+)/$',
                           permission_required('director.delete_billet', reverse_lazy('home'))(
                               DeleteView.as_view(model=Report,
                                                  template_name='generic-delete.html',
                                                  success_url=reverse_lazy('billets-view-reports'))
                           ), name='billets-delete-report-id'),


)
