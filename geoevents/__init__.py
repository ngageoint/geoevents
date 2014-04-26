# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'geoevents.settings'

#major.minor[.build[.revision]]
__version__ = (0, 1, 1, 'alpha', 3)