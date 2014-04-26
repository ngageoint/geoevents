# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

import os
import django
from django.utils.functional import lazy

# calculated paths for django and the site
# used as starting points for various other paths
DJANGO_ROOT = os.path.dirname(os.path.realpath(django.__file__))
SITE_ROOT = os.path.dirname(os.path.realpath(__file__))

######################################################################
# These variables require modification when migrating to production. #
######################################################################
SITE_ID = 1
STATIC_URL_FOLDER = ''  # Can be set to something like 'geoevents-test/' if the app is not run at root level
COMPRESS_ENABLED = False
DATABASES = {
    'default': dict(ENGINE='django.contrib.gis.db.backends.postgis',
                    NAME='geoevents',
                    USER='geoevents',
                    PASSWORD='geoevents',
                    HOST='', PORT='')
}


# Variable appended to STATIC_ROOT and STATIC_URL
CURRENT_API_VERSION = "v1"
######################################################################

DEBUG = True
TEMPLATE_DEBUG = DEBUG
TASTYPIE_FULL_DEBUG = DEBUG

ADMINS = (
    ('Your Name', 'admin@yourserver.com'),
)

EMAIL_FROM_EMAIL = 'noreply@yourserver.com'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'mailserver.yourserver.com'
MANAGERS = ADMINS

HOMEPAGE_URL = 'http://www.google.com/'
RFI_GENERATOR_URL = '/rfi'
REQUEST_ACCOUNT_URL = 'http://www.yourserver.com'
NEW_ACCOUNT_2_NAME = 'Request Additional Account'
NEW_ACCOUNT_2_URL = 'http://www.yourserver2.com'
SSO_URL = 'https://sso.yourserver.mil/opensso'
FEEDBACK_NAME = 'Press Page'
FEEDBACK_URL = 'http://www.yourserver.com/contact'
FEEDBACK_EMAIL_TO = ['contact-admins@yourserver.com']
EMAIL_NEW_EVENT_TO = ['contact-admins@yourserver.com']
PRODUCT_FEED_FORMAT = 'http://www.yourserver.com/product_list?name={0}&tags={1}'
BRANDING_LOGO_URL = '/static/images/storm.png'
SITE_TITLE = "Geo Events Pages"

FIXTURE_DIRS = (
    os.path.join(SITE_ROOT, 'fixtures'),
)

ALLOWED_HOSTS = ['127.0.0.1']

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/New_York'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = '{0}{1}'.format('/usr/src/static/', STATIC_URL_FOLDER)

# URL prefix for static files.
STATIC_URL = '{0}{1}'.format('/static/', STATIC_URL_FOLDER)


# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(SITE_ROOT, 'static'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    #    'django.contrib.staticfiles.finders.DefaultStorageFinder',
    'compressor.finders.CompressorFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '-6-hqg2*q7v!t%fie&amp;3)zxx=&amp;ei&amp;i%bdf5l8j!o=c))6b-u_1d'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    #     'django.template.loaders.eggs.Loader',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.request',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.tz',
    'django.core.context_processors.static',
    'geoevents.contextprocessors.resource_urls',
    'geoevents.core.contextprocessors.app_settings',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.RemoteUserMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',

    #populates a users profile from OpenSSO attributes
    'geoevents.core.middleware.OpenSSO',

    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'geoevents.core.auth.GeoAxisRemoteUserMiddleware',
)

ROOT_URLCONF = 'geoevents.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'geoevents.wsgi.application'

TEMPLATE_DIRS = (
    os.path.join(SITE_ROOT, 'templates')
)

FILER_STORAGES = {
    'public': {
        'main': {
            'ENGINE': 'filer.storage.PublicFileSystemStorage',
            'OPTIONS': {
                'location': os.path.join(SITE_ROOT, 'static/filer'),
                'base_url': '/static/filer',
            },
            'UPLOAD_TO': 'filer.utils.generate_filename.by_date',
        },
        'thumbnails': {
            'ENGINE': 'filer.storage.PublicFileSystemStorage',
            'OPTIONS': {
                'location': os.path.join(SITE_ROOT, 'static/filer'),
                'base_url': '/static/filer/filer_public_thumbnails',
            },
        },
    },
    'private': {
        'main': {
            'ENGINE': 'filer.storage.PrivateFileSystemStorage',
            'OPTIONS': {
                'location': '/path/to/smedia/filer',
                'base_url': '/smedia/filer/',
            },
            'UPLOAD_TO': 'filer.utils.generate_filename.by_date',
        },
        'thumbnails': {
            'ENGINE': 'filer.storage.PrivateFileSystemStorage',
            'OPTIONS': {
                'location': '/path/to/smedia/filer_thumbnails',
                'base_url': '/smedia/filer_thumbnails/',
            },
        },
    },
}

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.admindocs',
    'django.contrib.gis',
    'django.contrib.markup',
    'geoevents.maps',
    'geoevents.operations',
    'geoevents.notes',
    'geoevents.feedback',
    'geoevents.taggit',
    'geoevents.core',
    'geoevents.heartbeat',
    'geoevents.director',
    'tinymce',
    'geoevents.timeline',
    'south',
    'compressor',
    'geoevents.classification',
    'filer',

)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'geoevents.core.auth.CaseInsensitiveRemoteUserBackend',
)


# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
# log_file = os.path.join(SITE_ROOT, 'log', 'geoevents.log')
# import os
#
# if not os.path.exists(log_file):
#     open('file', 'w').close()

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'formatters': {
        'verbose': {'format': '%(levelname)s %(asctime)s %(module)s %(funcName)s %(process)d %(thread)d %(message)s'}
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        # 'geoevents_rotating': {
        #     'level': 'INFO',
        #     'class': 'logging.handlers.RotatingFileHandler',
        #     'formatter': 'verbose',
        #     'filename': log_file,
        #     'backupCount': 5,
        #     'maxBytes': 5242880,
        # },
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        # 'geoevents': {
        #     'handlers': ['geoevents_rotating'],
        #     'level': 'INFO',
        # }
    }
}


# Override production settings with local settings if they exist
try:

    from dev_settings import *

except ImportError, e:
    # dev_settings does not exist
    pass


def base_url():
    """
    Uses a site object to create the base_url
    Since this is in settings.py make sure it is called lazily.
    """
    from django.contrib.sites.models import Site

    domain = Site.objects.get_current().domain
    protocol = 'http://' if 'localhost' in domain else 'https://'
    return '{0}{1}'.format(protocol, domain)


BASE_URL = lazy(base_url, str)
LOGIN_URL = r'/accounts/login/'
LOGOUT_URL = r'/accounts/logout/'