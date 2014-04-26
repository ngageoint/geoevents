====
Core
====

Core is a Django app that stores project-wide functionality not suitable
for a specific app.  This includes functionality like the site-wide menu,
custom authentication backends, generic forms and views, and special test
cases.

TODO: Add documentation for /templatetags, /management, and /gis.

auth.py
-------

Stores custom authentication backends that are used during various deployment
scenerios.

1. CaseInsensitiveRemoteUserBackend
   Converts a remote user variable to lowercase and takes the 1st-30th characters.
   This was created to avoid problems with Django's username field from the
   auth.models.User model which is only 30 characters long.

2. GeoAxisRemoteUserBackend
   Authentication backend that overrides the REMOTE_USER_BACKEND to match
   the header value specified by GeoAxis.

forms.py
--------

Stores custom forms.

1. StyledModelForm
   Adds the twitter bootstrap "span5" class to form elements to override
   Bootstrap's default form length.


sample_dev_settings.py
----------------------

A sample dev_settings.py for new developers.  If you are developing or
testing this application locally you need to create the dev_settings.py
file in the geoevents directory.  This configuration file
will override the settings.py file with your local settings.  Dev_settings.py
is ignored by default in the version control repository.

tests.py
--------

Tests for functionality added in the core app and site-wide tests that do
not have a more appropriate location.

1. disconnect_signal
   Disconnects signals when running tests.  Useful for signals that make
   requests to production systems.

2. reconnect_signal
   Reconnects disconnected signals.

3. TestCaseMixin
   A test case mixin that should be subclassed by every test case in the
   project.  This mixin abstracts functionality that
   should be ran for every test case, like disabling signals.  If a
   developer neglects to include this in test cases, it could result in
   a large number of requests being made to downstream applications and
   other unwanted and unattended results.

views.py
--------

Common view functionality.

1. PageHeaderMixin
   Uses the page_header class attribute to set the header of a page.  This
   helps the developer write more generalized code and is especially useful
   in common CRUD operations where the form's header changes slightly.

2. MessagesModelFormMixin
   A mixin that add's Django's Messaging framework into forms.  The mixin
   is designed to be easily added to forms and provide the desired
   messaging functionality.

