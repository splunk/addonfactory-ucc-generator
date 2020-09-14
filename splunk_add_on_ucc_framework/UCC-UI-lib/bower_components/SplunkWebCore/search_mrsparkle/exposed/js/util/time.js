define(
    [
        'underscore',
        'splunk.i18n',
        'splunk.util',
        'util/moment',
        'util/console'
    ],
    function(_, i18n, splunkUtils, moment, console) {

        var BD_TIME_REGEX_MILLIS = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d+)[+-]{1}\d{2}[:]?\d{2}$/,
            BD_TIME_REGEX_NO_MILLIS = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})[+-]{1}\d{2}[:]?\d{2}$/,
            STRIP_TIMEZONE_REGEX = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.{0,1}(\d*))[+-]{1}\d{2}[:]?\d{2}$/,
            u = {},
            language = i18n.locale_name().substring(0, 2),
            ISO_PATTERN = '%Y-%m-%dT%H:%M:%S.%Q%:z';
        
        u.s = u.sec = u.secs = u.second = u.seconds = {abbr: "s",  singular: _("second").t(), plural: _("seconds").t()};
        u.m = u.min = u.mins = u.minute = u.minutes = {abbr: "m", singular: _("minute").t(), plural: _("minutes").t()};
        u.h = u.hr  = u.hrs  = u.hour   = u.hours   = {abbr: "h", singular: _("hour").t(), plural: _("hours").t()};
        u.d = u.day = u.days = {abbr: "d", singular: _("day").t(), plural: _("days").t()};
        u.w = u.week = u.weeks = {abbr: "w", singular: _("week").t(), plural: _("weeks").t()};
        u.mon = u.month = u.months = {abbr: "mon", singular: _("month").t(), plural: _("months").t()};
        u.q = u.qtr = u.qtrs = u.quarter = u.quarters = {abbr: "q", singular: _("quarter").t(), plural: _("quarters").t()};
        u.y = u.yr = u.yrs = u.year = u.years = {abbr: "y", singular: _("year").t(), plural: _("years").t()};
            
        var TIME_UNITS = u;
    
        var BdTime = function(isoString) {
            var bdPieces = BD_TIME_REGEX_MILLIS.exec(isoString) || BD_TIME_REGEX_NO_MILLIS.exec(isoString);
            if(!bdPieces) {
                this.isInvalid = true;
            }
            else {
                this.year   = parseInt(bdPieces[1], 10);
                this.month  = parseInt(bdPieces[2], 10);
                this.day    = parseInt(bdPieces[3], 10);
                this.hour   = parseInt(bdPieces[4], 10);
                this.minute = parseInt(bdPieces[5], 10);
                this.second = parseInt(bdPieces[6], 10);
                this.millisecond = bdPieces.length > 7 ? parseInt(bdPieces[7], 10) : 0;
            }
        };
    
        var extractBdTime = function(timeString) {
            return new BdTime(timeString);
        };
    
        var bdTimeToDateObject = function(bdTime) {
            var year     = bdTime.year,
                month    = bdTime.month - 1,
                day      = bdTime.day,
                hour     = bdTime.hour,
                minute   = bdTime.minute,
                second   = bdTime.second,
                millisecond = bdTime.millisecond;
    
            return new Date(year, month, day, hour, minute, second, millisecond);
        };

        var getTimezoneString = function(dateObj) {
            var timezoneOffset = dateObj.getTimezoneOffset(),
                absoluteValueTimezoneOffset = Math.abs(timezoneOffset),
                hours = Math.floor(absoluteValueTimezoneOffset / 60),
                minutes = absoluteValueTimezoneOffset % 60,
                formattedHours = hours < 10 ? '0' + hours : '' + hours,
                formattedMinutes = minutes < 10 ? '0' + minutes : '' + minutes,
                timezone = (timezoneOffset > 0 ? '-' : '+') + formattedHours + ':' + formattedMinutes;
            
            return timezone;
        };

        /*
         * Converts a time in seconds to a year/day/hour/minute/second format.
         * If hourCap flag is true, then years/days aren't included in the conversion,
         * and hours is allowed to be larger than 24.
         * @param seconds: the number of seconds to convert
         * @param hourCap [optional]: whether to cap everything above hour, default false.
         * @return {Object}
        */
        var secondsToSeparatedDate = function(time, hourCap) {
            var years = 0, days = 0, hours, minutes, seconds, curTimeCounter = time;

            if (!hourCap) {
                years = Math.floor(curTimeCounter / 31557600); // 365.25 days per year
                curTimeCounter -= years * 31557600;

                days = Math.floor(curTimeCounter / 86400);
                curTimeCounter -= days * 86400;
            }

            hours = Math.floor(curTimeCounter / 3600);
            curTimeCounter -= hours * 3600;

            minutes = Math.floor(curTimeCounter / 60);
            curTimeCounter -= minutes * 60;

            // We never want to show a time of 0 for everything, so if we started with something like
            // 0.1 for time, just ceil the counter. Otherwise round it.
            seconds = time < 1 ? Math.ceil(curTimeCounter) : Math.round(curTimeCounter);

            return {
                years: years,
                days: days,
                hours: hours,
                minutes: minutes,
                seconds: seconds
            };
        };
    
        var isoToDateObject = function(isoString) {
            var matches = STRIP_TIMEZONE_REGEX.exec(isoString);
            if (matches) {
                var isoWithoutTimezone = matches[1],
                    isoWithSpoofedTimezone = isoWithoutTimezone + getTimezoneString(new Date()),
                    correctedIso = isoWithoutTimezone + getTimezoneString(moment(isoWithSpoofedTimezone).toDate());
                return moment(correctedIso).toDate();
            }

            return new Date(NaN);
        };
        
        var jsDateToSplunkDateTimeWithMicroseconds = function(jsDate) {
            var dateTime = new i18n.DateTime({
                date: jsDate,
                year: jsDate.getFullYear(),
                month: jsDate.getMonth() + 1,
                day: jsDate.getDate(),
                hour: jsDate.getHours(),
                minute: jsDate.getMinutes(),
                second: jsDate.getSeconds(),
                microsecond: jsDate.getMilliseconds() * 1000
            });
            dateTime.weekday = function() {
                var d = this.date.getDay() - 1;
                if (d < 0)
                    d = 6;
                return d;
            };
            return dateTime;
        };

        var _calculateTimeFormat = function(time, spanSeries) {
            var span = parseFloat(spanSeries[0]);
            if(!(time instanceof BdTime)) {
                time = extractBdTime(time);
            }
            if (!span) {
                return time.millisecond === 0 ? 'second' : 'millisecond';
            }

            if((span >= 0 && span < 1) || (time.millisecond !== 0)) {
                return 'millisecond';
            }
            if((span >= 1 && span < 60) || (time.second !== 0)) {
                return 'second';
            }
            if((span >= 60 && span < 3600) || (time.minute !== 0)) {
                return 'minute';
            }
            if ((span >= 3600 && span <= 82800) || (time.hour !== 0)) { // 23 hour (82800)
                return 'hour';
            }
            if ((span > 82800 && span <= 2419200) || (time.day !== 1)) { // 1 day to 28 days
                return 'day';
            }
            if ((span > 2419200 && span <= 31535999) || (time.month !== 1)) { // 28 days - 1 year
                return 'month';
            }
            if (span >= 31536000) { // year
                return 'year';
            }
            console.log('_span value (' + span + ') did not meet any time formatting condition');
            return 'second';
        };
    
        var determineLabelGranularity = function(times, spanSeries) {
            if(!(times[0] instanceof BdTime)) {
                times = _(times).map(extractBdTime);
            }
            times = _(times).filter(function(time) { return !time.isInvalid; });
            if(times.length === 1 && (!spanSeries || spanSeries.length === 0)) {
                return times[0].millisecond === 0 ? 'second' : 'millisecond';
            }
            if(times.length === 1 && spanSeries) {
                return _calculateTimeFormat(times[0], spanSeries);
            }
            var milliseconds = [],
                seconds = [],
                minutes = [],
                hours   = [],
                days    = [],
                months  = [],
    
                allInListMatch = function(list, matchMe) {
                    for(var i = 0; i < list.length; i++) {
                        if(list[i] !== matchMe) {
                            return false;
                        }
                    }
                    return true;
                };
    
            _(times).each(function(time) {
                milliseconds.push(time.millisecond);
                seconds.push(time.second);
                minutes.push(time.minute);
                hours.push(time.hour);
                days.push(time.day);
                months.push(time.month);
            });

            if(!allInListMatch(milliseconds, 0)) {
                return 'millisecond';
            }
            if(!allInListMatch(seconds, 0)) {
                return 'second';
            }
            if(!allInListMatch(minutes, 0)) {
                return 'minute';
            }
            if((!allInListMatch(hours, 0))) {
                return 'hour';
            }
            if(!allInListMatch(days, 1)) {
                return 'day';
            }
            if(!allInListMatch(months, 1)) {
                return 'month';
            }
            return 'year';
        };
    
        var isValidIsoTime = function(str) {
            return BD_TIME_REGEX_MILLIS.test(str) || BD_TIME_REGEX_NO_MILLIS.test(str);
        };
        
    
        /**
         * Epoch seconds to LocaleString
         * @param epochTime
         * @return {String}
         */
        var convertToLocalTime = function(epochTime) {
            if (!epochTime) {
                return null;
            }
            return new Date(epochTime*1000).toLocaleString();
        };
    
        /**
         * Converts time difference to "1 year, 6 months ago"; "20 minutes, 30 seconds ago"
         * @param endTime Unix epoch seconds
         * @param startTime [optional] Unix epoch seconds; By default - current time.
         * @param withoutSuffix [optional] true to omit the "ago" suffix
         * @return {String}
         */
        var convertToRelativeTime = function(endTime, startTime, withoutSuffix) {
            if (!endTime) {
                return null;
            }
            var endMoment = moment.unix(endTime);
            return startTime !== undefined ?
                    endMoment.from(moment.unix(startTime), withoutSuffix) :
                    endMoment.fromNow(withoutSuffix);
        };

        /**
         * Converts parsed time amount and unit to seconds. Converts 1h to 3600.
         * @param amount {Number}
         * @param unit {String} ('s', 'm', 'h', 'd')
         * @return {Number}
         */
        var convertAmountAndUnitToSeconds = function(amount, unit) {
            var seconds = amount;
            switch (unit) {
                case 'd':
                    seconds *= 24 * 60 * 60;
                    break;
                case 'h':
                    seconds *= 60 * 60;
                    break;
                case 'm':
                    seconds *= 60;
                    break;
            }
            return seconds;
        };

        var getRelativeStringFromSeconds = function(seconds, removeAgo) {
            if (_.isString(seconds)) {
                seconds = parseInt(seconds, 10);
            }
            
            var now = new Date(),
                startTime = now.getTime() / 1000,
                endTime = startTime - seconds;
            
            return convertToRelativeTime(endTime, startTime, removeAgo);
        };
        
        /*  
         * Normalize units to their shortest abbreviations.
         * Required is an optional parameter, defaults to true.
         * If required and there is no match, s is returned.
         * 
         */
        var normalizeUnit = function(abbr, required) {
            var hasUnit = TIME_UNITS.hasOwnProperty(abbr),
                defaultUnit = required === false ? '' : TIME_UNITS.s.abbr;
            return hasUnit ? TIME_UNITS[abbr].abbr : defaultUnit;
        };
        
        var parseTimeString = function(timeString){
            if (!_.isString(timeString)) {
                return false;
            }
            //This regex is not a validator of splunk time! Use the TimeParser for that!
            //-1, -1s, -1@s, -1s@s, +1, +1s, +1@s, +1s@s, s@s, rt@s, @s, rtnow, now
            var parse = timeString.match(/^\s*(rt|)([-+]?)(\d*)([a-zA-Z]*)(@?)([a-zA-Z]*)(\d*)\s*$/);
                                           //   1     2     3       4       5       6      7
            if (parse) {
                var normalizedUnit = normalizeUnit(parse[4], false),
                    hasSnap = (parse[5] !== '');
                
                return {
                    amount: (normalizedUnit ? (parseInt(parse[3], 10) || 1) : 0),
                    unit: normalizedUnit,
                    hasSnap: hasSnap,
                    snapUnit: normalizeUnit(parse[6], false),
                    snapUnitAmount: parseInt(parse[7], 10),
                    isNow: parse[4] === "now",
                    isRealTime: parse[1] === 'rt',
                    isPositive: parse[2] === "+" || true,
                    parse: parse 
                };
            }
            
            return false;
        };

        /*
         *  Takes timeStrings of the format "-7d" or "+5h"
         *  and returns a breakdown of the +/-, amount, and unit components.
         *  Also, returns false if the timeString is not of a valid
         *  Splunk relative time modifier format.
         *  Ignores 'snapTo' '@' syntax.
         */
        var parseTimeModifier = function(timeString) {
            if (!_.isString(timeString)) {
                return false;
            }
            var parse = timeString.match(/^([+-])([0-9]+)([a-zA-Z]+)@?[a-zA-Z]*$/),
                timeVariance,
                amount,
                unit;
            if (parse) {
                timeVariance = parse[1];
                amount = parse[2];
                unit = normalizeUnit(parse[3], false);
                return {
                    timeVariance: timeVariance,
                    amount: amount,
                    unit: unit
                };
            }
            return false;
        };
        
        var isRealtime = function(time) {
            return (_.isString(time) && time.indexOf("rt") === 0);
        };
        
        var stripRTSafe = function(timeString, isLatest) {
            var sign,
                parsedTimeString,
                strippedString;
            
            if (!isRealtime(timeString)) {
                return timeString;
            }
            
            parsedTimeString = parseTimeString(timeString);
            if (!parsedTimeString) {
                return timeString;
            }
            
            if (parsedTimeString.unit || parsedTimeString.isNow) {
                return parsedTimeString.parse.slice(2, parsedTimeString.parse.length).join("");
            }
            
            strippedString = parsedTimeString.parse.slice(3, parsedTimeString.parse.length).join("");
            if (strippedString) {
                sign = parsedTimeString.isPositive ? "+" : "-";
                return sign + strippedString;
            }
            
            if (isLatest) {
                return "";
            } else {
                return "0";
            }
        };

        /**
         * @param {Object} options {
         *     iso: time,
         *     unit: w|d|m|h|s|ms
         *     amount: <int> 
         *     type: plus|minus|plusminus
         * }
         */
        var rangeFromIsoAndOffset = function(iso, unit, amount, type) {
            amount = parseInt(amount, 10);
            amount = isNaN(amount) ? 1 : amount;
            type = type === undefined ? 'plusminus' : type;
            if (['plus', 'minus', 'plusminus'].indexOf(type) === -1) {
                throw new Error('Invalid type');
            }
            var origanalDate = new Date(iso),
                lowerRange = new Date(iso),
                upperRange = new Date(iso);

            switch(unit) {
                case 'w': 
                    lowerRange.setDate(lowerRange.getDate() - (7 * amount));
                    upperRange.setDate(upperRange.getDate() + (7 * amount));
                    break;
                case 'd': 
                    lowerRange.setDate(lowerRange.getDate() - amount);
                    upperRange.setDate(upperRange.getDate() + amount);
                    break;
                case 'h': 
                    lowerRange.setHours(lowerRange.getHours() - amount);
                    upperRange.setHours(upperRange.getHours() + amount);
                    break;
                case 'm': 
                    lowerRange.setMinutes(lowerRange.getMinutes() - amount);
                    upperRange.setMinutes(upperRange.getMinutes() + amount);
                    break;
                case 's': 
                    lowerRange.setSeconds(lowerRange.getSeconds() - amount);
                    upperRange.setSeconds(upperRange.getSeconds() + amount);
                    break;
                case 'ms': 
                    lowerRange.setMilliseconds(lowerRange.getMilliseconds() - amount);
                    upperRange.setMilliseconds(upperRange.getMilliseconds() + amount);
                    break;
                default:
                    throw new Error('Invalid unit');
            }
            return { 
                lowerRange: (type === 'minus' || type === 'plusminus') ? lowerRange : origanalDate,
                upperRange: (type === 'plus' || type === 'plusminus') ? upperRange : origanalDate 
            }; 
        };
        
        var isAbsolute = function(time) {
            if (time === undefined) {
                return false;
            }
            return _.isNumber(time) || !(/^(now|-|\+|@|rt).*/.test(time));
        };
        
        var isEpoch = function(time) {
            return _.isNumber(time) || (_.isString(time) && /^\d+((\.\d+)|(\d*))$/.test(time) && time !== '0');
        };
        
        var timeAndJsDateIsWholeDay = function(time, jsDate) {
            if (isAbsolute(time) && jsDate) {
                return (jsDate.getHours() == 0) && (jsDate.getMinutes() == 0) && (jsDate.getSeconds() == 0) && (jsDate.getMilliseconds() == 0);
            }
            return false;
        };
        
        var isNow = function(time) {
            if (!time) {
                return true;
            }
            return (_.isString(time) && ((time === '') || (/now/.test(time))));
        };
        
        var isEmpty = function(time) {
            if (time === '0') {
                return true;
            }
            return (!time);
        };

        var compareTwoTimeRanges = function(earliest1, latest1, earliest2, latest2) {
            // Check if they are "all time"
            if (isEmpty(earliest1) && isEmpty(earliest2) && isNow(latest1) && isNow(latest2)) {
                return true;
            }

            if (isEmpty(earliest1) && isEmpty(earliest2) && (latest1 === latest2)) {
                return true;
            }

            if ((earliest1 === earliest2) && isNow(latest1) && isNow(latest2)) {
                return true;
            }

            return (earliest1 === earliest2) && (latest1 === latest2);
        };
        
        var findPresetLabel = function(presetsCollection, earliest, latest) {
            var presetModel;
            
            if (presetsCollection.length > 0) {
                //TODO: this should probably get moved to the Times collection
                presetModel = presetsCollection.find(function(model) {
                    var timesConfEarliest = model.entry.content.get("earliest_time"),
                        timesConfLatest = model.entry.content.get("latest_time"),
                        noEarliests = (isEmpty(timesConfEarliest) && isEmpty(earliest)),
                        noLatests = (isEmpty(timesConfLatest) && isEmpty(latest)),
                        isDisabled = model.isDisabled(),
                        isSubMenu = model.isSubMenu();
                    
                    return ((!isDisabled && !isSubMenu) && (noEarliests || (timesConfEarliest == earliest)) && (noLatests || (timesConfLatest == latest)));
                });
                
                if (presetModel) {
                    return presetModel.entry.content.get("label");
                }
            }
            return false;
        };
        
        var generateRealtimeLabel = function(earliest, latest) {
            var earliestParse, latestIsNow;
            
            if (isRealtime(earliest) || isRealtime(latest)) {
                earliestParse = parseTimeString(earliest);
                latestIsNow = isNow(latest);
                
                var labelTemplates = {
                    s:_("%t second window").t(),
                    m: _("%t minute window").t(),
                    h: _("%t hour window").t(),
                    d: _("%t day window").t(),
                    w: _("%t week window").t(),
                    mon: _("%t month window").t(),
                    q: _("%t quarter window").t(),
                    y: _("%t year window").t()
                };
            
                //A windowed time with a latest time of now.
                if (earliestParse && earliestParse.amount && latestIsNow && labelTemplates.hasOwnProperty(earliestParse.unit)) {
                    return labelTemplates[earliestParse.unit].replace(/%t/, earliestParse.amount);
                } 
                
                //Other Real-Time.
                return _("Real-time").t();
            }
            return false;
        };
        
        var generateRelativeTimeLabel = function(earliest, latest) {
            var earliestParse = parseTimeString(earliest),
                latestIsNow = isNow(latest),
                latestParse = parseTimeString(latest);
            
            if (!earliestParse || earliestParse.isRealTime || latestParse.isRealTime) {
                return false;
            }
            
            if (earliestParse.amount
                    && (!earliestParse.snapUnit || earliestParse.unit === earliestParse.snapUnit)
                    && (latestParse.isNow || (latestParse.snapUnit && !latestParse.amount))
                    && (!latestParse.snapUnit || earliestParse.unit === latestParse.snapUnit)) {
                var relativeLabel = _("Last %amount %unit").t();
                relativeLabel = relativeLabel.replace(/%amount/, earliestParse.amount);
                relativeLabel = relativeLabel.replace(/%unit/, TIME_UNITS[earliestParse.unit][earliestParse.amount > 1? 'plural' : 'singular']);
                return relativeLabel;
            }
            
            return false;
        };
        
        var generateBetweenTimeLabel = function(earliest, earliestJSDate, latest, latestJSDate) {
            var earliestIsWholeDay = timeAndJsDateIsWholeDay(earliest, earliestJSDate),
                latestIsWholeDay = timeAndJsDateIsWholeDay(latest, latestJSDate);
            
            if (earliestIsWholeDay && latestIsWholeDay) {
                if (language == 'en') {
                    return i18n.format_datetime_range(null, earliestJSDate, latestJSDate, true);
                } else {
                    var dateLabel = _("%1 through %2").t();
                    var labelDate = new Date(latestJSDate.getTime());
                    labelDate.setDate(labelDate.getDate() -1);
                    return dateLabel.replace('%1', i18n.format_date(earliestJSDate, 'short')).replace('%2', i18n.format_date(labelDate, 'short'));
                }
            }
            
            return false;
        };
        
        var generateSinceDateLabel = function(earliest, earliestJSDate, latest){
            var earliestIsWholeDay = timeAndJsDateIsWholeDay(earliest, earliestJSDate),
                latestIsNow = isNow(latest);
            
            if (earliestIsWholeDay && latestIsNow) {
                var dateLabel = _("Since %1").t();
                return dateLabel.replace('%1', i18n.format_date(earliestJSDate, 'short'));
            }
            
            return false;
        };
        
        var generateBeforeDateLabel = function(earliest, latest, latestJSDate) {            
            if (isEmpty(earliest) && timeAndJsDateIsWholeDay(latest, latestJSDate)) {
                var dateLabel = _("Before %1").t();
                return dateLabel.replace('%1', i18n.format_date(latestJSDate, 'short'));
            }
            
            return false;
        };
        
        var generateDateTimeRangeLabel = function(earliest, latest) {
            if (!isEmpty(earliest) && isAbsolute(earliest) && isAbsolute(latest)) {
                return _("Date time range").t();
            }
            return false;
        };
        
        var generateSinceTimeRangeLabel = function(earliest, latest) {
            if (isAbsolute(earliest) && isNow(latest)) {
                return _("Since date time").t();
            }
            return false;
         };
         
         var generateBeforeTimeRangeLabel = function(earliest, latest) {
             if (isEmpty(earliest) && isAbsolute(latest)) {
                 return _("Before date time").t();
             }
             return false;
         };
         
         var generateAllTimeLabel = function(earliest, latest) {
             if (isEmpty(earliest) && isNow(latest)) {
                 return _("All time").t();
             }
             return false;
         };

        var makeTodayRelativeWithNoTimeZone = function(time) {
            var date = new Date(time),
                mDate = moment(date),
                iscurrentDate = (mDate).isSame(new Date(), "day");
            if(iscurrentDate)
            {
                return (mDate).fromNow();
            }

            return date.toString().slice(0,24);
        };
    
        /**
        * presets: <collections.services.data.ui.TimesV2>
        **/
        var generateLabel = function(presetsCollection, earliest, earliestJSDate, latest, latestJSDate) {
            return generateAllTimeLabel(earliest, latest) ||
                findPresetLabel(presetsCollection, earliest, latest) ||
                generateRealtimeLabel(earliest, latest) ||
                generateRelativeTimeLabel(earliest, latest) ||
                generateBetweenTimeLabel(earliest, earliestJSDate, latest, latestJSDate) ||
                generateSinceDateLabel(earliest, earliestJSDate, latest) ||
                generateBeforeDateLabel(earliest, latest, latestJSDate) ||
                generateDateTimeRangeLabel(earliest, latest) ||
                generateSinceTimeRangeLabel(earliest, latest) ||
                generateBeforeTimeRangeLabel(earliest, latest) ||
                _("Custom time").t();
        };

        var RESULTS_TIMESTAMP_FORMATS = {
            year: 'YYYY',
            month: 'YYYY-MM',
            day: 'YYYY-MM-dd',
            hour: 'YYYY-MM-dd HH:00',
            minute: 'YYYY-MM-dd HH:mm:00',
            second: 'YYYY-MM-dd HH:mm:ss',
            millisecond: 'YYYY-MM-dd HH:mm:ss.TTT'
        };
        
        return ({
            extractBdTime: extractBdTime,
            bdTimeToDateObject: bdTimeToDateObject,
            rangeFromIsoAndOffset: rangeFromIsoAndOffset,
            getTimezoneString: getTimezoneString,
            isoToDateObject: isoToDateObject,
            determineLabelGranularity: determineLabelGranularity,
            isValidIsoTime: isValidIsoTime,
            TIME_UNITS: TIME_UNITS,
            ISO_PATTERN: ISO_PATTERN,
            normalizeUnit: normalizeUnit,
            parseTimeString: parseTimeString,
            parseTimeModifier: parseTimeModifier,
            isRealtime: isRealtime,
            stripRTSafe: stripRTSafe,
            isAbsolute: isAbsolute,
            isEpoch: isEpoch,
            timeAndJsDateIsWholeDay: timeAndJsDateIsWholeDay,
            isNow: isNow,
            isEmpty: isEmpty,
            compareTwoTimeRanges: compareTwoTimeRanges,
            findPresetLabel: findPresetLabel,
            generateRealtimeLabel: generateRealtimeLabel,
            generateRelativeTimeLabel: generateRelativeTimeLabel,
            generateBetweenTimeLabel: generateBetweenTimeLabel,
            generateSinceDateLabel: generateSinceDateLabel,
            generateBeforeDateLabel: generateBeforeDateLabel,
            generateDateTimeRangeLabel: generateDateTimeRangeLabel,
            generateSinceTimeRangeLabel: generateSinceTimeRangeLabel,
            generateBeforeTimeRangeLabel: generateBeforeTimeRangeLabel,
            generateAllTimeLabel: generateAllTimeLabel,
            generateLabel: generateLabel,
            convertToRelativeTime: convertToRelativeTime,
            convertToLocalTime: convertToLocalTime,
            jsDateToSplunkDateTimeWithMicroseconds: jsDateToSplunkDateTimeWithMicroseconds,
            getRelativeStringFromSeconds: getRelativeStringFromSeconds,
            convertAmountAndUnitToSeconds: convertAmountAndUnitToSeconds,
            secondsToSeparatedDate: secondsToSeparatedDate,
            makeTodayRelativeWithNoTimeZone: makeTodayRelativeWithNoTimeZone,
            RESULTS_TIMESTAMP_FORMATS: RESULTS_TIMESTAMP_FORMATS
        });
    }
);
