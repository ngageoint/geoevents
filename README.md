Geo-Events
=======

#### Geographic Event tracking and data management system ####

Geo-Events is a geographic-oriented knowledge management platform that gives users a common operational picture for tracking events such as hurricanes, tornadoes, floods, etc.  The tasking elements of [GeoQ]  (https://github.com/ngageoint/geoq) work well with the organizational functionality of Geo-Events.    

The Geo-Events software was developed at the National Geospatial-Intelligence Agency (NGA) as a joint effort between NGA and The MITRE Corporation. The government has "unlimited rights" and is releasing this software into the public domain to increase the impact of government investments by providing developers with the opportunity to take things in new directions.  You can copy, modify, combine with other software, distribute and perform the work, even for commercial purposes, all without asking permission.  NGA assumes no responsibility for the use of the software by any parties, and makes no guarantees, expressed or implied, about the software quality, reliability, or any other characteristic.  The Geo-Events software can be redistributed and/or modified freely provided that any derivative work bears the following notice: "Elements of this work contain Geo-Events: The National Geospatial-Intelligence Agency and The MITRE Corporation jointly produced this work."

### Pull requests ###

If you'd like to contribute to this project, please make a pull request. We'll review the pull request and discuss the changes. By submitting a pull request you are dedicating your work to the public domain.  You are free to fork this project and add unique elements with other stipulations in another repository, platform, or private development space, but this living version shall remain free of restrictions within the public domain.  

###In the News###
NGA Director Letitia Long talks about NGA's GitHub initiative and our first offerings, GeoQ and Geo-Events, at the GEOINT Symposium.  Her comments start at 40 minutes and 40 seconds in the [video clip] (http://geointv.com/archive/geoint-2013-keynote-letitia-a-long/).


###This project realies heavily on open source packages and uses:###

Django under [BSD] (https://github.com/django/django/blob/master/LICENSE)

OpenLayers under [FreeBSD] (https://raw.githubusercontent.com/openlayers/openlayers/master/license.txt)

Postgres under [PostgreSQL license] (http://www.postgresql.org/about/licence/)

PostGIS under [GPL version 2] (http://opensource.org/licenses/gpl-2.0.php)


### Geo-Events Configuration ###

The ``geoevents/settings.py`` file contains installation-specific settings. The Database name/pw and server URLs will need to be configured here.

### Screenshots ###

![Geo-Events Main page](https://cloud.githubusercontent.com/assets/147580/2809374/4021437e-cd6b-11e3-9c60-32030cfee63f.png)
![Sample Event Page](https://cloud.githubusercontent.com/assets/147580/2809375/402542bc-cd6b-11e3-97b0-2c53669c13ff.png)
![Event Page with geo-tagged photos](https://cloud.githubusercontent.com/assets/147580/2809376/402590aa-cd6b-11e3-83c9-e3bdf49bf491.png)
![Tables auto-generated from data feed content](https://cloud.githubusercontent.com/assets/147580/2809377/4025c638-cd6b-11e3-8dbe-cd5b97c32da7.png)
![Timeline generated from products/rfis/notes/events](https://cloud.githubusercontent.com/assets/147580/2809378/40279a76-cd6b-11e3-8693-a43c5c5a3fb7.png)


Installation
============

Cloud Installation::

1. You can optionally deploy geoevents with all dependencies to a Virtual Machine or a cloud VM (such as an Amazon Web Services EC2 box) by using the chef installer at [https://github.com/ngageoint/geoevents-chef-installer](https://github.com/ngageoint/geoevents-chef-installer)

2. Chef scripts are our preferred method of automating cloud builds


Mac OSX Development Build Instructions (about 1 hour total)::

    For older macs, Install XCode, update to latest, From Preferences->Downloads, install command line tools (or will get clang errors)

    (open terminal window)
    sudo easy_install pip
    Download Postgres.app (google it. After installing, run it - should see an Elephant icon on the toolbar)
    sudo pip install virtualenv
    virtualenv geoevents_dev
    add to: ~/.bash_login:
        export PATH=/Applications/Postgres93.app/Contents/MacOS/bin:/Library/Frameworks/Python.framework/Versions/Current/bin:$PATH
        export PGHOST=localhost
        export LDFLAGS="-L/usr/X11/lib"
        export CFLAGS="-I/usr/X11/include -I/usr/X11/include/freetype2 -I/usr/X11/include/libpng12"

        source geoevents_dev/bin/activate
    (close terminal, open new one)

    pip install psycopg2  (Note that some distros e.g. Debian might need it installed via: sudo apt-get build-dep python-psycopg2)
    pip install numpy
    install homebrew (from terminal):
        ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go/install)"

    brew install postgis
    brew install gdal (probably already installed)
    brew install libgeoip

    pip install Paver

    paver install_dependencies
    paver create_db
    paver create_db_user
    paver sync
    python manage.py createsuperuser

    paver start

API
===

    JSON of geographic layers
    http://127.0.0.1:8000/api/v1/layer/?format=json&limit=100

