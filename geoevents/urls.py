# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.core.urlresolvers import reverse_lazy
from django.views.generic import RedirectView
from geoevents.views import UserPermsUpdate
from geoevents.core.api import UserResource
from geoevents.maps.api import LayerResource, MapResource, MapLayerResource
from geoevents.operations.api import EventResource, EventTypesResource, LessonLearnedResource
from geoevents.timeline.api import TimelineItemResource
from geoevents.views import UserPermsUpdate
from tastypie.api import Api

admin.autodiscover()

v1_api = Api(api_name='v1')
v1_api.register(EventResource())
v1_api.register(LessonLearnedResource())
v1_api.register(LayerResource())
v1_api.register(MapLayerResource())
v1_api.register(MapResource())
v1_api.register(TimelineItemResource())
v1_api.register(UserResource())
v1_api.register(EventTypesResource())

urlpatterns = patterns(
    '',
    url(r'^/?', include('geoevents.operations.urls')),
    url(r'^/?$', RedirectView.as_view(url=reverse_lazy('active-incidents')), name='home'),
    url(r'^service-type/(?P<name>[\w]+)/$', 'geoevents.operations.views.service_type', name='view-service-type'),
    url(r'^service-types/$', 'geoevents.operations.views.service_types', name='view-service-types'),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/login/$', 'django.contrib.auth.views.login', name='login'),
    url(r'^accounts/logout/$', 'geoevents.views.logout', name='logout'),
    url(r'^users/(?P<username>[\w\d\.@+-_\'\s]+)/$', UserPermsUpdate.as_view(), name='user-profile'),
    url(r'^api/', include(v1_api.urls), name='api-root'),
    url(r'^notes/', include('geoevents.notes.urls')),
    url(r'^services/$', 'geoevents.operations.views.view_services', name='operations-view-services'),
    url(r'^feedback/', include('geoevents.feedback.urls')),
    url(r'^tinymce/', include('tinymce.urls')),
    url(r'^timeline/', include('geoevents.timeline.urls')),
    url(r'^director/', include('geoevents.director.urls')),
)