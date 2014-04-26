# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse_lazy
from django.db import models
from django.template.defaultfilters import slugify
from geoevents.notes.models import Note
from geoevents.taggit.managers import TaggableManager
from tinymce.models import HTMLField
from django.conf import settings


FEEDBACK_SUBJECTS = [('Suggestion Box', 'Suggestion Box'),
                     ('Landing Page', 'Landing Page'),
                     ('Geo Event Page', 'Geo Event Page'),
                     (settings.FEEDBACK_NAME, settings.FEEDBACK_URL),
]

FEEDBACK_LOGIN_METHODS = [('CAC Card', 'CAC Card'),
                          ('Name/PW Account', 'Name/PW Account'),
                          ('PKI', 'PKI'),
                          ('No Name/PW', 'No Name/PW'),
]

FEEDBACK_PLATFORMS = [('Desktop', 'Desktop'),
                      ('Mobile', 'Mobile'),
                      ('Other', 'Other'),
]


class SubjectEmailMap(models.Model):
    """ This handles associating a subject with a set of people to email feedback on this subject """
    subject = models.CharField(max_length=75, unique=True,
                               help_text="For feedback emails, which ones should go to an alternate email list? Enter Subject exactly as is in pulldown menu", )
    emails = models.TextField(max_length=200, blank=True, null=True,
                              help_text="Comma-separated list of emails that should be used instead of defaults", )


class Feedback(models.Model):
    """
    model for feedback
    """
    name = models.CharField(max_length=75, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    organization = models.CharField(max_length=25, blank=True, null=True)
    created = models.DateTimeField(verbose_name="Date Created", auto_now_add=True)
    subject = models.CharField(max_length=25, choices=FEEDBACK_SUBJECTS, default='Geo Event Page')
    login_method = models.CharField(max_length=25, choices=FEEDBACK_LOGIN_METHODS, default='CAC')
    platform = models.CharField(max_length=25, choices=FEEDBACK_PLATFORMS, default='CAC')
    feedback = models.TextField(max_length=1000)
    referer = models.TextField(max_length=200, blank=True, null=True)
    user_agent = models.TextField(max_length=300, blank=True, null=True)
    phone = models.CharField(max_length=12, blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Feedback'

# Category > Article
# Common Issues on Article
# Published


class Category(models.Model):
    """
    Category model
    """
    name = models.CharField(max_length=75, unique=True)
    active = models.BooleanField(default=True)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'


class Article(models.Model):
    """
    Frequently Asked Questions
    """
    title = models.CharField(max_length=200, unique=True)
    active = models.BooleanField(default=True, help_text="Uncheck to hide FAQ.")
    category = models.ForeignKey(Category)
    common_issue = models.BooleanField(default=False)
    created = models.DateTimeField(verbose_name="Date Created", auto_now_add=True)
    content = HTMLField(blank=True, null=True)
    last_updated_by = models.ForeignKey(User, null=True, blank=True)
    tags = TaggableManager(blank=True)
    slug = models.CharField(max_length=200, null=True, blank=True)

    def __unicode__(self):
        return self.title

    def get_absolute_url(self):
        return reverse_lazy('feedback-view-article', args=[self.slug])

    def get_edit_url(self):
        return reverse_lazy('feedback-manage-article', args=[self.slug])

    def get_tags(self):
        return [tag.name for tag in self.tags.all()]

    def notes(self):
        """
        Returns notes for this object
        """
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id, public=True)

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Article, self).save(*args, **kwargs)


