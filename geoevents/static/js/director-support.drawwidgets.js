// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

director_support.drawWidgets=function(dashboard){
    //Widgets should already be ordered
    var $main = $('.main-content');

    _.each(dashboard.widgets,function(widget,i){
        var $content =director_support.drawWidget(widget,$main,i);
        if (widget.type=='Widget'){
            var funcToRun = director_support.plugins[widget.render_function];
            if (funcToRun && typeof funcToRun=="function"){
                try{
                    funcToRun(widget,i,$content);
                } catch(ex){
                    console.log('Exception in widget '+widget.id+', named "'+widget.name+'":');
                    console.log(ex);
                }
            } else {
                console.log('Widget '+widget.id+' tried to run a widget function that was unrecognized - '+widget.render_function)
            }
        }
    });
};
director_support.drawWidget=function(widget,$main,numberDrawn){

    var use_thumbnail = false;
    var title_text = widget.name;
    var title_link = widget.url;
    var title_icon = widget.icon;
    var title_subtext = widget.subtext;
    var use_title_bar = true;

    var maindiv_name = director_support.widgetDivName(widget,numberDrawn,'content');
    var holderdiv_name = director_support.widgetDivName(widget,numberDrawn,'holder');
    var headerdiv_name = director_support.widgetDivName(widget,numberDrawn,'header');

    var maindiv_css = {};
    if (widget.theme=="Thin"){
        //TODO: Move all styling into widgets.css
        maindiv_css = {'overflow-y':'auto','margin':'0px','padding':'0px'};
        use_title_bar=true;
        use_thumbnail=false;
    } else if (widget.theme=="Thick"){
        maindiv_css = {'overflow-y':'auto','margin':'2px','padding':'2px'};
        use_title_bar=true;
        use_thumbnail=false;
    } else if (widget.theme=="Headless"){
        maindiv_css = {'overflow-y':'auto','margin':'0px','padding':'0px'};
        use_title_bar=false;
        use_thumbnail=false;
    } else if (widget.theme=="Thick+Border"){
        maindiv_css = {'overflow-y':'auto','margin':'2px','padding':'2px'};
        use_title_bar=true;
        use_thumbnail=true;
    }

    if (widget.type=='Wiki') {
        //TODO: Move this Wiki formatting into a JS plugin
        var $content_inner=$('<div>');
        _.each(widget.notes,function(note, i){
            try{
                var $note = $('<div>')
                    .addClass('note')
                    .appendTo($content_inner);
                if (i % 2 == 0) $note.addClass('note_even');

                if (note.title){
                    $('<span>')
                        .addClass('title')
                        .html(note.title)
                        .appendTo($note);
                }
                if (note.edit_url && dashboard.permissions.edit_notes){
                    $('<span class="header-actions pull-right"><a href="'+note.delete_url+'"> [Del] </i></a></span> ')
                        .appendTo($note);

                    $('<span class="header-actions pull-right"><a href="#"> [Edit] </i></a></span> ')
                        .on('click',function(){director_support.plugins.note_editForm(note, widget.id)})
                        .appendTo($note);
                }
                if (note.posted_by){
                    var $postedby = $('<span>')
                        .addClass('posted_by header-actions pull-right')
                        .html('Posted by '+note.posted_by)
                        .appendTo($note);
                    if (note.posted_date){
                        var date = Helpers.dateFromPythonDate(note.posted_date,'');
                        if (date) {
                            var dtg ='Posted: '+date.toLocaleString();
                            $postedby
                                .tooltip({title:dtg,trigger:'hover',placement:'top'});
                        }
                    }
                }

                $('<span>')
                    .addClass('content')
                    .html(note.content || "&lt;no details entered&gt;")
                    .appendTo($note);

            } catch(ex){
                console.log("Error handling a note within Wiki widget: "+widget.name);
            }

//            var desc="<b>Notes from: "+widget.name+"</b><br/>";
//            desc+=note.content;
//
//            dashboard.data.timeline_events.push({
//                start: moment(note.posted_date),
//                createdAt: moment(note.posted_date),
//                date: note.posted_date,
//                title: note.title,
//                details: desc,
//                link: note.url,
//                type: 'Note',
//                className: 'timeline-item-rfi', //TODO: Create new classes
//                status: widget.name,
//                group: 'Note'
//            });
        })
    }
    if (widget.type=="iFrame" && widget.iframe_url){
        title_link = widget.iframe_url;
    }

    var $widget = $('<div>')
        .attr('id',holderdiv_name)
        .addClass('widget_holder')
        .appendTo($main);
    if (widget.width < 12 && widget.width > 0) {
        var widget_width = parseFloat(widget.width/12) -.015;
        widget_width = parseInt(widget_width * 100);
        $widget.css({width:widget_width+'%'});
    } else {
        $widget.css({width:'100%',display:'block'});
    }

    if (widget.height){
        $widget.css('max-height',widget.height+'px');
    }
    var $inner = $('<div>')
        .addClass('insideWidget')
        .appendTo($widget);

    if (title_text && use_title_bar) {
        var $title = $('<h3>')
            .addClass('landing-page-header')
            .appendTo($inner);
        if (title_icon){
            $('<i>')
                .addClass('icon icon-'+title_icon)
                .appendTo($title);
        }
        var $title_text= $('<span>')
            .appendTo($title);
        if (title_link) {
            $('<a>')
                .attr({'href':title_link, 'target':'_new', 'title':'Open in new tab'})
                .text(title_text)
                .appendTo($title_text);
        } else {
            //No link
            $title_text.text(title_text)
        }
        $('<span class="header-actions pull-right">')
            .attr('id',headerdiv_name)
            .appendTo($title);
        if (widget.description || title_subtext){
            $title_text
                .css('cursor','pointer')
                .popover({title:title_subtext || widget.name,content:widget.description || "", trigger:'hover',placement:'top'});
        }
    } else {
        //TODO: make empty divs with same names so other parent/holder calls don't fail
    }

//    if (title_subtext && use_title_bar) {
//        var $subtext = $('<div>')
//            .addClass('header-subtext')
//            .appendTo($inner);
//        $('<div>')
//            .addClass('row-fluid content')
//            .text(title_subtext)
//            .appendTo($subtext);
//    }
    var $content;
    if (widget.type=="iFrame"){
        $content = $('<iframe>')
            .css('width','100%')
            .appendTo($inner);

        if (widget.iframe_url) {
            $content.attr('src', widget.iframe_url);
        }
        //TODO: Handle local url
    } else {
        $content = $('<div>')
            .appendTo($inner);
        if ($content_inner){
            $content_inner.appendTo($content);
        }
    }
    if (use_thumbnail){
        $content.addClass('thumbnail');
    }

    //TODO: This only works with one note per page!
    director_support.plugins.note_modalForm = director_support.plugins.note_addForm();
    director_support.plugins.note_modalForm.appendTo($content);

    if (widget.type=='Wiki' ){
//    if (widget.type=='Wiki' && widget.add_note_url && dashboard.permissions.add_notes){

        var $parentdiv = $('#'+headerdiv_name);
        $("<a>")
            .addClass("btn btn-mini")
            .attr({href:"#"})
            .text("Quick Add Note")
            .on('click',function(){director_support.plugins.note_editForm(false,widget.id)})
            .appendTo($parentdiv);

        var root_minus_slash = event_pages.options.root;
        if (root_minus_slash == "/") root_minus_slash = "";
        var longUrl = widget.add_note_url + root_minus_slash + 'director/board/' + dashboard.id + '/';
        $("<a>")
            .addClass("btn btn-mini")
            .attr({href:longUrl})
            .text("Add Formatted Note")
            .appendTo($parentdiv);
    }

    $content.attr('id',maindiv_name);
    if (maindiv_css){
        $content.css(maindiv_css);
    }
    if (widget.height){
        var height=director_support.widgetContentHeight(widget);
        $content.css('max-height',height+'px')
    }

    return $content;

};
director_support.addSocialUI=function(variablePointer,model,id){
    var $rating;

    //Functions for dynamically pointing to rating increases
    var ratingCurrent=function(){
        return variablePointer;
    };
    var ratingIncrease=function(amt){
        variablePointer+=amt;
        var vars='rating='+(amt>0?"increase":"decrease");

        var csrf=Helpers.extractCSRF(true);
        if (csrf) vars+=csrf;

        var url=event_pages.options.root+'director/rate/'+model+'/'+id+'/';

        $.post(url,
            vars,function(data,status,xhr){
                console.log(data);
                if (data.status=='success'){
                    //TODO: Flash it blue?
                    ratingSetText(data.rating,true);
                }
        });

    };
    var ratingSetText=function(rating,flash){
        $rating.text(rating);
        if (flash) {
            $rating
                .animate({backgroundColor:'#0f0'},800)
                .delay(1000)
                .animate({backgroundColor:'#eee'},400);
        }

    };

    var $holder = $('<span>');
    var $social = $('<span>')
        .css({whiteSpace:'nowrap',padding:'4px',margin:'8px',backgroundColor:'#eee',borderRadius:'4px'})
        .appendTo($holder);
    $('<i>')
        .addClass('icon icon-thumbs-up')
        .css({cursor:'pointer'})
//        .tooltip({title:'Vote up',trigger:'hover',placement:'top'})
        .on('click',function(e){
            e.preventDefault();
            ratingIncrease(1);
            ratingSetText(ratingCurrent());
        })
        .appendTo($social);
    $rating = $('<span>')
        .text(ratingCurrent())
        .appendTo($social);
    $('<i>')
        .addClass('icon icon-thumbs-down')
        .css({cursor:'pointer'})
//        .tooltip({title:'Vote down',trigger:'hover',placement:'top'})
        .on('click',function(e){
            e.preventDefault();
            ratingIncrease(-1);
            ratingSetText(ratingCurrent());
        })
        .appendTo($social);
//TODO: Enter note or threaded message
//TODO: Build API to handle ratings, or use django-ratings library
//TODO: Have vital flag
//    $('<i>')
//        .addClass('icon icon-exclamation-sign')
//        .css({cursor:'pointer'})
//        .tooltip({title:'<b>Flag this as vital</b>',trigger:'hover',placement:'top'})
//        .appendTo($social);
    return $holder;

};

//==============================
director_support.buildWidgetTable=function(options){

    //Build a scrollable datatable
    options.$table = $('<table>')
        .attr(options.tableCSS || {cellpadding:0,cellspacing:0,border:0})
        .addClass("display")
        .appendTo(options.$content);

    //TODO: Change height on widget resize
    options.height = options.height || director_support.widgetContentHeight(options.widget)-49+'px';

    options.$table.dataTable( {
        "bJQueryUI": true,
        "aaData": dashboard.data.programs,
        "sProcessing":true,
        "bScrollCollapse": (Helpers.isIOS ? false : true),
        "bScrollInfinite": (Helpers.isIOS ? false : true),
        "sScrollY": (Helpers.isIOS ? null : options.height),
        "bStateSave": true,
        "sDom": director_support.hasFlash ?'Tt' : 't',
        "fnRowCallback":function( tr, rowData, rowNum, rowNumFull ) {
            //After cells are rendered with basic data, spice them up with jQuery
            if (options.rowDecoratorFunction) options.rowDecoratorFunction(tr, rowData, rowNum, rowNumFull);

            if (options.rowClickFunction) {
                $(tr).on('click',function(){
                    var tr = this;
                    if (options.openRowPointer){
                        options.$table.fnClose(options.openRowPointer);
                        options.openRowPointer = null;
                    }else{
                        options.$table.fnOpen( tr, options.rowClickFunction(options.$table, tr), 'details' );
                        options.openRowPointer = tr;
                    }
                });
            }

            if (options.dropTargetFunction){
                $(tr).data('program',rowData);
                $(tr).drop(options.dropTargetFunction);
            }

        },

        "aoColumns": options.columnDefinitions
    } );

    options.$toolbar = director_support.addWidgetToolbar(options);

    return options.$table;
};

director_support.addWidgetToolbar = function(options){

    if (options.$table && options.showExports){
        options.oTableTools = new TableTools( options.$table, {
            "sSwfPath": event_pages.options.root+"static/datatables.net/copy_csv_xls_pdf.swf"
        } );
    }

    var headerDivName = options.divName || director_support.widgetDivName(options.widget,options.numberDrawn,'header');
    var $headerdiv = $('#'+headerDivName);
    if (!options.useDropDownMenu) {
        _.each(options.links,function(link){
            var url = "#";
            if (link.url){
                url = link.url;
            }
            $("<a>")
                .addClass("btn btn-mini")
                .attr({href:url})
                .text(link.text || "Run")
                .click(link.click || function(){document.location.href=link.url})
                .appendTo($headerdiv);
        });
        return;
    }
    //Otherwise build within a dropdown menu
    var $dd = $("<div>")
        .addClass("dropdown btn-group")
        .appendTo($headerdiv);

    var $dd_a = $("<button>")
        .addClass("btn dropdown-toggle btn-mini")
        .attr({dataToggle:"dropdown"})
        .text("Options")
        .appendTo($dd);
    $("<span>")
        .addClass("caret")
        .appendTo($dd_a);
    var $ul = $("<ul>")
        .addClass("dropdown-menu")
        .appendTo($dd);
    _.each(options.links,function(link){
        var $li = $("<li>")
            .appendTo($ul);
        var url = "#";
        if (link.url){
            url = link.url;
        }
        $("<a>")
            .attr({href:url})
            .text(link.text || "Run")
            .click(link.click || function(){document.location.href=link.url})
            .appendTo($li);
    });

    if (options.$table && options.showExports && options.oTableTools){
        var $holder = options.$content
            .find('.DTTT_container')
            .css({display:'none'});

        var $l3 = $("<li>")
            .appendTo($ul);
        $("<a>")
            .text("Export Data")
            .click(function(){
                $holder.toggle();

                options.oTableTools.fnResizeRequired(true);
                options.oTableTools.fnResizeButtons();

            })
            .appendTo($l3);

        $(options.oTableTools.dom.container).hide();
        options.$table.before( options.oTableTools.dom.container );
    }

};


director_support.plugins.note_editForm=function(item, widget_id){
    widget_id = widget_id || 0;

    var form = director_support.plugins.note_modalForm;
    var form_title = form.find('h3');
    var title = form.find('[name="title"]');
    var content = form.find('[name="content"]');
    var id = form.find('[name="id"]');
    var widgetid = form.find('[name="widget_id"]');

    if (item && item.id) {
        form_title.text("Edit note");
        title.val(item.title);
        content.val(item.content);
        id.val(item.id);
        widgetid.val(widget_id);
    } else {
        form_title.text("Add a note");
        title.val("");
        content.val("");
        id.val("");
        widgetid.val(widget_id);
    }
    form.modal('show');
};

director_support.plugins.note_addForm=function(){
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
        .html("Add a note")
        .appendTo($header);

    var $body=$("<form>")
        .addClass("modal-body")
        .appendTo($form);

    if (event_pages.options.csrf){
        $(event_pages.options.csrf).appendTo($form);
    }
    //----------------
    $("<input>")
        .attr({type:'text',name:'title',placeholder:'Short title of note'})
        .appendTo($body);
    $("<textarea>")
        .attr({name:'content',placeholder:'Detailed note content'})
        .appendTo($body);
    $("<input>")
        .css({display:'none'})
        .attr({type:'checkbox',name:'public',checked:true})
        .appendTo($body);
    $("<input>")
        .css({display:'none'})
        .attr({name:'id',value:''})
        .appendTo($body);
    $("<input>")
        .css({display:'none'})
        .attr({name:'widget_id',value:'1'})
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
            var url = event_pages.options.root+'director/note/new/';

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
director_support.plugins.note_delete = function(item){

};