# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.test import TestCase
from django.conf import settings
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.db.models.signals import post_save
from django.test.client import Client
from django.test.utils import override_settings
from geoevents.operations.models import Event
from geoevents.smts.signals import new_smts_category_from_event, send_email_to_smts


def disconnect_signal(signal, receiver, sender):
    """
    Disconnects signals.
    To use: disconnect_signal(<signal>, <receiver>, <model>)
    IE: disconnect_signal(post_save, send_email, Event)
    """
    disconnect = getattr(signal, 'disconnect')
    disconnect(receiver, sender)


def reconnect_signal(signal, receiver, sender):
    """
    Reconnects disconnected signals.
    To use: reconnect_signal(<signal>, <receiver>, <model>)
    IE: reconnect_signal(post_save, send_email, Event)
    """
    connect = getattr(signal, 'connect')
    connect(receiver, sender=sender)


class R3TestCaseMixin(object):
    """
    Mixin that stores logic to be run on all test cases.  All test cases should subclass this and call super().setUp.
    """

    def setUp(self):
        disconnect_signal(post_save, send_email_to_smts, Event)
        disconnect_signal(post_save, new_smts_category_from_event, Event)

        # Adds usernames with various permissions
        self.admin_user_credentials = {"username": 'admin', "password": 'test'}
        self.non_admin_user_credentials = {"username": 'non_admin', "password": 'test'}

        self.admin_user = User.objects.create_superuser('admin', 'test@aol.com', 'test')
        self.non_admin_user = User.objects.create_user('non_admin', 'test2@aol.com', 'test')
        self.cac_user = User.objects.create_user('Michael.Smith.Test', 'test3@aol.com', 'test')
        self.crazy_char_user = User.objects.create_user('aA0.-@_ \'', 'test4@aol.com', 'test')

        # Adds current_api_version to test cases.
        self.current_api_version = settings.CURRENT_API_VERSION


@override_settings(AUTHENTICATION_BACKENDS=('django.contrib.auth.backends.ModelBackend',))
class SimpleTest(R3TestCaseMixin, TestCase):
    """
    Tests site wide views and core functionality.
    """
    fixtures = ['initial_data_hold.json', 'maps.json']

    def setUp(self):
        super(SimpleTest, self).setUp()

    def test_view_profile(self):
        '''Test if the profile view renders'''
        c = Client()
        c.login(username=self.admin_user.username, password='test')
        response = c.get(reverse('user-profile', kwargs={'username': self.admin_user.username}))
        self.failUnlessEqual(response.status_code, 200)

    def test_view_profile_cac_user(self):
        '''Test if the profile view renders for cac users'''
        c = Client()
        c.login(username='Michael.Smith.Test', password='test')
        response = c.get(reverse('user-profile', kwargs={'username': self.cac_user.username}))
        self.failUnlessEqual(response.status_code, 200)

    def test_view_profile_crazy_char_user(self):
        '''Test if the profile view renders for cac users'''
        c = Client()
        c.login(username='aA0.-@_ \'', password='test')
        response = c.get(reverse('user-profile', kwargs={'username': self.crazy_char_user.username}))
        self.failUnlessEqual(response.status_code, 200)

    def test_view_profile_404(self):
        '''Test if the profile view renders a 404 if supplied with non-existent username'''
        c = Client()
        c.login(username='admin_user', password='test')
        response = c.get(reverse('user-profile', kwargs={'username': 'admisdfn'}))
        self.failUnlessEqual(response.status_code, 404)

    def test_non_admin_view_profile(self):
        '''Test if a non-admin can view their own user profile'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('user-profile', kwargs={'username': self.non_admin_user.username}))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_view_profile(self):
        '''Test if the non-admin can view someone else's profile'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('user-profile', kwargs={'username': self.admin_user.username}))
        self.failUnlessEqual(response.status_code, 403)

    def test_admin_perms_view_profile(self):
        '''Test if the admin can view someone else's profile'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('user-profile', kwargs={'username': self.non_admin_user.username}))
        self.failUnlessEqual(response.status_code, 200)

    def test_manage_profile(self):
        '''Test if the admin can post to his own profile'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.post(reverse('user-profile', kwargs={'username': self.admin_user.username}),
                          {'first_name': 'Admin', 'last_name': 'Last', 'email': 'test@aol.com'})
        self.failUnlessEqual(response.status_code, 302)

    def test_perms_manage_profile(self):
        '''Test if the admin can post to his own profile'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.post(reverse('user-profile', kwargs={'username': self.admin_user.username}),
                          {'first_name': 'Admin', 'last_name': 'Last', 'email': 'test@aol.com'})
        self.failUnlessEqual(response.status_code, 403)

    def test_login_logout(self):
        '''Tests the login/logout views'''
        c = Client()
        response = c.get(reverse('login'))
        self.failUnlessEqual(response.status_code, 200)

        response = c.get(reverse('logout'))
        self.failUnlessEqual(response.status_code, 200)

    def tearDown(self):
        self.admin_user.delete()
        self.non_admin_user.delete()


@override_settings(AUTHENTICATION_BACKENDS=('django.contrib.auth.backends.ModelBackend',))
class CoreAPITests(R3TestCaseMixin, TestCase):
    """
    Tests core api functionality.
    """
    #TODO: abstract this class so user can provide any API and it will test common functionality

    fixtures = ['maps.json']

    def setUp(self):
        super(CoreAPITests, self).setUp()
        self.api_endpoint = '{0}?format=json'.format(
            reverse('api_dispatch_list', args=[self.current_api_version, 'user']))

    def test_user_api_get(self):
        c = Client(self.api_endpoint)
        response = c.get(self.api_endpoint)
        self.assertEqual(response.status_code, 405)

    def test_user_api_post(self):
        c = Client()
        response = c.post(self.api_endpoint, data={'username': 'test'})
        self.assertEqual(response.status_code, 405)