// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

var map;

var triage={};
triage.options={};
triage.defaultOptions={
    flickrKey:'9b5c20623bc99b6549ff846c59899754',
    instagramKey:'c109d4a9d0424677932604fe830499bd',
    patchKey:'3m2she8kpfduk7aeqmjmayrw',
    patchSecret:'p5FvwDpYhf',
    urlLookupGeoMedia: '/geomedia/near/', //NOTE: These should be overridden in options on create
    urlPostGeoMedia: '/api/v1/geomedia/?format=json',
    urlPostIgnoreList: '/api/v1/triage-ignore-lists/?format=json',
    urlGetIgnoreList: '/geomedia/triage/ignore-lists/near/',
    prependResultCount:0,
    flickrRadius:2,
    patchRadius:3,
    twitterRadius:'2km',
    youTubeRadius:'2km',  //TODO: Add date-time bounds to youtube and other APIs
    brickColumnWidth:150,
    resizeEvery:1000,
    requeryEvery:5000,
    widthOfDesc:100
};

triage.socialNetworkingLayer=null;
triage.seenIDs=[];
triage.preloadedSeenIDs=[]; //TODO: Query on startup, and check these as well


triage.init=function(options){
    //For IE support of logging
    if (typeof console=="undefined") console = {};
    if (typeof console.log=="undefined") console.log = {};

    //Set up options
    if (typeof options == "undefined") options = {};
    this.options = $.extend(this.defaultOptions,options);

    //Find the container that should be auto-reconfigured and add the 'masonry' plugin
    var $container = $(".wall");
    //triage.addMasonryStamp();

    $container.imagesLoaded( function(){
        $container.masonry({
            gutterWidth: 15,
            columnWidth: options.brickColumnWidth

        });
        setInterval(triage.resizeWall,triage.options.resizeEvery);
    });

    //Set height of holders:
    var height=$(window).height()-$('.navbar').height()-50;
    $('.wallHolder').css({maxHeight:height});
    //TODO: Set map height to match?
    $('#map_canvas').css({height:height-180});

    //Set up button click events
    $("#btn_ignore_all").click(function(){
        $container.empty()
    });
    $("#btn_ignore_save").click(function(){
        $container.empty();
        triage.saveIgnores();
    });

    //Add URL lookup functions
    $.extend({
        getUrlVars: function(){
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++)
            {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        },
        getUrlVar: function(name){
            return $.getUrlVars()[name];
        }
    });

    if (typeof layer_geocoder!="undefined") {
        layer_geocoder.setupAddressLookup();
    }


};
triage.loadIgnoreLists=function(){

    var lat = map.getCenter().lat;
    var lon = map.getCenter().lon;
    var twURL=triage.options.urlGetIgnoreList+"?lat="+lat+"&lon="+lon;

    $.ajax({
        url:twURL,
        dataType:'json',
        success:triage.parseIgnoreLists
    })
};
triage.parseIgnoreLists=function(res){
    var returnedItems = res.item||[];
    _.each(returnedItems,function(ignores){
        var idList = ignores.id_list;
        if (idList) {
            try{
                if (idList && idList.substr(0,3) == "[u'") {
                    //The idList has a python formatting issue
                    idList =  idList.substr(3,idList.length-5);
//                    idList = idList.replace(/', u'/g,", '");
                    //TODO: This isn't perfect - try to have python return proper list
                    idList = idList.split("', u'");
                } else {
                    idList = JSON.parse(idList);
                }
            }catch(ex){
                console.log("Error parsing the results of a returned ignore list.")
            }
            if (_.isArray(idList)) {
                triage.preloadedSeenIDs =triage.preloadedSeenIDs.concat(idList);
            }
        }
    });

};
triage.resizeWall=function(){
    $('.wall').masonry('reload');
};
triage.loadMap=function(){
    var lon = $.getUrlVar('lat') || (-77.6 + Math.random());
    var lat = $.getUrlVar('lon') || (38.4 + Math.random());
    var zoom = $.getUrlVar('zoom') || 16;
    var tags = $.getUrlVar('tags') || 'hurricane';
    tags = tags.replace(/%20/g," ");
    var tagArr = tags.split(/[\s,]+/);
    tags = _.first(tagArr,4).join(", ");

    var map_options={
        center: new OpenLayers.LonLat(lon, lat),
        numZoomLevels: 25
    };
    map = new OpenLayers.Map( 'map_canvas',map_options);

    var wms = new OpenLayers.Layer.WMS(
        "OpenLayers WMS",
        "http://vmap0.tiles.osgeo.org/wms/vmap0",
        {'layers':'basic'} );
    map.addLayer(wms);

    var newLayer = new OpenLayers.Layer.WMS( "NAIP Imagery",
        "http://raster.nationalmap.gov/ArcGIS/services/Orthoimagery/USGS_EDC_Ortho_NAIP/ImageServer/WMSServer",
        {
            layers: "0",
            transparent: true,
            format: "png"
        },
        {isBaseLayer: false}
    );
    map.addLayer(newLayer);

    var nl2 = new OpenLayers.Layer.WMS( "USNG Cells",
    "http://egeoint.nrlssc.navy.mil/arcgis/services/usng/USNG_93/MapServer/WMSServer",
        {
            layers: "47,49,51,53",
            transparent:true,
            format: "image/png"
        }
    );
    map.addLayer(nl2);

    triage.setEvent = function(activeEvents){
        var event = $.getUrlVar('event') || null;
        $('#events').val(activeEvents[event]);
    }

    triage.socialNetworkingLayer = new OpenLayers.Layer.Vector("Social Networking Items");
//        var select = new OpenLayers.Control.SelectFeature(triage.socialNetworkingLayer);
//        triage.instagramLayer.events.on({
//            "featureselected": onFeatureSelect,
//            "featureunselected": onFeatureUnselect
//        });
//        map.addControl(select);
//        select.activate();
    map.addLayer(triage.socialNetworkingLayer);

    map.zoomTo(zoom);

    $('#search_tags').val(tags);

    var popup;

    function onPopupClose(evt) {
        if (select.unselectAll)
            select.unselectAll();
    }
    function onFeatureSelect(event) {
        var feature = event.feature;
        var layername = event.object ? event.object.name : "-1";

        var content = feature.attributes.desc;

        var popup = new OpenLayers.Popup.FramedCloud("Social Networking Info",
            feature.geometry.getBounds().getCenterLonLat(),
            new OpenLayers.Size(100,100),
            content,
            null, true, onPopupClose);
        feature.popup = popup;
        map.addPopup(popup);
    }
    function onFeatureUnselect(event) {
        var feature = event.feature;
        if(feature.popup) {
            map.removePopup(feature.popup);
            feature.popup.destroy();
            delete feature.popup;
        }
    }

};

triage.loadMapListeners=function(){
    //Run these only once per amount of time
    var lookup = _.throttle(function(){
        triage.linkFunctions.linkInstagram();
//        triage.linkFunctions.linkTwitter();
        triage.linkFunctions.linkFlickr();
        triage.linkFunctions.linkYouTube();
//        triage.linkFunctions.linkGeoMedia();
        triage.linkFunctions.linkFlickrStore();
//        triage.linkFunctions.linkPatchCom();

        if (typeof layer_geocoder!="undefined") {
            if (layer_geocoder.$lookupBox) {
                var lat = map.getCenter().lat;
                var lon = map.getCenter().lon;
                lat = lat.toFixed(7);
                lon = lon.toFixed(7);
                layer_geocoder.$lookupBox.val(lat+", "+lon);
            }
        }


    },triage.options.requeryEvery);

    map.events.register('moveend', map, lookup);
    lookup();
};

triage.addContent=function(items){
    if (!_.isArray(items)) items = [items];
    var widthChars = triage.options.widthOfDesc || 100;

    var boxes = [];
    var mapFeatures = [];
    _.each(items,function(item){
        triage.seenIDs.push(item);

        var dtg = moment(item.date);

        var placeoverText = '';
        if (item.desc) placeoverText+= "<b>Description:</b> "+item.desc;
        if (item.lat && item.lon) placeoverText+='<p class="thumbnail-bottom">This item has an exact geotag.</p>';
        if (dtg.isValid()) placeoverText += "<p style='font-size: 10px'><b>Posted:</b> "+dtg.calendar()+"</p>";


        var box = document.createElement('div');
        var $box=$(box)
            .addClass('brick thumbnail')
            .popover({
                title:'Click to mark this item as possibly useful',
                content:placeoverText,
                trigger:'hover',
                placement:'left'
            })
            .attr('id',item.id);
        if (item.lat && item.lon){
            $box.addClass('geotagged');
        }

        if (item.img) $('<img>')
            .attr('src',item.img)
            .appendTo($box);

        if (item.link) $('<a>')
            .text('[Open]')
            .attr('title','Open in new tab')
            .attr('href',item.link)
            .attr('target','_new')
            .appendTo($box);

        $('<a>')
            .addClass('itemIgnore')
            .text(' [Ignore]')
            .click(function(e){
                e.preventDefault();
                $(this).parent().remove();
                $('.popover').remove();
            })
            .appendTo($box);

        if (item.desc) {
            var shortName = linkify(item.desc);
            if (shortName.length >= widthChars) {
                shortName = shortName.substr(0,widthChars-2)+"...";
            }
            $('<div>')
                .addClass('description')
                .html(shortName)
                .appendTo($box);
        }

        if (item.date && dtg.isValid()) $('<div>')
            .addClass('description dtg')
            .text(dtg.fromNow())
            .appendTo($box);

        if (item.source) {
            var sourceClass = 'sources muted taggedby '+item.source.toLowerCase();
            $('<div>')
                .addClass(sourceClass)
                .text(item.source)
                .appendTo($box);
        }

        boxes.push(box);

        if (item.lat && item.lon){
            var point = new OpenLayers.Geometry.Point(item.lon,item.lat);
            var vector =new OpenLayers.Feature.Vector(point);
            vector.style = {
                strokeColor: 'orange', //TODO: Lookup by type
                strokeWidth:'1.5',
                strokeOpacity:0.7,
                fillColor: "#ff0",
                fillOpacity: 0.8,
                pointRadius: 7,
                rotation: 0,
                visible: true
            };
            vector.attributes = item;

            mapFeatures.push(vector);
        }
    });

    var numUpFront = triage.options.prependResultCount;
    var firstBoxes = _.first(boxes,numUpFront);
    var restBoxes = _.rest(boxes,numUpFront);

    var $container = $(".wall");
    $container.imagesLoaded( function(){
        var $boxes;
        if (firstBoxes.length){
            $boxes = $(firstBoxes);
            $container.prepend( $boxes ).masonry( 'reload' );
        }
        if (restBoxes.length){
            $boxes = $(restBoxes);
            $container.append( $boxes ).masonry( 'appended', $boxes );
        }

        $(".brick")
            .unbind('click')
            .bind('click',function(){
                var $this = $(this)[0];
                var item = triage.cacheSeen($this.id);

                if (item){

                    var name = item.name || 'Submitted by Triage web app';

                    var toSend = {
                        accepted:new Date(),
                        attribution:item.attribution,
                        created:item.date,
                        description:item.desc,
                        external_id:item.id,
                        external_owner:item.owner,
                        external_url:item.link,
                        uncertainty_in_km:item.uncertainty_in_km,
                        event: $('#events').val() || null,
                        //id
                        latitude:item.lat || item.latRequest || map.getCenter().lat,
                        longitude:item.lon || item.lonRequest || map.getCenter().lon,
                        name:name,
                        //point
                        //resource_uri
                        source:item.attribution,
    //TODO: Add                    tags:item.tags,
                        type_of_media:item.source,
                        url:item.img
                    };
                    toSend =  JSON.stringify(toSend);

                    $.ajax({
                        type:'post',
                        url:triage.options.urlPostGeoMedia,
                        contentType:'application/json',
                        dataType:'json',
                        data:toSend
                    });
                    console.log("Sent an item to server as item of interest: "+$this.id);

                    $('.popover').remove();
                    this.parentNode.removeChild(this);
                }
            });

    });

    if (mapFeatures && mapFeatures.length){
        triage.socialNetworkingLayer.addFeatures(mapFeatures);
    }

};
triage.cacheSeen=function(id){
    var allIDs = triage.seenIDs.concat(triage.preloadedSeenIDs);
    return _.find(allIDs,function(s){return s.id==id});
};
triage.saveIgnores=function(){
    var ignores = _.pluck(triage.seenIDs,'id');
    ignores = JSON.stringify(ignores);

    var center = map.getCenter();

    var toSend = {
        submitted:new Date(),
        latitude:center.lat,
        longitude:center.lon,
        id_list:ignores,
        event: $('#events').val() || null,
    };
    toSend =  JSON.stringify(toSend);

    $.ajax({
        type:'post',
        url:triage.options.urlPostIgnoreList,
        contentType:'application/json',
        dataType:'json',
        data:toSend
    });
    console.log("Send list of "+ignores.length+" to server to be ignored for other users.");

};
//triage.addMasonryStamp=function(){
//    // Masonry corner stamp modifications
//    $.Mason.prototype.resize = function() {
//        this._getColumns();
//        this._reLayout();
//    };
//
//    $.Mason.prototype._reLayout = function( callback ) {
//        var freeCols = this.cols;
//        if ( this.options.cornerStampSelector ) {
//            var $cornerStamp = this.element.find( this.options.cornerStampSelector ),
//                cornerStampX = $cornerStamp.offset().left -
//                    ( this.element.offset().left + this.offset.x + parseInt($cornerStamp.css('marginLeft')) );
//            freeCols = Math.floor( cornerStampX / this.columnWidth );
//        }
//        // reset columns
//        var i = this.cols;
//        this.colYs = [];
//        while (i--) {
//            this.colYs.push( this.offset.y );
//        }
//
//        for ( i = freeCols; i < this.cols; i++ ) {
//            this.colYs[i] = this.offset.y + $cornerStamp.outerHeight(true);
//        }
//
//        // apply layout logic to all bricks
//        this.layout( this.$bricks, callback );
//    };
//
//
//};


//--------------------------
triage.linkFunctions = {};
triage.linkFunctions.linkInstagram=function(){
    $(".wall").instagram({
        successFunction: triage.resultFunctions.instagram,
        search: {
            lat: map.getCenter().lat,
            lng: map.getCenter().lon
        },
        clientId: triage.options.instagramKey
    });
};
triage.linkFunctions.linkYouTube=function(){
    //https://gdata.youtube.com/feeds/api/videos?q=football+-soccer&orderby=published&v=2&location=37.42307,-122.08427&location-radius=100km&alt=json
    var searchTerm=$('#search_tags').val() || "hurricane";
    searchTerm = encodeURIComponent(searchTerm);
    var twURL="https://gdata.youtube.com/feeds/api/videos?q="+searchTerm+"&orderby=published&v=2&location=";
    var twURLend = "&location-radius="+triage.options.youTubeRadius+"&alt=json";
    var lat = map.getCenter().lat;
    var lon = map.getCenter().lon;
    twURL+=lat+","+lon+twURLend;

    $.ajax({
        url:twURL,
        dataType:'jsonp',
        success:triage.resultFunctions.youtube
    })

};
triage.linkFunctions.linkTwitter=function(){
//    https://search.twitter.com/search.json?q=hurricane%20geocode:37.781157,-122.398720,25mi&callback=twitterGeoCallback
    var searchTerm=$('#search_tags').val() || "hurricane";
    searchTerm = encodeURIComponent(searchTerm);
    var twURL="https://search.twitter.com/search.json?q="+searchTerm+"%20geocode:";
    var twURLend = ","+triage.options.twitterRadius;
    var lat = map.getCenter().lat;
    var lon = map.getCenter().lon;
    twURL+=lat+","+lon+twURLend;

    $.ajax({
        url:twURL,
        dataType:'jsonp',
        success:triage.resultFunctions.twitter
    })

};
triage.linkFunctions.linkFlickr=function(){
//http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=51bdafd67b229d5d327ec8017456b3a9&lat=38.89&lon=-77&text=hurricane&license=1%2C2%2C3%2C4%2C5%2C6%2C7&has_geo=true&format=json&jsoncallback=?
    var searchTerm=$('#search_tags').val() || "";
    searchTerm = encodeURIComponent(searchTerm);
    var twURL="http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+triage.options.flickrKey+"&";
    var twURLend = "&license=1%2C2%2C3%2C4%2C5%2C6%2C7&has_geo=true&geo_context=0%2C2&format=json&callback=?";
    var lat = map.getCenter().lat;
    var lon = map.getCenter().lon;
    twURL+="lat="+lat+"&lon="+lon+"&text="+searchTerm+twURLend;

    $.ajax({
        url:twURL,
        dataType:'jsonp',
        success:triage.resultFunctions.flickr
    })

};
triage.linkFunctions.linkGeoMedia=function(){
//    '/geomedia/?lat=-77.46056&long=37.55361'

    var lat = map.getCenter().lat;
    var lon = map.getCenter().lon;
    var twURL=triage.options.urlLookupGeoMedia+"?lat="+lat+"&lon="+lon;

    $.ajax({
        url:twURL,
        dataType:'json',
        success:triage.resultFunctions.geoMedia
    })


};
triage.linkFunctions.linkFlickrStore=function(){};

triage.linkFunctions.linkPatchCom=function(){
    function sign() {
        var hm = triage.options.patchKey + triage.options.patchSecret + (Math.round(new Date().getTime() / 1000).toString());
        var sig = $.md5(hm);
        return "?dev_key=" + triage.options.patchKey + "&sig=" + sig;
    }

    var lat = map.getCenter().lat;
    var lon = map.getCenter().lon;
    var twURL = 'http://news-api.patch.com/v1.1/nearby/'+lat+','+lon+'/stories'+sign();

    $.ajax({
        url:twURL,
        dataType:'jsonp',
        success:triage.resultFunctions.patch,
        statusCode:{
            503:function(){console.log("Error getting Patch.com code working.")}
        },
        error:function(){
            console.log("Patch service had error, likely from server going down.")
        }
    })

};


//--------------------------
triage.resultFunctions = {};
triage.resultFunctions.youtube = function (res) {

    var source="YouTube";
    var items = [];
    var unseenNum=0;

    var returnedItems = (res && res.feed && res.feed.entry) ? res.feed.entry : [];
    var uncert = parseInt(triage.options.youTubeRadius);

    _.each(returnedItems,function(resource){
        if (!triage.cacheSeen(resource.id.$t)){
            var item = {
                id:resource.id.$t,
                source:source,
                link:resource.content.src,
                desc:resource.title.$t,
                alt:source,
                uncertainty_in_km:uncert,
                name:resource.title.$t,
                date:resource.published.$t,
//                    tags:resource.tags,
                latRequest: map.getCenter().lat,
                lonRequest: map.getCenter().lon
            };
            if (resource.media$group.media$thumbnail && resource.media$group.media$thumbnail.length){
                item.img = resource.media$group.media$thumbnail[0].url;
            }

            items.push(item);
        } else {
            unseenNum++;
        }
    });

    triage.addContent(items);
    console.log(source+" repeat images: "+unseenNum+ " out of "+returnedItems.length);
};
triage.resultFunctions.flickr = jsonFlickrApi = function (res) {

    var source = "Flickr";
    if (res.stat && res.stat=="fail"){
        console.log(source+" response failed, message: "+res.message);
    }

    var items = [];
    var unseenNum=0;
    var returnedItems = res.photos ? res.photos.photo : [];
    var uncert = parseInt(triage.options.flickrRadius);

    _.each(returnedItems, function(datas){
        if (!triage.cacheSeen(datas.id)){
            var id=datas.id;
            var title=datas.title;
            var secret=datas.secret;
            var server=datas.server;
            var farm=datas.farm;
            var owner=datas.owner;
            var base=id+'_'+secret+'_s.jpg';
            var major=id+'_'+secret+'_z.jpg';
            var url= 'http://farm'+farm+'.static.flickr.com/'+server+'/'+major;
            var img='http://farm'+farm+'.static.flickr.com/'+server+'/'+base;
//                var html='<img class="fimg" src="'+img+'" mce_src="'+img+'" />';
//                var urlz='http://www.flickr.com/photos/'+owner+'/'+id;
//                var ttlink='<a href="'+urlz+'" mce_href="'+urlz+'" target="_blank">'+html+'</a>';   //var link='<a rel="flickr" title="'+ttlink+'" href="'+url+'" mce_href="'+url+'">'+html+'</a>';

            var item = {
                id:datas.id,
                img:img,
                name:title,
                owner:owner,
                source: source,
                link:url,
                uncertainty_in_km:uncert,
                alt:source,
//                    date:datas.created_time,
//                    tags:resource.tags,
                latRequest: map.getCenter().lat,
                lonRequest: map.getCenter().lon
            };

            items.push(item);
        } else {
            unseenNum++;
        }
    });

    triage.addContent(items);
    console.log(source+" repeat images: "+unseenNum+ " out of "+returnedItems.length);


};
triage.resultFunctions.twitter = function (res) {

    var source="Twitter";
    var items = [];
    var unseenNum=0;

    var returnedItems = res.results || [];
    var uncert = parseInt(triage.options.twitterRadius);
    _.each(returnedItems,function(tweet){
        if (!triage.cacheSeen(tweet.id)){

            var lat = tweet.geo? tweet.geo.latitude: undefined;
            var lon = tweet.geo? tweet.geo.longitude: undefined;

            var item = {
                id:tweet.id,
                //img:'',
                source: source,
                link:'http://twitter.com/'+tweet.from_user,
                alt:source,
                name:tweet.id,
                //tags:tweet.tags,
                lat:lat,
                lon:lon,
                uncertainty_in_km:uncert,
                latRequest:map.getCenter().lat,
                lonRequest:map.getCenter().lon,
                date:tweet.created_at,
                desc:tweet.text
            };
            items.push(item);
        } else {
            unseenNum++;
        }
    });

    triage.addContent(items);
    console.log(source+" repeat images: "+unseenNum+ " out of "+returnedItems.length);

};
triage.resultFunctions.instagram = function (res) {

    var source = "Instagram";
    var length = typeof res.data != 'undefined' ? res.data.length : 0;
    var settings = {
        image_size: 'thumbnail'
    };

    var items = [];
    var unseenNum=0;

    var returnedItems = res.data||[];
    _.each(returnedItems,function(resource){
        if (!triage.cacheSeen(resource.id)){
            var item = {
                id:resource.id,
                img:resource.images.thumbnail.url,
                source: source,
                attribution: resource.attribution,
                link:resource.link,
                name:resource.link,
                uncertainty_in_km:0,
                alt:source,
                date:resource.created_time,
                tags:resource.tags,
                lat:resource.location.latitude,
                lon:resource.location.longitude
            };
            if (settings.image_size == 'low_resolution') {
                item.img = resource.images.low_resolution.url;
            } else if (settings.image_size == 'thumbnail') {
                item.img = resource.images.thumbnail.url;
            } else if (settings.image_size == 'standard_resolution') {
                item.img = resource.images.standard_resolution.url;
            }
            if (resource.caption && resource.caption.text){
                item.desc = resource.caption.text;
            }

            items.push(item);
        } else {
            unseenNum++;
        }
    });
    triage.addContent(items);
    console.log(source+" repeat images: "+unseenNum+ " out of "+returnedItems.length);

};
triage.resultFunctions.geoMedia = function (res) {

    var source = "GeoMedia";
    var items = [];
    var unseenNum=0;

    var returnedItems = res.item || [];
    _.each(returnedItems,function(item){
        if (!triage.cacheSeen(item.external_id)){
            var r3item = {
                id:item.external_id,
                img:item.url,
                source: source,
//                link:'http://twitter.com/'+tweet.from_user,
                alt:source,
                tags:item.tags,
                uncertainty_in_km:item.uncertainty_in_km||0,
                lat:item.latitude,
                lon:item.longitude,
                date:item.created,
                desc:item.description
            };
            items.push(r3item);
        } else {
            unseenNum++;
        }
    });

    triage.addContent(items);
    console.log(source+" repeat images: "+unseenNum+ " out of "+returnedItems.length);

};

triage.resultFunctions.patch = function (res) {

    var source = "Patch";
    var items = [];
    var unseenNum=0;
    var uncert = parseInt(triage.options.patchRadius);

    var returnedItems = res.item || [];
    _.each(returnedItems,function(item){
        if (!triage.cacheSeen(item.external_id)){
            var additem = {
                id:item.external_id,
                img:item.url,
                source: source,
//                link:'http://twitter.com/'+tweet.from_user,
                alt:source,
                tags:item.tags,
                uncertainty_in_km:uncert,
                lat:item.latitude,
                lon:item.longitude,
                date:item.created,
                desc:item.description
            };
            items.push(additem);
        } else {
            unseenNum++;
        }
    });

    triage.addContent(items);
    console.log(source+" repeat images: "+unseenNum+ " out of "+returnedItems.length);

};