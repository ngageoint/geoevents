# -*- coding: utf-8 -*-
# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)


import json
from django.contrib.gis.db import models
from geoevents.taggit.managers import TaggableManager
from datetime import datetime

IMAGE_FORMATS = (
    ('image/png', 'image/png'),
    ('image/png8', 'image/png8'),
    ('image/jpeg', 'image/jpeg'),
    ('image/gif', 'image/gif'),
    ('image/tiff', 'image/tiff'),
    ('image/tiff8', 'image/tiff8'),
    ('image/geotiff', 'image/geotiff'),
    ('image/geotiff8', 'image/geotiff8'),
    ('image/svg', 'image/svg'),
    ('rss', 'rss'),
    ('kml', 'kml'),
    ('kmz', 'kmz'),
    ('json', 'json'),
    ('png', 'png'),
    ('png8', 'png8'),
    ('jpeg', 'jpeg'),
    ('jpg', 'jpg'),
    ('gif', 'gif'),
    ('tiff', 'tiff'),
    ('tiff8', 'tiff8'),
    ('geotiff', 'geotiff'),
    ('geotiff8', 'geotiff8'),
    ('svg', 'svg'),
)

SERVICE_TYPES = (
    ('ArcGIS93Rest', 'ArcGIS93Rest'),
    ('WMS', 'WMS'),
    ('KML', 'KML'),
    ('GeoRSS', 'GeoRSS'),
    ('GeoJSON', 'GeoJSON'),
    ('GPX', 'GPX'),
    ('GML', 'GML'),
    ('WMTS', 'WMTS'),
    ('MapBox', 'MapBox'),
    ('TileServer', 'TileServer'),
    ('GetCapabilities', 'GetCapabilities'),
)

MAP_CATEGORIES = [(n, n) for n in sorted(
    ['Human Geography', 'Hurricanes', 'Floods', 'Earthquakes', 'Fires', 'Volcanoes', 'Tsunami', 'Infrastructure',
     'Event-Specific', 'Disease'])]
INFO_FORMATS = [(n, n) for n in sorted(
    ['application/vnd.ogc.wms_xml', 'application/xml', 'text/html', 'text/plain', 'application/json'])]

PARSER_CATEGORIES = (
    ('palanterra', 'palanterra'),
    ('uscg_ships', 'uscg_ships'),
    ('icnet', 'icnet'),
    ('dg_wmts_time', 'dg_wmts_time'),
    ('geomedia_triaged', 'geomedia_triaged'),
    ('harvester_earthquake', 'harvester_earthquake'),
    ('harvester_fire', 'harvester_fire'),
    ('harvester_tsunami', 'harvester_tsunami'),
    ('harvester_flood', 'harvester_flood'),
    ('harvester_volcano', 'harvester_volcano'),
    ('ima', 'ima'),
)


class Layer(models.Model):
    """
    A layer object that can be added to any map.
    """

    name = models.CharField(max_length=200)
    type = models.CharField(choices=SERVICE_TYPES, max_length=75)
    url = models.URLField(max_length=600,
                          help_text='URL of service. If WMS, can be any valid URL. Otherwise, the URL will require a local proxy and Firewall change to access it')
    layer = models.CharField(max_length=800, null=True, blank=True,
                             help_text='The layer name from the GetCapabilities document. Many ESRI servers have just "0" or "1" for layers names. Layer names can sometimes be comma-separated ("0,1,2"), and are not needed for data layers such as KML, GeoRSS, GeoJSON..')
    image_format = models.CharField(null=True, blank=True, choices=IMAGE_FORMATS, max_length=75,
                                    help_text='The MIME type of the image format to use for tiles on WMS layers (image/png, image/jpeg image/gif...). Double check that the server exposes this exactly - some servers push png instead of image/png.')
    tags = TaggableManager(blank=True, help_text='Tags to help search for layers')
    description = models.TextField(max_length=800, null=True, blank=True,
                                   help_text='Text to show in layer chooser, please be descriptive - this will soon be searchable')
    attribution = models.CharField(max_length=200, null=True, blank=True,
                                   help_text="Attribution from layers to the map display (will show in bottom of map when layer is visible).")

    ## Advanced layer options
    objects = models.GeoManager()
    category = models.CharField(max_length=50, null=True, blank=True, choices=MAP_CATEGORIES,
                                help_text='Categories that will be used to organize map layers that users can add to map from the Layers button')
    styles = models.CharField(null=True, blank=True, max_length=200,
                              help_text='The name of a style to use for this layer (only useful for WMS layers if the server exposes it.)')
    transparent = models.BooleanField(default=True,
                                      help_text='If WMS or overlay, should the tiles be transparent where possible?')
    refreshrate = models.PositiveIntegerField(
        help_text='Layer refresh rate in seconds for vector/data layers (will not refresh WMS layers)',
        verbose_name="Layer Refresh Rate", blank=True, null=True)
    token = models.CharField(max_length=400, null=True, blank=True,
                             help_text='Authentication token, if required (usually only for secure layer servers)')
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    show_in_table = models.BooleanField(default=True,
                                        help_text="Draw a table on the Event Pages with any info found from results.")
    allow_image_modifications = models.BooleanField(default=False,
                                                    help_text="Allow the user to change Brightness, Sharpness, etc on layer - requires that the server can proxy to the source server and thus Firewall might need to be opened.")
    extent = models.PolygonField(null=True, blank=True, help_text='Extent of the layer.')
    layer_parsing_function = models.CharField(max_length=100, blank=True, null=True, choices=PARSER_CATEGORIES,
                                              help_text='Advanced - The javascript function used to parse a data service (GeoJSON, GeoRSS, KML), needs to be an internally known parser. Contact an admin if you need data parsed in a new way.')
    enable_identify = models.BooleanField(default=False,
                                          help_text='Advanced - Allow user to click map to query layer for details. The map server must support queries for this layer.')
    info_format = models.CharField(max_length=75, null=True, blank=True, choices=INFO_FORMATS,
                                   help_text='Advanced - what format the server returns for an WMS-I query')
    root_field = models.CharField(max_length=100, null=True, blank=True,
                                  help_text='Advanced - For WMS-I (queryable) layers, the root field returned by server. Leave blank for default (will usually be "FIELDS" in returned XML).')
    fields_to_show = models.CharField(max_length=200, null=True, blank=True,
                                      help_text='Fields to show when someone uses the identify tool to click on the layer. Leave blank for all.')
    downloadableLink = models.URLField(max_length=300, null=True, blank=True,
                                       help_text='URL of link to supporting tool (such as a KML document that will be shown as a download button)')
    layer_params = models.TextField(null=True, blank=True,
                                    help_text='JSON key/value pairs to be sent to the web service.  Use double-quotes around both the key and value for JSON. ex: {"crs":"urn:ogc:def:crs:EPSG::4326"}')
    spatial_reference = models.CharField(max_length=32, blank=True, null=True, default="EPSG:4326",
                                         help_text='The spatial reference of the service.  Should be in ESPG:XXXX format.')
    constraints = models.TextField(null=True, blank=True)

    ## Primarily for http://trac.osgeo.org/openlayers/wiki/OpenLayersOptimization
    additional_domains = models.TextField(null=True, blank=True,
                                          help_text='Semicolon seperated list of additional domains for the layer.')


    ## Not yet implemented
    min_scale = models.FloatField(null=True, blank=True)
    max_scale = models.FloatField(null=True, blank=True,
                                  help_text='Not yet implemented - Used for Zoom to Layer operation.')
    source_params = models.TextField(null=True, blank=True,
                                     help_text='Not yet implemented - Options to pass into layer builder')

    def __unicode__(self):
        return '{0}'.format(self.name)

    def tags_as_list(self):
        """
        Returns the layer's tags.
        """
        return self.tags.all()

    def get_layer_urls(self):
        """
        Returns a list of urls for the layer.
        """
        urls = [self.url]

        if getattr(self, 'additional_domains'):
            map(urls.append, (domain for domain in self.additional_domains.split(";") if domain))

        return urls

    def get_layer_params(self):
        """
        Converts a layer's parameters to json.
        """
        try:
            params = json.loads(self.layer_params)

        except:
            params = dict()

        model_fields = [field.name for field in self._meta.fields if field.name in params.keys()]

        for key in model_fields:
            if self.__getattribute__(key):
                params.pop(key)

        return params

    class Meta:
        ordering = ["name"]


class Map(models.Model):
    """
    A Map aggregates several layers together.
    """

    title = models.CharField(max_length=75, unique=True)
    description = models.TextField(max_length=800, blank=True, null=True)
    zoom = models.IntegerField(help_text='Sets the default zoom level of the map.')
    projection = models.CharField(max_length=32, blank=True, null=True, default="EPSG:4326",
                                  help_text='Set the default projection for layers added to this map. Note that the projection of the map is usually determined by that of the current baseLayer')
    center_x = models.FloatField(default=0.0,
                                 help_text='Sets the center x coordinate of the map.  Maps on event pages default to the location of the event.')
    center_y = models.FloatField(default=0.0,
                                 help_text='Sets the center y coordinate of the map.  Maps on event pages default to the location of the event.')
    created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now_add=True)
    tags = TaggableManager(blank=True)

    def __unicode__(self):
        return '{0}'.format(self.title)

    @property
    def center(self):
        """
        A handy shortcut for the center_x and center_y properties as a tuple
        (read only)
        """
        return (self.center_x, self.center_y)

    @property
    def layers(self):
        layers = MapLayer.objects.filter(map=self.id)
        return [layer for layer in layers]

    def map_layers_json(self):
        def layer_json(map_layer):
            return {
                "id": map_layer.layer.id,
                "name": map_layer.layer.name,
                "format": map_layer.layer.image_format,
                "type": map_layer.layer.type,
                "url": map_layer.layer.get_layer_urls(),
                "layer": map_layer.layer.layer,
                "shown": map_layer.shown,
                "transparent": map_layer.layer.transparent,
                "show_in_table": map_layer.layer.show_in_table,
                "allow_image_modifications": map_layer.layer.allow_image_modifications,
                "opacity": map_layer.opacity,
                "layerParams": map_layer.layer.get_layer_params(),
                "sourceParams": map_layer.layer.source_params,
                "isBaseLayer": map_layer.is_base_layer,
                "displayInLayerSwitcher": map_layer.display_in_layer_switcher,
                "refreshrate": map_layer.layer.refreshrate,
                "token": map_layer.layer.token,
                "category": map_layer.layer.category,
                "attribution": map_layer.layer.attribution,
                "spatialReference": map_layer.layer.spatial_reference,
                "layerParsingFunction": map_layer.layer.layer_parsing_function,
                "minScale": map_layer.layer.min_scale,
                "maxScale": map_layer.layer.max_scale,
                "enableIdentify": map_layer.layer.enable_identify,
                "rootField": map_layer.layer.root_field,
                "infoFormat": map_layer.layer.info_format,
                "fieldsToShow": map_layer.layer.fields_to_show,
                "description": map_layer.layer.description,
                "downloadableLink": map_layer.layer.downloadableLink,
                "tags": [n.name for n in map_layer.layer.tags_as_list()],
                "styles": map_layer.layer.styles,
            }

        map_services = []
        for map_layer in self.layers:
            map_services.append(layer_json(map_layer))

        return json.dumps(map_services)

    def map_json(self):
        return json.dumps({
            "center_x": self.center_x,
            "center_y": self.center_y,
            "zoom": self.zoom,
            "projection": self.projection or "EPSG:4326",
        })


class MapLayer(models.Model):
    """
    The MapLayer is the mechanism that joins a Layer to a Map and allows for custom look and feel.
    """

    map = models.ForeignKey(Map, related_name='map_set')
    layer = models.ForeignKey(Layer, related_name='map_layer_set')
    shown = models.BooleanField(default=True)
    stack_order = models.IntegerField()
    opacity = models.FloatField(default=.80)
    is_base_layer = models.BooleanField(
        help_text="Base Layers are mutually exclusive layers, meaning only one can be enabled at any given time. The currently active base layer determines the available projection (coordinate system) and zoom levels available on the map.")
    display_in_layer_switcher = models.BooleanField()

    class Meta:
        ordering = ["stack_order"]

    def __unicode__(self):
        return 'Layer {0}: {1}'.format(self.stack_order, self.layer)