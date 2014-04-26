# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'PageLinks'
        db.create_table(u'core_pagelinks', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('category', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('url', self.gf('django.db.models.fields.TextField')(max_length=800, null=True, blank=True)),
            ('shortcut', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('show_for_types', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
        ))
        db.send_create_signal(u'core', ['PageLinks'])


    def backwards(self, orm):
        # Deleting model 'PageLinks'
        db.delete_table(u'core_pagelinks')


    models = {
        u'core.pagelinks': {
            'Meta': {'object_name': 'PageLinks'},
            'category': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'shortcut': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'show_for_types': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.TextField', [], {'max_length': '800', 'null': 'True', 'blank': 'True'})
        },
        u'core.setting': {
            'Meta': {'object_name': 'Setting'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'value': ('django.db.models.fields.TextField', [], {'max_length': '800', 'blank': 'True'})
        }
    }

    complete_apps = ['core']