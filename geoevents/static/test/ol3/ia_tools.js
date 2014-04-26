goog.require('ol.Map');
goog.require('ol.RendererHint');
goog.require('ol.View2D');
goog.require('ol.control.ScaleLine');
goog.require('ol.control.defaults');
goog.require('ol.layer.TileLayer');
goog.require('ol.source.MapQuestOpenAerial');


//TODO: Pull list of layers and show on map
var eventID = 42; // Lookup - /api/v1/layer/?format=json

var layers = [
  new ol.layer.TileLayer({
    source: new ol.source.MapQuestOpenAerial()
  })

  ,new ol.layer.TileLayer({
    source: new ol.source.TiledWMS({
      url: '/proxy/http://demo.opengeo.org/geoserver/wms',
      params: {'LAYERS': 'topp:states', 'TILED': true}
    })
  })

  ,new ol.layer.TileLayer({
    source: new ol.source.TiledWMS({
      url: '/imageproxy/http://vmap0.tiles.osgeo.org/wms/vmap0',
      params: {
        'VERSION': '1.1.1',
        'LAYERS': 'basic',
        'FORMAT': 'image/png'
      }
    })
  })
  
];

var layer = layers[2];
var ia_nudge = 0.05;

var scaleLineControl = new ol.control.ScaleLine();

var map = new ol.Map({
  controls: ol.control.defaults({}, [
    scaleLineControl
  ]),
  layers: [layer],//layers,
  renderer: ol.RendererHint.WEBGL,//, ol.RendererHint.CANVAS, ol.RendererHint.DOM],
  target: 'map',
  view: new ol.View2D({
    projection: 'EPSG:4326',
    center: [0, 0],
    zoom: 2
  })
});

//------------------
var increaseBrightness = document.getElementById('increase-brightness');
var resetBrightness = document.getElementById('reset-brightness');
var decreaseBrightness = document.getElementById('decrease-brightness');
var increaseContrast = document.getElementById('increase-contrast');
var resetContrast = document.getElementById('reset-contrast');
var decreaseContrast = document.getElementById('decrease-contrast');
var increaseHue = document.getElementById('increase-hue');
var resetHue = document.getElementById('reset-hue');
var decreaseHue = document.getElementById('decrease-hue');
var increaseSaturation = document.getElementById('increase-saturation');
var resetSaturation = document.getElementById('reset-saturation');
var decreaseSaturation = document.getElementById('decrease-saturation');


function setResetBrightnessButtonHTML() {
  resetBrightness.innerHTML = 'Brightness ('+ layer.getBrightness().toFixed(2) + ')';
}
function setResetContrastButtonHTML() {
    resetContrast.innerHTML = 'Contrast (' + layer.getContrast().toFixed(2) + ')';
}
function setResetHueButtonHTML() {
    resetHue.innerHTML = 'Hue (' + layer.getHue().toFixed(2) + ')';
}
function setResetSaturationButtonHTML() {
    resetSaturation.innerHTML = 'Saturation (' + layer.getSaturation().toFixed(2) + ')';
}

setResetBrightnessButtonHTML();
setResetContrastButtonHTML();
setResetHueButtonHTML();
setResetSaturationButtonHTML();



increaseBrightness.addEventListener('click', function() {
  layer.setBrightness(Math.min(layer.getBrightness() + ia_nudge, 1));
  setResetBrightnessButtonHTML();
}, false);
resetBrightness.addEventListener('click', function() {
  layer.setBrightness(0);
  setResetBrightnessButtonHTML();
}, false);
decreaseBrightness.addEventListener('click', function() {
  layer.setBrightness(Math.max(layer.getBrightness() - ia_nudge, -1));
  setResetBrightnessButtonHTML();
}, false);


increaseContrast.addEventListener('click', function() {
  layer.setContrast(layer.getContrast() + ia_nudge);
  setResetContrastButtonHTML();
}, false);
resetContrast.addEventListener('click', function() {
  layer.setContrast(1);
  setResetContrastButtonHTML();
}, false);
decreaseContrast.addEventListener('click', function() {
  layer.setContrast(Math.max(layer.getContrast() - ia_nudge, 0));
  setResetContrastButtonHTML();
}, false);


//---------------------------



increaseHue.addEventListener('click', function() {
  layer.setHue(layer.getHue() + ia_nudge);
  setResetHueButtonHTML();
}, false);
resetHue.addEventListener('click', function() {
  layer.setHue(0);
  setResetHueButtonHTML();
}, false);
decreaseHue.addEventListener('click', function() {
  layer.setHue(layer.getHue() - ia_nudge);
  setResetHueButtonHTML();
}, false);



increaseSaturation.addEventListener('click', function() {
  layer.setSaturation(layer.getSaturation() + ia_nudge);
  setResetSaturationButtonHTML();
}, false);
resetSaturation.addEventListener('click', function() {
  layer.setSaturation(1);
  setResetSaturationButtonHTML();
}, false);
decreaseSaturation.addEventListener('click', function() {
  layer.setSaturation(Math.max(layer.getSaturation() - ia_nudge, 0));
  setResetSaturationButtonHTML();
}, false);







/*
//NOTE: Currently, when pulling the getContext for the webgl map, a black rectangle
// is returned - otherwise, this would allow saving of a screenshot of the image
// Check again if it will be readable if from the same domain

var exportJPEGElement = document.getElementById('export-jpeg');
exportJPEGElement.addEventListener('click', function(e) {
	var c = document.getElementsByTagName('canvas')[0];
	var g = c.getContext('experimental-webgl',{preserveDrawingBuffer:true})
	if (g.canvas.toDataURL) {	
		var new_window = window.open( 'about:blank' );
		var image = new_window.document.createElement( 'img' );
		image.src = g.canvas.toDataURL('image/jpeg');
		new_window.document.body.appendChild( image );
	}
//  var rend = map.getRenderer();
//  e.target.href = rend.getCanvas().toDataURL('image/jpeg');
}, false);

var exportPNGElement = document.getElementById('export-png');
exportPNGElement.addEventListener('click', function(e) {
  var rend = map.getRenderer();
  e.target.href = rend.getCanvas().toDataURL('image/png');
}, false);
*/


