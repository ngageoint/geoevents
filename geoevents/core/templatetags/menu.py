# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django import template
from django.core.urlresolvers import reverse, reverse_lazy
from geoevents.common import menu
from django.conf import settings


register = template.Library()


def get_menu(request=None, **kwargs):
    #TODO: abstract classification from this
    request_path = None

    if request:
        request_path = request.path

    menu_dict = kwargs
    menu_dict['menu_items'] = menu(request_path=request_path)
    menu_dict['request'] = request
    menu_dict['SITE_TITLE'] = settings.SITE_TITLE
    menu_dict['SITE_BRANDING_LOGO'] = settings.BRANDING_LOGO_URL

    return menu_dict


register.inclusion_tag('menu.html')(get_menu)