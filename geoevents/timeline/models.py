# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType
from django.db import models
from geoevents.notes.models import Note


class TimelineBase(models.Model):
    """
    Base object for timeline model
    """
    start = models.DateTimeField(verbose_name="Start Date", help_text="Start date in YYYY/MM/DD HH:MM format")
    end = models.DateTimeField(verbose_name="End Date", help_text="End date in YYYY/MM/DD HH:MM format", blank=True,
                               null=True)
    created = models.DateTimeField(auto_now_add=True, verbose_name="Date Created")
    last_updated = models.DateTimeField(auto_now=True, null=True)

    def notes(self):
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id)

    def save(self, *args, **kwargs):
        super(TimelineBase, self).save(*args, **kwargs)

    class Meta:
        abstract = True
        ordering = ['-created']


class TimelineItem(TimelineBase):
    """
    An item that can be added to a timeline
    """
    content = models.CharField(max_length=2000) #should this be an HTML field?
    group = models.CharField(max_length=200, blank=True, null=True)
    visible = models.BooleanField(default=True)
    content_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    content_object = generic.GenericForeignKey('content_type', 'object_id')

    def __unicode__(self):
        #Todo: make this something more intuitive
        return '{0}: {1}'.format(str(self.content_type).title(), self.content)

    class Meta(TimelineBase.Meta):
        ordering = ['start']