# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.auth.models import User
from geoevents.operations.models import Event, EventTypes, LessonLearned
from tastypie import fields
from tastypie.authorization import Authorization, DjangoAuthorization
from tastypie.resources import Resource, ALL
from tastypie.contrib.gis.resources import ModelResource


class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'


class EventResource(ModelResource):
    class Meta:
        queryset = Event.objects.filter()
        resource_name = 'event'
        authorization = Authorization()
        allowed_methods = ['get', 'post', 'put', 'patch']
        always_return_data = True
        filtering = {
            'status': ALL,
            'point': ALL,
        }


class OnCallResource(Resource):
    '''Resource that returns the on call team'''

    on_call = fields.CharField(attribute='on_call')

    class Meta:
        resource_name = 'poc'
        authorization = Authorization()
        allowed_methods = ['get']


class LessonLearnedResource(ModelResource):
    submitted_by = fields.ToOneField(UserResource, 'submitted_by')

    class Meta:
        queryset = LessonLearned.objects.filter()
        resource_name = 'lesson-learned'
        authorization = DjangoAuthorization()
        allowed_methods = ['post']
        always_return_data = True

    def hydrate_submitted_by(self, bundle):
        bundle.data['submitted_by'] = bundle.request.user
        return bundle


class dict2obj(object):
    """
    Convert dictionary to object
    @source http://stackoverflow.com/a/1305561/383912
    """

    def __init__(self, d=None):
        self.__dict__['d'] = d

    def __getattr__(self, key):
        value = self.__dict__['d'][key]
        if type(value) == type({}):
            return dict2obj(value)

        return value


class EventTypesResource(Resource):
    '''Resource that returns a hardcoded list of event (disaster) types from models.py'''
    event_types = fields.ListField(attribute='event_types')

    class Meta:
        object_class = dict2obj
        resource_name = 'event-types'
        authorization = Authorization()
        allowed_methods = ['get']

    def obj_get_list(self, bundle=None, **kwargs):
        return [dict2obj(EventTypes.types)]