// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

//--------------------------------------------
// Library of commonly used generic functions.
//--------------------------------------------

var Helpers = Helpers || {};
Helpers.between = function(s, prefix, suffix, suffixAtEnd, prefixAtEnd) {
    if (!s.lastIndexOf || !s.indexOf) {
        return s;
    }
    var i = prefixAtEnd ? s.lastIndexOf(prefix) : s.indexOf(prefix);
    if (i >= 0) {
        s = s.substring(i + prefix.length);
    }
    else {
        return '';
    }
    if (suffix) {
        i = suffixAtEnd ? s.lastIndexOf(suffix) : s.indexOf(suffix);
        if (i >= 0) {
            s = s.substring(0, i);
        }
        else {
            return '';
        }
    }
    return s;
};

Helpers.dateFromPythonDate=function(date,defaultVal){
    //Requires moment.js

    if (date == 'None') date=undefined;
    if (date == null) date=undefined;
    if (date == '') date=undefined;

    var output = defaultVal;
    if (date) {
        date = date.replace(/p.m./,'pm');
        date = date.replace(/a.m./,'am');
        date = date.replace(/\. /," ");
        //TODO: Get to work with Zulu times
        output = moment(date);
    }
    if (output && output.isValid && !output.isValid()) output = defaultVal || moment();
    return output;
};

Helpers.knownFileExt=function(ext){
    var exts = ",3gp,7z,ace,ai,aif,aiff,amr,asf,aspx,asx,bat,bin,bmp,bup,cab,cbr,cda,cdl,cdr,chm,dat,divx,dll,dmg,doc,docx,dss,dvf,dwg,eml,eps,exe,fla,flv,gif,gz,hqx,htm,html,ifo,indd,iso,jar,jp2,jpeg,jpg,kml,kmz,lnk,log,m4a,m4b,m4p,m4v,mcd,mdb,mid,mov,mp2,mp4,mpeg,mpg,msi,mswmm,ogg,pdf,png,pps,ppt,pptx,ps,psd,pst,ptb,pub,qbb,qbw,qxd,ram,rar,rm,rmvb,rtf,sea,ses,sit,sitx,ss,swf,tgz,thm,tif,tmp,torrent,ttf,txt,vcd,vob,wav,wma,wmv,wps,xls,xpi,zip,";
    return (exts.indexOf(","+ext+",") > -1);
};

Helpers.thousandsFormatter = function(num) {
    return num > 999 ? (num/1000).toFixed(1) + 'k' : num;
};
Helpers.invertColor=function(hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1);           // remove #
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color;                  // prepend #
    return color;
};
Helpers.rgb2hex=function(rgb) {
    if (  rgb.search("rgb") == -1 ) {
        return rgb;
    } else {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
};
Helpers.getRGBComponents=function(color) {
    var r = color.substring(1, 3),
        g = color.substring(3, 5),
        b = color.substring(5, 7);
    return {
        R: parseInt(r, 16),
        G: parseInt(g, 16),
        B: parseInt(b, 16)
    };
};
Helpers.idealTextColor=function(bgColor) {
    if (bgColor.length === 4) {
        bgColor = '#' + bgColor[1] + bgColor[1] + bgColor[2] + bgColor[2] + bgColor[3] + bgColor;
    }
    var nThreshold = 105,
        components = Helpers.getRGBComponents(bgColor),
        bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
    return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
};
Helpers.getColorWithBackground=function(bg_color,useInvertedInsteadOfBlackWhite){
    var color = Helpers.rgb2hex(bg_color);
    var overColor = useInvertedInsteadOfBlackWhite?Helpers.invertColor(color):Helpers.idealTextColor('#'+color);
    return overColor;
};

Helpers.getQueryString=function() {
    var result = {}, queryString = location.search.substring(1),
        re = /([^&=]+)=([^&]*)/g, m;
    while (m = re.exec(queryString)) {
        result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return result;
};
Helpers.exists=function() {
    //Check if variables exist
    var allExist = true;
    for( var i = 0; i < arguments.length; i++ ) {
        //TODO: Should it check for null as well?
        if (typeof arguments[i] == "undefined" ) { allExist = false; break;}
    }
    return allExist;
};
Helpers.upperCase=function(input,eachword) {
    if (typeof input == "undefined") return;

    if (eachword) {
        return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    } else {
        return input.charAt(0).toUpperCase() + input.slice(1);
    }
};
Helpers.MakeSureClassExists= function (pointer){
    //usage: HelperFunctions.MakeSureClassExists('Settings.data');

    var classArr = pointer.split(".");

    var newClass = {};

    if (classArr.length && classArr.length > 0) {
        //It's a multiple-level class

        var rootClass = classArr[0];
        if (window[rootClass]) {
            newClass = window[rootClass];
        } else {
            eval(rootClass+' = {}');
        }

        var classEval = rootClass;
        for (var i=1;i<classArr.length;i++){
            //Loop through everything beyond the first level and make sub objects
            classEval += "['"+classArr[i]+"']";
            if (eval("typeof "+classEval) == 'undefined'){
                eval(classEval + " = {}")
            }
        }
    }
};
Helpers.dateCameBefore=function(dateToCheck){
    var isADate = false;
    var result = false;
    if (dateToCheck && dateToCheck.isValid){
        isADate=true;
    } else {
        dateToCheck=moment(dateToCheck);
    }
    if (dateToCheck && dateToCheck.isValid && dateToCheck.isValid()){
        var now = moment();
        var timeDiff =now.diff(dateToCheck);
        if (timeDiff > 0) result=true;
    } else {
        result = "Invalid Date";
    }
    return result;
};
Helpers.buildBootstrapDropdown=function(title,items){
    var $group = $("<span class='btn-group'>");
    $("<a class='btn dropdown-toggle btn-mini' data-toggle='dropdown' href='#'>"+title+"<span class='caret'></span></a>")
        .appendTo($group);
    var $ul =$("<ul class='dropdown-menu'>")
        .appendTo($group);
    _.each(items,function(dd){
        var $li = $("<li>").appendTo($ul);
        var $a =$("<a>")
            .attr({target:'_blank', alt:(dd.alt||dd.name||"")})
            .text(dd.title||"Item")
            .appendTo($li);
        if (dd.url){
            $a.attr({href:dd.href});
        }
        if (dd.onclick){
            $a.on('click',dd.onclick);
        }
    });
    return $group;
};
Helpers.buildBootstrapInputDropdown=function(title,items,$input){
    var $group = $("<span class='input-append btn-group'>");
    var $group_holder = $("<a class='btn dropdown-toggle btn-mini' data-toggle='dropdown' href='#'>")
        .css({float:"none"})
        .appendTo($group);
    var $group_title = $("<span>")
        .text(title)
        .appendTo($group_holder);
    $("<span>")
        .addClass('caret')
        .appendTo($group_holder);

    var $ul = $("<ul class='dropdown-menu'>")
        .appendTo($group);
    _.each(items,function(dd){
        var $li = $("<li>").appendTo($ul);
        var $a = $("<a>")
            .attr({alt:(dd.alt||dd.name||"")})
            .attr({href:"#"})
            .on('click',function(){
                var value = $(this).text();
                $input.val(value);
                $group_title.text(value);
            })
            .appendTo($li);
        if (dd.imgSrc){
            $("<img>")
                .attr({src:dd.imgSrc})
                .appendTo($a);
        }
        $('<span>')
            .text(dd.title||"Item")
            .appendTo($a);


    });
    return $group;
};
Helpers.tryToMakeDate=function(val,fieldName){
    var returnVal;
    var name = (fieldName && fieldName.toLowerCase) ? fieldName.toLowerCase() : "";

    if (name && (name=="date" || name=="created" || name=="updated" || name=="datetime")){
        var testDate = moment(val);
        if (testDate.isValid()) {
            returnVal = val + " <b>("+testDate.calendar()+")</b>";
        }
    }

    return (returnVal || val);
};
Helpers.extractCSRF=function(returnAppendedPostText){
    var ret_form_val = "";
    if (typeof event_pages!="undefined" && event_pages.options && event_pages.options.csrf){
        var csrf = event_pages.options.csrf;
        var pieces = csrf.split("'");
        ret_form_val = pieces[6] || "";
        if (returnAppendedPostText) ret_form_val = "&csrfmiddlewaretoken="+ret_form_val;
    }
    return ret_form_val;
};
(function($){
    // eventType - "click", "mouseover" etc.
    // destination - either jQuery object, dom element or selector
    // clearCurrent - if true it will clear current handlers at destination - default false
    $.fn.copyEventTo = function(eventType, destination, clearCurrent) {
        var events = [];
        this.each(function(){
            var allEvents = jQuery._data(this, "events");
            if (typeof allEvents === "object") {
                var thoseEvents = allEvents[eventType];
                if (typeof thoseEvents === "object") {
                    for (var i = 0; i<thoseEvents.length; i++) {
                        events.push(allEvents[eventType][i].handler);
                    }
                }
            }
        });
        if (typeof destination === "string") {
            destination = $(destination);
        } else if (typeof destination === "object") {
            if (typeof destination.tagName === "string") {
                destination = $(destination);
            }
        }
        if (clearCurrent === true) destination.off(eventType);
        destination.each(function(){
            for(var i = 0; i<events.length; i++) {
                destination.bind(eventType, events[i]);
            }
        });
        return this;
    }

})(jQuery);
