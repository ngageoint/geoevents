# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'ProgramObservation'
        db.create_table(u'director_programobservation', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_updated', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, null=True, blank=True)),
            ('rating_count', self.gf('django.db.models.fields.IntegerField')(default=1, max_length=1000)),
            ('observation_entered', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, null=True, blank=True)),
            ('entered_by', self.gf('django.db.models.fields.related.ForeignKey')(max_length=250, to=orm['auth.User'], null=True, blank=True)),
            ('program', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['director.ProgramInfo'])),
            ('metric_cost', self.gf('django.db.models.fields.CharField')(default='Yellow', max_length=10)),
            ('trend_cost', self.gf('django.db.models.fields.CharField')(default='Middle', max_length=10)),
            ('summary_cost', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('metric_schedule', self.gf('django.db.models.fields.CharField')(default='Yellow', max_length=10)),
            ('trend_schedule', self.gf('django.db.models.fields.CharField')(default='Middle', max_length=10)),
            ('summary_schedule', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('metric_performance', self.gf('django.db.models.fields.CharField')(default='Yellow', max_length=10)),
            ('trend_performance', self.gf('django.db.models.fields.CharField')(default='Middle', max_length=10)),
            ('summary_performance', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('metric_risk', self.gf('django.db.models.fields.CharField')(default='Yellow', max_length=10)),
            ('trend_risk', self.gf('django.db.models.fields.CharField')(default='Middle', max_length=10)),
            ('summary_risk', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'director', ['ProgramObservation'])

        # Deleting field 'ProgramInfo.last_updated'
        db.delete_column(u'director_programinfo', 'last_updated')

        # Deleting field 'ProgramInfo.rating_count'
        db.delete_column(u'director_programinfo', 'rating_count')

        # Deleting field 'ProgramInfo.trend_schedule'
        db.delete_column(u'director_programinfo', 'trend_schedule')

        # Deleting field 'ProgramInfo.metric_cost'
        db.delete_column(u'director_programinfo', 'metric_cost')

        # Deleting field 'ProgramInfo.trend_performance'
        db.delete_column(u'director_programinfo', 'trend_performance')

        # Deleting field 'ProgramInfo.metric_performance'
        db.delete_column(u'director_programinfo', 'metric_performance')

        # Deleting field 'ProgramInfo.metric_risk'
        db.delete_column(u'director_programinfo', 'metric_risk')

        # Deleting field 'ProgramInfo.trend_risk'
        db.delete_column(u'director_programinfo', 'trend_risk')

        # Deleting field 'ProgramInfo.summary_schedule'
        db.delete_column(u'director_programinfo', 'summary_schedule')

        # Deleting field 'ProgramInfo.summary_cost'
        db.delete_column(u'director_programinfo', 'summary_cost')

        # Deleting field 'ProgramInfo.created'
        db.delete_column(u'director_programinfo', 'created')

        # Deleting field 'ProgramInfo.metric_schedule'
        db.delete_column(u'director_programinfo', 'metric_schedule')

        # Deleting field 'ProgramInfo.summary_risk'
        db.delete_column(u'director_programinfo', 'summary_risk')

        # Deleting field 'ProgramInfo.summary_performance'
        db.delete_column(u'director_programinfo', 'summary_performance')

        # Deleting field 'ProgramInfo.trend_cost'
        db.delete_column(u'director_programinfo', 'trend_cost')


    def backwards(self, orm):
        # Deleting model 'ProgramObservation'
        db.delete_table(u'director_programobservation')

        # Adding field 'ProgramInfo.last_updated'
        db.add_column(u'director_programinfo', 'last_updated',
                      self.gf('django.db.models.fields.DateTimeField')(auto_now=True, null=True, blank=True),
                      keep_default=False)

        # Adding field 'ProgramInfo.rating_count'
        db.add_column(u'director_programinfo', 'rating_count',
                      self.gf('django.db.models.fields.IntegerField')(default=1, max_length=1000),
                      keep_default=False)

        # Adding field 'ProgramInfo.trend_schedule'
        db.add_column(u'director_programinfo', 'trend_schedule',
                      self.gf('django.db.models.fields.CharField')(default='Middle', max_length=10),
                      keep_default=False)

        # Adding field 'ProgramInfo.metric_cost'
        db.add_column(u'director_programinfo', 'metric_cost',
                      self.gf('django.db.models.fields.CharField')(default='Yellow', max_length=10),
                      keep_default=False)

        # Adding field 'ProgramInfo.trend_performance'
        db.add_column(u'director_programinfo', 'trend_performance',
                      self.gf('django.db.models.fields.CharField')(default='Middle', max_length=10),
                      keep_default=False)

        # Adding field 'ProgramInfo.metric_performance'
        db.add_column(u'director_programinfo', 'metric_performance',
                      self.gf('django.db.models.fields.CharField')(default='Yellow', max_length=10),
                      keep_default=False)

        # Adding field 'ProgramInfo.metric_risk'
        db.add_column(u'director_programinfo', 'metric_risk',
                      self.gf('django.db.models.fields.CharField')(default='Yellow', max_length=10),
                      keep_default=False)

        # Adding field 'ProgramInfo.trend_risk'
        db.add_column(u'director_programinfo', 'trend_risk',
                      self.gf('django.db.models.fields.CharField')(default='Middle', max_length=10),
                      keep_default=False)

        # Adding field 'ProgramInfo.summary_schedule'
        db.add_column(u'director_programinfo', 'summary_schedule',
                      self.gf('django.db.models.fields.TextField')(null=True, blank=True),
                      keep_default=False)

        # Adding field 'ProgramInfo.summary_cost'
        db.add_column(u'director_programinfo', 'summary_cost',
                      self.gf('django.db.models.fields.TextField')(null=True, blank=True),
                      keep_default=False)

        # Adding field 'ProgramInfo.created'
        db.add_column(u'director_programinfo', 'created',
                      self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, default=datetime.datetime(2013, 10, 3, 0, 0), blank=True),
                      keep_default=False)

        # Adding field 'ProgramInfo.metric_schedule'
        db.add_column(u'director_programinfo', 'metric_schedule',
                      self.gf('django.db.models.fields.CharField')(default='Yellow', max_length=10),
                      keep_default=False)

        # Adding field 'ProgramInfo.summary_risk'
        db.add_column(u'director_programinfo', 'summary_risk',
                      self.gf('django.db.models.fields.TextField')(null=True, blank=True),
                      keep_default=False)

        # Adding field 'ProgramInfo.summary_performance'
        db.add_column(u'director_programinfo', 'summary_performance',
                      self.gf('django.db.models.fields.TextField')(null=True, blank=True),
                      keep_default=False)

        # Adding field 'ProgramInfo.trend_cost'
        db.add_column(u'director_programinfo', 'trend_cost',
                      self.gf('django.db.models.fields.CharField')(default='Middle', max_length=10),
                      keep_default=False)


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
            'Meta': {'object_name': 'ProgramObservation'},
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