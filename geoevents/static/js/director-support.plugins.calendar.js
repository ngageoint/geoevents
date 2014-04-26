// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

director_support.plugins.calendarAndChildCalendars=function(widget,numberDrawn,$content){
    director_support.plugins.calendar.buildSample(widget,numberDrawn,$content);
    //TODO: Make theme an option
    //TODO: How should editable link up?
    //TODO: Start in week-view?
    //TODO: Option to show timeline events or not
    //TODO: Pull from calendarium
    //TODO: Inherit child organization objects

};

director_support.plugins.calendar={};

director_support.plugins.calendar.buildSample=function(widget,numberDrawn,$content){
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();


    $content.fullCalendar({
        theme: true,
        defaultView: 'agendaWeek',
        header: {
            left: 'prev,next',
            center: 'title',
            right: 'today month,agendaWeek,agendaDay'
        },
        editable: true,
        events: [
            {
                title: 'All Day Event',
                start: new Date(y, m, 1)
            },
            {
                title: 'Long Event',
                start: new Date(y, m, d-5),
                end: new Date(y, m, d-2)
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: new Date(y, m, d-3, 16, 0),
                allDay: false
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: new Date(y, m, d+4, 16, 0),
                allDay: false
            },
            {
                title: 'Meeting',
                start: new Date(y, m, d, 10, 30),
                allDay: false
            },
            {
                title: 'Lunch',
                start: new Date(y, m, d, 12, 0),
                end: new Date(y, m, d, 14, 0),
                color: 'orange',
                allDay: false
            },
            {
                title: 'Birthday Party',
                start: new Date(y, m, d+1, 19, 0),
                end: new Date(y, m, d+1, 22, 30),
                color: 'green',
                textColor: 'green',
                allDay: false
            },
            {
                title: 'Click for Google',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                url: 'http://google.com/'
            }
        ]
    });

    director_support.plugins.calendar.moveButtonsToHeader(widget,numberDrawn);
};

director_support.plugins.calendar.moveButtonsToHeader=function(widget,numberDrawn){
    var holderName = director_support.widgetDivName(widget,numberDrawn,'holder');
    var headerName = director_support.widgetDivName(widget,numberDrawn,'header');

    var $tbars = $('#'+holderName+' .fc-header-right').children();
    $tbars.appendTo('#'+headerName);
    $('#'+holderName+' .fc-header-space').css('display','none');

    $tbars.on('click',function(){
        $tbars.addClass('ui-state-default');
        $tbars.removeClass('ui-state-active');

        var $this = $(this);
        $this.removeClass('ui-state-default').addClass('ui-state-active');
    });

    $('#widget_header_-calendars_1').children().css('font-size','.5em')

};