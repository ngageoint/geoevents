# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib import messages
from django.core import serializers
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.shortcuts import get_object_or_404, render_to_response
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from django.template import RequestContext
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, DeleteView
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.db.models.loading import get_model
from .models import *
from .forms import *
from datetime import datetime
import logging
import json

# Get an instance of a logger
logger = logging.getLogger(__name__)


def SocialRate(request, model, pk):
    rating = str(request.POST.get("rating", ""))
    model_obj = get_model('director', model)

    try:
        report = get_object_or_404(model_obj, id=pk)
        if str(rating) == "increase":
            report.rating_count = report.rating_count + 1
            status = {'status': 'success', 'details': 'increased rating', 'rating': report.rating_count}
            report.save()
        elif str(rating) == "decrease":
            report.rating_count = report.rating_count - 1
            status = {'status': 'success', 'details': 'decreased rating', 'rating': report.rating_count}
            report.save()
        else:
            status = {'status': 'success', 'details': 'rating lookup', 'rating': report.rating_count}

        status['model'] = model
        status['id'] = pk

    except Exception as e:
        status = {'status': 'error', 'details': str(e)}

    output = json.dumps(status)
    return HttpResponse(output, content_type="application/json")


@csrf_exempt
def NoteNew(request):
## TODO: Find out how not to be CSRF exempt
    id = request.POST.get("id", "")
    title = request.POST.get("title", "")
    content = request.POST.get("content", "")
    public = request.POST.get("public", False)

    note_type = ContentType.objects.get_for_model(PageWidget)
    widget_id = request.POST.get("widget_id", 0)
    if request.user.is_authenticated():
        user = request.user
    else:
        user = User.objects.all()[0]
    try:
        if id:
            theReport = Note.objects.get(id=id)
            theReport.title = title
            theReport.content = content
            theReport.owner = user
            theReport.public = public
            theReport.content_type = note_type
            theReport.object_id = widget_id
            theReport.save()
            status = {'status': 'edited', 'id': theReport.id}
        elif title:
            newReport = Note(title=title, content=content, owner=user, public=public, content_type=note_type,
                             object_id=widget_id)
            newReport.save()
            status = {'status': 'created', 'id': newReport.id}
        else:
            status = {'status': 'error', 'details': 'no title'}

    except Exception as e:
        status = {'status': 'error', 'details': str(e)}

    output = json.dumps(status)
    return HttpResponse(output, content_type="application/json")


@csrf_exempt
def ReportNew(request):
## TODO: Find out how not to be CSRF exempt
    id = request.POST.get("id", "")
    title = request.POST.get("title", "")
    details = request.POST.get("details", "")
    ##    board = request.POST.get("board", "") ##TODO: Add support for these
    ##    program = request.POST.get("program", "")
    ##    link = request.POST.get("link", "")
    tags = request.POST.get("tags", "")
    public = request.POST.get("public", False)
    if request.user.is_authenticated():
        user = request.user
    else:
        user = User.objects.all()[0]
    try:
        if id:
            theReport = Report.objects.get(id=id)
            theReport.title = title
            theReport.details = details
            theReport.owner = user
            theReport.tags = tags
            theReport.public = public
            theReport.save()
            status = {'status': 'edited', 'id': theReport.id}
        elif title:
            newReport = Report(title=title, details=details, owner=user, tags=tags, public=public)
            newReport.save()
            status = {'status': 'created', 'id': newReport.id}
        else:
            status = {'status': 'error', 'details': 'no title'}

    except Exception as e:
        status = {'status': 'error', 'details': str(e)}

    output = json.dumps(status)
    return HttpResponse(output, content_type="application/json")


def QuadChartView(request, pk):
    quad = get_object_or_404(ProgramObservation, id=pk)

    qs = Report.objects.filter(Q(related_programs=quad)).distinct()
    dashboard_reports = json.dumps([r.obj_info() for r in qs], skipkeys=True, default={})

    return render_to_response('quad-chart.html', {'item': quad, 'dashboard_reports': dashboard_reports},
                              RequestContext(request))


@csrf_exempt
def ReportLink(request, pk_report, model, pk_target):
    try:
        if (model == 'related_programs') or (model == 'related_boards') or (model == 'related_links') or (
                model == 'related_actions'):
            report = get_object_or_404(Report, id=pk_report)

            if (model == 'related_programs'):
                add_item = ProgramInfo.objects.get(id=pk_target)
                report.related_programs.add(add_item)

            if (model == 'related_boards'):
                add_item = DirectorDashboard.objects.get(id=pk_target)
                report.related_boards.add(add_item)

            if (model == 'related_links'):
                add_item = Link.objects.get(id=pk_target)
                report.related_links.add(add_item)

            if (model == 'related_actions'):
                add_item = Actions.objects.get(id=pk_target)
                report.related_actions.add(add_item)

            status = {'status': 'linked', 'report': pk_report, 'model': model, 'target': pk_target}

        else:
            status = {'status': 'error', 'report': 'invalid linkage'}

    except Exception as e:
        status = {'status': 'error', 'details': str(e)}

    output = json.dumps(status)
    return HttpResponse(output, content_type="application/json")


def DirectorDashboardView(request, pk):
    """
    View used for DirectorDashboard detail views by id.
    """
    board = get_object_or_404(DirectorDashboard, id=pk)

    #Lookup any reports written by the current user
    try:
        qs = Report.objects.filter(owner=request.user).distinct()
        user_reports = json.dumps([r.obj_info() for r in qs], skipkeys=True, default=[])
    except:
        user_reports = '[]'

    return render_to_response('director-dashboard-detail.html', {'item': board, 'user_reports': user_reports},
                              RequestContext(request))


def DirectorDashboardViewOrg(request, org):
    """
    View used for DirectorDashboard detail views by org.
    """
    board = get_object_or_404(DirectorDashboard, org=org)

    #Lookup any reports written by the current user
    try:
        qs = Report.objects.filter(Q(owner=request.user)).distinct()
        user_reports = json.dumps([r.obj_info() for r in qs], skipkeys=True, default={})
    except:
        user_reports = '[]'

    return render_to_response('director-dashboard-detail.html', {'item': board, 'user_reports': user_reports},
                              RequestContext(request))


class DirectorDashboardViewList(ListView):
    model = DirectorDashboard
    paginate_by = 25
    template_name = 'director-dashboard-list.html'
    queryset = DirectorDashboard.active_objects.all().order_by('org')
    context_object_name = 'items'

    def get_context_data(self, **kwargs):
        cv = super(DirectorDashboardViewList, self).get_context_data(**kwargs)
        return cv


class ReportCreateView(CreateView):
    """Displays and processes a view to create new report"""

    model = Report
    form_class = ReportForm

    def form_valid(self, form):
        form.instance.owner = self.request.user
        if self.kwargs.get('pk'):
            form.instance.object_id = self.kwargs['pk']
        return super(ReportCreateView, self).form_valid(form)

    def get(self, request, *args, **kwargs):
        self.object = None
        self.form_class = ReportForm
        return super(ReportCreateView, self).get(request, *args, **kwargs)


class ActionCreateView(CreateView):
    """Displays and processes a view to create new action"""

    def get_success_url(self):
        if 'success_url' in self.kwargs:
            slug = "/" + self.kwargs['success_url']
        else:
            slug = reverse_lazy('home')
        return slug

    model = Actions
    form_class = ActionForm

    def form_valid(self, form):
        form.instance.owner = self.request.user
        if self.kwargs.get('pk'):
            form.instance.object_id = self.kwargs['pk']
        return super(ActionCreateView, self).form_valid(form)

    def get(self, request, *args, **kwargs):
        self.object = None
        self.form_class = ActionForm
        return super(ActionCreateView, self).get(request, *args, **kwargs)


def ActionNew(request):
    action_id = request.POST.get("action_id", "")
    description = request.POST.get("description", "")
    assigned_to = request.POST.get("assigned_to", "")
    category = request.POST.get("category", "")
    hotness = request.POST.get("hotness", "0")
    action_notes = request.POST.get("action_notes", "")
    date_final_due = request.POST.get("date_final_due", "")
    date_assigned = request.POST.get("date_assigned", "")
    owning_organization = request.POST.get("owning_organization", "")
    originator = request.POST.get("originator", "")
    if not originator:
        originator = "Anonymous"
        ##TODO: Have it work for non-logged in users

    try:
        try:
            hotness = int(float(hotness))
        except:
            hotness = 0

        if action_id:
            new_action = Actions(action_id=action_id, description=description, assigned_to=assigned_to,
                                 action_notes=action_notes, category=category, hotness=hotness,
                                 date_final_due=date_final_due, date_assigned=date_assigned)

            if originator:
                user = User.objects.get(username=originator)
                if user:
                    new_action.originator = user
            if owning_organization:
                org = DirectorDashboard.active_objects.get(org=owning_organization)
                if org:
                    new_action.owning_organization = org

            new_action.save()
            status = {'status': 'created', 'id': action_id}
        else:
            status = {'status': 'error', 'details': 'no action_id'}

    except Exception as e:
        status = {'status': 'error', 'details': str(e)}

    output = json.dumps(status)
    return HttpResponse(output, content_type="application/json")


class BilletCreateView(CreateView):
    """Displays and processes a view to create new billet"""

    model = Billet
    form_class = BilletForm

    def form_valid(self, form):
        form.instance.owner = self.request.user
        if self.kwargs.get('pk'):
            form.instance.object_id = self.kwargs['pk']
        return super(BilletCreateView, self).form_valid(form)

    def get(self, request, *args, **kwargs):
        self.object = None
        self.form_class = BilletForm
        return super(BilletCreateView, self).get(request, *args, **kwargs)


def BilletNew(request):
    status = {'status': 'not yet implemented'}

    output = json.dumps(status)
    return HttpResponse(output, content_type="application/json")

