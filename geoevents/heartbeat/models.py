# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from datetime import datetime
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic
from django.db import models
from geoevents.heartbeat.test_cases import tests, get_test
from geoevents.notes.models import Note

TESTS = [(k, k) for k, v in tests.items()]
GROUPS = [(n, n) for n in sorted(['Services', 'Apps', 'Data Layers'])]
TEST_RESULT_CHOICES = [(n, n) for n in sorted(['OK', 'ISSUE'])]


class Base(models.Model):
    created = models.DateTimeField(auto_now_add=True, verbose_name="Date Created")
    last_updated = models.DateTimeField(auto_now=True, null=True)
    status = models.IntegerField(max_length=1, choices=[(1, 'Active'), (0, 'Inactive')], default=1, blank=True,
                                 null=True)
    closed = models.DateTimeField(verbose_name="Date Closed", blank=True, null=True)

    def notes(self):
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id)

    def save(self, *args, **kwargs):
        if self.status == 1 and self.closed:
            self.closed = None
        elif self.status == 0 and self.closed is None:
            self.closed = datetime.now()

        super(Base, self).save(*args, **kwargs)

    class Meta:
        abstract = True


class Test(Base):
    """
    Generic test objects
    """
    name = models.CharField(max_length=75)
    table = models.ForeignKey(ContentType, null=True, blank=True,
                              help_text='Use this to pull a link dynamically from another table.')
    object_id = models.PositiveIntegerField(null=True, blank=True, help_text='The record id from another table.')
    content_object = generic.GenericForeignKey('table', 'object_id')
    type_of_test = models.CharField(max_length=75, choices=TESTS)
    urlorfield = models.CharField(max_length=1000, verbose_name='Url or Field Name',
                                  help_text='A URL or field name containing the url in the related object')
    group = models.CharField(max_length=75, choices=GROUPS)

    def __unicode__(self):
        return '{0}- {1}'.format(self.name, self.type_of_test)

    def run(self, test_run=None):
        t = get_test(self.type_of_test)(self)  # assumes the test case exists
        out = t.run()
        result = 'OK' if t.successful else 'ISSUE'
        latency = max(t.latencies) if t.latencies else 0
        response = t.responses

        try:
            TestRunResult.objects.create(test=self, test_run=test_run, result=result, latency=latency,
                                         response=response)
        except:
            #database error: try without latency
            result = 'ISSUE'
            response = 'Exception thrown when saving the TestRunResult object'
            TestRunResult.objects.create(test=self, test_run=test_run, result=result, latency=0, response=response)
        return out

    class Meta(Base.Meta):
        unique_together = ('table', 'object_id', 'type_of_test', 'urlorfield' )
        ordering = ['-created']


class TestRun(models.Model):
    """
    Organizes several test run results into a unique test run
    """
    created = models.DateTimeField(auto_now_add=True)
    tests = models.ManyToManyField(Test)

    def __unicode__(self):
        return 'Test Run #{0}'.format(self.id)


class TestRunResult(models.Model):
    """
    Stores data from a single test run
    """
    test = models.ForeignKey(Test)
    test_run = models.ForeignKey(TestRun, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True, verbose_name="Date Created")
    result = models.CharField(max_length=75, choices=TEST_RESULT_CHOICES)
    latency = models.DecimalField(max_digits=15, decimal_places=3, help_text='Response time in milliseconds')
    response = models.TextField(null=True, blank=True)  # extra field

    def __unicode__(self):
        return '{0} {1}'.format(self.test, self.result)

    class Meta:
        ordering = ['-created', 'test']


def run_tests(queryset=Test.objects.filter(status=1), in_test_run=False):
    """
    Creates and executes a test(s) based on a queryset of Tests.
    """

    results = []

    if in_test_run:
        tr = TestRun.objects.create()

    for t in queryset:
        print 'Running test {0}'.format(t.name)
        r = t.run(test_run=tr if in_test_run else None)
        print 'Results: ', r, '\n'
        results.append(r)

    return results