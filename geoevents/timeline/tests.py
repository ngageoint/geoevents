# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""
import json
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse
from django.test import TestCase
from django.test.client import Client
from django.test.utils import override_settings
from geoevents.core.tests import R3TestCaseMixin
from geoevents.operations.models import Event
from geoevents.timeline.forms import TimelineItemForm
from geoevents.timeline.models import TimelineItem


@override_settings(AUTHENTICATION_BACKENDS=('django.contrib.auth.backends.ModelBackend',))
class SimpleTest(R3TestCaseMixin, TestCase):
    fixtures = ['maps.json']

    def setUp(self):
        super(SimpleTest, self).setUp()

        self.event = Event.objects.create(name='Hurricane Sandy',
                                          event_location='United States',
                                          description='This is a test incident',
                                          posture='Deployed',
                                          poc='Red Team',
                                          event_type='Hurricane_Cyclone',
                                          longitude=-74.4,
                                          latitude=38.8,
                                          tags='hurricane, sandy, test'
        )

        self.timelineitem_data_api = {'start': '2013-01-18 18:20',
                                      'end': '2013-01-29 18:20',
                                      'content': 'Testing',
                                      'content_object': reverse('api_dispatch_list', args=['v1', 'event']).format(
                                          self.event.id)}

        self.timelineitem_data = {'start': '2013-01-18 18:20',
                                  'end': '2013-01-29 18:20',
                                  'content': 'Testing',
                                  #'object_id':self.event.id,
                                  #'content_type': ContentType.objects.get_for_model(Event).id,
                                  'content_object': self.event}

    def test_timelineitem_data_is_valid(self):
        f = TimelineItemForm(self.timelineitem_data)
        self.assertTrue(f.is_valid())

    def test_post_timeline_returns_401(self):
        '''Test a post to the timeline api returns a 401 if the user is not logged in'''
        c = Client()
        response = c.post(
            '{0}?format=json'.format(reverse('api_dispatch_list', args=[self.current_api_version, 'timeline-item'])),
            json.dumps(self.timelineitem_data_api), content_type='application/json')
        self.assertEqual(response.status_code, 401)

    def test_post_timeline_data(self):
        '''Test a post to the timeline api creates an object when user has appropriate perms'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.post(
            '{0}?format=json'.format(reverse('api_dispatch_list', args=[self.current_api_version, 'timeline-item'])),
            json.dumps(self.timelineitem_data_api), content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def tearDown(self):
        self.event.delete()
        self.admin_user.delete()
        self.non_admin_user.delete()
