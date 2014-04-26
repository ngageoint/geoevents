# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django import forms
from geoevents.core.forms import StyledModelForm
from geoevents.feedback.models import Article, Feedback


class ArticleForm(StyledModelForm):
    class Meta:
        model = Article
        fields = ('title', 'category', 'content', 'tags', 'common_issue', 'active')


class FeedbackForm(StyledModelForm):
    send_confirmation_email = forms.BooleanField(required=False, initial=True)
    error_css_class = 'error'

    class Meta:
        model = Feedback
        fields = ('name', 'email', 'organization', 'phone', 'subject', 'login_method', 'platform', 'feedback')