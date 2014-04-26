// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

//--------------------------------------------
// Functionality used on multiple event pages.
//--------------------------------------------

var event_pages = {};
event_pages.settings = {};
event_pages.options = {
    footerButtonStyle: {padding:'4px',
        marginLeft:'10px',
        backgroundColor:'#f7f7f9',
        border:'1px #999999 solid',
        borderRadius:'3px',
        whiteSpace:'nowrap',
        "font-size":"11px",
        "font-style":"normal"
    },
    proxy: '',
    staticRoot: '/static/',
    root: '/'
};

//--------------------

event_pages.init=function(){

    //Set the default proxy
    var proxyInfo = event_pages.which_proxy();
    event_pages.options.proxy = proxyInfo.proxy;

    //Enter in the current date into the title
    if (typeof($)!="undefined" && $('.headerDate')) {
        $('.headerDate').html("Current Date: "+new Date());
    }
    //event_pages.checkAnalytics();
    //event_pages.checkSSO();

    //TODO: This is an ugly workaround for Openlayers divs being always on top with IE... fix it
    $(document).ready(function() {
        if ($.browser.msie){
            var $class = $('#classified-top');
            $class.data('open', false);

            $('.dropdown-toggle').click(function() {
                if($class.data('open')) {
                    $class.data('open', false);
                    $(".olTileImage").show();
                } else {
                    $class.data('open', true);
                    $(".olTileImage").hide();
                }
            });

            $(document).click(function() {
                var $class = $('#classified-top')
                if($class.data('open')) {
                    $class.data('open', false);
                    $(".olTileImage").show();
                }
            });
        }
    });
};


event_pages.checkAnalytics=function(){
    function showAnalyticsDetails($analytics,data,tag, appname){
        var results = $.xml2json(data);
        if (!results.aggregates || !results.aggregates.metric){
            return false;
        }
        var output=[];
        var output_details=[];

        if (_.isObject(results)){
            _.each(results.aggregates.metric,function(metric){
                output.push(metric.label.replace("Visitors", "Users") +  ': <b>'+Helpers.thousandsFormatter(metric.value)+'</b>');
            });

            if (results.resultsRows && results.resultsRows.row){
                var last = _.last(results.resultsRows.row,7).reverse();
                _.each(last,function(metric){
                    var daytext =metric.dimension.value;
                    var day = daytext.substring(0,4)+"/"+daytext.substring(4,6)+"/"+daytext.substring(6,8);
                    day = moment(day).from(moment().startOf('day'));
                    day = day.replace('a few seconds ago','so far today');

                    var text = "<b>"+day+"</b> ("+daytext+"): "+metric.metric[2].value+" visits";

                    output_details.push(text);
                });
            }
            if (output.length){
                output_title = "<span class='muted'>" + appname + ": </span>";
                output = output.join(" | ")+" "+tag;
                output_details = output_details.join("<br/>")

                $analytics.html(output_title + output);

                if (output_details && output_details.length > 2){
                    $analytics
                        .popover({
                            content:"<p style='font-size:11px'>"+output_details+"</p>",
                            title:'Visit details to this application',
                            trigger:'hover',
                            placement:'top'
                        })
                        .css({
                            cursor:'pointer',
                            whiteSpace:'nowrap'
                        });
                }
            }
        }


    }

    //TODO: Wrap this in a proxy to hide keys
    var today = moment().format('YYYYMMDD');
    var lastWeek = moment().subtract('days',30).format('YYYYMMDD');

    var settings = window.settings || {};
    var owa_url = settings.serverurl_owa;
    var owa_key = settings.owa_key;
    var owa_site = settings.owa_site;
    if (!owa_url || !owa_key || !owa_site) return;

    var owa_lookup = owa_url+'api.php?owa_apiKey='+owa_key+'&owa_do=getResultSet&owa_metrics=repeatVisitors,newVisitors,visits&owa_limit=30&owa_siteId='+owa_site+'&owa_format=xml&owa_startDate='+lastWeek+'&owa_endDate='+today+'&owa_dimensions=date';
    var urlAnalytics = event_pages.proxify(owa_lookup,true);

    var $analytics = $('<span>')
        .attr({id:'analyticsStatus'})
        .addClass('analyticsStatus')
        .css(event_pages.options.footerButtonStyle)
        .html('Loading stats.')
        .appendTo($('footer p'));


    $.ajax({
        url:urlAnalytics,
        method:'GET',
        dataType:'text',
        success:function(data){
            showAnalyticsDetails($analytics,data,'in last 30 days', "Event Pages");
        }
    });

    var yearsAgo = moment().subtract('years',2).format('YYYYMMDD');
    var owa_lookup2 = owa_url + 'api.php?owa_apiKey='+owa_key+'&owa_do=getResultSet&owa_metrics=newVisitors,visits&owa_limit=30&owa_siteId='+owa_site+'&owa_format=xml&owa_startDate='+yearsAgo+'&owa_endDate='+today;
    urlAnalytics = event_pages.proxify(owa_lookup2,true);

    var $analyticsTotal = $('<span>')
        .attr('id','analyticsStatusTotal')
        .css($.extend(event_pages.options.footerButtonStyle, {backgroundColor:'#d6e9c6'}))
        .text('Loading stats.')
        .appendTo($('footer p'));
    $.ajax({
        url:urlAnalytics,
        method:'GET',
        dataType:'text',
        success:function(data){
            showAnalyticsDetails($analyticsTotal,data,'all time', "IAE");
        }
    });

};

event_pages.isLocal = function(){
    return (document.location.hostname == 'localhost' || document.location.hostname == '127.0.0.1');
};

event_pages.which_proxy=function(url){
    //By default, return default proxy. If local, use /proxy. If not, use setting or /events/
    var proxy = event_pages.isLocal()?'/proxy/':(settings.serverurl_proxy_url_local || event_pages.settings.serverurl_proxy_url_local || '/proxy/');
    var useEncode = false;


    //This setting contains a list of proxies, turn it from a string to an array
    var array_proxies = settings.array_proxies;
    if (typeof settings!="undefined" && settings.array_proxies && _.isString(settings.array_proxies)){
        try{
            array_proxies = JSON.parse(settings.array_proxies);
        } catch (ex){
            console.log("settings.array_proxies not valid JSON");
        }
        settings.array_proxies = array_proxies;
    }

    //If there's a matching proxy prefix, use that instead
    if (url && typeof settings!="undefined" && settings.array_proxies && _.isArray(settings.array_proxies)) {
        _.each(settings.array_proxies,function(proxyTuple){
            if (_.isObject(proxyTuple)){
                var urlPrefix = proxyTuple.url || "";
                var urlProxy = proxyTuple.proxy || "";
                useEncode = proxyTuple.encode || false;
                if (useEncode == "true") useEncode = true;
                if (useEncode == "false") useEncode = false;

                if (url.indexOf(urlPrefix)==0){
                    proxy=urlProxy;
                    return false;
                }
            }
        });
    }

    return {proxy:proxy, useEncode: useEncode};
};

event_pages.clean_up_url = function(url){
    //Parse out any double-slashes//
    var prefix = "";
    var server = "";

    if (url && _.isArray(url)){
        url = url[0];
    }

    if (_.string.startsWith(url,'https://')){
        prefix = "https://";
        server = url.substring(8);
    } else if (_.string.startsWith(url,'http://')){
        prefix = "http://";
        server = url.substring(7);
    } else {
        prefix = url;
    }
    server = server.replace(/\/\//g,"/");

    return prefix+server;
};

event_pages.proxify = function(newUrl,dontEncode){
    var newUrl = newUrl;
    var serverNamesToNotProxy = [window.location.protocol + "//" + window.location.host, "http://127.0.0.1"];

    //NOTE: Add a setting to current server to not proxy local links
    if (settings.serverurl_dont_proxy){
        serverNamesToNotProxy.push(settings.serverurl_dont_proxy)
    }

    if (newUrl && _.isArray(newUrl)){
        newUrl = newUrl[0];
    }

    if (newUrl && _.isString(newUrl)){
        if (_.string.startsWith(newUrl,'//')){
            newUrl = newUrl.substring(1);
        }

        newUrl = event_pages.clean_up_url(newUrl);

        var addProxy = _.string.startsWith(newUrl,'http') || event_pages.isLocal();
        if (_.string.startsWith(newUrl,'/')) {
            addProxy = false;
        } else {
            _.each(serverNamesToNotProxy,function(sn){
                if (_.string.startsWith(newUrl,sn) && _.string.startsWith(window.location.href,sn)){
                    newUrl = newUrl.substring(sn.length);

                    if (_.string.startsWith(newUrl,":")) newUrl= "/"+_.string.strRight(newUrl,"/");
                    addProxy=false;
                }
            });
            var proxyInfo = event_pages.which_proxy(newUrl);
            var useProxy = proxyInfo.proxy;
            if (addProxy && useProxy) {
                if (proxyInfo.encode) {
                    if (dontEncode==true) {
                        //Override whether to encode, even if proxy is set to do so
                    } else {
                        newUrl = encodeURIComponent(newUrl);
                    }
                }
                newUrl = useProxy + newUrl;
            }
        }
    }
    return newUrl;
};

event_pages.checkSSO=function(){
    function checkSSOToken(){
        //Gets a file, then checks with SSO server to verify token still active

        //This method seemed the only way that works as it forces a REST lookup:
        $.get('/rfi_gen/');

        var http_request = new XMLHttpRequest();
        http_request.open("GET", urlRelogin, true);
        http_request.onreadystatechange = function () {
            var done = 4, ok = 200;
            if (http_request.readyState == done) {
                if (http_request.status == ok) {
                    if (http_request.responseText && http_request.responseText.indexOf("boolean=true")>-1) {
                        $status
                            .css($.extend(event_pages.options.footerButtonStyle, {backgroundColor:'#d9edf7'}))
                            .text("Logged In")
                            .attr("title",'SSO Timeout check was successful');

                        setTimeout(checkSSOToken, interval);
                    } else {
                        $status
                            .css($.extend(event_pages.options.footerButtonStyle, {backgroundColor:'#f2dede'}))
                            .text("Lost Connnection")
                            .attr("title","Error checking token on SSO server. You may have lost your session!");
                    }
                } else {
                    $status
                        .css($.extend(event_pages.options.footerButtonStyle, {backgroundColor:'#f2dede'}))
                        .text("Not signed in")
                        .attr("title","Error connecting to SSO server.");
                    // Debugging:
                    // console.log(http_request.status + " response trying to call keepalive script at " + keepalive_url);
                }
            }
        };
        http_request.send(null);
    }

    var urlRelogin= settings.serverurl_reactivate_token;
    if (!urlRelogin) return;

    var interval = 600000; // 10 minutes

    var $status = $('<span>')
        .attr('id','SSOStatus')
        .css($.extend(event_pages.options.footerButtonStyle, {backgroundColor:'#f2dede'}))
        .text("No Connection")
        .appendTo($('footer p'));

    var token = _.find(document.cookie.split(";"),function(cook){return cook.indexOf("iPlanetDirectoryPro")>-1});
    if (token) token = token.split("=");
    if (token && token.length) {
        token = token[1];
        urlRelogin += token;
        urlRelogin = event_pages.proxify(urlRelogin,true);
        checkSSOToken();
    }
};
event_pages.turnSettingsIntoObject=function(settings){
   if (typeof settings!='undefined' && _.isArray(settings)){
       var newSettings = {};
       _.each(settings,function(setting){
           newSettings[setting.name] = setting.value;
       });
       return newSettings;
   }
   event_pages.settings = settings;
   return settings;
};
