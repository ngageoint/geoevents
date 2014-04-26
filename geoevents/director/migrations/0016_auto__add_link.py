# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Link'
        db.create_table(u'director_link', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_updated', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, null=True, blank=True)),
            ('rating_count', self.gf('django.db.models.fields.IntegerField')(default=1, max_length=1000)),
            ('title', self.gf('django.db.models.fields.CharField')(unique=True, max_length=60)),
            ('details', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('technical_poc', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('url', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('category', self.gf('django.db.models.fields.CharField')(default='Links', max_length=60)),
            ('color', self.gf('django.db.models.fields.CharField')(max_length=60, null=True, blank=True)),
            ('icon', self.gf('django.db.models.fields.CharField')(max_length=20, null=True, blank=True)),
        ))
        db.send_create_signal(u'director', ['Link'])


    def backwards(self, orm):
        # Deleting model 'Link'
        db.delete_table(u'director_link')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'director.dashboardwidgets': {
            'Meta': {'ordering': "['order']", 'object_name': 'DashboardWidgets'},
            'dashboard': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['director.DirectorDashboard']"}),
            'height': ('django.db.models.fields.IntegerField', [], {'default': '250', 'max_length': '3'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.IntegerField', [], {}),
            'widget': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['director.PageWidget']"}),
            'width': ('django.db.models.fields.IntegerField', [], {'default': '6', 'max_length': '2'})
        },
        u'director.directordashboard': {
            'Meta': {'ordering': "['org']", 'object_name': 'DirectorDashboard'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'org': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'max_length': '250', 'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'page_widgets': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['director.PageWidget']", 'null': 'True', 'through': u"orm['director.DashboardWidgets']", 'blank': 'True'}),
            'related_programs': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['director.ProgramInfo']", 'null': 'True', 'blank': 'True'}),
            'site_icon': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'tags': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'tracking_code': ('django.db.models.fields.CharField', [], {'max_length': '250', 'null': 'True', 'blank': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'Portal'", 'max_length': '10'})
        },
        u'director.link': {
            'Meta': {'ordering': "['category', 'rating_count']", 'object_name': 'Link'},
            'category': ('django.db.models.fields.CharField', [], {'default': "'Links'", 'max_length': '60'}),
            'color': ('django.db.models.fields.CharField', [], {'max_length': '60', 'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'details': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'icon': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'rating_count': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1000'}),
            'technical_poc': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'}),
            'url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        },
        u'director.pagewidget': {
            'Meta': {'ordering': "['name']", 'object_name': 'PageWidget'},
            'data_json': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'icon': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '20'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'iframe_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'iframe_url_if_local': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'render_function': ('django.db.models.fields.CharField', [], {'default': "'notesAndChildNotes'", 'max_length': '60'}),
            'subtext': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '30', 'null': 'True', 'blank': 'True'}),
            'theme': ('django.db.models.fields.CharField', [], {'default': "'Thin'", 'max_length': '10'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'Wiki'", 'max_length': '10'}),
            'url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        },
        u'director.programinfo': {
            'Meta': {'ordering': "['name']", 'object_name': 'ProgramInfo'},
            'details': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'management_poc': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'technical_poc': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        },
        u'director.programobservation': {
            'Meta': {'ordering': "['-observation_entered']", 'object_name': 'ProgramObservation'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'entered_by': ('django.db.models.fields.related.ForeignKey', [], {'max_length': '250', 'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'metric_cost': ('django.db.models.fields.CharField', [], {'default': "'Yellow'", 'max_length': '10'}),
            'metric_performance': ('django.db.models.fields.CharField', [], {'default': "'Yellow'", 'max_length': '10'}),
            'metric_risk': ('django.db.models.fields.CharField', [], {'default': "'Yellow'", 'max_length': '10'}),
            'metric_schedule': ('django.db.models.fields.CharField', [], {'default': "'Yellow'", 'max_length': '10'}),
            'observation_entered': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'program': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['director.ProgramInfo']"}),
            'rating_count': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1000'}),
            'summary_cost': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'summary_performance': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'summary_risk': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'summary_schedule': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'trend_cost': ('django.db.models.fields.CharField', [], {'default': "'Middle'", 'max_length': '10'}),
            'trend_performance': ('django.db.models.fields.CharField', [], {'default': "'Middle'", 'max_length': '10'}),
            'trend_risk': ('django.db.models.fields.CharField', [], {'default': "'Middle'", 'max_length': '10'}),
            'trend_schedule': ('django.db.models.fields.CharField', [], {'default': "'Middle'", 'max_length': '10'})
        }
    }

    complete_apps = ['director']