# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.contenttypes import generic
from django.contrib.gis import admin
from .models import *
from geoevents.notes.models import Note


class NoteInline(generic.GenericStackedInline):
    model = Note
    fields = (('title', 'public', 'owner'), 'content',)
    extra = 1


class DashboardWidgetsInline(admin.StackedInline):
    model = DashboardWidgets
    extra = 1

    normal_fields = (('order', 'widget', 'width', 'height',), 'dashboard',)
    advanced_fields = ('data_json_org',)
    fieldsets = (
        (None, {'fields': normal_fields}),
        ('Advanced Settings', {'classes': ('collapse',),
                               'description': 'The settings below are advanced.',
                               'fields': advanced_fields,
                               }))


class ProgramObservationInline(admin.StackedInline):
    model = ProgramObservation
    extra = 1

    normal_fields = (('entered_by', 'rating_count'), (
        'metric_overall', 'trend_overall', 'metric_cost', 'trend_cost', 'metric_schedule', 'trend_schedule',
        'metric_performance', 'trend_performance',), )
    advanced_fields = (
        'classification', 'pm_observation', 'summary_overall', 'summary_cost', 'budget_cost', 'execution_cost',
        'funds_cost', 'summary_schedule', 'summary_performance', 'issues_performance', 'risk_performance',)
    fieldsets = (
        (None, {'fields': normal_fields}),
        ('Detailed Descriptions', {'classes': ('collapse',),
                                   'description': 'Details of the above ratings.',
                                   'fields': advanced_fields,
                                   }))


class LinkInline(admin.StackedInline):
    model = Link
    extra = 1

    normal_fields = (('title', 'category', 'rating_count'),)
    advanced_fields = ('details', 'technical_poc', 'url', 'color', 'icon',)
    fieldsets = (
        (None, {'fields': normal_fields}),
        ('Advanced Settings', {'classes': ('collapse',),
                               'description': 'The settings below are advanced.',
                               'fields': advanced_fields,
                               }))


class ReportAdmin(admin.ModelAdmin):
    model = Report
    date_hierarchy = 'last_updated'
    list_display = ['title', 'owner', 'last_updated', 'public', ]
    list_filter = ['title', 'owner', 'last_updated', 'public']
    inlines = [NoteInline, ]


class LinkAdmin(admin.ModelAdmin):
    model = Link
    list_display = ['title', 'category', 'rating_count', 'url', ]
    inlines = [NoteInline, ]


class ProgramInfoAdmin(admin.ModelAdmin):
    model = ProgramInfo
    list_display = ['name', 'government_pm', ]
    inlines = [ProgramObservationInline, NoteInline, ]


class ProgramGroupAdmin(admin.ModelAdmin):
    model = ProgramGroup
    list_display = ['name', ]
    inlines = [NoteInline, ]


class ProgramObservationAdmin(admin.ModelAdmin):
    model = ProgramObservation
    list_display = ['program_name', 'observation_entered', 'entered_by', ]

    def program_name(self, instance):
        return instance.program.name


class DirectorDashboardAdmin(admin.ModelAdmin):
    model = DirectorDashboard
    list_display = ['org', 'name', 'owner', 'tags']
    save_as = True
    inlines = [DashboardWidgetsInline, ]

    normal_fields = (('org', 'name'), 'owner', 'tags',)
    advanced_fields = (
        'site_icon', 'status', 'type', 'related_program_groups', 'related_links', 'tracking_code', 'director_billets',)
    fieldsets = (
        (None, {'fields': normal_fields}),
        ('Advanced Settings', {'classes': ('collapse',),
                               'description': 'The settings below are advanced.',
                               'fields': advanced_fields,
                               }))


class ActionsAdmin(admin.ModelAdmin):
    model = Actions
    list_display = ['action_id', 'description', 'originator', 'status', 'assigned_to']
    inlines = [NoteInline, ]


class PageWidgetAdmin(admin.ModelAdmin):
    model = PageWidget
    list_display = ['name', 'subtext', 'type', 'number_of_dashboards']
    inlines = [NoteInline, ]
    normal_fields = ('name', 'subtext', 'type', 'theme', 'icon',)
    advanced_fields = ('description', 'render_function', 'url', 'iframe_url', 'iframe_url_if_local', 'data_json', )

    fieldsets = (
        (None, {'fields': normal_fields}),
        ('Advanced Settings', {'classes': ('collapse',),
                               'description': 'The settings below are advanced.',
                               'fields': advanced_fields,
                               }))

    def number_of_dashboards(self, obj):
        if DirectorDashboard.active_objects:
            return DirectorDashboard.active_objects.filter(page_widgets=obj.id).count()
        else:
            return 0


admin.site.register(DirectorDashboard, DirectorDashboardAdmin)
admin.site.register(PageWidget, PageWidgetAdmin)
admin.site.register(ProgramGroup, ProgramGroupAdmin)
admin.site.register(ProgramInfo, ProgramInfoAdmin)
admin.site.register(ProgramObservation, ProgramObservationAdmin)
admin.site.register(Link, LinkAdmin)
admin.site.register(Report, ReportAdmin)
admin.site.register(Billet)
admin.site.register(Actions)
