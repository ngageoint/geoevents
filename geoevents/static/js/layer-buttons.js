// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

//Note: Uses jQuery and Twitter Bootstrap
//
var layer_buttons={};

layer_buttons.options={};
layer_buttons.lookupArray=[];
layer_buttons.defaultOptions={
    iconWidth: '44px',
    iconFontSize: '.8em',
    leftOrRight: 'right',
    topOrBottom: 'top',
    iconTop: 11,
    iconSpace: '12px',
    iconOpacity: '.8',
    spacingLessInSameGroup:3,
    btnClass:'',
    imgSize: 24,
    zIndex: 1025,
    stopBubble: true,
    numberOfButtonsSoFar:{left:0,right:0},
    lastIconTop:{left:0,right:0},
    spacingPerButton:32,
    iconText: '',
    iconDivID: null,
    clickFunction: function(){
        window.print();
    },
    createOnlyIf: function(){
        return true;
    },
    buttonCount:0,

    lastGroup:'' //TODO: Handle this better, for now all groups have to be in proper order when called in

};
layer_buttons.addButtonToMap=layer_buttons.addButtonToDiv=function(mapDiv,options){
    options = $.extend(layer_buttons.defaultOptions,options);
    options.buttonCount++;

    var createOnlyIf = options.createOnlyIf;
    if (!createOnlyIf()){
        return;
    }

//    var buttonsSoFar = options.numberOfButtonsSoFar[options.leftOrRight] || 0;
    var vertSpacing = options.lastIconTop[options.leftOrRight] || options.top || options.iconTop;
    vertSpacing+= options.spacingPerButton;
    if (options.group && options.group==options.lastGroup){
        options.lastGroupCount++;
        vertSpacing-=options.spacingLessInSameGroup;
    }
    options.lastIconTop[options.leftOrRight] = vertSpacing;

    var cssOptions = {position:'absolute',opacity:options.iconOpacity,
        width:options.iconWidth,zIndex:options.zIndex,fontSize:options.iconFontSize};
    if (options.iconHeight) cssOptions.height=options.iconHeight;

    if (options.topOrBottom=='top') {
        cssOptions.top = vertSpacing;
    } else {
        cssOptions.bottom = vertSpacing;
    }
    if (options.leftOrRight=='right') {
        cssOptions.right = options.iconSpace;
    } else {
        cssOptions.left = options.iconSpace;
    }
    if (options.color) {
        cssOptions.borderColor = options.color;
    }

    var btnID = (options.iconText && options.iconText.length) ? _.string.camelize(options.iconText) : options.buttonCount;
    var divID = options.iconDivID || 'layer_button_'+ btnID;

    //TODO: Add hover function
    //TODO: Add toggle? and togglegroup?

    layer_buttons.lookupArray.push({id:divID, options:_.clone(options)});
    var clickFunction = options.clickFunction;
    var $button = $("<div>")
        .html(options.iconText)
        .attr('id',divID)
        .attr('role','button')
        .addClass('btn')
        .css(cssOptions)
        .bind('click touchend',function(event){
            event = event || window.event;
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble=true;

            var divID = event.currentTarget.id;
            var thisoptions = _.find(layer_buttons.lookupArray,function(o){return o.id==divID});
            if (thisoptions && thisoptions.options) thisoptions=thisoptions.options;

            clickFunction(event,thisoptions);
        })
        .appendTo(mapDiv);
    jQuery.data( $button, 'options', options );

    if (options.btnClass) $button.addClass(options.btnClass);
    if (options.description) {
        $button.popover({
            title:options.popoverTitle || options.title,
            content:options.description,
            trigger:'hover'
        });
    }
    if (options.icon) {
        $('<i class="icon-'+options.icon+'"></i>')
            .appendTo($button);
    }

    layer_buttons.defaultOptions.numberOfButtonsSoFar[options.leftOrRight]++;
    options.lastGroup=options.group;
};
