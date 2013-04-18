/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};
(function($) {
    if (!$) return;

    var monthNumber = function(monthName) {
        return $.inArray(monthName, ['', 'January','February','March','April','May','June','July',
        'August','September','October','November','December']);
    };

    var setValue = function(wrapper, value) {
        wrapper.find('select option').attr('selected', null);
        var selected = wrapper.find('select option[value="' + value + '"]');
        selected.attr('selected', 'selected');
        wrapper.find('.ui-button-text').html(selected.html());
        return wrapper;
    };

    var setSelection = function(wrapper, name) {
        if (wrapper) {
            var format = wrapper.find('select').data('format').replace(/"/g, '');
            setValue(wrapper, (new Date()).format(format));
        }
        return wrapper;
    };

    $.fn.dateTimeSelect = function() {
        return this.each(function() {

            var nowButton = $(this);

            if (nowButton.data('dateTimeSelect')) {
                return;
            }

            nowButton.data('dateTimeSelect', {
                enabled: true
            });

            var wrapper = $(this).closest('.form-field-date-time-select-menu');

            var yearWrapper = wrapper.find('.form-field[class$="_year"]');
            var monthWrapper = wrapper.find('.form-field[class$="_month"]');
            var dayWrapper = wrapper.find('.form-field[class$="_day"]');

            wrapper.find('.form-field[class$="_year"], .form-field[class$="_month"]').change(function() {
                selectedYear = yearWrapper.find('.ui-button-text').html();
                selectedMonth = monthNumber(monthWrapper.find('.ui-button-text').html());

                var daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                var daySelect = dayWrapper.find('select');

                selectedDay = dayWrapper.find('.ui-button-text').html();
                dayWrapper.find('select option').remove();
                for (dayIndex = 1; dayIndex < daysInMonth; dayIndex++) {
                    dayWrapper.find('select').append('<option value="' + dayIndex + '">' + dayIndex + '</option>');
                }

                if (selectedDay > daysInMonth) {
                    selectedDay = daysInMonth;
                }

                // Reinitialise day menu to ensure correct number of
                // days for current month
                daySelect.selectMenu();

                setValue(dayWrapper, selectedDay);
            });

            var hourWrapper = wrapper.find('.form-field[class$="_hour"]');
            var minuteWrapper = wrapper.find('.form-field[class$="_minute"]');

            /**
             * Set all drop downs to the current date date
             */
            nowButton.click(function(event) {
                event.preventDefault();
                setSelection(yearWrapper, 'year').find('select').trigger('click');
                setSelection(monthWrapper, 'month').find('select').trigger('click');
                setSelection(dayWrapper, 'day').find('select').trigger('click');
                setSelection(hourWrapper, 'hour').find('select').trigger('click');
                setSelection(minuteWrapper, 'minute').find('select').trigger('click');
                monthWrapper.find('select').trigger('click');
            });

            /**
             * Create timestamp from drop down values and set the hidden input's value to it
             */
            $(this).closest('form').submit(function(event) {

                var value = function(wrapper) {
                    return wrapper.find('select option[selected]').val();
                };

                var year = value(yearWrapper);
                var month = value(monthWrapper);
                var day = value(dayWrapper);
                var hour = value(hourWrapper);
                var minute = value(minuteWrapper);

                var date = new Date(year, month - 1, day, hour, minute);
                var unixTimestamp = Math.round(date.getTime() / 1000);
                wrapper.find('input[type="hidden"]').val(unixTimestamp);

                return true;
            });
        });
    };

})(jQuery);
