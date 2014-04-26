# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'PageWidget.width'
        db.delete_column(u'director_pagewidget', 'width')

        # Adding field 'PageWidget.theme'
        db.add_column(u'director_pagewidget', 'theme',
                      self.gf('django.db.models.fields.CharField')(default='Thin', max_length=10),
                      keep_default=False)

        # Adding field 'PageWidget.data_json'
        db.add_column(u'director_pagewidget', 'data_json',
                      self.gf('django.db.models.fields.TextField')(null=True, blank=True),
                      keep_default=False)

        # Adding field 'PageWidget.render_function'
        db.add_column(u'director_pagewidget', 'render_function',
                      self.gf('django.db.models.fields.CharField')(default='notesAndChildNotes', max_length=60),
                      keep_default=False)

        # Adding field 'DashboardWidgets.width'
        db.add_column(u'director_dashboardwidgets', 'width',
                      self.gf('django.db.models.fields.IntegerField')(default=6, max_length=2),
                      keep_default=False)

        # Adding field 'DashboardWidgets.height'
        db.add_column(u'director_dashboardwidgets', 'height',
                      self.gf('django.db.models.fields.IntegerField')(default=360, max_length=3),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'PageWidget.width'
        db.add_column(u'director_pagewidget', 'width',
                      self.gf('django.db.models.fields.IntegerField')(default=6, max_length=2),
                      keep_default=False)

        # Deleting field 'PageWidget.theme'
        db.delete_column(u'director_pagewidget', 'theme')

        # Deleting field 'PageWidget.data_json'
        db.delete_column(u'director_pagewidget', 'data_json')

        # Deleting field 'PageWidget.render_function'
        db.delete_column(u'director_pagewidget', 'render_function')

        # Deleting field 'DashboardWidgets.width'
        db.delete_column(u'director_dashboardwidgets', 'width')

        # Deleting field 'DashboardWidgets.height'
        db.delete_column(u'director_dashboardwidgets', 'height')


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
            'height': ('django.db.models.fields.IntegerField', [], {'default': '360', 'max_length': '3'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'order': ('django.db.models.fields.IntegerField', [], {}),
            'widget': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['director.PageWidget']"}),
            'width': ('django.db.models.fields.IntegerField', [], {'default': '6', 'max_length': '2'})
        },
        u'director.directordashboard': {
            'Meta': {'object_name': 'DirectorDashboard'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'org': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'max_length': '250', 'to': u"orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'page_widgets': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['director.PageWidget']", 'null': 'True', 'through': u"orm['director.DashboardWidgets']", 'blank': 'True'}),
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
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'iframe_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'iframe_url_if_local': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '200'}),
            'render_function': ('django.db.models.fields.CharField', [], {'default': "'notesAndChildNotes'", 'max_length': '60'}),
            'theme': ('django.db.models.fields.CharField', [], {'default': "'Thin'", 'max_length': '10'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'Wiki'", 'max_length': '10'})
        }
    }

    complete_apps = ['director']