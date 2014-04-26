// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

director_support.plugins.livingWAR_merge_reports=function(){
    _.each(dashboard.data.reports_user,function(rpt_new){
        var found=false;
        for (var i=0;i<dashboard.data.reports.length;i++){
            if (rpt_new.id == dashboard.data.reports[i].id) {
                found=true;
                break;
            }
        }
        if (!found){
            dashboard.data.reports.push(rpt_new);
        }
    });
};
director_support.plugins.livingWAR_editForm=function(item){
    var form = director_support.plugins.livingWAR_modalForm;
    var form_title = form.find('h3');
    var title = form.find('[name="title"]');
    var details = form.find('[name="details"]');
    var tags = form.find('[name="tags"]');
    var id = form.find('[name="id"]');

    if (item && item.id) {
        form_title.text("Edit Report");
        title.val(item.title);
        details.val(item.details);
        tags.val(item.tags);
        id.val(item.id);
    } else {
        form_title.text("Add a report");
        title.val("");
        details.val("");
        tags.val("");
        id.val("");
    }
    form.modal('show');
};

director_support.plugins.livingWAR_addForm=function(){
    var $form = $("<div>")
        .addClass("modal hide fade")
        .attr({tabindex:-1,role:'dialog',ariaLabelledby:"popup_header", ariaHidden:"true"});

    var $header=$("<div>")
        .addClass("modal-header")
        .appendTo($form);
    $("<button>")
        .addClass("close")
        .attr({type:"button",dataDismiss:"modal",ariaHidden:"true"})
        .html("&times;")
        .click(function(){
            $form.modal('hide');
        })
        .appendTo($header);
    $("<h3>")
        .html("Add a report")
        .appendTo($header);

    var $body=$("<form>")
        .addClass("modal-body")
        .appendTo($form);
    if (event_pages.options.csrf){
        $(event_pages.options.csrf).appendTo($form);
    }
    //----------------
    $("<input>")
        .attr({type:'text',name:'title',placeholder:'Short title of report'})
        .appendTo($body);
    $("<textarea>")
        .attr({name:'details',placeholder:'Detailed description'})
        .appendTo($body);
    $("<input>")
        .attr({type:'text',name:'tags',placeholder:'Tags'})
        .appendTo($body);
//    $("<br>")
//        .appendTo($body);
//    $("<span>")
//        .html("Make this visible to all site users?")
//        .appendTo($body);
    $("<input>")
        .css({display:'none'})
        .attr({type:'checkbox',name:'public',checked:true})
        .appendTo($body);
    $("<input>")
        .css({display:'none'})
        .attr({name:'id',value:''})
        .appendTo($body);

    //----------------

    var $footer=$("<div>")
        .addClass("modal-footer")
        .appendTo($form);
    $("<button>")
        .addClass("btn")
        .attr({dataDismiss:"modal",ariaHidden:"true"})
        .html("Close")
        .click(function(){
            $form.modal('hide');
        })
        .appendTo($footer);
    $("<button>")
        .addClass("btn")
        .attr({dataDismiss:"modal",ariaHidden:"true"})
        .html("Submit")
        .click(function(e){
            e.preventDefault();
            var url = event_pages.options.root+'director/report/new/';

            $.post(url,
              $body.serialize(),function(data,status,xhr){
                    console.log(data);
                    if (data.status=='created' || data.status=='edited'){
                        $form.modal('hide');
                        $body[0].reset();

                        //TODO: Refresh just the widget to reload data
                        document.location.reload();
                    }
                }
            );
        })
        .appendTo($footer);


    return $form;
};

director_support.plugins.livingWAR=function(widget,numberDrawn,$content){
    director_support.plugins.livingWAR_merge_reports();

    $content.css({overflowY:'scroll',overflowX:'none'});

    _.each(dashboard.data.reports,function(report){
        var $rptholder = $('<div>')
            .addClass('report draggable')
            .drag("start",function(){
                return $( this ).clone()
                    .css("opacity", .75 )
                    .addClass('drag')
                    .data('report',report)
                    .appendTo( document.body );
            })
            .drag(function( ev, dd ){
                $(dd.proxy).css({
                    top: ev.pageY - 30,
                    left: ev.pageX - 30
                });
                $(dd.available).addClass("highlightBorder");
            })
            .drag("end",function( ev, dd ){
                $(dd.proxy).remove();
                $(dd.available).removeClass("highlightBorder");
            })
            .appendTo($content);

        if (!report.public) {
            $rptholder.addClass('not_public');
        }

        var $rpt = $('<div>')
            .addClass('header')
            .appendTo($rptholder);
        if (!report.public) {
            $rpt.tooltip({title:'Non-public report',trigger:'hover',placement:'top'});
        }
        var $a = $('<a>')
            .on('click',function(){director_support.plugins.livingWAR_editForm(report)})
            .tooltip({title:"Edit this report",trigger:'hover',placement:'top'})
            .appendTo($rpt);
        $("<i>")
            .addClass('icon icon-pencil')
            .appendTo($a);
        $("<span>")
            .html(report.title)
            .addClass('title')
            .appendTo($rpt);


        var $rptbody = $('<div>')
            .addClass('body')
            .appendTo($rptholder);

        var $social = director_support.addSocialUI(report.rating_count,'report',report.id);
        $social.appendTo($rptbody);

        var details = report.details || "<i>No details entered</i>";
        $("<span>")
            .html(details)
            .addClass('details')
            .appendTo($rptbody);

        var momentDateCreated = moment(Helpers.dateFromPythonDate(report.created_date));
        var momentDatePosted = moment(Helpers.dateFromPythonDate(report.posted_date));
        var posted_desc = "<b>Created:</b> "+momentDateCreated.fromNow()+"<br/>";
        posted_desc += "<b>Edited:</b> "+momentDatePosted.fromNow()+"<br/>";
        posted_desc += "<b>Posted By:</b> "+report.owner;

        $("<span>")
            .addClass('pull-right posted_by')
            .html('by '+report.owner)
            .popover({title:"Edited: "+momentDateCreated.calendar(),content:posted_desc,trigger:'hover',placement:'top'})
            .appendTo($rptbody);

        director_support.plugins.livingWAR_addTimelineItem(report);
    });


    var $headerdiv = $('#'+director_support.widgetDivName(widget,numberDrawn,'header'));
    director_support.plugins.livingWAR_modalForm = director_support.plugins.livingWAR_addForm();
    director_support.plugins.livingWAR_modalForm.appendTo($content);

//    if (dashboard.permissions.add_report) {
    var longUrl=event_pages.options.root+'director/report/add/';

    $("<a>")
        .addClass("btn btn-mini")
        .attr({href:"#"})
        .text("Quick Add")
        .on('click',function(){director_support.plugins.livingWAR_editForm()})
        .appendTo($headerdiv);

    $("<a>")
        .addClass("btn btn-mini")
        .attr({href:longUrl})
        .text("Detailed Add")
        .click(function(){
            document.location.href=longUrl;
        })
        .appendTo($headerdiv);
//	}

};


director_support.plugins.livingWAR_addTimelineItem=function(report){

    var existingEvents = _.find(dashboard.data.timeline_events,function(p){
        return (p.title==report.title && p.date==report.posted_date) ;});

    if (!existingEvents) {
        var desc = "";
        var post_date=Helpers.dateFromPythonDate(report.posted_date,moment());
        if (post_date) {
            post_date=post_date.calendar();
        } else {
            post_date=report.posted_date;
        }
        if (report.owner) desc+='<b>Posted By:</b> '+report.owner+"<br/>";
        desc +="<b>Posted: </b>"+post_date+"<br/>";
        desc += "<b>Public: </b>"+report.public+"<br/>";
        desc += "<b>Tags: </b>"+report.tags+"<br/>";
        if (report.details){
            desc += "<b>Details: </b>"+report.details+"<br/>";
        }

        dashboard.data.timeline_events.push({
            start: Helpers.dateFromPythonDate(report.posted_date,moment()),
            createdAt: moment(report.created_date),
            date: report.posted_date,
            title: report.title,
            details: desc,
            link: report.edit_url,
            type: 'Report',
            className: 'timeline-item-rfi', //TODO: Create new classes
            status: report.title,
            group: 'Report'
        });
    }
};