# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Layer'
        db.create_table('maps_layer', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('image_format', self.gf('django.db.models.fields.CharField')(max_length=75, null=True, blank=True)),
            ('layer', self.gf('django.db.models.fields.CharField')(max_length=800)),
            ('type', self.gf('django.db.models.fields.CharField')(max_length=75)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('styles', self.gf('django.db.models.fields.CharField')(max_length=200, null=True, blank=True)),
            ('transparent', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('layer_params', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('source_params', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('maps', ['Layer'])

        # Adding model 'Map'
        db.create_table('maps_map', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(unique=True, max_length=75)),
            ('description', self.gf('django.db.models.fields.TextField')(max_length=800, null=True, blank=True)),
            ('zoom', self.gf('django.db.models.fields.IntegerField')()),
            ('projection', self.gf('django.db.models.fields.CharField')(default='EPSG:4326', max_length=32, null=True, blank=True)),
            ('center_x', self.gf('django.db.models.fields.FloatField')(default=0.0)),
            ('center_y', self.gf('django.db.models.fields.FloatField')(default=0.0)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('last_updated', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal('maps', ['Map'])

        # Adding model 'MapLayer'
        db.create_table('maps_maplayer', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('map', self.gf('django.db.models.fields.related.ForeignKey')(related_name='map_set', to=orm['maps.Map'])),
            ('layer', self.gf('django.db.models.fields.related.ForeignKey')(related_name='map_layer_set', to=orm['maps.Layer'])),
            ('shown', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('stack_order', self.gf('django.db.models.fields.IntegerField')()),
            ('opacity', self.gf('django.db.models.fields.FloatField')(default=0.8)),
            ('is_base_layer', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('display_in_layer_switcher', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal('maps', ['MapLayer'])


    def backwards(self, orm):
        # Deleting model 'Layer'
        db.delete_table('maps_layer')

        # Deleting model 'Map'
        db.delete_table('maps_map')

        # Deleting model 'MapLayer'
        db.delete_table('maps_maplayer')


    models = {
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'maps.layer': {
            'Meta': {'ordering': "['name']", 'object_name': 'Layer'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image_format': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            'layer': ('django.db.models.fields.CharField', [], {'max_length': '800'}),
            'layer_params': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'source_params': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'styles': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'transparent': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '75'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
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
        'maps.maplayer': {
            'Meta': {'ordering': "['stack_order']", 'object_name': 'MapLayer'},
            'display_in_layer_switcher': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_base_layer': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'layer': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'map_layer_set'", 'to': "orm['maps.Layer']"}),
            'map': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'map_set'", 'to': "orm['maps.Map']"}),
            'opacity': ('django.db.models.fields.FloatField', [], {'default': '0.8'}),
            'shown': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'stack_order': ('django.db.models.fields.IntegerField', [], {})
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

    complete_apps = ['maps']