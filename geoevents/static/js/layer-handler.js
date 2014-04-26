// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

//Note, uses underscore.js and jQuery
if (typeof console=="undefined")console={};
console.log=console.log||function(){};

var layerHandler = layerHandler || {};

layerHandler.dataQueryTracker=[];
layerHandler.options={};
layerHandler.defaultOptions={
    showPopupTextBelow:false,
    showPopupTextOnBubbleClose:true,
    showPopupTextInBubble:true,
    showPopupTextAsHTML:true,
    iconWidth: '100px',
    iconFontSize: '.8em',
    iconOpacity: '.8',
    iconLeft: '42px',
    iconTop: '11px',
    iconIcon: 'icon-chevron-down',
    iconText: 'Layers and Data',
    layerBoxWidth: '550px',
    layerBoxOpacity: '0.9',
    layerBoxTop: '14px',
    layerBoxHeight: '320px',
    categoryID: 'report-category-filter',
    filterID: 'report-type-filter',
    reportBoxID: 'report-map-filter-box',
    layerHolderID: 'map-layer-filters',
    existingLayerID: 'map-existing-layers',
    existingDataLayerID: 'map-data-layers',
    layerInfoID: 'map-layer-info-box',
    categoryHeader: 'Categories',
    typesToShowAsLayers: ['wms','wmts','arcgis93rest', 'mapbox','tileserver'],
    typesToShowAsData: ['kml','gml','georss','geojson','wfs'],
    hideExistingLayers: false,
    toggleExistingLayers: true,
    classForShownLayer:'label-success',
    layerNumToShow: 1,
    initialTabToShow: 0,
    tabTitles:['Layers On Map','Other Layers','Real-time Data'],
    zIndex: 1025,
    allowSearch: true,
    hideLayerBoxAfterClick:true,
    proxy: (document.location.hostname=="localhost")?'/proxy/':'/events/proxies/proxy.jsp?',
    searchBoxID: 'report-search-box',
    showEditableVectors: true,
//    layersLookupAPI: '/api/v1/layer/?format=json&limit=200',
    layerToggleFunctionAfter: function(layerOnMap){

    },
    layerToggleFunctionBefore: function(){

    },
    layerClickedFunctionAfter: function(layerInfo,layerAddedFirstTime,layerOnMap,options){
        //To be overloaded by calling method
    },
    layerClickedFunction: function(layer,options){
        layer.transparent = true;
        var layerAddedFirstTime = false;
        var layerInfo = layerHandler.mapServiceJSONtoLayer([layer]);
        if (layerInfo && layerInfo.length) {
            layerInfo = layerInfo[0];

            var layerOnMap = options.map.getLayersByName(layerInfo.name);
            if (layerOnMap && layerOnMap.length) {
                layerOnMap = layerOnMap[0];
                if (layerOnMap.visibility) {
                    layerOnMap.setVisibility(false);
                } else {
                    layerOnMap.setVisibility(true);
                }
            } else {
                //No layer yet, add to map and show
                options.map.addLayer(layerInfo);
                layerInfo.setVisibility(true);
                layerAddedFirstTime=true;
            }

            if (options.hideLayerBoxAfterClick) $('#'+options.layerHolderID).hide();

            options.layerClickedFunctionAfter(layerInfo,layerAddedFirstTime,layerOnMap,options);
            options.layerToggleFunctionAfter(layerOnMap);
        }
    }
};

//TODO: Pull these from: /api/v1/layer/?format=json and categorize appropriately

layerHandler.defaultLayerList = [
    {category:'Info',layers:[
        {id:'d1',type:'kml',layer:'Fertility (UN Data)',name:'Fertility (UN Data - 2005)',url:'http://thematicmapping.org/data/kml/fertility.kml'},
        {id:'d2',type:'kml',layer:'Internet Users (UN Data)',name:'Internet Users (UN Data - 2005)',url:'http://thematicmapping.org/data/kml/internet_users_2005_choropleth_lowres.kml'},
        {id:'d3',type:'kml',layer:'Infant Mortality (UN Data)',name:'Infant Mortality (UN Data - 2005)',url:'http://thematicmapping.org/data/kml/infant_mortality_2005_choropleth.kml'},
        {id:'d4',type:'wms',layer:'OSM_BASEMAP_OVERLAY',name:'Open Street Maps',url:'http://geoint.nrlssc.navy.mil/nrltileserver/wms?'},
        {id:'d5',type:'wms',layer:'COUNTYLEVEL_OUTAGES',name:'EARSS Electric Outages',url:"https://pas.ornl.gov:443/geoserver/gears/ows?"},
        {id:'d8',type:'wms',layer:'13',name:'WHO Influenza Data',url:'http://ags.pdc.org/arcgis/services/other/biosurveillance(BioServ)/MapServer/WMSServer?',description:"Health data tracked by the WHO Biosurveillance BioServ program."}
    ]},
    {category:'Hurricanes',layers:[
        {id:'d9',type:'wms',opacity:0.7,layer:'NHC_TRACK_POLY,NHC_TRACK_PT,NHC_TRACK_LIN',name:'Hurricane Track',url:'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/wwa?'},
        {id:'d10',type:'wms',layer:'NHC_TRACK_PT_72WLBL',name:'Hurricane Winds',url:'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/wwa?',description:"Hurricane Winds - 72 hour prediction",tags:"forecast"},
        {id:'d11',type:'wms',url:"http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?",layer:"nexrad-n0r-900913",opacity:0.7,name:"NexRad Current Storms"},
        {id:'d12',type:'wms',opacity:0.7,url:"http://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_vis.cgi?",layer:"goes_conus_vis",name:"Current Visual Cloud Cover"},
        {id:'d13',type:'wms',opacity:0.8,url:"http://mesonet.agron.iastate.edu/cgi-bin/wms/q2.cgi?",layer:"q2",name:"Q2 Forecast",tags:"forecast weather"},
        {id:'d14',type:'wms',opacity:0.7,url:"http://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_ir.cgi?",layer:"goes_conus_ir",name:"IEM GOES IR WMS Service"},
        {id:'d15',type:'wms',opacity:0.5,url:"http://gis.srh.noaa.gov/ArcGIS/services/EpStormViewer/MapServer/WMSServer?",layer:"0",name:"NOAA stormViewer"},
        {id:'d16',type:'wms',layer:'WARN_SHORT_TOR',name:'Tornado Warnings',url:'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/wwa?'},
        {id:'d17',type:'wms',layer:'WARN_SHORT_EWW',name:'Extreme Wind Warnings',url:'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/wwa?'},
        {id:'d18',type:'wms',layer:'WARN_SHORT_SVR',name:'Severe Thunderstorm',url:'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/wwa?'},
        {id:'d19',type:'georss',layer:"Hurricane",name:"Hurricanes",url:'http://geocommons.com/overlays/259154.atom'},
        {id:'d20',type:'wms',url:"http://gis.srh.noaa.gov/ArcGIS/services/atStormViewer/MapServer/WMSServer?",layer:"1",name:"Tropical Outlook"},
        {id:'d21',type:'wms',opacity:0.8,url:"http://rmgsc.cr.usgs.gov/ArcGIS/services/nhss_weat/MapServer/WMSServer?",layer:"0",name:"USGS Weather Alerts/Advisories"},
        {id:'d22',type:'wms',opacity:0.8,url:"http://gis.srh.noaa.gov/ArcGIS/services/watchWarn/MapServer/WMSServer?",layer:"0",name:"NWS Weather Watches/Warnings"}

    ]},
    {category:'Floods',layers:[
        {id:'d23',type:'wms',layer:'WARN_SHORT_FLW',name:'Flood Warnings',url:'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/wwa?'},
        {id:'d24',type:'wms',layer:'WARN_SHORT_FFW',name:'Flash Flood Warnings',url:'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/wwa?'}
    ]},
    {category:'Quakes',layers:[
        {id:'d25',type:'wms',url:"http://rmgsc.cr.usgs.gov/ArcGIS/services/nhss_shakemaps/MapServer/WMSServer?",layer:"0",name:"USGS Shakemaps"},
        {id:'d37',type:'GeoJSON',url:'/'+event_pages.options.root+"api/v1/harvester/earthquake/?format=json&status=1&limit=50",name:"Latest Earthquakes",layerParsingFunction:'harvester_earthquake'}
    ]},
    {category:'Fires',layers:[
        {id:'d29',type:'wms',url:"http://gis.fema.gov/SOAP/FEMA/DECs/MapServer/WMSServer?",layer:"0",name:"FEMA Major Disasters"},
        {id:'d30',type:'wms',url:"http://gis.fema.gov/SOAP/FEMA/DECs/MapServer/WMSServer?",layer:"16",name:"FEMA Emergency Declarations"},
        {id:'d38',type:'GeoJSON',url:'/'+event_pages.options.root+"api/v1/harvester/fire/?format=json&status=1&limit=50",name:"Latest Fires",layerParsingFunction:'harvester_fire'}
    ]},
    {category:'Volcanos',layers:[
        {id:'d31',type:'wms',url:"http://rmgsc.cr.usgs.gov/ArcGIS/services/nhss_haz/MapServer/WMSServer?",layer:"0",name:"Volcano Hazards"}
    ]},
    {category:'Tsunami',layers:[
        {id:'d32',type:'wms',url:"http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/wwa?",layer:"WARN_SHORT_SMW",name:"Special Maritime Warnings"},
        {id:'d33',type:'wms',layer:'0',name:'PDC Country Warnings',url:'http://ags.pdc.org/arcgis/services/global/pdc_models/MapServer/WMSServer?'},
        {id:'d34',type:'wms',layer:'1',name:'PDC Tsunami Watch Zones',url:'http://ags.pdc.org/arcgis/services/global/pdc_models/MapServer/WMSServer?'},
        {id:'d35',type:'wms',layer:'2',name:'PDC Tsunami Travel Time',url:'http://ags.pdc.org/arcgis/services/global/pdc_models/MapServer/WMSServer?'},
        {id:'d36',type:'wms',layer:'3',name:'PDC Estimated First Wave',url:'http://ags.pdc.org/arcgis/services/global/pdc_models/MapServer/WMSServer?'}
    ]}
];
layerHandler.widthOfLayerSwitcher=function(options){
    var widthBuffer = 100;
    var heightBuffer = 50;
    if (layer_buttons && layer_buttons.defaultOptions && layer_buttons.defaultOptions.iconWidth){
        widthBuffer = parseInt(options.iconLeft) + parseInt(layer_buttons.defaultOptions.iconWidth) + parseInt(layer_buttons.defaultOptions.iconSpace) + 40;
        heightBuffer = parseInt(options.iconTop) + 50;
    }
    var layerBoxWidth = parseInt(options.layerBoxWidth);
    var layerBoxHeight = parseInt(options.layerBoxHeight);

    var mapDiv = options.map.div;
    var mapWidth = $(mapDiv).width();
    var mapHeight = $(mapDiv).height();
    if (mapWidth && (layerBoxWidth < mapWidth-widthBuffer)){
        layerBoxWidth = mapWidth-widthBuffer;
    }
    if (mapHeight && (layerBoxHeight < mapHeight-heightBuffer)){
        layerBoxHeight = mapHeight-heightBuffer;
    }

    return {width:layerBoxWidth+"px", height:layerBoxHeight+"px"};
};
layerHandler.buildLayerList=function(options){
    var layerList=options.layerList || layerHandler.defaultLayerList;
    var categories = null;

    if (options.layersLookupAPI){
        function getRemote() {
            return $.ajax({
                type: "GET",
                url: options.layersLookupAPI,
                async: false
            }).responseText;
        }
        var newLayerList = getRemote();
        if (_.isString(newLayerList) && newLayerList.length > 0) {
            try {
                newLayerList=$.secureEvalJSON(newLayerList);
            } catch (ex){
                console.log("Likely poorly formatted JSON received in layer list query");
            }
        }
        if (_.isObject(newLayerList) && newLayerList.objects) {
            var newList = newLayerList.objects;

            newList = _.groupBy(newList,'category');
            layerList = [];
            for (var key in newList) {
                var name = key || "Uncategorized";
                if (name=="null") name = "Uncategorized";

                var layerGroup = {category: name};
                layerGroup.layers = newList[key];
                layerList.push(layerGroup);
            }
        }
    }

    return layerList;
};

layerHandler.addLayerSwitcherToMap=function(options){

    if (typeof options == "undefined") options = layerHandler.options || {};
    var divOfMap=options.div;
    var layersData=options.event;
    if (typeof divOfMap == "undefined" || typeof layersData == "undefined") {
        return "ERROR: Both the container div and events data needs to be passed in as options.div and options.event!";
    }

    options = $.extend(layerHandler.defaultOptions,options);

    options.layerList = layersData.layerList = layerHandler.buildLayerList(options);

    if (layersData && layersData.mapServices) {
        //Used to see what layers are already on map
        options.mapServices = layersData.mapServices;
    }
    layerHandler.options = options;

    var lhSize = layerHandler.widthOfLayerSwitcher(options);
    var layerBoxWidth=lhSize.width;
    var layerBoxHeight=lhSize.height;

    var title = options.iconText;
    if (options.iconIcon) title += " <i class='"+ options.iconIcon+"'></i>";

    $("<div>")
        .html(title)
        .attr('id',options.reportBoxID)
        .attr('role','button')
        .addClass('btn')
        .css({position:'relative',top:options.iconTop,left:options.iconLeft,
            width:options.iconWidth,zIndex:options.zIndex,fontSize:options.iconFontSize})
        .bind('click touchend',function(event){
            options.layerToggleFunctionBefore();

            event = event || window.event;
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble=true;

            layerHandler.toggleLayerBox();
        })
        .appendTo(divOfMap);

    var $mlf = $("<div>")
        .attr('id',options.layerHolderID)
        .css({position:'relative',top:options.layerBoxTop,left:options.iconLeft,
            width:layerBoxWidth,zIndex:options.zIndex,
            opacity:options.layerBoxOpacity,display:'none',
            maxHeight:layerBoxHeight,overflow:'scroll-y'})
        .addClass('map-menu-box')
        .bind('scroll', function(event){
            event.preventDefault();
        })
        .bind('click touchend', function(event){
            event = event || window.event;
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble=true;
        })
        .appendTo(divOfMap);

    layerHandler.drawTabsAndData($mlf,options);
    layerHandler.drawReportLayers(options.layerList,options);
    layerHandler.drawReportTypes(options.layerList,options);
    layerHandler.drawExistingLayers(options);
    layerHandler.drawLayerInfo(options);
};
layerHandler.toggleLayerBox = function(shownMethod){
    var options = layerHandler.options;
//    var hash = $.bbq.getState();

    var holderName = '#' + options.layerHolderID;
    var $div = $(holderName);

    if (shownMethod!='refresh'){
        $div.toggle();
    }

    if ($div.css('display')!='none'){
        var index_highest = 0;
        $('div').each(function(){
            var index_current = parseInt($(this).css("z-index"), 10);
            if(index_current > index_highest) {
                index_highest = index_current;
            }
        });
        var lhSize = layerHandler.widthOfLayerSwitcher(options);
        $div.css({zIndex:index_highest+1,width:lhSize.width,height:lhSize.height});

        layerHandler.drawReportLayers(options.event.layerList,options);
        layerHandler.drawExistingLayers(options);
        layerHandler.drawLayerInfo(options);

    }
//    $.bbq.pushState(hash);

};
layerHandler.drawTabsAndData = function($mlf,options,tabNumShown){

    if (typeof tabNumShown=='undefined') tabNumShown = options.initialTabToShow;

    var $divholder = $("<div>")
        .addClass('tabbable')
        .addClass('tabs-left')
        .appendTo($mlf);

    var pZ = parseInt($divholder.parent().css('zIndex'));
    $divholder.css('zIndex',pZ+1);

    var $ul = $("<ul>")
        .addClass('nav')
        .addClass('nav-tabs')
        .appendTo($divholder);

    _.each(options.tabTitles,function(tab,i){
        var $li = $("<li>")
            .attr('id','tab'+i+'_li_title')
            .bind('click touchend',function(event){
                //NOTE: To prevent clicks bubbling to underlying map, events are being blocked
                event.preventDefault();
                $('.nav-tabs li:eq('+i+') a').tab('show');
                for (var n=0;n<options.tabTitles.length;n++){
                    if (n==i) continue;
                    $('#tab'+n).css({display:'none'});
                }
                $('#tab'+i).css({display:'block'});

            })
            .appendTo($ul);
        $("<a>")
//            .attr({href:'#tab'+i,'data-toggle':'tab'})
            .html(tab)
            .css('zIndex',pZ+1+i)
            .appendTo($li);
        if (tabNumShown==i) {
            $li.addClass('active');
        }
    });

    $('.nav-tabs')
        .bind('click touchend',function(event){
            if (event.stopPropagation) { event.stopPropagation(); } else { event.cancelBubble=true;}
        });

    //CONTENT
    var $divcontent = $("<div>")
        .addClass('tab-content')
        .css('zIndex',pZ+2)
        .appendTo($divholder);

    //TAB 0
    var $div = $("<div>")
        .addClass("tab-pane")
        .attr("id","tab0")
        .appendTo($divcontent);
    if (tabNumShown==0) {
        $div.addClass('active');
    }
    $('<div>')
        .attr('id',options.existingLayerID)
        .addClass("layers-list")
        .appendTo($div);
    $("<div>")
        .attr('id',options.layerInfoID)
        .appendTo($div);

    //TAB 1
    $div = $("<div>")
        .addClass("tab-pane")
        .attr("id","tab1")
        .appendTo($divcontent);
    if (tabNumShown==1) {
        $div.addClass('active');
    }
    $("<div>")
        .attr('id',options.filterID)
        .addClass('filters')
        .addClass('layers-list')
        .appendTo($div);
    $("<div>")
        .attr('id',options.categoryID)
        .appendTo($div);

    //TAB 2
    $div = $("<div>")
        .addClass("tab-pane")
        .attr("id","tab2")
        .appendTo($divcontent);
    if (tabNumShown==2) {
        $div.addClass('active');
    }
    $('<div>')
        .attr('id',options.existingDataLayerID)
        .addClass("layers-list")
        .appendTo($div);

};
layerHandler.drawLayerInfo = function(options,layerToShow){
    var $infoBox = $("#"+options.layerInfoID);
    $infoBox.empty();

    var map = map || options.map || incident_support.map;

    $('<h3>')
        .text('Layer Details')
        .appendTo($infoBox);
    $('<span>')
        .text('Hide all layers')
        .css({cursor:'pointer',padding:2,marginRight:4})
        .addClass('label label-info')
        .bind('click mouseup',function(){
            _.each(map.layers,function(layer){
                if (!layer.isBaseLayer) {
                    layer.setVisibility(0);
                }
            });
            layerHandler.toggleLayerBox('refresh');

        })
        .appendTo($infoBox);
    $('<span>')
        .text('Show all layers')
        .css({cursor:'pointer',padding:2})
        .addClass('label label-info')
        .bind('click mouseup',function(){
            _.each(map.layers,function(layer){
                layer.setVisibility(1);
            });
            layerHandler.toggleLayerBox('refresh');

        })
        .appendTo($infoBox);


    if (layerToShow==undefined){
        $('<div>')
            .text('Highlighted layers are loaded onto the map.')
            .appendTo($infoBox);
    } else {
        $('<div>')
            .html("Name: <b>"+layerToShow.name+"</b>")
            .appendTo($infoBox);
        if (layerToShow.type) {
            var type = layerToShow.type;
            if (layerToShow.projection && layerToShow.projection.projCode) {
                type += " : " + layerToShow.projection.projCode;
            }
            $('<div>')
                .html("Type: <b>"+ type+"</b>")
                .appendTo($infoBox);
        }
        $('<div>')
            .html("Status: <b>"+ (layerToShow.getVisibility()?"Shown":"Hidden")+"</b>")
            .appendTo($infoBox);
        if (layerToShow.opacity) {
            var opacity = Math.round(layerToShow.opacity * 100)+"%";
            var $opacity = $('<div>')
                .appendTo($infoBox);
            var $opacity_title = $("<span>")
                .html("Opacity: <b>"+opacity+"</b> (")
                .appendTo($opacity);
            _.each([100,80,50,25],function(num){
                $("<span>")
                    .text(num+"% ")
                    .css({color:'#39c',cursor:'pointer'})
                    .bind('click mouseup',function(){
                        layerToShow.setOpacity(num/100);
                        $opacity_title
                            .html("Opacity: <b>"+(num)+"%</b> (");
                    })
                    .appendTo($opacity);
            });
            $("<span>")
                .html(")")
                .appendTo($opacity);
        }
//        if (layerToShow.getExtent){
//            $('<div>')
//                .html("Zoom to Show Layer")
//                .css({color:'#39c',cursor:'pointer'})
//                .bind('click mouseup',function(){
//                    //TODO: Make sure layer is visible and close tab?
//                    incident_support.map.zoomToExtent(layerToShow.getExtent());
//                })
//                .appendTo($infoBox);
//        }

        var layerOrder = 0;
        if (map && map.getLayerIndex) {
            layerOrder = map.getLayerIndex(layerToShow);
            if (layerOrder>0){
                $('<div>')
                    .html("Move Up on list")
                    .css({color:'#39c',cursor:'pointer'})
                    .bind('click touchend',function(){
                        map.raiseLayer(layerToShow, 1);
                        layerHandler.toggleLayerBox('refresh');
                    })
                    .appendTo($infoBox);
            }
            if (layerOrder<(map.layers.length-1)){
                $('<div>')
                    .html("Move Down on list")
                    .css({color:'#39c',cursor:'pointer'})
                    .bind('click touchend',function(){
                        map.raiseLayer(layerToShow, -1);
                        layerHandler.toggleLayerBox('refresh');
                    })
                    .appendTo($infoBox);
            }
        }

        if (layerToShow.url) {
            var linkText = "<a href='"+layerToShow.url+"?request=GetCapabilities' target='_new'>Link</a>";
            //TODO: Have this differ based on layer type
//            linkText += "|| <a href='"+layerToShow.url+"?request=GetCapabilities' target='_new'>Capabilities</a> ";
//            linkText = linkText.replace("??","?");

            $('<div>')
                .html("URL: "+linkText)
                .appendTo($infoBox);
        }

        var layerMetaData = layerHandler.layerInfo(layerToShow.name);
        if (layerMetaData && layerMetaData.category){
            $('<div>')
                .html("Category: <b>"+layerMetaData.category+"</b>")
                .appendTo($infoBox);
        }

        if (layerMetaData && layerMetaData.description){
            $('<div>')
                .html("Description: <b>"+layerMetaData.description+"</b>")
                .appendTo($infoBox);
        }
        if (layerMetaData && layerMetaData.tags && layerMetaData.tags.length){
            var tags= layerMetaData.tags;
            if (_.isArray(tags)) tags = tags.join(" ");
            $('<div>')
                .html("Tags: <b>"+tags+"</b>")
                .appendTo($infoBox);
        }
        if (layerMetaData && layerMetaData.POC){
            $('<div>')
                .html("POC: <b>"+layerMetaData.POC+"</b>")
                .appendTo($infoBox);
        }
        if (layerMetaData && layerMetaData.attribution){
            $('<div>')
                .html("Attribution: <b>"+layerMetaData.attribution+"</b>")
                .appendTo($infoBox);
        }
    }

};
layerHandler.layerInfo = function(name){
    //Look through mapServices, then defaultList and return the first found
    var layerList = layerHandler.options.mapServices;
    var foundLayer = _.find(layerList,function(l){return l.name==name});
    if (foundLayer) return foundLayer;

    layerList = _.flatten(_.pluck(layerHandler.defaultLayerList,'layers'));
    return _.find(layerList,function(l){return l.name==name});
};
layerHandler.drawReportTypes = function(categories,options,layerNumToShow){
    var $catHolder = $('#'+options.filterID);
    $catHolder.empty();

    //Draw the first category:
    if (typeof layerNumToShow == 'undefined') {
        layerNumToShow = options.layerNumToShow;
    } else {
        options.layerNumToShow = layerNumToShow;
    }

    $("<h3>")
        .html(options.categoryHeader)
        .appendTo($catHolder);
    var $ul = $("<ul>")
        .appendTo($catHolder);
    _.each(categories,function(category,i){
        var $li = $('<li>')
            .appendTo($ul);
        var $a = $('<a>')
//            .attr('href','#')
            .bind('click touchend',function(){
                layerHandler.drawReportLayers(categories,options,i);

                var parUL = this.parentNode.parentNode;
                _.each(parUL.childNodes, function(cn){
                    var $a = $(cn.childNodes[0]);
                    $a.removeClass('active');
                });

                $(this).addClass('active');
            })
            .appendTo($li);

        if (i==layerNumToShow) {
            $a.addClass('active');
        }

        $('<span>')
            .html(category.category)
            .appendTo($a);
    });
    $('<div>')
        .addClass('floatbox')
        .appendTo($catHolder);
};
layerHandler.findLayersOfType=function(layers,types,options){
    return _.filter(layers,function(l){
        var showLayer = _.indexOf(types,l.type.toLowerCase())==0;

        if (options.mapServices) {
            _.each(options.mapServices,function(ms){
                if (l.url == ms.url && l.layer == ms.layer) {
                    if (options.hideExistingLayers) {
                        showLayer=false;
                    }
                }
            });
        }
        if (options.map.layers && options.map.layers.length) {
            _.each(options.map.layers,function(ms){
                if (l.url == ms.url && l.name == ms.name) {
                    if (options.hideExistingLayers) {
                        showLayer=false;
                    }
                    l.shownAlready = ms.visibility;
                }
            });
        }
        return showLayer;
    });

};
layerHandler.drawReportLayers=function(categories,options,layerNumToShow){
    if (typeof options=='undefined') return;
    var $catHolder = $('#'+options.categoryID);
    if (typeof $catHolder=='underfined') return;
    $catHolder.empty();

    //Draw the first category:
    if (typeof layerNumToShow == 'undefined') {
        layerNumToShow = options.layerNumToShow;
    } else {
        options.layerNumToShow = layerNumToShow;
    }
    var category = categories[layerNumToShow];

    $("<h3>")
        .html(category.category)
        .appendTo($catHolder);
    var $cs = $("<ul>")
        .attr('id','category_switch')
        .addClass('category-filters')
        .appendTo($catHolder);

    //layerHandler.findLayersOfType(category.layers,options.typesToShowAsLayers,options);
    var shownLayers = category.layers;

    _.each(shownLayers,function(layer){
        var $li = $('<li>')
            .appendTo($cs);
        var name = layer.name || layer.layerName || layer.url;
        var $a = $('<a>')
//            .attr('href','#')
            .attr('title',name)
            .bind('click touchend',function(){
                options.layerClickedFunction(layer,options);
            })
            .appendTo($li);
        var $span1 = $('<span>');
        if (layer.icon){
            $('<img>')
                .attr('src',layer.icon)
                .css({'float':'left','paddingRight':'5px'})
                .appendTo($span1);
        } else {
            $span1
                .addClass('swatch')
                .css('backgroundColor','#663300');
        }
        $span1.appendTo($a);
        $('<span>')
            .html(name)
            .addClass('category-title')
            .appendTo($a);

        if (options.toggleExistingLayers) {
            if (layer.shownAlready) {
                $a
                    .addClass('label')
                    .addClass(options.classForShownLayer)
                    .css({color:'white'});
            } else {
                $a
                    .removeClass(options.classForShownLayer)
                    .css({color:'black'});
            }
        }

    });
};
layerHandler.drawExistingLayers = function(options){
    var $layerHolder = $("#"+options.existingLayerID);
    $layerHolder.empty();
    var layerCount=0;
    $("<h3>")
        .html("Layers currently on map")
        .appendTo($layerHolder);
    var $divf = $("<div>")
        .addClass("filters")
        .appendTo($layerHolder);
    var $ul = $("<ul>")
        .appendTo($divf);

    var layerDataCount=0;
    var $layerDataHolder = $("#"+options.existingDataLayerID);
    $layerDataHolder.empty();
    $("<h3>")
        .html("Real-time Data currently on map")
        .appendTo($layerDataHolder);
    var $divf2 = $("<div>")
        .addClass("filters")
        .appendTo($layerDataHolder);
    var $ul2 = $("<ul>")
        .appendTo($divf2);

    //TODO: Up and Down buttons need to be rethought
    var mapLayers = _.filter(options.map.layers,function(l){
        var type = l.type;
        var goodLayer = false;
        if (type) {
            type = type.toLowerCase();
            if (_.indexOf(options.typesToShowAsLayers,type)>-1) goodLayer=true;
        }
        if (layerHandler.options.showEditableVectors && l.CLASS_NAME=="OpenLayers.Layer.Vector") goodLayer=true;
        return goodLayer;
    });

    $(mapLayers.reverse()).each(function(){
        var layer = $(this)[0];

        var $li = $('<li>');
        var name = layer.name || layer.layerName || layer.url;
        var $a = $('<a>')
//            .attr('href','#')
            .attr('title',name)
            .bind('click touchend',function(){
                if (layer.visibility) {
                    layer.setVisibility(false);
                } else {
                    layer.setVisibility(true);
                }
                $('#'+options.layerHolderID).hide();

                options.layerToggleFunctionAfter(layer);

            })
            .bind('mouseover',function(){
                layerHandler.drawLayerInfo(options,layer);
            })
            .appendTo($li);
//        var $span1 = $('<span>');
//        if (layer.icon){
//            $('<img>')
//                .attr('src',layer.icon)
//                .css({'float':'left','paddingRight':'5px'})
//                .appendTo($span1);
//        } else {
//            $span1
//                .addClass('swatch')
//                .css('backgroundColor','#663300');
//        }
//        $span1.appendTo($a);
        $('<span>')
            .html(name)
            .appendTo($a);

        var currentVis = layer.getVisibility();
        if (currentVis) {
            $a
                .addClass('label')
                .addClass(options.classForShownLayer)
                .css({color:'white'});
        } else {
            $a
                .removeClass(options.classForShownLayer)
                .css({color:''});
        }

        $a.appendTo($li);

        var layerType = layer.type || "";
        layerType = layerType.toLowerCase();

        if (layerType=='kml' || layerType=='georss' || layerType=='geojson') {
            $li.appendTo($ul2);
            layerDataCount++;
        } else {
            $li.appendTo($ul);
            layerCount++;
        }

    });

    if (layerCount==0){
        $layerHolder.html("No map layers associated with this map.")
    }

    if (layerDataCount==0){
        $('#tab2_li_title').hide();
        $layerDataHolder.hide();
//        $layerDataHolder.html("No data layers associated with this map.")
    }
};
layerHandler.extendOptions = function(options,addParams){
    if (addParams){
        if (_.isString(addParams)) {
            try {
                addParams=$.secureEvalJSON(addParams);
            } catch (ex){
                console.log("Likely poorly formatted JSON received in layerParams for map layer");
            }
        }
        if (addParams && _.isObject(addParams)){

            //stringify params if they are an obj
            _.each(addParams, function(obj, obj_name){

               //Openlayers WMTS allows for a params object with additional request parameters
               if (_.isObject(obj) && obj_name!="params"){
                   addParams[obj_name]=JSON.stringify(obj);
               }
            });

            $.extend(options, addParams);
        }
    }
    return options;
};

layerHandler.select=null;
layerHandler.popup=null;
layerHandler.addPopupControls = function (map,mapLayerList){
    _.each(mapLayerList,function(layer){
        if (layer.type == 'kml' || layer.type == 'geojson' || layer.type == 'georss' || layer.type == 'gpx' || layer.type == 'gml') {
            layerHandler.select = new OpenLayers.Control.SelectFeature(layer);
            layer.events.on({
                "featureselected": layerHandler.onFeatureSelect,
                "featureunselected": layerHandler.onFeatureUnselect
            });
            map.addControl(layerHandler.select);
            layerHandler.select.activate();
        }
    });
};
layerHandler.onPopupClose=function(event) {
    if (layerHandler.select && layerHandler.select.unselectAll){
        layerHandler.select.unselectAll();
    }
    layerHandler.removePopup(event);
};
layerHandler.onFeatureSelect=function(event,content) {
    var feature = event.feature;
    var layername = event.object ? event.object.name : "-1";

    var layerInfoLookup = layerHandler.layerInfo(layername);
    var parser = incident_support.parsers.parserFunction(layerInfoLookup,'popup');
    content = content || parser(feature,layerInfoLookup);

    if (layerHandler.options.showPopupTextInBubble){
        layerHandler.popup = new OpenLayers.Popup.FramedCloud("Feature Details",
            feature.geometry.getBounds().getCenterLonLat(),
            new OpenLayers.Size(100,100),
            content,
            null, true, layerHandler.onPopupClose);
        feature.popup = layerHandler.popup;

        var map =layerHandler.getMap();
        if (map) {
            map.addPopup(layerHandler.popup);
        } else {
            console.log('No map for popup features');
        }
    }

    var $selectedInfo = $('#selected_feature_info');
    if ($selectedInfo && layerHandler.options.showPopupTextBelow){

        if (!layerHandler.options.showPopupTextAsHTML){
            content = content.replace(/<\/?[h3|h2|h1|li|ol|ul]+\/?>/igm,'');
        }

        $selectedInfo.html(content);
    }

};
layerHandler.onFeatureUnselect=function(event) {
    layerHandler.removePopup(event);
};
layerHandler.getMap=function(){
    var map=null;
    if (typeof incident_support!='undefined'&&incident_support.map) map=incident_support.map;
    if (typeof dashboard_support!='undefined'&&dashboard_support.map) map=dashboard_support.map;
    return map;
};
layerHandler.removePopup=function(event){
    var feature = event.feature;
    var map =layerHandler.getMap();

    if (layerHandler.popup){
        if (map) map.removePopup(layerHandler.popup);
        layerHandler.popup.destroy();
        delete layerHandler.popup;
    }
    if (feature && feature.popup){
        if (map) map.removePopup(feature.popup);
    }
    var $selectedInfo = $('#selected_feature_info');
    if ($selectedInfo && !layerHandler.options.showPopupTextOnBubbleClose){
        $selectedInfo.html('');
    }
};

layerHandler.reQuery=function(name){
    var querier = _.find(layerHandler.dataQueryTracker,function(q){return q.name==name});
    querier.timeout = null;
    querier.qFunction(querier.data);
};
