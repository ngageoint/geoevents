# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.gis.db import models

class ActiveObjects(models.GeoManager):
    def get_query_set(self):
        return super(ActiveObjects, self).get_query_set().filter(status=1)