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
            var now = new Date();
            setValue(wrapper, now.format(format));
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
                setSelection(yearWrapper, 'year').find('select').trigger('change');
                setSelection(monthWrapper, 'month').find('select').trigger('change');
                setSelection(dayWrapper, 'day').find('select').trigger('change');
                setSelection(hourWrapper, 'hour').find('select').trigger('change');
                setSelection(minuteWrapper, 'minute').find('select').trigger('change');
                monthWrapper.find('select').trigger('change');
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
