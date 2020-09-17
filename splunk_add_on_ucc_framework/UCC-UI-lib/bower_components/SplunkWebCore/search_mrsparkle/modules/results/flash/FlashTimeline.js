Splunk.namespace("Module");

/**
 * FlashTimeline displays a timeline of events from a search.  It allows
 * time range selection queries.
 */
Splunk.Module.FlashTimeline = $.klass(Splunk.Module.DispatchingModule, {

    LINEAR_SCALE_LABEL: _("Linear scale"),
    LOG_SCALE_LABEL: _("Log scale"),
    HIDE_TOGGLE_LABEL: _("Hide"),
    SHOW_TOGGLE_LABEL: _("Show timeline"),

    CUSTOM_DATE_FORMATS: {
        "EEE MMM d": {
            "day_before_month": "EEE d MMM",
            "ja_JP": "EEE MMM d\u65e5",
            "ko_KR": "EEE MMM d\uc77c",
            "zh_CN": "EEE MMM d\u65e5",
            "zh_TW": "EEE MMM d\u65e5"
        },
        "MMMM": {
        },
        "yyyy": {
            "ja_JP": "yyyy\u5e74",
            "ko_KR": "yyyy\ub144",
            "zh_CN": "yyyy\u5e74",
            "zh_TW": "yyyy\u5e74"
        }
    },

    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("FlashTimeline.js");

        // this lets us know if the SID has changed
        this._prevSID = null;

        // we keep track now of each render, to match it to the corresponding onDataUpdated event.
        this.updateId = -1;

        // used to communicate with PageStatus singleton about rendering in progress.
        this.renderMonitor = null;

        this.isEntireRangeSelected = true;

        // strings that timeline may ask to be localized
        _("Open as image");
        _("year");
        _("years");
        _("month");
        _("months");
        _("day");
        _("days");
        _("hour");
        _("hours");
        _("minute");
        _("minutes");
        _("second");
        _("seconds");

        var Menu = {
            containerDiv: this.container,
            menuDict: [
                {
                    label: _("Linear scale"),
                    callback: this.linScale.bind(this),
                    style: "linScale"
                },
                {
                    label: _("Log scale"),
                    callback: this.logScale.bind(this),
                    style: "logScale"
                }
            ],
            activator: ".linLogToggle"
        };

        this.menu = new Splunk.MenuBuilder(Menu);

        this.zoomInLink = $("a.zoomIn",this.container).click(this.zoomIn.bind(this));
        this.zoomOutLink = $("a.zoomOut",this.container).click(this.zoomOut.bind(this));
        this.selectAllLink = $("a.selectAll",this.container).click(this.selectAll.bind(this));
        this.toggleLabel = $("a.hideshow .splIconicLinkLabel",this.container);
        $("a.hideshow", this.container).click(this.onToggle.bind(this));

        // create message container
        $(".TimelineContainer", this.container).append("<div class=\"messageContainer\"></div>");

        switch (this.getParam("renderer"))
        {
            case "canvas":
                this.renderer = "canvas";
                break;
            case "flash":
                this.renderer = "flash";
                break;
            default:
                this.renderer = this._hasCanvas() ? "canvas" : "flash";
                break;
        }

        switch (this.renderer)
        {
            case "canvas":
                this._timeline = new this.CanvasTimeline(this);
                break;
            case "flash":
                this._timeline = new this.FlashTimeline(this);
                break;
            default:
                // no-op
                break;
        }

        if (this._timeline)
            this._timeline.initialize(container);

        if (Splunk.util.normalizeBoolean(this.getParam("minimalMode")))
            $(".TimelineContainer", this.container).css("height", this.getParam("minimalHeight"));

        if (Splunk.util.normalizeBoolean(this.getParam("minimized")))
            this.minimize(false);
        else
            this.maximize(false);
        
        this.checkStatusBuckets = false;
    },

    update: function() {
        if (this._timeline)
            this.updateId = this._timeline.update();
    },

    onToggle: function(evt) {
        if (Splunk.util.normalizeBoolean(this.getParam("minimized"))) {
            this.maximize(true);
        } else {
            this.minimize(true);
        }
        evt.preventDefault();
    },

    minimize: function(save) {
        if (save) {
            this.setParam("minimized", true);
        }

        this.hideContent("minimize");
        $(".TimelineContainer", this.container).hide();
        $(".controlLinks", this.container).addClass("minimized");
        this.toggleLabel.html(this.SHOW_TOGGLE_LABEL);
        return false;
    },

    maximize: function(save) {
        if (save) {
            this.setParam("minimized", false);
        }

        $(".TimelineContainer", this.container).show();
        this.showContent("minimize");

        $(".controlLinks", this.container).removeClass("minimized");
        this.toggleLabel.html(this.HIDE_TOGGLE_LABEL);
        return false;
    },

    zoomIn: function(evt) {
        if  (this.zoomInLink.hasClass('splIconicLinkDisabled')) return false;

        var range = this.getSelectionRange();

        // if no selection is recorded, or if the entire range is selected,
        // then we defer to the generic zoom methods on the TimeRange class.
        if (!range || (range && range.equalToRange(this.getTimelineRangeFromUTC()))) {
            // TODO - there is further logic that 3.X had, that we'll need to put
            // back someday,  where we check whether the resulting recent-half
            // of the range is unpopulated
            // If it is, we instead snap into the populated data.
            // unless the *entire* timeline is unpopulated, in which case we
            // scratch our heads but let the generic zoomIn method zoom into the
            // recent half even though it's empty.

            // first however, we make sure we arent about to zoom into a single millisecond
            if (range.getDuration() == 1) {
                var messenger = Splunk.Messenger.System.getInstance();
                messenger.send("info", "splunk", _("The timeline can not zoom in to a single millisecond."));

                // it can be useful to "commit" the single millisecond range
                // to the TimeRangePicker, so im still doing that.
                this._passTimeRangeToParent(range);
                return;
            }

            this._passTimeRangeToParent(range.zoomIn());
        // otherwise the user has selected a range and the range is a subset.
        // In this case we zoom into exactly that subset range.
        } else {
            this._passTimeRangeToParent(range);
        }
        this.selectAll();
        if (evt.preventDefault)
            evt.preventDefault();
    },

    zoomOut: function(evt) {
        if  (this.zoomOutLink.hasClass('splIconicLinkDisabled')) return false;

        var timelineRange = this.getTimelineRangeFromUTC();
        if (timelineRange) {
            this._passTimeRangeToParent(timelineRange.zoomOut());
        } else {
            this.logger.error(this.moduleType, " could not zoom out cause we had an undefined timelineRange");
        }
        evt.preventDefault();
    },

    selectAll: function(evt) {
        if  (this.selectAllLink.hasClass('splIconicLinkDisabled')) return false;

        var context = this.getContext();
        var search  = context.get("search");

        $(".controlLinks", this.container).addClass("noSelection");
        this.selectAllLink.addClass("splIconicLinkDisabled");
        this.zoomInLink.addClass("splIconicLinkDisabled");

        this.clearSelectionRange();
        if (search.isJobDispatched()) {
            this.pushContextToChildren();
        }
        if (evt) evt.preventDefault();
    },


    logScale: function(evt) {
        $(".linLogLabel", this.container).text(this.LOG_SCALE_LABEL);
        if (this._timeline)
            this._timeline.setScaleY("log");
    },

    linScale: function(evt) {
        $(".linLogLabel", this.container).text(this.LINEAR_SCALE_LABEL);
        if (this._timeline)
            this._timeline.setScaleY("linear");
    },
    showDataControls: function(show) {
        if (show) {
            $(".controlLinks", this.container).removeClass("noData");
            this.zoomOutLink.removeClass("splIconicLinkDisabled");
        } else {
            $(".controlLinks", this.container).addClass("noData");
            this.zoomOutLink.addClass("splIconicLinkDisabled");
        }
    },

    /**
     * Current version of jQuery ui is buggy. Additional logic to make things work consistently.
     */
    enableResizable: function() {
        if (!($.browser.safari && $.browser.version < "526")) {  // disable resizing for safari 3 and below only
            $("div.TimelineContainer", this.container).resizable({autoHide: true, handles: "s", stop: this.onResizeStop.bind(this)});
            $("div.TimelineContainer").mouseup(  // workaround until jquery ui is updated
                function(event) {
                    $(this).width("100%");
                }
            );
        }
    },

    /**
     * Retrieve the normalized computed style for a specified element.
     *
     * @param {Array} specificity An array of elements to try and find a related css property from. The first element to return a property exits the routine.
     * @param {String} cssProperty The css property following standard css property convention not camel case.
     *
     * @type String || null
     * @return Returns a hexadecimal value of a matching element css selector property or null.
     */
    getCSSColor: function(specificity, cssProperty) {
        var color;
        for (var i = 0; i < specificity.length; i++) {
            var computedColor = specificity[i].css(cssProperty);
            color = Splunk.util.normalizeColor(computedColor);
            if (color) {
                return color;
            }
        }
        return null;
    },

    /**
     * Adds the appropriate TimeRange instance into the context for downstream
     * modules, if the user has selected a subrange.
     */
    getModifiedContext: function() {
        var context = this.getContext();
        if (this.isEntireRangeSelected)
            return context;

        var selectedBuckets = this._timeline ? this._timeline.getSelectedBuckets() : null;
        if (!selectedBuckets) {
            this.logger.warn(this.moduleType, " Assertion failed - getModifiedContext was called but getSelectedBuckets is null.");
            return context;
        }

        var continueSummingAvailableEvents = true;
        var numberOfBuckets = selectedBuckets.length;

        var totalEvents = 0;
        var totalEventsAvailable = 0;
        for (var i = numberOfBuckets - 1; i > -1; i--) {
            var b = selectedBuckets[i];
            totalEvents += b["eventCount"];
            if (continueSummingAvailableEvents) {
                totalEventsAvailable += b["eventAvailableCount"];
            }
            if (b["eventAvailableCount"] < b["eventCount"]) {
                // TODO mark the completness/incompleteness of the set, so other modules can know its not complete.
                //      currently everything is still using onJobDone to determine >= or exact vals, which is overly
                //      conservative in any selected range case where the bucket start is after the cursor time.
                continueSummingAvailableEvents = false;
            }
        }

        var search  = context.get("search");
        search.setSelectedEventAvailableCount(totalEventsAvailable);
        search.setSelectedEventCount(totalEvents);
        var range = this.getSelectionRange(selectedBuckets);
        search.setTimeRange(range);
        context.set("search", search);
        return context;
    },

    /**
     * The fact that the upstream TimeRange may be a relative range complicates
     * various cases like zoom in and zoom out.  In these cases we need to work
     * with an absolute equivalent of that relative range.
     * To avoid this issue we always make these calculations from an absolute range
     * that we create from the timelineData itself.
     */
    getTimelineRangeFromUTC: function() {
        if (this._timeline)
        {
            try {
                var earliestEpochTime = this._timeline.getViewMinimum();
                var latestEpochTime   = this._timeline.getViewMaximum();

                if (Splunk.util.isInt(Math.floor(earliestEpochTime)) && Splunk.util.isInt(Math.floor(latestEpochTime))) {
                    return new Splunk.TimeRange(earliestEpochTime, latestEpochTime);
                } else {
                    this.logger.error("undefined values " + earliestEpochTime + ", " + latestEpochTime);
                }
            } catch (e) {
                this.logger.error(this.moduleType, " exception getting earliest and latest selected times - " + e);
            }
        }
        return new Splunk.TimeRange();
    },

    /**
     * returns the localized description of the current scale of the X-axis.
     * ie "1 bar = 1 minute"
     */
    getScaleDescription: function() {
        var timelineScale = this._timeline ? this._timeline.getTimelineScale() : null;
        if (!timelineScale)
            return "";
        var unit = timelineScale.unit;
        var value= timelineScale.value;
        if (parseFloat(value) < 1) {
            if (unit == "second") {
                value = value * 1000;
                unit = "millisecond";
            } else {
                this.logger.error("error - timelineScale has a fractional unit but not in seconds.");
            }
        }
        if (unit == "millisecond") {
            return sprintf(ungettext("1 bar = %s millisecond", "1 bar = %s milliseconds", value), value);
        } else if (value == 1) {
            switch (unit) {
                case "year":
                    return _("1 bar = 1 year");
                case "month":
                    return _("1 bar = 1 month");
                case "day":
                    return _("1 bar = 1 day");
                case "hour":
                    return _("1 bar = 1 hour");
                case "minute":
                    return _("1 bar = 1 minute");
                case "second":
                    return _("1 bar = 1 second");
                default:
                    this.logger.error("received uncaught unit of ", unit);
                    break;
            }
        } else {
            this.logger.error("received a timelineScale that has >1 unit per bucket. (" + value + "). This should not happen");
        }
        return "";
    },

    /**
     * returns the currently selected range.
     * NOTE: although it's ok to call this when the entire range is selected
     * the clients of this method make some effort to avoid doing so.
     * if the entire range is selected we just dont change the context at all.
     */
    getSelectionRange: function(selectedBuckets) {
        if (!selectedBuckets)
            selectedBuckets = this._timeline ? this._timeline.getSelectedBuckets() : null;
        var numberOfBuckets = selectedBuckets ? selectedBuckets.length : 0;
        if (numberOfBuckets == 0) {
            this.logger.error(this.moduleType, " getSelectionRange returned an empty selectedBuckets. Returning 'All Time'");
            return new Splunk.TimeRange();
        }
        var earliestBucket = selectedBuckets[0];
        var latestBucket = selectedBuckets[numberOfBuckets - 1];
        var range = new Splunk.TimeRange(earliestBucket["earliestTime"], latestBucket["latestTime"]);
        range.setAsSubRangeOfJob(!this.isEntireRangeSelected);

        return range;
    },

    clearSelectionRange: function() {
        this.isEntireRangeSelected = true;
        if (this._timeline)
        {
            this._timeline.setSelectionMinimum(NaN);
            this._timeline.setSelectionMaximum(NaN);
        }
    },

    resetUI: function() {
        if (this._timeline)
            this._timeline.setJobID("");
        this.update();
        this.showDataControls(false);
        this.hideStatusMessage();
    },

    hideContent: function(key) {
        key = (key != null) ? String(key) : "";

        if (this._hideKeys)
        {
            this._hideKeys[key] = true;
            return false;
        }

        this._hideKeys = {};
        this._hideKeys[key] = true;

        if (this._timeline)
            this._timeline.hide();

        return true;
    },

    showContent: function(key) {
        if (!this._hideKeys)
            return false;

        key = (key != null) ? String(key) : "";

        delete this._hideKeys[key];
        for (key in this._hideKeys)
        {
            if (this._hideKeys.hasOwnProperty(key))
                return false;
        }

        this._hideKeys = null;

        if (this._timeline)
            this._timeline.show();

        return true;
    },

    isContentVisible: function() {
        return !this._hideKeys;
    },

    /**
     * display a search job status message
     */
    showStatusMessage: function(msg, sid) {
        var str = "";
        str += "<p class=\"resultStatusMessage empty_results\">";
        str += msg;
        if (sid)
        {
            str += " <span class=\"resultStatusHelp\">";
            str += "<a href=\"#\" onclick=\"Splunk.window.openJobInspector('" + sid.replace("'", "") + "');return false;\" class=\"resultStatusHelpLink\">";
            str += _("Inspect ...");
            str += "</a>";
            str += "</span>";
        }
        str += "</p>";

        this.hideContent("showStatusMessage");
        $(".messageContainer", this.container).html(str).show();
    },

    hideStatusMessage: function() {
       $(".messageContainer", this.container).hide().html("");
        this.showContent("showStatusMessage");
    },

    /**
     * When a job is dispatched for us somewhere upstream, this is
     * where we tell the framework we need at least this many status_buckets
     * in the job.  (defaults to 300 but its configurable)
     */
    onBeforeJobDispatched: function(search) {
        search.setMinimumStatusBuckets(this._params["statusBuckets"]);
    },

    onJobProgress: function() {
        var context = this.getContext();
        var search  = context.get("search");
        var sid = search.job.getSearchId();
        if (search.job.isDone()) {
            // Notifying PageStatus that a render is beginning.
            if (!this.renderMonitor) {
                this.renderMonitor = Splunk.Globals["PageStatus"].register(this.moduleType + " - rendering final data - " + this.container.attr("id"));
            }
        }
        this.update();
        
        if (this.checkStatusBuckets) {
            if (sid && (search.job.getStatusBuckets() < 1)) {
                this.hideContent("statusBuckets");
                this.hide();
            } else {
                this.show();
                this.showContent("statusBuckets");
            }
            this.checkStatusBuckets = false;
        }
    },

    /**
     * Like other modules, when any new context comes down from above, it
     * clears any selection state it may have had.
     * and notifies the timeline to display the data from the new sid.
     */
    onContextChange: function() {
        var context = this.getContext();
        var search  = context.get("search");
        var sid = search.job.getSearchId();

        this.checkStatusBuckets = true;
        
        // from this point, until the timelineDataAvailable event is fired, we must
        // disable or ignore all interaction.
        this.showDataControls(false);

        // when getting a new context, reset the selection range.
        this.clearSelectionRange();

        if (this._timeline)
        {
            // select all if SID has changed
            if (sid != this._prevSID)
            {
                this._prevSID = sid;
                this.selectAll();
            }

            // This handles the case where the sid has high byte chars in it.
            // It should probably be removed when Gatt has implemented encoding in his lib.
            if (sid != null) {
                this._timeline.setJobID(encodeURIComponent(encodeURIComponent(sid)));
            } else {
                this._timeline.setJobID(sid);
            }

            // set max bucket count to render
            this._timeline.setBucketCount(this.getParam("maxBucketCount"));
        }

        this.update();
    },

    /**
     * Fired when the timeline tells us it has finished rendering a new copy of
     * the timelineData.  Note that this does not mean the job is done.
     */
    onDataUpdated: function(event) {
        var context = this.getContext();
        var search  = context.get("search");

        // screen out previews and (for the timeline) async updates onJobProgress
        if (search.isJobDispatched() && search.job.isDone()) {
            // each time you call "update" you get back an int that increments each time.
            // We keep this int as a local property - this.updateId
            // if the "updateCount" of this particular dataUpdated event, matches the last
            // update we asked for,  then we mark it complete.
            // it's possible however that we asked for another update RIGHT when the penultimate
            // update request returned.  That's what this check is doing.
            if (this.renderMonitor && (event.updateCount >= this.updateId)) {
                this.renderMonitor.loadComplete();
                this.renderMonitor = false;
            }
        }

        if (search.isJobDispatched()) {
            // we have data so we can turn on all the data controls.
            this.showDataControls(true);

            // the reason why we need to update it so often is because in
            // unbounded ranges the scale changes during the life of the job.
            $(".bucketSize", this.container).html(this.getScaleDescription());
        }
    },

    /**
     * Fired when the timeline tells us the user has made any selection.
     */
    onSelectionChanged: function(event) {
        if (isNaN(event.selectionMinimum) || isNaN(event.selectionMaximum) || (event.selectionMinimum === event.selectionMaximum)) {
            this.selectAll();
            return;
        }

        var context = this.getContext();
        var search  = context.get("search");
        //console.log("onSelectionChanged");

        this.isEntireRangeSelected = false;
        this.selectAllLink.removeClass("splIconicLinkDisabled");
        this.zoomInLink.removeClass("splIconicLinkDisabled");

        if (search.isJobDispatched()) {
            this.pushContextToChildren();
        }
    },

    /**
     * Handle a resize stop event from the Resizable jQuery extension. See http://docs.jquery.com/UI/Resizable
     * Saves the new height with a "px" suffix to viewstate.conf.
     *
     * @param {Object} event Original browser event.
     * @param {Object} ui Prepared ui object having the following attributes: http://docs.jquery.com/UI/Resizable#overview
     */
    onResizeStop: function(event, ui) {
        $(event.target).width("100%");
        this.setParam("height", ui.size.height + "px");
    },

    /**
     * internal method called when the user clicks "zoom in" or "zoom out"
     * in order to send the timeRange up (probably to a TimeRangePicker instance)
     */
    _passTimeRangeToParent: function(range) {
        // TODO intention classes, or helper methods are needed.
        var search  = new Splunk.Search();
        search.setTimeRange(range);

        // if you are dispatching a new search,
        // we should ensure we pass down the statusbuckets
        search.setMinimumStatusBuckets(this._params["statusBuckets"]);

        var context = new Splunk.Context();
        context.set("search", search);

        this.passContextToParent(context);
    },

    _hasCanvas: function() {
        var canvas = document.createElement("canvas");
        if (!canvas)
            return false;

        if (typeof canvas.getContext !== "function")
            return false;

        var context = canvas.getContext("2d");
        if (!context)
            return false;

        return true;
    },

    /**
     * called by the timeline itself, which needs to reach out here in order to localize
     * strings for timeranges. The timeline gives us the timerange info and we
     * provide a localized human language equivalent.
     */
    formatTooltip: function(earliestTime, latestTime, earliestOffset, latestOffset, eventCount) {
        // NOTE - we no longer have any use for the timezone offsets that the timeline gives us.
        var range = new Splunk.TimeRange(earliestTime, latestTime);
        var tooltip = sprintf(
            ungettext(
                "%(eventCount)s event %(timeRangeString)s",
                "%(eventCount)s events %(timeRangeString)s",
                eventCount
            ),
            {eventCount: format_decimal(eventCount), timeRangeString: range.toConciseString()});
        return tooltip;
    },

    formatSimpleString: function(str) {
        return _(str);
    },

    formatNumericString: function(strSingular, strPlural, num) {
        return sprintf(ungettext(strSingular, strPlural, num), this.formatNumber(num));
    },

    formatNumber: function(num) {
        var pos = Math.abs(num);
        if ((pos > 0) && ((pos < 1e-3) || (pos >= 1e9)))
            return format_scientific(num, "##0E0");
        return format_decimal(num);
    },

    formatDate: function(time, timeZoneOffset, dateFormat) {
        if (dateFormat)
        {
            var customFormat = this.CUSTOM_DATE_FORMATS[dateFormat];
            if (customFormat)
            {
                var localeName = locale_name();
                if (customFormat[localeName])
                    dateFormat = customFormat[localeName];
                else if (locale_uses_day_before_month() && customFormat["day_before_month"])
                    dateFormat = customFormat["day_before_month"];
            }
        }
        return format_date(this.epochToDateTime(time, timeZoneOffset), dateFormat);
    },

    formatTime: function(time, timeZoneOffset, timeFormat) {
        if (timeFormat == "full")
                return format_time_microseconds(this.epochToDateTime(time, timeZoneOffset), timeFormat);
        return format_time(this.epochToDateTime(time, timeZoneOffset), timeFormat);
    },

    formatDateTime: function(time, timeZoneOffset, dateFormat, timeFormat) {
        if (timeFormat == "full")
                return format_datetime_microseconds(this.epochToDateTime(time, timeZoneOffset), dateFormat, timeFormat);
        return format_datetime(this.epochToDateTime(time, timeZoneOffset), dateFormat, timeFormat);
    },

    epochToDateTime: function(time, timeZoneOffset) {
        var date = new Date(Math.floor((time + timeZoneOffset) * 1000));
        var dateTime = new DateTime({
            date: date,
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
            second: date.getUTCSeconds(),
            microsecond: date.getUTCMilliseconds() * 1000
        });
        dateTime.weekday = function() {
            var d = this.date.getUTCDay() - 1;
            if (d < 0)
                d = 6;
            return d;
        };
        return dateTime;
    },



    /**
     * Timeline interface classes appear below.
     *
     * Each interface must include the following methods:
     *
     *   initialize(container:Div) : void
     *   update() : int
     *   setJobID(value:String) : void
     *   setBucketCount(value:Number) : void
     *   setScaleY(value:String) : void  // value=log|linear
     *   setSelectionMinimum(value:Number) : void
     *   setSelectionMaximum(value:Number) : void
     *   getViewMinimum() : Number
     *   getViewMaximum() : Number
     *   getSelectedBuckets() : Array
     *   getTimelineScale() : Object
     *   hide() : void
     *   show() : void
     */



    /**
     * CanvasTimeline interface
     */
    CanvasTimeline: (function() {
        var c = function(module) {
            this.module = module;
        };
        c.prototype = {

            initialize: function(container) {
                var module = this.module;

                // used to communicate with PageStatus singleton about the async script loading.
                this.scriptLoadMonitor = Splunk.Globals["PageStatus"].register(module.moduleType + " - loading script file - " + module.container.attr("id"));

                $script(Splunk.util.make_url("/static/js/splunk_timeline.js"), this.onScriptLoaded.bind(this));

                $(document).bind("PrintStart", this.onPrintStart.bind(this));
            },

            update: function() {
                if (!this._timeline)
                    return;
                return this._timeline.update();
            },

            setJobID: function(value) {
                if (!this._timeline)
                    return;
                this._timeline.set("jobID", value);
            },

            setBucketCount: function(value) {
                if (!this._timeline)
                    return;
                this._timeline.set("bucketCount", Number(value));
            },

            setScaleY: function(value) {
                if (!this._timeline)
                    return;
                this._timeline.set("scaleY", value);
            },

            setSelectionMinimum: function(value) {
                if (!this._timeline)
                    return;
                this._timeline.set("selectionMinimum", value);
            },

            setSelectionMaximum: function(value) {
                if (!this._timeline)
                    return;
                this._timeline.set("selectionMaximum", value);
            },

            getViewMinimum: function() {
                if (!this._timeline)
                    return;
                return this._timeline.get("viewMinimum");
            },

            getViewMaximum: function() {
                if (!this._timeline)
                    return;
                return this._timeline.get("viewMaximum");
            },

            getSelectedBuckets: function() {
                if (!this._timeline)
                    return;
                return this._timeline.getSelectedBuckets();
            },

            getTimelineScale: function() {
                if (!this._timeline)
                    return;
                return this._timeline.get("timelineScale");
            },

            hide: function() {
                if (!this._timeline)
                    return;
                $(this._timeline.element).css("display", "none");
            },

            show: function() {
                if (!this._timeline)
                    return;
                $(this._timeline.element).css("display", "");
                this._timeline.updateSize();
                this._timeline.validate();
            },

            onPrintStart: function() {
                if (!this._timeline)
                    return;
                this._timeline.updateSize();
                this._timeline.validate();
            },

            onScriptLoaded: function() {
                var module = this.module;

                this._timeline = new splunk.charting.Timeline(Splunk.util.make_url("/splunkd"), "");
                this._timeline.externalInterface.formatTooltip = module.formatTooltip.bind(module);
                this._timeline.externalInterface.formatSimpleString = module.formatSimpleString.bind(module);
                this._timeline.externalInterface.formatNumericString = module.formatNumericString.bind(module);
                this._timeline.externalInterface.formatNumber = module.formatNumber.bind(module);
                this._timeline.externalInterface.formatDate = module.formatDate.bind(module);
                this._timeline.externalInterface.formatTime = module.formatTime.bind(module);
                this._timeline.externalInterface.formatDateTime = module.formatDateTime.bind(module);
                this._timeline.set("timeZone", Splunk.util.getConfigValue("SERVER_ZONEINFO"));
                this._timeline.set("enableChartClick", true);
                this._timeline.addEventListener("updated", module.onDataUpdated.bind(module));
                this._timeline.addEventListener("selectionChanged", module.onSelectionChanged.bind(module));
                this._timeline.addEventListener("chartDoubleClicked", module.zoomIn.bind(module));
                this._timeline.appendTo($(".TimelineContainer", module.container)[0]);

                var foregroundColor = module.getCSSColor([module.container], "border-left-color");
                if (foregroundColor)
                    this._timeline.set("foregroundColor", Number(foregroundColor.replace("#", "0x")));

                var seriesColor = module.getCSSColor([module.container], "border-right-color");
                if (seriesColor)
                    this._timeline.set("seriesColor", Number(seriesColor.replace("#", "0x")));

                if (!module.isContentVisible())
                    $(this._timeline.element).css("display", "none");

                if (Splunk.util.normalizeBoolean(module.getParam("minimalMode")))
                    this._timeline.set("minimalMode", true);

                if (Splunk.util.normalizeBoolean(module.getParam("enableResize")) && !Splunk.util.normalizeBoolean(module.getParam("minimalMode")))
                    module.enableResizable();

                module.onContextChange();
                module.update();

                this.scriptLoadMonitor.loadComplete();
            }

        };

        return c;
    })(),



    /**
     * FlashTimeline interface
     */
    FlashTimeline: (function() {
        var c = function(module) {
            this.module = module;
            this.docTitle = document.title;
        };
        c.prototype = {

            initialize: function(container) {
                var module = this.module;

                this.swfObjectId = "swfObject_" + module.container.attr("id");
                this.bridge = new Splunk.JABridge(this.swfObjectId);
                this.minVersion = Splunk.util.getConfigValue("FLASH_MAJOR_VERSION") + "." + Splunk.util.getConfigValue("FLASH_MINOR_VERSION") + "." + Splunk.util.getConfigValue("FLASH_REVISION_VERSION");

                // used to communicate with PageStatus singleton about the async swf loading.
                this.swfLoadMonitor = Splunk.Globals["PageStatus"].register(module.moduleType + " - loading swf file - " + module.container.attr("id"));

                this.initializeBridge();
                if (swfobject.hasFlashPlayerVersion(this.minVersion)) {
                    this.addObjectStructure();
                } else {
                    this.showFlashError();
                }

                // SPL-55283, initializing the Flash component can sometimes result in
                // an undesired change to the document title, setting it back here
                document.title = this.docTitle;

                $(document).bind("PrintStart", this.onPrintStart.bind(this));
                $(document).bind("PrintEnd", this.onPrintEnd.bind(this));
            },

            update: function() {
                return this.callBridgeMethod("update");
            },

            setJobID: function(value) {
                this.setBridgeProperty("jobID", value);
            },

            setBucketCount: function(value) {
                this.callBridgeMethod("setValue", "data.count", value);
            },

            setScaleY: function(value) {
                this.callBridgeMethod("setValue", "axisY.scale", value);
            },

            setSelectionMinimum: function(value) {
                this.setBridgeProperty("selectionMinimum", value);
            },

            setSelectionMaximum: function(value) {
                this.setBridgeProperty("selectionMaximum", value);
            },

            getViewMinimum: function() {
                return this.getBridgeProperty("viewMinimum");
            },

            getViewMaximum: function() {
                return this.getBridgeProperty("viewMaximum");
            },

            getSelectedBuckets: function() {
                return this.callBridgeMethod("getSelectedBuckets");
            },

            getTimelineScale: function() {
                return this.getBridgeProperty("timelineScale");
            },

            hide: function() {
                var module = this.module;
                module.logger.warn("closing down JABridge connection");
                this.bridge.close();
                $(this.bridge.getFlashElement(this.swfObjectId)).css("display", "none");
            },

            show: function() {
                var module = this.module;
                $(this.bridge.getFlashElement(this.swfObjectId)).css("display", "");
                module.logger.warn("bringing back JABridge connection");
                this.connectBridge(true);
            },

            /**
             * Retrieve base64 encoded image snapshot of Flash movie for overlay and shutdown existing movie.
             */
            onPrintStart: function() {
                var module = this.module;
                if($.browser.msie) {
                    return;
                }
                var snapshot = this.callBridgeMethod("getSnapshot");
                if (snapshot) {
                    var img = document.createElement("img");
                    img.setAttribute("width", snapshot.width);
                    img.setAttribute("height", snapshot.height);
                    module.hideContent("onPrintStart");
                    $(".TimelineContainer", module.container)[0].appendChild(img).src = snapshot.data;  // bypass jquery for performance (base64 encoded images are large)
                }
            },

            /**
             * Destroy base64 encoded image snapshot of Flash movie and bring back Flash movie to previous state.
             */
            onPrintEnd: function() {
                var module = this.module;
                if ($.browser.msie) {
                    return;
                }
                $(".TimelineContainer img", module.container).remove();
                module.showContent("onPrintStart");
            },

            connectBridge: function(isReconnect) {
                if (!isReconnect)
                    isReconnect = false;

                this.bridge.connect(function(){this.onConnect(isReconnect);}.bind(this), this.onClose.bind(this));
            },

            /**
             * Template method that subclasses can implement if they need to call
             * bridge.addMethod or bridge.addEvent,  which can only be called after the
             * bridge object has been constructed, but before the connect() method
             * has been called.
             */
            initializeBridge: function() {
                var module = this.module;
                this.bridge.addMethod("formatTooltip", module.formatTooltip.bind(module), [ "earliestTime", "latestTime", "earliestOffset", "latestOffset", "eventCount" ], "String");
                this.bridge.addMethod("formatSimpleString", module.formatSimpleString.bind(module), [ "str" ], "String");
                this.bridge.addMethod("formatNumericString", module.formatNumericString.bind(module), [ "strSingular", "strPlural", "num" ], "String");
                this.bridge.addMethod("formatNumber", module.formatNumber.bind(module), [ "num" ], "String");
                this.bridge.addMethod("formatDate", module.formatDate.bind(module), [ "time", "timeZoneOffset", "dateFormat" ], "String");
                this.bridge.addMethod("formatTime", module.formatTime.bind(module), [ "time", "timeZoneOffset", "timeFormat" ], "String");
                this.bridge.addMethod("formatDateTime", module.formatDateTime.bind(module), [ "time", "timeZoneOffset", "dateFormat", "timeFormat" ], "String");
            },

            /**
             * Handler for when SWFObject has embedded Flash content.
             * SWFObject adds movies asynchronously (absolutely unnecessary) so this is a workaround for all its stupidity.
             *
             * @param {Object) event SWFObject event object having success, id and ref attributes.
             */
            onSWFReady: function(event) {
                var module = this.module;
                if (event.success) {
                    if (module.isContentVisible())
                        this.connectBridge(false);
                    else
                        $(this.bridge.getFlashElement(this.swfObjectId)).css("display", "none");
                    if (Splunk.util.normalizeBoolean(module.getParam("enableResize")) && !Splunk.util.normalizeBoolean(module.getParam("minimalMode"))) {
                        module.enableResizable();
                    }
                } else {
                    module.logger.error("The embedding of the SWF was unsuccessful.");
                }
            },

            addObjectStructure: function() {
                var module = this.module;
                var targetId = "TimelineContainer" + module.container.attr("id");  // SWFObject requires an explicit id.

                var swlUrl = "";
                if (module.getParam("swfFile").substring(0,1) == "/") {
                    swfUrl = Splunk.util.make_url(module.getParam("swfFile"));
                } else {
                     swfUrl = Splunk.util.make_url("/static/flash/" + module.getParam("swfFile"));
                }

                var expressInstallUrl = false;
                var staticPath = Splunk.util.make_url("/static");
                if (staticPath.charAt(staticPath.length - 1) == "/")
                    staticPath = staticPath.substring(0, staticPath.length - 1);
                var flashVars = {
                    "staticPath": staticPath,
                    "hostPath": Splunk.util.make_url("/splunkd"),
                    "basePath": ""
                };
                var params = {
                    wmode: "opaque",
                    allowFullScreen: "true"
                };
                var bgcolor = module.getCSSColor([module.container], "background-color");
                if (bgcolor) {
                    params["bgcolor"] = bgcolor;
                }
                var attributes = {
                    id: this.swfObjectId,
                    name: this.swfObjectId
                };
                $(".TimelineContainer", module.container).append("<div id="+targetId+"></div>");  // SWFObject does complete node replacement, not target child replacement.
                swfobject.embedSWF(swfUrl, targetId, "100%", "100%", this.minVersion, expressInstallUrl, flashVars, params, attributes, this.onSWFReady.bind(this));
            },

            showFlashError: function() {
                var module = this.module;
                var msg = _("Splunk requires a newer version of Flash.");
                module.logger.warn(msg);
                var target = $("div.TimelineContainer", module.container)[0];
                target.innerHTML = sprintf(
                    '<p class="error">%s (Minimum version: %s.%s.%s) <a href="http://get.adobe.com/flashplayer/" target="_blank" class="spl-icon-external-link-xsm">Download Flash Player</a></p>',
                    msg,
                    Splunk.util.getConfigValue("FLASH_MAJOR_VERSION"),
                    Splunk.util.getConfigValue("FLASH_MINOR_VERSION"),
                    Splunk.util.getConfigValue("FLASH_REVISION_VERSION")
                );
            },

            /**
             * Handle JABridge close event.
             */
            onClose: function() {
                var module = this.module;
                module.logger.warn("The JABridge connection was closed with an id of", this.bridge.id());
                this._isBridgeConnected = false;
            },

            /**
             * Handle JABridge connect event.
             *
             * @param {Boolean} isReconnect Controls if the flash movie should be brought back to life.
             */
            onConnect: function(isReconnect) {
                var module = this.module,
                    docTitle = this.docTitle;

                this._isBridgeConnected = true;

                this.setBridgeProperty("enableChartClick", true);
                this.setBridgeProperty("enableOpenAsImage", !jQuery.browser.msie);  // ie does not support uri data scheme.
                this.setBridgeProperty("timeZone", Splunk.util.getConfigValue("SERVER_ZONEINFO"));

                // NOTE -- ASSUMPTION - the first click will always have triggered an 'selectionChanged' event.
                // and most importantly, a change in the swf's internal model, such that when we call getSelectionRange()
                // we'll get the clicked-upon bar.
                // This greatly simplifies the double click case cause we just bind directly to zoomIn()
                this.addBridgeEventListener("chartDoubleClicked", module.zoomIn.bind(module));

                this.addBridgeEventListener("selectionChanged", function(event) {
                    // SPL-55283, a selection change can sometimes result in
                    // an undesired change to the document title, setting it back here
                    document.title = docTitle;

                    module.onSelectionChanged(event);
                });
                this.addBridgeEventListener("updated", module.onDataUpdated.bind(module));
                this.addBridgeEventListener("openAsImage", this.onOpenAsImage.bind(this));

                if (Splunk.util.normalizeBoolean(module.getParam("minimalMode")))
                    this.callBridgeMethod("setValue", "minimalMode", "true");

                this.setPresentation();

                module.onContextChange();
                module.update();

                this.swfLoadMonitor.loadComplete();
            },

            /**
             * Handle JABridge event that has the base64 encoded png image invoked via a flash context menu click. A popup a window with the image will be launched.
             * @param {Object} event An object literal having the following structure { snapshot: { data:, width:, height: } } where data is a base64 encoded image.
             */
            onOpenAsImage: function(event) {
                var snapshot = event.snapshot;
                Splunk.window.open(snapshot.data, this.swfObjectId, {height: snapshot.height+16, width: snapshot.width+16});
            },

            /**
             * Set presentation control settings on Flash movies. Used for skinning.
             *
             * Example CSS:
             * .YOURCONTAINER {
             *    background-color:#CCC; -> backgroundColor
             *    border-left-color:#000; -> foregroundColor
             *    color:#FFF; -> fontColor
             *    border-right-color:#FFF; -> seriesColor
             * }
             */
            setPresentation: function() {
                var module = this.module;
                var seriesColors = module.getCSSColor([module.container], "border-right-color");
                if (seriesColors) {
                    this.callBridgeMethod("setValue", "seriesColors", "["+seriesColors.replace("#", "0x")+"]");
                }

                var styleMap = [
                    {css: "border-left-color", flash: "foregroundColor"},
                    {css: "color", flash: "fontColor"},
                    {css: "background-color", flash: "backgroundColor"}
                ];
                for (var i = 0; i < styleMap.length; i++) {
                    var styleMapAttributes = styleMap[i];
                    var value = module.getCSSColor([module.container], styleMapAttributes.css);
                    if (value) {
                        this.callBridgeMethod("setValue", styleMapAttributes.flash, value.replace("#", "0x"));
                    }
                }
            },

            getBridgeProperty: function(name) {
                if (!this._isBridgeConnected)
                    return undefined;

                try {
                    return this.bridge.getProperty(name);
                } catch(e) {
                    this.module.logger.error("externalInterface/jabridge exception on getProperty('", name, "')", e);
                    return undefined;
                }
            },

            setBridgeProperty: function(name, value) {
                if (!this._isBridgeConnected)
                    return;

                try {
                    this.bridge.setProperty(name, value);
                } catch(e) {
                    this.module.logger.error("externalInterface/jabridge exception on setProperty('", name, "', '", value, "')", e);
                }
            },

            callBridgeMethod: function(name) {
                if (!this._isBridgeConnected)
                    return undefined;

                try {
                    return this.bridge.callMethod.apply(this.bridge, arguments);
                } catch(e) {
                    this.module.logger.error("externalInterface/jabridge exception on callMethod('", name, "')", e);
                    return undefined;
                }
            },

            addBridgeEventListener: function(name, listener) {
                if (!this._isBridgeConnected)
                    return;

                try {
                    return this.bridge.addEventListener(name, listener);
                } catch(e) {
                    this.module.logger.error("externalInterface/jabridge exception on addEventListener('", name, "')", e);
                }
            }

        };

        return c;
    })()



});
