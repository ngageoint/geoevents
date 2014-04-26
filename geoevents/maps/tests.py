# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

import json
from django.test import TestCase
from django.test.utils import override_settings
from geoevents.core.tests import R3TestCaseMixin
from geoevents.maps.models import Layer, Map


@override_settings(AUTHENTICATION_BACKENDS=('django.contrib.auth.backends.ModelBackend',))
class SimpleTest(R3TestCaseMixin, TestCase):
    fixtures = ['maps.json']

    def setUp(self):
        super(SimpleTest, self).setUp()
        self.lyr = Layer.objects.create(name='Test', type='WMS', url='http://geoint.nrlssc.navy.mil/nrltileserver/wms',
                                        image_format='image/png')

    def test_get_layer_params_returns_null(self):
        """
        Tests if the get_layer_params returns an empty dict if no params are present
        """
        self.assertDictEqual(dict(), self.lyr.get_layer_params())
        self.lyr.layer_params = '{"type":"WMS"}'
        self.assertDictEqual(dict(), self.lyr.get_layer_params())

    def test_get_layer_params_returns_value(self):
        """
        Tests if the get_layer_params returns a dict if params are present
        """
        d = '{"token":"this-is-a-test"}'
        self.lyr.layer_params = '{"token":"this-is-a-test"}'
        self.assertDictEqual(json.loads(d), self.lyr.get_layer_params())

    def test_get_layer_url(self):
        """
        Ensures the layer's get_layer_url method returns the correct data.
        """
        self.assertEqual(self.lyr.get_layer_urls(), [self.lyr.url])
        self.lyr.additional_domains = 'http://www.test.com'
        self.assertEqual(self.lyr.get_layer_urls(), [self.lyr.url, self.lyr.additional_domains])

    def test_base_map_exists(self):
        """
        Tests if the Base Map exists.
        """

        self.assertIsNotNone(Map.objects.filter(title='Base Map'))


