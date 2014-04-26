# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse
from django.test import TestCase, Client
from geoevents.core.tests import R3TestCaseMixin
from geoevents.heartbeat.models import Test
from geoevents.heartbeat.test_cases import HeartBeatTestCase, TwoHundredTestCase
from geoevents.maps.models import Layer


class SimpleTest(R3TestCaseMixin, TestCase):
    fixtures = ['maps.json']

    def setUp(self):
        super(SimpleTest, self).setUp()

        self.delete_in_teardown = []

        self.layer = Layer.objects.create(name='Test Layer', layer='show:0', type='WMS', image_format='image/png',
                                          url='http://www.google.com')
        content_type_id = ContentType.objects.get_for_model(self.layer).id
        layer_content_type = ContentType.objects.get(id=content_type_id)
        self.failure = Test.objects.create(name='Failure', type_of_test='200 Test', urlorfield='')
        self.google = Test.objects.create(name='Known url', type_of_test='200 Test', urlorfield='http://www.google.com')
        self.layer_test = Test.objects.create(name='Layer', type_of_test='200 Test', urlorfield='url',
                                              table=layer_content_type, object_id=self.layer.id)
        map(self.delete_in_teardown.append, [self.google, self.failure, self.layer, self.layer_test])

    def test_active_incidents(self):
        """Test if the status page renders."""
        c = Client()
        response = c.get(reverse('heartbeat-view-status'))
        self.failUnlessEqual(response.status_code, 200)

    def test_known_200(self):
        """Test that a call to a known location returns 200 response."""
        tc = TwoHundredTestCase(self.google)
        self.assertTrue(tc.test_2xx().result)

    def test_content_type(self):
        """Test that a test case with a generic content type returns a 200 response."""
        tc = TwoHundredTestCase(self.layer_test)
        self.assertTrue(tc.test_2xx().result)

    def test_payload(self):
        tc = TwoHundredTestCase(self.google)
        self.assertNotEquals(tc.test_2xx().payload, '')

    def test_known_error(self):
        """Test that a call to a known location returns 200 response."""
        tc = TwoHundredTestCase(self.failure)
        self.assertFalse(tc.test_2xx().result)

    def tearDown(self):
        for obj in self.delete_in_teardown:
            obj.delete()
