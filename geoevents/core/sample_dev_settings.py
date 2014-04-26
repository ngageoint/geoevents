# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from settings import INSTALLED_APPS, MIDDLEWARE_CLASSES, LOGGING

DEBUG = True
SITE_ID = 3 #Site 3 is localhost
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
AUTHENTICATION_BACKENDS = ('django.contrib.auth.backends.ModelBackend',)
TASTYPIE_FULL_DEBUG = DEBUG
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'harvester_app',                      # Or path to database file if using sqlite3.
        'USER': 'harvester_app',                      # Not used with sqlite3.
        'PASSWORD': 'fixme',                  # Not used with sqlite3.
        'HOST': 'localhost',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
    }
}
EVENT_FILE_DROPOFF_ROOT = '/tmp/events/'

# Uncomment to use the django debug toolbar.
#INSTALLED_APPS = INSTALLED_APPS + ('debug_toolbar',)
#INTERNAL_IPS = ('127.0.0.1',)
#MIDDLEWARE_CLASSES = MIDDLEWARE_CLASSES + ('debug_toolbar.middleware.DebugToolbarMiddleware',)

STATIC_URL_FOLDER = ''
STATIC_URL = '{0}{1}'.format('/static/', STATIC_URL_FOLDER)
STATIC_ROOT = ''
COMPRESS_ENABLED = False

# Settings for the SMTS app.
SMTS_ENDPOINT = 'http://stlsou.egovservices.net/underworld/metadatapublishservice'
SMTS_ENDPOINT_AUTH = None #Change me to the correct username and password

# You *might* have to switch the imported application your dev box since the wsgi.py isn't part of an existing
# 'geoevents.wsgi' module and is imported directly from the root path
#WSGI_APPLICATION = 'wsgi.application'

HARVESTER_ROOT = '/tmp'

LOGGING['formatters']={'verbose':{
    'format': '%(levelname)s %(asctime)s %(module)s %(funcName)s %(process)d %(thread)d %(message)s'
}}

LOGGING['handlers']['console']= {
    'level': 'DEBUG',
    'class': 'logging.StreamHandler',
    'formatter': 'verbose',
    }

LOGGING['loggers']['geoevents'] = {
    'handlers': ['console'],
    'level': 'DEBUG',
    }


