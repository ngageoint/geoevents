# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.auth.models import User
from tastypie.contrib.contenttypes.fields import GenericForeignKeyField
from geoevents.timeline.models import TimelineItem
from tastypie import fields
from tastypie.authorization import Authorization, DjangoAuthorization
from tastypie.resources import ModelResource, Resource, ALL
from geoevents.operations.models import Event
from geoevents.operations.api import EventResource


class TimelineItemResource(ModelResource):
    # The GenericForeignKeyFields allows you to specify the related object
    # via its REST endpoint.  Any support models need to be listed in the
    # dict passed to GenericForeignKeyField
    content_object = GenericForeignKeyField({Event: EventResource, }, 'content_object')

    class Meta:
        queryset = TimelineItem.objects.filter(visible=True)
        resource_name = 'timeline-item'
        authorization = DjangoAuthorization()
        allowed_methods = ['post', 'get']
        always_return_data = True


