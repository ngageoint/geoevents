from paver.easy import *
from paver.setuputils import setup
import os
import sys
import time

sys.path.append(os.path.dirname(os.path.realpath(__file__)))

setup(
    name="geoevents",
    packages=['geoevents'],
    version='0.3.1.1',
    url="",
    author="Web Admin",
    author_email="Web Admin"
)


@task
def install_dependencies():
    """ Installs dependencies."""
    sh('pip install --upgrade -r geoevents/requirements.txt')


@task
def sync():
    """ Runs the syncdb process with migrations """
    sh("python manage.py syncdb --noinput")
    sh("python manage.py migrate --all")


@cmdopts([
    ('bind=', 'b', 'Bind server to provided IP address and port number.'),
])
@task
def start_django(options):
    """ Starts the Django application. """
    bind = options.get('bind', '')
    sh('python manage.py runserver %s &' % bind)


@task
def delayed_fixtures():
    """Loads maps"""
    sh('python manage.py loaddata maps.layer.json maps.map.json sites.site.json operations.geowidget.json')


@task
def stop_django():
    """
    Stop the GeoNode Django application
    """
    kill('python', 'runserver')


@needs(['stop_django',
        'sync',
        'delayed_fixtures',
        'start_django'])
def start():
    """ Syncs the database and then starts the development server. """
    info("The Event Pages are now available.")


@task
def stop():
    """ Syncs the database and then starts the development server. """
    stop_django()


@cmdopts([
    ('template=', 'T', 'Database template to use when creating new database, defaults to "template_postgis"'),
])
@task
def create_db_old_postgres(options):
    """ Creates the database in postgres. """
    from geoevents import settings

    template = options.get('template', 'template1')
    database = settings.DATABASES.get('default').get('NAME')
    sh('createdb {database} -T {template}'.format(database=database, template=template))


@cmdopts([
    ('template=', 'T', 'Database template to use when creating new database, defaults to "template_postgis"'),
])
@task
def create_db(options):
    """ Creates the database in postgres. """
    from geoevents import settings

    template = options.get('template', 'template1')
    database = settings.DATABASES.get('default').get('NAME')
    sh('createdb {database} -T {template}'.format(database=database, template=template))

    sql = '"CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;"'
    sh('psql -d {database} -c {sql}'.format(database=database, sql=sql))


@task
def create_db_user():
    """ Creates the database in postgres. """
    from geoevents import settings

    database = settings.DATABASES.get('default').get('NAME')
    user = settings.DATABASES.get('default').get('USER')
    password = settings.DATABASES.get('default').get('PASSWORD')

    sql = '"CREATE USER {user} WITH PASSWORD \'{password}\';"'.format(user=user, password=password)
    sh('psql -d {database} -c {sql}'.format(database=database, sql=sql))


@task
def shell():
    sh('python manage.py shell')


@task
def deploy_django_test():
    destination = '/ozone/geoevents_test'
    assert os.path.exists(destination), '{destination} does not exist'.format(destination=destination)


def kill(arg1, arg2):
    """Stops a proces that contains arg1 and is filtered by arg2
    """
    from subprocess import Popen, PIPE

    # Wait until ready
    t0 = time.time()
    # Wait no more than these many seconds
    time_out = 30
    running = True
    lines = []

    while running and time.time() - t0 < time_out:
        p = Popen('ps aux | grep %s' % arg1, shell=True,
                  stdin=PIPE, stdout=PIPE, stderr=PIPE, close_fds=True)

        lines = p.stdout.readlines()

        running = False
        for line in lines:

            if '%s' % arg2 in line:
                running = True

                # Get pid
                fields = line.strip().split()

                info('Stopping %s (process number %s)' % (arg1, fields[1]))
                kill_cmd = 'kill -9 %s 2> /dev/null' % fields[1]
                os.system(kill_cmd)

        # Give it a little more time
        time.sleep(1)
    else:
        pass

    if running:
        raise Exception('Could not stop %s: '
                        'Running processes are\n%s'
                        % (arg1, '\n'.join([l.strip() for l in lines])))
