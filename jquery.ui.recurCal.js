(function($) {
    $.widget("ui.recurCal", {
        options: {
            'width': 700,
            'height': 250,
            'mainBorder': '5px outset',
            'dateTimePicker': true,
        },

        _create: function() {
            var recurCal = this,
            o = recurCal.options,
            el = $('<form id="recurCalForm"></form>');
            recurCal.element.empty() // ensure element is empty to start
            .addClass('ui-widget recurCal-main')
            .css({'height': o.height + 'px', 'width': o.width + 'px', 'border': o.mainBorder})
            .append(el);
            if(o.dateTimePicker) {
                // attach start and end date/time
                $('<div></div>').appendTo(el)
                .addClass('ui-widget-content recurCal-dateInput')
                .css({'height': 50, 'width': o.width + 'px'})
                    .append($('<div></div>')
                        .append('Instance Start:&nbsp;&nbsp;')
                        .append($('<input id="recurCalStart" class="datetimepicker ui-widget ui-widget-content ui-corner-all"/>'))
                    )
                    .append($('<div></div>')
                        .append('Finish:&nbsp;&nbsp;')
                        .append($('<input id="recurCalFinish" class="datetimepicker ui-widget ui-widget-content ui-corner-all"/>'))
                    );
                o.height = o.height-50;
            }
            $('<div>Recurrance:</div>').appendTo(el)
            .addClass('ui-widget-content')
            .css({'height': 20, 'width': o.width-15 + 'px', padding: '0 0 0 15px'})
            // attach left hand radios div
            $('<div></div>').appendTo(el)
            .addClass('ui-widget-content recurCal-picker')
            .css({'height': o.height-20, 'width': (o.width/7)*2 + 'px'})
                .append($('<div></div>')
                .css({'padding': (o.height-120)/5 + 'px 0px ' + (o.height-120)/10 + 'px'})
                    .append(_radio('recurCaldaily', 'recurCalRadio', "$('#" + recurCal.element.attr('id') + "').recurCal('daily')"))
                    .append('Daily'))
                .append($('<div></div>')
                .css({'padding': (o.height-120)/10+'px 0'})
                    .append(_radio('recurCalweekly', 'recurCalRadio', "$('#" + recurCal.element.attr('id') + "').recurCal('weekly')"))
                    .append('Weekly'))
                .append($('<div></div>')
                .css({'padding': (o.height-120)/10+'px 0'})
                    .append(_radio('recurCalMonthly', 'recurCalRadio', "$('#" + recurCal.element.attr('id') + "').recurCal('monthly')"))
                    .append('Monthly'))
                .append($('<div></div>')
                .css({'padding': (o.height-120)/10+'px 0px '+ (o.height-120)/5+'px'})
                    .append(_radio('recurCalYearly', 'recurCalRadio', "$('#" + recurCal.element.attr('id') + "').recurCal('yearly')"))
                    .append('Yearly'));
            // build named right hand div to allow for easy access later
            this.display = $('<div>&nbsp;</div>')
                           .addClass('ui-widget-content recurCal-display')
                           .css({'height': o.height-20, 'width': (o.width/7)*5 + 'px'});
            // attach display to main div
            el.append(this.display);//.appendTo(el);
            if(o.dateTimePicker) {
                // apply datetime picker to start and finish, functions ensure begin < end
                var startDateTextBox = $( "#recurCalStart" );
                var endDateTextBox = $( "#recurCalFinish" );

                startDateTextBox.datetimepicker({
                    onClose: function(dateText, inst) {
                        if (endDateTextBox.val() != '')
                        {
                            var testEndDate = endDateTextBox.datetimepicker('getDate');
                        }
                        var testStartDate = startDateTextBox.datetimepicker('getDate');
                        if (endDateTextBox.val() == '' || testStartDate >= testEndDate)
                        {
                            var newDate = new Date();
                            newDate.setTime(testStartDate - (-60000) );
                            endDateTextBox.datetimepicker('setDate', newDate);
                        }

                    },
                    //minDate: 0,
                    dateFormat: 'yy-mm-dd',
                    hourGrid: 3,
                    minuteGrid: 15
                });
                endDateTextBox.datetimepicker({
                    onClose: function(dateText, inst) {
                        if (startDateTextBox.val() != '') {
                            var testStartDate = startDateTextBox.datetimepicker('getDate');
                        }
                        var testEndDate = endDateTextBox.datetimepicker('getDate');
                        if (startDateTextBox.val() == '' || testStartDate >= testEndDate)
                        {
                            var newDate = new Date();
                            newDate.setTime(testEndDate-60000);
                            startDateTextBox.datetimepicker('setDate', newDate);
                        }
                    },
                    //minDate: 0,
                    dateFormat: 'yy-mm-dd',
                    hourGrid: 3,
                    minuteGrid: 15
                });
            }
        },
        // when daily radio button clicked, put daily picker in display
        daily: function() {
            this.display.empty();
            this.display
                .append($('<div></div>')
                .css({'padding': (this.options.height-25)/5
                                 + 'px 0px '
                                 + (this.options.height-25)/10
                                 + 'px'})
                    .append(_radio('recurCalDaily', 'recurCalOften', ''))
                    .append('Every')
                    .append($('<select id="recurCalDays"></select>'))
                    .append(' day(s)')
            );
            var days = $('#recurCalDays');
            for(var i=1; i<7; i++) {
                days.append('<option value='+i+'>'+i+'</option>');
            }
            $('#recurCalDaily').prop('checked', true);
        },
        // weekly radio button clicked
        weekly: function() {
            this.display.empty();
            this.display
                .append($('<div></div>')
                .css({'padding': (this.options.height-25)/5
                                 + 'px 0px '
                                 + (this.options.height-25)/10
                                 + 'px'})
                    .append(_radio('recurCalWeekly', 'recurCalOften', ''))
                    .append('Every')
                    .append('<select id="recurCalWeeks"><select/> week(s)')
                )
                .append($('<ul class="dayList" id="recurCalayList"></ul>')
                    .append($('<li></li>')
                        .append(_checkBox('Sunday'))
                        .append('Sunday')
                    ).append($('<li></li>')
                        .append(_checkBox('Monday'))
                        .append('Monday')
                    ).append($('<li></li>')
                        .append(_checkBox('Tuesday'))
                        .append('Tuesday')
                    ).append($('<li></li>')
                        .append(_checkBox('Wednesday'))
                        .append('Wednesday')
                    ).append($('<li></li>')
                        .append(_checkBox('Thursday'))
                        .append('Thursday')
                    ).append($('<li></li>')
                        .append(_checkBox('Friday'))
                        .append('Friday')
                    ).append($('<li></li>')
                        .append(_checkBox('Saturday'))
                        .append('Saturday')
                    )
                );
            var weeks = $('#recurCalWeeks');
            for(var i=1; i<5; i++) {
                weeks.append('<option value='+i+'>'+i+'</option>');
            }
            $('#recurCalWeekly').prop('checked', true);
        },
        // monthly radio button clicked
        monthly: function() {
            this.display.empty();
            this.display
                .append($('<div></div>')
                .css({'padding': (this.options.height-25)/5
                                 + 'px 0px '
                                 + (this.options.height-25)/10
                                 + 'px'})
                    .append(_radio('recurCalDateOfMonthly', 'recurCalOften', ''))
                    .append('Day')
                    .append('<select id="recurCalDate"></select> of every')
                    .append('<select id="recurCalDateMonths"><select> month(s)')
                )
                .append($('<div></div>')
                .css({'padding': (this.options.height-25)/5
                                 + 'px 0px '
                                 + (this.options.height-25)/10
                                 + 'px'})
                    .append(_radio('recurCalDayOfMonthly', 'recurCalOften', ''))
                    .append('The')
                    .append($('<select id="recurCalOrdinal"></select>')
                        .append('<option value="first">first</option>')
                        .append('<option value="second">second</option>')
                        .append('<option value="third">third</option>')
                        .append('<option value="fourth">fourth</option>')
                        .append('<option value="last">last</option>')
                    )
                    .append($('<select id="recurCalDay"></select>')
                        .append('<option value="Sunday">Sunday</option>')
                        .append('<option value="Monday">Monday</option>')
                        .append('<option value="Tuesday">Tuesday</option>')
                        .append('<option value="Wednesday">Wednesday</option>')
                        .append('<option value="Thursday">Thursday</option>')
                        .append('<option value="Friday">Friday</option>')
                        .append('<option value="Saturday">Saturday</option>')
                    )
                    .append('of every <select id="recurCalDayMonths"/> month(s)')
                    .append('<br/><input type="checkbox" id="recurCalAfter"/> After First Monday?')
                );
            var days = $('#recurCalDate');
            for(var i=1; i<32; i++) {
                days.append('<option value='+i+'>'+i+'</option>');
            }
            var month = $('#recurCalDateMonths');
            var months = $('#recurCalDayMonths');
            for(var i=1; i<13; i++) {
                month.append('<option value='+i+'>'+i+'</option>');
                months.append('<option value='+i+'>'+i+'</option>');
            }
            $('#recurCalDateOfMonthly').prop('checked', true);
        },
        // yearly radio button clicked
        yearly: function() {
            this.display.empty();
            this.display
                .append($('<div></div>')
                .css({'padding': (this.options.height-25)/5
                                 + 'px 0px '
                                 + (this.options.height-25)/10
                                 + 'px'})
                    .append(_radio('recurCalDateOfMonthYearly', 'recurCalOften', ''))
                    .append('Every ')
                    .append($('<select id="recurCalTopMonth"></select>')
                        .append('<option value="January">January</option>')
                        .append('<option value="February">February</option>')
                        .append('<option value="March">March</option>')
                        .append('<option value="April">April</option>')
                        .append('<option value="May">May</option>')
                        .append('<option value="June">June</option>')
                        .append('<option value="July">July</option>')
                        .append('<option value="August">August</option>')
                        .append('<option value="September">September</option>')
                        .append('<option value="October">October</option>')
                        .append('<option value="November">November</option>')
                        .append('<option value="December">December</option>')
                    )
                        .append('<select id="recurCalDate"></select>')
                )
                .append($('<div></div>')
                .css({'padding': (this.options.height-25)/5
                                 + 'px 0px '
                                 + (this.options.height-25)/10
                                 + 'px'})
                    .append(_radio('recurCalDayOfMonthYearly', 'recurCalOften', ''))
                    .append('The ')
                    .append($('<select id="recurCalOrdinal"></select>')
                        .append('<option value="first">first</option>')
                        .append('<option value="second">second</option>')
                        .append('<option value="third">third</option>')
                        .append('<option value="fourth">fourth</option>')
                        .append('<option value="last">last</option>')
                    )
                    .append($('<select id="recurCalDay"></select>')
                        .append('<option value="Sunday">Sunday</option>')
                        .append('<option value="Monday">Monday</option>')
                        .append('<option value="Tuesday">Tuesday</option>')
                        .append('<option value="Wednesday">Wednesday</option>')
                        .append('<option value="Thursday">Thursday</option>')
                        .append('<option value="Friday">Friday</option>')
                        .append('<option value="Saturday">Saturday</option>')
                    )
                    .append(' of ')
                    .append($('<select id="recurCalMonth"></select>')
                        .append('<option value="January">January</option>')
                        .append('<option value="February">February</option>')
                        .append('<option value="March">March</option>')
                        .append('<option value="April">April</option>')
                        .append('<option value="May">May</option>')
                        .append('<option value="June">June</option>')
                        .append('<option value="July">July</option>')
                        .append('<option value="August">August</option>')
                        .append('<option value="September">September</option>')
                        .append('<option value="October">October</option>')
                        .append('<option value="November">November</option>')
                        .append('<option value="December">December</option>'))
                );
            var days = $('#recurCalDate');
            for(var i=1; i<32; i++) {
                days.append('<option value='+i+'>'+i+'</option>');
            }
            $('#recurCalDateOfMonthYearly').prop('checked', true);
        },
        // get value of selected recurrance
        value: function() {
            var value = false;
            // figure out which radio is checked, ensure inputs contain integer
            switch ($('input[name="recurCalOften"]:checked').attr('id')) {
                case 'recurCalDaily':
                    var days = $('#recurCalDays').val()
                    if($.isNumeric(days)
                    && Math.floor(days) == days)
                        value = {'days': days,
                                 'string': "Every " + days + ' day(s)'};
                    break;
                case 'recurCalWeekly':
                    var days = [];
                    $('input[name="recurCalDays[]"]:checked').each(function (){
                        days.push($(this).val());
                    });
                    var weeks = $('#recurCalWeeks').val();
                    if( days.length > 0
                    && $.isNumeric(weeks)
                    && Math.floor(weeks) == weeks) {
                        value = {'weeks': weeks,
                                 'days': days,
                                 'string': 'Every ' + weeks + ' week(s) on ' + days.join()};
                    }
                    break;
                case 'recurCalDateOfMonthly':
                    var date = $('#recurCalDate').val(),
                        months = $('#recurCalDateMonths').val();
                    if($.isNumeric(date)
                    && $.isNumeric(months)
                    && Math.floor(date) == date
                    && Math.floor(months) == months) {
                        value = {'date': date,
                                 'months': months,
                                 'string': 'Day ' + date + ' of every ' + months + ' month(s)'
                                };
                    }
                    break;
                case 'recurCalDayOfMonthly':
                    var after;
                    var months = $('#recurCalDayMonths').val();
                    if(after = $('#recurCalAfter').is(':checked')) {
                        var afterText = ' after the first Monday';
                    } else {
                        var afterText = '';
                    }
                    value = {'ordinal': $('#recurCalOrdinal').val(),
                             'day': $('#recurCalDay').val(),
                             'months': months,
                             'string': 'The ' + $('#recurCalOrdinal').val() + ' ' + $('#recurCalDay').val() + afterText + ' of every ' + months + ' month(s)',
                             'after': after
                            };
                   break;
                case 'recurCalDateOfMonthYearly':
                    var date = $('#recurCalDate').val();
                    if($.isNumeric(date)
                    && Math.floor(date) == date) {
                        value = {'date': date,
                                 'month': $('#recurCalTopMonth').val(),
                                 'string': 'Every ' + $('#recurCalTopMonth').val() + ' ' + date
                                };
                    }
                    break;
                case 'recurCalDayOfMonthYearly':
                    value = {'ordinal': $('#recurCalOrdinal').val(),
                             'day': $('#recurCalDay').val(),
                             'month': $('#recurCalMonth').val(),
                             'string': 'The ' + $('#recurCalOrdinal').val() + ' ' + $('#recurCalDay').val() + ' of ' + $('#recurCalMonth').val()
                            };
                    break;
            }
            if (value) {
                // convert time entered to GMT and add to return value
                var start = $('#recurCalStart').val();
                start = start.split(/[- :]/g);
                start = new Date(start[0], start[1]-1, start[2], start[3], start[4]);
                value.start = start.toUTCString();

                var finish = $('#recurCalFinish').val();
                finish = finish.split(/[- :]/g);
                finish = new Date(finish[0], finish[1]-1, finish[2], finish[3], finish[4]);
                value.finish = finish.toUTCString();
            }
            return value;
        },
        // load an existing value into the widget to edit or display
        load: function(event) {
            // build bitWise of date, day, days, weeks, month, months, ordinal
            var go = '';
            (event.hasOwnProperty('date')) ? go += 1: go += 0;
            (event.hasOwnProperty('day')) ? go += 1: go += 0;
            (event.hasOwnProperty('days')) ? go += 1: go += 0;
            (event.hasOwnProperty('weeks')) ? go += 1: go += 0;
            (event.hasOwnProperty('month')) ? go += 1: go += 0;
            (event.hasOwnProperty('months')) ? go += 1: go += 0;
            (event.hasOwnProperty('ordinal')) ? go += 1: go += 0;
            // set start and end times to local
            $('#recurCalStart').val(convertToInput(event.start));
            $('#recurCalFinish').val(convertToInput(event.finish));
            // using bitwise open correct display and populate data fields
            switch(go) {
                case '0010000':
                    this.daily();
                    $('#recurCalDays').val(event.days);
                    $('#recurCaldaily').prop('checked', true);
                    break;
                case '0011000':
                    this.weekly();
                    $(':checkbox').each(function (){
                        if($.inArray($(this).val(), event.days)>-1)
                        {
                            $(this).prop('checked', true);
                        }
                    });
                    $('#recurCalWeeks').val(event.weeks);
                    $('#recurCalweekly').prop('checked', true);
                    break;
                case '1000010':
                    this.monthly();
                    $('#recurCalDateOfMonthly').prop('checked', true);
                    $('#recurCalDate').val(event.date);
                    $('#recurCalDateMonths').val(event.months);
                    $('#recurCalMonthly').prop('checked', true);
                    break;
                case '0100011':
                    this.monthly();
                    $('#recurCalDayOfMonthly').prop('checked', true);
                    $('#recurCalDayMonths').val(event.months);
                    $('#recurCalOrdinal').val(event.ordinal);
                    $('#recurCalDay').val(event.day);
                    if(event.after) {
                        $('#recurCalAfter').prop('checked', true);
                    }
                    $('#recurCalMonthly').prop('checked', true);
                    break;
                case '1000100':
                    this.yearly();
                    $('#recurCalDateOfMonthYearly').prop('checked', true);
                    $('#recurCalDate').val(event.date);
                    $('#recurCalTopMonth').val(event.month);
                    $('#recurCalYearly').prop('checked', true);
                    break;
                case '0100101':
                    this.yearly();
                    $('#recurCalDayOfMonthYearly').prop('checked', true);
                    $('#recurCalOrdinal').val(event.ordinal);
                    $('#recurCalDay').val(event.day);
                    $('#recurCalMonth').val(event.month);
                    $('#recurCalYearly').prop('checked', true);
                    break;
            }
        },

        fetch: function(event, begin, end) {
            return _events(event, begin, end, false);
        },

        current: function(event) {
            return _events(event, false, false, true);
        },

        clear: function() {
            this.display.empty();
            $('#recurCalForm')[0].reset();
        },

        destroy: function() {
            this.element.next().remove();
        }
        /* to be done, no options to change yet
        _setOption: function(option, value) {
            $.widget.prototype._setOption.apply( this, arguments );

            var el = this.element,
            cap = el.next(),
            capHeight = cap.outerHeight() - parseInt(cap.css("paddingTop")) + parseInt(cap.css("paddingBottom"));

            switch (option) {
                case "location":
                    (value === "top") ? cap.css("top", el.offset().top) : cap.css("top", el.offset().top + el.height() - capHeight);
                    break;
                case "color":
                    el.next().css("color", value);
                    break;
                case "backgroundColor":
                    el.next().css("backgroundColor", value);
                    break;
            }
        }*/
    });
    // handle UTC dates to local
    function convertToInput(UTC) {
        var iTime = new Date(UTC);
        var year = iTime.getFullYear();
        var mo = (iTime.getMonth()+1).toString();
        var da = iTime.getDate().toString();
        var hr = iTime.getHours().toString();
        var mn = iTime.getMinutes().toString();
        if (mo.length == 1){mo = '0' + mo;}
        if (da.length == 1){da = '0' + da;}
        if (hr.length == 1){hr = '0' + hr;}
        if (mn.length == 1){mn = '0' + mn;}
        return year + '-' + mo + '-' + da + ' ' + hr + ':' + mn;
    }
    // return copy of input dictionary
    function cloneDates(next) {
        var clone = {};
        for( var key in next ){
            if(next.hasOwnProperty(key)) //ensure not adding inherited props
                clone[key] = new Date(next[key]);
        }
        return clone;
    }
    // build radio button
    function _radio(id, name, onclick) {
        return $('<input type="radio" name="'+name+'" id="'+id+'" onclick="'+onclick+'"/>');
    }
    // build check box
    function _checkBox(value) {
        return $('<input name=recurCalDays[] type="checkbox" value="' + value + '" id=recurCal+this.value />');
    }
    // checks d is date, and if valid, returns false
    function _isInvalidDate(d) {
        if ( Object.prototype.toString.call(d) !== "[object Date]" )
            return true;
        return isNaN(d.getTime());
    }
    // fetch and current,
    function _events(event, begin, end, current) {
        // build bitWise of date, day, days, weeks, month, months, ordinal
        var go = '',
            next = {},
            events = [],
            determine,
            send;
        (event.hasOwnProperty('date')) ? go += 1: go += 0;
        (event.hasOwnProperty('day')) ? go += 1: go += 0;
        (event.hasOwnProperty('days')) ? go += 1: go += 0;
        (event.hasOwnProperty('weeks')) ? go += 1: go += 0;
        (event.hasOwnProperty('month')) ? go += 1: go += 0;
        (event.hasOwnProperty('months')) ? go += 1: go += 0;
        (event.hasOwnProperty('ordinal')) ? go += 1: go += 0;
        if (current) {
            var now = new Date();
            var begin = new Date(); begin.setFullYear(begin.getFullYear() -1);
            var end = new Date(); end.setDate(end.getDate() +1);
        } else {
            // check begin and end, if not date objects or formatted strings,
            // default to today 00:00 and today 23:59 respectively
            if(_isInvalidDate(begin)) {
                if(typeof(begin) == typeof(' ')) {
                    begin = begin.split(/[- :]/g);
                    begin = new Date(begin[0], begin[1]-1, begin[2], begin[3], begin[4]);
                }
                if(_isInvalidDate(begin)) {
                    begin = new Date();
                    begin.setHours(0);
                    begin.setMinutes(0);
                    begin.setSeconds(0);
                }
            }
            if(_isInvalidDate(end)) {
                if(typeof(end) == typeof(' ')) {
                    end = end.split(/[- :]/g);
                    end = new Date(end[0], end[1]-1, end[2], end[3], end[4]);
                }
                if(_isInvalidDate(end)) {
                    end = new Date();
                    end.setHours(23);
                    end.setMinutes(59);
                    end.setSeconds(59);
                }
            }
        }
        // turn start and finish strings into date Objects to send to functions
        next['start'] = new Date(event.start);
        var diff =  new Date(event.finish).getTime() - next['start'].getTime();
        // use bitwise to determine which and how to call function
        first = next['start'].getTime();
        switch(go) {
            case '0010000':
                next['start'].setDate(next['start'].getDate() - Math.floor(event.days));
                determine = _nextDay;
                send = {'days': event.days,
                        'begin': begin,
                        'end': end};
                break;
            case '0011000':
                next['start'].setDate(next['start'].getDate() - Math.floor(event.weeks*7) - next['start'].getDay());
                determine = _getWeeks;
                send = {'days': event.days,
                    'weeks': event.weeks,
                    'begin': begin,
                    'end': end
                       };
                break;
            case '1000010':
                next['start'].setMonth(next['start'].getMonth() - Math.floor(event.months));
                determine = _getMonthly;
                send = {'date': event.date,
                        'months': event.months,
                        'begin': begin,
                        'end': end
                       };
                break;
            case '0100011':
                next['start'].setMonth(next['start'].getMonth() - Math.floor(event.months));
                determine = _getDay;
                send = {'ordinal': event.ordinal,
                        'days': [event.day],
                        'months': event.months,
                        'begin': begin,
                        'end': end,
                        'after': event.after,
                       };
                break;
            case '1000100':
                determine = _getYearlyDate;
                send = {'date': event.date,
                        'month': event.month,
                        'begin': begin,
                        'end': end
                       };
                break;
            case '0100101':
                determine = _getDay;
                send = {'ordinal': event.ordinal,
                        'days': [event.day],
                        'month': event.month,
                        'months': 0,
                        'begin': begin,
                        'end': end
                        };
                break;
        }
        if(current) {
            // return instance if it is currently happening
            while(next['start'].getTime() < end.getTime()) {
                next['start'] = determine(next['start'], send);
                next['finish'] = new Date(next['start'].getTime() + diff);
                if(next['start'].getTime() <= now.getTime() && now.getTime() <= next['finish'].getTime()) {
                    return next;
                }
            }
            return false;
        } else {
            // gets all instances from begin to end
            while(next['start'].getTime() < end.getTime()) {
                next['start'] = determine(next['start'], send);
                next['finish'] = new Date(next['start'].getTime() + diff);
                // as long as the event starts after begin and before end, we will include it
                if(next['start'].getTime() >= first
                && next['start'].getTime() >= begin.getTime()
                && next['start'].getTime() <= end.getTime()) {
                    // cloneDates pushes a copy of the dates into the array
                    // without just a reference is added, and then they're all the same when returned
                    events.push(cloneDates(next));
                }
            }
            return events;
        }
    }
    // return date (days) days after start when date >= begin
    function _nextDay(start, event) {
        if (_isInvalidDate(start)) {
            start = new Date();
        }
        do {
            start.setDate(start.getDate() + Math.floor(event.days));
        } while(start < event.begin);
        return start;
    }
    // return next date following pattern
    function _getDay(time, options) {
        var ordinal = options['ordinal'], // next, first, second, third, fourth, last
        days = [], // list of day names can be empty
        day = null, // the day we end up looking for
        offset = {'mon': 1,'tue': 2,'wed': 3,'thu': 4,'fri': 5,'sat': 6,'sun': 0};
        if (_isInvalidDate(time)){
            // if time is not valid, use yesterday, so we can return today
            time = new Date();
            time.setDate(time.getDate()-1);
        }
        // figure out which day of the week we should be looking for.
        // finds the first day of week included in days, after time
        for(var i=options['days'].length-1; i>=0; i--) {
            var check = offset[options['days'][i].slice(0,3).toLowerCase()]
            days.push(check);
            if (check > time.getDay())
                day = check;
        }
        // there wasn't a day after time so we'll use the lowest number included in days
        if(!day) {
            day = days.sort()[0];
        }
        // create a date, set to the first of options['months'] ago
        // with the correct hour and minutes... this allows us to get to today if nessecary
        var d = new Date (time.getFullYear(), time.getMonth(), 1, time.getHours(), time.getMinutes(), time.getSeconds());
        // if month is specified, set to first of that month last year
        if (options['month']) {
            d.setMonth(monthArr[options['month']]);
            d.setFullYear(d.getFullYear() - 1);
        }
        // get the offset to set d to the correct dayOfWeek
        var offSet = d.getDate() + day - d.getDay();
        if (offSet < 1)
            offSet += 7;
        d.setDate(offSet);// we end up with the first dayOfWeek of last month, maybe a year ago
        do {
            if(options['months'] != 0) { // a number of months has been set, add those months back
                d.setMonth(d.getMonth() + Math.floor(options['months']));
                d.setDate(1);
                offSet = d.getDate() + day - d.getDay();
                if (offSet < 1)
                    offSet += 7;
                d.setDate(offSet);
            } else if (options['month']) { // a month was specified, add 1 year set back to first dayOfWeek
                d.setFullYear(d.getFullYear() + 1);
                d.setDate(1);
                offSet = d.getDate() + day - d.getDay();
                if (offSet < 1)
                    offSet += 7;
                d.setDate(offSet);
            }
            switch (ordinal) {
                case 'first':
                    if(options['after']) {
                        if ((day == 0 && d.getDate() < 7)
                        || (day > 0 && d.getDate() < day )) {
                            d.setDate(d.getDate() + Math.floor(7));
                            return d;
                        }
                    }
                    break;
                case 'next':
                    while (time>=d)
                    {
                        d.setDate(d.getDate() + 7);
                    }
                    return d;
                    break;
                case 'second':
                    d.setDate(d.getDate() + 7);
                    if(options['after']) {
                        if ((day == 0 && d.getDate() < 14)
                        || (day > 0 && d.getDate() < day + 7 )) {
                            d.setDate(d.getDate() + Math.floor(7));
                            return d;
                        }
                    }
                    break;
                case 'third':
                    d.setDate(d.getDate() + 14);
                    if(options['after']) {
                        if ((day == 0 && d.getDate() < 21)
                        || (day > 0 && d.getDate() < day + 14 )) {
                            d.setDate(d.getDate() + Math.floor(7));
                            return d;
                        }
                    }
                    break;
                case 'fourth':
                    d.setDate(d.getDate() + 21);
                    if(options['after']) {
                        if ((day == 0 && d.getDate() < 28)
                        || (day > 0 && d.getDate() < day + 21 )) {
                            d.setDate(d.getDate() + Math.floor(7));
                            return d;
                        }
                    }
                    break;
                case 'last':
                    d.setDate(d.getDate() + 28);
                    if (d.getDate() <= 7)
                        d.setDate(d.getDate() - 7);
                    break;
            }
        } while (options['begin'] > d || time >= d);
        return d;
    }
    // get next instance of weekly
    function _getWeeks(time, options) {
        var days = [], // list of day names can be empty
        day = null, // the day of week we end up looking for
        offset = {
            'sun': 0,
            'mon': 1,
            'tue': 2,
            'wed': 3,
            'thu': 4,
            'fri': 5,
            'sat': 6,
        };
        if (_isInvalidDate(time)){
            // if time is not valid, use yesterday, so we can return today
            time = new Date();
            time.setDate(time.getDate()-1);
        }
        // with the correct hour and minutes...
        var d = new Date(time);
        // figure out which day of the week we should be looking for.
        // finds the first day of week included in days, after time
        for(var i=options['days'].length-1; i>=0; i--) {
            var check = offset[options['days'][i].slice(0,3).toLowerCase()]
            days.push(check);
            if (check > time.getDay())
                day = check;
        }
        // there wasn't a day after time so we'll use the lowest number included in days
        if(!day) {
            day = days.sort()[0];
            d.setDate(d.getDate() + Math.floor(7*options['weeks']));
        }

        // get the offset to set d to the correct dayOfWeek
        var offSet = d.getDate() + day - d.getDay();
        if (offSet < 1)
            offSet += 7;
        d.setDate(offSet);// we end up with the next dayOfWeek of x weeks ago
        while (time.getTime() >= d.getTime())
        {
            d.setDate(d.getDate() + Math.floor(7*options['weeks']));
        }
        return d;
    }
    // return next instance of day of month
    function _getMonthly(time, options) {
        if (_isInvalidDate(time)){
            time = new Date();
        }
        var d = new Date(time);
        d.setDate(options['date']);
        while(time >= d) {
            d.setMonth(Math.floor(d.getMonth()) + Math.floor(options['months']));
        }
        return d
    }
    var monthArr = {'January': 0, 'February': 1,'March': 2,'April': 3,'May': 4,'June':5,
              'July':6,'August':7,'September':8,'October':9,'November':10,'December':11};

    function _getYearlyDate(time, options) {
        if (_isInvalidDate(time)){
            time = new Date();
        }
        var d = new Date(time.getFullYear(), monthArr[options.month], options.date, time.getHours(), time.getMinutes());
        while (d <= time) {
            d.setFullYear(d.getFullYear() + 1);
        }
        return d;
    }

})(jQuery);
