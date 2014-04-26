// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

var layer_geocoder = {};
layer_geocoder.searchPhrase="Search Google";
layer_geocoder.map=null;

layer_geocoder.lookupBoxID ="#address_lookup_box";
layer_geocoder.$lookupBox=null;

layer_geocoder.lookupButtonID ="#address_lookup_submit";
layer_geocoder.$lookupButton=null;

//NOTE: This is overlayed with a setting if it exists on init
layer_geocoder.lookup_server = "http://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=";

layer_geocoder.setupMap=function(){
    if (layer_geocoder.map) return;
    if (typeof map!="undefined" && map.zoomToExtent) layer_geocoder.map = map;
    if (typeof incident_support!="undefined" && incident_support.map && incident_support.map.zoomToExtent) layer_geocoder.map = incident_support.map;
}

layer_geocoder.submitAddressLookup=function(address) {
    //TODO: Have a list of POIs per event
    layer_geocoder.$lookupButton.text("Searching...");

    //First, try if it's a lat, lng location
    if (address && address.length && address.indexOf(',')>-1){
        var sliced = address.split(',');
        if (sliced.length && sliced.length==2){
            var lat = parseFloat(sliced[0]);
            var lng = parseFloat(sliced[1]);
            if (_.isNumber(lat) && _.isNumber(lng) && !isNaN(lat) && !isNaN(lng)){
                var ol_loc = new OpenLayers.LonLat(lng,lat);
                layer_geocoder.setupMap();
                layer_geocoder.map.setCenter(ol_loc,10);
                return;
            }
        }
    }

    if (layer_geocoder.lookup_server){
        layer_geocoder.$lookupBox
            .css({backgroundColor:'lightblue'});

        var url = layer_geocoder.lookup_server+encodeURIComponent(address);
        //if (document.location.protocol=="https:") url=url.replace('http://','https://');
        url = event_pages.proxify(url);

        $.get(url+"&callback=?", function(response) {
            layer_geocoder.requestGoogleGeoCodeSuccess(response); })
        .fail(function(details) {
            layer_geocoder.LocLookupFailure(details.statusText || "Can't connect"); })
        .always(function() {
            console.log( "Geocode lookup complete - "+url ); });
    }
};
layer_geocoder.requestGoogleGeoCodeSuccess=function(response) {
    try {
        if (_.isString(response)) {
            response = JSON.parse(response);
        }
        layer_geocoder.$lookupButton.text("Response received.");

        var location =response.results[0];
        var lat = location.latitude;
        var lng =location.longitude;

        if (!lat || !lng) {
            if (location && location.geometry && location.geometry.location) {
                lat =  location.geometry.location.lat || location.geometry.location.latitude;
                lng =  location.geometry.location.lng || location.geometry.location.lon || location.geometry.location.longitude;
            }
        }

        var name = location.formatted_address;

        var bounds = location.bounds || (location.geometry?location.geometry.bounds:false);
        var padding = 0.025;
        if (!bounds){
            bounds = {northeast:{lat:lat+padding,lng:lng+padding},southwest:{lat:lat-padding,lng:lng-padding}};
        }
        layer_geocoder.addRect(bounds,name);

        if (bounds && bounds.southwest && bounds.southwest.lat){
            layer_geocoder.setupMap();
            layer_geocoder.map.zoomToExtent([bounds.southwest.lng,bounds.southwest.lat,bounds.northeast.lng,bounds.northeast.lat],false);
        }

        layer_geocoder.$lookupBox
            .css({backgroundColor:'lightgreen'});

    } catch(ex){
        layer_geocoder.LocLookupFailure("Problem Parsing Result");
    }
};
layer_geocoder.addRect=function(bounds,name){
    var lat1 = bounds.northeast.lat;
    var lon1 = bounds.northeast.lng;
    var lat2 = bounds.southwest.lat;
    var lon2 = bounds.southwest.lng;

    var style = {
        strokeColor: "#00FF00",
        strokeOpacity: 0.5,
        strokeWidth: 3,
        fillColor: "#00FF00",
        fillOpacity: 0
    };

    var p1 = new OpenLayers.Geometry.Point(lon1, lat1);
    var p2 = new OpenLayers.Geometry.Point(lon1, lat2);
    var p3 = new OpenLayers.Geometry.Point(lon2, lat2);
    var p4 = new OpenLayers.Geometry.Point(lon2, lat1);
    var p5 = new OpenLayers.Geometry.Point(lon1, lat1);

    var pnt= [];
    pnt.push(p1,p2,p3,p4,p5);

    var ln = new OpenLayers.Geometry.LinearRing(pnt);
    var pf = new OpenLayers.Feature.Vector(ln, null, style);

    var vector = new OpenLayers.Layer.Vector(name);
    vector.addFeatures([pf]);

    layer_geocoder.setupMap();
    layer_geocoder.map.addLayer(vector);
};
layer_geocoder.LocLookupFailure=function(response) {
    response = response || "Lookup failed";

    if (!_.isString(response)){
        if (response.statusText){
            response=response.statusText;
        }else{
            response="Error";
        }
    }

    layer_geocoder.$lookupButton
        .text(response);
    layer_geocoder.$lookupBox
        .text(response)
        .css({backgroundColor:'lightred'});

};

layer_geocoder.setupAddressLookup=function(){
    //Have it run only twice/sec to prevent multiple returns
    if (typeof _ != "undefined" && _.throttle) {
        layer_geocoder.submitAddressLookup = _.throttle(layer_geocoder.submitAddressLookup, 500);
    }

    //If a settings object exists, use that setting
    if (typeof settings!="undefined" && settings.serverurl_google_geocode) {
        layer_geocoder.lookup_server = settings.serverurl_google_geocode;
    }

    layer_geocoder.$lookupBox = $(layer_geocoder.lookupBoxID);
    layer_geocoder.$lookupButton = $(layer_geocoder.lookupButtonID);
    if (!layer_geocoder.$lookupBox || !layer_geocoder.$lookupButton){
        console.log("No lookupbox found, not showing geocoder");
        return;
    }

    var validateSearchTerm = function(address){
        var helpText = layer_geocoder.searchPhrase;
        if (!address || $.trim(address)=="") {
            helpText = "Enter Location";
        } else {
            var isLatLng = address.match(/^([-+]?\d{1,2}([.]\d+)?),\s*([-+]?\d{1,3}([.]\d+)?)$/);
            if (isLatLng){
                helpText ="Go to this Lat/Lng";
            } else if ($.trim(address) == "") {
                helpText="Enter Location";
            }
        }
        layer_geocoder.$lookupButton.text(helpText);
    };

    if (layer_geocoder.lookup_server){
        layer_geocoder.$lookupBox
            .keyup(function() {
                var address = layer_geocoder.$lookupBox.val();
                validateSearchTerm(address);
            })
            .keypress(function(e) {
                var address = layer_geocoder.$lookupBox.val();
                if(e.which == 13) {
                    layer_geocoder.submitAddressLookup(address);
                }

                validateSearchTerm(address);
            })
            .on('click',function(){
                this.select();
                layer_geocoder.$lookupBox
                    .css({backgroundColor:'white'});
            })
            .css({height:'14px',fontSize: '12px'})
            .popover({
                title:'Search for location',
                content:'Enter lat,lng or a placename to search for it',
                trigger:'hover',
                placement:'right'
            });
        $(layer_geocoder.lookupButtonID)
            .on('click mousedown',function(){
                var address = layer_geocoder.$lookupBox.val();
                layer_geocoder.submitAddressLookup(address);
            })
            .popover({
                title:'Search for location',
                content:'Enter lat,lng or a placename to search for it',
                trigger:'hover',
                placement:'top'
            });
    } else {
        layer_geocoder.$lookupButton.hide();
        layer_geocoder.$lookupBox.hide();
    }
};