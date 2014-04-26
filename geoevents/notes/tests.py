# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse
from django.test import TestCase
from django.test.utils import override_settings
from django.test.client import Client
from geoevents.core.tests import R3TestCaseMixin
from geoevents.notes.models import Note


@override_settings(AUTHENTICATION_BACKENDS=('django.contrib.auth.backends.ModelBackend',))
class SimpleTest(R3TestCaseMixin, TestCase):
    fixtures = ['maps.json']

    def setUp(self):
        super(SimpleTest, self).setUp()

        self.note = Note.objects.create(title='Test note',
                                        content='This is a test note.',
                                        public=True,
                                        owner=self.admin_user,
                                        content_object=self.admin_user,
        )

    def test_notes_view_notes(self):
        '''Test if the notes page renders.'''
        c = Client()
        response = c.get(reverse('notes-view-notes'))
        self.failUnlessEqual(response.status_code, 200)

    def test_note_view_note(self):
        '''Test if an individual note view renders.'''
        c = Client()
        response = c.get(reverse('notes-view-note', args=[self.note.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_notes_manage_note(self):
        '''Test if the add new note view works.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('notes-manage-note'))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_notes_manage_note(self):
        '''Test if the add new note view returns 302.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('notes-manage-note'))
        self.failUnlessEqual(response.status_code, 302)

    def test_notes_manage_note_id(self):
        '''Test if the add new note view works.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('notes-manage-note-id', args=[self.note.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_notes_manage_note_id(self):
        '''Test if the add new note view returns 302.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('notes-manage-note-id', args=[self.note.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_notes_delete_note_id(self):
        '''Test if the add new note view works.'''
        c = Client()
        c.login(username='admin', password='test')
        response = c.get(reverse('notes-delete-note-id', args=[self.note.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_notes_delete_note_id(self):
        '''Test if the delete note view returns 302.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('notes-delete-note-id', args=[self.note.id]))
        self.failUnlessEqual(response.status_code, 302)

    def test_perms_notes_manage_model_id(self):
        '''Test if the manage view returns a 302 when model and object_id are provided.'''
        c = Client()
        c.login(username='non_admin', password='test')
        response = c.get(reverse('notes-manage-note-model-id', kwargs={'model': 'user', 'pk': 1}))
        self.failUnlessEqual(response.status_code, 302)
        c.logout()

        c.login(username='admin', password='test')
        response = c.get(reverse('notes-manage-note-model-id', kwargs={'model': 'user', 'pk': 1}))
        self.failUnlessEqual(response.status_code, 200)

    def test_note_create_view(self):
        '''Tests the notes create view.'''
        c = Client()
        c.login(username='admin', password='test')
        table_name = 'user'
        user_table = ContentType.objects.get(model=table_name).id
        object_id = 1
        data = {'title': 'Testing',
                'content': 'This is a test',
                'public': True,
                'content_type': user_table,
                'object_id': object_id,
        }
        response = c.post(reverse('notes-manage-note'), data=data, follow=True)
        self.failUnlessEqual(response.status_code, 200)

        n = Note.objects.get(title='Testing')
        self.assertEqual(n.content_type.id, user_table)
        self.assertEqual(n.object_id, object_id)

        n.delete()

        for key in ['content_type', 'object_id']:
            data.pop(key)

        response = c.post(reverse('notes-manage-note-model-id', kwargs={'model': table_name, 'pk': object_id}),
                          data=data, follow=True)
        self.failUnlessEqual(response.status_code, 200)
        n = Note.objects.get(title='Testing')
        self.assertEqual(n.content_type.id, user_table)
        self.assertEqual(n.object_id, object_id)

    def tearDown(self):
        self.admin_user.delete()
        self.non_admin_user.delete()
        self.note.delete()
