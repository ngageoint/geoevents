# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.contenttypes import generic
from django.contrib.gis import admin
from geoevents.heartbeat.models import Test, TestRun, TestRunResult, run_tests
from geoevents.notes.models import Note


class NoteInline(generic.GenericTabularInline):
    model = Note
    fields = (('title', 'public', 'owner'), 'content',)
    extra = 1


class TestAdmin(admin.ModelAdmin):
    model = Test
    date_hierarchy = 'created'
    list_display = ['__unicode__', 'table', 'urlorfield', 'group']
    list_filter = ['table', 'urlorfield', 'group']
    inlines = [NoteInline]

    def run_test(self, request, queryset):
        n = run_tests(queryset)
        self.message_user(request, '{0} test(s) ran.'.format(len(n)))

    run_test.short_description = 'Run selecected tests'
    actions = [run_test]


class TestRunAdmin(admin.ModelAdmin):
    model = TestRun
    date_hierarchy = 'created'
    list_display = ['__unicode__']


class TestRunResultAdmin(admin.ModelAdmin):
    model = TestRunResult
    date_hierarchy = 'created'
    list_display = ['__unicode__', 'result', 'latency', 'response', 'test_run']
    list_filter = ['result', 'test_run']

admin.site.register(Test, TestAdmin)
admin.site.register(TestRun, TestRunAdmin)
admin.site.register(TestRunResult, TestRunResultAdmin)