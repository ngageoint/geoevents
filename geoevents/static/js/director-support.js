// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

//Uses jQuery, Underscore.js, and moment.js
var director_support={};


//==================================================

director_support.init=function(){
    if (typeof console=="undefined") console = {};
    if (typeof console.log=="undefined") console.log = {};

    //TODO: Need a better way to manage layer css within IE
    if ($ && $.browser && $.browser.msie){
        $('.span12').css('margin-left','0px');
        $('.span9').css('margin-left','0px');
    }

    director_support.hasFlash = false;
    try {
        var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if(fo) director_support.hasFlash = true;
    }catch(e){
        if(navigator.mimeTypes ["application/x-shockwave-flash"] != undefined) {
            director_support.hasFlash = true;
        }
    }

};
director_support.buildWidgetLookups=function(dashboard_widgets){
    director_support.widgets={};
    _.each(dashboard_widgets,function(widget,i){
        director_support.widgets[_.str.dasherize(widget.name)] = widget;
        director_support.widgets[_.str.dasherize(widget.name)].numberDrawn = i;
    });
};
director_support.lookupWidget=function(widgetName){
  return  director_support.widgets[_.str.dasherize(widgetName)];
};
director_support.parseNotesAndJSON=function(dashboard_widgets){
    _.each(dashboard_widgets,function(widget){
//        if (_.isString(widget.notes)){
//            try {
//                var note_data = JSON.parse(widget.notes);
//                if (note_data) widget.notes = note_data;
//                _.each(note_data,function(note,i){
//                    note = JSON.parse(note);
//                    if(note.fields) {
//                        widget.notes[i] = note.fields;
//                    }
//                });
//            } catch (ex){
//                console.log("Problem parsing a note from widget "+widget.id);
//            }
//        }
        try {
            if (widget.data_json && widget.data_json.length) {
                var data_json = JSON.parse(widget.data_json);
                if (data_json) widget.data_json = data_json;
            } else {
                widget.data_json = {};
            }
            if (widget.data_json_org && widget.data_json_org.length) {
                var data_json_org = JSON.parse(widget.data_json_org);
                if (data_json_org) widget.data_json_org = data_json_org;
            } else {
                widget.data_json_org = {};
            }
            //TODO: Capture user-specific data, and add this in as well
            widget.data= $.extend(widget.data_json,widget.data_json_org);

        } catch (ex){
            console.log("Problem parsing a data_json from widget "+widget.id);
        }
    });
    _.sortBy(dashboard_widgets,function(widget){return widget.order;});
    director_support.buildWidgetLookups(dashboard_widgets);
};
director_support.updateTitle=function(title){
    $(".brand").text(title);
    document.title = title;
    //TODO: Change page title? and other brands?
    //TODO: Use site icon and size it properly
};
director_support.widgetDivName=function(widget,numberDrawn,contentOrHead){
    //Use: 'parent', 'header', 'content'
    var name = widget.name.replace(/[^a-zA-Z0-9 ]/g, "");
    var divName = _.str.dasherize(name) + '_'+numberDrawn;
    return 'widget_'+contentOrHead+'_'+divName;
};
director_support.widgetContentHeight=function(widget){
    var subTextHeight =(widget.subtext)?20:0;
    var titleHeight=(widget.name && widget.theme!='Headless')?46:0;
    return widget.height-titleHeight-subTextHeight;
};
//-------------------------------------------------
director_support.plugins={};
director_support.plugins.projectsColorCoded=function(widget,numberDrawn,$content){
    var output = "";
    if (!widget.data) return;

    _.each(widget.data.projects,function(por){
        output+="<b>"+por.program+"</b>: ";
        output+="<span style='color:"+por.status+"'>"+por.status+"</span> - ";
        output+="<b>"+por.trend+"</b>";
        if (por.notes){
            output+=" - <i>"+por.notes+"</i>";
        }
        output+="<br/>";
    });

    $content.html(output);

};
director_support.plugins.notesAndChildNotes=function(widget,numberDrawn,$content){
    //TODO: Test:
    $content.html(widget.name);
};
director_support.plugins.timelineAON=function(widget,numberDrawn,$content){
    //TODO: Test:
    $content.html(widget.name);
};