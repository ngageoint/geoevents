// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

var layer_iatools = layer_iatools || {};

//TODO: Make as new layer, maybe an option
//TODO: Select the last layer chosen
//TODO: Cache on the backend
//TODO: Give some UI that this might take awhile

//TODO: Emails not null - causing error
//TODO: Add those to Geoque

layer_iatools.layerSettings = [];
layer_iatools.nudgeAmount = 0.15;
layer_iatools.selectedLayer = {};
layer_iatools.valButtons =[];

layer_iatools.init=function(){
    layer_iatools.createIAToolBoxes();
};

//---------------------------------------
layer_iatools.redrawLayer=function(){

    var layer = layer_iatools.selectedLayer;
    var layerName = layer.name || 'default';

    layer_iatools.layerSettings[layerName] = layer_iatools.layerSettings[layerName] || {};
    var settingsVals = layer_iatools.layerSettings[layerName];

    var urlArray = [];
    for (var setting in settingsVals){
        var val = settingsVals[setting];
        if (val!=1){
            if (_.isNumber(val)) val = val.toFixed(2);
            urlArray.push(setting+':'+val);
        }
    }
    var urlString = urlArray.join(',');

    var urlLayer = layer.baseURL || layer.url;
    var pageRoot = event_pages.options.root;
    var url = pageRoot + "/imageproxy/" + urlString + "/" + urlLayer;

    layer.url = url;
    if (layer.redraw) layer.redraw();

};
layer_iatools.createIAToolBoxes=function(){
    var $holder = $('#map_layer_ia_tools');
    var anyLayersEditable = false;

    var layerList = incident_support.map.layers; //TODO: Abstract this

    //Build the layer list button
    var $layerList = $('<a class="btn btn-mini dropdown-toggle btn-primary" data-toggle="dropdown">Layers<span class="caret"></span></a>')
        .appendTo($holder);
    var firstShown = false;
    var $divLayerChooser = $('<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu">');
    _.each(layerList,function(layer){
        var layerInfo = layerHandler.layerInfo(layer.name);
        if (layerInfo && layerInfo.allow_image_modifications && (layer.type=='wms'||layer.type=='wmts'||layer.type=='arcgis93rest') ){
            anyLayersEditable = true;
            layer.baseURL = layer.url;
            var name = layer.name;
            var $layer = $('<li><a tabindex="-1">'+name+'</a></li>');
            $layer.on('click',function(){
                layer_iatools.selectedLayer = layer;
                $layerList.html(name+'<span class="caret"></span>');
                layer_iatools.drawLayerSetting();
            });
            $layer.appendTo($divLayerChooser);
            if (!firstShown){
                layer_iatools.selectedLayer = layer;
                $layerList.html(name+'<span class="caret"></span>');
                layer_iatools.drawLayerSetting();
                firstShown=true;
            }
        }
    });
    $divLayerChooser.appendTo($holder);

    if (!anyLayersEditable) {
        //There are no editable layers, hide all IA tools
        $('#map_layer_ia_tools').hide();
        $('#ia_tools_toggle').parent().hide();
        return;
    }


    //Build all of the layer IA controls
    var standardControls = ['Brightness','Sharpness','Contrast','Saturation'];
    var settingOptions = [200,180,160,140,120,100,80,60,40,20];
    _.each(standardControls,function(control){

        var $divGroup = $('<div>')
            .css({'display':'inline-block'})
            .addClass('btn-group'); //Needed?

        var $controlBtn = $('<a class="btn btn-mini dropdown-toggle" data-toggle="dropdown">'+control+' (100%)<span class="caret"></span></a>')
            .data('controlName',control)
            .appendTo($divGroup);
        var $divLayerControlChooser = $('<ul class="dropdown-menu pull-right" role="menu" aria-labelledby="dropdownMenu">')
            .appendTo($divGroup);
        _.each(settingOptions,function(value){
            var $controlVal = $('<li><a tabindex="-1">'+value+'%</a></li>')
                .appendTo($divLayerControlChooser);
            $controlVal.on('click',function(){
                layer_iatools.editLayerSetting(control,value,$controlBtn);
            });
        });
        layer_iatools.valButtons.push($controlBtn);
        $divGroup.appendTo($holder);

    });

    //Build Opacity Slider
    var startingOpacity=75;
    if (layer_iatools.selectedLayer) {
        if (layer_iatools.selectedLayer.getOpacity){
            startingOpacity=parseInt(layer_iatools.selectedLayer.getOpacity()*100);
        }
    }
    var $opSlider = $('<input type="text" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="'+startingOpacity+'">')
        .attr('id','ia-opacity-slider')
        .css('width','80px')
        .on('slide',function(e){
            var layer = layer_iatools.selectedLayer;
            var val = e.value;
            layer.setOpacity(val/100);
        }).appendTo($holder);

    $opSlider.slider({
        formater: function(value) {
            return 'Layer Opacity: '+value+'%';
        }
    });

    layer_iatools.drawLayerSetting();
    layer_iatools.setupPageAddins();

};
layer_iatools.editLayerSetting=function(control,value,$parentButton){

    var layer = layer_iatools.selectedLayer;
    var layerName = layer.name || 'default';

    layer_iatools.layerSettings[layerName] = layer_iatools.layerSettings[layerName] || {};
    layer_iatools.layerSettings[layerName][control] = layer_iatools.layerSettings[layerName][control] || 1;
    if (value == 'reset') {
        layer_iatools.layerSettings[layerName][control] = 1;
    } else {
        layer_iatools.layerSettings[layerName][control] = value/100;
    }
    var val = parseInt(layer_iatools.layerSettings[layerName][control].toFixed(2)*100);
    $parentButton.html(control+' ('+val+'%)<span class="caret"></span>');

    layer_iatools.redrawLayer();
};
layer_iatools.drawLayerSetting=function(){
    var layer = layer_iatools.selectedLayer;
    var layerName = layer.name || 'default';

    var settingsVals = layer_iatools.layerSettings[layerName] = layer_iatools.layerSettings[layerName] || {};

    _.each(layer_iatools.valButtons,function($btn){
        var wasSet = false;
        var btnName = $btn.data('controlName') || "Setting";

        for (var setting in settingsVals){
            if (setting.toLowerCase() == btnName.toLowerCase()){
                var val = settingsVals[setting];
                if (_.isNumber(val)) val = parseInt(val.toFixed(2)*100);
                $btn.html(setting + ' ('+val+'%)<span class="caret"></span>');
                wasSet = true;
            }
        }

        if (!wasSet){
            var setting = $btn.data('controlName');
            $btn.html(setting + ' (100%)<span class="caret"></span>');
        }

    });

};

layer_iatools.setupPageAddins=function(){
    $("#ia_tools_toggle").parent()
        .on("click press touch",function(){
            layer_iatools.toggleIAToolBoxes();
        })
        .popover({
            title:'Beta - Show Imagery Toolbar',
            content:'Toggle whether imagery editing tools are shown. When you change a layer settings, it will replace the layer with a new modified one.',
            trigger:'hover',
            placement:'top'
        });
//
};
layer_iatools.toggleIAToolBoxes=function(){
    $('#map_layer_ia_tools')
        .toggle();
};
