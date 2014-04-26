// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

var layer_categories={};
layer_categories.tabCount = 0;

layer_categories.init=function(){
    if (typeof settings=='undefined' || !settings.use_category_tabs || settings.use_categories_tabs=="false") {
        return false;
    }
    if (typeof layerHandler=='undefined' || !layerHandler.defaultLayerList){
        console.log("layerHandler.defaultLayerList isn't loaded, not showing map tabs.");
        return false;
    }
    if (typeof _=='undefined' ){
        console.log("Underscore.js isn't loaded");
    }

    //Drawing options
    var options = {};
    //Pass these in
    var zIndex = 800; //$(".navbar").css('z-index');
    if (zIndex) options.zIndex = parseInt(zIndex)-1;
    options.divOfMap = $('.olMapViewport')[0];
    options.leftPad = 100;
    options.rightPad = 10;
    options.buffer = 11;
    options.mapWidthStart = $(options.divOfMap).width();
    options.mapWidth = options.mapWidthStart - (options.leftPad+options.rightPad + 2*options.buffer);
    options.bottom = 10;
    options.width = (options.mapWidth / (layerHandler.defaultLayerList.length+1))-(3*options.buffer);
    if (options.width < 40) options.width = 40;
    options.fontSize = '12px';

    var tabList = [{category:'None'}].concat(layerHandler.defaultLayerList);
    _.each(tabList,function(category){
        layer_categories.addATab(category,options);
    });


};
layer_categories.addATab=function(category,options){
    options = options||{};
    category = category||{};


    var title = category.category || "Layers";
    if (title.length>9) title = title.substr(0,9);
    var id = category.id || "layer_button_"+ layer_categories.tabCount;

    var left = options.leftPad +(layer_categories.tabCount * (options.width+(3*options.buffer)));
    layer_categories.tabCount++;

    $("<div>")
        .html(title)
        .attr('id',id)
        .attr('role','button')
        .addClass('btn')
        .addClass('btn-info')
        .css({position:'absolute',bottom:options.bottom,left:left,width:options.width,
            zIndex:options.zIndex,fontSize:options.fontSize})
        .bind('click touchend',function(event){
            layer_categories.showOnlyCategories(category.category);

            event = event || window.event;
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble=true;

        })
        .appendTo(options.divOfMap);

};
layer_categories.showOnlyCategories=function(catName){
    layer_categories.hideAllLayers();
    console.log(catName);

    var map = dashboard_support.map;
    var targetCat = _.filter(layerHandler.defaultLayerList,function(l){return l.category==catName})
    if (targetCat && targetCat.length) targetCat=targetCat[0];
    _.each(targetCat.layers,function(layer){
        layer.transparent = true;
        var layerInfo = layerHandler.mapServiceJSONtoLayer([layer]);
        if (layerInfo && layerInfo.length) {
            layerInfo = layerInfo[0];

            var layerOnMap = map.getLayersByName(layerInfo.name);
            if (layerOnMap && layerOnMap.length) {
                layerOnMap = layerOnMap[0];
                if (layerOnMap.visibility) {
                    layerOnMap.setVisibility(false);
                } else {
                    layerOnMap.setVisibility(true);
                }
            } else {
                //No layer yet, add to map and show
                map.addLayer(layerInfo);
                layerInfo.setVisibility(true);
            }
        }
    });
};
layer_categories.hideAllLayers=function(){
    var map = dashboard_support.map;
    _.each(map.layers,function(layer){
        if (!layer.isBaseLayer) {
            layer.setVisibility(0);
        }
    });
};