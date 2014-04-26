# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'Setting.value'
        db.alter_column('core_setting', 'value', self.gf('django.db.models.fields.TextField')(max_length=800))

    def backwards(self, orm):

        # Changing field 'Setting.value'
        db.alter_column('core_setting', 'value', self.gf('django.db.models.fields.CharField')(max_length=200))

    models = {
        'core.setting': {
            'Meta': {'object_name': 'Setting'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'value': ('django.db.models.fields.TextField', [], {'max_length': '800', 'blank': 'True'})
        }
    }

    complete_apps = ['core']