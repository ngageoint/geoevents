# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from datetime import datetime
from django.contrib.contenttypes import generic
from django.contrib.gis import admin
from geoevents.notes.models import Note
from geoevents.operations.models import Agency, Event, Deployment, LessonLearned, LessonLearnedCategory, Service, ServiceType, SitRep, GeoWidget
from geoevents.timeline.models import TimelineItem


class TimelineItemInline(generic.GenericTabularInline):
    model = TimelineItem
    extra = 1


class NoteInline(generic.GenericTabularInline):
    model = Note
    fields = (('title', 'public', 'owner'), 'content',)
    extra = 1


class AgencyAdmin(admin.ModelAdmin):
    model = Agency
    list_display = ['name']


class EventAdmin(admin.OSMGeoAdmin):
    model = Event
    list_display = ['name', 'event_type', 'posture', 'status', 'map_name', 'event_location', 'created', 'closed']
    list_filter = ['event_type', 'posture', 'status', 'created', 'closed']
    search_fields = ['name', 'event_location', ]
    point_zoom = 10
    inlines = [NoteInline, TimelineItemInline]

    normal_fields = (
        ('name', 'tags'), ('event_type', 'posture', 'status'), ('map', 'event_location'), ('latitude', 'longitude'),
        'closed', 'description', 'poc')
    advanced_fields = (
        'link', 'collaboration_link', 'product_feed_url', 'standard_product_url', 'rfi_generator_id', 'agencies',
        'services', 'geowidgets', 'filedropoff_path', 'point', 'show_event_on_map', 'show_timeline', 'show_services',
        'show_notes', 'show_products', 'show_rfis', 'show_deployments', 'show_supporting_agencies',
        'show_geomedia_triage', 'show_related_files', 'show_supporting_apps',)
    fieldsets = (
        (None, {'fields': normal_fields}),
        ('Advanced Settings', {'classes': ('collapse',),
                               'description': 'The settings below are advanced.  \
                               Please contact an admin if you have questions.',
                               'fields': advanced_fields,
        }))

    def map_name(self, instance):
        return instance.map.title

    def make_inactive(self, request, queryset):
        rows_updated = queryset.update(status=0, closed=datetime.now(), last_updated=datetime.now())
        if rows_updated == 1:
            message_bit = '1 event was'
        else:
            message_bit = '{0} events were'.format(rows_updated)
        self.message_user(request, "%s successfully events marked as inactive." % message_bit)

    make_inactive.short_description = "Deactivate selected events."

    def make_active(self, request, queryset):
        rows_updated = queryset.update(status=1, last_updated=datetime.now(), closed=None)
        if rows_updated == 1:
            message_bit = '1 event was'
        else:
            message_bit = '{0} events were'.format(rows_updated)
        self.message_user(request, "%s successfully marked as active." % message_bit)

    make_active.short_description = "Activate selected events."

    actions = [make_active, make_inactive]


class DeploymentAdmin(admin.OSMGeoAdmin):
    model = Deployment
    date_hierarchy = 'created'
    list_display = ['deployment_location', 'created', 'deployer_names', 'status']
    inlines = [NoteInline]

    def deployer_list(self, obj):
        return "%s" % (','.join(["{0} {1}".format(n.first_name, n.last_name) for n in obj.deployers.all()]))


class LessonLearnedAdmin(admin.ModelAdmin):
    model = LessonLearned
    list_display = ['__unicode__', 'category', 'assigned_to', 'status', 'created', 'closed']
    list_filter = ['category', 'assigned_to', 'created', 'closed']


class LessonLearnedCategoryAdmin(admin.ModelAdmin):
    model = LessonLearnedCategory


class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'item_tags', 'status']
    list_filter = ['status']

    def item_tags(self, obj):
        return "%s" % (', '.join([n.name for n in obj.tags.all()]) )


class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'status']
    list_filter = ['status']


class GeoWidgetAdmin(admin.ModelAdmin):
    model = GeoWidget
    list_display = ['name', 'description']


class SitRepAdmin(admin.ModelAdmin):
    pass


admin.site.register(Agency, AgencyAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(Deployment, DeploymentAdmin)
admin.site.register(LessonLearned, LessonLearnedAdmin)
admin.site.register(LessonLearnedCategory, LessonLearnedCategoryAdmin)
admin.site.register(ServiceType, ServiceTypeAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(SitRep, SitRepAdmin)
admin.site.register(GeoWidget, GeoWidgetAdmin)
