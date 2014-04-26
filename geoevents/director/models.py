# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.gis.db import models
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse, reverse_lazy
from geoevents.notes.models import Note
import json
from django.utils import simplejson
from django.core import serializers
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from .managers import ActiveObjects


class RatedBase(models.Model):
    created = models.DateTimeField(auto_now_add=True, verbose_name="Date Created")
    last_updated = models.DateTimeField(auto_now=True, null=True)
    rating_count = models.IntegerField(max_length=1000, default=1, help_text="Importance Level - Number of Votes")

    def notes(self):
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id)

    class Meta:
        abstract = True
        ordering = ['-created']


    ## TODO: Use on more objects
    # additional_methods = ['__unicode__', ]
    #
    # def get_params(self, requested_methods=None, only_variables=None):
    #     """
    #     Converts parameters to object.
    #
    #     Options:
    #         requested_methods = ['__unicode__', ] (to also call these functions and return results)
    #         only_variables = ['name', 'title', ] (to only return values of these model variables)
    #
    #     """
    #     additional_methods = self.additional_methods
    #
    #     if requested_methods:
    #         additional_methods = requested_methods + additional_methods
    #     dumps = dict()
    #
    #     if not only_variables:
    #         model_fields = [field.name for field in self._meta.fields]
    #     else:
    #         model_fields = only_variables
    #
    #     for field in model_fields:
    #         dumps[str(field)] = str(self.__getattribute__(field))
    #     for func in additional_methods:
    #         dumps[func] = getattr(self, func)()
    #     return dumps
    #
    # def get_json(self):
    #     return json.dumps(self.get_params(), ensure_ascii=True)


class ProgramInfo(models.Model):
    """
    Information about a project
    """
    name = models.CharField(help_text="Program name", max_length=200, unique=True)
    details = models.TextField(help_text="Program details", blank=True, null=True)

    government_pm = models.CharField(help_text="Govt Point of Contact for Management Issues", max_length=200,
                                     blank=True, null=True)
    government_cor = models.CharField(help_text="Point of Contact for Technical Issues", max_length=200, blank=True,
                                      null=True)
    government_cotr = models.CharField(help_text="Point of Contact for Technical Issues", max_length=200, blank=True,
                                       null=True)
    contractor = models.CharField(help_text="Point of Contact for Technical Issues", max_length=200, blank=True,
                                  null=True)
    contract_type = models.CharField(help_text="Point of Contact for Technical Issues", max_length=200, blank=True,
                                     null=True)
    period_of_performance = models.CharField(help_text="Point of Contact for Technical Issues", max_length=200,
                                             blank=True, null=True)

    url = models.TextField(help_text="Link to another page when title is clicked", blank=True, null=True)

    def __unicode__(self):
        return '{0}'.format(self.name)

    def info_obj(self):
        ##TODO: Return only last 3 observations
        last_observations = self.programobservation_set.all()
        info = {
            'id': self.id,
            'name': self.name,
            'details': self.details,
            'government_pm': self.government_pm,
            'government_cor': self.government_cor,
            'government_cotr': self.government_cotr,
            'contractor': self.contractor,
            'contract_type': self.contract_type,
            'period_of_performance': self.period_of_performance,

            'url': self.url,
            'observations': [obs.info_obj() for obs in last_observations]
        }
        return info

    class Meta(RatedBase.Meta):
        verbose_name_plural = 'Programs of Record'
        ordering = ['name']


class Billet(models.Model):
    """
    This model is for Billets
    """
    STATUS_OPEN = 0
    STATUS_FILLED = 1
    STATUS_STARTED = 2
    STATUS_CLOSED = 3
    STATUS_CHOICES = (
        (STATUS_OPEN, 'Open'), (STATUS_FILLED, 'Filled'), (STATUS_STARTED, 'Started'), (STATUS_CLOSED, 'Closed'))
    BAND_GS10 = "gs10"
    BAND_GS11 = "gs11"
    BAND_GS12 = "gs12"
    BAND_GS13 = "gs13"
    BAND_GS14 = "gs14"
    BAND_GS15 = "gs15"
    BAND_CHOICES = ((BAND_GS10, BAND_GS10), (BAND_GS11, BAND_GS11), (BAND_GS12, BAND_GS12), (BAND_GS13, BAND_GS13),
                    (BAND_GS14, BAND_GS14), (BAND_GS15, BAND_GS15))

    name = models.CharField(max_length=200, verbose_name='Billet Name', null=True, blank=True)
    date_open = models.DateTimeField(blank=True, null=True, verbose_name="Date Created")
    date_advertised = models.DateTimeField(blank=True, null=True, verbose_name="Date Advertised")
    date_filled = models.DateTimeField(blank=True, null=True, verbose_name="Date Filled")
    date_start = models.DateTimeField(blank=True, null=True, verbose_name="Start Date")
    date_expires = models.DateTimeField(blank=True, null=True, verbose_name="Expiration Date")
    date_vacant = models.DateTimeField(blank=True, null=True, verbose_name="Vacant Date")
    date_extension = models.DateTimeField(blank=True, null=True, verbose_name="Exention Requested Date")
    date_review = models.DateTimeField(blank=True, null=True, verbose_name="Review Selection Packaged")
    date_selected = models.DateTimeField(blank=True, null=True, verbose_name="Selected Date")
    dept = models.CharField(max_length=20, verbose_name='Department', null=True, blank=True)
    org = models.CharField(max_length=20, verbose_name='Organization', null=True, blank=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=STATUS_OPEN)
    band_level = models.CharField(max_length=10, choices=BAND_CHOICES)  #TODO WHAT SHOULD THIS LOOK LIKE
    selectee = models.CharField(max_length=80, verbose_name="Selectee", null=True, blank=True)
    comments = models.TextField(null=True, blank=True, verbose_name="Comments")
    #  AON # is a charfield in case they use special characters
    aon_id = models.CharField(verbose_name="AON #", max_length=20, null=True, blank=True)

    #TODO: replace with taggit?
    tags = models.CharField(max_length=75, null=True, blank=True)

    def tags_as_list(self):
        return self.tags.split(',') if self.tags else []

    def __unicode__(self):
        return u'{0}({2}):[{1}]'.format(self.name, self.get_status_display(), self.aon_id)

    display_order = ["name", "org", "status", "date_open", "date_advertised", "date_filled", "date_start", "band"]

    #TODO: make sort order defined as list rather than in code? --> would love to, but need to allow for special cases atm
    def table_json(self):
        info = [self.name, self.org, self.get_status_display(), str(self.date_open or ""),
                str(self.date_advertised or ""), str(self.date_filled or ""), str(self.date_start or ""),
                self.band_level]
        return info

    def table_json_header(self):
        return str(self.display_order)

    def get_last_action(self):
        if self.date_filled:
            return "Filled " + str(self.date_filled)
            #todo: deal with expired jobs         if self.date_expires and
        if self.date_review:
            return "Reviewed " + str(self.date_review)
        if self.date_selected:
            return "Selected " + str(self.date_selected)
        if self.date_advertised:
            return "Advertised " + str(self.date_advertised)
        if self.date_open:
            return "Opened " + str(self.date_open)
        return "No action"

    def info_json(self):
        info = {
            'aon_id': self.aon_id,
            'name': self.name,
            'lastAction': self.get_last_action(),
            'date_open': str(self.date_open),
            'date_advertised': str(self.date_advertised),
            'date_filled': str(self.date_filled),
            'date_start': str(self.date_start),
            'org': self.org,
            'status': self.get_status_display(),
            'band': self.band_level,
            'comments': self.comments
        }
        return info


class ProgramObservation(RatedBase):
    observation_entered = models.DateTimeField(auto_now=True, null=True)
    entered_by = models.ForeignKey(User, help_text="Observation Entered by", max_length=250, blank=True, null=True)
    program = models.ForeignKey(ProgramInfo)

    classification = models.CharField(help_text="Classification", max_length=20, default='Public Releasable')

    pm_observation = models.TextField(help_text="Program Manager Assessment", blank=True, null=True)

    metric_overall = models.CharField(help_text="Current status", max_length=10,
                                      choices=[('Green', 'Green'), ('Yellow', 'Yellow'), ('Red', 'Red')],
                                      default='Yellow')
    trend_overall = models.CharField(help_text="Current trend", max_length=10,
                                     choices=[('Up', 'Increasing'), ('Middle', 'Stable'), ('Down', 'Decreasing')],
                                     default='Middle')
    summary_overall = models.TextField(help_text="Current summary", blank=True, null=True)

    metric_cost = models.CharField(help_text="Current status", max_length=10,
                                   choices=[('Green', 'Green'), ('Yellow', 'Yellow'), ('Red', 'Red')], default='Yellow')
    trend_cost = models.CharField(help_text="Current trend", max_length=10,
                                  choices=[('Up', 'Increasing'), ('Middle', 'Stable'), ('Down', 'Decreasing')],
                                  default='Middle')
    summary_cost = models.TextField(help_text="Current summary", blank=True, null=True)

    budget_cost = models.TextField(help_text="Budget", max_length=40, blank=True, null=True)
    execution_cost = models.TextField(help_text="Execution", max_length=40, blank=True, null=True)
    funds_cost = models.TextField(help_text="Funds", max_length=40, blank=True, null=True)

    metric_schedule = models.CharField(help_text="Current status", max_length=10,
                                       choices=[('Green', 'Green'), ('Yellow', 'Yellow'), ('Red', 'Red')],
                                       default='Yellow')
    trend_schedule = models.CharField(help_text="Current trend", max_length=10,
                                      choices=[('Up', 'Increasing'), ('Middle', 'Stable'), ('Down', 'Decreasing')],
                                      default='Middle')
    summary_schedule = models.TextField(help_text="Current summary", blank=True, null=True)

    metric_performance = models.CharField(help_text="Current status", max_length=10,
                                          choices=[('Green', 'Green'), ('Yellow', 'Yellow'), ('Red', 'Red')],
                                          default='Yellow')
    trend_performance = models.CharField(help_text="Current trend", max_length=10,
                                         choices=[('Up', 'Increasing'), ('Middle', 'Stable'), ('Down', 'Decreasing')],
                                         default='Middle')
    summary_performance = models.TextField(help_text="Current summary", blank=True, null=True)

    issues_performance = models.TextField(help_text="Current issues", blank=True, null=True)
    risk_performance = models.TextField(help_text="Current risks", blank=True, null=True)

    def __unicode__(self):
        return u'{0}: updated {1}'.format(self.program.name, self.observation_entered)

    def info_obj(self):
        info = {
            'id': self.id,
            'observation_date': str(self.observation_entered),
            'entered_by': str(self.entered_by),
            'classification': self.classification,

            'pm_observation': self.pm_observation,
            'metric_overall': self.metric_overall,
            'trend_overall': self.trend_overall,
            'summary_overall': self.summary_overall,

            'rating_count': self.rating_count,

            'budget_cost': self.budget_cost,
            'execution_cost': self.execution_cost,
            'funds_cost': self.funds_cost,
            'metric_cost': self.metric_cost,
            'trend_cost': self.trend_cost,
            'summary_cost': self.summary_cost,

            'metric_schedule': self.metric_schedule,
            'trend_schedule': self.trend_schedule,
            'summary_schedule': self.summary_schedule,

            'issues_performance': self.issues_performance,
            'risk_performance': self.risk_performance,
            'metric_performance': self.metric_performance,
            'trend_performance': self.trend_performance,
            'summary_performance': self.summary_performance,

            'notes': serializers.serialize('json', self.notes()),
        }
        return info

    def info_json(self):
        return json.dumps(self.info_obj(), skipkeys=True, default=[])

    class Meta:
        verbose_name_plural = 'Programs of Record Observations'
        ordering = ['-observation_entered', ]


class PageWidget(models.Model):
    """
    Page Widgets shown based on dashboard type and org
    """
    name = models.CharField(help_text="Widget short name", max_length=200, unique=True)
    description = models.TextField(help_text="Widget details", blank=True, null=True)
    subtext = models.CharField(help_text="Short text under title", max_length=30, blank=True, null=True, default='')
    url = models.TextField(help_text="Link to another page when title is clicked", blank=True, null=True)
    type = models.CharField(help_text="How to render widget", max_length=10,
                            choices=[('Wiki', 'Wiki - Show content in Notes'), ('iFrame', 'iFrame - load from Url'),
                                     ('Widget', 'Widget - created by Function')], default='Wiki')
    theme = models.CharField(help_text="Theme of widget", max_length=15,
                             choices=[('Headless', 'Headless'), ('Thin', 'Thin'), ('Thick', 'Thick'),
                                      ('Thick+Border', 'Thick+Border')], default='Thick')
    data_json = models.TextField(blank=True, null=True, help_text="JSON data to be used by widget in configuration")
    render_function = models.CharField(help_text="JavaScript function to use when populating widget", max_length=60,
                                       default='notesAndChildNotes')
    icon = models.CharField(help_text="Icon Glyph", max_length=20,
                            choices=[('search', 'search'), ('globe', 'globe'), ('envelope', 'envelope'),
                                     ('star', 'star'), ('star-empty', 'star-empty'), ('th-large', 'th-large'),
                                     ('th', 'th'), ('th-list', 'th-list'), ('ok', 'ok'), ('zoom-in', 'zoom-in'),
                                     ('zoom-out', 'zoom-out'), ('off', 'off'), ('cog', 'cog'), ('trash', 'trash'),
                                     ('time', 'time'), ('inbox', 'inbox'), ('fire', 'fire'), ('share', 'share'),
                                     ('move', 'move'), ('bookmark', 'bookmark'), ('picture', 'picture'),
                                     ('warning-sign', 'warning-sign'), ('asterisk', 'asterisk'),
                                     ('bullhorn', 'bullhorn')], default='')

    iframe_url = models.TextField(blank=True, null=True,
                                  help_text="If widget should show as a faux widget in an iframe, URL to the page")
    iframe_url_if_local = models.TextField(blank=True, null=True, help_text="faux url to use if testing as localhost")


    def __unicode__(self):
        return '{0}'.format(self.name)

    def notes(self):
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id, public=True)

    def get_add_note_url(self):
        return reverse('notes-manage-note-model-id', args=['pagewidget', self.id])

    class Meta:
        verbose_name_plural = 'Page Widgets'
        ordering = ['name']

    def page_widget_info(self):
        notes_list = self.notes()
        widget = {
            'name': self.name,
            'description': self.description,
            'subtext': self.subtext,
            'url': self.url,
            'type': self.type,
            'theme': self.theme,
            'data_json': self.data_json,
            'render_function': self.render_function,
            'icon': self.icon,
            'iframe_url': self.iframe_url,
            'iframe_url_if_local': self.iframe_url_if_local,
            'notes': [note.note_info() for note in self.notes()],
            'add_note_url': self.get_add_note_url(),
        }
        return widget


class Link(RatedBase):
    title = models.CharField(help_text="Link title (as short as possible)", max_length=60, unique=True)
    category = models.CharField(help_text="Category of Link", max_length=60,
                                choices=[('Top 10 Initiatives', 'Top 10 Initiatives'),
                                         ('Knowledge Center', 'Knowledge Center'), ('Tools', 'Tools'),
                                         ('Links', 'Links')], default='Links')
    ##    dashboard = models.ForeignKey(DirectorDashboard, help_text="Which dashboard should this show under? Blank if it's not dashboard-specific", blank=True, null=True)
    details = models.TextField(help_text="Link description", blank=True, null=True)

    technical_poc = models.CharField(help_text="Point of Contact for Technical Issues", max_length=200, blank=True,
                                     null=True)
    url = models.TextField(help_text="Link to another page when clicked", blank=True, null=True)
    color = models.CharField(help_text="Background color to show behind link, blank for default", max_length=60,
                             blank=True, null=True)
    icon = models.CharField(help_text="Glyph Icon name to show with link, blank for none", max_length=20, blank=True,
                            null=True)

    def __unicode__(self):
        return u'{0} [{1}]'.format(self.title, self.category)

    def info_obj(self):
        info = {
            'title': self.title,
            'details': self.details,
            'technical_poc': self.technical_poc,
            'url': self.url,
            'category': self.category,
            'color': self.color,
            'icon': self.icon,
            'rating_count': self.rating_count,
            'notes': serializers.serialize('json', self.notes()),
        }
        return info

    class Meta(RatedBase.Meta):
        verbose_name_plural = 'Links'
        ordering = ['category', 'rating_count', 'title']


class ProgramGroup(models.Model):
    """
    This model is for Program Groupings, sometimes called IPTs
    """
    name = models.CharField(help_text="Organization Title", max_length=200, verbose_name='Title', null=True, blank=True)
    details = models.TextField(help_text="Link description", blank=True, null=True)
    url = models.TextField(help_text="Link to another page when clicked", blank=True, null=True)

    related_programs = models.ManyToManyField(ProgramInfo, help_text="Programs within the group", null=True, blank=True)
    related_links = models.ManyToManyField(Link, help_text="Related Links", null=True, blank=True)

    created = models.DateTimeField(auto_now_add=True, verbose_name="Date Created")
    last_updated = models.DateTimeField(auto_now=True, null=True)
    tags = models.CharField(help_text="List of comma-separated tags", max_length=75, null=True, blank=True)

    def __unicode__(self):
        return '{0}'.format(self.name)

    def notes(self):
        note_type = ContentType.objects.get_for_model(self)
        return Note.objects.filter(content_type__pk=note_type.id, object_id=self.id, public=True)

    def related_links_list(self):
        links = self.related_links.all()
        return [link.info_obj() for link in links]

    def related_programs_list(self):
        return [program.info_obj() for program in self.related_programs.all()]

    def info_obj(self):
        info = {
            'name': self.name,
            'details': self.details,
            'url': self.url,
            'related_links': self.related_links_list(),
            'created': str(self.created),
            'last_updated': str(self.last_updated),
            'tags': str(self.tags),
            'notes': [note.note_info() for note in self.notes()],
        }
        return info

    def info_and_programs_obj(self):
        ##unused: returns all info about a program group, along with sub-programs
        info = self.info_obj()
        info['related_programs'] = self.related_programs_list()
        return info

    def info_and_programs_flat(self):
        ##Returns a flattened table of all programs that have an entry for program group
        list = []
        for program in self.related_programs.all():
            prog = program.info_obj()
            prog['group'] = self.name
            prog['group_id'] = self.id
            prog['group_url'] = self.url
            prog['group_tags'] = self.tags
            list.append(prog)
        return list

    class Meta(RatedBase.Meta):
        verbose_name_plural = 'Program Management Groups (IPTs)'
        ordering = ['name', 'tags']


class DirectorDashboard(models.Model):
    """
    This model is for Executive Dashboards
    """
    org = models.CharField(help_text="Organization Abbreviation, e.g. AEG", max_length=20, verbose_name='Organization',
                           null=True, blank=True)
    name = models.CharField(help_text="Organization Title", max_length=200, verbose_name='Title', null=True, blank=True)
    owner = models.ForeignKey(User, help_text="Administrative Owner", max_length=250, blank=True, null=True)
    site_icon = models.CharField(help_text="URL to Icon file, blank for none", max_length=200, verbose_name='Site Icon',
                                 null=True, blank=True)
    status = models.IntegerField(help_text="Active to show on lookup list + Search", max_length=1,
                                 choices=[(1, 'Active'), (0, 'Inactive')], default=1)
    type = models.CharField(help_text="Portal to render as dashboard page", max_length=10,
                            choices=[('Portal', 'Portal'), ('Widget', 'Widget'), ('Page', 'Page')], default='Portal')

    page_widgets = models.ManyToManyField(PageWidget, through='DashboardWidgets',
                                          help_text="List all sections of page that should show", null=True, blank=True,
                                          verbose_name="pagewidgets")
    related_program_groups = models.ManyToManyField(ProgramGroup, help_text="Related Programs", null=True, blank=True)
    related_links = models.ManyToManyField(Link, help_text="Related Links", null=True, blank=True)

    created = models.DateTimeField(auto_now_add=True, verbose_name="Date Created")
    last_updated = models.DateTimeField(auto_now=True, null=True)
    tags = models.CharField(help_text="List of comma-separated tags", max_length=75, null=True, blank=True)
    tracking_code = models.CharField(help_text="Web Analytics Code, if blank then use site default", max_length=250,
                                     null=True, blank=True)

    director_billets = models.ManyToManyField(Billet, help_text="Billets for this dashboard", null=True, blank=True)
    active_objects = ActiveObjects()

    def __unicode__(self):
        return u'{0} [{1}]'.format(self.org, self.name)

    def get_absolute_url(self):
        return reverse('director-dashboard-view', args=[self.id])

    def get_dates(self):
        return {
            "created_date": str(self.created),
            "updated_date": str(self.last_updated),
        }

    def related_links_list(self):
        links = self.related_links.all()
        return [link.info_obj() for link in links]

    def tags_as_list(self):
        return self.tags.split(',') if self.tags else []

    def related_program_groups_list(self):
        return [program_group.info_obj() for program_group in self.related_program_groups.all()]

    def related_programs_by_group_list(self):
        list = [];
        for program_group in self.related_program_groups.all():
            list = list + program_group.info_and_programs_flat();
        return list

    def reports_list(self):
        return [r.obj_info() for r in Report.objects.filter(related_boards__id=self.id, public=True)]

    def reports_list_all(self):
        ##TODO: Add in | Q(owner=self.user)
        qs = Report.objects.filter(Q(related_boards__id=self.id), public=True).distinct()
        return [r.obj_info() for r in qs]

    def billets_list_all(self):
        return [b.info_json() for b in self.director_billets.all()]

    def get_widget_list(self):
        dwlist = DashboardWidgets.objects.filter(dashboard=self)
        widget_info = []
        for dw in dwlist:
            w = PageWidget.objects.get(id=dw.widget.id)
            widget = w.page_widget_info()
            widget['id'] = dw.widget.id
            widget['order'] = dw.order
            widget['width'] = dw.width
            widget['height'] = dw.height
            widget['data_json_org'] = dw.data_json_org
            widget_info.append(widget)
        return widget_info

    def get_action_items(self):
        actions_list = Actions.objects.filter(owning_organization=self)
        return [a.info_obj() for a in actions_list]

    #--JSON-Builders-----------------------------
    def related_links_list_json(self):
        return json.dumps(self.related_links_list(), skipkeys=True) or []

    def related_program_groups_list_json(self):
        return json.dumps(self.related_program_groups_list(), skipkeys=True) or []

    def related_programs_list_by_group_json(self):
        return json.dumps(self.related_programs_by_group_list(), skipkeys=True) or []

    def related_widget_list_json(self):
        return json.dumps(self.get_widget_list(), skipkeys=True) or []

    def dashboard_dates_json(self):
        return json.dumps(self.get_dates(), skipkeys=True) or {}

    def reports_json(self):
        return json.dumps(self.reports_list_all(), skipkeys=True) or []

    def billet_json(self):
        return json.dumps(self.billets_list_all(), skipkeys=True) or []


    class Meta:
        ordering = ['org', ]
        verbose_name_plural = 'Executive Dashboards'


class DashboardWidgets(models.Model):
    dashboard = models.ForeignKey(DirectorDashboard)
    widget = models.ForeignKey(PageWidget)
    order = models.IntegerField(help_text="Order on page")
    width = models.IntegerField(help_text="Columns: 12 is max, 6 is normal", max_length=2,
                                choices=[(2, '2 - Small'), (3, '3 - Half'), (4, '4 - Third'), (6, '6 - Normal'),
                                         (12, '12 - Full')], default=6)
    height = models.IntegerField(help_text="Pixels in height", max_length=3,
                                 choices=[(65, '65 - Tiny'), (100, '100 - Small'), (150, '150 - Small'),
                                          (200, '200 - Med'), (250, '250 - Standard'), (300, '300 - Big'),
                                          (350, '350 - Big'), (400, '400 - Bigger'), (500, '500 - Huge')], default=250)
    data_json_org = models.TextField(blank=True, null=True,
                                     help_text="JSON data when this widget is used by this organization, to be used by widget in configuration")

    class Meta:
        ordering = ['order', ]
        verbose_name_plural = 'Dashboard Widgets'


class Actions(RatedBase):

    action_id = models.CharField(max_length=15, help_text="example: A-AEG-U-0155")
    description = models.CharField(max_length=120, help_text="High level description of action", blank=True, null=True)
    originator = models.ForeignKey(User, help_text="Person tasking action", max_length=250, blank=True, null=True)
    date_assigned = models.DateTimeField(blank=True, null=True)
    date_updated = models.DateTimeField(blank=True, null=True)
    date_plan_due = models.DateTimeField(blank=True, null=True)
    date_final_due = models.DateTimeField(blank=True, null=True)
    date_closed = models.DateTimeField(blank=True, null=True)
    assigned_to = models.CharField(help_text="Organizations Responsible", max_length=250, blank=True, null=True)
    status = models.IntegerField(help_text="Status of Action", max_length=1,
                                 choices=[(2, 'Open'), (1, 'Pending Closed'), (0, 'Closed')], default=2)
    action_notes = models.TextField(blank=True, null=True,
                                    help_text="Detailed notes describing the result of this action, the format it should be in, and any procedural details")
    response = models.TextField(blank=True, null=True, help_text="Detailed notes, status, comments from head office")
    current_status = models.TextField(blank=True, null=True,
                                      help_text="Detailed status of tasker, not describing content of result")

    category = models.CharField(help_text="Tasker Category (e.g. 'AEG Taskers')", max_length=100, blank=True, null=True)
    hotness = models.IntegerField(help_text="How Hot? 0-5", max_length=2, blank=True, null=True, default=0)

    owning_organization = models.ForeignKey(DirectorDashboard,
                                            help_text="Primary organization this is being tracked under", null=True,
                                            blank=True)
    ##    related_organizations = models.ManyToManyField(DirectorDashboard, help_text="Related Boards", null=True, blank=True)

    def __unicode__(self):
        return u'{0}: assigned to {1}'.format(self.action_id, self.assigned_to)

    def related_organizations_list(self):
        return [org.org for org in self.related_organizations.all()]

    def info_obj(self):
        info = {
            'id': self.id,
            'action_id': str(self.action_id),
            'description': str(self.description),
            'originator': str(self.originator),

            'rating_count': self.rating_count,

            'date_created': str(self.created),
            'date_assigned': str(self.date_assigned),
            'date_updated': str(self.date_updated),
            'date_plan_due': str(self.date_plan_due),
            'date_final_due': str(self.date_final_due),
            'date_closed': str(self.date_closed),

            'category': str(self.category),
            'hotness': str(self.hotness),

            'assigned_to': str(self.assigned_to),
            'status': self.status,
            'action_notes': str(self.action_notes),
            'response': str(self.response),
            'current_status': str(self.current_status),
            'owning_organization': str(self.owning_organization.org),
            ##            'related_organizations': str(self.related_organizations_list()),

            'notes': serializers.serialize('json', self.notes()),
        }
        return info

    def info_json(self):
        return json.dumps(self.info_obj(), skipkeys=True, default=[])

    class Meta:
        verbose_name_plural = 'Action Items'
        ordering = ['-date_final_due', '-hotness']


class Report(RatedBase):
    title = models.CharField(max_length=255)
    details = models.TextField(help_text="Program details", blank=True, null=True)
    owner = models.ForeignKey(User, help_text="Person entering report", max_length=250, blank=True, null=True)
    tags = models.CharField(help_text="List of comma-separated tags", max_length=75, null=True, blank=True)
    public = models.BooleanField(default=True, help_text="Allow everyone to read this?", blank=True)

    related_boards = models.ManyToManyField(DirectorDashboard, help_text="Related Boards", null=True, blank=True)
    related_programs = models.ManyToManyField(ProgramInfo, help_text="Related Programs", null=True, blank=True)
    related_links = models.ManyToManyField(Link, help_text="Related Links", null=True, blank=True)
    related_actions = models.ManyToManyField(Actions, help_text="Related Actions", null=True, blank=True)


    def __unicode__(self):
        return '{0} on {1}'.format(self.title, self.created)

    def get_absolute_url(self):
        return reverse('reports-view-report', args=[self.id])

    def get_edit_url(self):
        return reverse('reports-manage-report-id', args=[self.id])

    def obj_info(self):
        return {
            "id": self.id,
            "title": self.title,
            "details": self.details,
            "rating_count": self.rating_count,
            "url": str(self.get_absolute_url()),
            "edit_url": str(self.get_edit_url()),
            "tags": self.tags,
            "public": self.public,
            "posted_date": str(self.last_updated),
            "created_date": str(self.created),
            "owner": str(self.owner),
        }

    def obj_json(self):
        return json.dumps(self.obj_info(), skipkeys=True, default={})
