// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

var layerHandler = layerHandler || {};
//TODO: Have calling functions receive set of functions in addition to just layers

layerHandler.layerMaker = layerHandler.layerMaker || {};

//----------------------
layerHandler.layerMaker.parseLayer=function(layerData,initialLayerIDsOn){

    //Run any pre-parsers if they exist for this layer
    if (incident_support.parsers){
        layerData = incident_support.parsers.parserFunction(layerData,'layerload');
    }

    //Determine if layer should be shown or not
    if (!layerData.shown && initialLayerIDsOn && initialLayerIDsOn.length){
        layerData.shown=false;
        _.each(initialLayerIDsOn,function(ls){
            if (parseInt(ls) == parseInt(layerData.id)) layerData.shown=true;
        });
    }

    //Parse layer and functions
    var layerType = layerData.type.toLowerCase();
    if (layerHandler.layerMaker[layerType]){
        var layerObject=layerHandler.layerMaker[layerType](layerData);
        layerObject.type = layerType;
        return layerObject;
    } else {
        console.log("ERROR- Was asked to load a layer of type "+layerType+" but don't know how.");
        return {};
    }

};
layerHandler.mapServiceJSONtoLayer=function(mapServices, additionalLayers, initialLayerIDsOn){
    var mapLayerList = [];
    var mapFunctionList = [];
    var hasBaseLayerLoaded = false;

    _.each(mapServices,function(layerBeingParsed){

        // Avoid multiple basemaps.
        if (layerBeingParsed.isBaseLayer){
            if (hasBaseLayerLoaded){
                layerBeingParsed.isBaseLayer=false;
            } else {
                hasBaseLayerLoaded=true;
            }
        }

        //Returns an object of layer, type, function
        var parsedLayerPackage = layerHandler.layerMaker.parseLayer(layerBeingParsed,initialLayerIDsOn);
        var parsedLayerInfo = parsedLayerPackage.layer;
        var parsedLayerType = parsedLayerPackage.type;
        var parsedLayerFunc = parsedLayerPackage.handler;

        if (parsedLayerInfo){
            if (_.isString(parsedLayerInfo.id) || _.isNumber(parsedLayerInfo.id)){
                parsedLayerInfo.serverID = parsedLayerInfo.id;
            }
            parsedLayerInfo.type = parsedLayerType;
            mapLayerList.push(parsedLayerInfo);
        }

        if (parsedLayerFunc) {
            if (!$.browser.msie) parsedLayerFunc(); //TODO: Don't auto-run these, add a user button?
            mapFunctionList.push(parsedLayerFunc);
        }
    });

    //Add in any starter layers
    _.each(additionalLayers,function(l){
        mapLayerList.push(l);
    });

    //If no base layers yet, set the first to be so
    if (!hasBaseLayerLoaded && mapLayerList && mapLayerList.length) { mapLayerList[0].isBaseLayer=true;}

    return mapLayerList;
    //TODO: Return mapFunctionList as well as part of an object
};
//----------------------


layerHandler.layerMaker.wms=function(layerData){
    var options = {
        layers: layerData.layer,
        transparent: layerData.transparent,
        format: layerData.format,
        projection:layerData.projection,
        token:layerData.token
    };
    options = layerHandler.extendOptions(options, layerData.layerParams);

    var sourceParams = layerHandler.extendOptions({},layerData.sourceParams);
    //If multiple source servers, add these


    //TODO: If multiple source layer sites in 'filterArray', show each as a layer
    //TODO: If params allow CQL parsing multiple options, load a layer for each
    //TODO: Show these loaded layers on a GUI

    if (sourceParams && sourceParams.filterArray){
        var filters = [];
        if (_.isString(sourceParams.filterArray)){
            filters.push(sourceParams.filterArray);
        } else if (_.isArray(sourceParams.filterArray)) {
            filters = sourceParams.filterArray;
        }
        if (filters && filters.length && filters.length==0){
            filters =[''];
        }
    }


    //TODO: Fill out this code to have a multiple-array of filters
    //For each filters, add a layer
    //First layer, show on map
    //Other layers, mark this as a non-shown layer
    //build a control panel to switch between layers
    var newLayer = new OpenLayers.Layer.WMS(
        layerData.name,
        layerData.url,
        options,
        {
            wrapDateLine: true,
            opacity: layerData.opacity || 0.8,
            isBaseLayer: layerData.isBaseLayer,
            visibility:layerData.shown,
            displayInLayerSwitcher: layerData.displayInLayerSwitcher ||true,
            attribution:layerData.attribution
        }
    );

    //If the layer has a parser function in it's metadata, execute it
    if (incident_support.parsers){
        var parser = incident_support.parsers.parserFunction(layerData,'dataload',newLayer);
        if (parser) {
            if ( !_.isFunction(parser)) {
                parser = parser.parser;
            }
            parser(layerData);
        }
    }

    return {layer:newLayer,handler:null};
};
layerHandler.layerMaker.wmts=function(layerData){

    var options = {
        name: layerData.name,
        url: layerData.url,
        layer: layerData.layer,
        format: layerData.format,
        style:layerData.style || "_null",
        opacity: layerData.opacity || 1,
        isBaseLayer: layerData.isBaseLayer,
        visibility: layerData.shown
    };
    options = layerHandler.extendOptions(options, layerData.layerParams);

    var projName = options.projection || "EPSG:4326";
    options.matrixSet= projName;

    var matrixIds = new Array(26);
    for (var i = 0; i < 26; ++i) {
        matrixIds[i] = {
            identifier: projName+":" + i
        };
    }
    if (options.crs){
        //"urn:ogc:def:crs:EPSG::4326"
        for (var i=0; i < 26; ++i) {
            matrixIds[i].supportedCRS = options.crs;
        }
    }
    if (options.scaleDenominator){
        //279541132.0143589
        for (var i=0; i < 26; ++i) {
            matrixIds[i].scaleDenominator = options.scaleDenominator / Math.pow(2,i);
        }
    }
    options.matrixIds = matrixIds;

    var newLayer = new OpenLayers.Layer.WMTS(options);

    //If the layer has a parser function in it's metadata, execute it
    var handlerFunc = function(){
        setTimeout(function(){
            if (incident_support.parsers){
                var parser = incident_support.parsers.parserFunction(layerData,'dataload',newLayer);
                if (parser) {
                    if ( !_.isFunction(parser)) {
                        parser = parser.parser;
                    }
                    parser(layerData,options);
                }
            }
        },1000); //TODO: Make this time standardized
    };

    return {layer:newLayer,handler:handlerFunc};
};
layerHandler.layerMaker.arcgis93rest=function(layerData){
    var options = {
        layers: layerData.layer,
        transparent: layerData.transparent,
        projection:layerData.projection,
        format: layerData.format,
        token:layerData.token
    };
    options = layerHandler.extendOptions(options, layerData.layerParams);

    var newLayer = new OpenLayers.Layer.ArcGIS93Rest( layerData.name, layerData.url,
        options,
        {
            wrapDateLine: true,
            attribution:layerData.attribution,
            isBaseLayer: layerData.isBaseLayer
        }
    );
    newLayer.setVisibility(layerData.shown);

    return {layer:newLayer,handler:null};
};

layerHandler.layerMaker.mapbox=function(layerData){
    var newLayer = new OpenLayers.Layer.XYZ(
        layerData.name,
        ["http://a.tiles.mapbox.com/v3/"+layerData.layer+"/${z}/${x}/${y}.png",
            "http://b.tiles.mapbox.com/v3/"+layerData.layer+"/${z}/${x}/${y}.png",
            "http://c.tiles.mapbox.com/v3/"+layerData.layer+"/${z}/${x}/${y}.png",
            "http://d.tiles.mapbox.com/v3/"+layerData.layer+"/${z}/${x}/${y}.png"
        ],
        {
            attribution: "Tiles © <a href='http://mapbox.com/'>MapBox</a> | " + "Data © <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " + "& contributors",
            sphericalMercator: true,
            wrapDateLine: true,
            transitionEffect: "resize",
            buffer: 1,
            visibility: layerData.shown,
            isBaseLayer: layerData.isBaseLayer
        });
    newLayer.setVisibility(layerData.shown);
    return {layer:newLayer,handler:null};
};

//One function with 5 signatures:
layerHandler.layerMaker.gml=
layerHandler.layerMaker.geojson=
layerHandler.layerMaker.georss=
layerHandler.layerMaker.gpx=
layerHandler.layerMaker.kml=function(layerData){
    var stype = layerData.type;
    if (stype && stype.toLowerCase) stype = stype.toLowerCase();

    var style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
    style.fillOpacity = layerData.opacity || 0.9;
    style.strokeOpacity = layerData.opacity || 0.9; //TODO: Get opactiy working for KML

    var newLayer = new OpenLayers.Layer.Vector(layerData.name,
        {
            name:layerData.name,
            style:style,
            opacity: layerData.opacity || 0.9,
            visibility: layerData.shown

        },
        {
            //TODO: Attribution isn't handled for vector layers
            attribution:layerData.attribution
        }
    );

    var featureFormatter;
    if (stype == 'kml') {
        featureFormatter = new OpenLayers.Format.KML({extractStyles: true,extractAttributes: true});
    } else if (stype == 'geojson'){
        featureFormatter = new OpenLayers.Format.GeoJSON();
    } else if (stype == 'georss'){
        featureFormatter = new OpenLayers.Format.GeoRSS();
    } else if (stype == 'gpx'){
        featureFormatter = new OpenLayers.Format.GPX({extractWaypoints: true, extractRoutes: true, extractAttributes: true});
    } else if (stype == 'gml'){
        featureFormatter = new OpenLayers.Format.GML();
    }

    layerHandler.dataQueryTracker.push({name:layerData.name});

    var loadItFunction = function(){
        function getAndParseRemoteData(data){
            if (!data) {
                console.log("-Trying to parse "+stype+" data from "+layerData.name+" ("+layerData.url+"), but no data passed in.");
                return;
            }
            if (data.status && data.status=="error"){
                console.log("-Trying to parse "+layerData.name+" ("+layerData.url+"), but received an error: "+data.details);
                return;
            }

            var features;
            if (featureFormatter && featureFormatter.read) {
                features = featureFormatter.read(data);
//                if (!features) console.log("-Trying to parse "+stype+" data, but no features found by standard parser.");
            } else {
                console.log("-Trying to parse "+stype+" data, but type unrecognized");
                features = data;
            }
            var parser = incident_support.parsers.parserFunction(layerData,'dataload',features,data);
            if ( !_.isFunction(parser)) {
                parser = parser.parser;
            }
            features = parser(features,data,layerData);
            if (!features) console.log("-Trying to parse "+stype+" data, but no features found by custom parser.");

            //TODO: If data is parsed out and set to show in a table, add it to a table

            if (features && features.length){
                newLayer.removeAllFeatures();
                newLayer.addFeatures(features);
            }

            layerHandler.addFeatureTable(data,layerData);

            //TODO: Pass back a list of functions to call, not run them now
            var timeout;
            if (layerData.refreshrate) {
                if (layerData.refreshrate < 5000 && layerData.refreshrate>0) layerData.refreshrate *= 1000;
                timeout = setTimeout(loadItFunction,layerData.refreshrate);
            }

            var thisTracker = _.find(layerHandler.dataQueryTracker,function(q){return q.name==layerData.name});
            if (thisTracker) {
                thisTracker.timeout=timeout;
                thisTracker.data=data;
                thisTracker.layer=newLayer;
            }
        }

        var thisTracker = _.find(layerHandler.dataQueryTracker,function(q){return q.name==layerData.name});
        if (thisTracker) thisTracker.qFunction=getAndParseRemoteData;

        var url = event_pages.proxify(layerData.url);
        $.ajax({
            url:url,
            success:getAndParseRemoteData,
            error:function(){
                console.log('There was an error making a '+stype+' Layer request to url: '+url);}
        });

    };

    newLayer.events.register("featuresadded",newLayer,function(){
        var newFeatureCount = newLayer.features.length;
        console.log(newFeatureCount + " "+stype+" features loaded to map for layer "+ layerData.name+".");
        //TODO: Track this better, possibly do more with this count and list of features
    });

    return {layer:newLayer,handler:loadItFunction}; //NOTE: Nothing will be returned, as this is async. Should something?
};


//Not yet fully functional
layerHandler.layerMaker.tileserverxyz=function(layerData){
    var newLayer = new OpenLayers.Layer.XYZ(
        layerData.name,
        layerData.url,  //TODO: If multiple urls, use these all
        {
            attribution: layerData.attribution,
            sphericalMercator: true,
            wrapDateLine: true,
            transitionEffect: "resize",
            buffer: 1,
            visibility: layerData.shown,
            isBaseLayer: layerData.isBaseLayer
        });
    newLayer.setVisibility(layerData.shown);

    return {layer:newLayer,handler:null};
};
layerHandler.layerMaker.tileserver=function(layerData){
    //TODO: Pass in some pattern for URLs and bounding box
    function tms_getUrl(bounds){
        var res = this.map.getResolution();
        var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
        var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
        var z = this.map.getZoom();

        var path = z + "/" + x + "/" + y;
        var url = this.url;
        if (url instanceof Array) {
            url = this.selectUrl(path, url);
        }
        return url + path;
    }

    var options = {
        attribution: layerData.attribution,
        tileOrigin: new OpenLayers.LonLat(-180, -90),
        projection: new OpenLayers.Projection("EPSG:4326"),
        maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34), //TODO: This is all hardocded, needs to be pulled from vars to work
        maxResolution:156543.0339,
        getURL: tms_getUrl
    };
    var newLayer = new OpenLayers.Layer.TMS(layerData.name, layerData.url,options);
    newLayer.setVisibility(layerData.shown);

    return {layer:newLayer,handler:null};
};
layerHandler.layerMaker.tileserverjson=function(layerData){
    var newLayer;

    function initMap(layerInfo){
        newLayer = new OpenLayers.Layer.ArcGISCache(
            layerData.name,
            layerData.url, {
                layerInfo: layerInfo,
                isBaseLayer: false
            });
        newLayer.setVisibility(layerData.shown);
        var map =layerHandler.getMap();
        newLayer.type = layerData.type;

        map.addLayer(newLayer);
    }

    var jsonp = new OpenLayers.Protocol.Script();
    jsonp.createRequest(layerData.url, {
        f: 'json',
        pretty: 'true'
    }, initMap);

    return {layer:newLayer,handler:null}; //NOTE: Nothing will be returned, as this is async. Should something?
};
layerHandler.layerMaker.tileserver_testhardcoded=function(layerData){
    var newLayer;

    //TODO: Test info, clean up. Pull in from params instead?

    var layerInfo = {
        "currentVersion": 10.1,
        "serviceDescription": "Natural color 3-band 24-bit orthophotography at a map scale of 1:2400 with a 30 centimeter ground pixel resolution an area of approximately 40 square miles.  \nPurpose\nDatum/Units\nDigital orthophotography is referenced to UTM zone 14 using the North American Datum 1983 with units of measurement in meters.\n\nAerial Photography\nWas flown on May 22, 2013 between 12:00 and 1:30PM local time using an UltraCamX digital mapping camera at an altitude of 14000\u2019 AMT above mean terrain. The flight plan captured imagery of an area measuring approximately 140 square miles. \n\nProcess Description\nThe imagery was flown utilizing Airborne GPS and Inertial Measurement Unit. A photogrammetric Exterior Orientation was generated for each perspective photo center. The image frames were differentially ortho rectified using the input imagery and a USGS 1/3 arc second digital elevation model (DEM). The ortho rectified frames were then mosaiced into 1000 meter by 1000 meter tiles based on the United States National Grid system.\n\n",
        "mapName": "Layers",
        "description": "User assumes all risk related to the use of this data. FEMA provides this data \"as is\" and disclaims any and all warranties, whether express or implied, including (without limitation) any implied warranties of merchantability or fitness for a particular purpose, and there are no express or implied guarantees of accuracy of the data. In no event will FEMA or any other Federal Agency be liable to you or to any third party for any direct, indirect, incidental, consequential, special, or exemplary damages or lost profit resulting from any use or misuse of this data. ",
        "copyrightText": "",
        "supportsDynamicLayers": false,
        "layers": [
            {
                "id": 0,
                "name": "Moore_Imagery_BAE",
                "parentLayerId": -1,
                "defaultVisibility": true,
                "subLayerIds": [
                    1,
                    2,
                    3
                ],
                "minScale": 0,
                "maxScale": 0
            },
            {
                "id": 1,
                "name": "Boundary",
                "parentLayerId": 0,
                "defaultVisibility": true,
                "subLayerIds": null,
                "minScale": 0,
                "maxScale": 0
            },
            {
                "id": 2,
                "name": "Footprint",
                "parentLayerId": 0,
                "defaultVisibility": false,
                "subLayerIds": null,
                "minScale": 0,
                "maxScale": 0
            },
            {
                "id": 3,
                "name": "Image",
                "parentLayerId": 0,
                "defaultVisibility": true,
                "subLayerIds": null,
                "minScale": 0,
                "maxScale": 0
            }
        ],
        "tables": [],
        "spatialReference": {
            "wkid": 102100,
            "latestWkid": 3857
        },
        "singleFusedMapCache": true,
        "tileInfo": {
            "rows": 256,
            "cols": 256,
            "dpi": 96,
            "format": "PNG",
            "compressionQuality": 0,
            "origin": {
                "x": -2.0037508342787E7,
                "y": 2.0037508342787E7
            },
            "spatialReference": {
                "wkid": 102100,
                "latestWkid": 3857
            },
            "lods": [
                {
                    "level": 0,
                    "resolution": 156543.03392800014,
                    "scale": 5.91657527591555E8
                },
                {
                    "level": 1,
                    "resolution": 78271.51696399994,
                    "scale": 2.95828763795777E8
                },
                {
                    "level": 2,
                    "resolution": 39135.75848200009,
                    "scale": 1.47914381897889E8
                },
                {
                    "level": 3,
                    "resolution": 19567.87924099992,
                    "scale": 7.3957190948944E7
                },
                {
                    "level": 4,
                    "resolution": 9783.93962049996,
                    "scale": 3.6978595474472E7
                },
                {
                    "level": 5,
                    "resolution": 4891.96981024998,
                    "scale": 1.8489297737236E7
                },
                {
                    "level": 6,
                    "resolution": 2445.98490512499,
                    "scale": 9244648.868618
                },
                {
                    "level": 7,
                    "resolution": 1222.992452562495,
                    "scale": 4622324.434309
                },
                {
                    "level": 8,
                    "resolution": 611.4962262813797,
                    "scale": 2311162.217155
                },
                {
                    "level": 9,
                    "resolution": 305.74811314055756,
                    "scale": 1155581.108577
                },
                {
                    "level": 10,
                    "resolution": 152.87405657041106,
                    "scale": 577790.554289
                },
                {
                    "level": 11,
                    "resolution": 76.43702828507324,
                    "scale": 288895.277144
                },
                {
                    "level": 12,
                    "resolution": 38.21851414253662,
                    "scale": 144447.638572
                },
                {
                    "level": 13,
                    "resolution": 19.10925707126831,
                    "scale": 72223.819286
                },
                {
                    "level": 14,
                    "resolution": 9.554628535634155,
                    "scale": 36111.909643
                },
                {
                    "level": 15,
                    "resolution": 4.77731426794937,
                    "scale": 18055.954822
                },
                {
                    "level": 16,
                    "resolution": 2.388657133974685,
                    "scale": 9027.977411
                },
                {
                    "level": 17,
                    "resolution": 1.1943285668550503,
                    "scale": 4513.988705
                },
                {
                    "level": 18,
                    "resolution": 0.5971642835598172,
                    "scale": 2256.994353
                },
                {
                    "level": 19,
                    "resolution": 0.29858214164761665,
                    "scale": 1128.497176
                }
            ]
        },
        "initialExtent": {
            "xmin": -1.0884646704310045E7,
            "ymin": 4186108.968610452,
            "xmax": -1.0818440839380756E7,
            "ymax": 4213599.977498193,
            "spatialReference": {
                "cs": "pcs",
                "wkid": 102100
            }
        },
        "fullExtent": {
            "xmin": -1.163210632879012E7,
            "ymin": -3697.9247758661586,
            "xmax": -1.083792886144325E7,
            "ymax": 4214324.048239269,
            "spatialReference": {
                "cs": "pcs",
                "wkid": 102100
            }
        },
        "minScale": 9244648.868618,
        "maxScale": 1128.497176,
        "units": "esriMeters",
        "supportedImageFormatTypes": "PNG32,PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,BMP",
        "documentInfo": {
            "Title": "",
            "Author": "",
            "Comments": "Natural color 3-band 24-bit orthophotography at a map scale of 1:2400 with a 30 centimeter ground pixel resolution an area of approximately 40 square miles.  \nPurpose\nDatum/Units\nDigital orthophotography is referenced to UTM zone 14 using the North American Datum 1983 with units of measurement in meters.\n\nAerial Photography\nWas flown on May 22, 2013 between 12:00 and 1:30PM local time using an UltraCamX digital mapping camera at an altitude of 14000\u2019 AMT above mean terrain. The flight plan captured imagery of an area measuring approximately 140 square miles. \n\nProcess Description\nThe imagery was flown utilizing Airborne GPS and Inertial Measurement Unit. A photogrammetric Exterior Orientation was generated for each perspective photo center. The image frames were differentially ortho rectified using the input imagery and a USGS 1/3 arc second digital elevation model (DEM). The ortho rectified frames were then mosaiced into 1000 meter by 1000 meter tiles based on the United States National Grid system.\n",
            "Subject": "Cached Map Service showing",
            "Category": "",
            "AntialiasingMode": "None",
            "TextAntialiasingMode": "Force",
            "Keywords": "FEMA,Imagery,Oklahoma,Tornado"
        },
        "capabilities": "Map,Query,Data",
        "supportedQueryFormats": "JSON, AMF",
        "maxRecordCount": 1000,
        "maxImageHeight": 2048,
        "maxImageWidth": 2048
    };
    //The max extent for spherical mercator
    var maxExtent = new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);

    //Max extent from layerInfo above
    var layerMaxExtent = new OpenLayers.Bounds(
        layerInfo.fullExtent.xmin,
        layerInfo.fullExtent.ymin,
        layerInfo.fullExtent.xmax,
        layerInfo.fullExtent.ymax
    );

    var resolutions = [];
    for (var i=0; i<layerInfo.tileInfo.lods.length; i++) {
        resolutions.push(layerInfo.tileInfo.lods[i].resolution);
    }
    newLayer = new OpenLayers.Layer.ArcGISCache(layerData.name,
        layerData.url, {
            isBaseLayer: false,

            //From layerInfo above
            resolutions: resolutions,
            tileSize: new OpenLayers.Size(layerInfo.tileInfo.cols, layerInfo.tileInfo.rows),
            tileOrigin: new OpenLayers.LonLat(layerInfo.tileInfo.origin.x , layerInfo.tileInfo.origin.y),
            maxExtent: layerMaxExtent
        });

    return {layer:newLayer,handler:null}; //NOTE: Nothing will be returned, as this is async. Should something?
};
layerHandler.layerMaker.getcapabilities=function(layerData){

    ////TODO: This needs alot of work to modularize, but is a cool way of doing this extensibly!
    var options = {};
    options = layerHandler.extendOptions(options, layerData.layerParams);

    var ajaxObject= {
        url:layerData.url, //'/static/maphelpers/digital_globe_wmts.xml',
        method:'GET',
        success: function(request) {
            var doc = request.responseXML;
            if (!doc || !doc.documentElement) {
                doc = request.responseText;
            }

            var crsOptions={};
            if (options.crs) {
                crsOptions = {xy:{}};
                crsOptions.yx[options.crs] = true;
            }

            //TODO: Should there be a WMTSCapabilities//WMSCapabilities differentiator?
            var formatter = new OpenLayers.Format.WMTSCapabilities(crsOptions);
            var capabilities = formatter.read(doc);
            if (capabilities) {
                var layer = formatter.createLayer(capabilities, {
                    layer: layerData.layer,
                    matrixSet: layerData.projection || "EPSG:4326",
                    format: layerData.format || "image/png",
                    opacity: layerData.opacity || 1,
                    isBaseLayer: layerData.isBaseLayer
                });

                //If the layer has a parser function in it's metadata, execute it
                var parser = incident_support.parsers.parserFunction(layerData,'dataload',layer);
                if (parser) {
                    if ( !_.isFunction(parser)) {
                        parser = parser.parser;
                    }
                    layer = parser(layerData,options);
                }

                //TODO: This autoadds and moves it to the top layer... should return these?
                incident_support.map.addLayer(layer);
                incident_support.map.setLayerIndex(layer,0);

            }
        },
        failure: function() {
            console.log("Trouble getting capabilities doc for WMTS layer: "+layerData.layer);
            OpenLayers.Console.error.apply(OpenLayers.Console, arguments);
        }
    };

    return {layer:null,handler:function(){$.ajax(ajaxObject)}};
};

layerHandler.addFeatureTable=function(data,layerData){
    var $pluginHolder = $("#plugin_container");
    if (!$pluginHolder || !$pluginHolder.length || !layerData.show_in_table || layerData.show_in_table=="False") return;
    $pluginHolder.show();

    var listOfItems=[];
    try {
        var isXML=false;
        var dataJSON = data;
        //If it looks like KML, try to turn it into a JSON object
        if (data && (data.firstChild && data.baseURI) || (_.isString(data) && _.string.startsWith(data,"<?xml version"))) {
            dataJSON = $.xml2json(data);
            isXML = true;
        }

        //Try to guess what the root field is that contains the array to be drawn
        var layerRoot = layerData.rootField;
        if (!layerRoot) {
            if (layerData.type=="GeoRSS"){
                layerRoot = "entry";
            } else if (layerData.type=="KML" || isXML) {
                layerRoot = "Document.Folder";
            } else {
                layerRoot = "objects";
            }
        }
        if (!dataJSON[layerRoot]){
            if (layerData.type=="GeoRSS") layerRoot = "channel.item";
        }

        var fields = layerData.fieldsToShow || "";
        var fieldsToParse = [];
        if (fields && _.isString(fields)){
            fieldsToParse = fields.split(",");
            _.each(fieldsToParse,function(f,i){ fieldsToParse[i] = _.string.trim(fieldsToParse[i]) });
        }

        var rootNode = incident_support.parseFieldValHierarchical(layerRoot,dataJSON,true);
        if (!rootNode){
            if (dataJSON && dataJSON.NetworkLink && dataJSON.NetworkLink.Link && dataJSON.NetworkLink.Link.href){
                //Looks like it's a KML file with a NetworkLink in it.
                rootNode = [{name:dataJSON.NetworkLink.Link.href, id:'Redirect'}];
            }
        }
        if (rootNode){
            //TODO: If KMZ, route through a KMZ-KML translator

            _.each(rootNode,function(item){
                var newItem = {};
                if (fieldsToParse.length){

                    //Find all fields listed to show
                    _.each(fieldsToParse,function(field){
                        var pointer = incident_support.parseFieldValHierarchical(field,item);
                        if (field.indexOf(".")>0) field = _.string.strRightBack(field,".");
                        if (pointer) {
                            if (_.isString(pointer) && typeof linkify!="undefined") pointer=linkify(pointer);
                            if (_.isString(pointer)) pointer = Helpers.tryToMakeDate(pointer,field);
                            newItem[field] = pointer;
                        }
                    });
                    listOfItems.push(newItem);

                } else if (layerData.type=="KML"){
                    var title = item.name;
                    if (item.Placemark){
                        var newItem = {group:title, id:item.Placemark.id, name:item.Placemark.name, description: item.Placemark.description};
                        if (item.Placemark.Point && item.Placemark.Point.coordinates){
                            newItem.point = item.Placemark.Point.coordinates;
                        }
                        listOfItems.push(newItem);
                    } else if (item.Folder && item.Folder.Placemark && _.isArray(item.Folder.Placemark)){
                        //There are multiple sub items
                        _.each (item.Folder.Placemark, function(subitem){
                            var desc = subitem.descripiton;
                            var newItem = {group:title, id:subitem.id, name:subitem.name, description: desc};
                            listOfItems.push(newItem);
                        });
                    } else {
                        var newItem = {group:title, name:item.name, id:item.id};
                        listOfItems.push(newItem);
                    }

                } else {
                    //No fields given, so use all
                    for(var key in item) {
                        var val = item[key];
                        if (_.isString(val)){
                            if (val.toLocaleString) val = val.toLocaleString();
                            if (_.isString(val) && typeof linkify!="undefined") val=linkify(val);
                            newItem[key] = val;
                        }
                    }
                    listOfItems.push(newItem);
                }

            });

        } else {
            console.log("-Error when parsing layerData for layer "+layerData.name+" ("+layerData.url+") no existing root note specified");
        }

    } catch(ex){
        console.log("-Trying to turn layer "+layerData.name+" ("+layerData.url+") into a table - Exception parsing in addFeatureTable.");
        console.log(ex);
    }
    if (listOfItems && listOfItems.length){
        //Draw the table
        incident_support.addDataTable(listOfItems,layerData);

    }
};
incident_support.tablesDrawn={};
incident_support.addDataTable=function(data,layerData){
    var $pluginHolder = $("#plugin_container");
    $pluginHolder.show();

    if (incident_support.tablesDrawn[layerData.name]){
        //Already drawn, delete it
        var $existing = incident_support.tablesDrawn[layerData.name];
        $existing.empty();
        $existing.remove();
    }

    var $tableHolder=$("<div>")
        .appendTo($pluginHolder);
    incident_support.tablesDrawn[layerData.name] = $tableHolder;

    var $tableHolderContent = $("<div>").hide();

    var details = "<b>URL</b>: "+layerData.url +"<br/>";
    if (layerData.category) details += "<b>Category</b>: "+layerData.category +"<br/>";
    if (layerData.tags) details += "<b>Tags</b>: "+layerData.tags +"<br/>";
    if (layerData.details) details += "<b>Details</b>: "+layerData.details +"<br/>";
    if (layerData.attribution) details += "<b>Attribution</b>: "+layerData.attribution +"<br/>";

    var $table = $('<table>')
        .attr({cellpadding:0,cellspacing:0,border:0})
        .addClass("display");

    var $title = $("<h3>")
        .addClass("landing-page-header")
        .appendTo($tableHolder);
    var $icon = $("<i>")
        .addClass("icon icon-circle-arrow-down")
        .on('click',function(){
            $tableHolderContent.toggle();
            if ($icon.hasClass("icon-circle-arrow-right")){
                $icon.removeClass("icon-circle-arrow-right");
                $icon.addClass("icon-circle-arrow-down");
            } else {
                $icon.removeClass("icon-circle-arrow-down");
                $icon.addClass("icon-circle-arrow-right");
            }
//            options.oTableTools.fnResizeRequired(true);
//            options.oTableTools.fnResizeButtons();

        })
        .appendTo($title);
    $("<span>")
        .text("Layer: "+layerData.name)
        .popover({
            title:"Tabular data from Layer Feed",
            content:details,
            trigger: 'hover',
            html: 'true',
            placement: 'right'
        })
        .css({cursor:'pointer'})
        .appendTo($title);

    $tableHolderContent.appendTo($tableHolder);
    $table
        .appendTo($tableHolderContent);

    var columnInfo = [];
    var first = data[0];
    for (var key in first){
        columnInfo.push({sTitle: _.string.capitalize(key), mData:key, sDefaultContent:""})
    }

    $table.dataTable( {
        "aaData": data,
        "bJQueryUI": true,
        "sProcessing":true,
        "bScrollCollapse": (Helpers.isIOS ? false : true),
        "bScrollInfinite": (Helpers.isIOS ? false : true),
        "sScrollY": (Helpers.isIOS ? null : 200),
        "bStateSave": true,
        "aaSorting": [[0, 'asc']],
        "sDom": '<"top"if>rt<"bottom"><"clear">',
        aoColumns:columnInfo
    });

    if (settings.show_table_exports && typeof TableTools!="undefined" && settings.hasFlash){
        var oTableTools = new TableTools($table, {
            "sSwfPath": event_pages.options.root+"static/datatables.net/copy_csv_xls_pdf.swf"
        } );

        $table.before( oTableTools.dom.container );

        var headerItems = {title:"Show Exports"};
        headerItems.onclick = function(){
            oTableTools.fnResizeRequired(true);
            oTableTools.fnResizeButtons();
        };
        if (incident_support.smts_categories_exports) incident_support.smts_categories_exports.remove();
        incident_support.smts_categories_exports = Helpers.buildBootstrapDropdown("Export Data",[headerItems]);

        var $smts_header=$("#smts_header");
        $smts_header.append(incident_support.smts_categories_exports);
    }

//    console.table(data);
};
incident_support.parseFieldValHierarchical=function(field,item,dontEnterArrays){
    var pointer = item;
    var piecesOfField = field.split(".");
    _.each(piecesOfField,function(item_piece){
        if (!pointer) return;

        pointer = pointer[item_piece];
        //TODO: This only returns first if it's an array, maybe use mustache script for better parsing
        if (!dontEnterArrays && pointer && _.isArray(pointer)){pointer= _.first(pointer);}
    });
    return pointer;
};
