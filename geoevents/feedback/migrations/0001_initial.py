# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Feedback'
        db.create_table('feedback_feedback', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('email', self.gf('django.db.models.fields.EmailField')(max_length=75, null=True, blank=True)),
            ('organization', self.gf('django.db.models.fields.CharField')(max_length=25, null=True, blank=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('subject', self.gf('django.db.models.fields.CharField')(default='Landing Page', max_length=25)),
            ('login_method', self.gf('django.db.models.fields.CharField')(default='CAC', max_length=25)),
            ('platform', self.gf('django.db.models.fields.CharField')(default='CAC', max_length=25)),
            ('feedback', self.gf('django.db.models.fields.TextField')(max_length=1000)),
            ('referer', self.gf('django.db.models.fields.TextField')(max_length=200, null=True, blank=True)),
            ('user_agent', self.gf('django.db.models.fields.TextField')(max_length=300, null=True, blank=True)),
            ('phone', self.gf('django.db.models.fields.CharField')(max_length=12, null=True, blank=True)),
        ))
        db.send_create_signal('feedback', ['Feedback'])


    def backwards(self, orm):
        # Deleting model 'Feedback'
        db.delete_table('feedback_feedback')


    models = {
        'feedback.feedback': {
            'Meta': {'object_name': 'Feedback'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'feedback': ('django.db.models.fields.TextField', [], {'max_length': '1000'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'login_method': ('django.db.models.fields.CharField', [], {'default': "'CAC'", 'max_length': '25'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'organization': ('django.db.models.fields.CharField', [], {'max_length': '25', 'null': 'True', 'blank': 'True'}),
            'phone': ('django.db.models.fields.CharField', [], {'max_length': '12', 'null': 'True', 'blank': 'True'}),
            'platform': ('django.db.models.fields.CharField', [], {'default': "'CAC'", 'max_length': '25'}),
            'referer': ('django.db.models.fields.TextField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'subject': ('django.db.models.fields.CharField', [], {'default': "'Landing Page'", 'max_length': '25'}),
            'user_agent': ('django.db.models.fields.TextField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['feedback']