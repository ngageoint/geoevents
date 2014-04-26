// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

//============================
var incident_support=incident_support||{};
incident_support.parsers=incident_support.parsers||{};

//==Display settings - move to other file and build GUIs to manage========
incident_support.displaySettings = incident_support.displaySettings || {};

incident_support.displaySettings.showMilitarySymbolsOnShips=true;
incident_support.displaySettings.showFlagsOnShips=false;
incident_support.displaySettings.rotateOverlaysOnShips=true;
incident_support.displaySettings.showBearingOnShips=true;
incident_support.displaySettings.colorBearingOnShips="#52A3CC";

//==Parsers======
incident_support.parsers.parserFunction=function(layerDetails,type,features,data){
    //'Traffic-cop' function that calls proper parser functions based on rules

    type = type || 'dataload';
    var output;

    var parseFunction = 'none';
    if (layerDetails && layerDetails.layerParsingFunction) parseFunction=layerDetails.layerParsingFunction;
    var layerType = 'none';
    if (layerDetails && layerDetails.type) layerType=layerDetails.type;

    if (_.isString(parseFunction)) parseFunction = parseFunction.toLowerCase();
    if (_.isString(layerType)) layerType = layerType.toLowerCase();

    if (type == 'layerload'){
        if (parseFunction == "geomedia_triaged") {
            var lat = incident_support.event.latitude;
            var lon = incident_support.event.longitude;
            if (lat && lon) {
                layerDetails.url += '?lat='+lat+'&lon='+lon;
            }
        }

        if (layerDetails.type == "ArcGIS93Rest") {
            //Arc hack to force projection changes
            //- layer sr is not 4326
            //- and type is arcgis
            //- and it's not already specified in url?
            var map = map ||
                (typeof incident_support!="undefined"?incident_support.map:false) ||
                (typeof dashboard_support!="undefined"?dashboard_support.map:false);

            var projWords = (map&&map.projection)?map.projection.getCode().split(":"):['4326'];
            var proj = projWords[projWords.length - 1];

            var needsSRvariable = true;
            if (layerDetails.spatialReference && layerDetails.spatialReference.indexOf(proj)<0){
                needsSRvariable=false;
            }
            _.each(layerDetails.url,function(url){if (url.toLowerCase().indexOf('bboxsr') <0) needsSRvariable=false;});
            if (layerDetails.layerParams && layerDetails.layerParams.BBOXSR) {
                needsSRvariable=false;
            }

            if (needsSRvariable){
                layerDetails.layerParams = layerDetails.layerParams || {};
                layerDetails.layerParams.BBOXSR = proj;
            }

        }


        return layerDetails;
    } else if (type == 'dataload'){
        //LOADING Functions
        output = incident_support.parsers.textHtml;
        if (layerType=='kml'||layerType=='geojson'||layerType=='georss') output = incident_support.parsers.fieldFinder;
        if (parseFunction=="palanterra") output = incident_support.parsers.parsePalantera;
        if (parseFunction=="uscg_ships") output = incident_support.parsers.parseUSCGShips;
        if (features == null && layerType=='geojson') {
            if (data && data.objects) {
                output = incident_support.parsers.djangoParse;
            } else {
                output = incident_support.parsers.geoJSONAlternate;
            }
        }
        if (parseFunction=="dg_wmts_time") output = incident_support.parsers.parseDGWMTS;
        if (parseFunction=="geomedia_triaged") output = incident_support.parsers.parseGeoMedia;
        if (parseFunction=="harvester_earthquake") output = incident_support.parsers.harvesterEarthquake;
        if (parseFunction=="harvester_flood") output = incident_support.parsers.harvesterFlood; //TODO: Build this parser
        if (parseFunction=="harvester_tsunami") output = incident_support.parsers.harvesterTsunami; //TODO: Build this parser
        if (parseFunction=="harvester_volcano") output = incident_support.parsers.harvesterVolcano; //TODO: Build this parser
        if (parseFunction=="harvester_fire") output = incident_support.parsers.harvesterFire;
        if (parseFunction=="ima") output = incident_support.parsers.ima;

    } else if (type == 'popup'){
        //VIEWING Functions
        output = incident_support.parsers.attributeViewer;

        if (parseFunction=="icnet") {
            output = function(features,data){
                features = incident_support.parsers.addKMLTimeValues(features,data);
                features = incident_support.parsers.reparseICNetKML(features);
                return features;
            }
        }else if (parseFunction=="uscg_ships") {
            output = incident_support.parsers.popupViewUSCGShips;
        }else if (parseFunction=="geomedia_triaged") {
            output = incident_support.parsers.popupViewGeoMedia
           ;
        }
    }

    return output;
};

// NOTE: Looks like underscore was setup to use mustache-style string interpolation
incident_support.parsers.ima = {
    "parser": function(layerInfo, options) {
        var t = _.template('Maps at: {{ grid }}');
        var ret = "";
        _.each(layerInfo.features, function(f) {
            ret += t({grid: f.properties.mgrs_grid});
        });
        return ret;
    },
    "callback": function(popup, clickinfo) {
        $.ajax({
            url: event_pages.proxify(_.template(settings.serverurl_ima + "/getmaps?lat={{ lat }}&lng={{ lon }}", {
                lat: clickinfo.lat,
                lon: clickinfo.lon
            })),
            type: "GET"
        })
        .done(function(res) {
            var t = _.template("<div><h5># of maps at this point: {{ maps.maps.length }}</h5> \
<% _.each(maps.maps, function(m) { %> \
<p> Overlays: {{ m.layers || 'No overlays' }}<br/> \
<% if ( m.classification != 'None') { %> \
Classification: {{ m.classification }} \
<% } %> \
Created by: {{ m.created_by }}<br/> \
Created at: {{ m.created_at }}<br/> \
<a href='{{ download_url }}/{{ m.id }}'>Download original complete map book</a><br/> \
<a href='{{ download_url }}/{{ m.id }},{{ m.mgrs_location }}'>Download this single cell</a><br/> \
</p><br/> \
<% }); %>",
                {
                    download_url: settings.serverurl_ima + "/downloadPDF",
                    maps: res
                });
            $(popup.contentDiv).append(t);
            console.log(popup);
            popup.updateSize();
        });
    }
};

incident_support.parsers.parseDGWMTS=function(layerInfo,options) {
    // Adds the data/time that the layer imagery was updated to the mapinfo bar


    //To fully test WMTS layer, set up one with
    //Layer: DigitalGlobe:ImageryTileService
    //Function: dg_wmts_time
    //LayerParams:
    //{"projection": "EPSG:4326", "crs":"urn:ogc:def:crs:EPSG::4326", "scaleDenominator": 279541132.0143589, "featureUrl":"/events/proxies/wms_digl_all.jsp","featureLayer":"DigitalGlobe:ImageryFootprint"}

    var moveFunc = function(event,layerInfo) {

        function parseWMTSLoc(info){
            var jsonResults = $.xml2json(info);


            if (jsonResults){
                var feature = jsonResults.featureMember || jsonResults['gml:featureMember'];

                var bestDate, popoverText="",popoverTitle="";
                _.each(feature,function(report){
                    var image = report.ImageryFootprint || report['DigitalGlobe:ImageryFootprint'];
                    if (image){
                        var acqDate = image.acquisitionDate || image['DigitalGlobe:acquisitionDate'];
                        if (acqDate){
                            var imageDate = moment(acqDate);
                            if (imageDate.isValid()){
                                if (!bestDate) {
                                    //TODO search if newer
                                    bestDate=imageDate;
                                    var daysAgo = moment().diff(imageDate, 'days');
                                    popoverTitle = "Map from Digital Globe at centroid: "+bestDate.calendar()+" ("+daysAgo+" days ago)";
                                    var sense = image.sensorType||image['DigitalGlobe:sensorType'];
                                    var cloud = image.cloudCover||image['DigitalGlobe:cloudCover'];
                                    if (sense) popoverText ="<b>Sensor Type</b>: "+sense+"</br>";
                                    popoverText+="<b>CE90Accuracy</b>: "+(image.CE90Accuracy||image['DigitalGlobe:CE90Accuracy'])+"</br>";
                                    popoverText+="<b>RMSEAccuracy</b>: "+(image.RMSEAccuracy||image['DigitalGlobe:RMSEAccuracy'])+"</br>";
                                    if (cloud) popoverText+="<b>Cloud Cover</b>: "+cloud+"</br>";
                                    popoverText+="<b>Product Type</b>: "+(image.productType||image['DigitalGlobe:productType'])+"</br>";
                                    popoverText+="<b>Spatial Accuracy</b>: "+(image.spatialAccuracy||image['DigitalGlobe:spatialAccuracy'])+"</br>";
                                }
                            }
                        }
                    }
                });
                if (bestDate){
                    $('#map_dtg')
                        .html(popoverTitle)
                        .css({cursor:'pointer'})
                        .popover({
                            title:'Digital Globe imagery',
                            content:popoverText,
                            trigger:'hover',
                            placement:'top'
                        })
                }
            }
        }

        var map = map || incident_support.map;
        if (map.layers && map.layers.length) {
            var prox = map.layers[0];

            var infoFormat = (layerInfo&&layerInfo.infoFormat)?layerInfo.infoFormat:'application/vnd.ogc.gml';

            var url = prox.getFullRequestString({
                    REQUEST: "GetFeatureInfo",
                    EXCEPTIONS: "application/vnd.ogc.se_xml",
                    BBOX: map.getExtent().toBBOX(),
                    X: Math.round(map.size.w/2),
                    Y: Math.round(map.size.h/2),
                    INFO_FORMAT: infoFormat ,
                    LAYERS: options.featureLayer || layerInfo.layer,
                    QUERY_LAYERS: options.featureLayer || layerInfo.layer,
                    FEATURE_COUNT: 5,
                    WIDTH: map.size.w,
                    HEIGHT: map.size.h,
                    SERVICE:"WMS",
                    VERSION:"1.1.1",
                    STYLES:""
                },
                options.featureUrl || layerInfo.url);

            //url = '/proxy/'+url+'&iPlanetDirectoryPro=AQIC5wM2LY4SfcxXr8_WsPfPwXnSao0KxQi5f5Pa-lSFy9c.*AAJTSQACMDE.*';
            url = event_pages.proxify(url);
            $.ajax({
                url:url,
                success:parseWMTSLoc,
                error:function(){
                    console.log('There was an error making a WMTS Layer Feature Info request.');}
            });


        }

    };

    //TODO: Make this better load, not setTimeout!
    setTimeout(function(layerInfo){
        var map = map || incident_support.map;
        if (typeof map!='undefined' && map.events) {
            map.events.register("move", map, function() {
                var throttled = _.throttle(function(){
                    moveFunc(map,layerInfo);
                },1000);
                throttled();
            });
        }
    },4000,layerInfo);

};

incident_support.parsers.fieldFinder=function(features,data,layer){
    if (data && (data.firstChild) || (_.isString(data) && _.string.startsWith(data,"<?xml version"))) {
        var data = $.xml2json(data);

        //Can be either data.Document.Document[array].Placemark
        // or data.Document.Placemark

        var itemNum =0;
        if (data.Document && data.Document.Placemark) {
            //TODO: Replicating code below, fold into one function
            _.each(data.Document.Placemark, function(featureObj){
                var parsedPoint = features[itemNum];

                var desc = featureObj.description;
                desc = Helpers.between(desc,'<ul class="textattributes">','</ul>').trim();
                var fieldList = {};

                var fields = desc.split('<li>');
                _.each(fields,function(field){
                    var fieldName = Helpers.between(field,'<span class="atr-name">','</span>');
                    var fieldVal = Helpers.between(field,'<span class="atr-value">','</span>');
                    if (fieldName && fieldVal){
                        fieldList[fieldName] = fieldVal;
                    }
                });

                parsedPoint.attributes = _.extend(parsedPoint.attributes,fieldList)

                if (layer.fieldsToShow) {
                    parsedPoint.attributes.description = incident_support.parsers.attributeSublistViewer(parsedPoint,layer);
                }

                itemNum++;
            });

        }

        if (data.Document && data.Document.Document && data.Document.Document[0].Placemark) {
            _.each(data.Document.Document, function(docdoc){
                _.each(docdoc.Placemark, function(featureObj){
                    var parsedPoint = features[itemNum];

                    var desc = featureObj.description;
                    desc = Helpers.between(desc,'<ul class="textattributes">','</ul>');
                    if (desc && desc.length && desc.trim) {
                        desc = desc.trim();
                        var fieldList = {};

                        var fields = desc.split('<li>');
                        _.each(fields,function(field){
                            var fieldName = Helpers.between(field,'<span class="atr-name">','</span>');
                            var fieldVal = Helpers.between(field,'<span class="atr-value">','</span>');
                            if (fieldName && fieldVal){
                                fieldList[fieldName] = fieldVal;
                            }
                        });

                        parsedPoint.attributes = _.extend(parsedPoint.attributes,fieldList)

                        if (layer.fieldsToShow) {
                            parsedPoint.attributes.description = incident_support.parsers.attributeSublistViewer(parsedPoint,layer);
                        }

                        itemNum++;
                    }

                });
            });
        }

    }
    return features;
};
incident_support.parsers.passThrough=function(into){return into};
incident_support.parsers.textHtml=function(data){
    var inBody;
    if (data && data.firstChild && data.xmlVersion){
        //XML was passed in, likely accidentally
        inBody = _.string.clean($(data).text());
    } else {
        inBody = Helpers.between(data,"<body>","</body>",true);
    }
    if (inBody && inBody.length && inBody.length>0){
    } else {
        inBody = data;
    }
    //TODO: If it was a table returned, parse through it and only show the fields in .fieldsToShow

    return inBody;
};
incident_support.parsers.attributeViewer=function(feature,layerInfo){
    var content = "";
    if (!feature.attributes) {
        feature.attributes = {};
        content += feature.name || feature.title || "";
    }

    var title = feature.attributes.title || feature.attributes.name;
    if (feature.attributes.link) title= "<a href='"+ feature.attributes.link+ "'>"+title+"</a>";

    if (title) {
        if (title.length<40){
            title += "<h4>"+title+"</h4>";
        } else {
            title += "<b>"+title+"</b><br/>";
        }
        content+=title;
    }
    if (layerInfo.name){
        content+= "<b>Layer: "+layerInfo.name+"</b><br/>";
    }
    if (!layerInfo) layerInfo = {};

    var link = document.createElement("a");
    if (layerInfo.href && !layerInfo.url) layerInfo.url=layerInfo.href;
    link.href = layerInfo.url || '';
    var url = link.protocol + "//" + link.hostname + (link.port?":"+link.port:"")+"/";

    if (feature.attributes.description){
        var desc = feature.attributes.description;
        desc = desc.replace(/src="\//g,'src="'+url);
        desc = desc.replace(/src='\//g,'src='+url);
        content += desc;
    } else {
        content += incident_support.parsers.attributeSublistViewer(feature,layerInfo);
    }

    if (feature.attributes.start) {
        content+="<br><i>"+feature.attributes.start;
        var dtg = moment(feature.attributes.start);
        if (dtg.isValid()){
            content+= "<br/>Posted at: "+dtg.calendar();
        }
        content+="</i>";
    }

    if (feature.attributes.end) {
        content+="<br><i>"+feature.attributes.end;
        var dtg = moment(feature.attributes.end);
        if (dtg.isValid()){
            content+= "<br/>Show until: "+dtg.calendar();
        }
        content+="</i>";
    }

    content = content.replace(/<a /gi,"<a target='blank' ");

    if (content.search("<script") != -1) {
        // Since KML is user-generated, do naive protection against Javascript.
        content =  content.replace(/</g, "&lt;");
    }
    return content;
};
incident_support.parsers.attributeSublistViewer=function(feature,layerInfo){
    var content = "";
    var p = incident_support.parsers.contentParsifier;

    var fieldsToShow = layerInfo.fieldsToShow;
    if (_.isString(fieldsToShow) && fieldsToShow.length) {
        fieldsToShow=fieldsToShow.split(",");
        _.each(fieldsToShow,function(f){
            var key = _.string.trim(f);
            var val = feature.attributes[key];
            if (_.isNumber(val)) val=val.toString();

            if (_.isString(key) && _.isString(val) && key.length && val.length){
                content += '<b>'+ _.string.capitalize(key)+'</b>: '+p(val,key)+"<br/>";
            }
        });
    } else {
        for (var key in feature.attributes) {
            var val = feature.attributes[key];
            if (_.isNumber(val)) val=val.toString();

            if (_.isString(key) && _.isString(val) && key.length && val.length){
                content += '<b>'+key+'</b>: '+p(val,key)+"<br/>";
            }
        }
    }
    return content;
};
incident_support.parsers.contentParsifier=function(text,key){
    var kType = key.toLowerCase();
    if (kType=="url" || kType=="link" || kType=="href"){
        text = "<a href='"+text+"' target='_new'>"+text+"</a>";
    }
    if (kType=="time" || kType=="updated" ||kType=="dtg"||kType=="modified"){
        var dtg = parseInt(text);
        if (dtg) {
            dtg = moment(dtg);
            if (dtg.isValid()){
                text = "<span title='"+dtg.toString()+"'>"+ dtg.calendar() + "</span>";
            }
        }
    }
    return text;
};
incident_support.parsers.geoJSONAlternate=function(features,data,layer){
    if (!data) return features;
    var featuresAdd = features || [];

    var color = layer.styles || "orange"; //TODO - look for classes or color
    _.each(data.features,function(feature){

        if (feature.type == "Feature" && feature.geometry && feature.geometry.type == "Point") {
            var coord = feature.geometry.coordinates;
            var point = new OpenLayers.Geometry.Point(coord[1],coord[0]);
            var vector =new OpenLayers.Feature.Vector(point);

            vector.style = {
                strokeColor: color,
                strokeWidth:'1.5',
                strokeOpacity:0.7,
                fillColor: "#ff0",
                fillOpacity: 0.8,
                pointRadius: 7,
                rotation: 0,
                visible: true
            };
            vector.attributes = feature.properties;
            vector.attributes.id = feature.id;

            featuresAdd.push(vector);
        }
    });

    return featuresAdd;
};

//==GeoMedia=========
incident_support.parsers.parseGeoMedia=function(features,data,layer){
    if (!data) return features;
    var featuresAdd = features || [];
    var iconSize =10;

    var color = layer.styles || "orange"; //TODO - look for classes or color
    _.each(data.item,function(feature){
        var lat = feature.latitude;
        var lon = feature.longitude;

        var point = new OpenLayers.Geometry.Point(lon,lat);
        var vector =new OpenLayers.Feature.Vector(point);

        var vecStyle = {
            strokeColor: color,
            strokeWidth:3,
            strokeOpacity:0.7,
            fillColor: "#ff0",
            fillOpacity: 0.8,
            pointRadius: 7,
            rotation: 0,
            visible: true
        };
        var vector2;
        if (feature.url){
            var point2 = new OpenLayers.Geometry.Point(lon,lat);
            vector2 =new OpenLayers.Feature.Vector(point2);

            var vecStyle2 = {
                externalGraphic: feature.url,
                fillOpacity: 1,
                pointRadius: iconSize
            };
            vector2.style = vecStyle2;
            vector2.attributes = feature;
            vector2.attributes.id = feature.id;

            vecStyle.strokeColor = 'white';
            vecStyle.fillColor = 'black';
            if (feature.type_of_media && feature.type_of_media == "Image"){
                vecStyle.fillColor = '#4992db';
            }
            vecStyle.graphicName = 'square';
            vecStyle.pointRadius = iconSize+2;
        }
        vector.style = vecStyle;
        vector.attributes = feature;
        vector.attributes.id = feature.id;

        featuresAdd.push(vector);

        if (vector2) {
            featuresAdd.push(vector2);
        }

    });

    return featuresAdd;
};
incident_support.parsers.popupViewGeoMedia=function(feature,layerInfo){
    var atts = feature.attributes || {};
    var content = "";
    if (atts.name && parseInt(atts.name)!=atts.name) {
        //TODO: If name length too long, wrap it
        content += "<p style='font-size:1.3em'>"+atts.name+"</font><br/>";
    }
    content += "<p style='font-size:0.8em'>";
    if (atts.description) content += linkify(atts.description)+"<br/>";

    var extID = atts.external_id;
    if (extID && extID.indexOf("youtube.com")>0) {
        var youTubeID = _.last(extID.split(":"));
        youTubeID = "http://www.youtube.com/watch?v="+youTubeID;
        content += "<a href='"+youTubeID+"' target='_new'><img src='"+atts.url+"' width='300px'/></a><br/>";
    } else if (atts.url){
        content += "<a href='"+atts.url+"' target='_new'><img src='"+atts.url+"' width='300px'/></a><br/>";
    }

    var fieldsToShow = 'type_of_media,uncertainty_in_km,type,status,distance,url';
    content += incident_support.parsers.attributeSublistViewer(feature,{fieldsToShow:fieldsToShow});
    content += "</p>";

    return content;
};


//==Palantera====
incident_support.parsers.parsePalantera=function(data,layer){
    var $data = $(data);

    var layerMetadata = incident_support.lookupLayerInfo(layer);

    var layerFieldList = layerMetadata.fieldsToShow || layer.layerParams;
    layerFieldList = _.isString(layerFieldList) ? layerFieldList.split(",") : [];

    var rootNodeName = layerMetadata.rootField || "FIELDS";

    var $firstNode = $data.children().first()[0].nodeName;
    if ($firstNode=="ServiceExceptionReport"){
        return false;
    }
    var output = "";
    var $dataList= $data.children().first().children();
    $dataList.each(function(){

        if (layerFieldList.length){
            _.each(layerFieldList,function(f){
                var field = $data.find(rootNodeName).attr(f.trim());

                if (field && field.length){
                    output += "<b>"+f+"</b><br/>"+field+" <br/>";
                }
            });
        } else {
            $.each(this.attributes, function(i, attrib){
                var name = attrib.name;
                var value = attrib.value;

                if (name && name.length && value && value.length
                    && value.toLowerCase && value.toLowerCase()!="null"
                    && value !="0" && value.trim().length > 0){
                    output += "<b>"+name+"</b>: "+value+"<br/>";
                }
            });
        }
    });
    return output;
};

//==ICNet========
incident_support.parsers.reparseICNetKML=function(features){
    var featList = [];
    _.each(features,function(feature,i){
        var addThis = true;

        var iconStart = /https:\/\/icnet.c3ib.org:443\/Resources\//ig;
        var iconEnd = "/static/django-test/images/icnet/";
        feature.style.externalGraphic = feature.style.externalGraphic.replace(iconStart,iconEnd);

        var desc = feature.attributes.description;
        if (feature.attributes.styleUrl && feature.attributes.styleUrl=="#IMAGE"){
            //Likely image attachment for previous message
            var prevMessage = featList[featList.length-1];
            if (prevMessage){
                if (prevMessage.attributes.end && prevMessage.attributes.end==feature.attributes.end){
                    prevMessage.attributes.description += "<br/>" + desc;
                    addThis = false;
                }
            }
        }

        desc = desc.replace("Sender's Phone Number:","<br/>Sender's Phone Number:");
        desc = desc.replace("Immediate Needs: <br/><br/>","");
        desc = desc.replace("Immediate Needs:","<br/>Immediate Needs:");
        desc = desc.replace("<br/><br/>","<br/>");
        feature.attributes.description = desc;

        if (addThis) {
            featList.push(feature);
        }
    });
    return featList;
};
incident_support.parsers.addKMLTimeValues=function(features,xmldoc){
    //TODO: This is inefficient - O(n)^2
    $.each($(xmldoc).find("Placemark"),function(xmlItem){
        var docItem=$(this)[0];
        var docItemID = docItem.attributes[0].value;

        var item = _.filter(features,function(f){return f.fid==docItemID});
        if (item && item[0]){
            item = item[0];
            var ts = _.filter(docItem.childNodes,function(n){return n.nodeName=="TimeSpan"});

            if (ts && ts[0]) {
                ts = ts[0];
                _.each(ts.childNodes,function(n){
                    if (n.nodeName=="start") {
                        item.attributes.start = n.textContent;
                    }
                    if (n.nodeName=="end") {
                        item.attributes.end = n.textContent;
                    }
                });
            }
        }
    });

    return features;
};


//==USCGShips====
incident_support.parsers.popupViewUSCGShips=function(feature,layerInfo){
    var content = "<h3>"+feature.attributes.name + "</h3><p style='font-size:0.8em'>";

    var fieldsToShow = 'callSign,heading,type,status';
    content += incident_support.parsers.attributeSublistViewer(feature,{fieldsToShow:fieldsToShow});
    var fcc = feature.attributes.validatedFccId;
    var imo = feature.attributes.imo;
    var cgID = feature.attributes.cgID;
    var speed = feature.attributes.speed;
    var country = feature.attributes.countryCode;

    if (country && country.length) content+= "<b>Country: </b>"+country+" - "+maptools.countryFromTwoLetter(country)+"<br/>";

    if (speed) {
        speed = parseInt(speed);
        if (speed) content += "<b>Speed (knots)</b>: "+speed+" ("+parseInt(speed*1.852)+" km/hour)<br/>";
    }

    if (fcc && fcc.length && fcc!="0") content+= "[<a href='http://wireless2.fcc.gov/UlsApp/UlsSearch/license.jsp?licKey="+fcc+"' target='_new'>FCC Status</a>] ";
    if (cgID && cgID.length && cgID!="0") content+= "[<a href='http://cgmix.uscg.mil/PSIX/PSIXDetails.aspx?VesselID="+cgID+"' target='_new'>USCG Details</a>] ";
    if (imo && imo.length && imo!="0") content+= "[<a href='https://www.cdlive.lr.org/vesselstatus.asp?LRNO="+imo+"' target='_new'>Status Details</a>]";

    var dtg = moment(feature.attributes.dateTime);
    if (dtg.isValid()){
        content += "<br/>Data captured "+dtg.fromNow()+" ("+dtg.calendar()+")";
    }
    content += "</p>";

    return content;
};
incident_support.parsers.parseUSCGShips=function(features){
    var featuresAddAtFront = [];
    var featuresAddAtEnd = [];

    _.each(features,function(feature){
//        var type = feature.attributes.type;
//        var dtg = moment(feature.attributes.dateTime);
//        var length = feature.attributes.length;

        var heading = feature.attributes.heading;
        heading = parseInt(heading);
        var speed = feature.attributes.speed;
        speed = parseFloat(speed);

        var style = OpenLayers.Feature.Vector.style["default"];
        var country = feature.attributes.countryCode;
        if (incident_support.displaySettings.showMilitarySymbolsOnShips) {
            style = incident_support.parsers.militarySymbolFor(feature);
            if (incident_support.displaySettings.showFlagsOnShips && country) {
                //If Maps _AND_ Mil symbols
                country=country.toLowerCase();
                var newImg = incident_support.flagFromCountry(country);
                var newStyle = {
                    externalGraphic:newImg, graphicWidth:16, graphicHeight:11,
                    graphicXOffset:-8, graphicYOffset:9, graphicOpacity:0.7
                };

                style.rotation = heading || 0;

                var vector = feature.clone();
                vector.style = newStyle;
                vector.attributes = feature.attributes;

                featuresAddAtEnd.push(vector);
            }

        } else if (incident_support.displaySettings.showFlagsOnShips && country) {
            country=country.toLowerCase();
            var img = incident_support.flagFromCountry(country);
            style = {
                externalGraphic:img, graphicWidth:16, graphicHeight:11,
                graphicXOffset:-5, graphicYOffset:-8, graphicOpacity:0.7
            };

            style.rotation = heading || 0;
        }

        if (incident_support.displaySettings.showBearingOnShips &&
            heading && _.isNumber(heading) && speed && _.isNumber(speed)){

            var toPoint = maptools.destinationFromBearingAndDistance(feature.geometry,heading,speed/4);
            var end_point = new OpenLayers.Geometry.Point(toPoint.lon,toPoint.lat);

            var vector =new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.LineString([feature.geometry, end_point]));
            vector.style = {strokeColor: incident_support.displaySettings.colorBearingOnShips,
                strokeWidth:'1.5', strokeOpacity:0.7};
            vector.attributes = feature.attributes;

            featuresAddAtFront.push(vector);
        }
        if (style != {}) feature.style = style;
    });
    if (incident_support.displaySettings.showBearingOnShips){
        features = featuresAddAtFront.concat(features,featuresAddAtEnd);
    }

    return features;
};

//==Django and Harvester parsers=====
incident_support.parsers.djangoParse=function(features,data,layer){
    //A default parser that will catch most of the Django-created objects from harvester
    var featuresAdd = [];
    _.each(data.objects,function(feature){
        var vector = incident_support.vectorFromFeature(feature);
        featuresAdd.push(vector);
    });
    return featuresAdd;
};
incident_support.parsers.harvesterEarthquake=function(features,data,layer){
    var icon = event_pages.options.staticRoot + '/images/earthquake.png';

    var featuresAdd = [];
    _.each(data.objects,function(feature){
        var mag = parseFloat(feature.mag);
        var size = parseInt(10 + Math.pow(mag-1.5,2));

        var styleBack = {pointRadius:(size/2)};
        if (mag<3.5) styleBack.fillColor='lightgreen';
        if (mag>5.5) styleBack.fillColor='red';
        var vectorBack = incident_support.vectorFromFeature(feature,styleBack);
        featuresAdd.push(vectorBack);

        var style = {externalGraphic:icon, graphicOpacity:0.7};
        style.graphicWidth = size;
        style.graphicHeight = size;
        style.graphicXOffset= -1 * (size/2);
        style.graphicYOffset= -1 * (size/2);
        var vector = incident_support.vectorFromFeature(feature,style);
        featuresAdd.push(vector);

    });
    return featuresAdd;
};
incident_support.parsers.harvesterFire=function(features,data,layer){
    var icon = event_pages.options.staticRoot + '/images/fire.png';

    var featuresAdd = [];
    _.each(data.objects,function(feature){
        var mag = parseFloat(feature.acres);

        var size = parseInt(8 + Math.log(mag));

        var styleBack = {pointRadius:(size/2)};
        if (mag<1000) styleBack.fillColor='lightgreen';
        if (mag>50000) styleBack.fillColor='red';
        var vectorBack = incident_support.vectorFromFeature(feature,styleBack);
        featuresAdd.push(vectorBack);

        var style = {externalGraphic:icon, graphicOpacity:0.9};
        style.graphicWidth = size;
        style.graphicHeight = size;
        style.graphicXOffset= -1 * (size/2);
        style.graphicYOffset= -1 * (size/2);
        var vector = incident_support.vectorFromFeature(feature,style);
        featuresAdd.push(vector);

    });
    return featuresAdd;
};


//==Helpers======
incident_support.vectorFromFeature=function(feature,overloads){
    overloads = overloads || {};
    var lat = feature.latitude;
    var lon = feature.longitude;

    var point = new OpenLayers.Geometry.Point(lon,lat);
    var vector =new OpenLayers.Feature.Vector(point);

    var vecStyle = {
        strokeColor: 'yellow',
        strokeWidth:3,
        strokeOpacity:0.7,
        fillColor: "#ff0",
        fillOpacity: 0.8,
        pointRadius: 7,
        rotation: 0,
        visible: true
    };

    vector.style = $.extend(vecStyle,overloads);
    vector.attributes = feature;
    return vector;
};
incident_support.flagFromCountry=function(country){
    var flagurl = '/static/uscg/eads/files/'+country+'.png';
    if (document.location.hostname=='localhost'){
        flagurl = '/static/images/uscg_eads/'+country+'.png';
    }
    return flagurl;
};
incident_support.parsers.militarySymbolFor=function(feature){
    var iconLoc = incident_support.event.staticRoot + 'images/milStd2525_png/';
    var type = feature.attributes.type;
    if (type) {
        type=type.toLowerCase();
        if (_.string.startsWith(type,'vessel - towing')) {
            type='vessel - towing';
        } else if (_.string.startsWith(type,'vessel - fishing')) {
            type='vessel - fishing';
        } else if (_.string.startsWith(type,'vessel - pleasure craft')) {
            type='leisure craft';
        } else if (_.string.startsWith(type,'vessel - sailing')) {
            type='leisure craft';
        } else {
            type= _.string.trim(_.string.strLeft(type,"-"));
        }
    }

    var lookup2525b={
        'tug':'sfspxmtu',
        'vessel - towing':'sfspxmto',
        'vessel - fishing':'sfspxf',
        'leisure craft':'sfspxr',
        'cargo ship':'sfspxmc',
        'passenger ship':'sfspxmp',
        'tanker':'sfspxmo',
        'wig':'sfspxh',
        'search and rescue vessel':'sfspxl'
    };
    var iconCode = lookup2525b[type] || 'sfspxm';

    var img = iconLoc + _.string.rpad(iconCode,15,'-') + '.png';

    var heading=0;
    if (incident_support.displaySettings.rotateOverlaysOnShips
        && feature.attributes && feature.attributes.heading) {
        heading = feature.attributes.heading;
        heading = parseInt(heading);
    }

    return {
        externalGraphic:img, graphicWidth:30, graphicHeight:30, rotation:heading,
        graphicXOffset:-15, graphicYOffset:-15, graphicOpacity:0.7
    };
};
