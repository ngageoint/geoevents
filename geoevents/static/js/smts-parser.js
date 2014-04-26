// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

incident_support.smts_holder_build=function(urlSuffix){

    var smts_url = incident_support.event.productFeed;
    if (urlSuffix) smts_url+=urlSuffix;
    //TODO: This is a temporary fix until new SMTS API is in place
    if (smts_url.indexOf("smts_list_format.jsp")>0 || smts_url.indexOf("events/smts2")>0 ) {
        //We're still using the old way of showing SMTS, so use that for now
        incident_support.products_setupSMTS();
        incident_support.products_searching="old_method";
        return false;
    }
    incident_support.products_searching="new_method";

    var $prod_holder = $("#products")
        .css({maxHeight:'318px','overflow-y':'auto','overflow-x':'hidden', margin:'2px'});

    $prod_holder.empty();

    $('<table>')
        .attr({cellpadding:0,cellspacing:0,border:0,id:'SMTS_datatable'})
        .addClass("display")
        .appendTo($prod_holder);


    smts_url = event_pages.proxify(smts_url);
//    console.log("Looking up SMTS: "+smts_url);
    $.ajax({
        type: "GET",
        url: smts_url,
        dataType: "json"
    })
    .done(incident_support.smts_received)
    .fail(incident_support.smts_error)

};

incident_support.smts_received=function(data){
    function trimText(str){
        str = str.replace(/[^\x21-\x7E]+/g, ' '); // change non-printing chars to spaces
        return str.replace(/^\s+|\s+$/g, '');
    }

    var url_lookup_http = settings.serverurl_smts_http;
    var url_lookup_https= settings.serverurl_smts_https;
    var url_local_proxy = settings.serverurl_proxy_url;

    if (data && data.status && data.status=="error"){
        //Parse the SMTS objects into a table
        var errorData= [{'sender':'Proxy', 'response':'Proxy Error','details':data.details}];

        incident_support.smts_parser(errorData, true);
        return false;
    }

    //Check for duplicates
    _.each(data,function(smts_item){

        //TODO: Build test wrappers around each
        if (!smts_item || !smts_item.properties) return false;
        var title= smts_item.properties.title;
        var desc= smts_item.properties.description;
        var point= smts_item.geometry[1].coordinates;
        var keywords=smts_item.properties.keywords; //Is an array

        var links=smts_item.properties.virtualCoverage; //Is an array
        var modDate=smts_item.properties.recorddate;
        var pubDate=smts_item.properties.dateposted;

        //Clean up title
        title = trimText(title);
        title = title.replace("U //FOUO","U//FOUO");

        //Update dates to a moment() format
        var testDate = moment(pubDate);
        if (testDate && testDate.isValid()) pubDate = testDate;
        testDate = moment(modDate);
        if (testDate && testDate.isValid()) modDate = testDate;

        _.each(links,function(linkObj){
            var prod=linkObj.address;

            //Change links to proxied version, and if chrome use special download proxy if exists
            var proxy_url = url_local_proxy;
            if (settings.serverurl_proxy_url_dl && /chrome/.test(navigator.userAgent.toLowerCase())){
                proxy_url = settings.serverurl_proxy_url_dl;
            }
            if (url_lookup_http) prod = prod.replace(url_lookup_http, proxy_url);
            if (url_lookup_https) prod = prod.replace(url_lookup_https, proxy_url);

            var link=prod;
            //Check for duplicates
            var existingProds = _.filter(incident_support.product_list,function(p){return p.link==link;});
            if (!existingProds || !existingProds.length) {
                incident_support.product_list.push({
                    title:title,
                    desc:desc,
                    point:point[1] + ' ' + point[0],
                    link:link,
                    keywords:keywords,
                    href:prod,
                    modDate:modDate,
                    pubDate:pubDate
                });
            }

            var existingEvents = _.find(incident_support.timeline_events,function(p){
                return (p.link==prod && p.start==pubDate);});
            if (!existingEvents) {
                incident_support.timeline_events.push({
                    start: pubDate,
                    title: title,
                    className: 'timeline-item-smts',
                    details: desc,
                    point: point[1] + ' ' + point[0],
                    link:link,
                    keywords: keywords,
                    type: 'Product',
                    group: 'SMTS'
                });
            }
        });


    });
    //Add SMTS items to map
    incident_support.products_addToMap();

    //Add SMTS items to Timeline
    incident_support.drawTimeline();

    //Parse the SMTS objects into a table
    incident_support.smts_parser(data);
};
incident_support.smts_error=function(xhr){
    if (xhr.responseXML){
        //Looks like it was the old SMTS format, try it
        incident_support.products_setupSMTS();
        incident_support.products_searching="old_method";
        return;
    }

    console.log("SMTS ERROR: Likely no valid URL entered, or invalid XML returned from server");
};
incident_support.smts_add_categories=function(){
    var url=settings.serverurl_smtsjson_categories;
    if (!url) return false;

    var smts_url = event_pages.proxify(url);
    if (url.indexOf("http://www.yourserver.com") > -1) {
        console.log("-Products Feed location still set to be default server. Skipping");
        return false;
    }
    $.ajax({
        type: "GET",
        url: smts_url,
        dataType: "json"
    })
    .done(incident_support.smts_categories_received)
    .fail(function(){
            console.log("-SMTS Categories Lookup failed");
    });
};
incident_support.smts_categories_pointer=null;
incident_support.smts_categories_exports=null;
incident_support.smts_categories_received=function(results){
    var dropdowns = [];
    _.each(results.nonstdmetadata,function(item){
        var label = item.numoccurrences ? item.label+" - "+(item.numoccurrences||0)+" uses" : "";
        var build = {title:item.label, alt:label};
        build.onclick=function(){
            var category=item.label;
            var newUrl='<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc"><ogc:PropertyName>hasSubjectcoveragecat/DDMS_CATEGORY/LABEL</ogc:PropertyName><ogc:Literal>'+category+'</ogc:Literal></ogc:PropertyIsLike></ogc:Filter>';
            incident_support.smts_holder_build(newUrl);
        };
        dropdowns.push(build);
    });

    var $smts_header=$("#smts_header");

    //Draw/redraw the dropdown
    if (incident_support.smts_categories_pointer) incident_support.smts_categories_pointer.remove();
    incident_support.smts_categories_pointer = Helpers.buildBootstrapDropdown("SMTS Categories",dropdowns);
    $smts_header.append(incident_support.smts_categories_pointer);

};
incident_support.smts_parser=function(data,overideColumns){

    //Add a dropdown of all SMTS categories
    incident_support.smts_add_categories();

    var columnInfo;
    var columnDefs;

    if (overideColumns) {
        columnInfo = [];
        var first = data[0];
        for (var key in first){
            columnInfo.push({sTitle: _.string.capitalize(key), mData:key, sDefaultContent:""})
        }
        columnDefs = [];

    } else {
        columnDefs = [
            { "iDataSort": 1, "aTargets": [ 3 ], "sType":"date-desc" }
        ];

        columnInfo = [
            { sTitle: "Title", mData: "properties.title", sClass: "bold" },
            { sTitle: "Posted", mData: "properties.dateposted", "sClass": "center",
                mRender:function(cellText, type, rowObj){
                    var testDate = moment(cellText);
                    if (testDate && testDate.isValid()) {cellText = testDate.calendar()};
                    return cellText;
                }
            },
            { sTitle: "Edited", "mData": "properties.recorddate", "sClass": "center",
                mRender:function(cellText, type, rowObj){
                    var testDate = moment(cellText);
                    if (testDate && testDate.isValid()) {cellText = testDate.calendar()};
                    return cellText;
                }
            },
            { sTitle: "Creator", "mData": "properties.creator.affiliation", "sDefaultContent":"Unknown", "sClass": "center",
                mRender:function(cellText, type, rowObj){
                    var name="";
                    try{
                        var creator=rowObj.properties.creator[0];
                        name = creator.name + " " + creator.surname + ', '+ creator.affiliation;
                    } catch (ex){}
                    return name || cellText;
                }
            },
            { sTitle: "Class", "mData": "properties.classification", "sClass": "center" },
            { sTitle: "KeyWords", sClass: "hidden", mData:function(row){return row.properties.keywords.join(" , ")}, "sDefaultContent":""}
        ];
    }

    var $table = $('#SMTS_datatable');
    $table.dataTable( {
        "aaData": data,
        "bJQueryUI": true,
        "sProcessing":true,
        "bScrollCollapse": (Helpers.isIOS ? false : true),
        "bScrollInfinite": (Helpers.isIOS ? false : true),
        "sScrollY": (Helpers.isIOS ? null : 318),
        "bStateSave": true,
        "sDom": '<"top"if>rt<"bottom"lp><"clear">',
        "aoColumnDefs": columnDefs,
        "aoColumns": columnInfo
    } );

    if (settings.show_table_exports && typeof TableTools!="undefined" && settings.hasFlash){
        var oTableTools = new TableTools($table, {
            "sSwfPath": event_pages.options.root+"static/datatables.net/copy_csv_xls_pdf.swf"
        } );

        $(oTableTools.dom.container).hide();
        $table.before( oTableTools.dom.container );

        var $holder = $table.parent().parent()
            .find('.DTTT_container')
            .css({display:'none'});


        var headerItems = {title:"Show Exports"};
        headerItems.onclick = function(){
            $holder.toggle();

            oTableTools.fnResizeRequired(true);
            oTableTools.fnResizeButtons();
        };
        if (incident_support.smts_categories_exports) incident_support.smts_categories_exports.remove();
        incident_support.smts_categories_exports = Helpers.buildBootstrapDropdown("Export Data",[headerItems]);

        var $smts_header=$("#smts_header");
        $smts_header.append(incident_support.smts_categories_exports);
    }

    //Set Tooltip data
    $('#SMTS_datatable tbody tr').each( function() {
        var aPos = $table.fnGetPosition( this );
        var aData = $table.fnGetData( aPos );

        if (aData && aData.properties){
            var sTitle = "";
            if (aData.geometry && aData.geometry[1] && aData.geometry[1].coordinates && aData.geometry[1].coordinates[1]) {
                var point = aData.geometry[1].coordinates;
                sTitle+="<p>Zoom to lat: <b>"+point[1]+", long:"+point[0]+"</b></p>";
            }
            if (aData.properties.description) sTitle+="<p>Description: <b>"+aData.properties.description + ".</b></p>";
            if (aData.properties.keywords && aData.properties.keywords.join){
                sTitle+="<p> Tags: <b>"+ aData.properties.keywords.join(", ") +"</b></p>";
            }
            this.setAttribute( 'title', sTitle );
        }
    });

    //Set Click Events
    $table.on('click', 'tr', function(event) {
        var aPos = $table.fnGetPosition( this );
        var aData = $table.fnGetData( aPos );

        if (aData.geometry && aData.geometry[1] && aData.geometry[1].coordinates) {
            var point = aData.geometry[1].coordinates;
            incident_support.setCenter(point[1],point[0])
        }

    }).on('dblclick', 'td', function(event) {
        //$(this).css('background', '#000');
    });


    //Set Tooltop trigger
    $( $table.fnGetNodes() ).popover( {
        "trigger": "hover",
        "placement": "top"
    } );


};
incident_support.setCenter=function(lat,lon,zoom){
    if (lat && lon) {
        var center = new OpenLayers.LonLat(lon,lat);
        if (!zoom) {
            incident_support.map.setCenter(center);
        } else {
            incident_support.map.setCenter(center,zoom);
        }
    }
};