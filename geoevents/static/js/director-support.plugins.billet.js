// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

director_support.plugins.billetTable=function(widget,numberDrawn,$content){
    return director_support.plugins.billet.buildTable(widget,numberDrawn,$content);
};
//----------------------------------------

director_support.plugins.billet = {};
director_support.plugins.billet.openRow=null;

director_support.plugins.billet.buildTable=function(widget,numberDrawn,$content){

    //Add Each Program Observation to the timeline
    _.each(dashboard.data.billets,function(billet){
        if (billet.date_open) { director_support.plugins.billet.addTimelineItem(billet,billet.date_open,"Opened"); }

    });

    var $headerdiv = $('#'+director_support.widgetDivName(widget,numberDrawn,'header'));
    if ( dashboard.permissions.add_billet)
	{
    var $a = $('<a>')
        .attr('href',event_pages.options.root+'director/billet/add/')
        .appendTo($headerdiv);
    $('<span>')
        .text('Add Billet')
        .addClass("btn btn-mini")
        .appendTo($a);
	}

    //Build a scrollable datatable
    var $billetTable = $('<table>')
        .attr({cellpadding:0,cellspacing:0,border:0})
        .addClass("display")
        .appendTo($content);

    $billetTable.dataTable( {
        "bJQueryUI": true,
        "aaData": dashboard.data.billets,
        "sProcessing":true,
        "bScrollCollapse": (Helpers.isIOS ? false : true),
        "bScrollInfinite": (Helpers.isIOS ? false : true),
        "sScrollY": (Helpers.isIOS ? null : "200px"),
        "bStateSave": true,
        "sDom": 't<"F">',
        "fnRowCallback":function( tr, rowData, rowNum, rowNumFull ) {
            //After cells are rendered with basic data, spice them up with jQuery
            var $cell1 = $('td:eq(0)', tr);
            var $cell2 = $('td:eq(1)', tr);
            var $cell3 = $('td:eq(2)', tr);
            var $cell4 = $('td:eq(3)', tr);

            var $aonid = director_support.plugins.billet.recordId(rowData);
            if ($aonid) $cell1.empty().append($aonid);

            var $name = director_support.plugins.billet.recordName(rowData);
            if ($name) $cell2.empty().append($name);

            var $status = director_support.plugins.billet.recordStatus(rowData);
            if ($status) $cell3.empty().append($status);

            var $lastAction = director_support.plugins.billet.recordLastAction(rowData);
            if ($lastAction) $cell4.empty().append($lastAction);

            $(tr).on('click',function(){
                var tr = this;
                if (director_support.plugins.billet.openRow){
                    $billetTable.fnClose(director_support.plugins.billet.openRow);
                    director_support.plugins.billet.openRow = null;
                }else{
                    $billetTable.fnOpen( tr, director_support.plugins.billet.functionFormatDetails($billetTable, tr), 'details' );
                    director_support.plugins.billet.openRow = tr;
                }
            });
        },

        "aoColumns": [
            {
                sTitle: "AON #",
                mDataProp: "aon_id"
            }
            ,{
                sTitle: "Name",
                mDataProp: "name"
            }
            ,{
                sTitle: "Status",
                mDataProp: "status"
            }
            ,{
                sTitle: "Last Action",
                mDataProp: "lastAction"
            }

        ]
    } );
};


director_support.plugins.billet.recordId=function(billet){
    var $group = $('<span>')
        .css({fontWeight:'bold'});
    if (billet.tags){
        $group.tooltip({title:'Tags: <b>'+billet.tags+'</b>',trigger:'hover',placement:'right'});
    }
    $group.text(billet.aon_id);
    return $group
};

director_support.plugins.billet.recordName=function(billet){
    var $group = $('<span>')
        .css({fontWeight:'bold'});
    $group.text(billet.name);
    return $group
};


director_support.plugins.billet.recordLastAction=function(billet){
    var $group = $('<span>')
        .css({fontWeight:'bold'});
    $group.text(billet.lastAction);
    return $group
};

director_support.plugins.billet.recordStatus=function(billet,i){
    var $mydiv = $('<div>')
        .css({'margin':'2px','padding':'2px'});
    $mydiv.text(billet.status);
    if (billet.status=="Filled") $mydiv.css({color:'green'});
    if (billet.status=="Open") $mydiv.css({color:'purple',fontWeight:'bold',fontSize:'1.1em'});



    return $mydiv;

    /*
     var desc = program.details||program.name;
     if (program.management_poc) desc+='<br/><b>Manager:</b> '+program.management_poc;
     if (program.technical_poc) desc+='<br/><b>Tech POC:</b> '+program.technical_poc;

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

     return $por;*/

};




//TODO: more to come
director_support.plugins.billet.functionFormatDetails=function(table,tr) {
    var rowData = table.fnGetData( tr );

    var $details = $('<div>')
        .css({padding:'10px',textAlign:'right',width:'100%'});
    $details.text(rowData.comments);

    return $details;
};


director_support.plugins.billet.addTimelineItem=function(billet,date,datetype){


    var existingEvents = _.find(dashboard.data.timeline_events,function(p){
        return (p.title==billet.aon_id && p.date==date) ;});

    if (!existingEvents) {
        var desc = "";
        var post_date=Helpers.dateFromPythonDate(date,moment());
        if (post_date) {
            post_date=post_date.calendar();
        } else {
            post_date=date;
        }
        if (billet.name) desc+='<b>Name:</b> '+billet.name+"<br/>";
        desc +="<b>" + datetype + "</b>"+post_date+"<br/>";



        dashboard.data.timeline_events.push({
            start: Helpers.dateFromPythonDate(date,moment()),
//            end: moment(obs.observation_date_ended),
            createdAt: moment(date),
            date: date,
            title: "AON: "+billet.name,
            details: desc,
            link: "/", //TODO: Add link to observation edit
            type: 'AON',
            className: 'timeline-item-rfi', //TODO: Create new classes
            status: billet.status,
            group: 'AON'
        });

    }
};
