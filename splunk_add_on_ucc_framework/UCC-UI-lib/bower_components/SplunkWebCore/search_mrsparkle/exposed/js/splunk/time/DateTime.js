define(function(require, exports, module) {

    var Class = require("jg/Class");
    var SimpleTimeZone = require("splunk/time/SimpleTimeZone");
    var TimeZone = require("splunk/time/TimeZone");
    var TimeZones = require("splunk/time/TimeZones");

    return Class(module.id, Object, function(DateTime, base) {

        // Private Static Constants

        var _ISO_DATE_TIME_PATTERN = /([\+\-])?(\d{4,})(?:(?:\-(\d{2}))(?:(?:\-(\d{2}))(?:(?:[T ](\d{2}))(?:(?:\:(\d{2}))(?:(?:\:(\d{2}(?:\.\d+)?)))?)?(?:(Z)|([\+\-])(\d{2})(?:\:(\d{2}))?)?)?)?)?/;

        // Private Static Methods

        var _normalizePrecision = function(value) {
            return Number(value.toFixed(6));
        };

        var _pad = function(value, digits, fractionDigits) {
            /*jsl:ignore*/
            // this comparison triggers the 'useless comparison' error
            if (value != value) {
                return "NaN";
            }
            /*jsl:end*/
            if (value == Infinity) {
                return "Infinity";
            }
            if (value == -Infinity) {
                return "-Infinity";
            }

            digits = (digits !== undefined) ? digits : 0;
            fractionDigits = (fractionDigits !== undefined) ? fractionDigits : 0;

            var str = value.toFixed(20);

            var decimalIndex = str.indexOf(".");
            if (decimalIndex < 0) {
                decimalIndex = str.length;
            } else if (fractionDigits < 1) {
                str = str.substring(0, decimalIndex);
            } else {
                str = str.substring(0, decimalIndex) + "." + str.substring(decimalIndex + 1, decimalIndex + fractionDigits + 1);
            }

            for (var i = decimalIndex; i < digits; i++) {
                str = "0" + str;
            }

            return str;
        };

        // Private Properties

        this._year = 0;
        this._month = 1;
        this._day = 1;
        this._weekday = 0;
        this._hours = 0;
        this._minutes = 0;
        this._seconds = 0;
        this._timeZone = TimeZones.LOCAL;
        this._timeZoneOffset = 0;
        this._time = 0;

        this._isValid = true;

        // Constructor

        this.constructor = function(yearOrTimevalue, month, day, hours, minutes, seconds, timeZone) {
            switch (arguments.length) {
                case 0:
                    var now = new Date();
                    this._time = now.getTime() / 1000;
                    this._updateProperties();
                    break;
                case 1:
                    if (typeof yearOrTimevalue === "number") {
                        this._time = yearOrTimevalue;
                        this._updateProperties();
                    } else if (typeof yearOrTimevalue === "string") {
                        var matches = _ISO_DATE_TIME_PATTERN.exec(yearOrTimevalue);
                        var numMatches = matches ? matches.length : 0;
                        var match;

                        match = (numMatches > 1) ? matches[1] : null;
                        var yearSign = (match == "-") ? -1 : 1;

                        match = (numMatches > 2) ? matches[2] : null;
                        this._year = match ? yearSign * Number(match) : 0;

                        match = (numMatches > 3) ? matches[3] : null;
                        this._month = match ? Number(match) : 1;

                        match = (numMatches > 4) ? matches[4] : null;
                        this._day = match ? Number(match) : 1;

                        match = (numMatches > 5) ? matches[5] : null;
                        this._hours = match ? Number(match) : 0;

                        match = (numMatches > 6) ? matches[6] : null;
                        this._minutes = match ? Number(match) : 0;

                        match = (numMatches > 7) ? matches[7] : null;
                        this._seconds = match ? Number(match) : 0;

                        match = (numMatches > 8) ? matches[8] : null;
                        var timeZoneUTC = (match == "Z");

                        match = (numMatches > 9) ? matches[9] : null;
                        var timeZoneSign = (match == "-") ? -1 : 1;

                        match = (numMatches > 10) ? matches[10] : null;
                        var timeZoneHours = match ? Number(match) : NaN;

                        match = (numMatches > 11) ? matches[11] : null;
                        var timeZoneMinutes = match ? Number(match) : NaN;

                        if (timeZoneUTC) {
                            this._timeZone = TimeZones.UTC;
                        } else if (!isNaN(timeZoneHours) && !isNaN(timeZoneMinutes)) {
                            this._timeZone = new SimpleTimeZone(timeZoneSign * (timeZoneHours * 60 + timeZoneMinutes) * 60);
                        } else {
                            this._timeZone = TimeZones.LOCAL;
                        }

                        this._updateTime();
                    } else {
                        this._time = NaN;
                        this._updateProperties();
                    }
                    break;
                default:
                    if (typeof yearOrTimevalue === "number") {
                        this._year = yearOrTimevalue;
                        this._month = (month !== undefined) ? month : 1;
                        this._day = (day !== undefined) ? day : 1;
                        this._hours = (hours !== undefined) ? hours : 0;
                        this._minutes = (minutes !== undefined) ? minutes : 0;
                        this._seconds = (seconds !== undefined) ? seconds : 0;
                        this._timeZone = (timeZone instanceof TimeZone) ? timeZone : TimeZones.LOCAL;
                        this._updateTime();
                    } else {
                        this._time = NaN;
                        this._updateProperties();
                    }
                    break;
            }
        };

        // Public Getters/Setters

        this.getYear = function() {
            return this._year;
        };
        this.setYear = function(value) {
            this._year = value;
            this._updateTime();
        };

        this.getMonth = function() {
            return this._month;
        };
        this.setMonth = function(value) {
            this._month = value;
            this._updateTime();
        };

        this.getDay = function() {
            return this._day;
        };
        this.setDay = function(value) {
            this._day = value;
            this._updateTime();
        };

        this.getWeekday = function() {
            return this._weekday;
        };

        this.getHours = function() {
            return this._hours;
        };
        this.setHours = function(value) {
            this._hours = value;
            this._updateTime();
        };

        this.getMinutes = function() {
            return this._minutes;
        };
        this.setMinutes = function(value) {
            this._minutes = value;
            this._updateTime();
        };

        this.getSeconds = function() {
            return this._seconds;
        };
        this.setSeconds = function(value) {
            this._seconds = value;
            this._updateTime();
        };

        this.getTimeZone = function() {
            return this._timeZone;
        };
        this.setTimeZone = function(value) {
            this._timeZone = (value instanceof TimeZone) ? value : TimeZones.LOCAL;
            this._updateTime();
        };

        this.getTimeZoneOffset = function() {
            return this._timeZoneOffset;
        };

        this.getTime = function() {
            return this._time;
        };
        this.setTime = function(value) {
            this._time = value;
            this._updateProperties();
        };

        // Public Methods

        this.toUTC = function() {
            return this.toTimeZone(TimeZones.UTC);
        };

        this.toLocal = function() {
            return this.toTimeZone(TimeZones.LOCAL);
        };

        this.toTimeZone = function(timeZone) {
            var date = new DateTime();
            date.setTimeZone(timeZone);
            date.setTime(this._time);
            return date;
        };

        this.clone = function() {
            var date = new DateTime();
            date.setTimeZone(this._timeZone);
            date.setTime(this._time);
            return date;
        };

        this.equals = function(toCompare) {
            return ((this._time === toCompare._time) && (this._timeZoneOffset === toCompare._timeZoneOffset));
        };

        this.toString = function() {
            if (!this._isValid) {
                return "Invalid Date";
            }

            var str = "";
            if (this._year < 0) {
                str += "-" + _pad(-this._year, 4);
            } else {
                str += _pad(this._year, 4);
            }
            str += "-" + _pad(this._month, 2) + "-" + _pad(this._day, 2);
            str += "T" + _pad(this._hours, 2) + ":" + _pad(this._minutes, 2) + ":" + _pad(this._seconds, 2, 3);

            var timeZoneOffset = this._timeZoneOffset / 60;
            if (timeZoneOffset == 0) {
                str += "Z";
            } else {
                if (timeZoneOffset < 0) {
                    str += "-";
                } else {
                    str += "+";
                }
                if (timeZoneOffset < 0) {
                    timeZoneOffset = -timeZoneOffset;
                }
                var timeZoneHours = Math.floor(timeZoneOffset / 60);
                var timeZoneMinutes = Math.floor(timeZoneOffset % 60);
                str += _pad(timeZoneHours, 2) + ":" + _pad(timeZoneMinutes, 2);
            }

            return str;
        };

        this.valueOf = function() {
            return this._time;
        };

        // Private Methods

        this._updateTime = function() {
            if (this._validate()) {
                var years = this._year;
                var months = this._month - 1;
                var days = this._day - 1;
                var hours = this._hours;
                var minutes = this._minutes;
                var seconds = this._seconds;

                var secondsPerMinute = 60;
                var secondsPerHour = secondsPerMinute * 60;
                var secondsPerDay = secondsPerHour * 24;

                var totalMonths = months + years * 12;
                var wholeMonths = Math.floor(totalMonths);
                var subMonths = totalMonths - wholeMonths;

                var totalSeconds = seconds + (minutes * secondsPerMinute) + (hours * secondsPerHour) + (days * secondsPerDay);
                var wholeSeconds = Math.floor(totalSeconds);
                var subSeconds = totalSeconds - wholeSeconds;

                var date = new Date(0);
                date.setUTCFullYear(0);
                date.setUTCMonth(wholeMonths);

                if (subMonths != 0) {
                    date.setUTCMonth(date.getUTCMonth() + 1);
                    date.setUTCDate(0);

                    var monthsTotalSeconds = date.getUTCDate() * subMonths * secondsPerDay;
                    var monthsWholeSeconds = Math.floor(monthsTotalSeconds);
                    var monthsSubSeconds = monthsTotalSeconds - monthsWholeSeconds;

                    wholeSeconds += monthsWholeSeconds;
                    subSeconds += monthsSubSeconds;
                    if (subSeconds >= 1) {
                        subSeconds--;
                        wholeSeconds++;
                    }

                    date.setUTCDate(1);
                }

                date.setUTCSeconds(wholeSeconds);

                var time = (date.getTime() / 1000) + subSeconds;
                var timeZone = this._timeZone;

                this._time = time - timeZone.getOffset(time - timeZone.getStandardOffset());

                this._updateProperties();
            }
        };

        this._updateProperties = function() {
            if (this._validate()) {
                var time = _normalizePrecision(this._time);
                var timeZoneOffset = _normalizePrecision(this._timeZone.getOffset(time));

                var totalSeconds = time + timeZoneOffset;
                var wholeSeconds = Math.floor(totalSeconds);
                var subSeconds = _normalizePrecision(totalSeconds - wholeSeconds);
                if (subSeconds >= 1) {
                    subSeconds = 0;
                    wholeSeconds++;
                }

                var date = new Date(wholeSeconds * 1000);

                this._year = date.getUTCFullYear();
                this._month = date.getUTCMonth() + 1;
                this._day = date.getUTCDate();
                this._weekday = date.getUTCDay();
                this._hours = date.getUTCHours();
                this._minutes = date.getUTCMinutes();
                this._seconds = date.getUTCSeconds() + subSeconds;

                this._time = time;
                this._timeZoneOffset = timeZoneOffset;

                this._validate();
            }
        };

        this._validate = function() {
            if (this._isValid) {
                this._year *= 1;
                this._month *= 1;
                this._day *= 1;
                this._weekday *= 1;
                this._hours *= 1;
                this._minutes *= 1;
                this._seconds *= 1;
                this._timeZoneOffset *= 1;
                this._time *= 1;
                var checksum = this._year + this._month + this._day + this._weekday + this._hours + this._minutes + this._seconds + this._timeZoneOffset + this._time;
                if (isNaN(checksum) || (checksum == Infinity) || (checksum == -Infinity) || !this._timeZone) {
                    this._isValid = false;
                }
            } else {
                this._year *= 1;
                this._time *= 1;
                if ((this._year > -Infinity) && (this._year < Infinity)) {
                    this._month = 1;
                    this._day = 1;
                    this._hours = 0;
                    this._minutes = 0;
                    this._seconds = 0;
                    this._isValid = true;
                } else if ((this._time > -Infinity) && (this._time < Infinity)) {
                    this._isValid = true;
                }
            }

            if (!this._isValid) {
                this._year = NaN;
                this._month = NaN;
                this._day = NaN;
                this._weekday = NaN;
                this._hours = NaN;
                this._minutes = NaN;
                this._seconds = NaN;
                this._timeZoneOffset = NaN;
                this._time = NaN;
            }

            return this._isValid;
        };

    });

});
