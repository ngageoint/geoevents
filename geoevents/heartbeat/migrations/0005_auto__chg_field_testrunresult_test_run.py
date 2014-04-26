# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'TestRunResult.test_run'
        db.alter_column('heartbeat_testrunresult', 'test_run_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['heartbeat.TestRun'], null=True))

    def backwards(self, orm):

        # User chose to not deal with backwards NULL issues for 'TestRunResult.test_run'
        raise RuntimeError("Cannot reverse this migration. 'TestRunResult.test_run' and its values cannot be restored.")

    models = {
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'heartbeat.test': {
            'Meta': {'ordering': "['-created']", 'unique_together': "(('table', 'object_id', 'type_of_test', 'urlorfield'),)", 'object_name': 'Test'},
            'closed': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'group': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'object_id': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'table': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']", 'null': 'True', 'blank': 'True'}),
            'type_of_test': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'urlorfield': ('django.db.models.fields.CharField', [], {'max_length': '1000'})
        },
        'heartbeat.testrun': {
            'Meta': {'object_name': 'TestRun'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tests': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['heartbeat.Test']", 'symmetrical': 'False'})
        },
        'heartbeat.testrunresult': {
            'Meta': {'ordering': "['-created', 'test']", 'object_name': 'TestRunResult'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'latency': ('django.db.models.fields.DecimalField', [], {'max_digits': '5', 'decimal_places': '3'}),
            'response': ('django.db.models.fields.CharField', [], {'max_length': '2000', 'null': 'True', 'blank': 'True'}),
            'result': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'test': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['heartbeat.Test']"}),
            'test_run': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['heartbeat.TestRun']", 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['heartbeat']