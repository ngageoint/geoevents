# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.auth.models import User
from tastypie.authorization import DjangoAuthorization
from tastypie.contrib.gis.resources import ModelResource


class UserResource(ModelResource):
    """
    Exposes user data in API.
    """
    class Meta:
        queryset = User.objects.all()
        resource_name = 'user'
        authorization = DjangoAuthorization()
        allowed_methods = []
        always_return_data = True
        fields = ['username']