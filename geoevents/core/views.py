# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib import messages
from django.views.generic.edit import CreateView, ModelFormMixin, UpdateView


class ObjectNameMixin(object):
    def get_object_name(self):
        if hasattr(self, 'model') and self.model:
            return self.model._meta.verbose_name
        elif hasattr(self, 'form_class') and self.form_class:
            return self.form_class._meta.model._meta.verbose_name
        else:
            return None

    def get_context_data(self, **kwargs):
        cv = super(ObjectNameMixin, self).get_context_data(**kwargs)
        cv['object_name'] = self.get_object_name().title()
        return cv


class PageHeaderMixin(ObjectNameMixin):
    page_header = None

    def page_header_message(self, object_name, action='Create/Update'):
        """
        Concatenates the an action with an object name.
        """
        return '{1} {0}'.format(action, object_name.title())

    def get_page_header(self):
        """
        Returns the page_header attribute if it is populated.  Returns the verbose name of the model or form class if
        the page_header is not populated.
        """
        if hasattr(self, 'page_header') and self.page_header:
            return self.page_header
        else:
            return self.page_header_message(self.get_object_name())

    def get_context_data(self, **kwargs):
        cv = super(PageHeaderMixin, self).get_context_data(**kwargs)
        cv['page_header'] = self.get_page_header()
        return cv


class MessagesModelFormMixin(ModelFormMixin):
    """ Adds messages to the ModelFormMixin """
    success_message = None
    error_message = None

    def get_success_message(self):

        name = None

        if self.success_message:
            return self.success_message
        else:
            if self.model:
                name = self.model._meta.verbose_name
            elif self.form_class:
                name = self.form_class._meta.model._meta.verbose_name

        return '{0} saved.'.format(name.title())

    def get_error_message(self):
        name = None

        if self.error_message:
            return self.error_message
        else:
            if self.model:
                name = self.model._meta.verbose_name
            elif self.form_class:
                name = self.form_class._meta.model._meta.verbose_name

        return 'Unable to save {0}.  Please fix validation errors.'.format(name.title())

    def form_valid(self, form):
        messages.success(self.request, self.get_success_message())
        return super(MessagesModelFormMixin, self).form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, self.get_error_message())
        return super(MessagesModelFormMixin, self).form_invalid(form)


class UpdateViewWithMessages(PageHeaderMixin, MessagesModelFormMixin, UpdateView):
    def page_header_message(self, verbose_name):
        return 'Edit {0}'.format(verbose_name.title())


class CreateViewWithMessages(PageHeaderMixin, MessagesModelFormMixin, CreateView):
    def page_header_message(self, verbose_name):
        return 'Create {0}'.format(verbose_name.title())