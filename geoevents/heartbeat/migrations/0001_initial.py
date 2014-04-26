# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Test'
        db.create_table('heartbeat_test', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_updated', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, null=True, blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')(default=1, max_length=1, null=True, blank=True)),
            ('closed', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=75)),
            ('table', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['contenttypes.ContentType'], null=True, blank=True)),
            ('object_id', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
            ('type_of_test', self.gf('django.db.models.fields.CharField')(max_length=75)),
            ('urlorfield', self.gf('django.db.models.fields.CharField')(max_length=1000)),
            ('group', self.gf('django.db.models.fields.CharField')(max_length=75)),
        ))
        db.send_create_signal('heartbeat', ['Test'])

        # Adding unique constraint on 'Test', fields ['table', 'object_id', 'type_of_test', 'urlorfield']
        db.create_unique('heartbeat_test', ['table_id', 'object_id', 'type_of_test', 'urlorfield'])

        # Adding model 'TestRun'
        db.create_table('heartbeat_testrun', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal('heartbeat', ['TestRun'])

        # Adding M2M table for field tests on 'TestRun'
        db.create_table('heartbeat_testrun_tests', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('testrun', models.ForeignKey(orm['heartbeat.testrun'], null=False)),
            ('test', models.ForeignKey(orm['heartbeat.test'], null=False))
        ))
        db.create_unique('heartbeat_testrun_tests', ['testrun_id', 'test_id'])

        # Adding M2M table for field results on 'TestRun'
        db.create_table('heartbeat_testrun_results', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('testrun', models.ForeignKey(orm['heartbeat.testrun'], null=False)),
            ('testrunresult', models.ForeignKey(orm['heartbeat.testrunresult'], null=False))
        ))
        db.create_unique('heartbeat_testrun_results', ['testrun_id', 'testrunresult_id'])

        # Adding model 'TestRunResult'
        db.create_table('heartbeat_testrunresult', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('test', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['heartbeat.Test'])),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('result', self.gf('django.db.models.fields.CharField')(max_length=75)),
            ('latency', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('response', self.gf('django.db.models.fields.CharField')(max_length=2000, null=True, blank=True)),
        ))
        db.send_create_signal('heartbeat', ['TestRunResult'])


    def backwards(self, orm):
        # Removing unique constraint on 'Test', fields ['table', 'object_id', 'type_of_test', 'urlorfield']
        db.delete_unique('heartbeat_test', ['table_id', 'object_id', 'type_of_test', 'urlorfield'])

        # Deleting model 'Test'
        db.delete_table('heartbeat_test')

        # Deleting model 'TestRun'
        db.delete_table('heartbeat_testrun')

        # Removing M2M table for field tests on 'TestRun'
        db.delete_table('heartbeat_testrun_tests')

        # Removing M2M table for field results on 'TestRun'
        db.delete_table('heartbeat_testrun_results')

        # Deleting model 'TestRunResult'
        db.delete_table('heartbeat_testrunresult')


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
            'results': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['heartbeat.TestRunResult']", 'symmetrical': 'False'}),
            'tests': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['heartbeat.Test']", 'symmetrical': 'False'})
        },
        'heartbeat.testrunresult': {
            'Meta': {'object_name': 'TestRunResult'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'latency': ('django.db.models.fields.PositiveIntegerField', [], {}),
            'response': ('django.db.models.fields.CharField', [], {'max_length': '2000', 'null': 'True', 'blank': 'True'}),
            'result': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'test': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['heartbeat.Test']"})
        }
    }

    complete_apps = ['heartbeat']