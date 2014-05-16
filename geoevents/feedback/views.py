# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.core.mail import send_mail
from django.conf import settings
from django.views.generic.edit import CreateView, FormView, UpdateView
from django.views.generic import ListView, DetailView, TemplateView
from django.core.urlresolvers import reverse_lazy
from django.shortcuts import redirect, get_object_or_404
from geoevents.core.views import PageHeaderMixin, MessagesModelFormMixin
from geoevents.feedback.forms import ArticleForm, FeedbackForm
from geoevents.feedback.models import Category, Article, SubjectEmailMap
from geoevents.operations.views import FormParametersFromGetParamsMixin


class FeedbackCreateView(PageHeaderMixin, MessagesModelFormMixin, FormParametersFromGetParamsMixin, CreateView):
    form_class = FeedbackForm
    template_name = "feedback-form.html"
    context_object_name = 'form'
    success_url = reverse_lazy('add-feedback')
    page_header = 'Submit Feedback'

    def send_email(self, recipients=settings.FEEDBACK_EMAIL_TO, from_email=settings.EMAIL_FROM_EMAIL):
        subject = 'Feedback Submitted for {0}'.format(self.object.subject)
        message = '''

        Subject: {0}
        Date Submitted: {1}
        From: {2}
        Email: {3}
        Organization: {4}
        Phone: {10}
        Login Method: {5}
        Platform: {6}
        Feedback: {7}
        HTTP_Referer: {8}

        User Agent: {9}
        '''.format(self.object.subject,
                   self.object.created,
                   self.object.name,
                   self.object.email,
                   self.object.organization,
                   self.object.login_method,
                   self.object.platform,
                   self.object.feedback.encode('utf-8'),
                   self.object.referer,
                   self.object.user_agent,
                   self.object.phone)

        try:
            obj = SubjectEmailMap.objects.get(subject=self.object.subject)
            recipients = obj.emails.split()
        except SubjectEmailMap.DoesNotExist: # this subject hasn't been defined yet
            pass

        send_mail(subject, message, from_email, recipients, fail_silently=True)

        if self.object.send_confirmation_email:
            send_mail(subject, message, from_email, [self.object.email], fail_silently=True)

    def get_initial(self):
        initial = super(FeedbackCreateView, self).get_initial()

        if hasattr(self.request, 'user'):
            initial['name'] = '{0} {1}'.format(getattr(self.request.user, 'first_name', ''),
                                               getattr(self.request.user, 'last_name', ''))
            initial['email'] = getattr(self.request.user, 'email', '')

        return initial

    def form_valid(self, form):
        obj = form.save(commit=False)
        obj.referer = self.request.META.get('HTTP_REFERER')
        obj.send_confirmation_email = True if self.request.POST.get('send_confirmation_email') else False
        obj.user_agent = self.request.META.get('HTTP_USER_AGENT', 'Unknown')
        obj.save()
        self.object = obj
        self.send_email()
        return super(FeedbackCreateView, self).form_valid(form)


class FAQsView(TemplateView):
    template_name = 'faqs.html'

    def get_context_data(self, **kwargs):
        context = super(FAQsView, self).get_context_data(**kwargs)
        context['common_issues'] = Article.objects.filter(common_issue=True, active=True)
        context['categories'] = Article.objects.filter(active=True).order_by('category')
        return context


class ArticleDetailView(DetailView):
    template_name = 'article-detail.html'
    context_object_name = 'item'
    slug_url_kwarg = 'slug'
    slug_field = 'slug'
    model = Article


class ArticleFormView(PageHeaderMixin, FormView):
    form_class = ArticleForm
    template_name = 'generic_form_page.html'
    page_header = 'Add FAQ'

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.last_updated_by = self.request.user
        self.object.save()
        self.success_url = self.object.get_absolute_url()
        return super(ArticleFormView, self).form_valid(form)


class ArticleCreateView(PageHeaderMixin, UpdateView):
    form_class = ArticleForm
    template_name = 'generic_form_page.html'
    page_header = 'Modify FAQ'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    queryset = Article.objects.all()

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.last_updated_by = self.request.user
        self.object.save()
        self.success_url = self.object.get_absolute_url()
        return super(ArticleCreateView, self).form_valid(form)


class CategoriesListView(ListView):
    template_name = 'category-detail.html'
    context_object_name = 'items'
    model = Category

    def get_queryset(self):
        self.category = get_object_or_404(Category, id=self.kwargs['object_id'])
        return Article.objects.filter(category=self.category)

    def get_context_data(self, **kwargs):
        context = super(CategoriesListView, self).get_context_data(**kwargs)
        context['category'] = self.category
        return context
