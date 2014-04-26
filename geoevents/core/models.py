# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

import os
from datetime import datetime
from django.conf import settings
from django.contrib.gis.db import models


class Setting(models.Model):
    """
    Model for site-wide settings.
    """
    name = models.CharField(max_length=200, help_text="Name of site-wide variable")
    value = models.TextField(max_length=800, blank=True, help_text="Value of site-wide variable")

    def __unicode__(self):
        return self.name


class PageLinks(models.Model):
    """
    Model for Links to show title bars of pages.
    """
    name = models.CharField(max_length=50, help_text="Name of site-wide variable")
    category = models.CharField(max_length=100, blank=True, null=True,
                                help_text="Category on header bar that link should go under, will create a new one if needed")
    url = models.TextField(max_length=800, blank=True, null=True,
                           help_text="URL to page loaded in new tab. If a 'shortcut' is specified, add URL onto end of internal url (e.g. '?service=SuggestionBox')")
    shortcut = models.CharField(max_length=100, blank=True, null=True,
                                help_text="Internal shortcut to use instead of url (e.g. 'add-feedback')")
    show_for_types = models.CharField(max_length=100, blank=True, null=True,
                                      help_text="Leave blank to always show, or use 'incident' or 'dashboard' or something to only show in pages that have that in the url")

    def __unicode__(self):
        return self.name

