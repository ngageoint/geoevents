# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'ServiceType'
        db.create_table('operations_servicetype', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=15)),
            ('description', self.gf('tinymce.models.HTMLField')(max_length=800, null=True, blank=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')(default=1, max_length=1)),
        ))
        db.send_create_signal('operations', ['ServiceType'])

        # Adding model 'Service'
        db.create_table('operations_service', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=75)),
            ('description', self.gf('tinymce.models.HTMLField')(max_length=800, null=True, blank=True)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_updated', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, null=True, blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')(default=1, max_length=1)),
        ))
        db.send_create_signal('operations', ['Service'])

        # Adding M2M table for field service_type on 'Service'
        db.create_table('operations_service_service_type', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('service', models.ForeignKey(orm['operations.service'], null=False)),
            ('servicetype', models.ForeignKey(orm['operations.servicetype'], null=False))
        ))
        db.create_unique('operations_service_service_type', ['service_id', 'servicetype_id'])

        # Adding model 'Event'
        db.create_table('operations_event', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('closed', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('last_updated', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, null=True, blank=True)),
            ('event_location', self.gf('django.db.models.fields.CharField')(max_length=200, null=True)),
            ('description', self.gf('tinymce.models.HTMLField')(max_length=1000, null=True, blank=True)),
            ('link', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
            ('collaboration_link', self.gf('django.db.models.fields.URLField')(default='https://connect.dco.dod.mil/r3ops?launcher=false', max_length=200, null=True, blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')(default=1, max_length=1)),
            ('map', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['maps.Map'], null=True, blank=True)),
            ('posture', self.gf('django.db.models.fields.CharField')(default='Monitoring', max_length=25)),
            ('poc', self.gf('tinymce.models.HTMLField')(max_length=1000, null=True, blank=True)),
            ('product_feed_url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
            ('rfi_generator_id', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
            ('event_type', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('point', self.gf('django.contrib.gis.db.models.fields.PointField')(null=True, blank=True)),
            ('latitude', self.gf('django.db.models.fields.FloatField')()),
            ('longitude', self.gf('django.db.models.fields.FloatField')()),
            ('tags', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('slug', self.gf('django.db.models.fields.SlugField')(max_length=50)),
        ))
        db.send_create_signal('operations', ['Event'])

        # Adding M2M table for field services on 'Event'
        db.create_table('operations_event_services', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('event', models.ForeignKey(orm['operations.event'], null=False)),
            ('service', models.ForeignKey(orm['operations.service'], null=False))
        ))
        db.create_unique('operations_event_services', ['event_id', 'service_id'])

        # Adding model 'Deployment'
        db.create_table('operations_deployment', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('deployment_location', self.gf('django.db.models.fields.CharField')(max_length=400)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('closed', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('event', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['operations.Event'])),
            ('description', self.gf('tinymce.models.HTMLField')(max_length=1000, null=True, blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')(default=1, max_length=1)),
            ('latitude', self.gf('django.db.models.fields.FloatField')()),
            ('longitude', self.gf('django.db.models.fields.FloatField')()),
            ('point', self.gf('django.contrib.gis.db.models.fields.PointField')(null=True, blank=True)),
        ))
        db.send_create_signal('operations', ['Deployment'])

        # Adding M2M table for field deployers on 'Deployment'
        db.create_table('operations_deployment_deployers', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('deployment', models.ForeignKey(orm['operations.deployment'], null=False)),
            ('user', models.ForeignKey(orm['auth.user'], null=False))
        ))
        db.create_unique('operations_deployment_deployers', ['deployment_id', 'user_id'])

        # Adding model 'LessonLearnedCategory'
        db.create_table('operations_lessonlearnedcategory', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('description', self.gf('tinymce.models.HTMLField')(max_length=1000, null=True, blank=True)),
        ))
        db.send_create_signal('operations', ['LessonLearnedCategory'])

        # Adding model 'LessonLearned'
        db.create_table('operations_lessonlearned', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_updated', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, null=True, blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')(default=1, max_length=1, null=True, blank=True)),
            ('closed', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('event', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['operations.Event'], null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('assigned_to', self.gf('django.db.models.fields.related.ForeignKey')(max_length=250, related_name='lesson_learned_assignment', null=True, blank=True, to=orm['auth.User'])),
            ('submitted_by', self.gf('django.db.models.fields.related.ForeignKey')(max_length=250, related_name='lesson_learned_submission', null=True, blank=True, to=orm['auth.User'])),
            ('due', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('priority', self.gf('django.db.models.fields.CharField')(default='Low', max_length=25, null=True, blank=True)),
            ('category', self.gf('django.db.models.fields.related.ForeignKey')(max_length=50, to=orm['operations.LessonLearnedCategory'], null=True, blank=True)),
            ('description', self.gf('tinymce.models.HTMLField')(max_length=1000, null=True)),
            ('work_around', self.gf('tinymce.models.HTMLField')(max_length=1000, null=True, blank=True)),
            ('action', self.gf('tinymce.models.HTMLField')(max_length=1000, null=True, blank=True)),
            ('resolution', self.gf('tinymce.models.HTMLField')(max_length=1000, null=True, blank=True)),
        ))
        db.send_create_signal('operations', ['LessonLearned'])

        # Adding unique constraint on 'LessonLearned', fields ['submitted_by', 'description', 'event']
        db.create_unique('operations_lessonlearned', ['submitted_by_id', 'description', 'event_id'])

        # Adding model 'SitRep'
        db.create_table('operations_sitrep', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_updated', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, null=True, blank=True)),
            ('status', self.gf('django.db.models.fields.IntegerField')(default=1, max_length=1, null=True, blank=True)),
            ('closed', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('event', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['operations.Event'], null=True, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('content', self.gf('tinymce.models.HTMLField')(max_length=6000)),
            ('owner', self.gf('django.db.models.fields.related.ForeignKey')(max_length=250, to=orm['auth.User'], null=True, blank=True)),
        ))
        db.send_create_signal('operations', ['SitRep'])


    def backwards(self, orm):
        # Removing unique constraint on 'LessonLearned', fields ['submitted_by', 'description', 'event']
        db.delete_unique('operations_lessonlearned', ['submitted_by_id', 'description', 'event_id'])

        # Deleting model 'ServiceType'
        db.delete_table('operations_servicetype')

        # Deleting model 'Service'
        db.delete_table('operations_service')

        # Removing M2M table for field service_type on 'Service'
        db.delete_table('operations_service_service_type')

        # Deleting model 'Event'
        db.delete_table('operations_event')

        # Removing M2M table for field services on 'Event'
        db.delete_table('operations_event_services')

        # Deleting model 'Deployment'
        db.delete_table('operations_deployment')

        # Removing M2M table for field deployers on 'Deployment'
        db.delete_table('operations_deployment_deployers')

        # Deleting model 'LessonLearnedCategory'
        db.delete_table('operations_lessonlearnedcategory')

        # Deleting model 'LessonLearned'
        db.delete_table('operations_lessonlearned')

        # Deleting model 'SitRep'
        db.delete_table('operations_sitrep')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'maps.map': {
            'Meta': {'object_name': 'Map'},
            'center_x': ('django.db.models.fields.FloatField', [], {'default': '0.0'}),
            'center_y': ('django.db.models.fields.FloatField', [], {'default': '0.0'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'max_length': '800', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'projection': ('django.db.models.fields.CharField', [], {'default': "'EPSG:4326'", 'max_length': '32', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '75'}),
            'zoom': ('django.db.models.fields.IntegerField', [], {})
        },
        'operations.deployment': {
            'Meta': {'object_name': 'Deployment'},
            'closed': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'deployers': ('django.db.models.fields.related.ManyToManyField', [], {'max_length': '250', 'to': "orm['auth.User']", 'null': 'True', 'symmetrical': 'False', 'blank': 'True'}),
            'deployment_location': ('django.db.models.fields.CharField', [], {'max_length': '400'}),
            'description': ('tinymce.models.HTMLField', [], {'max_length': '1000', 'null': 'True', 'blank': 'True'}),
            'event': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['operations.Event']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'latitude': ('django.db.models.fields.FloatField', [], {}),
            'longitude': ('django.db.models.fields.FloatField', [], {}),
            'point': ('django.contrib.gis.db.models.fields.PointField', [], {'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'})
        },
        'operations.event': {
            'Meta': {'ordering': "['-last_updated']", 'object_name': 'Event'},
            'closed': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'collaboration_link': ('django.db.models.fields.URLField', [], {'default': "'https://connect.dco.dod.mil/r3ops?launcher=false'", 'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('tinymce.models.HTMLField', [], {'max_length': '1000', 'null': 'True', 'blank': 'True'}),
            'event_location': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True'}),
            'event_type': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'latitude': ('django.db.models.fields.FloatField', [], {}),
            'link': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'longitude': ('django.db.models.fields.FloatField', [], {}),
            'map': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['maps.Map']", 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'poc': ('tinymce.models.HTMLField', [], {'max_length': '1000', 'null': 'True', 'blank': 'True'}),
            'point': ('django.contrib.gis.db.models.fields.PointField', [], {'null': 'True', 'blank': 'True'}),
            'posture': ('django.db.models.fields.CharField', [], {'default': "'Monitoring'", 'max_length': '25'}),
            'product_feed_url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'rfi_generator_id': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'services': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['operations.Service']", 'null': 'True', 'blank': 'True'}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'tags': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'})
        },
        'operations.lessonlearned': {
            'Meta': {'ordering': "['-created']", 'unique_together': "(('submitted_by', 'description', 'event'),)", 'object_name': 'LessonLearned'},
            'action': ('tinymce.models.HTMLField', [], {'max_length': '1000', 'null': 'True', 'blank': 'True'}),
            'assigned_to': ('django.db.models.fields.related.ForeignKey', [], {'max_length': '250', 'related_name': "'lesson_learned_assignment'", 'null': 'True', 'blank': 'True', 'to': "orm['auth.User']"}),
            'category': ('django.db.models.fields.related.ForeignKey', [], {'max_length': '50', 'to': "orm['operations.LessonLearnedCategory']", 'null': 'True', 'blank': 'True'}),
            'closed': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('tinymce.models.HTMLField', [], {'max_length': '1000', 'null': 'True'}),
            'due': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'event': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['operations.Event']", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'priority': ('django.db.models.fields.CharField', [], {'default': "'Low'", 'max_length': '25', 'null': 'True', 'blank': 'True'}),
            'resolution': ('tinymce.models.HTMLField', [], {'max_length': '1000', 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'submitted_by': ('django.db.models.fields.related.ForeignKey', [], {'max_length': '250', 'related_name': "'lesson_learned_submission'", 'null': 'True', 'blank': 'True', 'to': "orm['auth.User']"}),
            'work_around': ('tinymce.models.HTMLField', [], {'max_length': '1000', 'null': 'True', 'blank': 'True'})
        },
        'operations.lessonlearnedcategory': {
            'Meta': {'ordering': "['name']", 'object_name': 'LessonLearnedCategory'},
            'description': ('tinymce.models.HTMLField', [], {'max_length': '1000', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        },
        'operations.service': {
            'Meta': {'ordering': "['name']", 'object_name': 'Service'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('tinymce.models.HTMLField', [], {'max_length': '800', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'service_type': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['operations.ServiceType']", 'symmetrical': 'False'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        'operations.servicetype': {
            'Meta': {'ordering': "['name']", 'object_name': 'ServiceType'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('tinymce.models.HTMLField', [], {'max_length': '800', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '15'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1'})
        },
        'operations.sitrep': {
            'Meta': {'ordering': "['-created']", 'object_name': 'SitRep'},
            'closed': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'content': ('tinymce.models.HTMLField', [], {'max_length': '6000'}),
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'event': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['operations.Event']", 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'owner': ('django.db.models.fields.related.ForeignKey', [], {'max_length': '250', 'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.IntegerField', [], {'default': '1', 'max_length': '1', 'null': 'True', 'blank': 'True'})
        },
        'taggit.tag': {
            'Meta': {'object_name': 'Tag'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '100'})
        },
        'taggit.taggeditem': {
            'Meta': {'object_name': 'TaggedItem'},
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'taggit_taggeditem_tagged_items'", 'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'object_id': ('django.db.models.fields.IntegerField', [], {'db_index': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'taggit_taggeditem_items'", 'to': "orm['taggit.Tag']"})
        }
    }

    complete_apps = ['operations']