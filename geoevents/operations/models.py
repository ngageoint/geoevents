# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

import json
import os
from datetime import datetime
from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.auth.models import User
from django.contrib.gis.geos import Point
from django.contrib.contenttypes.models import ContentType
from django.core.mail import send_mail
from django.core import serializers
from django.core.urlresolvers import reverse, reverse_lazy
from django.db.models.signals import post_save
from django.template.defaultfilters import slugify
from django.utils._os import safe_join
from django.utils.timezone import utc
from geoevents.core import disable_for_loaddata, enable_on_object_creation
from geoevents.maps.models import Map
from geoevents.notes.models import Note
from geoevents.operations.managers import ActiveObjects
from geoevents.taggit.managers import TaggableManager
from geoevents.timeline.models import TimelineItem
from tinymce.models import HTMLField


DISASTER_TYPES = [('Avalanche', 'Avalanche'),
                  ('Hurricane/Cyclone', 'Hurricane_Cyclone'),
                  ('Tornado', 'Tornado'),
                  ('Earthquake', 'Earthquake'),
                  ('Extreme Weather', 'Extreme Weather'),
                  ('Fire', 'Fire'),
                  ('Flood', 'Flood'),
                  ('Tsunami', 'Tsunami'),
                  ('Volcano', 'Volcano'),
                  ('Pandemic', 'Pandemic'),
                  ('Special Event', 'Special Event'),
                  ('Exercise', 'Exercise'),
]

PRODUCT_TYPES = [('PDF', 'PDF'),
                 ('JPG', 'JPG'),
                 ('WFS', 'WFS'),
                 ('WMS', 'WMS'),
                 ('Other', 'Other'),
]

CLASSIFICATIONS = [('UNCLASSIFIED', 'UNCLASSIFIED'),
                   ('Public Releasable', 'Public Releasable'),
]

POSTURE_CHOICES = [('Monitoring', 'Monitoring'),
                   ('Collecting', 'Collecting'),
                   ('Reporting', 'Reporting'),
                   ('Deployed', 'Deployed'),
]

WIDGET_TYPES = [('List', 'List'),
]

WIDGET_DATA_TYPES = [('json', 'json'),
                     ('xml', 'xml'),
]

user_filter_models = [('Earthquake', 'Earthquake')]


class Base(models.Model):
    created = models.DateTimeField(auto_now_add=True, verbose_name="Date Created")
    last_updated = models.DateTimeField(auto_now=True, null=True)
    status = models.IntegerField(max_length=1, choices=[(1, 'Active'), (0, 'Inactive')], default=1, blank=True,
                                 null=True)
    closed = models.DateTimeField(verbose_name="Date Closed", blank=True, null=True)

    def notes(self):
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id, public=True)

    def save(self, *args, **kwargs):
        if self.status == 1 and self.closed:
            self.closed = None
        elif self.status == 0 and self.closed is None:
            self.closed = datetime.now()

        super(Base, self).save(*args, **kwargs)

    class Meta:
        abstract = True


class ServiceType(models.Model):
    """
    A table to keep track of service types
    """
    name = models.CharField(max_length=15)
    description = HTMLField(max_length=800, blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(max_length=1, choices=[(1, 'Active'), (0, 'Inactive')], default=1)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ['name', ]
        verbose_name = 'resource type'
        verbose_name_plural = 'resource types'

    def notes(self):
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id)


class Service(models.Model):
    """
    Table for storing services
    """
    name = models.CharField(max_length=75)
    service_type = models.ManyToManyField(ServiceType)
    description = HTMLField(max_length=800, blank=True, null=True)
    url = models.URLField(max_length=600)
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True, null=True)
    status = models.IntegerField(max_length=1, choices=[(1, 'Active'), (0, 'Inactive')], default=1)
    tags = TaggableManager()

    def __unicode__(self):
        return self.name

    def notes(self):
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id)

    def get_absolute_url(self):
        return reverse('operations-view-service', args=[self.id])

    class Meta:
        ordering = ['name']
        verbose_name = 'resource'
        verbose_name_plural = 'resources'


class GeoWidget(models.Model):
    """
    GeoLink Widgets shown based on map location and zoom level
    """
    name = models.CharField(max_length=200, unique=True, help_text="GeoLink widget name")
    url = models.TextField(blank=True, null=True,
                           help_text="Template for the url to lookup, i.e. http://api.geonames.org/wikipediaBoundingBoxJSON?formatted=true&north={{n}}&south={{s}}")
    url_if_local = models.CharField(max_length=100, blank=True, null=True,
                                    help_text="Template for the url to use if testing locally")
    description = models.CharField(max_length=300, blank=True, null=True)
    type = models.CharField(max_length=50, choices=WIDGET_TYPES)
    below_zoom = models.PositiveIntegerField(blank=True, null=True,
                                             help_text="Show this widget only when map is below this zoom level.")
    above_zoom = models.PositiveIntegerField(blank=True, null=True,
                                             help_text="Show this widget only when map is above this zoom level.")
    listName = models.CharField(max_length=100, blank=True, null=True,
                                help_text="Name of array that data is returned in")
    tabToOpenIn = models.CharField(max_length=20, blank=True, null=True, help_text="Name of a window/tab to open in",
                                   default="_new")
    selectorName = models.TextField(blank=True, null=True,
                                    help_text="Template of where to find the name of each returned item, i.e. {{title}}")
    selectorLink = models.TextField(blank=True, null=True,
                                    help_text="Template of where to find where results should link to, i.e. http://{{wikipediaUrl}}")
    selectorPoint = models.TextField(blank=True, null=True,
                                     help_text="Template of where to find the 'lat long' of each returned item, i.e. {{lat}} {{lng}}")
    selectorSummary = models.TextField(blank=True, null=True,
                                       help_text="Template of where to find the summary of each returned item, i.e. {{summary}}")
    selectorShowIf = models.TextField(blank=True, null=True,
                                      help_text="Template of what to run, and only show if results are true. i.e. {{settings.type==3}}")
    style = models.TextField(blank=True, null=True,
                             help_text="CSS style object of results. i.e. {'color':'blue','fontSize':'10px'}")
    data_type = models.CharField(max_length=20, choices=WIDGET_DATA_TYPES)


    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name = 'geolink'
        verbose_name_plural = 'GeoLink Page Lookup Widgets'
        ordering = ['name']

    def geowidget_json(self):
        widget = {
            'id': self.id,
            'name': self.name,
            'url': self.url,
            'urlIfLocal': self.url_if_local,
            'description': self.description,
            'type': self.type,
            'belowZoom': self.below_zoom,
            'aboveZoom': self.above_zoom,
            'listName': self.listName,
            'selectorName': self.selectorName,
            'selectorLink': self.selectorLink,
            'selectorPoint': self.selectorPoint,
            'selectorSummary': self.selectorSummary,
            'selectorShowIf': self.selectorShowIf,
            'tabToOpenIn': self.tabToOpenIn,
            'style': self.style,
            'dataType': self.data_type,
        }
        return widget


class Agency(models.Model):
    """
    Agencies that we work with.
    """
    name = models.CharField(max_length=200, unique=True)
    url = models.URLField(max_length=600, blank=True, null=True)
    logo = models.CharField(max_length=200, blank=True, null=True)

    def __unicode__(self):
        return self.name

    def logo_url(self):
        if self.logo.startswith('http'):
            return self.logo
        else:
            return settings.STATIC_URL + self.logo

    class Meta:
        verbose_name_plural = 'Agencies'
        ordering = ['name']


@disable_for_loaddata
def default_link(sender, **kwargs):
    """
    Saves the default link on an object when it is created.
    """
    if kwargs.get('created'):
        event = kwargs['instance']
        event.link = event.make_link()
        event.save()


@disable_for_loaddata
@enable_on_object_creation
def send_email_to_hadr(sender, **kwargs):
    """
    Sends an email when a new event is created
    """
    event = kwargs['instance']

    try:
        recipients = settings.EMAIL_NEW_EVENT_TO
        subject = '{0} Event Page Created'.format(event.name)
        message = """A new event page has been created:
            Event Title: {0}
            Event Tags: {1}
            Event URL: {2}""".format(event.name, event.tags, event.link)
        send_mail(subject, message, settings.EMAIL_FROM_EMAIL, recipients, fail_silently=False)
    except:
        pass


class EventTypes():
    """
    Model for event types.  Returns only the first element of each tuple.
    """
    types = {'event_types': [i for i, j in DISASTER_TYPES]}


class Event(models.Model):
    """
    Model for 'incident' type events.
    """
    name = models.CharField(max_length=200, help_text="Event name.")
    tags = models.CharField(max_length=75, null=True, blank=True)
    event_type = models.CharField(max_length=50, choices=DISASTER_TYPES)
    posture = models.CharField(max_length=25, choices=POSTURE_CHOICES, default='Monitoring')
    status = models.IntegerField(max_length=1, choices=[(1, 'Active'), (0, 'Inactive')], default=1)
    event_location = models.CharField(max_length=200, null=True,
                                      help_text="A human-friendly description of the location (ie Japan, or Pacific Ocean)")
    closed = models.DateTimeField(verbose_name="Date Event is marked 'Closed', or no longer active", blank=True,
                                  null=True)
    description = HTMLField(max_length=1000, blank=True, null=True, verbose_name="Overview",
                            help_text="A generic description of the event, markdown is enabled.")
    poc = HTMLField(max_length=1000, blank=True, null=True, help_text="Point of Contact for the event.")
    latitude = models.FloatField()
    longitude = models.FloatField()
    map = models.ForeignKey(Map, null=True, blank=True, help_text='Choose a map for the event.')

    link = models.URLField(blank=True, null=True, help_text="This is an auto-generated link/slug to link to the event.")
    collaboration_link = models.URLField(blank=True, null=True,
                                         default="")
    product_feed_url = models.TextField(blank=True, null=True,
                                        help_text="URL for any Non-standard products to be pulled for this event. If empty, will pull based on event name and tags.")
    standard_product_url = models.TextField(max_length=800, blank=True, null=True,
                                            help_text="Link to Standard Products for this incident. Will merge with Non-standard feed.")
    rfi_generator_id = models.PositiveIntegerField(blank=True, null=True,
                                                   help_text="RFI Generator ID for this incident. Leave empty for none.")

    agencies = models.ManyToManyField(Agency, null=True, blank=True,
                                      help_text="Adds each agencies logo to the event page.")
    services = models.ManyToManyField(Service, null=True, blank=True,
                                      help_text="Related Resources to show on side of page", verbose_name="resources")
    geowidgets = models.ManyToManyField(GeoWidget, null=True, blank=True, help_text="Related GeoWidgets",
                                        verbose_name="geowidgets")
    filedropoff_path = models.CharField(max_length=200, null=True, blank=True,
                                        help_text="Advanced - Path to folder within AjaxExplorer Shared directory of files to show - must be in /cache/ajaxplorer/files")
    point = models.PointField(null=True, blank=True)

    slug = models.SlugField(max_length=250)
    created = models.DateTimeField(verbose_name="Date Created", auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True, null=True)
    objects = models.GeoManager()
    active_objects = ActiveObjects()

    ## Event page settings.
    show_event_on_map = models.BooleanField(default=True,
                                            help_text="Choose whether the incident icon should show up on the map.")
    show_timeline = models.BooleanField(default=True,
                                        help_text="Choose whether the timeline should be enabled for the event.")
    show_services = models.BooleanField(default=True,
                                        help_text="Choose whether to show services associated with an event.")
    show_notes = models.BooleanField(default=True, help_text="Choose whether to show notes associated with an event.")
    show_products = models.BooleanField(default=True,
                                        help_text="Choose whether to show products associated with an event.")
    show_rfis = models.BooleanField(default=True, help_text="Choose whether to show RFIs associated with an event.")
    show_deployments = models.BooleanField(default=True,
                                           help_text="Choose whether to show deployments associated with an event.")
    show_supporting_agencies = models.BooleanField(default=True,
                                                   help_text="Choose whether to show supporting agencies.")
    show_geomedia_triage = models.BooleanField(default=True,
                                               help_text="Choose whether to show a page to filter social media.")
    show_related_files = models.BooleanField(default=True,
                                             help_text="Choose whether to show files saved in the dropbox.")
    show_supporting_apps = models.BooleanField(default=True,
                                               help_text="Choose whether to show the supporting apps section.")

    def __unicode__(self):
        return self.name

    def clean(self):
        from django.core.exceptions import ValidationError

        try:
            if self.filedropoff_path:
                self.filedropoff_path = safe_join(settings.EVENT_FILE_DROPOFF_ROOT, self.filedropoff_path)
        except ValueError:
            raise ValidationError(
                'Suspicious operation.  The EVENT_FILE_DROPOFF_ROOT path in settings.py must be within the filedropoff path.')

    def get_absolute_url(self, lazy=False):
        f = reverse if not lazy else reverse_lazy
        return f('operations-view-incident-slug', kwargs={'pk': self.pk, 'slug': self.slug})

    def get_uri(self):
        return '{0}{1}/'.format(reverse('api_dispatch_list', kwargs={"resource_name": 'event', 'api_name': 'v1'}),
                                self.id)

    def product_feed(self):
        """
        Passes the title of the event and the tags through to the app02 proxy.
        """
        #TODO: Turn this into a setting
        url = settings.PRODUCT_FEED_FORMAT
        return url.format(self.name,
                          self.tags) if not self.product_feed_url else self.product_feed_url

    def rfi_feed(self):
        return "{0}/rfis?event={1}".format(settings.RFI_GENERATOR_URL, self.rfi_generator_id)

    def deployments(self):
        return Deployment.objects.filter(event=self)

    def deployments_json(self):
        return serializers.serialize('json', self.deployments())

    def make_link(self):
        """
        Generates the default link for an event.
        """

        return '{0}{1}'.format(settings.BASE_URL(), self.get_absolute_url())

    def notes(self):
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id, public=True)

    def notes_json(self):
        """
        Returns json of notes.
        """
        return serializers.serialize('json', self.notes().only("title", "content", "last_updated", "owner"))

    def description_js_readable(self):
        """
        Returns JS Safely readable description of event.
        """
        output = self.description.replace("\n", " ")
        output = output.replace("\r", " ")
        output = output.replace("'", "`")

        return output

    def timeline_items_json(self):
        """
        Returns event timeline items as json
        """
        return serializers.serialize('json', self.timeline_items())

    def timeline_items(self):
        model_id = ContentType.objects.get_for_model(self).id
        return TimelineItem.objects.filter(content_type__pk=model_id, object_id=self.id)

    def tags_as_list(self):
        return self.tags.split(',') if self.tags else []

    def files_in_dropoff_folder(self):
        try:
            if self.filedropoff_path:
                return json.dumps([file for file in os.listdir(self.filedropoff_path) if not file.startswith(".")])
        except:
            return {}

    def geowidgets_json(self):
        return json.dumps([widget.geowidget_json() for widget in self.geowidgets.all()])

    def save(self, *args, **kwargs):
        """
        Modifies events as they are saved.
        """

        if self.status == 1 and self.closed:
            self.closed = None
        elif self.status == 0 and self.closed is None:
            self.closed = datetime.now()

        self.point = Point(float(self.longitude), float(self.latitude))
        self.slug = slugify(self.name)

        super(Event, self).save(*args, **kwargs)

    class Meta:
        ordering = ['-last_updated', ]


post_save.connect(default_link, sender=Event)
post_save.connect(send_email_to_hadr, sender=Event)


class Deployment(models.Model):
    """
    Model to keep track of deployer locations.
    """

    deployment_location = models.CharField(max_length=400)
    created = models.DateTimeField(verbose_name="Date Created", auto_now_add=True)
    closed = models.DateTimeField(verbose_name="Date Closed", blank=True, null=True)
    event = models.ForeignKey(Event)
    deployers = models.ManyToManyField(User, max_length=250, blank=True, null=True)
    description = HTMLField(max_length=1000, blank=True, null=True)
    status = models.IntegerField(max_length=1, choices=[(1, 'Active'), (0, 'Inactive')], default=1)
    latitude = models.FloatField()
    longitude = models.FloatField()
    point = models.PointField(null=True, blank=True)
    objects = models.GeoManager()
    active_objects = ActiveObjects()

    def __unicode__(self):
        return "{0}: {1}".format(self.created.strftime('%m/%d/%Y'), self.deployment_location)

    def notes(self):
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id)

    def get_absolute_url(self):
        return reverse('operations-view-deployment-pk', args=[self.id])

    def get_update_url(self):
        return reverse('operations-manage-deployment-pk', args=[self.id])

    def get_delete_url(self):
        return reverse('operations-delete-deployment-pk', args=[self.id])

    def duration(self):
        return datetime.utcnow().replace(tzinfo=utc) - self.created if self.status else self.closed - self.created

    def duration_in_days(self):
        return self.duration().days

    def deployer_names(self):
        """
        Returns a comma seperated string of the deployer first and last names.
        """
        d = []
        for deployer in self.deployers.all():
            if deployer.first_name and deployer.last_name:
                d.append("{0} {1}".format(deployer.first_name, deployer.last_name))
            else:
                d.append(deployer.username)
        return "%s" % (','.join(d))

    def save(self, *args, **kwargs):
        if self.status == 1 and self.closed:
            self.closed = None
        elif self.status == 0 and self.closed is None:
            self.closed = datetime.now()

        self.point = Point(float(self.longitude), float(self.latitude))
        super(Deployment, self).save(*args, **kwargs)


class LessonLearnedCategory(models.Model):
    name = models.CharField(max_length=200)
    description = HTMLField(max_length=1000, blank=True, null=True)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Lessons Learned Categories'


class LessonLearned(Base):
    """
    Model to keep track of lessons learned
    """

    event = models.ForeignKey(Event, null=True, blank=True)
    name = models.CharField(max_length=200, verbose_name='Title', null=True, blank=True)
    assigned_to = models.ForeignKey(User, max_length=250, blank=True, null=True,
                                    related_name='lesson_learned_assignment')
    submitted_by = models.ForeignKey(User, max_length=250, blank=True, null=True,
                                     related_name='lesson_learned_submission')
    due = models.DateTimeField(verbose_name="Resolution Due By", blank=True, null=True)
    priority = models.CharField(max_length=25, choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')],
                                default='Low', null=True, blank=True)
    category = models.ForeignKey(LessonLearnedCategory, max_length=50, null=True, blank=True)
    description = HTMLField(max_length=1000, null=True)
    work_around = HTMLField(max_length=1000, blank=True, null=True)
    action = HTMLField(max_length=1000, blank=True, null=True)
    resolution = HTMLField(max_length=1000, blank=True, null=True)

    def __unicode__(self):
        return '{0} - {1}'.format(self.created.strftime('%m/%d/%Y'),
                                  self.name) if self.name else 'Lesson learned submitted on {0}.'.format(
            self.created.strftime('%m/%d/%Y'))

    def get_absolute_url(self):
        return reverse('operations-view-lesson-learned-pk', args=[self.id])

    def get_update_url(self):
        return reverse('operations-manage-lesson-learned-pk', args=[self.id])

    def get_delete_url(self):
        return reverse('operations-delete-lesson-learned-pk', args=[self.id])

    class Meta(Base.Meta):
        ordering = ['-created']
        verbose_name_plural = 'Lessons Learned'
        unique_together = ('submitted_by', 'description', 'event')


class SitRep(Base):
    """
    Model for incident SitReps.
    """

    event = models.ForeignKey(Event, null=True, blank=True)
    name = models.CharField(max_length=200, verbose_name='Title', null=True, blank=True)
    content = HTMLField(max_length=6000, help_text="Content of sitrep markdown is enabled.")
    owner = models.ForeignKey(User, max_length=250, blank=True, null=True)

    def __unicode__(self):
        return '{0} - Submitted on {1}'.format(self.name, self.created.strftime('%m/%d/%Y'))

    def get_absolute_url(self):
        return reverse('operations-view-sitrep-pk', args=[self.id])

    def get_update_url(self):
        return reverse('operations-manage-sitrep-pk', args=[self.id])

    def get_delete_url(self):
        return reverse('operations-delete-sitrep-pk', args=[self.id])

    class Meta(Base.Meta):
        ordering = ['-created']
        verbose_name_plural = 'SitReps'
