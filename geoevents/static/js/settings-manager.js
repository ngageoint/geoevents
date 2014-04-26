// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

var settings_manager = {};

settings_manager.itemListStyle={fontSize:'12px',fontWeight:'bold'};
settings_manager.itemStyle={textAlign:'right',fontWeight:'normal',backgroundColor:'#ddd'};

settings_manager.init=function(){

};

settings_manager.addSettingsGUIToDiv=function(settingsObj,$div){
    if (!settingsObj || !settingsObj.fields || !settingsObj.fields.length || !settingsObj.fields[0].obj || !$div) {
        console.log("Need to pass in an settingsObj with {fields:[{obj:[]}} and a div it should be added to");
        return false;
    }

    _.each(settingsObj.fields,function(setting){
        var name = setting.name || "Setting";
        var $settingDiv = $('<div>')
            .html(name+":")
            .css(settings_manager.itemListStyle)
            .appendTo($div);
        var obj = settings_manager.constructObject(setting.obj);
        var $settingsControl = $('<div>')
            .css(settings_manager.itemStyle);

        if (setting.type=='boolean'){
            var fieldname = setting.obj.join('__');
            $('<span>').html('<b>Yes: </b>')
                .appendTo($settingsControl);
            $('<input>')
                .attr({type:'radio',name:fieldname,value:'true',checked:obj})
                .on('change',function(control){
                    var newVal = (control.currentTarget.value=='true');
                    settings_manager.setObject(setting.obj,newVal)
                })
                .appendTo($settingsControl);
            $('<span>').html('<b> No: </b>')
                .appendTo($settingsControl);
            $('<input>')
                .attr({type:'radio',name:fieldname,value:'false',checked:!obj})
                .on('change',function(control){
                    var newVal = (control.currentTarget.value=='true');
                    settings_manager.setObject(setting.obj,newVal)
                })
                .appendTo($settingsControl);

        } else if (setting.type=='multi-list'){

        } else if (setting.type=='text'){

        }

        $settingsControl.appendTo($settingDiv);
    });

    return true;
};

settings_manager.constructObject=function(obj){
    var objToCheck = window; //TODO: If moving to Node.JS, use the other root
    _.each(obj,function(objLayer){
        if (typeof objToCheck[objLayer]!="undefined"){
            objToCheck = objToCheck[objLayer];
        }
    });

    return objToCheck;
};
settings_manager.setObject=function(obj,newVal){
    var objToCheck = window; //TODO: If moving to Node.JS, use the other root
    _.each(_.first(obj,obj.length-1),function(objLayer){
        if (typeof objToCheck[objLayer]!="undefined"){
            objToCheck = objToCheck[objLayer];
        }
    });
    objToCheck[obj[obj.length-1]]=newVal;
};
