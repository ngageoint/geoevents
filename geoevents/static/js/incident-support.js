// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

//Uses jQuery, Underscore.js, and moment.js
var incident_support={};

incident_support.keyword_titles = [];
incident_support.timeline_events = [];
incident_support.event = {};
incident_support.rfi_list= [];
incident_support.product_list= [];
incident_support.mapNotReady=true;
incident_support.popoverid=0;

incident_support.editableSettings = {
    fields:[
//        {name:'Timeline Types',obj:['incident_support','options','typesToShow'],
//            type:'multi-list', options:['RFI','Product','Event']},
        {name:'Show feature info below Map',obj:['layerHandler','options','showPopupTextBelow'],
            type:'boolean'},
        {name:'Keep features info when bubble closes',obj:['layerHandler','options','showPopupTextOnBubbleClose'],
            type:'boolean', showIf:function(){return layerHandler.options.showPopupTextBelow}},
        {name:'Show bubble when feature clicked',obj:['layerHandler','options','showPopupTextInBubble'],
            type:'boolean'},
        {name:'Show feature text as HTML',obj:['layerHandler','options','showPopupTextAsHTML'],
            type:'boolean', showIf:function(){return layerHandler.options.showPopupTextBelow}},

        {name:'Show Military Symbols on Ships',obj:['incident_support','displaySettings','showMilitarySymbolsOnShips'],
            type:'boolean'},
        {name:'Show Flags on Ships',obj:['incident_support','displaySettings','showFlagsOnShips'],
            type:'boolean'},
        {name:'Rotate Overlays on Ships',obj:['incident_support','displaySettings','rotateOverlaysOnShips'],
            type:'boolean'},
        {name:'Show Bearing on Ships',obj:['incident_support','displaySettings','showBearingOnShips'],
            type:'boolean'}

//        {name:'Color of Bearings on Ships',obj:['incident_support','displaySettings','colorBearingOnShips'],
//            type:'multi-list', options:['red','#52A3CC','blue','white']}

    ]
};

incident_support.options = {};
incident_support.defaultOptions = {
    useTimeline: true,
    controlsToAdd: ['layers','recenter','print','fullscreen'],
    useImageCache: false
};
incident_support.initialStateFromURLHash = null;
incident_support.initialMapLayerState = null;
incident_support.defaultTimelineOptions = {
    initialHeight: 350,
    growHeight: 550,
    showGroups: false,
    showTitles: true,
    showSpans: true,
    boxWidth: "100%",
    eventStyle: "dot",
    typesToShow: ['RFI','Product','Event'],
    initiallyShowAllItems: true
    //TODO: Add option to end startup span to be last product
};
incident_support.useControl=function(control){
    return _.indexOf(incident_support.options.controlsToAdd,control)>-1;
};
//==================================================
incident_support.init=function(event,options){
    incident_support.event = event;

    if (typeof options == "undefined") options = {};
    incident_support.options = $.extend(incident_support.defaultOptions,options);

    incident_support.setup();
    incident_support.setupPageAddins();
    incident_support.configureMap();
    incident_support.setupLessonsLearned();
    if (typeof incident_support.smts_holder_build!="undefined") incident_support.smts_holder_build();
    incident_support.setupNotes();
    incident_support.rfis_setup();
    incident_support.drawTimeline();
    incident_support.linkify_text();
    incident_support.reload_icon();
    incident_support.addDownloadButtons();
    incident_support.addDropoffFiles();
    incident_support.setupGeoQ();
    incident_support.setupSettings();
    incident_support.setupDeployments();
    incident_support.setupNoZoom();
    incident_support.setupOverviewMin();
    if (typeof layer_geocoder!="undefined") layer_geocoder.setupAddressLookup();

    $('.navbar-search span.clear-helper').css('display','none');


    $(document).on('click', '.popover', function(){
        incident_support.popoverid = $(this).attr('id');
        $('.popover').each(function(){
            if($(this).attr('id')!=incident_support.popoverid){ $(this).popover('hide');}
        });
    });
    $(document).keypress(function(e) {
        if(e.which == 27) {
            $('.popover').hide();
        }
    });
};
//==================================================
incident_support.setup=function(){
    if (typeof console=="undefined") console = {};
    if (typeof console.log=="undefined") console.log = {};

    $(window).unload( function () {
        incident_support.mapNotReady=true;
    } );
    $(window).on('beforeunload', function(){
        incident_support.mapNotReady=true;
    });

};

incident_support.toggleWheelZoom=function(scrollZooms){
    var controls = incident_support.map.getControlsByClass('OpenLayers.Control.Navigation');
    for(var i = 0; i < controls.length; ++i) {
        if (scrollZooms) {
            controls[i].enableZoomWheel();
        } else {
            controls[i].disableZoomWheel();
        }
    }

};
incident_support.setupNoZoom=function(){
    $("#scroll_zoom_toggle")
        .on("click press touch",function(){
            if ($(this).text()=="Scroll Zooms"){
                $(this).text("No Scroll Zoom");
                incident_support.toggleWheelZoom(false);
            } else {
                $(this).text("Scroll Zooms");
                incident_support.toggleWheelZoom(true);
            }
        })
        .parent().popover({
            title:'Toggle mousewheel scrolling',
            content:'Click to set whether map zooms when mouse wheel is scrolled',
            trigger:'hover',
            placement:'top'
        });
};

incident_support.setupSettings=function(){
    var $settingsBtn = $('#settings_button');
    if (typeof settings_manager=="undefined") {
        $('#settings_button')
            .hide();
        return false;
    }
    $settingsBtn
        .on('click', function(){
           $('#settings_content').toggle();
        });

    var $settingsList = $('#settings_content_list');
    settings_manager.addSettingsGUIToDiv(incident_support.editableSettings,$settingsList);

};
incident_support.setupDeployments=function(){
    var event = incident_support.event;
    if (event.deployments && event.deployments.length) {
        _.each(event.deployments, function(dep){
            var id = dep.pk;
            $('#deployment_data_'+id)
                .popover({
                    title:'Deployment: '+dep.fields.deployment_location,
                    content:dep.fields.description,
                    trigger:'hover',
                    placement:'bottom'
                });
            //TODO: Map deployers by dep.fields.latitude, dep.fields.longitude
        });
    }
};
incident_support.setupGeoQ=function(){
    var $holder= $('#social_links');
    if (settings.serverurl_geoq && $holder){

        var url = settings.serverurl_geoq;
        var html = '<h3 class="landing-page-header"><i class="icon icon-th-large"></i>Feature Collection</h3>';
        html+='<span style="margin: 0px 3px 0px 12px"><i class="icon icon-th"></i></span>';
        html+='<a id="social_geoque_link" href="'+url+'" target="_new">GeoQue this event</a><br/>';
        $holder.html(html);


        var $gq_holder = $('#social_geoque_link');
        var event = incident_support.event;

        if ($gq_holder && event.gqJobIDs && event.gqJobIDs.length && settings.serverurl_geoq_lookuptasks) {
            var jobs = event.gqJobIDs.split(",");

            var gqURL= settings.serverurl_geoq_lookuptasks;
            var featureTotal=0;

            _.each(jobs,function(jobID){
                var tempURL = event_pages.proxify(gqURL+jobID+"&temp");
                $.get(tempURL, function(data){
                    var gq_result = $.xml2json(data);
                    if (gq_result && gq_result.numberOfFeatures) {
                        featureTotal+=parseInt(gq_result.numberOfFeatures);
                        var pop = {
                            title:'GeoQ Features Progress',
                            placement:'left',
                            trigger:'hover',
                            content:'Features entered so far: '+featureTotal
                        };
                        $gq_holder
                            .popover(pop)
                    }
                });
            });
        }
    }
};
incident_support.setupPageAddins=function(){
    var event = incident_support.event;

    incident_support.initialStateFromURLHash = $.bbq.getState();

    //Add the description class to p's injected via markdown
    $('.notes p:not([class])').addClass('description');

    $('#header_image')
        .attr('title',event.brandingTitle);

    $('#navbar-additions').append('<form class="navbar-search pull-left">'+
        '<input type="text" class="search-query" placeholder="Search" style="width:120px">'+
        '</form>');

    $('.classification-text').css('text-align','center');

    var $sq = $('.search-query')
        .bind('keyup change',_.throttle(function(){
        var term = $(this).val();
        incident_support.products_filter(term);

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
        incident_support.products_filter("");
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

    if ($.browser && $.browser.msie){
        //Keep Map Functions hidden
    } else {
        $('#map_functions')
            .css({display:'block'})
            .attr({title:"This function doesn't work in Internet Explorer"});
    }

    $('#map_dtg').html("Map created at: "+moment().format("YYYY-MM-DDTHH:mm:ss Z")+" (Zulu)");

    var $timeContainer = $("#countdown_clock");
    if (event.closed){
        var event_closed = Helpers.dateFromPythonDate(event.closed,null);
        if (event_closed){
            $("<div>")
                .html("<b>Event closed:</b> "+event_closed.fromNow())
                .css({cursor:'pointer'})
                .popover({
                    title:"Event Closed",
                    trigger: 'hover',
                    placement: 'top',
                    content:"This event was marked closed <b>"+event_closed.calendar()+"</b>"})
                .appendTo($timeContainer);
        }
    }
    if (event.timelineItems && event.timelineItems.length){
        var eventNext, eventText;
        _.each(event.timelineItems,function(tli){
            if (tli && tli.fields) {
                var fields = tli.fields;
                var itemstart = Helpers.dateFromPythonDate(fields.start,null);
                if (itemstart && itemstart.isValid()) {
                    var dateLeft = itemstart.diff(moment());
                    if (dateLeft>0){
                        //It occurs in the future
                        if (eventNext && eventNext.diff(itemstart)<0) {
                            //Another event is first, so keep the current instead
                        } else {
                            eventNext = itemstart;
                            eventText = fields.content;
                        }
                    }
                }
            }
        });
        if (eventNext && eventNext.isValid()){
            var eventNextText = (eventText&&eventText.lentgh)?"(titled <b>"+eventText+"</b>)":"";
            $("<div>")
                .html("<span><b>Next Timeline item:</b> "+eventNext.fromNow()+"</span>")
                .css({cursor:'pointer'})
                .popover({
                    title:"Next Event",
                    trigger: 'hover',
                    placement: 'top',
                    content:"The next event "+eventNextText+" is scheduled to occur: <b>"+eventNext.calendar()+"</b>"
                })
                .appendTo($timeContainer);
        }
    }

    //Make dropdowns selectable on iOS
    $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) {
        e.stopPropagation();
    });


    if (settings.supporting_links_html) {
        $('#supporting_links').html(settings.supporting_links_html);
    }
    if (settings.site_active_events_title){
        $('#active_header').text(settings.site_active_events_title);
    }
    if (settings.social_links_html){
        $('#social_links_note').html(settings.social_links_html);
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
    if (settings.serverurl_dropbox){
        var btnHtml = '<a class="btn btn-mini" href="' + settings.serverurl_dropbox + '" target="_new">Open Secure Dropbox to share files</a>';
        $('#dropbox_button').html(btnHtml);
    }

    var pageLink = (document.location.href) ? document.location.href : "";
    var pageChat = (incident_support.event && incident_support.event.collaborationLink) ? incident_support.event.collaborationLink : "";
    var title = 'Event Page';
    if (settings.site_title){
        title = settings.site_title;
        if (settings.page_title_addition){
            title+=settings.page_title_addition;
        }
    }
    var org = 'Event Page';
    if (settings.site_active_events_title){
        org = settings.site_active_events_title;
    }
    var href = 'mailto:?subject='+title;
    href+='&body=I recommend you look at this '+org+': '+pageLink + ' .';
    if (settings.email_share_text){
        href+=settings.email_share_text;
    }
    if (pageChat) href+='You can also collaborate on this event at: '+pageChat+' .%0D %0D';

    href=href.replace(/ /g,'%20');
    $('#share_button')
        .attr('href',href)
        .popover({
            title:'Email a link to this page',
            content:'Open an email in your default mail program that has a link to this page.',
            trigger:'hover',
            placement:'left'
        });

    $('#map_coords')
        .popover({
            title:'Location of mouse on map',
            content:'Lat, Long of where the mouse pointer is in EPSG:4326 coordinates and US National Grid cells or Military Grid Reference System addresses.',
            trigger:'hover',
            placement:'right'
        });

    if (typeof layer_widgets!='undefined' && layer_widgets.init){
        layer_widgets.init();
    }

};

incident_support.configureMap=function(){
    //TODO: If no network connection, have a static map layer and don't show any other layers

    var event = incident_support.event;

    if (event.fullScreenMap) {
        var pageHeight = $(window).height();
        $('#map_canvas').height(pageHeight-100);
    }

    //Use the map's center if set, else use the incident location
    var map_center = function(){
        var latitude, longitude;
        if(event.map.center_x != 0.0 && event.map.center_y != 0.0){
            latitude = event.map.center_x;
            longitude = event.map.center_y;
        }else{
            latitude = event.latitude;
            longitude = event.longitude;
        }
        return new OpenLayers.LonLat(longitude, latitude);
    };

    var center = map_center();
    var mapOptions = {
        'projection':event.map.projection,
        'zoom' : event.map.zoom,
        'center' : center,
        'numZoomLevels': 25
    };
    var map = new OpenLayers.Map( 'map_canvas', mapOptions );

    var initialLayerIDsOn = $.bbq.getState('ls');

//    event.editLayer = new OpenLayers.Layer.Vector( "Editable" );

    var controls = [
        new OpenLayers.Control.ScaleLine(),
        new OpenLayers.Control.LayerSwitcher(),
        new OpenLayers.Control.OverviewMap()
//        new OpenLayers.Control.KeyboardDefaults()
//        ,new OpenLayers.Control.DrawFeature(event.editLayer, OpenLayers.Handler.Path,{title:'Draw a feature'})
    ];
    if (incident_support.options.useImageCache){
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
            var lat = lonlat.lat;
            var lng = lonlat.lon || 0;
            lng = maptools.correctDegree(lng);

            text = "Lat: " + lat.toFixed(6) + " , Lon: "+lng.toFixed(6);
            var ngText = '';
            var usngCoords = maptools.latLongToUsng(lat, lng, 5);
            var usngText = usngCoords.usngString;

            if (maptools.inUSBounds(lonlat)) {
                ngText += ", USNG: "+usngText;
            } else {
                ngText += ", MGRS: "+usngText;
            }
            if (ngText && ngText.indexOf && ngText.indexOf('NaN')>0) ngText='';
            text += ngText;
            if (map.zoom) text += ", Zoom: "+map.zoom;
        }
        $('#map_coords').html(text);
    });

    map.events.register("click", map, function(e) {
        var holderName = '#' + (layerHandler.options.layerHolderID || 'map-layer-filters');
        $(holderName).hide();
    });

    map.events.register("moveend",map,function(e){
        if (incident_support.mapNotReady) return;

        var mapState = {};
        mapState.zoom=map.zoom;
        mapState.lat=map.center.lat;
        mapState.lon=map.center.lon;
        $.bbq.pushState(mapState);

        incident_support.updateTriageURL();
        if (typeof layer_widgets!="undefined" && layer_widgets.updateResultWidgets){
            layer_widgets.updateResultWidgets(map);
        }

        //TODO: Add Metaproxy code back in
//        incident_support.registerMapMove(mapState);
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

    if (initialLayerIDsOn) {
        initialLayerIDsOn = initialLayerIDsOn.split(",");
    }

    var incidentLayerInfo = incident_support.eventMarkerLayer(event);
    var mapLayerList = layerHandler.mapServiceJSONtoLayer(event.mapServices, [incidentLayerInfo],initialLayerIDsOn);

    if (event.allowClicksForInfo) {
        map.events.register('click', map, incident_support.clickForMapInfo);
    }
    map.addLayers(mapLayerList);
    map.zoomToMaxExtent();

    if (incident_support.useControl('layers')) {
        layerHandler.addPopupControls(map,mapLayerList);
    }
    var buttonOptions;
    var mapDiv = $('.olMapViewport')[0];
    if (incident_support.useControl('homezoom')) {
        buttonOptions =  {
            iconTop:-20,
            iconText: 'Home',
            createOnlyIf:function(){
                return true;
            },
            clickFunction:function(){
                incident_support.zoomMapToInitial();
            }
        };
        layer_buttons.addButtonToMap(mapDiv,buttonOptions)
    }
    if (incident_support.useControl('recenter')) {
        buttonOptions =  {
            iconTop:-20,
            iconText: 'Center',
            createOnlyIf:function(){
                return true;
            },
            clickFunction:function(){
                incident_support.zoomMapToInitial(true);
            },
            popoverText: 'Move map to center on the starting location'
        };
        layer_buttons.addButtonToMap(mapDiv,buttonOptions)
    }
    if (incident_support.useControl('print')) {
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
    if (incident_support.useControl('fullscreen')) {
        buttonOptions =  {
            iconText: (event.fullScreenMap ? 'Event Page' : 'Fullscreen'),
            createOnlyIf:function(){
                return (incident_support.event.fullScreenLink && incident_support.event.normalScreenLink);
            },
            clickFunction:function(){
                var mapSettings = document.location.hash;
                var locLink =(event.fullScreenMap ? incident_support.event.normalScreenLink : incident_support.event.fullScreenLink);
                location.href=locLink+mapSettings;
            }
        };
        layer_buttons.addButtonToMap(mapDiv,buttonOptions)
    }

    incident_support.addLayerHandler(map);
    incident_support.map = map;
    incident_support.zoomMapToInitial();
    incident_support.mapNotReady=false;
    incident_support.addSelectControl();
    incident_support.updateTriageURL();

    if (typeof layer_iatools!='undefined' && layer_widgets.init){
        layer_iatools.init();
    }

    //Run the layer-widgets once with starting map bounds
    if (typeof layer_widgets!="undefined" && layer_widgets.updateResultWidgets){
        layer_widgets.updateResultWidgets(map);
    }


};
incident_support.registerMapMove=_.debounce(function(mapState){
    var url = event_pages.options.root + "/metaproxy/center/";
    url = url.replace("//","/");
    url += mapState.lat+','+mapState.lon+','+mapState.zoom;
    $.get(url)
        .success(function(result){
//            console.log(result);
        })
        .error(function(result){
            console.log("Error capturing map recentering: "+result.responseText);
        })
},5000);
incident_support.updateTriageURL=function(){
    var center = (incident_support.map&&incident_support.map.getCenter)?incident_support.map.getCenter():null;
    if (center) {
        var lat=center.lat;
        var lon=center.lon;

        //        var taglist = incident_support.keyword_titles || [];
        var taglist = [];
        taglist = taglist.concat(incident_support.event.tags);
        taglist= _.compact(taglist);
        var tags =taglist.join(",");
        var eventID = incident_support.event.id;
        var ll=incident_support.event.triageURL + '?lat='+lat+'&lon='+lon+"&tags="+tags+"&event="+eventID;
        $('#social_nw_link')
            .attr('href',ll);

        var geonode_link = settings.serverurl_geonode_link||'';
        if (geonode_link){
            $('#geonode_link')
                .attr('href',geonode_link)
        } else {
            $('#geonode_links').hide();
        }
    }

};
incident_support.eventMarkerLayer=function(event){

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
                incident_support.map.addPopup(popup);
            },
            'featureunselected': function(evt) {
                var feature = evt.feature;
                if (incident_support.map.popups && incident_support.map.popups.length && feature.popup){
                    incident_support.map.removePopup(feature.popup);
                    feature.popup.destroy();
                    feature.popup = null;
                }
            }
        }
    });
    vector.addFeatures(features);

    return vector;
};
incident_support.zoomMapToInitial=function(onlyCenter){
    var event = incident_support.event;

    var initialStateFromURLHash = incident_support.initialStateFromURLHash || $.bbq.getState() || {} ;

    var zoom = initialStateFromURLHash.zoom || event.map.zoom;
    var lat = initialStateFromURLHash.lat || event.latitude;
    var lon = initialStateFromURLHash.lon || event.longitude;

//    var zoom = event.map.zoom;
//    var lat = event.latitude;
//    var lon = event.longitude;

    if (lat && lon) {
        var center = new OpenLayers.LonLat(lon,lat);
        if (onlyCenter) {
            incident_support.map.setCenter(center);
        } else {
            incident_support.map.setCenter(center,zoom);
        }
    }
};
incident_support.addLayerHandler=function(map){
    var event = incident_support.event;

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
incident_support.setupLessonsLearned=function(event){
    if (typeof event=="undefined") event = incident_support.event;

    $('#ll').popover();
    $('#lesson-learned-form').submit(function(e){
        var inputs = $('#lesson-learned-form :input');
        inputs.attr('disabled','');

        var form = $(this);

        var values = {};
        inputs.each(function() {
            values[this.name] = $(this).val();
        });

        $.ajax({
            type: "POST",
            url: event.urlLessonsLearned,
            data: JSON.stringify(values),
            contentType: 'application/json'
        }).done(function( msg ) {
                $('#myModalMessage').remove();
                var $d = $('<div>').attr('id','myModalMessage').addClass('alert').addClass('alert-success').text('Your submission was received!');
                $('#lesson-learned-model-body').prepend($d);
                inputs.removeAttr('disabled');
            }).fail(function( msg ){
                $('#myModalMessage').remove();
                var $d = $('<div>').attr('id','myModalMessage').addClass('alert').addClass('alert-error').text('Your submission was not received due to an error.');
                $('#lesson-learned-model-body').prepend($d);
                inputs.removeAttr('disabled');
            });

        return false;
    });

    $('#lesson-learned-modal-clear').bind('click',function(n){
        $('#id_name,#id_description').val('');
    });
};
incident_support.setupNotes=function(event){
    var event = incident_support.event;

    if (event.notes){
        _.each(event.notes,function(note){
            incident_support.timeline_events.push({
                start: Helpers.dateFromPythonDate(note.posted),
                title: note.title,
                className: 'timeline-item-event',
                details: note.content,
                keywords: note,
                type: 'Note',
                group: 'notes'
            });
        });
    }

};
incident_support.topKeywords=function(num_returned){
    var prod_list = incident_support.product_list;
    var event = incident_support.event;

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

//=====SMTS=================================
incident_support.products_setupSMTS=function(data){
    var event = incident_support.event;

    function errorSMTS(){
        var $prod_holder = $("#products")
            .css({backgroundColor:'#a00'});
        $prod_holder.empty();
        $prod_holder
            .html("SMTS product list server is currently down or unreachable.<br/> Please refresh the page to try again soon!");
    }

    //TODO: Add a (show all) tag
    $('span.label-info')
        .css({cursor:'pointer'})
        .attr('title','Click to sort products by this tag.')
        .click(function(){
            var kw = $(this).html();
            $(".search-query").val(kw);
            incident_support.products_filter(kw);
        });

    if (data) {
        incident_support.products_parseFeed(data);
    } else {
        var url = event_pages.proxify(event.productFeed);
        $.ajax({
            type: "GET",
            url: url,
            dataType: "xml",
            cache:false,
            fail: errorSMTS,
            statusCode: {
                400: errorSMTS
            },
            success: incident_support.products_parseFeed
        });
    }
};
incident_support.products_parseFeed=function(xml) {
    function trimText(str){
        str = str.replace(/[^\x21-\x7E]+/g, ' '); // change non-printing chars to spaces
        return str.replace(/^\s+|\s+$/g, '');
    }

    var url_lookup_http = settings.serverurl_smts_http;
    var url_lookup_https= settings.serverurl_smts_https;
    var url_local_proxy = settings.serverurl_proxy_url;
    if (url_lookup_http || url_lookup_https) {

        $(xml).find(".supportLinks").each(function(){
            $(this).find("a").each(function(){
                var prod = $(this).attr('href');
                if (prod.indexOf(url_lookup_http)>-1 || prod.indexOf(url_lookup_https)>-1){
                    try{
                        var proxy_url = url_local_proxy;
                        if (settings.serverurl_proxy_url_dl && /chrome/.test(navigator.userAgent.toLowerCase())){
                            proxy_url = settings.serverurl_proxy_url_dl;
                        }
                        if (url_lookup_http) prod = prod.replace(url_lookup_http, proxy_url);
                        if (url_lookup_https) prod = prod.replace(url_lookup_https, proxy_url);

                        var parent_item = $(this).parent().parent().parent().parent().parent();

                        var link = parent_item.find("link").text();
                        var title = parent_item.find("title").text();
                        var desc = parent_item.find("description").text();

                        //Find the GeoRSS Point
                        var pointFind = "point";
                        if ($.browser && ($.browser.msie || $.browser.mozilla)) {
                            pointFind = "georss\\:point";
                        }
                        var point = parent_item.find(pointFind).text();

                        //Find the date, and cast it at a date object
                        var pubDate = parent_item.find("pubDate").text();
                        if (pubDate.substr(pubDate.length-1) == "Z") pubDate = pubDate.substr(0,pubDate.length-1)+"UTC";
                        var testDate = moment(pubDate);
                        if (testDate) pubDate = testDate;

                        var modDate;
                        var origDate = parent_item.find(".datePosted");
                        if (origDate && origDate[0]) {
                            var dtg = origDate[0].text || origDate[0].textContent;
                            if (dtg && dtg.length && dtg.indexOf('Date Posted:')>-1) {
                                dtg = dtg.substring(dtg.indexOf('Date Posted:')+12);
                                dtg = moment(dtg);
                                if (dtg && dtg.isValid()) {
                                    modDate = pubDate;
                                    pubDate = dtg;
                                }
                            }
                        }

                        var keywords = [];
                        $(parent_item
                            .find('div.keywords'))
                            .find('li')
                            .each(function(){
                                var keyword = $(this).text();
                                if (keyword) keywords.push( trimText(keyword).toLowerCase() );
                            });
                        title = trimText(title);
                        title = title.replace("U //FOUO","U//FOUO");

                        //Check for duplicates
                        var existingProds = _.filter(incident_support.product_list,function(p){return p.link==link;})
                        if (!existingProds || !existingProds.length) {
                            incident_support.product_list.push({
                                title:title,
                                desc:desc,
                                point:point,
                                link:link,
                                keywords:keywords,
                                href:prod,
                                modDate:modDate,
                                pubDate:pubDate
                            });
                            //TODO: These lists should be consolidated

                            var existingEvents = _.find(incident_support.timeline_events,function(p){
                                return (p.title==title && p.start==pubDate);});
                            if (!existingEvents) {
                                incident_support.timeline_events.push({
                                    start: pubDate,
                                    title: title,
                                    className: 'timeline-item-smts',
                                    details: desc,
                                    point: point,
                                    link:link,
                                    keywords: keywords,
                                    type: 'Product',
                                    group: 'SMTS'
                                });
                            }
                        }

                    } catch(ex){}
                }
            });
        });

    }
    incident_support.keyword_titles = incident_support.topKeywords(7);
    incident_support.products_drawResults();
    incident_support.products_addToMap();

    incident_support.drawTimeline();
};
incident_support.products_addToMap=function(prod_list) {
    if (typeof prod_list=="undefined") prod_list = incident_support.product_list;

    var map = incident_support.map;
    if (!map || !map.getLayersByName) {
        setTimeout(function(){incident_support.products_addToMap();},1000);
        return;
    }
    var layers = map.getLayersByName("SMTS Products");
    if (layers && layers.length){
        layers[0].removeAllFeatures();
    }

    var features = [];
    $(prod_list).each(function(){
        var item = $(this)[0];
        var point = item.point.split(" ");
        if (point && point.length) {
            var lat = point[0], lon = point[1];
            var fileType = (item.href) ? _.string.strRightBack(item.href,".") : "pdf";
            if (fileType.indexOf("?")>0) fileType = fileType.substr(0,fileType.indexOf("?"));
            fileType = fileType.toLowerCase();

            var shortDate = item.pubDate.format('MMM Do') || item.pubDate;

            var desc = item.desc || "";
            desc = _.string.clean(desc);
            desc = desc.replace(/(<([^>]+)>)/ig,"");
            desc = desc.replace(/http[s]?:[(/0-a-z.?&)]+/ig,"[link]");
            desc = _.string.truncate(desc,200);
            desc = "<div style='width:370px'>"+desc+"</div>";

            var details = "<br/><i>Posted on "+shortDate + "</i><br/>"+desc;

            var image = event_pages.options.staticRoot + "images/fileicons/file_extension_" + fileType +".png";
            features.push(new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(lon, lat),
                {title: item.title, href: item.href, externalGraphic:image, details:details},
                {
                    externalGraphic:image,
                    fillColor: '#ff0',
                    fillOpacity: 0.8,
                    strokeColor: "#ee9900",
                    strokeOpacity: 1,
                    strokeWidth: 1,
                    pointRadius: 7
                }
            ));
        }
    });

    // create the layer with listeners to create and destroy popups
    var vector = new OpenLayers.Layer.Vector("SMTS Products", {
        eventListeners: {
            'featureselected': function(evt) {
                var feature = evt.feature;
                var content = "<div style='font-size:.8em'><a href='" + feature.attributes.href + "' target='_blank'>"
                    + feature.attributes.title + "</a>"
                    + feature.attributes.details +"</div>";

                if (layerHandler.onFeatureSelect) {
                    layerHandler.onFeatureSelect(evt,content);
                } else {
                    var popup = new OpenLayers.Popup.FramedCloud("popup",
                        OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
                        null,
                        content,
                        null,
                        true);
                    feature.popup = popup;
                    map.addPopup(popup);
                }
            },
            'featureunselected': layerHandler.onFeatureUnselect || function(evt) {
                var feature = evt.feature;
                if (incident_support.map.popups && incident_support.map.popups.length && feature.popup){
                    map.removePopup(feature.popup);
                    feature.popup.destroy();
                    feature.popup = null;
                }
            }
        }
    });
    vector.addFeatures(features);

    if (layers && layers.length) {
        map.removeLayer(layers[0]);
    }
    map.addLayers([vector]);

    incident_support.addSelectControl();
};
incident_support.addSelectControl=function(){
    var map = incident_support.map;

    var layersToClickOn = [];
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

};
incident_support.products_drawResults=function(prod_list){
    if (typeof prod_list=="undefined") prod_list = incident_support.product_list;

    var prod_holder = $("#products")
        .css({maxHeight:'318px','overflow-y':'auto','overflow-x':'hidden', margin:'2px'});

    prod_holder.empty();
    $('#product .header-subtext').empty();

    var kw_holder = $('<div>')
        .html("Common Tags: ")
        .attr('id','keyword-holder')
        .css({fontWeight:'bold',overflow:'hidden'})
        .appendTo($('#product .header-subtext'));

    if (_.isArray(incident_support.keyword_titles) && incident_support.keyword_titles.length) {
        $(incident_support.keyword_titles).each(function(){
            var kw = $(this)[0];
            $('<span>')
                .addClass('label')
                .addClass('label-info')
                .text(kw)
                .css({margin:'2px',cursor:'pointer'})
                .click(function(){
                    $(".search-query").val(kw);
                    incident_support.products_filter(kw);
                })
                .appendTo(kw_holder);
        });
        // $("<br>").appendTo(prod_holder);
    }
    var items_found=0;
    $(prod_list).each(function(){
        var item = $(this)[0];

        var shortDate = item.pubDate.format('MMM Do') || item.pubDate;
        var $editLink = $('<a>')
            .attr({href:item.link,target:'_blank'})
            .popover({
                content: 'Login to SMTS to edit this product',
                title: 'SMTS Login required'
            });

        $('<img>')
            .attr('src',event_pages.options.staticRoot + 'images/icon_arrow.png')
            .css({width:'12px',height:'12px'})
            .appendTo($editLink);

        var $pubDate = $('<span>')
            .addClass('label')
            .addClass('label-info')
            .text(shortDate)
            .css({fontSize:'.9em',margin:'2px',cursor:'pointer'})
            .click(function(){
                $(".search-query").val(shortDate);
                incident_support.products_filter(shortDate);
            });

        var title = item.keywords.join(", ");
        if (item.modDate) {
            title = "Updated: "+item.modDate.format("MMM Do YYYY") + " - " + title;
        }

        var $title = $('<a>')
            .attr({href:item.href, title:title})
            .css({whiteSpace:'nowrap'})
            .text(item.title)
            .attr('target', '_blank');

        var $dl = $('<div>')
            .css({whiteSpace:'nowrap'})
            .addClass('description');

        $dl.append($editLink);
        $dl.append($pubDate);
        $dl.append($title);
        prod_holder.append($dl);

        items_found++;
    });
    if (items_found==0){
        if (incident_support.product_list && incident_support.product_list.length) {
            $('<span>')
                .html("<b>No products match your search term</b>")
                .appendTo(prod_holder);
        } else {
            $('<span>')
                .html("<b>No products returned from server</b>")
                .appendTo(prod_holder);
        }
    }
};
incident_support.products_filter=function(substring) {
    var products_sublist = [];
    var search_text = substring.toLowerCase() || "";

    $(incident_support.product_list).each(function(){
        var item = $(this)[0];
        if (item.title.toLowerCase().indexOf(search_text)>-1 ||
            item.pubDate.format("MMM Do YY").toLowerCase().indexOf(search_text)>-1 ||
            item.keywords.join(" ").toLowerCase().indexOf(search_text)>-1 ) {
            products_sublist.push(item);
        }
    });
    if (incident_support.products_searching!="new_method"){
        incident_support.products_drawResults(products_sublist);
    }
    incident_support.products_addToMap(products_sublist);

    var rfis_sublist = [];
    $(incident_support.rfi_list).each(function(){
        var item = $(this)[0];
        if (item.title.toLowerCase().indexOf(search_text)>-1 ||
            moment(item.createdAt).format("MMM Do YY").toLowerCase().indexOf(search_text)>-1 ||
            item.status.toLowerCase().indexOf(search_text)>-1 ) {
            rfis_sublist.push(item);
        }
    });
    incident_support.rfis_drawResults(rfis_sublist);

    incident_support.drawTimeline();
};
//=====SMTS=================================


//=====RFI==================================
incident_support.rfis_setup=function(){
    if (!_.string.endsWith(incident_support.event.rfiFeed,'None')) {
        $.getJSON(incident_support.event.rfiFeed, function(rfiList){
            incident_support.rfi_list = rfiList;
            incident_support.rfis_drawResults();
        });
    }
};
incident_support.rfis_drawResults=function(data){
    function statusToLabel(status){
        var colorType = "";
        var iconType = "icon-cog";
        if (status=="Not Verified"){
            colorType = "btn-danger";
            iconType = "icon-off";
        }else if (status=="In progress"){
            colorType = "btn-primary";
            iconType = "icon-bolt";
        }else if (status=="Completed"){
            colorType = "btn-success";
            iconType = "icon-ok";
        }
        return'<span class="btn btn-mini '+colorType+'" title="'+status+'"><i class="'+iconType+'"></i></span>';
    }

    var event = incident_support.event;
    if (typeof data=="undefined") data = incident_support.rfi_list;

    var $rfitag = $('#'+event.rfisID);
    $rfitag.empty();

    var itemCount = 0;
    var rfiCount = {};
    _.each(event.rfiCatsToCount,function(status){
        rfiCount[status]=0;
    });

    var linkifyOptions = {
        callback: function(text, href){
            if (href){
                var url_smts_1 = settings.serverurl_proxy_url;
                var url_smts_2= settings.serverurl_proxy_url_dl;

                if(url_smts_1) text = text.replace(url_smts_1, '');
                if(url_smts_2) text = text.replace(url_smts_2, '');
                text = text.substr(0,30);
            }
            return href ? '<a href="' + href + '" title="' + href + '" target="_blank">' + text + '</a>' : text;
        }
    };

    //Filter to only show rfis for this event. We need to make this work more reliably
    var rfiID = _.string.strRightBack(event.rfiFeed,"=");
    if (rfiID) rfiID = parseInt(rfiID);
    data = _.filter(data,function(rfi){return rfi.event.id==rfiID});

    $.each(data.reverse(), function(datarfi) {
        var rfi = data[datarfi];

        var title = "<span style='font-size:0.8em'><b>ORG:</b> " + rfi.organization;
        if (rfi.instructions) {
            title += "<br/><b>INSTRUCTION:</b> ";
            if (rfi.instructions.length > 179){
                title += "<div style='max-height:110px;overflow-y:auto;background-color: #eee'>";
                title += linkify(rfi.instructions,linkifyOptions);
                title += "</div>";
            }
        } else {
            title += "<br/>";
        }
        if (rfi.assignedTo) title += "<b>ASSIGNED:</b> " + linkify(rfi.assignedTo);
        if (rfi.requestor) {
            title += "<br/><b>REQUESTOR:</b> ";
            if (rfi.emailAddress) {
                title +=  "<a href='mailto:"+rfi.emailAddress+"'>"+rfi.requestor+"</a>";
            } else {
                title += linkify(rfi.requestor);
            }
        }
        if (rfi.comments && rfi.comments.length) {
            _.each(rfi.comments,function(a){
                title += "<div class='rfiContent'>";
                title += "<b>COMMENT: </b>";
                title += linkify(a.text,linkifyOptions)+" <i>("+a.createdBy+")</i>";
                title += "</div>";
            });
        } else {
            title += "<br/>";
        }

        title += "<b><a href='/rfi_gen/rfi/comment/"+rfi.id+"?full=true' target='_blank'>Add an RFI comment</a></b>";
        title += "<br/><b><a href='/rfi_gen/rfi/edit/"+rfi.id+"?full=true' target='_blank'>Edit this RFI</a></b>";
        title += "</span>";

        var stat = statusToLabel(rfi['status']);
        rfiCount[rfi['status']]++;
        var stat_t = rfi.title || "";
        var stat_s = rfi.status || "";

        $("<div>")
            .html(stat+' '+stat_t)
            .popover({
                title: 'Status: '+stat_s,
                content: title,
                trigger: 'manual',
                html: 'true',
                placement: 'top',
                template: '<div class="popover" onmouseover="clearTimeout(timeoutObj);$(this).mouseleave(function() {$(this).hide();});"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
            }).mouseenter(function(e) {
                $(this).popover('show');
            }).mouseleave(function(e) {
                var ref = $(this);
                timeoutObj = setTimeout(function(){
                    ref.popover('hide');
                }, 50);
            })
            .appendTo($rfitag);

        itemCount++;

        var existingEvents = _.find(incident_support.timeline_events,function(p){
            return (p.title==rfi.title && p.createdAt==rfi.createdAt) ;});

        if (!existingEvents) {
            incident_support.timeline_events.push({
                start: moment(rfi.createdAt),
                end: moment(rfi.dateRequired),
                createdAt: rfi.createdAt,
                title: rfi.title,
                details: rfi.instructions,
                link: "/rfi_gen/rfi/edit/"+rfi.id+"?full=true",
                type: 'RFI',
                point: rfi.point,
                className: 'timeline-item-rfi',
                status: rfi.status,
                group: 'RFIs'
            });
        }
    });

    $("#rfis div:even").css("background-color", "#eee");

    var $subtext = $('#'+event.rfiSubtextID);

    if (itemCount) {
        $subtext
            .empty()
            .css({fontWeight:'bold'});

        _.each(event.rfiCatsToCount,function(status){
            if (rfiCount[status]) {
                $('<nobr>'+statusToLabel(status)+' '+rfiCount[status]+' '+status.toLowerCase()+'. </nobr> ')
                    .addClass('pull-right')
                    .css({'cursor':'pointer', 'padding':'2px'})
                    .appendTo($subtext)
                    .click(function(){
                        //var kw = $(this).text();
                        $(".search-query").val(status);
                        incident_support.products_filter(status);
                    });
            }
        });
        $('<hr>')
            .css({clear:'both',margin:'5px 5px 5px 5px'})
            .appendTo($subtext);


    } else {
        if (incident_support.rfi_list && incident_support.rfi_list.length){
            $subtext
                .html('No RFIs match your search term');
        } else {
            $subtext
                .html('No RFIs returned from server');
        }
    }

    incident_support.drawTimeline();
};
//=====RFI==================================




incident_support.drawTimeline=function(options){
    if (!incident_support.options.useTimeline){
        return false;
    }

    var event = incident_support.event;

    var tlOptions = $.extend(incident_support.defaultTimelineOptions,options);
    var search_string="";
    if ($('.search-query').val()){
        search_string = $('.search-query').val().toLowerCase();
    }

    var startDate = Helpers.dateFromPythonDate(event.created,moment());
    var endDate = Helpers.dateFromPythonDate(event.closed);

    var $sizebox = $('#timeline_size_change');
    var height = ($sizebox.text() == 'Increase Height') ? tlOptions.initialHeight : tlOptions.growHeight;
    $sizebox
        .unbind('click');
    $sizebox
        .bind('click',function(ev){
            var $this = $(this);
            if ($this.text() == 'Increase Height') {
                $this.text('Reduce Height');
            } else {
                $this.text('Increase Height');
            }
            incident_support.drawTimeline();
        });

    // Ajax for Add new timeline item button
    $('#timeline-item-form').unbind('submit').bind('submit',function(e){
        var inputs = $('#timeline-item-form :input');
        inputs.attr('disabled','');

        var form = $(this);

        var values = {};
        inputs.each(function() {
            values[this.name] = $(this).val();
        });

        //populate the content_object with the resource uri of the event
        values['content_object'] = event.urlEvent;

        $.ajax({
            type: "POST",
            url: event.urlAddTimeLineItem,
            data: JSON.stringify(values),
            contentType: 'application/json'
        }).done(function( msg ) {
                $('#myModalMessage').remove();
                var $d = $('<div>').attr('id','myModalMessage').addClass('alert').addClass('alert-success').text('Your submission was received!');
                $('#timeline-modal-body').prepend($d);
                inputs.removeAttr('disabled');
            }).fail(function( msg ){
                $('#myModalMessage').remove();
                var $d = $('<div>').attr('id','myModalMessage').addClass('alert').addClass('alert-error').text('Your submission was not received due to an error.');
                $('#timeline-modal-body').prepend($d);
                inputs.removeAttr('disabled');
            });

        return false;
    });

    $('#lesson-learned-modal-clear').bind('click',function(n){
        $('#id_name,#id_description').val('');
    });

    // Instantiate our timeline object.
    var timelineDiv = document.getElementById(event.timelineID);
    if (!timelineDiv) {
        incident_support.options.useTimeline=false;
        return;
    }
    var timeline = new links.Timeline(timelineDiv);

    var data = [];

    _.each(incident_support.timeline_events,function(item){
        var goodToAdd = true;
        if (search_string) {
            goodToAdd = false;
            if (moment(item.start).format("MMM Do YY").indexOf(search_string)>-1) {
                goodToAdd=true;
            }
            if (item.title && item.title.toLowerCase) {
                if (item.title.toLowerCase().indexOf(search_string)>-1) goodToAdd=true;
            }
            if (item.keywords && item.keywords.join) {
                var kw = item.keywords.join(" ");
                kw = kw.toLowerCase();
                if (kw.indexOf(search_string)>-1) goodToAdd=true;
            }
            if (item.status && item.status.toLowerCase){
                if (item.status.toLowerCase().indexOf(search_string)>-1) goodToAdd=true;
            }
        }

        if (goodToAdd){
            var title = item.type + ' : ' + item.title;
            if (item.link) {title = "<a href='"+item.link+"' target='_new'>"+title+"</a>";}

            var content = "";
            if (item.details) {content += "<div class='rfiContent'>"+linkify(item.details)+"</div>";}
            content+="<div class='smallDateType'>"+item.start.toDate()+"<br/>"+item.start.fromNow()+"</div>";

            var tlItem = {
                start: item.start,
                className: item.className,
                popover: {
                    title:title,
                    content:content,
                    placement:'top'
                },
                click:function(e){
                    $('.popover').hide();
                    $(this).popover('show');
                }
            };

            if (tlOptions.showGroups && item.group) tlItem.group = item.group;
            if (tlOptions.showSpans && item.end) tlItem.end = item.end;

            if (tlOptions.showTitles) {
                tlItem.content = "<b>"+item.type+"</b>: "+item.title;
            } else {
                tlItem.content = item.type;
            }

            data.push(tlItem);
        }
    });

    if (data.length < 8) height=160;
    if (data.length < 15) height=240;

    //Find the earliest+latest date that items are listed in
    if (!endDate) endDate = startDate;
    if (tlOptions.initiallyShowAllItems) {
        _.each(data,function(item){
            if (item.start.unix() < startDate.unix()) {
                startDate = item.start;
            }

            var itemEnd = item.end || item.start;
            if (itemEnd.unix() > endDate.unix()) {
                endDate = itemEnd;
            }
        });
    }

    var preStartDate = moment(startDate).subtract('days',2);
    var postEndDate = moment(endDate).add('days',2);
    var options = {
        "width":  tlOptions.boxWidth,
        "height": height+"px",
        "style": tlOptions.eventStyle,
        "start": preStartDate,
        "end": postEndDate
    };

    data.push({
        'start': startDate.toDate(),
        'className': 'timeline-item-eventinfo',
        'content': 'Event Created'//<br><img src='+event.incidentIcon+' width=18 height=18/>'
    });

    if (event.closed!="None") {
        data.push({
            'start': endDate.toDate(),
            'className': 'timeline-item-eventinfo',
            'content': 'Event Closed<br><img src="'+event.incidentIcon+'" width=18 height=18/>'
        });
    }

    //Add all items that were added to this event
    _.each(event.timelineItems,function(tli){
        var item = {};
        if (tli && tli.fields) {
            var fields = tli.fields;

            item.start = Helpers.dateFromPythonDate(fields.start).toDate();
            if (fields.end && fields.end!="None") item.end = Helpers.dateFromPythonDate(fields.end).toDate();
            if (fields.group) item.group = fields.group;
            item.content = fields.content;
            item.className = 'timeline-item-eventinfo';

            data.push(item);
        }
    });

//    links.events.addListener(timeline,'select',function(){
//        var sel = timeline.getSelection();
//        if (sel.length) {
//            console.log(sel[0].row);
//        }
//
//    });

    // Draw our timeline with the created data and options
    timeline.draw(data, options);
};
incident_support.lookupLayerInfo=function(layer){
    var results;
    if (incident_support.event.mapServices) {
        results = _.find(incident_support.event.mapServices,function(service){
            return (service.name == layer.name);
        });
    }
    if (!results && layerHandler.defaultLayerList) {
        results = _.find(layerHandler.defaultLayerList,function(service){
            return (service.name == layer.name);
        });
    }
    return results || {};
};

incident_support.clickForMapInfo=function (e) {
    var map =incident_support.map;
    var layerList = _.filter(map.layers,function(l){
        var layerDetails = incident_support.lookupLayerInfo(l);
        return (layerDetails.enableIdentify && l.visibility && l.params && l.params.SERVICE && !l.isBaseLayer);
    });

    var lonLat = incident_support.map.getLonLatFromPixel(e.xy);

    _.each(layerList,function(l){
        var layerDetails = incident_support.lookupLayerInfo(l);

        var infoFormat = layerDetails.infoFormat || 'text/html';
        var parser = incident_support.parsers.parserFunction(layerDetails,'dataload');
        var callback = null;
        console.log(parser);
        if ( !_.isFunction(parser)) {
            callback = parser.callback;
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
            TOKEN: layerDetails.token,
            WIDTH: map.size.w,
            HEIGHT: map.size.h});
        //TODO: Get this working fully with Palanterra ArcGIS layers

        url = event_pages.proxify(url);

        _.each(incident_support.map.popups,function(p){
            incident_support.map.removePopup(p);
        });
        $.get(url, function(data) {
            if (data) {
                var isException = false;
                if (data.firstChild && data.firstChild.name=="ServiceExceptionReport") {
                    if (data.childNodes[1] && data.childNodes[1].textContent){
                        var ex = _.string.clean(data.childNodes[1].textContent);
                        console.log("WMS-I error ("+ l.url+"): "+ex);
                    }
                    isException = true;
                }

                if (!isException) {
                    var output = parser(data, l);
                    output = _.string.clean(output);

                    if (output && _.isString(output) && output.length > 3) {
                        if(typeof layerHandler != 'undefined' && layerHandler.options.showPopupTextInBubble) {
                            var popups = incident_support.map.popups;
                            var $out = $("<div/>").append(output);
                            if (popups.length){
                                //Popups already onscreen, add content to them
                                $(popups[0].contentDiv).append($out);
                                popups[0].updateSize();
                                if ( callback) {
                                    callback(popups[0], lonLat);
                                }
                            } else {
                                var popup = new OpenLayers.Popup.FramedCloud("Feature Details",
                                    lonLat,
                                    new OpenLayers.Size(100,100),
                                    $out.html(),
                                    null, true );
                                map.addPopup(popup);
                                if ( callback) {
                                    callback(popup, lonLat);
                                }
                            }
                        }
                        var $selectedInfo = $('#selected_feature_info');
                        if ($selectedInfo && layerHandler.options.showPopupTextBelow){

                            if (!layerHandler.options.showPopupTextAsHTML){
                                output = output.replace(/<\/?[h3|h2|h1|li|ol|ul]+\/?>/igm,'');
                            }
                            //TODO: Tables aren't being shown properly, parse out html?
                            $selectedInfo.html(output);
                        }
                    }
                }
            }
        })
        .error(function(xhr,data){
            console.log("WMS-I error trying to access: "+l.url);
        });
    });
};

incident_support.linkify_text=function(){
    $('.linkify').each(function(){
        var $item = $(this);
        $item.parent().children().each(function(){
            var $itemchild = $(this);
            var html = $itemchild.html();
            $itemchild.html(linkify(html));
        });
    });
};
incident_support.reload_icon=function(){
    (function() {
        var link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = settings.serverurl_favicon || '/favicon.ico';
        document.getElementsByTagName('head')[0].appendChild(link);
    }());
};
incident_support.addDownloadButtons=function(){
    var $btnHolder = $("#downloadable_button_holder");
    _.each(incident_support.event.mapServices,function(s){
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
incident_support.addDropoffFiles=function(){
    var $div = $('#event_file_dropbox');
    var browse_url = settings.serverurl_dropbox_browse;

    if (incident_support.event.files && incident_support.event.files.length && $div && browse_url){
        $div.css({overflow:'scroll',maxHeight:'150px'});

        var width = parseInt(($div.width() - 16)/2);
        var widthChars = parseInt(width/7.2);

        var fileDir = incident_support.event.fileDir;
        if (fileDir.indexOf("/cache/ajaxplorer/files")>-1){
            fileDir = _.string.strRight(fileDir,"/cache/ajaxplorer/files");
        }

        _.each(incident_support.event.files,function(file){
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

            var url = browse_url+fileDir + '/'+file;

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
incident_support.setupOverviewMin=function(){
    $("#overview")
        .css({maxHeight:'250px',overflow:'auto'});
}