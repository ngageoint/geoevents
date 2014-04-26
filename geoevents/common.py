# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from datetime import datetime
from django.conf import settings
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.urlresolvers import reverse_lazy
from django.utils.datastructures import SortedDict
from geoevents.operations.models import Event
import re


def menu(active=None, request_path=None):
    def order_dict(d, key):
        return SortedDict(sorted(d.items(), key=key))

    sort_key = lambda t: t[1].get('index', None)

    incidents_dropdown = {
        'Active Events': {'index': 1, 'url': reverse_lazy('active-incidents'), 'active': False},
        'Event Archives': {'index': 2, 'url': reverse_lazy('operations-view-incident-archive'), 'active': False},
        'break': {'index': 3, 'url': '#', 'active': False}
    }

    for event in Event.active_objects.all():
        incidents_dropdown[event.name] = {'index': len(incidents_dropdown) + 1,
                                          'url': event.get_absolute_url(lazy=True), 'active': False}

    links_dropdown = {
        'Homepage': {'index': 1, 'url': settings.HOMEPAGE_URL, 'active': False, 'target': '_blank'},
        'Request an Account': {'index': 2, 'url': settings.REQUEST_ACCOUNT_URL, 'target': '_blank', 'active': False, },
        settings.NEW_ACCOUNT_2_NAME: {'index': 3, 'url': settings.NEW_ACCOUNT_2_URL, 'active': False,
                                      'target': '_blank'},
    }

    help_dropdown = {
        'Suggestion Box': {'index': 1, 'url': reverse_lazy('add-feedback') + '?service=Suggestion%20Box',
                           'active': False},
        'Submit Feedback': {'index': 2, 'url': reverse_lazy('add-feedback'), 'active': False},
        'FAQs': {'index': 3, 'url': reverse_lazy('feedback-faqs'), 'active': False},
    }

    menu_items = {
        'Events': {'index': 1, 'url': reverse_lazy('active-incidents'), 'active': False,
                   'dropdown': order_dict(incidents_dropdown, sort_key)},
        'Notes': {'index': 2, 'url': reverse_lazy('notes-view-notes'), 'active': False},
        'Links': {'index': 3, 'url': '#', 'active': False, 'dropdown': order_dict(links_dropdown, sort_key)},
        'Resources': {'index': 4, 'url': reverse_lazy('operations-view-services'), 'active': False},
        'Help': {'index': 5, 'url': reverse_lazy('add-feedback'), 'active': False,
                 'dropdown': order_dict(help_dropdown, sort_key)},
    }

    if request_path:
        for i in menu_items.keys():
            if menu_items[i].get('url', None):
                if re.search(str(menu_items[i].get('url')), request_path):
                    menu_items[i]['active'] = True

    return order_dict(menu_items, sort_key)


def paginate(iterator, num_per_page=25, current_page=None):
    paginator = Paginator(iterator, num_per_page)

    try:
        i = paginator.page(current_page)
    except PageNotAnInteger:
        i = paginator.page(1)
    except EmptyPage:
        i = paginator.page(paginator.num_pages)

    return i
