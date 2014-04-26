// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

var layer_widgets = layer_widgets || {};

layer_widgets.widgetList = [];

layer_widgets.init=function(){
    if (incident_support &&incident_support.event && incident_support.event.geoWidgets)
        layer_widgets.widgetList = incident_support.event.geoWidgets;

    layer_widgets.turnSelectorsIntoTemplates();
    layer_widgets.createResultWidgets();
};

//---------------------------------------
layer_widgets.turnSelectorsIntoTemplates=function(){
    var selectors='url,selectorName,selectorLink,selectorPoint,selectorSummary,selectorShowIf'.split(',');

    //Turn search strings into underscore templates to make parseable text (safer than an eval statement)
    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;
    _.each(layer_widgets.widgetList,function(widget){
        _.each(selectors,function(selector){
            if (widget[selector]) {
                widget[selector+'_text'] = widget[selector];
                widget[selector] = _.template(widget[selector]);
            }
        });
    });
};
layer_widgets.createResultWidgets=function(){
    var $holder = $('#map_result_widget_bar');

    if (layer_widgets.widgetList && layer_widgets.widgetList.length) {

        var numWidgetsToFit = 3;
        if (layer_widgets.widgetList.length < 3) numWidgetsToFit=layer_widgets.widgetList.length;

        //TODO: Find the number of non-blocked, visible widgets, up to 3

        //TODO: Better design when not shown

        //TODO: Handle polygons

        //TODO: Show each of the widgets as options, then build a table of results?

        var widgetWidth = 250;
        if ($holder && $holder.css) {
            var tempWidth = parseInt($('#map_result_widget_bar').css('width') / numWidgetsToFit) - 6;
            if (tempWidth > 250) widgetWidth = tempWidth;
        }
        _.each(layer_widgets.widgetList,function(widget){
            var widgetID = _.string.dasherize("widget "+widget.name);
            $('<div>')
                .attr('id',widgetID)
                .css({
                    maxHeight:'150px',overflow:'scroll',display:'none',fontSize:'9px',
                    verticalAlign:'top',maxWidth:widgetWidth+'px',whiteSpace:'nowrap'
                })
                .addClass('thumbnail')
                .appendTo($holder);
        });
        $('<div>')
            .attr('id','widget-no-results')
            .css({
                maxHeight:'20px',verticalAlign:'top'
            })
            .text('No GeoLink results found. Zoom in on the map to try to find results')
            .addClass('thumbnail')
            .appendTo($holder);

        layer_widgets.setupPageAddins();
    } else {
        //No widgets loaded to page, hide the button
        $holder.css('display','none');
        $("#lookup_widgets_toggle").parent().css('display','none');
    }


};
layer_widgets.updateResultWidgets=function(map){
    var mapExtent=map.getExtent();
    var mapState={
        zoom:map.zoom,
        lat:map.center.lat,
        lon:map.center.lon,
        bbox:mapExtent.toBBOX(),
        n:mapExtent.top,
        s:mapExtent.bottom,
        e:mapExtent.right,
        w:mapExtent.left,
        width:map.size.w,
        height:map.size.h
    };
    mapState.x=parseInt(mapState.width/2);
    mapState.y=parseInt(mapState.height/2);


    var numTriedToShow = 0;
    _.each(layer_widgets.widgetList,function(widget){
        var widgetID = _.string.dasherize("widget "+widget.name);
        var $widgetHolder = $('#'+widgetID);

        var shouldShow=true;

        if (widget.belowZoom && (mapState.zoom < widget.belowZoom)) {
            shouldShow=false;
        }
        if (widget.aboveZoom && (mapState.zoom > widget.aboveZoom)) {
            shouldShow=false;
        }
        if (widget.proxyBlocked) {
            shouldShow=false;
        }

        if (shouldShow){
            var url;
            if (event_pages.isLocal() && widget.urlIfLocal){
                url = widget.urlIfLocal;
            } else {
                url = widget.url(mapState);
                url = event_pages.proxify(url);
            }
            numTriedToShow++;
            //console.log('Looking up '+url);

            $.ajax({url:url,dataType:widget.dataType,type:'GET'})
                .done(function(data){
                    //TODO: Add function to show these on map. Use icons?

                    if (widget.dataType=='xml'){
                        data = $.xml2json(data);
                    }

                    if (data && data.status && data.status=="error" ){
                        $widgetHolder
                            .css({display:'none'});
                        console.log("Proxy Exception in GeoLink on "+widget.name+" proxy returns error: "+data.details);
                        widget.proxyBlocked = true;
                        return false;
                    }

                    var holderCSS = {display:'inline-block',overflow:'auto'};
                    if (widget.style){
                        try {
                            var css = JSON.parse(widget.style);
                            holderCSS = $.extend(holderCSS,css);
                        } catch (ex){
                            console.log("Error in parsing widget.style of GeoLink: "+widget.name);
                        }
                    }

                    $widgetHolder
                        .css(holderCSS)
                        .html('<b>'+widget.description+':</b>');

                    var results = data[widget.listName];
                    if (!_.isArray(results)) results=[results];

                    var anyResults=false;

                    $.each(results, function( i, item ) {
                        item = $.extend(item,mapState);

                        var name = '';
                        var point = '';
                        var link = '';
                        var status = '';
                        var showIf = true;

                        //Parse actual variables into string templates
                        var lastParsed="";
                        try {
                            lastParsed="selectorName";
                            if (widget.selectorName) name = widget.selectorName(item);
                            lastParsed="selectorPoint";
                            if (widget.selectorPoint) point = widget.selectorPoint(item);
                            lastParsed="selectorLink";
                            if (widget.selectorLink) link = widget.selectorLink(item);
                            lastParsed="selectorSummary";
                            if (widget.selectorSummary) status = widget.selectorSummary(item);
                            lastParsed="selectorShowIf";
                            if (widget.selectorShowIf) showIf = widget.selectorShowIf(item) || true;
                            lastParsed="all";
                        } catch (ex) {
                            console.log("Exception parsing GeoLink response on item "+i+": "+widget.name+ " in function: "+lastParsed+"()");
                        }
                        if (!showIf || showIf=="false") return false; //TODO: Verify this is returning false only if a negative test, not blank
                        if (name){
                            var $div = $('<div>')
                                .appendTo($widgetHolder); //TODO: Make it look nicer
                            if (point){
                                $("<span>")
                                    .text("@ ")
                                    .on('click',function(){

                                        //TODO: Check if it's a point or polygon

                                        var pointll=point.split(" ");
                                        if (pointll.length == 2){
                                            var center = new OpenLayers.LonLat(pointll[1],pointll[0]);
                                            incident_support.map.setCenter(center);

                                            //TODO: Add Point to map
                                        } else if (pointll.length > 2){
                                            var polygon = new OpenLayers.Polygon(point);
//TODO: Finish                                            incident_support.map

                                        }
                                    })
                                    .css({cursor:'pointer',color:'blue'})
                                    .appendTo($div);

                            }

                            $('<span>')
                                .html(name || "Item")
                                .appendTo($div);

                            if (link){
                                $('<a>')
                                    .html(' [Link]')
                                    .attr({href:link, target:'_new'})
                                    .appendTo($div);
                            }
                            if (status) {
                                $div
                                    .popover({
                                        title:name,
                                        content:status,
                                        trigger:'hover',
                                        placement:'right'
                                    });

                            }
                            anyResults=true;
                            //TODO: Handle other location types
                        }
                    });
                    if (!anyResults){
                        $widgetHolder
                            .css({display:'none'});
                    }

                    //TODO: Check if parser returns json status:error and show msg?

                }).fail(function(a,b,c,d){
                    $widgetHolder
                        .css({display:'none'});
                    console.log('Failed retrieving data from GeoLink '+widget.name);

                    //TODO: Count number of shown widgets and resize appropriately
                });
        }

        $('#widget-no-results').css('display',(numTriedToShow?'none':'block'));
    });

};
layer_widgets.updateResultWidgets= _.throttle(layer_widgets.updateResultWidgets,3000);

layer_widgets.setupPageAddins=function(){
    $("#lookup_widgets_toggle").parent()
        .on("click press touch",function(){
            $("#lookup_widgets_toggle").text($(this).text()=="Lookups"?"Hide GeoLinks":"GeoLinks");
            layer_widgets.toggleWidgetBoxes();
        })
        .popover({
            title:'Beta - Show Lookup Info-boxes',
            content:'Click to toggle whether lookup info-boxes are shown',
            trigger:'hover',
            placement:'top'
        });
//
};
layer_widgets.toggleWidgetBoxes=function(){
    $('#map_result_widget_bar')
        .toggle();
};