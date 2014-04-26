# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.auth.decorators import permission_required
from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from geoevents.feedback.views import ArticleFormView, ArticleCreateView, FeedbackCreateView, CategoriesListView, \
    ArticleDetailView, FAQsView


urlpatterns = patterns('',
                       url(r'^add/$', FeedbackCreateView.as_view(), name='add-feedback'),
                       url(r'^success/$', TemplateView.as_view(template_name='feedback-submitted.html'),
                           name='feedback-success'),
                       url(r'^faqs/$', FAQsView.as_view(), name='feedback-faqs'),
                       url(r'^categories/(?P<object_id>\d+)/$', CategoriesListView.as_view(),
                           name='feedback-view-categories'),
                       url(r'^articles/add/$', permission_required('feedback.change_article', raise_exception=True)(
                           ArticleFormView.as_view()), name='feedback-manage-article'),
                       url(r'^articles/manage/(?P<slug>[\d\w\-]+)/$',
                           permission_required('feedback.change_article', raise_exception=True)(
                               ArticleCreateView.as_view()), name='feedback-manage-article'),
                       url(r'^articles/(?P<slug>[\d\w\-]+)/$', ArticleDetailView.as_view(),
                           name='feedback-view-article'),

)

