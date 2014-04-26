// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

director_support.plugins.linkListHorizontalCategories=function(widget,numberDrawn,$content){
    var $holder = $('<div>')
        .addClass('horizontalLinkHolder')
        .css({width:'100%'})
        .appendTo($content);

    var categories = widget.data.categories;
    var links_total=0;
    _.each(categories,function(category){
        var links = _.filter(dashboard.data.links,function(link){return link.category==category.filter});
        var $catHolder=$('<div>')
            .addClass('category')
            .css({display:'inline-block'})
            .appendTo($holder);
        var catHeader = category.title|| (dashboard.org + ' ' + category.filter);
        $('<div>')
            .addClass('header')
            .text(catHeader)
            .appendTo($catHolder);

        _.each(links,function(link){
            var title = link.title.replace(' ','<br/>');
            var hover_direction = 'top';

            links_total++;
            if (links_total<3) hover_direction = 'right';

            var $link = $('<div>')
                .addClass('link')
                .css({display:'inline-block'})
                .html(title) //TODO: Shorten if too long?
                .appendTo($catHolder);
            if(link.color){
                $link.css({backgroundColor:link.color});
                var newBGCol=$link.css('backgroundColor');
                var overColor=Helpers.getColorWithBackground(newBGCol);
                $link.css({color:overColor});
            }

            var hover_text = link.details || link.title;
            if(link.url){
                $link.css({cursor: 'pointer'});
                $link.on('click',function(){
                    var win=window.open(link.url, '_blank');
                    win.focus();
                });
                hover_text+='<br/>Open: '+link.url;
            }


            $link.tooltip({title:hover_text,trigger:'hover',placement:hover_direction});
        });

    });




};