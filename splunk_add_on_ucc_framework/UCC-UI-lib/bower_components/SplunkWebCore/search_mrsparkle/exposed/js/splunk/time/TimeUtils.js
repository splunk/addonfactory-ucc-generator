define(function(require, exports, module) {

    var Class = require("jg/Class");
    var DateTime = require("splunk/time/DateTime");
    var Duration = require("splunk/time/Duration");
    var SimpleTimeZone = require("splunk/time/SimpleTimeZone");
    var TimeZones = require("splunk/time/TimeZones");

    return Class(module.id, function(TimeUtils) {

        // Public Static Constants

        TimeUtils.EPOCH = new DateTime(0).toUTC();

        // Public Static Methods

        TimeUtils.daysInMonth = function(date) {
            date = new DateTime(date.getYear(), date.getMonth() + 1, 0, 0, 0, 0, TimeZones.UTC);
            return date.getDay();
        };

        TimeUtils.addDurations = function(duration1, duration2) {
            return new Duration(duration1.years + duration2.years, duration1.months + duration2.months, duration1.days + duration2.days, duration1.hours + duration2.hours, duration1.minutes + duration2.minutes, duration1.seconds + duration2.seconds);
        };

        TimeUtils.addDateDuration = function(date, duration) {
            if ((duration.years == 0) && (duration.months == 0) && (duration.days == 0)) {
                date = date.clone();
            } else {
                date = new DateTime(date.getYear() + duration.years, date.getMonth() + duration.months, date.getDay() + duration.days, date.getHours(), date.getMinutes(), date.getSeconds(), date.getTimeZone());
            }
            date.setTime(date.getTime() + (duration.hours * 3600 + duration.minutes * 60 + duration.seconds));
            return date;
        };

        TimeUtils.subtractDates = function(date1, date2) {
            date2 = date2.toTimeZone(date1.getTimeZone());

            var isNegative = (date1.getTime() < date2.getTime());
            if (isNegative) {
                var temp = date1;
                date1 = date2;
                date2 = temp;
            }

            var sameTimeZoneOffset = (date1.getTimeZoneOffset() == date2.getTimeZoneOffset());

            var years;
            var months;
            var days;
            var hours;
            var minutes;
            var seconds;

            var date3;
            if (sameTimeZoneOffset) {
                date3 = date1;
            } else if ((date1.getYear() == date2.getYear()) && (date1.getMonth() == date2.getMonth()) && (date1.getDay() == date2.getDay())) {
                date3 = date2;
            } else {
                date3 = new DateTime(date1.getYear(), date1.getMonth(), date1.getDay(), date2.getHours(), date2.getMinutes(), date2.getSeconds(), date2.getTimeZone());
                if (date3.getTime() > date1.getTime()) {
                    date3 = new DateTime(date1.getYear(), date1.getMonth(), date1.getDay() - 1, date2.getHours(), date2.getMinutes(), date2.getSeconds(), date2.getTimeZone());
                    if ((date3.getTime() < date2.getTime()) || ((date3.getYear() == date2.getYear()) && (date3.getMonth() == date2.getMonth()) && (date3.getDay() == date2.getDay()))) {
                        date3 = date2;
                    }
                }
            }

            years = date3.getYear() - date2.getYear();
            months = date3.getMonth() - date2.getMonth();
            days = date3.getDay() - date2.getDay();

            if (sameTimeZoneOffset) {
                hours = date3.getHours() - date2.getHours();
                minutes = date3.getMinutes() - date2.getMinutes();
                seconds = date3.getSeconds() - date2.getSeconds();

                if (seconds < 0) {
                    seconds += 60;
                    minutes--;
                }

                if (minutes < 0) {
                    minutes += 60;
                    hours--;
                }

                if (hours < 0) {
                    hours += 24;
                    days--;
                }

                seconds = _normalizePrecision(seconds);
            } else {
                seconds = date1.getTime() - date3.getTime();
                var wholeSeconds = Math.floor(seconds);
                var subSeconds = _normalizePrecision(seconds - wholeSeconds);
                if (subSeconds >= 1) {
                    subSeconds = 0;
                    wholeSeconds++;
                }

                minutes = Math.floor(wholeSeconds / 60);
                seconds = (wholeSeconds % 60) + subSeconds;

                hours = Math.floor(minutes / 60);
                minutes %= 60;
            }

            if (days < 0) {
                date3 = new DateTime(date2.getYear(), date2.getMonth() + 1, 0, 0, 0, 0, TimeZones.UTC);
                days += date3.getDay();
                months--;
            }

            if (months < 0) {
                months += 12;
                years--;
            }

            if (isNegative) {
                years = -years;
                months = -months;
                days = -days;
                hours = -hours;
                minutes = -minutes;
                seconds = -seconds;
            }

            return new Duration(years, months, days, hours, minutes, seconds);
        };

        TimeUtils.subtractDurations = function(duration1, duration2) {
            return new Duration(duration1.years - duration2.years, duration1.months - duration2.months, duration1.days - duration2.days, duration1.hours - duration2.hours, duration1.minutes - duration2.minutes, duration1.seconds - duration2.seconds);
        };

        TimeUtils.subtractDateDuration = function(date, duration) {
            if ((duration.years == 0) && (duration.months == 0) && (duration.days == 0)) {
                date = date.clone();
            } else {
                date = new DateTime(date.getYear() - duration.years, date.getMonth() - duration.months, date.getDay() - duration.days, date.getHours(), date.getMinutes(), date.getSeconds(), date.getTimeZone());
            }
            date.setTime(date.getTime() - (duration.hours * 3600 + duration.minutes * 60 + duration.seconds));
            return date;
        };

        TimeUtils.multiplyDuration = function(duration, scalar) {
            return new Duration(duration.years * scalar, duration.months * scalar, duration.days * scalar, duration.hours * scalar, duration.minutes * scalar, duration.seconds * scalar);
        };

        TimeUtils.divideDuration = function(duration, scalar) {
            return new Duration(duration.years / scalar, duration.months / scalar, duration.days / scalar, duration.hours / scalar, duration.minutes / scalar, duration.seconds / scalar);
        };

        TimeUtils.ceilDate = function(date, units) {
            var date2 = date.toTimeZone(new SimpleTimeZone(date.getTimeZoneOffset()));
            _ceilDateInternal(date2, units);
            return _toTimeZoneStable(date2, date.getTimeZone());
        };

        TimeUtils.ceilDuration = function(duration, units, referenceDate) {
            if (!referenceDate) {
                referenceDate = TimeUtils.EPOCH;
            }

            var date = TimeUtils.addDateDuration(referenceDate, duration);
            var isNegative = (date.getTime() < referenceDate.getTime());
            duration = isNegative ? TimeUtils.subtractDates(referenceDate, date) : TimeUtils.subtractDates(date, referenceDate);

            if (!units) {
                units = new Duration();
                if (duration.years > 0) {
                    units.years = 1;
                } else if (duration.months > 0) {
                    units.months = 1;
                } else if (duration.days > 0) {
                    units.days = 1;
                } else if (duration.hours > 0) {
                    units.hours = 1;
                } else if (duration.minutes > 0) {
                    units.minutes = 1;
                } else if (duration.seconds > 0) {
                    units.seconds = 1;
                }
            }

            if (isNegative) {
                _floorDurationInternal(duration, units, date);
                return TimeUtils.multiplyDuration(duration, -1);
            }

            _ceilDurationInternal(duration, units, referenceDate);
            return duration;
        };

        TimeUtils.floorDate = function(date, units) {
            var date2 = date.toTimeZone(new SimpleTimeZone(date.getTimeZoneOffset()));
            _floorDateInternal(date2, units);
            return _toTimeZoneStable(date2, date.getTimeZone());
        };

        TimeUtils.floorDuration = function(duration, units, referenceDate) {
            if (!referenceDate) {
                referenceDate = TimeUtils.EPOCH;
            }

            var date = TimeUtils.addDateDuration(referenceDate, duration);
            var isNegative = (date.getTime() < referenceDate.getTime());
            duration = isNegative ? TimeUtils.subtractDates(referenceDate, date) : TimeUtils.subtractDates(date, referenceDate);

            if (!units) {
                units = new Duration();
                if (duration.years > 0) {
                    units.years = 1;
                } else if (duration.months > 0) {
                    units.months = 1;
                } else if (duration.days > 0) {
                    units.days = 1;
                } else if (duration.hours > 0) {
                    units.hours = 1;
                } else if (duration.minutes > 0) {
                    units.minutes = 1;
                } else if (duration.seconds > 0) {
                    units.seconds = 1;
                }
            }

            if (isNegative) {
                _ceilDurationInternal(duration, units, date);
                return TimeUtils.multiplyDuration(duration, -1);
            }

            _floorDurationInternal(duration, units, referenceDate);
            return duration;
        };

        TimeUtils.roundDate = function(date, units) {
            var date2 = date.toTimeZone(new SimpleTimeZone(date.getTimeZoneOffset()));
            _roundDateInternal(date2, units);
            return _toTimeZoneStable(date2, date.getTimeZone());
        };

        TimeUtils.roundDuration = function(duration, units, referenceDate) {
            if (!referenceDate) {
                referenceDate = TimeUtils.EPOCH;
            }

            var date = TimeUtils.addDateDuration(referenceDate, duration);
            var isNegative = (date.getTime() < referenceDate.getTime());
            duration = isNegative ? TimeUtils.subtractDates(referenceDate, date) : TimeUtils.subtractDates(date, referenceDate);

            if (!units) {
                units = new Duration();
                if (duration.years > 0) {
                    units.years = 1;
                } else if (duration.months > 0) {
                    units.months = 1;
                } else if (duration.days > 0) {
                    units.days = 1;
                } else if (duration.hours > 0) {
                    units.hours = 1;
                } else if (duration.minutes > 0) {
                    units.minutes = 1;
                } else if (duration.seconds > 0) {
                    units.seconds = 1;
                }
            }

            if (isNegative) {
                _roundDurationInternal(duration, units, date);
                return TimeUtils.multiplyDuration(duration, -1);
            }

            _roundDurationInternal(duration, units, referenceDate);
            return duration;
        };

        TimeUtils.normalizeDuration = function(duration, referenceDate) {
            if (!referenceDate) {
                referenceDate = TimeUtils.EPOCH;
            }

            var date = TimeUtils.addDateDuration(referenceDate, duration);
            return TimeUtils.subtractDates(date, referenceDate);
        };

        TimeUtils.durationToSeconds = function(duration, referenceDate) {
            if (!referenceDate) {
                referenceDate = TimeUtils.EPOCH;
            }

            var date = TimeUtils.addDateDuration(referenceDate, duration);
            return _normalizePrecision(date.getTime() - referenceDate.getTime());
        };

        TimeUtils.secondsToDuration = function(seconds, referenceDate) {
            if (!referenceDate) {
                referenceDate = TimeUtils.EPOCH;
            }

            var date = new DateTime(referenceDate.getTime() + seconds).toTimeZone(referenceDate.getTimeZone());
            return TimeUtils.subtractDates(date, referenceDate);
        };

        // Private Static Methods

        var _ceilDateInternal = function(date, units) {
            var ceilYear = (units.years > 0);
            var ceilMonth = ceilYear || (units.months > 0);
            var ceilDay = ceilMonth || (units.days > 0);
            var ceilHours = ceilDay || (units.hours > 0);
            var ceilMinutes = ceilHours || (units.minutes > 0);
            var ceilSeconds = ceilMinutes || (units.seconds > 0);

            if (!ceilSeconds) {
                return;
            }

            if (date.getSeconds() > 0) {
                if (units.seconds > 0) {
                    date.setSeconds(Math.min(Math.ceil(date.getSeconds() / units.seconds) * units.seconds, 60));
                } else {
                    date.setSeconds(60);
                }
            }

            if (!ceilMinutes) {
                return;
            }

            if (date.getMinutes() > 0) {
                if (units.minutes > 0) {
                    date.setMinutes(Math.min(Math.ceil(date.getMinutes() / units.minutes) * units.minutes, 60));
                } else {
                    date.setMinutes(60);
                }
            }

            if (!ceilHours) {
                return;
            }

            if (date.getHours() > 0) {
                if (units.hours > 0) {
                    date.setHours(Math.min(Math.ceil(date.getHours() / units.hours) * units.hours, 24));
                } else {
                    date.setHours(24);
                }
            }

            if (!ceilDay) {
                return;
            }

            if (date.getDay() > 1) {
                var daysInMonth = TimeUtils.daysInMonth(date);
                if (units.days > 0) {
                    date.setDay(Math.min(Math.ceil((date.getDay() - 1) / units.days) * units.days, daysInMonth) + 1);
                } else {
                    date.setDay(daysInMonth + 1);
                }
            }

            if (!ceilMonth) {
                return;
            }

            if (date.getMonth() > 1) {
                if (units.months > 0) {
                    date.setMonth(Math.min(Math.ceil((date.getMonth() - 1) / units.months) * units.months, 12) + 1);
                } else {
                    date.setMonth(12 + 1);
                }
            }

            if (!ceilYear) {
                return;
            }

            if (units.years > 0) {
                date.setYear(Math.ceil(date.getYear() / units.years) * units.years);
            }
        };

        var _ceilDurationInternal = function(duration, units, referenceDate) {
            var ceilYears = (units.years > 0);
            var ceilMonths = ceilYears || (units.months > 0);
            var ceilDays = ceilMonths || (units.days > 0);
            var ceilHours = ceilDays || (units.hours > 0);
            var ceilMinutes = ceilHours || (units.minutes > 0);
            var ceilSeconds = ceilMinutes || (units.seconds > 0);

            var daysInMonth = TimeUtils.daysInMonth(referenceDate);

            if (!ceilSeconds) {
                return;
            }

            if (duration.seconds > 0) {
                if (units.seconds > 0) {
                    duration.seconds = Math.min(Math.ceil(duration.seconds / units.seconds) * units.seconds, 60);
                } else {
                    duration.seconds = 60;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!ceilMinutes) {
                return;
            }

            if (duration.minutes > 0) {
                if (units.minutes > 0) {
                    duration.minutes = Math.min(Math.ceil(duration.minutes / units.minutes) * units.minutes, 60);
                } else {
                    duration.minutes = 60;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!ceilHours) {
                return;
            }

            if (duration.hours > 0) {
                if (units.hours > 0) {
                    duration.hours = Math.min(Math.ceil(duration.hours / units.hours) * units.hours, 24);
                } else {
                    duration.hours = 24;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!ceilDays) {
                return;
            }

            if (duration.days > 0) {
                if (units.days > 0) {
                    duration.days = Math.min(Math.ceil(duration.days / units.days) * units.days, daysInMonth);
                } else {
                    duration.days = daysInMonth;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!ceilMonths) {
                return;
            }

            if (duration.months > 0) {
                if (units.months > 0) {
                    duration.months = Math.min(Math.ceil(duration.months / units.months) * units.months, 12);
                } else {
                    duration.months = 12;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!ceilYears) {
                return;
            }

            if (units.years > 0) {
                duration.years = Math.ceil(duration.years / units.years) * units.years;
                _normalizeDuration(duration, daysInMonth);
            }
        };

        var _floorDateInternal = function(date, units) {
            var floorYear = (units.years > 0);
            var floorMonth = floorYear || (units.months > 0);
            var floorDay = floorMonth || (units.days > 0);
            var floorHours = floorDay || (units.hours > 0);
            var floorMinutes = floorHours || (units.minutes > 0);
            var floorSeconds = floorMinutes || (units.seconds > 0);

            if (!floorSeconds) {
                return;
            }

            if (date.getSeconds() > 0) {
                if (units.seconds > 0) {
                    date.setSeconds(Math.floor(date.getSeconds() / units.seconds) * units.seconds);
                } else {
                    date.setSeconds(0);
                }
            }

            if (!floorMinutes) {
                return;
            }

            if (date.getMinutes() > 0) {
                if (units.minutes > 0) {
                    date.setMinutes(Math.floor(date.getMinutes() / units.minutes) * units.minutes);
                } else {
                    date.setMinutes(0);
                }
            }

            if (!floorHours) {
                return;
            }

            if (date.getHours() > 0) {
                if (units.hours > 0) {
                    date.setHours(Math.floor(date.getHours() / units.hours) * units.hours);
                } else {
                    date.setHours(0);
                }
            }

            if (!floorDay) {
                return;
            }

            if (date.getDay() > 1) {
                if (units.days > 0) {
                    date.setDay(Math.floor((date.getDay() - 1) / units.days) * units.days + 1);
                } else {
                    date.setDay(1);
                }
            }

            if (!floorMonth) {
                return;
            }

            if (date.getMonth() > 1) {
                if (units.months > 0) {
                    date.setMonth(Math.floor((date.getMonth() - 1) / units.months) * units.months + 1);
                } else {
                    date.setMonth(1);
                }
            }

            if (!floorYear) {
                return;
            }

            if (units.years > 0) {
                date.setYear(Math.floor(date.getYear() / units.years) * units.years);
            }
        };

        var _floorDurationInternal = function(duration, units, referenceDate) {
            var floorYears = (units.years > 0);
            var floorMonths = floorYears || (units.months > 0);
            var floorDays = floorMonths || (units.days > 0);
            var floorHours = floorDays || (units.hours > 0);
            var floorMinutes = floorHours || (units.minutes > 0);
            var floorSeconds = floorMinutes || (units.seconds > 0);

            var daysInMonth = TimeUtils.daysInMonth(referenceDate);

            if (!floorSeconds) {
                return;
            }

            if (duration.seconds > 0) {
                if (units.seconds > 0) {
                    duration.seconds = Math.floor(duration.seconds / units.seconds) * units.seconds;
                } else {
                    duration.seconds = 0;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!floorMinutes) {
                return;
            }

            if (duration.minutes > 0) {
                if (units.minutes > 0) {
                    duration.minutes = Math.floor(duration.minutes / units.minutes) * units.minutes;
                } else {
                    duration.minutes = 0;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!floorHours) {
                return;
            }

            if (duration.hours > 0) {
                if (units.hours > 0) {
                    duration.hours = Math.floor(duration.hours / units.hours) * units.hours;
                } else {
                    duration.hours = 0;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!floorDays) {
                return;
            }

            if (duration.days > 0) {
                if (units.days > 0) {
                    duration.days = Math.floor(duration.days / units.days) * units.days;
                } else {
                    duration.days = 0;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!floorMonths) {
                return;
            }

            if (duration.months > 0) {
                if (units.months > 0) {
                    duration.months = Math.floor(duration.months / units.months) * units.months;
                } else {
                    duration.months = 0;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!floorYears) {
                return;
            }

            if (units.years > 0) {
                duration.years = Math.floor(duration.years / units.years) * units.years;
                _normalizeDuration(duration, daysInMonth);
            }
        };

        var _roundDateInternal = function(date, units) {
            var roundYear = (units.years > 0);
            var roundMonth = roundYear || (units.months > 0);
            var roundDay = roundMonth || (units.days > 0);
            var roundHours = roundDay || (units.hours > 0);
            var roundMinutes = roundHours || (units.minutes > 0);
            var roundSeconds = roundMinutes || (units.seconds > 0);

            if (!roundSeconds) {
                return;
            }

            if (date.getSeconds() > 0) {
                if (units.seconds > 0) {
                    date.setSeconds(Math.min(Math.round(date.getSeconds() / units.seconds) * units.seconds, 60));
                } else if (date.getSeconds() >= 30) {
                    date.setSeconds(60);
                } else {
                    date.setSeconds(0);
                }
            }

            if (!roundMinutes) {
                return;
            }

            if (date.getMinutes() > 0) {
                if (units.minutes > 0) {
                    date.setMinutes(Math.min(Math.round(date.getMinutes() / units.minutes) * units.minutes, 60));
                } else if (date.getMinutes() >= 30) {
                    date.setMinutes(60);
                } else {
                    date.setMinutes(0);
                }
            }

            if (!roundHours) {
                return;
            }

            if (date.getHours() > 0) {
                if (units.hours > 0) {
                    date.setHours(Math.min(Math.round(date.getHours() / units.hours) * units.hours, 24));
                } else if (date.getHours() >= 12) {
                    date.setHours(24);
                } else {
                    date.setHours(0);
                }
            }

            if (!roundDay) {
                return;
            }

            if (date.getDay() > 1) {
                var daysInMonth = TimeUtils.daysInMonth(date);
                if (units.days > 0) {
                    date.setDay(Math.min(Math.round((date.getDay() - 1) / units.days) * units.days, daysInMonth) + 1);
                } else if (date.getDay() >= Math.floor(daysInMonth / 2 + 1)) {
                    date.setDay(daysInMonth + 1);
                } else {
                    date.setDay(1);
                }
            }

            if (!roundMonth) {
                return;
            }

            if (date.getMonth() > 1) {
                if (units.months > 0) {
                    date.setMonth(Math.min(Math.round((date.getMonth() - 1) / units.months) * units.months, 12) + 1);
                } else if (date.getMonth() >= (6 + 1)) {
                    date.setMonth(12 + 1);
                } else {
                    date.setMonth(1);
                }
            }

            if (!roundYear) {
                return;
            }

            if (units.years > 0) {
                date.setYear(Math.round(date.getYear() / units.years) * units.years);
            }
        };

        var _roundDurationInternal = function(duration, units, referenceDate) {
            var roundYears = (units.years > 0);
            var roundMonths = roundYears || (units.months > 0);
            var roundDays = roundMonths || (units.days > 0);
            var roundHours = roundDays || (units.hours > 0);
            var roundMinutes = roundHours || (units.minutes > 0);
            var roundSeconds = roundMinutes || (units.seconds > 0);

            var daysInMonth = TimeUtils.daysInMonth(referenceDate);

            if (!roundSeconds) {
                return;
            }

            if (duration.seconds > 0) {
                if (units.seconds > 0) {
                    duration.seconds = Math.min(Math.round(duration.seconds / units.seconds) * units.seconds, 60);
                } else if (duration.seconds >= 30) {
                    duration.seconds = 60;
                } else {
                    duration.seconds = 0;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!roundMinutes) {
                return;
            }

            if (duration.minutes > 0) {
                if (units.minutes > 0) {
                    duration.minutes = Math.min(Math.round(duration.minutes / units.minutes) * units.minutes, 60);
                } else if (duration.minutes >= 30) {
                    duration.minutes = 60;
                } else {
                    duration.minutes = 0;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!roundHours) {
                return;
            }

            if (duration.hours > 0) {
                if (units.hours > 0) {
                    duration.hours = Math.min(Math.round(duration.hours / units.hours) * units.hours, 24);
                } else if (duration.hours >= 12) {
                    duration.hours = 24;
                } else {
                    duration.hours = 0;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!roundDays) {
                return;
            }

            if (duration.days > 0) {
                if (units.days > 0) {
                    duration.days = Math.min(Math.round(duration.days / units.days) * units.days, daysInMonth);
                } else if (duration.days >= Math.floor(daysInMonth / 2)) {
                    duration.days = daysInMonth;
                } else {
                    duration.days = 0;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!roundMonths) {
                return;
            }

            if (duration.months > 0) {
                if (units.months > 0) {
                    duration.months = Math.min(Math.round(duration.months / units.months) * units.months, 12);
                } else if (duration.months >= 6) {
                    duration.months = 12;
                } else {
                    duration.months = 0;
                }
                _normalizeDuration(duration, daysInMonth);
            }

            if (!roundYears) {
                return;
            }

            if (units.years > 0) {
                duration.years = Math.round(duration.years / units.years) * units.years;
                _normalizeDuration(duration, daysInMonth);
            }
        };

        var _toTimeZoneStable = function(date, timeZone) {
            var date2 = date.toTimeZone(timeZone);
            if ((date2.getYear() == date.getYear()) && (date2.getMonth() == date.getMonth()) && (date2.getDay() == date.getDay()) &&
                (date2.getHours() == date.getHours()) && (date2.getMinutes() == date.getMinutes()) && (date2.getSeconds() == date.getSeconds())) {
                return date2;
            }

            var date3 = date.clone();
            date3.setTimeZone(timeZone);
            if ((date3.getYear() == date.getYear()) && (date3.getMonth() == date.getMonth()) && (date3.getDay() == date.getDay()) &&
                (date3.getHours() == date.getHours()) && (date3.getMinutes() == date.getMinutes()) && (date3.getSeconds() == date.getSeconds())) {
                return date3;
            }

            return date2;
        };

        var _normalizeDuration = function(duration, daysInMonth) {
            var years = duration.years;
            var wholeYears = Math.floor(years);
            var subYears = years - wholeYears;

            var months = duration.months + subYears * 12;
            var wholeMonths = Math.floor(months);
            var subMonths = months - wholeMonths;

            var days = duration.days + subMonths * daysInMonth;
            var wholeDays = Math.floor(days);
            var subDays = days - wholeDays;

            var hours = duration.hours + subDays * 24;
            var wholeHours = Math.floor(hours);
            var subHours = hours - wholeHours;

            var minutes = duration.minutes + subHours * 60;
            var wholeMinutes = Math.floor(minutes);
            var subMinutes = minutes - wholeMinutes;

            var seconds = duration.seconds + subMinutes * 60;
            var wholeSeconds = Math.floor(seconds);
            var subSeconds = _normalizePrecision(seconds - wholeSeconds);
            if (subSeconds >= 1) {
                subSeconds = 0;
                wholeSeconds++;
            }

            wholeMinutes += Math.floor(wholeSeconds / 60);
            wholeSeconds %= 60;

            wholeHours += Math.floor(wholeMinutes / 60);
            wholeMinutes %= 60;

            wholeDays += Math.floor(wholeHours / 24);
            wholeHours %= 24;

            wholeMonths += Math.floor(wholeDays / daysInMonth);
            wholeDays %= daysInMonth;

            wholeYears += Math.floor(wholeMonths / 12);
            wholeMonths %= 12;

            duration.years = wholeYears;
            duration.months = wholeMonths;
            duration.days = wholeDays;
            duration.hours = wholeHours;
            duration.minutes = wholeMinutes;
            duration.seconds = wholeSeconds + subSeconds;
        };

        var _normalizePrecision = function(value) {
            return Number(value.toFixed(6));
        };

    });

});
