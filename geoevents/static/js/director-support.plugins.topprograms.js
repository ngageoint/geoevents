// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

director_support.plugins.topProgramsOfRecord=function(widget,numberDrawn,$content){
    return director_support.plugins.topPrograms.buildTable(widget,numberDrawn,$content);
};
//----------------------------------------

director_support.plugins.topPrograms = {};
director_support.plugins.topPrograms.openRow=null;

director_support.plugins.topPrograms.buildTable=function(widget,numberDrawn,$content){

    //Add Each Program Observation to the timeline
    _.each(dashboard.data.programs,function(program){
        _.each(program.observations,function(obs){
            director_support.plugins.topPrograms.addTimelineItem(program,obs);
        });
    });

    //Build the options to tailor how table behaves
    var options = {widget: widget, numberDrawn:numberDrawn, $content:$content, showExports:true};
    options.rowDecoratorFunction = function(tr,rowData){
        var $cell1 = $('td:eq(0)', tr);
        var $cell2 = $('td:eq(1)', tr);
        var $cell3 = $('td:eq(2)', tr);

        var $pg = director_support.plugins.topPrograms.recordGroup(rowData);
        if ($pg) $cell1.empty().append($pg);

        var $por = director_support.plugins.topPrograms.recordHead(rowData);
        if ($por) $cell2.empty().append($por);

        if (rowData.observations && rowData.observations.length){
            var obs = _.first(rowData.observations);

            if (obs && obs.entered_by){
                var $obs = director_support.plugins.topPrograms.recordObs(obs,true);
                if ($obs) $cell3.empty().append($obs);
            }
        }
    };
    options.dropTargetFunction = function( ev, dd ){
        var $target = $(dd.target);
        var programData = $target.data('program');
        var progID = programData.id;

        var $source = $(dd.proxy);
        var reportData = $source.data('report');
        var reportID = reportData.id;

        var url = event_pages.options.root + "director/report/link/" + reportID + '/related_programs/'+ progID+'/';
        $.post(url, function(data,status,xhr){
            console.log(data);
        });
        $( this ).toggleClass('dropped');
    };
    options.rowClickFunction = director_support.plugins.topPrograms.functionFormatDetails;
    options.columnDefinitions = [
        {
            sTitle: "IPT",
            mDataProp: "group"
        }
        ,{
            sTitle: "Program",
            mDataProp: "name"
        }
        ,{
            sTitle: "Latest Observation",
            sDefaultContent: "None",
            mDataProp: "observations.0.observation_date"
        }
    ];
    options.links = [
//        {text:"Detailed Add", url:event_pages.options.root+'director/action/add/'},
//        {text:"Quick Add", click:function(){
//            console.log("$addForm.modal('show');");
//        }}
    ];

    director_support.buildWidgetTable(options);

};


director_support.plugins.topPrograms.recordGroup=function(program){
    var $group = $('<span>')
        .css({fontWeight:'bold'});
    if (program.group_tags){
       $group.tooltip({title:'Tags: <b>'+program.group_tags+'</b>',trigger:'hover',placement:'right'});
    }
    if (program.group_url){
        $('<a>')
            .attr({href:program.group_url, target:'_new'})
            .text(program.group)
            .appendTo($group);
    } else {
        $group.text(program.group);
    }
    return $group
};
director_support.plugins.topPrograms.recordHead=function(program,i){
    var $por = $('<div>')
        .css({'margin':'2px','padding':'2px'});
    var desc = program.details||program.name;
    if (program.government_pm) desc+='<br/><b>PM:</b> '+program.government_pm;
    if (program.government_cor) desc+='<br/><b>COR:</b> '+program.government_cor;
    if (program.contractor) desc+='<br/><b>CTR:</b> '+program.contractor;
    if (program.contract_type) desc+='<br/><b>Type:</b> '+program.contract_type;
    if (program.period_of_performance) desc+='<br/><b>Period:</b> '+program.period_of_performance;

    var $name = $('<div>')
        .popover({title:'<b>'+program.name+'</b>',content:desc,trigger:'hover',placement:'right'})
        .css({fontWeight:'bold',padding:'2px'})
        .appendTo($por);
    if (program.url){
        $('<a>')
            .attr({'href':program.url,'target':'_new'})
            .text(program.name)
            .appendTo($name);
    } else {
        $('<span>')
            .text(program.name)
            .appendTo($name);
    }

    return $por;
};
director_support.plugins.topPrograms.recordObs=function(latestObs,ignoreSocialButtons){
    var varsToShow=['overall','cost','performance','schedule'];
    var $por=$('<span>');

    var post_date=Helpers.dateFromPythonDate(latestObs.observation_date,moment());
    if (post_date) {
        post_date=post_date.calendar();
    } else {
        post_date=latestObs.observation_date;
    }
    _.each(varsToShow,function(metric){
        var met_name= _.string.capitalize(metric);
        var met_color=latestObs['metric_'+metric] || 'Yellow';
        var met_summary=latestObs['summary_'+metric] || 'No details entered';
        var met_trend=latestObs['trend_'+metric] || 'Middle';
        var notes = [];//TODO:Parse in notes

        var desc="<b>Posted: </b>"+post_date+"<br/>";
        desc += "<b>Entered By: </b>"+latestObs.entered_by+"<br/>";
        desc += "<b>Summary: </b>"+met_summary+"<br/>";
        desc += "<b>Color: </b>"+met_color+"<br/>";
        desc += "<b>Trend: </b>"+met_trend+"<br/>";

        var altcol = 'white';
        if (met_color=='Yellow') altcol='black';
        var $met=$('<span>')
//            .text(met_name.substring(0,1)+": ")
            .css({margin:'2px',padding:'2px',border:'2px solid black',color:altcol,backgroundColor:met_color,cursor:'pointer'})
            .popover({title:'<b>'+met_name+'</b>',content:desc,trigger:'hover',placement:'left'})
            .appendTo($por);
        var icon='right';
        if (met_trend=='Up') icon="up";
        if (met_trend=='Down') icon="down";
        $('<i>')
            .addClass('icon icon-circle-arrow-'+icon)
            .appendTo($met);
    });

    if (!ignoreSocialButtons){
        var $social = director_support.addSocialUI(latestObs.rating_count,'programobservation',latestObs.id);
        $social
            .addClass('pull-right')
            .appendTo($por);
    }
    return $por;
};


director_support.plugins.topPrograms.functionFormatDetails=function(table,tr) {
    var rowData = table.fnGetData( tr );

    var $details = $('<div>')
        .css({padding:'10px',textAlign:'right',width:'100%'});

    if (rowData.observations && rowData.observations.length && rowData.observations[0].entered_by){
        _.each(rowData.observations,function(obs){

            var $tr = $('<div>');
            var output = obs.observation_date;
            var dtg_moment =  moment(output);
            if (output && dtg_moment.isValid()){
                output = dtg_moment.fromNow();
            }

            var url = event_pages.options.root + "admin/director/programobservation/" + obs.id;
            var $editLink = $('<a>')
                .attr({href:url,target:'_new'})
                .appendTo($tr);
            $('<i>')
                .addClass('icon icon-pencil')
                .tooltip({title:'Edit this observation',trigger:'hover',placement:'left'})
                .appendTo($editLink);

            var url_quad = event_pages.options.root + "director/quadchart/" + obs.id;
            var $shownLink = $('<a>')
                .attr({href:url_quad,target:'_blank'})
                .css({margin:'6px'})
                .appendTo($tr);
            $('<i>')
                .addClass('icon icon-th-large')
                .tooltip({title:'Show Quad Chart',trigger:'hover',placement:'right'})
                .appendTo($shownLink);

            $('<span>')
                .text('Observation from '+output+": ")
                .appendTo($tr);

            var $obs = director_support.plugins.topPrograms.recordObs(obs);
            $obs.appendTo($tr);

            $tr.appendTo($details);
        });
    } else {
        var url = event_pages.options.root + "admin/director/programobservation/add/";
        var $det = $('<div>')
            .appendTo($details);
        $("<a>")
            .attr({href:url,target:'_new'})
            .appendTo($det);

    }

    return $details;
};


director_support.plugins.topPrograms.addTimelineItem=function(program,obs){

    var existingEvents = _.find(dashboard.data.timeline_events,function(p){
        return (p.title==program.name && p.date==obs.observation_date) ;});

    if (!existingEvents) {
        var desc = "";
        var post_date=Helpers.dateFromPythonDate(obs.observation_date,moment());
        if (post_date) {
            post_date=post_date.calendar();
        } else {
            post_date=obs.observation_date;
        }
        if (program.government_pm) desc+='<b>Manager:</b> '+program.government_pm+"<br/>";
        if (program.government_cor) desc+='<b>COR:</b> '+program.government_cor+"<br/>";
        desc +="<b>Posted: </b>"+post_date+"<br/>";
        desc += "<b>Entered By: </b>"+obs.entered_by+"<br/>";

        var varsToShow=['overall','cost','performance','schedule'];
        _.each(varsToShow,function(metric){
            var met_name= _.string.capitalize(metric);
            var met_color=obs['metric_'+metric] || 'Yellow';
            var met_color_over="";
            if (met_color=='Yellow') met_color_over="Orange";
            var met_summary=obs['summary_'+metric] || 'No details entered';
            var met_trend=obs['trend_'+metric] || 'Middle';
            desc+='<b>'+met_name+' (<span style="color:'+(met_color_over||met_color)+'">'+met_color+' - '+met_trend+'</span>)</b>: '+met_summary+'<br/>';
        });


        dashboard.data.timeline_events.push({
            start: moment(obs.observation_date),
//            end: moment(obs.observation_date_ended),
            createdAt: moment(obs.observation_date),
            date: obs.observation_date,
            title: program.name,
            details: desc,
            link: "/", //TODO: Add link to observation edit
            type: 'Observation',
            className: 'timeline-item-rfi', //TODO: Create new classes
            status: program.name,
            group: 'Observation'
        });
    }
};
