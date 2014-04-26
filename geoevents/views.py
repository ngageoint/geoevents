# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.auth.views import logout
from django.contrib.auth.models import User, Group
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse, reverse_lazy
from django.http import HttpResponse, HttpResponseForbidden
from django.shortcuts import redirect, get_object_or_404
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.generic import TemplateView, UpdateView, ListView
from geoevents.forms import UserForm


class UserPermsUpdate(UpdateView):
    template_name = 'perms.html'
    model = User
    form_class = UserForm
    context_object_name = 'item'
    success_url = reverse_lazy('home')

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()

        if self.object != self.request.user and not self.request.user.is_superuser:
            ## User is accessing another users information
            raise PermissionDenied

        return super(UserPermsUpdate, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()

        if self.object != self.request.user and not self.request.user.is_superuser:
            ## User is accessing another users information
            raise PermissionDenied

        return super(UpdateView, self).post(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        cv = super(UserPermsUpdate, self).get_context_data(**kwargs)
        cv['groups'] = []
        cv['username'] = self.kwargs.get('username')
        for group in Group.objects.all():
            cv['groups'].append(
                (group.name, 'Member' if group in self.object.groups.filter(name=group.name) else 'Not A Member'))
        return cv

    def get_object(self):
        return get_object_or_404(User.objects.filter(username=self.kwargs.get('username', None)))


def logout_view(request):
    logout(request)
    return redirect(reverse('home'))


def prefix_redirect(request):
    return redirect(reverse('home'))
