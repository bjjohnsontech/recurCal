<?php
function bitWiseEvent($event)
{
    $bitWise = 0;
    if (array_key_exists('date', $event)) {
        $bitWise += 1000000;
    }
    if (array_key_exists('day', $event)) {
        $bitWise += 100000;
    }
    if (array_key_exists('days', $event)) {
        $bitWise += 10000;
    }
    if (array_key_exists('weeks', $event)) {
        $bitWise += 1000;
    }
    if (array_key_exists('month', $event)) {
        $bitWise += 100;
    }
    if (array_key_exists('months', $event)) {
        $bitWise += 10;
    }
    if (array_key_exists('ordinal', $event)) {
        $bitWise += 1;
    }
    return $bitWise;
}

// fetch and current
function level2Events($event)
{
    // build bitWise of date, day, days, weeks, month, months, ordinal
    $event = json_decode($event);
    $next = array();
    $events = array();
    $determine;
    $send;
    $bitWise = bitWiseEvent($event);
    // check begin and end, if not date objects or formatted strings,
    // default to today 00:00 and today 23:59 respectively
    $begin = time();
    $end = strtotime('+8 days');
    // turn start and finish strings into date Objects to send to functions
    $next['start'] = strtotime($event->start);
    // use bitwise to determine which and how to call function
    $first = $next['start'];
    switch ($bitWise) {
        case 10000:
            $next['start'] = strtotime("-{$event->days} days", $next['start']);
            $determine = '_nextDay';
            $send = array('days'=> $event->days,
                    'begin'=> $begin,
                    'end'=> $end);
            break;
        case 11000:
            $dow = (int) date( "w", $next['start']); // Day of week
            $next['start'] = strtotime("-{$dow} days, -{$event->weeks} weeks", $next['start']);
            $determine = '_getWeeks';
            $send = array('days' => $event->days,
                'weeks' => $event->weeks,
                'begin'=> $begin,
                'end' => $end
                   );
            break;
        case 1000010:
            $next['start'] = strtotime("-{$event->months} months", $next['start']);
            $determine = '_getMonthly';
            $send = array('date' => $event->date,
                    'months' => $event->months,
                    'begin' => $begin,
                    'end' => $end
                   );
            break;
        case 100011:
            $next['start'] = strtotime("-{$event->months} months", $next['start']);
            $determine = '_getDay';
            $after = (isset($event->after));
            $send = array('ordinal' => $event->ordinal,
                    'days' => array($event->day),
                    'months' => $event->months,
                    'begin' => $begin,
                    'end' => $end,
                    'after' => $after,
                   );
            break;
        case 1000100:
            $determine = '_getYearlyDate';
            $send = array('date' => $event->date,
                    'month' => $event->month,
                    'begin' => $begin,
                    'end' => $end
                   );
            break;
        case 100101:
            $determine = '_getDay';
            $send = array('ordinal' => $event->ordinal,
                    'days' => array($event->day),
                    'month' => $event->month,
                    'months' => 0,
                    'begin' => $begin,
                    'end' => $end
                    );
            break;
    }
    while ($next['start'] < $end) {
        $next['start'] = $determine($next['start'], $send);
        // as long as the event starts after begin and before end, we will include it
        if ($next['start'] >= $first
        && $next['start'] >= $begin
        && $next['start'] <= $end) {
            $events[] = $next;
        }
    }
    return $events;
}
// return date (days) days after start when date >= begin

function _findDay($options, $time) {
    $days = array();
    $day = null;
    $week = false;
    $offset = array('mon' => 1,'tue' => 2,'wed' => 3,'thu' => 4,'fri' => 5,'sat' => 6,'sun' => 0);
    // figure out which day of the week we should be looking for.
    // finds the first day of week included in days, after time
    for ($i = count($options['days'])-1; $i >= 0; $i--) {
        $check = $offset[strtolower(substr($options['days'][$i], 0, 3))];
        $days[] = $check;
        if ($check > (int) date( "w", $time)) {
            $day = $check;
        }
        // there wasn't a day after time so we'll use the lowest number included in days
        if (!isset($day)) {
            sort($days);
            $day = $days[0];
            $week = true;
        }
    }
    return array($day, $week);
}
    
function _nextDay($start, $event)
{
    do {
        $start = strtotime("+{$event['days']} days", $start);
    } while ($start < $event['begin']);

    return $start;
}
// return next date following pattern
function _getDay($time, $options)
{
    $ordinal = $options['ordinal']; // next, first, second, third, fourth, last
    //$days = array(); // list of day names can be empty
    $day = _findDay($options, $time); // the day we end up looking for
    
    // create a date, set to the first of options['months'] ago
    // with the correct hour and minutes... this allows us to get to today if nessecary
    $rDays = date('j', $time)-1;
    $d = strtotime("-{$rDays} day", $time);

    // if month is specified, set to first of that month last year
    //if (issest($options['month'])) {
    //    $d.setMonth(monthArr[options['month']]);
    //    d.setFullYear(d.getFullYear() - 1);
    //}
    // get the offset to set d to the correct dayOfWeek
    $offSet = (int) date('j',$d) + $day[0] - (int) date( "w", $d);
    if ($offSet < 1)
        $offSet += 7;
    $date = (int) date( "j", $d);
    $d = strtotime("-{$date} days", $d);
    $d = strtotime("+{$offSet} day", $d);// we end up with the first dayOfWeek of last month, maybe a year ago
    do {
        if ($options['months'] != 0) { // a number of months has been set, add those months back
            $d = strtotime("+{$options['months']} months", $d);
            $da = getdate($d);
            $rDays = $da['mday'] -1;
            $d = strtotime("-{$rDays} day", $d);
            $offSet = 1 + $day[0] - (int) date( "w", $d);
            if ($offSet < 1)
                $offSet += 7;
            $d = strtotime("+{$offSet} day", $d);
        } //else if ($options['month']) { // a month was specified, add 1 year set back to first dayOfWeek
            //d.setFullYear(d.getFullYear() + 1);
            //d.setDate(1);
            //offSet = d.getDate() + day - d.getDay();
            //if (offSet < 1)
            //    offSet += 7;
            //d.setDate(offSet);
        //}
        switch ($ordinal) {
            case 'first':
                if ($options['after']) {
                    if (($day == 0 && (int) date('j', $d) < 7)
                    || ($day > 0 && (int) date('j', $d) < $day )) {
                        $d = strtotime('+7 days', $d);
                        return $d;
                    }
                }
                break;
            case 'next':
                while ($time >= $d) {
                    $d = strtotime('+7 days', $d);
                }
                return $d;
                break;
            case 'second':
                $d = strtotime('+7 days', $d);
                if ($options['after']) {
                    if (($day == 0 && (int) date('j',$d) < 14)
                    || ($day > 0 && (int) date('j',$d) < $day + 7 )) {
                        $d = strtotime('+7 days', $d);
                        return $d;
                    }
                }
                break;
            case 'third':
                $d = strtotime('+14 days', $d);
                if ($options['after']) {
                    if (($day == 0 && (int) date('j',$d) < 21)
                    || ($day > 0 && (int) date('j',$d) < $day + 14 )) {
                        $d = strtotime('+7 days', $d);
                        return $d;
                    }
                }
                break;
            case 'fourth':
                $d = strtotime('+21 days', $d);
                if ($options['after']) {
                    if (($day == 0 && (int) date('j',$d) < 28)
                    || ($day > 0 && (int) date('j',$d) < $day + 21 )) {
                        $d = strtotime('+7 days', $d);
                        return $d;
                    }
                }
                break;
            case 'last':
                $d = strtotime('+28 days', $d);
                if ((int) date('j',$d) <= 7)
                    $d = strtotime('-7 days', $d);
                break;
        }
        //echo '<br/>begin: ', $options['begin'], '<br/>   >   <br/> d: ', $d, '<br/>time: ', $time;
    } while ($options['begin'] > $d || $time >= $d);

    return $d;
}
// get next instance of weekly
function _getWeeks($time, $options)
{
    // the date with the correct hour and minutes...
    $d = $time;
    $day = _findDay($options, $time); // the day we end up looking for
    // there wasn't a day after time so we'll use the lowest number included in days
    if ($day[1]) {
        $d = strtotime("+{$options['weeks']} weeks", $d);
    }

    // get the offset to set d to the correct dayOfWeek
    $offSet = (int) date('j',$d) + $day[0] - (int) date( "w", $d);
    if ($offSet < 1)
        $offSet += 7;
    $date = (int) date( "j", $d);
    $d = strtotime("-{$date} days", $d);
    $d = strtotime("+{$offSet} day", $d);// we end up with the next dayOfWeek of x weeks ago
    while ($time >= $d) {
        $d = strtotime("+{$options['weeks']} weeks", $d);
    }

    return $d;
}
// return next instance of day of month
function _getMonthly($time, $options)
{
    $d = $time;
    $da = getdate($d);
    $rDays = $da['mday'];// -1;
    $d = strtotime("-{$rDays} day", $d);
    $d = strtotime("+{$options['date']} day", $d);
    while ($time >= $d) {
        $d = strtotime("+{$options['months']} months", $d);
    }

    return $d;
}
//var monthArr = a{'January' => 0, 'February' => 1,'March' => 2,'April' => 3,'May' => 4,'June' =>5,
//          'July' =>6,'August' =>7,'September' =>8,'October' =>9,'November' =>10,'December' =>11};

function _getYearlyDate($time, $options)
{
    $d = time();
    $d = strtotime("{$options['date']} {$options['month']}", $d);
    while ($d <= $time) {
        $d = strtotime('+ 1 year', $d);
    }

    return $d;
}
