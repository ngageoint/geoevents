# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.contenttypes import generic
from django.contrib.gis import admin
from geoevents.timeline.models import TimelineItem


class TimelineItemAdmin(admin.ModelAdmin):
    model = TimelineItem
    date_hierarchy = 'start'
    list_display = ['__unicode__', 'content_type', 'object_id', 'start', 'end', 'created', 'visible']
    list_filter = ['content_type', 'object_id', 'start', 'end', 'created', 'visible']


    def make_invisible(self, request, queryset):
        rows_updated = queryset.update(visible=0)
        plurality = '{0} was'.format(self.model._meta.verbose_name) if rows_updated == 1 else '{0} were'.format(
            self.model._meta.verbose_name_plural.title())

        message_bit = '{0} {1} '.format(rows_updated, plurality)

        self.message_user(request, "%s successfully marked as invisible." % message_bit)

    make_invisible.short_description = "Make timeline item invisible"

    actions = [make_invisible]


admin.site.register(TimelineItem, TimelineItemAdmin)


