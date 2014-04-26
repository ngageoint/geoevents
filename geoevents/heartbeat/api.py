# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from tastypie import fields
from tastypie.authorization import Authorization
from tastypie.resources import ModelResource, Resource, ALL, ALL_WITH_RELATIONS
from geoevents.heartbeat.models import TestRunResult, TestRun


class TestRunResultsResource(Resource):
    class Meta:
        queryset = TestRunResult.objects.all()
        resource_name = 'test-run-result'


class TestRunResource(ModelResource):
    testrunresults = fields.ToOneField(TestRunResultsResource, 'testrun')

    class Meta:
        try:
            queryset = TestRun.objects.all().order_by('-created')[0]
        except IndexError:
            queryset = []

        resource_name = 'test-run-result'
        authorization = Authorization()
        allowed_methods = ['get']
