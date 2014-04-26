// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

director_support.plugins.timelineForAllPageContent=function(widget,numberDrawn,$content){

    var $timelineHead = $('<div class="modal hide fade" id="timeline-modal">')
        .appendTo($content);
    var $timelineForm = $('<form id="timeline-item-form" class="no-margin">')
        .appendTo($timelineHead);
    if (event_pages.options.csrf){
        $(event_pages.options.csrf).appendTo($timelineForm);
    }
    var $tl_modal = $('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button> <h3>Add Item to Timeline</h3></div>')
        .appendTo($timelineForm);
    var $tl_modal_foot = $('<div class="modal-footer"><a href="#" id="timeline-modal-clear" class="btn">Clear</a><a href="#" data-dismiss="modal" class="btn">Close</a><button type="submit" class="btn btn-primary">Submit</button></div>')
        .appendTo($timelineForm);
    var $tl_holder = $('<div class="thumbnail">')
        .appendTo($content);
    var $tl = $('<div>')
        .attr('id','event_timeline')
        .appendTo($tl_holder);

    var $parentdiv = $('#'+director_support.widgetDivName(widget,numberDrawn,'header'));
    $('<a class="btn btn-mini" role="button" data-toggle="modal" href="#timeline-modal">Add Item to Timeline</a>')
        .appendTo($parentdiv);
//    $('<span class="btn btn-mini" id="timeline_size_change">Increase Height</span>')
//        .appendTo($parentdiv);


    // Ajax for Add new timeline item button
    $('#timeline-item-form').unbind('submit').bind('submit',function(e){
        var inputs = $('#timeline-item-form :input');
        inputs.attr('disabled','');

        var form = $(this);

        var values = {};
        inputs.each(function() {
            values[this.name] = $(this).val();
        });

        //populate the content_object with the resource uri of the event
        values['content_object'] = span.urlEvent;

        var urlAddTimeLineItem = '';//TODO: Enter and build service

        $.ajax({
            type: "POST",
            url: urlAddTimeLineItem,
            data: JSON.stringify(values),
            contentType: 'application/json'
        }).done(function( msg ) {
                $('#myModalMessage').remove();
                var $d = $('<div>').attr('id','myModalMessage').addClass('alert').addClass('alert-success').text('Your submission was received!');
                $('#timeline-modal-body').prepend($d);
                inputs.removeAttr('disabled');
            }).fail(function( msg ){
                $('#myModalMessage').remove();
                var $d = $('<div>').attr('id','myModalMessage').addClass('alert').addClass('alert-error').text('Your submission was not received due to an error.');
                $('#timeline-modal-body').prepend($d);
                inputs.removeAttr('disabled');
            });

        return false;
    });


    director_support.plugins.drawTimeline();

};
director_support.plugins.drawTimeline=function(){

    var search_string=""; //TODO: Add in search support

    var widget=director_support.lookupWidget('Timeline');
    var height=director_support.widgetContentHeight(widget)-12;
    var tlOptions = {
        divID: 'event_timeline',
        initialHeight: height,
        growHeight: height+200,
        showGroups: false,
        showTitles: true,
        showSpans: true,
        boxWidth: "100%",
        eventStyle: "dot",
        typesToShow: ['Observation','Report','Event'], //TODO: Update
        initiallyShowAllItems: true
    };

    var created = dashboard.dates.created_date || '';
    var update = dashboard.dates.updated_date || 'None';
    var ended = dashboard.dates.ended_date || 'None';

    var span = {created:created,updated:update,closed:ended};
    span.timelineItems = [];  //TODO: Enter these
    span.incidentIcon = '';
    span.urlEvent = '';

    var startDate = Helpers.dateFromPythonDate(span.created,moment());
    var updateDate = Helpers.dateFromPythonDate(span.updated);
    var endDate = Helpers.dateFromPythonDate(span.closed);

    // Instantiate our timeline object.
    var timelineDiv = document.getElementById(tlOptions.divID);
    var timeline = new links.Timeline(timelineDiv);

    var data = [];

    _.each(dashboard.data.timeline_events,function(item){
        var goodToAdd = true;
        if (search_string) {
            goodToAdd = false;
            if (moment(item.start).format("MMM Do YY").indexOf(search_string)>-1) {
                goodToAdd=true;
            }
            if (item.title && item.title.toLowerCase) {
                if (item.title.toLowerCase().indexOf(search_string)>-1) goodToAdd=true;
            }
            if (item.keywords && item.keywords.join) {
                var kw = item.keywords.join(" ");
                kw = kw.toLowerCase();
                if (kw.indexOf(search_string)>-1) goodToAdd=true;
            }
            if (item.status && item.status.toLowerCase){
                if (item.status.toLowerCase().indexOf(search_string)>-1) goodToAdd=true;
            }
        }

        if (goodToAdd){
            var title = item.type + ' : ' + item.title;
            if (item.link) {title = "<a href='"+item.link+"' target='_new'>"+title+"</a>";}

            var content = "";
            if (item.details) {content += "<div class='rfiContent'>"+linkify(item.details)+"</div>";}
            content+="<div class='smallDateType'>"+item.start.toDate()+"<br/>"+item.start.fromNow()+"</div>";

            var tlItem = {
                start: item.start,
                className: item.className,
                popover: {
                    title:title,
                    content:content,
                    placement:'top'
                },
                click:function(e){
                    $('.popover').hide();
                    $(this).popover('show');
                }
            };

            if (tlOptions.showGroups && item.group) tlItem.group = item.group;
            if (tlOptions.showSpans && item.end) tlItem.end = item.end;

            if (tlOptions.showTitles) {
                tlItem.content = "<b>"+item.type+"</b>: "+item.title;
            } else {
                tlItem.content = item.type;
            }

            data.push(tlItem);
        }
    });

    //Find the earliest+latest date that items are listed in
    if (!endDate) {
        if (updateDate) {
            endDate = updateDate;
        } else {
            endDate = startDate;
        }
    }
    if (tlOptions.initiallyShowAllItems) {
        _.each(data,function(item){
            if (item.start.unix() < startDate.unix()) {
                startDate = item.start;
            }

            var itemEnd = item.end || item.start;
            if (itemEnd.unix() > endDate.unix()) {
                endDate = itemEnd;
            }
        });
    }

//    var $parentdiv = $('#'+director_support.widgetDivName(widget,widget.numberDrawn,'parent'));
//    $parentdiv.css('height',height);

    var preStartDate = moment(startDate).subtract('days',2);
    var postEndDate = moment(endDate).add('days',2);
    var options = {
        "width":  tlOptions.boxWidth,
        "height": height+"px",
        "style": tlOptions.eventStyle,
        "start": preStartDate,
        "end": postEndDate
    };

    data.push({
        start: startDate.toDate(),
        className: 'timeline-item-eventinfo',
        title: dashboard.org+' site created',
        details: '('+dashboard.org+' - '+dashboard.name+') site owned by '+dashboard.owner,
        type: 'Event',
        content: dashboard.org+' site created'
    });

    //TODO: Not sure why, but details aren't showing
    if (span.updated!="None") {
        data.push({
            start: updateDate.toDate(),
            createdAt:  updateDate.toDate(),
            className: 'timeline-item-eventinfo',
            title: dashboard.org+' site updated',
            details: '('+dashboard.org+' - '+dashboard.name+') site owned by '+dashboard.owner,
            type: 'Event',
            content: dashboard.org+' site updated'
        });
    }

    if (span.closed!="None") {
        data.push({
            'start': endDate.toDate(),
            'className': 'timeline-item-eventinfo',
            'content': dashboard.org + ' site closed'
        });
    }

    //Add all items that were added to this event
    _.each(span.timelineItems,function(tli){
        var item = {};
        if (tli && tli.fields) {
            var fields = tli.fields;

            item.start = Helpers.dateFromPythonDate(fields.start).toDate();
            if (fields.end && fields.end!="None") item.end = Helpers.dateFromPythonDate(fields.end).toDate();
            if (fields.group) item.group = fields.group;
            item.content = fields.content;
            item.className = 'timeline-item-eventinfo';

            data.push(item);
        }
    });
    timeline.draw(data, options);

};