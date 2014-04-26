# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""
import urllib
import json
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.db.models.signals import post_save
from django.template.defaultfilters import slugify
from django.test import TestCase
from django.test.client import Client
from django.test.utils import override_settings
from geoevents.core.tests import R3TestCaseMixin
from geoevents.operations.forms import EventForm
from geoevents.operations.models import Deployment, Event, LessonLearned, LessonLearnedCategory, Service, ServiceType, SitRep


@override_settings(AUTHENTICATION_BACKENDS=('django.contrib.auth.backends.ModelBackend',))
class SimpleTest(R3TestCaseMixin, TestCase):
    fixtures = ['maps.json']

    def setUp(self):
        super(SimpleTest, self).setUp()

        self.event_data = {'name': 'Hurricane Sandy',
                           'event_location': 'United Stats',
                           'description': 'This is a test incident',
                           'posture': 'Deployed',
                           'poc': 'Red Team',
                           'event_type': 'Hurricane/Cyclone',
                           'longitude': -74.4,
                           'latitude': 38.8,
                           'tags': 'hurricane, sandy, test',
        }

        self.event = Event.objects.create(**self.event_data)

        self.service_type = ServiceType.objects.create(name='JSON',
                                                       description='JSON Feeds',
        )

        self.service = Service.objects.create(name='Red Cross Facilities',
                                              description='Red Cross Facilities',
                                              url='http://app.redcross.org/nss-app/pages/mapServicesList.jsp?action=list',
        )
        self.deployment = Deployment.objects.create(deployment_location='Test Joint Field Office',
                                                    description='Test',
                                                    latitude=-74.4,
                                                    longitude=38.8,
                                                    event=self.event
        )
        self.ll_category = LessonLearnedCategory.objects.create(name='Test Category', description='Test Test')
        self.lesson_learned = LessonLearned.objects.create(name='Test Lesson Learned',
                                                           event=self.event,
                                                           priority='High',
                                                           description='Test',
                                                           category=self.ll_category
        )
        self.sitrep = SitRep.objects.create(name='Test SitRep', content='This is a test')


    def test_event_geometry(self):
        '''Test if the insert trigger on the Event model has set the x,y value as lonitude, latitude.'''
        self.assertEqual(self.event.point.x, -74.4)
        self.assertEqual(self.event.point.y, 38.8)

    def test_event_slug(self):
        '''Test if the insert trigger on the Event model has set the slug attribute.'''
        self.assertEqual(self.event.slug, slugify(self.event.name))

    #def test_event_link(self):
    #    '''Test if the insert trigger on the Event model has set the link attribute.'''
    #    print self.event.link
    #    response = urllib.urlopen(self.event.link)
    #    self.failUnlessEqual(response.status_code, 200)
    #    response.close()

    def test_event_absolute_url(self):
        '''Test if each event's absolute url renders.'''
        c = Client()
        response = c.get(self.event.get_absolute_url())
        self.failUnlessEqual(response.status_code, 200)

    def test_active_incidents(self):
        '''Test if the active incidents page renders.'''
        c = Client()
        response = c.get(reverse('active-incidents'))
        self.failUnlessEqual(response.status_code, 200)

    def test_view_incident_id(self):
        '''Test if a specific incident page renders.'''
        c = Client()
        response = c.get(reverse('operations-view-incident', args=[self.event.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_view_incident_id_slug(self):
        '''Test if a specific incident page renders with an id and slug in the url.'''
        c = Client()
        response = c.get(reverse('operations-view-incident-slug', args=[self.event.id, self.event.slug]))
        self.failUnlessEqual(response.status_code, 200)

    def test_view_incident_kml_id(self):
        '''Test if an incident's kml view returns successfully.'''
        c = Client()
        response = c.get(reverse('operations-view-incident-kml', args=[self.event.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_manage_incident_id(self):
        '''Test if an incident manage page renders with an id.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-manage-incident-pk', args=[self.event.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_manage_incident_id_post(self):
        '''Test posting to an incident manage page.'''
        c = Client()
        c.login(username='admin', password='test')
        url = reverse('operations-manage-incident-pk', args=[self.event.id])

        d = {'name': 'Tropical Storm Sandy',
             'event_location': 'United Stats',
             'description': 'This is a test incident',
             'posture': 'Deployed',
             'poc': 'Red Team',
             'status': '1',
             'event_type': 'Hurricane/Cyclone',
             'longitude': -74.4,
             'latitude': 38.8,
             'tags': 'hurricane, sandy, test',
        }

        response = c.post(url, data=d)
        #print response.context['form'].errors
        response = c.get(url)
        self.failUnlessEqual(response.context['form'].initial['name'], d['name'])

    def test_file_dropoff_validation(self):
        '''Make sure the filedropoff validation returns an error when user tries to list the root directory. '''
        d = self.event_data
        d['filedropoff_path'] = '../../../'
        e = EventForm(d)
        self.assertFalse(e.is_valid())
        self.assertTrue('filedropoff_path' in e.errors)

        d.pop('filedropoff_path')
        e = EventForm(d)
        self.assertTrue('filedropoff_path' not in e.errors)

    def test_perms_manage_incident_id(self):
        '''Test if an incident manage page returns a 302.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-manage-incident-pk', args=[self.event.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_delete_incident_id(self):
        '''Test if an incident manage page renders with an id.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-delete-incident-pk', args=[self.event.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_delete_incident_id(self):
        '''Test if an incident manage page returns a 302.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-delete-incident-pk', args=[self.event.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_manage_incident(self):
        '''Test if the operations_view_incident renders.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-manage-incident'))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_manage_incident(self):
        '''Test if the operations_view_incident renders.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-manage-incident'))
        self.failUnlessEqual(response.status_code, 302)

    def test_view_services(self):
        '''Test if the services view renders.'''
        c = Client()
        response = c.get(reverse('operations-view-services'))
        self.failUnlessEqual(response.status_code, 200)

    def test_view_service_id(self):
        '''Test if the services view renders with an id.'''
        c = Client()
        response = c.get(reverse('operations-view-service', args=[self.service.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_view_service_delete(self):
        '''Test if the services delete view renders with an id.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-delete-service-pk', args=[self.service.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_delete_service(self):
        '''Test if the services manage view returns a 302.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-delete-service-pk', args=[self.service.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_manage_service(self):
        '''Test if the services manage view renders.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-manage-service'))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_manage_service(self):
        '''Test if the services manage view returns a 302.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-manage-service'))
        self.failUnlessEqual(response.status_code, 302)

    def test_manage_service_pk(self):
        '''Test if the services manage view renders with a pk.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-manage-service-pk', args=[self.service.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_manage_service_pk(self):
        '''Test if the services manage view returns a 302.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-manage-service-pk', args=[self.service.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_manage_deployment_pk(self):
        '''Test if the deployment manage view renders with a pk.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-manage-deployment-pk', args=[self.deployment.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_manage_deployment_pk(self):
        '''Test if the deployment manage view renders with a pk.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-manage-deployment-pk', args=[self.deployment.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_manage_deployment(self):
        '''Test if the services manage view renders.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-manage-deployment'))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_manage_deployment(self):
        '''Test if the services manage view renders.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-manage-deployment'))
        self.failUnlessEqual(response.status_code, 302)

    def test_deployment_absolute_url(self):
        '''Test if the deployment absolute url renders.'''
        c = Client()
        response = c.get(self.deployment.get_absolute_url())
        self.failUnlessEqual(response.status_code, 200)

    def test_view_deployment(self):
        '''Test if the deployment view renders with a pk.'''
        c = Client()
        response = c.get(reverse('operations-view-deployment-pk', args=[self.deployment.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_view_lesson_learned(self):
        c = Client()
        response = c.get(reverse('operations-view-lesson-learned-pk', args=[self.lesson_learned.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_manage_lesson_learned(self):
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-manage-lesson-learned'))
        self.failUnlessEqual(response.status_code, 200)

    def test_post_lesson_learned(self):
        '''Tests that users without the lesson learned permission can create a lesson learned from the api'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.post(
            '{0}?format=json'.format(reverse('api_dispatch_list', args=[self.current_api_version, 'lesson-learned'])),
            json.dumps({'name': 'TEST', 'description': 'TESTING API'}), content_type='application/json')
        self.failUnlessEqual(response.status_code, 201)

    def test_perms_post_lesson_learned(self):
        '''Tests that users without the lesson learned permission cannot create a lesson learned from the api'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.post(
            '{0}?format=json'.format(reverse('api_dispatch_list', args=[self.current_api_version, 'lesson-learned'])),
            json.dumps({'name': 'TEST', 'description': 'TESTING API'}), content_type='application/json')
        self.failIfEqual(response.status_code, 201)

    def test_perms_manage_lesson_learned(self):
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-manage-lesson-learned'))
        self.failUnlessEqual(response.status_code, 302)

    def test_manage_lesson_learned_pk(self):
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-manage-lesson-learned-pk', args=[self.lesson_learned.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_manage_lesson_learned_pk(self):
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-manage-lesson-learned-pk', args=[self.lesson_learned.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_delete_lesson_learned_pk(self):
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-delete-lesson-learned-pk', args=[self.lesson_learned.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_delete_lesson_learned_pk(self):
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-delete-lesson-learned-pk', args=[self.lesson_learned.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_view_sitrep_pk(self):
        c = Client()
        response = c.get(reverse('operations-view-sitrep-pk', args=[self.sitrep.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_manage_sitrep_pk(self):
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-manage-sitrep-pk', args=[self.sitrep.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_manage_sitrep_pk(self):
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-manage-sitrep-pk', args=[self.sitrep.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_manage_sitrep(self):
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-manage-sitrep'))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_manage_sitrep(self):
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-manage-sitrep'))
        self.failUnlessEqual(response.status_code, 302)

    def test_delete_sitrep_pk(self):
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('operations-delete-sitrep-pk', args=[self.sitrep.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_delete_sitrep_pk(self):
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('operations-delete-sitrep-pk', args=[self.sitrep.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_view_sitreps(self):
        c = Client()
        response = c.get(reverse('operations-view-sitreps'))
        self.failUnlessEqual(response.status_code, 200)

    def test_events_list_api(self):
        '''Tests that the event-type api endpoint is working.'''
        c = Client()
        response = c.get(
            '{0}?format=json'.format(reverse('api_dispatch_list', args=[self.current_api_version, 'event-types'])))
        self.assertEqual(response.status_code, 200)

    def tearDown(self):
        self.event.delete()
        self.service_type.delete()
        self.service.delete()
        self.lesson_learned.delete()
        self.sitrep.delete()
        self.admin_user.delete()
        self.non_admin_user.delete()
    

    
    
    
