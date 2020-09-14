////////////////////////////////////////////////////////////////////////////////
// TimeRange objects
////////////////////////////////////////////////////////////////////////////////

/**
 * General purpose object to hold any time range, whether it's an absolute range, 
 * relative time range, real time range. 
 * Any kind of range may omit startTime or endTime, which means it's unbounded
 * on that end.
 * A range unbounded on both ends is treated as an 'All time' range.
 */
Splunk.TimeRange = $.klass({
    _absoluteArgs : {},
    _relativeArgs : {},

    _fallbackAbsoluteTimeFormat: "%s.%Q",
    _isSubRangeOfJob: false,

    _unitMap : {},
    YEAR        : 0,
    MONTH       : 1,
    DAY         : 2,
    HOUR        : 3,
    MINUTE      : 4,
    SECOND      : 5,
    MILLISECOND : 6,
    CUSTOM_RELATIVE_RANGE_HEADER: _("over custom relative time range"),
    GENERIC_REAL_TIME_RANGE_HEADER: _("%s (real-time)"),
    CUSTOM_REAL_TIME_RANGE_HEADER: _("in custom real-time range"),

    DATE_METHODS  : [
        // Dont wrap any of these year, month, day values in _(). They are part of the logic here and never displayed.
        // instead it's the values in this._unitMap that get localized.
        {name: "year",   getter : "getFullYear",     setter: "setFullYear", minValue: "1974"},
        {name: "month",  getter : "getMonth",        setter: "setMonth",    minValue: "0"},
        {name: "day",    getter : "getDate",         setter: "setDate",     minValue: "1"},
        {name: "hour",   getter : "getHours",        setter: "setHours",    minValue: "0"},
        {name: "minute", getter : "getMinutes",      setter: "setMinutes",  minValue: "0"},
        {name: "second", getter : "getSeconds",      setter: "setSeconds",  minValue: "0"},
        {name: "millisecond", getter : "getMilliseconds", setter: "setMilliseconds",  minValue: "0"}
    ],

    initialize: function(earliestArg, latestArg) {
        // keeping clone() up to date is a pain. This is either cheating, or a
        // smart way of with that problem. See usage within clone()
        this._constructorArgs = [earliestArg, latestArg];

        // looks crazy, but im just trying to cover the full range of abbreviations
        // that are supported by the backend.
        var u = this._unitMap;
        u.s = u.sec = u.secs = u.second = u.seconds = _("second");
        u.m = u.min = u.mins = u.minute = u.minutes = _("minute");
        u.h = u.hr  = u.hrs  = u.hour   = u.hours   = _("hour");
        u.d = u.day = u.days   = _("day");
        // weeks were removed entirely at some point and then re-added.  See src/util/TimeParser.cpp
        u.w = u.week           = _("week");
        u.mon = u.month = u.months = _("month");
        u.y = u.yr = u.yrs   = u.year   = u.years   = _("year");

        this._absoluteArgs = {
            "earliest" : false,
            "latest"   : false
        };
        this._relativeArgs = {
            "earliest" : false,
            "latest" : false
        };
        if (earliestArg=="now") earliestArg="0s";
        if (latestArg=="now")   latestArg="0s";
        
        this.logger = Splunk.Logger.getLogger("time_range.js");
        // we assume when a timerange is created directly that its the full range.
        this._isSubRangeOfJob = false;
        
        this._absoluteArgs["earliest"] = this.parseAbsoluteArgs(earliestArg);
        this._absoluteArgs["latest"]   = this.parseAbsoluteArgs(latestArg);
        
        if (this.isAbsolute()) {
            var tz = Splunk.Globals["timeZone"];
            this.serverOffsetAtEarliest = tz.getOffset(this._absoluteArgs["earliest"].valueOf()/1000) /60;
            this.serverOffsetAtLatest   = tz.getOffset(this._absoluteArgs["latest"].valueOf()/1000)/60;
        }
        
        // if its not an absolute term, try it as a relative term.
        if (!this._absoluteArgs["earliest"]) {
            this._relativeArgs["earliest"] = this.parseRelativeArgs(earliestArg);
        }
        if (!this._absoluteArgs["latest"]) {
            this._relativeArgs["latest"] = this.parseRelativeArgs(latestArg);
        }
        // if that failed, then we are left with everything null, which is fine it just means
        // an 'All Time' search.
    },

    /**
     * returns true if this timeRange contains the given date.  
     * Should only be used on absolute ranges. 
     * EG: always returns true if this is a purely relative or real-time range.
     */
    containsTime: function(dateObj) {
        var earliestTime = this.getAbsoluteEarliestTime();
        var latestTime   = this.getAbsoluteLatestTime();
        if (!earliestTime && !latestTime) return true;
        return (earliestTime <= dateObj  && latestTime > dateObj);
    },

    /**
     * returns true if the given range is contained by or equal to this instance.
     * In the case where this is a relative range, it will always assume that it contains
     * absolute ranges.  Because of how the timeline is implemented, this never seems to
     * come up as a shortcoming.
     * TODO - fix using this.containsTime
     */
    containsRange: function(range) {
        // if this is a range over all time, then it contains all time ranges. (including other "all time" ranges )
        // All time contains everybody, including other All Time
        if (this.isAllTime()) return true;
        // Nobody can contain All Time, except others which hit the case above.
        if (range.isAllTime()) return false;
        // if these ranges are identical, then true.
        if (this.equalToRange(range)) return true;

        // Currently relative ranges will ALWAYS claim to contain absolute ranges.
        if (this.relativeTerm  && !range.relativeTerm) return true;

        // trivial but expensive case of them being identical.  happens a lot.
        if (
            this.getEarliestTimeTerms() == range.getEarliestTimeTerms() &&
            this.getLatestTimeTerms() == range.getLatestTimeTerms()
            ) {
            return true;
        }

        if (this.getAbsoluteEarliestTime() > range.getAbsoluteEarliestTime())  return false;
        else if (this.getAbsoluteLatestTime() < range.getAbsoluteLatestTime()) return false;

        return true;
    },

    /** 
     * in all 4.0.X code, +0s would always get substituted for 'now'.  So there are tons of 
     * saved searches and links out there with latest=+0s in them, even though the corresponding 
     * times.conf stanza said "now".  
     * in 4.1 we no longer have to do the switch but as a result we have to treat "+0s" and "now" 
     * as equivalent to avoid old saved searches displaying 'over custom relative time' in headers
     */
    normalizeEquivalentNowValues : function(relativeArg) {
        if (relativeArg == "+0s") return "now";
        else return relativeArg;
    },

    /**
     * returns true if the given range is exactly equal to this instance.
     */
    equalToRange: function(range) {
        if (this===range) return true;
        
        if (this.normalizeEquivalentNowValues(this.getRelativeEarliestTime()) != this.normalizeEquivalentNowValues(range.getRelativeEarliestTime())) return false;
        if (this.normalizeEquivalentNowValues(this.getRelativeLatestTime()) != this.normalizeEquivalentNowValues(range.getRelativeLatestTime())) return false;
        
        if (typeof(this.getAbsoluteEarliestTime()) != typeof(range.getAbsoluteEarliestTime())) return false;
        if (typeof(this.getAbsoluteLatestTime()) != typeof(range.getAbsoluteLatestTime())) return false;
        
        var rangeEarliestTime = range.getAbsoluteEarliestTime();
        if (this.getAbsoluteEarliestTime() && rangeEarliestTime &&  this.getAbsoluteEarliestTime().getTime() != rangeEarliestTime.getTime()) return false;
        var rangeLatestTime   = range.getAbsoluteLatestTime();
        if (this.getAbsoluteLatestTime() && rangeLatestTime && this.getAbsoluteLatestTime().getTime() != rangeLatestTime.getTime()) return false;
        return true;
    },

    /**
     * @returns -1 if the timeRange isnt governed by a relative searchTerm at all.
     * Otherwise an integer representing the number of milliseconds between earliestTime and latestTime.
     */
    getDuration: function() {
        if (this.relativeTerm) return -1;
        else if (this.getAbsoluteLatestTime() && this.getAbsoluteEarliestTime()) {
            return this.getAbsoluteLatestTime() - this.getAbsoluteEarliestTime();
        }
        else return -1;
    },

    

    isAllTime: function() {
        return (this.isAbsolute() || this.isRelative()) ? false : true;
    },

    isAbsolute: function() {
        return ((this.getAbsoluteEarliestTime() && this.getAbsoluteEarliestTime().valueOf() != 0) || this.getAbsoluteLatestTime())? true:false;
    },

    isRelative: function() {
        return (this._relativeArgs["earliest"] || this._relativeArgs["latest"])? true:false;
    },
        
    isRealTime: function() {
        if (this._relativeArgs["earliest"] && this._relativeArgs["earliest"]["isRealTime"]) return true;
        else if (this._relativeArgs["latest"] && this._relativeArgs["latest"]["isRealTime"]) return true;
        return false;
    },
    
    /** 
     * If the Splunk.TimeRange instance attached to a Splunk.Search instance 
     * has been modified to represent a subrange, (with the start and end times 
     * corresponding to boundaries on the timelineData structure in splunkd), 
     * then that client is required to call setAsSubRangeOfJob(true)
     * Other code may then need to check this flag to determine whether a new 
     * search needs to be dispatched.
     */
    isSubRangeOfJob: function() {
        return this._isSubRangeOfJob;
    },

    setAsSubRangeOfJob: function(isSubRange) {
        this._isSubRangeOfJob = isSubRange;
    },
    
    getEarliestTimeTerms: function() {
        var timeTerms = [];
        if (this.getAbsoluteEarliestTime()) {
            var epochTime = this.getAbsoluteEarliestTime().getTime() / 1000;
            timeTerms.push(epochTime);
        } else if (this._relativeArgs["earliest"]) {
            timeTerms.push(this.getRelativeEarliestTime());
        }
        return timeTerms.join(" ");
    },

    getLatestTimeTerms: function() {
        var timeTerms = [];
        if (this.getAbsoluteLatestTime()) {
            var epochTime = this.getAbsoluteLatestTime().getTime() / 1000;
            timeTerms.push(epochTime);
        } else if (this._relativeArgs["latest"]) {
            timeTerms.push(this.getRelativeLatestTime());
        }
        return timeTerms.join(" ");
    },

    /*
     * We currently do no intelligent snapping on generic zoom in cases although
     * we certainly could in the future and it would be nice for our users.
     */
    zoomIn: function() {
        var duration = this.getDuration();
        if (!duration) this.logger.error("Assertion failed - TimeRange.zoomOut not implemented for relative time terms range=" + this.toConciseString());

        this._absoluteArgs["earliest"].setTime(this.getAbsoluteEarliestTime().getTime() + Math.round(duration/2));
        return new Splunk.TimeRange(this._absoluteArgs["earliest"], this._absoluteArgs["latest"], this.serverOffsetAtEarliest, this.serverOffsetAtLatest);
    },

    /*
     * Basically zooms out to quadruple the duration, leaving the latest side of
     * the range unchanged.  However if the range on the endtime side is specified
     * down to more granular units than the starttime, and if there's
     * nice round number boundaries nearby, this method will snap both the 
     * earliest and latest sides of the range out to that level of granularity
     * The best way to understand more is to go to the unit tests
     * and read the testcases.
     */
    zoomOut: function() {
        if (!this.getDuration())
            this.logger.error("Assertion failed - TimeRange.zoomOut not implemented for relative time terms range=" + this.toConciseString());

        // import time classes
        var DateTime = splunk.time.DateTime;
        var Duration = splunk.time.Duration;
        var SplunkTimeZone = splunk.time.SplunkTimeZone;
        var TimeUtils = splunk.time.TimeUtils;

        // get server time zone
        var timeZone = new SplunkTimeZone(Splunk.util.getConfigValue("SERVER_ZONEINFO"));

        // get earliest as DateTime object in server time zone
        var earliest = new DateTime(this._absoluteArgs["earliest"].getTime() / 1000).toTimeZone(timeZone);

        // get latest as DateTime object in server time zone
        var latest = new DateTime(this._absoluteArgs["latest"].getTime() / 1000).toTimeZone(timeZone);

        // compute duration
        var duration = TimeUtils.subtractDates(latest, earliest);

        // compute snapping units based on most significant unit of duration
        var units = new Duration();
        if ((duration.years > 0) || (duration.months > 0))
            units.years = 1;
        else if (duration.days > 0)
            units.months = 1;
        else if (duration.hours > 0)
            units.days = 1;
        else if (duration.minutes > 0)
            units.hours = 1;
        else if (duration.seconds >= 1)
            units.minutes = 1;
        else if (duration.seconds > 0)
            units.seconds = 1;

        // zoom duration to units or to a multiple of 10 years
        duration = (duration.years < 1) ? units.clone() : new Duration(Math.ceil((duration.years * 2) / 10) * 10);

        // snap latest to duration
        latest = TimeUtils.ceilDate(latest, duration);

        // ensure latest is not greater than snapped now
        var isLatest = false;
        var now = TimeUtils.ceilDate(new DateTime().toTimeZone(timeZone), units);
        if (latest.getTime() >= now.getTime())
        {
            latest = now;
            isLatest = true;
        }

        // compute new earliest as either latest minus duration or floored earliest, whichever is earlier
        var earliest2 = TimeUtils.subtractDateDuration(latest, duration);
        earliest = (earliest2.getTime() <= earliest.getTime()) ? earliest2 : TimeUtils.floorDate(earliest, units);

        // ensure earliest is not less than epoch
        var isEarliest = false;
        if (earliest.getTime() <= 0)
        {
            earliest.setTime(1);  // other places throughout the codebase don't seem to like 0
            isEarliest = true;
        }

        // if isEarliest and isLatest, or duration > 20 years, return all time
        if ((isEarliest && isLatest) || (TimeUtils.subtractDates(latest, earliest).years > 20))
        {
            this._absoluteArgs["earliest"] = false;
            this._absoluteArgs["latest"] = false;
            return new Splunk.TimeRange(0);
        }

        // else, return zoomed out time range
        this._absoluteArgs["earliest"].setTime(earliest.getTime() * 1000);
        this._absoluteArgs["latest"].setTime(latest.getTime() * 1000);
        return new Splunk.TimeRange(earliest.getTime(), latest.getTime());
    },
    
    /**
     * PRIVATE method to not duplicate code between getRelativeEarliestTime and
     * getRelativeLatestTime()
     */
    genericGetForRelativeArg:function(which) {
        if (which=="earliest" && this._constructorArgs[0]) return this._constructorArgs[0];
        else if (this._constructorArgs[1]) return this._constructorArgs[1];
        
        // THIS CODE IS UNLOVED BUT IT SEEMS NOT ENTIRELY DEAD. 
        // In theory if everything gets set from the constructors, 
        // then parroting back the constructor args (see above) is fine. 
        // in practice however at a couple places we still fall in here.

        if (!this._relativeArgs.hasOwnProperty(which)) return false;
        var dict = this._relativeArgs[which];
        var str = [];
        if (dict["isRealTime"]) str.push("rt");
        if (dict.hasOwnProperty("count")) {
            if (dict["count"] >= 0) str.push("+");
            str.push(dict["count"]);
        }
        if (dict.hasOwnProperty("units")) {
            str.push(dict["units"]);
        }
        if (dict.hasOwnProperty("snapUnits")) {
            str.push("@" + dict["snapUnits"]);
        }

        return str.join("");
    },

    /**
     * PRIVATE gets the earliestTime when it is a relative time term.
     */
    getRelativeEarliestTime: function() {
        return this.genericGetForRelativeArg("earliest");
    },

    /**
     * PRIVATE gets the latestTime when it is a relative time term.
     */
    getRelativeLatestTime: function() {
        return this.genericGetForRelativeArg("latest");
    },

    /**
     * PRIVATE returns the earliestTime as a JS Date object.
     */
    getAbsoluteEarliestTime: function() {
        return this._absoluteArgs["earliest"];
    },

    /**
     * PRIVATE returns the latestTime as a JS Date object.
     */
    getAbsoluteLatestTime: function() {
        return this._absoluteArgs["latest"];
    },

    /**
     * PRIVATE tries to parse the argument as a relative time string, into its
     * internal representation used by TimeRange.
     */
    parseRelativeArgs: function(arg) {
        
        if (!arg) return false;
        if (arg.indexOf(" ")!=-1) this.logger.error("Assertion failed - Currently we can only deal with a single relative term at a time. ");
        var relativeDict = {};

        // check for the real time flag, make a note and then remove it.
        if (arg.indexOf("rt") == 0) {
            relativeDict["isRealTime"] = true;
            arg = arg.substring(2);
        }
        // split off the @ term, if there is one.
        var splitArgs = arg.split("@");
        arg = splitArgs[0] || false;
        if (splitArgs.length > 1) {
            relativeDict["snapUnits"] = splitArgs[1];
        }
        if (arg && Splunk.util.isInt(parseInt(arg, 10))) {
            relativeDict["count"] = parseInt(arg, 10);
            relativeDict["units"] = Splunk.util.trim(arg.replace(relativeDict["count"], ""), "+") || "s";
        }
        return relativeDict;
    },

    /**
     * PRIVATE tries to parse the argument as either a Date object literal, or a
     * int or float representing seconds since the epoch 
     * NOTE: epochTime values are always to be displayed in the server's timezone.  
     * It is illegal to grab a js Date Object for now() and then use its epochtime 
     * value.  What you need can probably be found in the TimeRange class.
     */
    parseAbsoluteArgs: function(arg, serverOffsetThen) {
        if (!arg && !Splunk.util.isInt(arg)) return false;
        if (arg && arg.charAt && (arg.charAt(0) == "+" || arg.charAt(0) == "-" || arg.substring(0,2) == "rt" || arg=="now") ) return false;
        if (arg instanceof Date) {
            return arg;
        } else if (arg && ("" + arg).match(Splunk.TimeRange.UTCRegex)) {
            var d = new Date();
            d.setTime(arg * 1000);
            return d;
        } else {
            //  try and parse them as strings containing absolute dates
            var parsedDate = Splunk.util.parseDate(arg, this.getTimeFormat());
            return parsedDate;
        }
        return false;
    },

    /**
     * Serializes the timeRange. Generally for debug statements. 
     * For human-readable purposes, use toConciseString()
     */
    toString: function() {
        var str = [];
        if (this.getAbsoluteEarliestTime()) {
            str.push(this.getAbsoluteEarliestTime());
        }
        if (this.getAbsoluteLatestTime()) {
            str.push(this.getAbsoluteLatestTime());
        }
        if (this.getRelativeEarliestTime()) {
            str.push(this.getRelativeEarliestTime());
        }
        if (this.getRelativeLatestTime()) {
            str.push(this.getRelativeLatestTime());
        }
        return str.join(" ");
    },
   
    /**
     * returns a compact localized description of the range.
     */
    toConciseString: function() {        
        if (this.isAbsolute()) {
            // open ended ranges are supported so be careful not to use new Date() by default (which would result in the browser's current time).
            var earliestTime = null;
            var latestTime   = null;
            if (this.getAbsoluteEarliestTime()) {
                earliestTime = new Date();
                earliestTime.setTime(this._absoluteArgs["earliest"].valueOf());
                // correct timezone offsets.
                if (Splunk.TimeRange.CORRECT_OFFSET_ON_DISPLAY) {
                    var earliestDelta = Splunk.util.getTimezoneOffsetDelta(this.serverOffsetAtEarliest, earliestTime);
                    earliestTime.setTime(earliestTime.valueOf() - earliestDelta);
                }
            }
            if (this.getAbsoluteLatestTime()) {
                latestTime = new Date();
                latestTime.setTime(this._absoluteArgs["latest"].valueOf());
                // correct timezone offsets.
                if (Splunk.TimeRange.CORRECT_OFFSET_ON_DISPLAY) {
                    var latestDelta   = Splunk.util.getTimezoneOffsetDelta(this.serverOffsetAtLatest, latestTime);
                    latestTime.setTime(latestTime.valueOf()     - latestDelta);
                }
            }
            // defers to i18n format_daterange function.
            return format_datetime_range(Splunk.util.getConfigValue('LOCALE', "NONE"), earliestTime, latestTime);
        } else if (this.isRealTime()) {
            var relativeRangeHeader = this.formatRelativeRange();
            if (relativeRangeHeader == this.CUSTOM_RELATIVE_RANGE_HEADER) {
                return this.CUSTOM_REAL_TIME_RANGE_HEADER;
            } else {
                return sprintf(this.GENERIC_REAL_TIME_RANGE_HEADER, relativeRangeHeader);
            }
        } else if (this.isRelative() && !this.isRealTime()) {
            return this.formatRelativeRange();
        } else {
            return _("over all time");
        }
    },
    
    formatRelativeRange: function() {
        var relEarliest = this._relativeArgs["earliest"];
        var relLatest   = this._relativeArgs["latest"];
        if (relEarliest.hasOwnProperty("snapUnits")) {
            if (relLatest.hasOwnProperty("snapUnits") != relLatest.hasOwnProperty("snapUnits")) {
                throw("Assertion failed - we dont support cases where one side has snapUnits and the other does not.");
            }
            // Special cases for 'today' 'yesterday', 'this week', 'previous week'
            if (this._unitMap[relEarliest["snapUnits"]] == "day"
                && this._unitMap[relLatest["snapUnits"]] == "day") {
                if (!relEarliest.hasOwnProperty("count")
                    && relLatest.hasOwnProperty("count")
                    && relLatest["count"] == 1) {
                    return _("today");
                }
                else if (!relLatest.hasOwnProperty("count")
                    && relEarliest.hasOwnProperty("count")
                    && relEarliest["count"] == -1) {
                    return _("yesterday");
                }
            }
            // check for the form @something  +1something@something,  which is 'This Something'
            if (!relEarliest.hasOwnProperty("count")
                    && relLatest.hasOwnProperty("count")
                    && relLatest["count"] == 1) {
                return sprintf(_("during this %(singleUnitOfTime)s"), {singleUnitOfTime: this._unitMap[relEarliest["snapUnits"]]});
            }
            // if this is in the form -1something@something  @something,  ie 'Last Something'
            // first make sure it has an earliest count, it has no latest count, and the earliest count is 1.
            if (!relLatest.hasOwnProperty("count")
                    && relEarliest.hasOwnProperty("count")
                    && relEarliest["count"] == -1) {
                // make sure the snap Units on the earliest term match the main units.
                if (relEarliest.hasOwnProperty("snapUnits") && (relEarliest["snapUnits"] == relEarliest["units"])) {
                    // make sure the snap units on the latest term also match
                    if (relLatest.hasOwnProperty("snapUnits") && (relLatest["snapUnits"] == relEarliest["units"])) {
                        return sprintf(_("during last %(singleUnitOfTime)s"), {singleUnitOfTime: this._unitMap[relEarliest["snapUnits"]]});
                    }
                }
            }
        }
        if (relEarliest.hasOwnProperty("units") && this._unitMap.hasOwnProperty(relEarliest["units"]) 
            && !relLatest.hasOwnProperty("snapUnits") 
            && ((!relLatest.hasOwnProperty("units") && !relLatest.hasOwnProperty("count")) || relLatest["count"] ==0) ) {
            // catches cases like "in the last month",  "in the last hour", regardless of snap term
            if (relEarliest.hasOwnProperty("count") && relEarliest["count"] == -1 ) {
                if (!relEarliest.hasOwnProperty("snapUnits") || (relEarliest["snapUnits"] == relEarliest["units"])) {
                    // TRANS: in this particular case the range is exactly one month (or one hour or one minute).
                    return sprintf(_("in the last %(unitOfTime)s"), {unitOfTime: this._unitMap[relEarliest["units"]]});
                }
            }
            // catches cases like "in the last 4 months",  "in the last 7 hours", also regardless of snap term
            else if (relEarliest.hasOwnProperty("units") && relEarliest.hasOwnProperty("count")) {
                // make sure there's either no earliest snap time, or it matches the unit
                if (!relEarliest.hasOwnProperty("snapUnits") || relEarliest["snapUnits"] == relEarliest["units"]) {
                    // TRANS: TODO - still need to ungettext this plural form and remove the hardcoded S below... However since the value is dynamic in the code it requires further thought.
                    return sprintf(_("in the last %(count)s %(unitOfTime)ss"), {count: -relEarliest["count"], unitOfTime: this._unitMap[relEarliest["units"]]});
                }
            }
        }
        return this.CUSTOM_RELATIVE_RANGE_HEADER;
    },

    /**
     * Copies a new TimeRange instance and returns.  Useful for when you
     * want to pass a TimeRange property, but you dont entirely trust the
     * receiver to leave it unchanged.
     */
    clone: function() {
        var range = new Splunk.TimeRange(this._constructorArgs[0], this._constructorArgs[1], this._constructorArgs[2], this._constructorArgs[3]);
        range.setAsSubRangeOfJob(this.isSubRangeOfJob());
        return range;
    },
    /**
     * Deprecated version of clone().  Deprecated 7/26/2010 for consistency. 
     * other objects in splunk.* have a clone() method. No others have a 
     * copy() method.
     */
    copy: function() {
        return this.clone();
    },
    
    strftime: function(date, timeFormat) {
        return date.strftime(timeFormat || this.getTimeFormat());
    },
    
    getTimeFormat: function() {
        return Splunk.util.getConfigValue('DISPATCH_TIME_FORMAT', this._fallbackAbsoluteTimeFormat);
    }
});
Splunk.TimeRange.UTCRegex = new RegExp("^[0-9]*(\.[0-9]+)?$");
Splunk.TimeRange.CORRECT_OFFSET_ON_DISPLAY = true;
Splunk.TimeRange.relativeArgsToString = function(count, units, snapUnits) {
    // doesnt matter but we pick earliest.
    var which = 'earliest';
    var range = new Splunk.TimeRange();
    range._relativeArgs[which] = {count: count, units:units, snapUnits:snapUnits};
    return range.genericGetForRelativeArg(which);
};






Splunk.TimeZone = $.klass({

    initialize: function(serializedTimeZone) {
        this._serializedTimeZone = serializedTimeZone;
        
        this._standardOffset = null; //Number 
        this._serializedTimeZone = null;  //String;

        this._isConstant = false;
        this._offsetList =[];
        this._timeList   =[];
        this._indexList  =[];

        this._parseSerializedTimeZone(serializedTimeZone);
    },

    getSerializedTimeZone: function () {
        return this._serializedTimeZone;
    },

    numericBinarySearch: function(list, value) {
        if (!list) throw new TypeError("Parameter list must be non-null.");
        var high = list.length - 1;
        if (high < 0) return -1;

        var low = 0;
        var mid;
        var comp;

        while (low <= high) {
            mid = parseInt(low + (high - low) / 2, 10);
            comp = (value - list[mid]);
            
            if (comp < 0) {
                high = mid - 1;
            } else if (comp > 0) {
                low = mid + 1;
            } else {
                return mid;
            }
        }
        return -low - 1;
    },

    getOffset: function(epochTime) {
        if (this._isConstant) return this._standardOffset;

        var offsetList = this._offsetList;
        var numOffsets = offsetList.length;
        if (numOffsets == 0) return 0;

        if (numOffsets == 1) return offsetList[0];

        var timeList = this._timeList;
        var numTimes = timeList.length;
        if (numTimes == 0) return 0;

        var timeIndex;
        if (numTimes == 1) {
            timeIndex = 0;
        }
        else {
            timeIndex = this.numericBinarySearch(timeList, epochTime);
            if (timeIndex < -1) {
                timeIndex = -timeIndex - 2;
            } else if (timeIndex == -1) {
                timeIndex = 0;
            }
        }
        var offsetIndex = this._indexList[timeIndex];
        return offsetList[offsetIndex];
    },

    _parseSerializedTimeZone: function (serializedTimeZone) {
        // ### SERIALIZED TIMEZONE FORMAT 1.0
        // Y-25200 YW 50 44 54
        // Y-28800 NW 50 53 54
        // Y-25200 YW 50 57 54
        // Y-25200 YG 50 50 54
        // @-1633269600 0
        // @-1615129200 1
        // @-1601820000 0
        // @-1583679600 1

        // ### SERIALIZED TIMEZONE FORMAT 1.0
        // C0
        // Y0 NW 47 4D 54
        
        if (!serializedTimeZone)
            return;

        var entries = serializedTimeZone.split(";");
        for (var i=0; i<entries.length; i++) {
            var entry = entries[i];
            if (entry) {
                switch (entry.charAt(0)) {
                    case "C":
                        
                        if (this._parseC(entry.substring(1, entry.length)))
                            return;
                        break;
                    case "Y":
                        
                        this._parseY(entry.substring(1, entry.length));
                        break;
                    case "@":
                        this._parseAt(entry.substring(1, entry.length));
                        break;
                    default:
                        break;
                }
            }
        }

        this._standardOffset = this.getOffset(0);
    },

    _parseC: function(entry) {
        // 0    
        if (!entry) return false;

        var time = parseInt(entry, 10);
        /*jsl:ignore*/
        // this comparison triggers the 'useless comparison' error
        if (time != time) return false;
        /*jsl:end*/

        this._standardOffset = time;
        this._isConstant = true;

        return true;
    },

    _parseY: function(entry) {
        // -25200 YW 50 44 54

        if (!entry) return;
        
        var elements = entry.split(" ");
        if (elements.length < 1) return;

        var element = elements[0];
        if (!element) return;
        
        var offset = parseInt(element, 10);
        /*jsl:ignore*/
        // this comparison triggers the 'useless comparison' error
        if (offset != offset) return;
        /*jsl:end*/

        this._offsetList.push(offset);
    },

    _parseAt: function (entry) {
        // -1633269600 0

        if (!entry) return;

        var elements = entry.split(" ");
        if (elements.length < 2) return;

        var element = elements[0];
        if (!element) return;

        var time = parseInt(element, 10);
        /*jsl:ignore*/
        // this comparison triggers the 'useless comparison' error
        if (time != time) return;
        /*jsl:end*/

        element = elements[1];
        if (!element)  return;

        var index = parseInt(element, 10);
        /*jsl:ignore*/
        // this comparison triggers the 'useless comparison' error
        if (index != index) return;
        /*jsl:end*/

        index = parseInt(index, 10);
        if ((index < 0) || (index >= this._offsetList.length)) return;

        this._timeList.push(time);
        this._indexList.push(index);
    }
});

