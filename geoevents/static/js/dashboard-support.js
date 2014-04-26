// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

//Uses jQuery, Underscore.js, and moment.js
var dashboard_support={};

dashboard_support.mapNotReady=true;
dashboard_support.options = {};
dashboard_support.defaultOptions = {
    controlsToAdd: ['layers','homezoom','recenter','print','fullscreen'],
    useImageCache: false
};
dashboard_support.initialStateFromURLHash = null;

dashboard_support.useControl=function(control){
    return _.indexOf(dashboard_support.options.controlsToAdd,control)>-1;
};
//==================================================
dashboard_support.init=function(event,options){
    dashboard_support.event = event;
    dashboard_support.event.allowClicksForInfo=true;

    if (typeof options == "undefined") options = {};
    dashboard_support.options = $.extend(dashboard_support.defaultOptions,options);

    dashboard_support.setup(); //All good
    dashboard_support.setupPageAddins(); //All good
    dashboard_support.configureMap();
    if (typeof layer_categories!='undefined') layer_categories.init();

    dashboard_support.reload_icon();
    dashboard_support.addDownloadButtons();
    dashboard_support.addDropoffFiles();

    if (events && events.length){
        dashboard_support.addEventDetails(events);
    }

    $('.navbar-search span.clear-helper').css('display','none');
};
//==================================================

dashboard_support.setup=function(){
    if (typeof console=="undefined") console = {};
    if (typeof console.log=="undefined") console.log = {};

    $(window).unload( function () {
        dashboard_support.mapNotReady=true;
    } );
    $(window).on('beforeunload', function(){
        dashboard_support.mapNotReady=true;
    });

};
dashboard_support.setupPageAddins=function(){
    var event = dashboard_support.event;

    dashboard_support.initialStateFromURLHash = $.bbq.getState();

    //Add the description class to p's injected via markdown
    /*$('.notes p:not([class])').addClass('description');

    $('#header_image')
        .attr('title',event.brandingTitle);

    var $sq = $('.search-query')
        .bind('keyup change',_.throttle(function(){
        var term = $(this).val();
        dashboard_support.products_filter(term);

        if (term && term.length) {
            $('.navbar-search span.clear-helper').css('display','inline');
        } else {
            $('.navbar-search span.clear-helper').css('display','none');
        }
    },100))
        .bind('click',function(){
            $(this).select();
        })
        .wrap('<div class="clear-holder" />');

    var helper = $('<span class="clear-helper"> Clear</span>')
        .css({cursor:'pointer'});
    $sq.parent().append(helper);
    helper.click(function(){
        $sq.val("");
        dashboard_support.products_filter("");
    });

    if (event.lastUpdated){
        var updated = Helpers.dateFromPythonDate(event.lastUpdated);
        if (updated.isValid()){
            $('#item_last_updated')
                .html('<strong>Last Updated:</strong> ' + updated.fromNow())
                .css({cursor:'pointer'})
                .popover({
                    title:'Last Updated',
                    content: "The event itself had information about it last updated by an admin on: <b>"+event.lastUpdated+"</b>",
                    trigger:'hover',
                    placement:'top'
                });
        }
    }

    */
    if ($.browser && $.browser.msie){
        //Keep Map Functions hidden
    } else {
        $('#map_functions')
            .css({display:'block'})
            .attr({title:"This function doesn't work in Internet Explorer"});
    }

    $('#map_dtg').html("Map created at: "+moment().format("YYYY-MM-DDTHH:mm:ss Z")+" (Zulu)");


    if (settings.site_active_events_title){
        $('#active_header').text(settings.site_active_events_title);
    }
    if (settings.site_title){
        var title = settings.site_title;
        if (settings.page_title_addition){
            title += settings.page_title_addition;
        }
        document.title = title;
        var pageTitle = $('.brand');
        if (pageTitle) {
            pageTitle.text(settings.site_title);
            if (settings.serverurl_title_linkto){
                pageTitle.attr('href',settings.serverurl_title_linkto);
            }
        }
    }
    if (settings.serverurl_parent_linkto){
        var devBy = 'Parent Site';
        if (settings.developer_team_name){
            devBy = 'Developed By '+settings.developer_team_name;
        }
        devBy += ' '+new Date().getFullYear();

        $('#footer_parent_linkto')
            .attr('href',settings.serverurl_parent_linkto)
            .text(devBy);

    }

    //Make dropdowns selectable on iOS
    $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) {
        e.stopPropagation();
    });


    //Reduce height when sitreps too high
    var pageWidth = parseInt($("body").css("width"));
    var $sitRepHolder = $("#sitrep_holder");
    if ((pageWidth <= 915) && $sitRepHolder) {
        $sitRepHolder.css("maxHeight","100px");
        $sitRepHolder.css("overflow","scroll");
    } else {
        $sitRepHolder.css("maxHeight","");
        $sitRepHolder.css("overflow","");
    }
};
dashboard_support.configureMap=function(){
    //TODO: If no network connection, have a static map layer and don't show any other layers

    var event = dashboard_support.event;

    var center = new OpenLayers.LonLat(event.map.center_y, event.map.center_x);
    var projection = new OpenLayers.Projection(event.map.projection);

    var mapOptions = {
        'projection':projection,
        'displayProjection': new OpenLayers.Projection("ESPG:4326"),
        'zoom' : event.map.zoom,
        'center' : center,
        'numZoomLevels': 25
    };
    var map = new OpenLayers.Map( 'map_canvas', mapOptions );

//    event.editLayer = new OpenLayers.Layer.Vector( "Editable" );

    var controls = [
        new OpenLayers.Control.ScaleLine(),
        new OpenLayers.Control.OverviewMap(),
        new OpenLayers.Control.LayerSwitcher(),
        new OpenLayers.Control.KeyboardDefaults()
//        ,new OpenLayers.Control.DrawFeature(event.editLayer, OpenLayers.Handler.Path,{title:'Draw a feature'})
    ];
    if (dashboard_support.options.useImageCache){
        controls.push(new OpenLayers.Control.CacheWrite({
            autoActivate: true,
            imageFormat: "image/png",
            eventListeners: {
                cachefull: function() {
                    console.log("Map CacheWrite Cache full.");
                }
            }
        }));
        controls.push(new OpenLayers.Control.CacheRead());
    }

    map.addControls(controls);

    map.events.register("mousemove", map, function(e) {
        var position = this.events.getMousePosition(e);
        var lonlat = map.getLonLatFromPixel(position);
        var text = "";
        if (position && lonlat && lonlat.lat && typeof maptools!="undefined" && maptools.inWorldBounds(lonlat.lat, lonlat.lon)){
            text = "Lat: " + lonlat.lat.toFixed(6) + " , Lon: "+lonlat.lon.toFixed(6);

            var ngText = '';
            if (maptools.inUSBounds(lonlat)) {
                ngText += " , USNG: "+maptools.latLongToUsng(lonlat.lat, lonlat.lon,3);
            } else {
                ngText += " , MGRS: "+maptools.latLongToMgrs(lonlat.lat, lonlat.lon,3);
            }
            if (ngText && ngText.indexOf && ngText.indexOf('NaN')>0) ngText='';
            text += ngText;
            if (map.zoom) text += ", Zoom: "+map.zoom;

        } else {
            text = "X: "+lonlat.lon+", Y: "+lonlat.lat;
        }
//TODO: work with multiple projections:
//        var ll = map.getLonLatFromPixel(event.xy).transform(new OpenLayers.Projection('EPSG:900913'), new OpenLayers.Projection('EPSG:28993'));


        $('#map_coords').html(text);
    });

    map.events.register("click", map, function(e) {
        var holderName = '#' + (layerHandler.options.layerHolderID || 'map-layer-filters');
        $(holderName).hide();
    });

    map.events.register("moveend",map,function(e){
        if (dashboard_support.mapNotReady) return;

        var mapState = {};
        mapState.zoom=map.zoom;
        mapState.lat=map.center.lat;
        mapState.lon=map.center.lon;
        $.bbq.pushState(mapState);
    });
    var addChangeStateChange = function(e){
        if (incident_support.mapNotReady) return;

        var layers=[];
        _.each(map.layers,function(l){
            if (l.visibility && _.isNumber(l.serverID) || _.isString(l.serverID)){
                layers.push(l.serverID);
            }
        });
        if (layers && layers.length) {
            var saveState = false;

            var lsState = $.bbq.getState('ls');
            if (lsState) saveState =true;

            if (incident_support.initialMapLayerState){
                //State exists, if it's been changed then save it
                saveState = (!_.isEqual(layers,incident_support.initialMapLayerState));
            } else {
                incident_support.initialMapLayerState = layers;
            }

            if (saveState) {
                //NOTE: OpenLayers dies if you using #layers=... so we use #ls= instead
                $.bbq.pushState({ls: layers.join(",")});
            } else {
                $.bbq.removeState(['ls']);
            }
        }
    };
    map.events.register("changelayer",map,addChangeStateChange);
    map.events.register("addlayer",map,addChangeStateChange);

    var initialLayerIDsOn = $.bbq.getState('ls');
    if (initialLayerIDsOn) {
        initialLayerIDsOn = initialLayerIDsOn.split(",");
    }

    //var incidentLayerInfo = dashboard_support.eventMarkerLayer(event);
    var mapLayerList = layerHandler.mapServiceJSONtoLayer(event.mapServices, null, initialLayerIDsOn);

    if (event.allowClicksForInfo) {
        map.events.register('click', map, dashboard_support.clickForMapInfo);
    }
    map.addLayers(mapLayerList);
    map.zoomToMaxExtent();

    if (dashboard_support.useControl('layers')) {
        layerHandler.addPopupControls(map,mapLayerList);
    }
    var buttonOptions;
    var mapDiv = $('.olMapViewport')[0];
    if (dashboard_support.useControl('homezoom')) {
        buttonOptions =  {
            iconTop:-20,
            iconText: 'Home',
            createOnlyIf:function(){
                return true;
            },
            clickFunction:function(){
                dashboard_support.zoomMapToInitial();
            }
        };
        layer_buttons.addButtonToMap(mapDiv,buttonOptions)
    }
    if (dashboard_support.useControl('recenter')) {
        buttonOptions =  {
            iconText: 'Recenter',
            createOnlyIf:function(){
                return true;
            },
            clickFunction:function(){
                dashboard_support.zoomMapToInitial(true);
            }
        };
        layer_buttons.addButtonToMap(mapDiv,buttonOptions)
    }
    if (dashboard_support.useControl('print')) {
        buttonOptions =  {
            iconText: 'Print',
            createOnlyIf:function(){
                return window.print;
            },
            clickFunction:function(){
                window.print();
            }
        };
        layer_buttons.addButtonToMap(mapDiv,buttonOptions)
    }
    //defines what url is called when the fullscreen button is selected and the name on the
    // button will be changed to Dashboard after being selected
    if (dashboard_support.useControl('fullscreen')) {
        buttonOptions =  {
            iconText: (event.fullScreenMap ? 'Dashboard' : 'Fullscreen'),
            createOnlyIf:function(){
                return (dashboard_support.event.fullScreenLink && dashboard_support.event.normalScreenLink);
            },
            clickFunction:function(){
                var mapSettings = document.location.hash;
                var locLink =(event.fullScreenMap ? dashboard_support.event.normalScreenLink : dashboard_support.event.fullScreenLink);
                location.href=locLink+mapSettings;
            }
        };
        layer_buttons.addButtonToMap(mapDiv,buttonOptions)
    }

    dashboard_support.addLayerHandler(map);
    dashboard_support.map = map;
    dashboard_support.zoomMapToInitial();
    dashboard_support.mapNotReady=false;
//    dashboard_support.addSelectControl();


    //Resize height of map
    if (!event.fullScreenMap){
        var mapHeight=$(window).height();
        if (mapHeight > 550) {
            mapHeight-=290;
            $('#map_canvas').parent().height(mapHeight);
            $('#map_canvas').height(mapHeight);
            $('#map_detail_holder').height(mapHeight+15)

            //TODO: Is this working in IE?
            //TODO: Should this change sitrep size as well?
            //TODO: Work on page Resize
        }
    } else {
        var pageHeight = $(window).height();
        $('#map_canvas').height(pageHeight-165);
    }


    //TODO: Maybe set this in JSON builder?
    setTimeout(function(){
        dashboard_support.map.layers[0].wrapDateLine = true;
    },1000);
};

/*dashboard_support.eventMarkerLayer=function(event){

    //TODO: eventually, have event polygons/other geometry supported
    var details="<h3>"+event.name+"</h3>"+
        "[Location] Lat:"+event.latitude + " Lon:"+event.longitude;

    var features=[];
    features.push(new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.Point(event.longitude, event.latitude),
        {title: event.name, details:details, externalGraphic:event.incidentIcon},
        {
            externalGraphic:event.incidentIcon,
            fillColor: '#ff0',
            fillOpacity: 0.8,
            graphicWidth   : 36,
            graphicHeight  : 36,
            strokeColor: "#ee9900",
            strokeOpacity: 1,
            strokeWidth: 1,
            pointRadius: 7,
            rotation:0,
            visible:event.show_event_on_map
        }
    ));


    // create the layer with listeners to create and destroy popups
    var vector = new OpenLayers.Layer.Vector("Incident", {
        visibility: event.show_event_on_map,
        eventListeners: {
            'featureselected': function(evt) {
                var feature = evt.feature;
                var popup = new OpenLayers.Popup.FramedCloud("popup",
                    OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
                    null,
                    feature.attributes.details,
                    null,
                    true);
                feature.popup = popup;
                dashboard_support.map.addPopup(popup);
            },
            'featureunselected': function(evt) {
                var feature = evt.feature;
                if (dashboard_support.map.popups && dashboard_support.map.popups.length && feature.popup){
                    dashboard_support.map.removePopup(feature.popup);
                    feature.popup.destroy();
                    feature.popup = null;
                }
            }
        }
    });
    vector.addFeatures(features);

    return vector;
};*/

dashboard_support.zoomMapToInitial=function(onlyCenter){
    var event = dashboard_support.event;

    var initialStateFromURLHash = dashboard_support.initialStateFromURLHash || $.bbq.getState() || {} ;

    var zoom = initialStateFromURLHash.zoom || event.map.zoom;
    var lat = initialStateFromURLHash.lat || event.latitude;
    var lon = initialStateFromURLHash.lon || event.longitude;

    if (lat && lon) {
        var center = new OpenLayers.LonLat(lon,lat);
        if (onlyCenter) {
            dashboard_support.map.setCenter(center);
        } else {
            dashboard_support.map.setCenter(center,zoom);
        }
    }
};
dashboard_support.addLayerHandler=function(map){
    var event = dashboard_support.event;

    var zIndex = $(".navbar").css('z-index');
    if (zIndex) zIndex = parseInt(zIndex)-1;
    var options = {
        map: map,
        div: $('.olMapViewport')[0],
        event: event,
        zIndex: zIndex
    };
    options = $.extend(event.layerHandlerOptions || {},options);

    layerHandler.addLayerSwitcherToMap(options);
};

dashboard_support.topKeywords=function(num_returned){
    var prod_list = dashboard_support.product_list;
    var event = dashboard_support.event;

    var keywords = [];
    var keywords_ignore = [];
    var keywords_return = [];
    num_returned = num_returned || 8;

    //Find the last 15 of the most used keywords, add them to an array
    var lg = _.last(_.sortBy(_.groupBy(_.flatten(_.pluck(prod_list,'keywords'))),'length'),num_returned*2);
    _.each(lg,function(wg){keywords.push(wg[0].toLowerCase())});

    //Ignore the title, and the tags already on the page (as well as tags from the data model
    var page_title = event.name || $('.page-header').text().toLowerCase();
    keywords_ignore.push(page_title);
    _.each($('span.label-info'), function(tagspan){keywords_ignore.push($(tagspan).html().toLowerCase())});
    keywords_ignore = _.union(keywords_ignore, event.keywords);

    //Remove ignored keywords or words that begin with the title (to take out thanks like "Hurricane Sandy 2012")
    keywords = _.difference(keywords,keywords_ignore);
    _.each(keywords,function(kw){
        if (kw.indexOf(page_title)==-1) {keywords_return.push(kw);}
    });
    return _.first(keywords_return,num_returned);
};

dashboard_support.addSelectControl=function(){
    var map = dashboard_support.map;

    var layersToClickOn = [];

    if (map.layers){
        _.each(map.layers,function(layer){
            if (layer.features) {
                var useLayer = false;
                var type = layer.type;
                if (_.isString(type)) type = type.toLowerCase();

                if (layer.eventListeners && layer.eventListeners.featureselected) useLayer=true;
                //Also add these, as layers might not yet have fully initialized:

                //TODO: Check instead if there is a Vector with Features?
                //TODO: Make only one hover function - currently multiple for Event and SMTS as well
                if (type=="geojson" || type=="kml" || type=="geojson" || type=="georss") useLayer=true;

                if (useLayer) layersToClickOn.push(layer);
            }

        });

        // create the select feature control
        var selector = new OpenLayers.Control.SelectFeature(layersToClickOn, {
            //hover: true,
            clickout: true,
            toggle: true,
            autoActivate: true
        });

        map.addControl(selector);
    }
};

dashboard_support.lookupLayerInfo=function(layer){
    var results;
    if (dashboard_support.event){
        if (dashboard_support.event.mapServices) {
            results = _.find(dashboard_support.event.mapServices,function(service){
                return (service.name == layer.name);
            });
        }
        if (!results && layerHandler.defaultLayerList) {
            results = _.find(layerHandler.defaultLayerList,function(service){
                return (service.name == layer.name);
            });
        }
    }
    return results || {};
};
dashboard_support.clickForMapInfo=function (e) {
    var map =dashboard_support.map;
    var layerList = _.filter(map.layers,function(l){
        var layerDetails = dashboard_support.lookupLayerInfo(l);
        return (layerDetails.enableIdentify && l.visibility && l.params && l.params.SERVICE && !l.isBaseLayer);
    });

    var lonLat = dashboard_support.map.getLonLatFromPixel(e.xy);

    _.each(layerList,function(l){
        var layerDetails = dashboard_support.lookupLayerInfo(l);

        var infoFormat = layerDetails.infoFormat || 'text/html';
        var parser = incident_support.parsers.parserFunction(layerDetails,'dataload');
        if ( !_.isFunction(parser)) {
            parser = parser.parser;
        }

        var url =  l.getFullRequestString({
            REQUEST: "GetFeatureInfo",
            EXCEPTIONS: "application/vnd.ogc.se_xml",
            BBOX: map.getExtent().toBBOX(),
            X: parseInt(e.xy.x),
            Y: parseInt(e.xy.y),
            INFO_FORMAT: infoFormat,
            FEATURE_COUNT: layerDetails.featureCount || 5,
            QUERY_LAYERS: l.params.LAYERS,
            WIDTH: map.size.w,
            HEIGHT: map.size.h});

        //url=layerHandler.proxify(url);

        _.each(dashboard_support.map.popups,function(p){
            dashboard_support.map.removePopup(p);
        });
        $.get(url, function(data){
            if (data){
                var isException = false;
                if (data.firstChild && data.firstChild.name=="ServiceExceptionReport") {
                    if (data.childNodes[1] && data.childNodes[1].textContent){
                        var ex = _.string.clean(data.childNodes[1].textContent);
                        console.log("WMS-I error ("+ l.url+"): "+ex);
                    }
                    isException = true;
                }

                if (!isException) {
                    var output = parser(data,l);
                    output = _.string.clean(output);

                    if (output && _.isString(output) && output.length > 3) {
                        var popups = dashboard_support.map.popups;
                        if (popups.length){
                            //Popups already onscreen, add content to them
                            popups[0].contentDiv.innerHTML += "<br/>"+inBody;
                            popups[0].updateSize();
                        } else {
                            var popup = new OpenLayers.Popup.FramedCloud("Feature Details",
                                lonLat,
                                new OpenLayers.Size(100,100),
                                output,
                                null, true );
                            map.addPopup(popup);
                        }
                    }
                }
            }
        })
        .error(function(xhr){
            console.log("WMS-I error trying to access: "+l.url);
        });

    });

};

dashboard_support.linkify_text=function(){
    $('.linkify').each(function(){
        var $item = $(this);
        $item.parent().children().each(function(){
            var $itemchild = $(this);
            var html = $itemchild.html();
            $itemchild.html(linkify(html));
        });
    });
};
dashboard_support.reload_icon=function(){
    (function() {
        if (settings.serverurl_favicon){
            var link = document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = settings.serverurl_favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }());
};
dashboard_support.addDownloadButtons=function(){
    var $btnHolder = $("#downloadable_button_holder");
    _.each(dashboard_support.event.mapServices,function(s){
        if (s.downloadableLink) {
            $('<a>')
                .addClass('btn btn-mini pull-right')
                .attr('href', s.downloadableLink)
                .attr('target', 'new')
                .text('Download '+ s.name)
                .appendTo($btnHolder);
        }
    });
};
dashboard_support.addDropoffFiles=function(){
    if (dashboard_support.event.files && dashboard_support.event.files.length && settings.serverurl_dropbox){
        var $div = $('#event_file_dropbox')
            .css({overflow:'scroll',maxHeight:'150px'});

        var width = parseInt(($div.width() - 8)/2);
        var widthChars = parseInt(width/7.2);

        var fileDir = dashboard_support.event.fileDir;
        if (fileDir.indexOf("/cache/ajaxplorer/files")>-1){
            fileDir = _.string.strRight(fileDir,"/cache/ajaxplorer/files");
        }

        _.each(dashboard_support.event.files,function(file){
            var fileExt = "txt";
            var possibleExt = _.string.strRight(file,".");
            if (possibleExt) {
                possibleExt = possibleExt.toLowerCase();
                if (Helpers.knownFileExt(possibleExt)) fileExt = possibleExt;
            }
            var image = event_pages.options.staticRoot + "images/fileicons/file_extension_"+fileExt+".png";

            var shortName = file;
            if (shortName.length >= widthChars) {
                shortName = shortName.substr(0,widthChars-2)+"...";
            }

            var url = settings.serverurl_dropbox + fileDir + '/'+file;

            var $divFile = $("<span>")
                .css({width:width+"px",display:'inline-block',fontSize:'9px'})
                .popover({
                    title:'File shared in Ajaxplorer Dropbox',
                    content:file,
                    trigger:'hover',
                    placement:'left'
                })
                .appendTo($div);
            var $a = $("<a>")
                .attr("href",url)
                .attr("target","_new")
                .appendTo($divFile);
            $("<img>")
                .attr("src",image)
                .css({width:'16px',height:'16px'})
                .appendTo($a);
            $("<span>")
                .text(shortName)
                .appendTo($a);
        });
    }
};

dashboard_support.addEventDetails=function(events){
    if (events && events.length){
        _.each(events,function(event){
            var $li = $('#event_'+event.id)
                .css({cursor:'hand'});

            var eventDetails = dashboard_support.html_eventDetails(event);
            $li.children().first()
                .popover({title:"<b>"+event.name+"</b>", content:eventDetails, trigger:'hover', placement:'top'});

        });
    }
};
dashboard_support.html_eventDetails=function(event){
    var html = "";

    if (event.icon) html += "<img class='pull-left' style='padding-right:3px' src='"+event.icon+"'/> ";

    var desc = event.description;
    if (desc) {
        if (desc.length >= 202) {
            desc = desc.substr(0,200)+"...";
        }
        html+="<p>"+desc+"</p><hr/>";
    }

    html += "<b>Type: </b>"+_.string.capitalize(event.type)+"<br/>";
    if (event.location) html += "Location: <b>"+_.string.capitalize(event.location)+"</b><br/>";


    var created = moment(event.created);
    if (created && created.isValid()) html+="<b>Event Created: </b>"+created.calendar()+"<br/>";

    var updated = moment(event.updated);
    if (updated && updated.isValid()) html+="Event Updated: </b>"+updated.calendar()+"<br/>";
    if (event.tags) html += "<b>Tags: </b>"+_.string.capitalize(event.tags)+"<br/>";

    return html;
};
