# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.core import mail
from django.test import TestCase
from django.test.client import Client
from django.test.utils import override_settings
from geoevents.core.tests import R3TestCaseMixin
from geoevents.feedback.forms import FeedbackForm
from geoevents.feedback.models import Article, Category


@override_settings(AUTHENTICATION_BACKENDS=('django.contrib.auth.backends.ModelBackend',))
@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class FeedbackTest(R3TestCaseMixin, TestCase):
    fixtures = ['maps.json']

    def setUp(self):
        super(FeedbackTest, self).setUp()

        self.feedback_data = {'name': 'Testing',
                              'subject': 'Landing Page',
                              'login_method': 'CAC Card',
                              'platform': 'Desktop',
                              'email': 'test@aol.com',
                              'feedback': 'this is a test',
                              'send_confirmation_email': 'True'}

        self.faq_category = Category.objects.create(name='name')
        self.faq = Article.objects.create(title='Testing FAQ fucntionality',
                                          category=self.faq_category,
                                          common_issue=True,
                                          content="Just testing FAQs",

        )

        self.article_data = {'title': 'More Testing Data',
                             'category': self.faq_category.id,
                             'content': 'More testing data here!'}

    def test_view_feedback(self):
        '''Test if the feedback view renders.'''
        c = Client()
        response = c.get(reverse('add-feedback'))
        self.failUnlessEqual(response.status_code, 200)

    def test_valid_feedback(self):
        '''Make sure the feedback is valid'''
        f = FeedbackForm(self.feedback_data)
        self.assertTrue(f.is_valid())

    def test_post_feedback(self):
        '''Test if the feedback view renders.'''
        c = Client()
        response = c.post(reverse('add-feedback'), self.feedback_data)
        self.failUnlessEqual(response.status_code, 302)

        ## Verify email is triggered to team and submitter
        self.failUnlessEqual(len(mail.outbox), 2)

    def test_post_feedback_no_confirmation(self):
        '''Test that data posts successfully and the submitter is not emailed'''
        c = Client()
        self.feedback_data.pop('send_confirmation_email')
        response = c.post(reverse('add-feedback'), self.feedback_data)
        self.failUnlessEqual(response.status_code, 302)

        ## Verify email is triggered to team and submitter
        self.failUnlessEqual(len(mail.outbox), 1)

    def test_faqs(self):
        '''Test the FAQs view'''
        c = Client()
        response = c.get(reverse('feedback-faqs'))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_faqs_manage_article(self):
        '''Test the manage article view permissions'''
        c = Client()
        response = c.get(reverse('feedback-manage-article'))
        self.failUnlessEqual(response.status_code, 403)

    def test_perms_faqs_manage_article_admin(self):
        '''Test the manage article view'''
        c = Client()
        c.login(username=self.admin_user.username, password='test')
        response = c.get(reverse('feedback-manage-article'))
        self.failUnlessEqual(response.status_code, 200)

    def test_perms_faqs_manage_post_article_admin(self):
        '''Test creating a new article via the web'''
        c = Client()
        c.login(username=self.admin_user.username, password='test')
        response = c.post(reverse('feedback-manage-article'), data=self.article_data)
        self.failUnlessEqual(response.status_code, 302)

    def test_faqs_view_category(self):
        '''Test the view category view'''
        c = Client()
        response = c.get(reverse('feedback-view-categories', args=[self.faq_category.id]))
        self.failUnlessEqual(response.status_code, 200)

    def test_faqs_view_article(self):
        '''Test the view article view'''
        c = Client()
        response = c.get(reverse('feedback-view-article', args=[self.faq.slug]))
        self.failUnlessEqual(response.status_code, 200)






