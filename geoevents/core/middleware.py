# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

import requests
import logging
import sys
from django.conf import settings

from collections import namedtuple

logger = logging.getLogger(__name__)


class OpenSSO(object):
    REST_OPENSSO_LOGIN = '/identity/authenticate'
    REST_OPENSSO_LOGOUT = '/identity/logout'
    REST_OPENSSO_COOKIE_NAME_FOR_TOKEN = '/identity/getCookieNameForToken'
    REST_OPENSSO_COOKIE_NAMES_TO_FORWARD = '/identity/getCookieNamesToForward'
    REST_OPENSSO_IS_TOKEN_VALID = '/identity/isTokenValid'
    REST_OPENSSO_ATTRIBUTES = '/identity/attributes'
    DOMAIN = settings.SSO_URL

    def attributes(self, subjectid, attributes_names='uid', **kwargs):
        """
        Read subject attributes. Returns UserDetails object.
        The 'attributes_names' argument doesn't really seem to make a difference
        in return results, but it is included because it is part of the API.
        """
        params = {'attributes_names': attributes_names, 'subjectid': subjectid}
        if kwargs:
            params.update(kwargs)

        data = requests.get(self.DOMAIN + self.REST_OPENSSO_ATTRIBUTES, params=params).content
        logger.debug(data)

        attrs = self._parse_attributes(data)
        userdetails = UserDetails(attrs)

        return userdetails

    def _parse_attributes(self, data):
        """
        Parse a 'userdetails' key-value blob and return it as a dictionary.
        """
        lines = data.splitlines()

        # The containers we need
        attrs = {}
        attrs['roles'] = []
        attrs['attributes'] = {}

        for i, line in enumerate(lines):
            try:
                this_key, this_value = line.split('=', 1)
            except ValueError:
                continue

            # These are pairs of 'name', 'value' on new lines. Lame.
            if line.startswith('userdetails.attribute.name'):
                next_key, next_value = lines[i + 1].split('=', 1)
                attrs['attributes'][this_value] = next_value

            # A bunch of LDAP-style roles
            if line.startswith('userdetails.role'):
                attrs['roles'].append(this_value)

        return attrs

    def _parse_token(data):
        """
        Slice/split the token and return it. Exceptions will fall through.
        """
        # Server returns tokens as 'key=<value>\r\n' or 'key=<value>\n'
        key, value = data.strip().split('=', 1)
        return value

    def get_name(self, first_name, full_name):
        name = namedtuple("UserName", "first_name, last_name")
        full_name = full_name.lstrip(first_name + " ")  # remove the first name from the common name
        last_name = str()

        name_list = full_name.split(' ')

        # remove middle initial
        if name_list and len(name_list[0]) == 1:
            name_list.remove(name_list[0])

        last_name = ' '.join([n for n in name_list])

        return name(first_name, last_name)

    def process_request(self, request):
        """
        Obtains user attributes from OpenSSO by pasing the request.iPlanetDirectoryPro attribute to the OpenSSO
        rest endpoint.
        """

        token = request.COOKIES.get('iPlanetDirectoryPro')

        if token and hasattr(request, 'user') and getattr(request, 'user') \
            and not getattr(request.user, 'email', None):

            logger.info('Looking up attributes for user {user} with token: {token}.'.format(user=request.user.username,
                                                                                            token=token))

            try:

                at = self.attributes(token) #CAC users will not have any attributes.

                if getattr(at, 'attributes', None):
                    logger.debug('Attributes returned by SSO: {attributes}'.format(attributes=at))

                    request.user.email = at.attributes.get('mail')

                    if not request.user.first_name:
                        name = self.get_name(first_name=at.attributes.get('givenname'),
                                             full_name=at.attributes.get('cn'))

                        logger.debug('Parsed name is {first_name} {last_name}.'.format(first_name=name.first_name,
                                                                                       last_name=name.last_name))

                        request.user.first_name = name.first_name
                        request.user.last_name = name.last_name

                    request.user.save()
                else:
                    logger.debug('No SSO attributes returned for user {0}.'.format(request.user))
            except:
                logger.error(sys.exc_info())


class DictObject(object):
    """
    Pass it a dict and now it's an object! Great for keeping variables!
    """

    def __init__(self, data=None):
        if data is None:
            data = {}
        self.__dict__.update(data)

    def __repr__(self):
        """So we can see what is inside!"""
        return '{0}({1})'.format(self.__class__.__name__, self.__dict__)


class UserDetails(DictObject):
    """
    A dict container to make 'userdetails' keys available as attributes.
    """
    pass