# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.contenttypes import generic
from django.contrib.gis import admin
from geoevents.maps.models import Layer, Map, MapLayer
from geoevents.notes.models import Note
from geoevents.operations.models import Event


class NoteInline(generic.GenericTabularInline):
    model = Note
    fields = (('title', 'public', 'owner'), 'content',)
    extra = 1


class MapLayerInline(admin.TabularInline):
    model = MapLayer
    extra = 1


class MapAdmin(admin.ModelAdmin):
    model = Map
    list_display = ['__unicode__', 'description', 'number_of_events']
    inlines = [MapLayerInline]
    save_as = True
    ordering = ['title']
    search_fields = ['description', 'title', 'tags', ]

    def number_of_events(self, obj):
        return Event.objects.filter(map=obj.id).count()


class LayerAdmin(admin.OSMGeoAdmin):
    model = Layer
    list_display = ['name', 'category', 'type', 'url', 'created_at']
    list_filter = ['category', 'type', 'image_format']
    inlines = [NoteInline]
    save_as = True
    search_fields = ['created_at', 'name', 'url', 'type', ]
    normal_fields = ('name', 'type', 'url', 'layer', 'description', 'image_format', 'tags')
    advanced_fields = (
    'attribution', 'category', 'styles', 'refreshrate', 'transparent', 'enable_identify', 'show_in_table',
    'allow_image_modifications', 'token', 'additional_domains', 'constraints', 'extent', 'layer_parsing_function',
    'info_format',
    'root_field', 'fields_to_show', 'downloadableLink', 'min_scale', 'max_scale', 'spatial_reference', 'layer_params',
    'source_params', 'created_at', )

    fieldsets = (
        (None, {'fields': normal_fields}),
        ('Advanced Settings', {'classes': ('collapse',),
                               'description': 'The settings below are advanced.  Please contact an admin if you have questions.',
                               'fields': advanced_fields,
        }))


class MapLayerAdmin(admin.ModelAdmin):
    model = MapLayer
    list_display = ['__unicode__', 'map', 'layer', 'stack_order', 'opacity', 'is_base_layer']
    list_filter = ['map', 'layer', 'stack_order', 'is_base_layer']


admin.site.register(Layer, LayerAdmin)
admin.site.register(Map, MapAdmin) 



