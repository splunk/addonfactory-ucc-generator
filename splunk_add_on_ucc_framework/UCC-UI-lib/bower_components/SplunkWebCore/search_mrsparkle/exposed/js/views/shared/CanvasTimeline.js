define(function(require, exports, module) {

    var $ = require('jquery');
    var underscore = require('underscore');
    var resizable = require('jquery.ui.resizable');
    var Splunk = require('splunk');
    var SplunkI18N = require('splunk.i18n');
    var _ = SplunkI18N._;
    var ungettext = SplunkI18N.ungettext;
    var SplunkUtil = require('splunk.util');
    var sprintf = SplunkUtil.sprintf;
    var SplunkLogger = require('splunk.logger');
    var SplunkMessenger = require('splunk.messenger');
    var SplunkTimeRange = require('splunk.timerange');
    var Base = require('views/Base');
    var Popdown = require('views/shared/delegates/Popdown');
    var ChartingTimeline = require('splunk/charting/Timeline');

    var css = require('./CanvasTimeline.pcss');

    var _DEFAULT_PROPERTY_VALUES = {
        swfFile: "timeline.swf",
        width: "100%",
        height: "120px",
        enableResize: "true",
        maxBucketCount: "1000",
        minimized: "false",
        renderer: "auto",
        minimalMode: "true",
        minimalHeight: "55px"
    };

    var _PROPERTY_PREFIX = "display.prefs.timeline.";

    var Timeline = Base.extend({
        _CUSTOM_DATE_FORMATS: {
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

        _isInitialized: false,
        _selectedEarliestTime: NaN,
        _selectedLatestTime: NaN,
        _renderSID: null,
        _renderStatusBuckets: null,
        _renderScanCount: null,
        _renderIsDone: null,

        moduleId: module.id,

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.activate();

            this.container = this.$el;
            this.moduleType = "Timeline";

            this.logger = SplunkLogger.getLogger("Timeline.js");

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

            this.renderTemplate();
        },

        startListening: function() {
            this.listenTo(this.model.searchJob, "destroy error", this.render);
            this.listenTo(this.model.searchJob.entry.content, "change", this.render);
            this.listenTo(this, "selectionChanged", function(data){
                this.model.report.entry.content.set({
                    'display.events.timelineEarliestTime': !underscore.isNaN(data.earliestTime) ? data.earliestTime : "",
                    'display.events.timelineLatestTime': !underscore.isNaN(data.latestTime) ? data.latestTime : ""
                });
            });
        },

        activate: function(options) {
            if (this.active) {
                return Base.prototype.activate.apply(this, arguments);
            }

            Base.prototype.activate.apply(this, arguments);

            this.showTimeline("deactivate");

            return this;
        },

        deactivate: function(options) {
            if (!this.active) {
                return Base.prototype.deactivate.apply(this, arguments);
            }
            Base.prototype.deactivate.apply(this, arguments);

            this.hideTimeline("deactivate");

            return this;
        },

        renderTemplate: function() {
            var isMinimized = SplunkUtil.normalizeBoolean(this.getParam("minimized"));

            var context = {
                width: this.getParam("width"),
                height: this.getParam("height"),
                wrapperStyle: isMinimized ? "display:none;" : "",
                formatLabel: _("Format Timeline"),
                hiddenLabel: _("Hidden"),
                compactLabel: _("Compact"),
                fullLabel: _("Full"),
                linearLabel: _("Linear scale"),
                logLabel: _("Log scale"),
                zoomOutLabel: _("Zoom Out"),
                zoomInLabel: _("Zoom to Selection"),
                deselectLabel: _("Deselect")
            };

            this.container.html(underscore(this.template).template(context));
        },

        initTemplate: function() {
            this.zoomInLink = $("a.zoomIn",this.container).click(this.zoomIn.bind(this));
            this.zoomOutLink = $("a.zoomOut",this.container).click(this.zoomOut.bind(this));
            this.selectAllLink = $("a.selectAll",this.container).click(this.selectAll.bind(this));
            this.controlLinks = $(".controlLinks",this.container).click(this.controlsBackgroundClick.bind(this));

            this.children.popdown = new Popdown({el: this.$(".format-timeline"), attachDialogTo: 'body'});
            this.formatLinkHidden = $(".format-timeline-hidden a", this.container).click(this.minimizeFull.bind(this));
            this.formatLinkCompact = $(".format-timeline-compact a", this.container).click(this.maximizeCompact.bind(this));
            this.formatLinkFull = $(".format-timeline-full a", this.container).click(this.maximizeFull.bind(this));
            this.formatLinksScale = $(".format-timeline-scale", this.container);
            this.formatLinkLinear = $(".format-timeline-linear a", this.container).click(this.linScale.bind(this));
            this.formatLinkLog = $(".format-timeline-log a", this.container).click(this.logScale.bind(this));

            this.iconCheckView = $('<i class="icon-check"></i>');
            this.iconCheckScale = $('<i class="icon-check"></i>');

            // create message container
            $(".timelineContainer", this.container).append("<div class=\"messageContainer\"></div>");
            this._timeline = new Timeline.CanvasTimeline(this);

            if (SplunkUtil.normalizeBoolean(this.getParam("minimized")))
                this.minimizeFull(false);
            else if (SplunkUtil.normalizeBoolean(this.getParam("minimalMode")))
                this.maximizeCompact(false);
            else
                this.maximizeFull(false);

            this.linScale();

            this._isInitialized = true;

            this.render();
        },

        render: function() {
            if (!this._isInitialized) {
                // Hacky way to wait until we're added to the document, since views/Base has no facilities for DOM setup/teardown.
                // We must be added to the document in order for Flash to render correctly.
                if (!this._initTemplateTimeout)
                    this._initTemplateTimeout = setTimeout(this.initTemplate.bind(this), 0);
                return this;
            }

            var model = this.model.searchJob;
            if (!model)
                return this;

            var sid = model.id;
            var statusBuckets = model.entry.content.get("statusBuckets");
            var scanCount = model.entry.content.get("scanCount");
            var isDone = model.isDone();
            var isRealtime = model.isRealtime();

            var sidChanged = (sid !== this._renderSID);
            var statusBucketsChanged = (statusBuckets !== this._renderStatusBuckets);
            var scanCountChanged = (scanCount !== this._renderScanCount);
            var isDoneChanged = (isDone !== this._renderIsDone);

            this._renderSID = sid;
            this._renderStatusBuckets = statusBuckets;
            this._renderScanCount = scanCount;
            this._renderIsDone = isDone;

            if (sidChanged || statusBucketsChanged) {
                this.onContextChange();
            } else if (scanCountChanged || isDoneChanged || isRealtime) {
                this.onJobProgress();
            }

            return this;
        },

        remove: function() {
            if (this._initTemplateTimeout)
                clearTimeout(this._initTemplateTimeout);

            if (this._timeline) {
                this._timeline.dispose();
                this._timeline = null;
            }

            return Base.prototype.remove.apply(this, arguments);
        },

        // REMOVE THESE AFTER BASE CLASS METHODS UNCOMMENTED

        show: function(key) {
            // ensure key is a string
            key = (key != null) ? ("" + key) : "";

            // we're already showing if no hideKeys are stored
            var hideKeys = this._hideKeys;
            if (!hideKeys) {
                return this;
            }

            // delete the given key from hideKeys
            delete hideKeys[key];

            // don't actually show if there are more hideKeys
            for (key in hideKeys) {
                if (hideKeys.hasOwnProperty(key)) {
                    return this;
                }
            }

            // delete hideKeys store
            this._hideKeys = null;

            // show ourself before child views
            this.$el.show();

            // child views are recursively shown in the onShow method
            this.onShow();

            return this;
        },

        hide: function(key) {
            // ensure key is a string
            key = (key != null) ? ("" + key) : "";

            // we're already hidden if previous hideKeys are stored
            // store additional key in hideKeys
            var hideKeys = this._hideKeys;
            if (hideKeys) {
                hideKeys[key] = true;
                return this;
            }

            // create hideKeys store and store first key
            hideKeys = this._hideKeys = {};
            hideKeys[key] = true;

            // hide child views before ourself
            // child views are recursively hidden in the onHide method
            this.onHide();

            // hide ourself
            this.$el.hide();

            return this;
        },

        isShowing: function() {
            // we're showing if there is no hideKeys store
            return (this._hideKeys == null);
        },

        // END REMOVE

        onShow: function() {
            this.showTimeline("onHide");
            // UNCOMMENT AFTER BASE CLASS METHOD UNCOMMENTED
            //Base.prototype.onShow.call(this);
        },

        onHide: function() {
            // UNCOMMENT AFTER BASE CLASS METHOD UNCOMMENTED
            //Base.prototype.onHide.call(this);
            this.hideTimeline("onHide");
        },

        getParam: function(key) {
            var report = this.model.report;
            var value = report ? report.entry.content.get(_PROPERTY_PREFIX + key) : null;
            if (value == null)
                value = _DEFAULT_PROPERTY_VALUES[key];
            return (value != null) ? value : null;
        },

        setParam: function(key, value) {
            var report = this.model.report;
            if (report)
                report.entry.content.set(_PROPERTY_PREFIX + key, value);
        },

        update: function() {
            if (this._timeline)
                this.updateId = this._timeline.update();
        },

        minimizeFull: function(save) {
            this.minimize(save);

            this.iconCheckView.prependTo(this.formatLinkHidden);
        },

        maximizeCompact: function(save) {
            this.maximize(save);

            if (save != false)
                this.setParam("minimalMode", true);

            $(".timelineContainer", this.container).css("height", this.getParam("minimalHeight"));
            $(".ui-resizable-handle", this.container).css("visibility", "hidden");

            this.iconCheckView.prependTo(this.formatLinkCompact);

            if (this._timeline)
                this._timeline.setMinimalMode(true);
        },

        maximizeFull: function(save) {
            this.maximize(save);

            if (save != false)
                this.setParam("minimalMode", false);

            $(".timelineContainer", this.container).css("height", this.getParam("height"));
            $(".ui-resizable-handle", this.container).css("visibility", "");

            this.iconCheckView.prependTo(this.formatLinkFull);

            if (this._timeline)
                this._timeline.setMinimalMode(false);
        },

        minimize: function(save) {
            if (save != false) {
                this.setParam("minimized", true);
                if (save.preventDefault && (typeof(save.preventDefault) === "function")) {
                    save.preventDefault();
                }
            }

            this.hideTimeline("minimize");
            $(".timelineContainer", this.container).hide();
            $(".controlLinks", this.container).hide();
            $(this.container).addClass("minimized");
            this.formatLinksScale.hide();
        },

        maximize: function(save) {
            if (save != false) {
                this.setParam("minimized", false);
                if (save.preventDefault && (typeof(save.preventDefault) === "function")) {
                    save.preventDefault();
                }
            }

            this.formatLinksScale.show();
            $(this.container).removeClass("minimized");
            $(".controlLinks", this.container).show();
            $(".timelineContainer", this.container).show();
            this.showTimeline("minimize");
        },

        zoomIn: function(evt) {
            if (this.zoomInLink.hasClass('disabled')) return false;

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
                    var messenger = SplunkMessenger.System.getInstance();
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
            if (evt.preventDefault) {
                evt.preventDefault();
            }
        },

        zoomOut: function(evt) {
            if (this.zoomOutLink.hasClass('disabled')) return false;

            var timelineRange = this.getTimelineRangeFromUTC();
            if (timelineRange) {
                this._passTimeRangeToParent(timelineRange.zoomOut());
            } else {
                this.logger.error(this.moduleType, " could not zoom out cause we had an undefined timelineRange");
            }
            evt.preventDefault();
        },

        selectAll: function(evt) {
            if (this.selectAllLink.hasClass('disabled'))
                return false;

            $(".controlLinks", this.container).addClass("noSelection");

            this.clearSelectionRange();

            if (evt) {
                evt.preventDefault();
            }
        },
        controlsBackgroundClick: function(evt) {
            if (evt.currentTarget === evt.target) {
                this.selectAll(evt);
            }
        },

        logScale: function(evt) {
            this.iconCheckScale.prependTo(this.formatLinkLog);

            if (this._timeline) {
                this._timeline.setScaleY("log");
            }

            if (evt) {
                evt.preventDefault();
            }
        },

        linScale: function(evt) {
            this.iconCheckScale.prependTo(this.formatLinkLinear);

            if (this._timeline) {
                this._timeline.setScaleY("linear");
            }

            if (evt) {
                evt.preventDefault();
            }
        },

        showDataControls: function(show) {
            if (show) {
                $(".controlLinks", this.container).removeClass("noData");
                this.zoomOutLink.removeClass("disabled");
            } else {
                $(".controlLinks", this.container).addClass("noData");
                this.zoomOutLink.addClass("disabled");
            }
        },

        /**
         * Current version of jQuery ui is buggy. Additional logic to make things work consistently.
         */
        enableResizable: function() {
            $("div.timelineContainer", this.container).resizable({autoHide: true, handles: "s", stop: this.onResizeStop.bind(this)});
            $("div.timelineContainer").mouseup(  // workaround until jquery ui is updated
                function(event) {
                    $(this).width("100%");
                }
            );
            if (SplunkUtil.normalizeBoolean(this.getParam("minimalMode")))
                $(".ui-resizable-handle", this.container).css("visibility", "hidden");
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
                color = SplunkUtil.normalizeColor(computedColor);
                if (color) {
                    return color;
                }
            }
            return null;
        },

        /**
         * The fact that the upstream TimeRange may be a relative range complicates
         * various cases like zoom in and zoom out.  In these cases we need to work
         * with an absolute equivalent of that relative range.
         * To avoid this issue we always make these calculations from an absolute range
         * that we create from the timelineData itself.
         */
        getTimelineRangeFromUTC: function() {
            if (this._timeline) {
                try {
                    var earliestEpochTime = this._timeline.getViewMinimum();
                    var latestEpochTime   = this._timeline.getViewMaximum();

                    if (SplunkUtil.isInt(Math.floor(earliestEpochTime)) && SplunkUtil.isInt(Math.floor(latestEpochTime))) {
                        return new SplunkTimeRange(earliestEpochTime, latestEpochTime);
                    } else {
                        this.logger.error("undefined values " + earliestEpochTime + ", " + latestEpochTime);
                    }
                } catch (e) {
                    this.logger.error(this.moduleType, " exception getting earliest and latest selected times - " + e);
                }
            }
            return new SplunkTimeRange();
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
                return sprintf(ungettext("%s millisecond per column", "%s milliseconds per column", value), value);
            } else if (value == 1) {
                switch (unit) {
                    case "year":
                        return _("1 year per column");
                    case "month":
                        return _("1 month per column");
                    case "day":
                        return _("1 day per column");
                    case "hour":
                        return _("1 hour per column");
                    case "minute":
                        return _("1 minute per column");
                    case "second":
                        return _("1 second per column");
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
                return new SplunkTimeRange();
            }
            var earliestBucket = selectedBuckets[0];
            var latestBucket = selectedBuckets[numberOfBuckets - 1];
            var range = new SplunkTimeRange(earliestBucket["earliestTime"], latestBucket["latestTime"]);
            range.setAsSubRangeOfJob(!this.isEntireRangeSelected);

            return range;
        },

        setSelectionRange: function(minimum, maximum, dispatchEvent) {
            if (isNaN(minimum) || isNaN(maximum)) {
                this.clearSelectionRange(dispatchEvent);
                return;
            }

            this.isEntireRangeSelected = false;

            if (this.selectAllLink) {
                this.selectAllLink.removeClass("disabled");
            }

            if (this.zoomInLink) {
                this.zoomInLink.removeClass("disabled");
            }

            if (this._timeline) {
                this._timeline.setSelectionMinimum(minimum);
                this._timeline.setSelectionMaximum(maximum);
            }

            if ((this._selectedEarliestTime !== minimum) || (this._selectedLatestTime !== maximum)) {
                this._selectedEarliestTime = minimum;
                this._selectedLatestTime = maximum;
                if (dispatchEvent !== false)
                    this.trigger("selectionChanged", { earliestTime: minimum, latestTime: maximum });
            }
        },

        clearSelectionRange: function(dispatchEvent) {
            this.isEntireRangeSelected = true;

            if (this.selectAllLink) {
                this.selectAllLink.addClass("disabled");
            }

            if (this.zoomInLink) {
                this.zoomInLink.addClass("disabled");
            }

            if (this._timeline) {
                this._timeline.setSelectionMinimum(NaN);
                this._timeline.setSelectionMaximum(NaN);
            }

            if (!isNaN(this._selectedEarliestTime) || !isNaN(this._selectedLatestTime)) {
                this._selectedEarliestTime = NaN;
                this._selectedLatestTime = NaN;
                if (dispatchEvent !== false)
                    this.trigger("selectionChanged", { earliestTime: NaN, latestTime: NaN });
            }
        },

        resetUI: function() {
            if (this._timeline)
                this._timeline.setJobID("");
            this.update();
            this.showDataControls(false);
            this.hideStatusMessage();
        },

        hideTimeline: function(key) {
            key = (key != null) ? String(key) : "";

            if (this._timelineHideKeys) {
                this._timelineHideKeys[key] = true;
                return false;
            }

            this._timelineHideKeys = {};
            this._timelineHideKeys[key] = true;

            if (this._timeline)
                this._timeline.hide();

            return true;
        },

        showTimeline: function(key) {
            if (!this._timelineHideKeys)
                return false;

            key = (key != null) ? String(key) : "";

            delete this._timelineHideKeys[key];
            for (key in this._timelineHideKeys) {
                if (this._timelineHideKeys.hasOwnProperty(key))
                    return false;
            }

            this._timelineHideKeys = null;

            if (this._timeline)
                this._timeline.show();

            return true;
        },

        isTimelineShowing: function() {
            return !this._timelineHideKeys;
        },

        /**
         * display a search job status message
         */
        showStatusMessage: function(msg, sid) {
            var str = "";
            str += "<p class=\"resultStatusMessage empty_results\">";
            str += msg;
            if (sid) {
                str += " <span class=\"resultStatusHelp\">";
                str += "<a href=\"#\" onclick=\"Splunk.window.openJobInspector('" + sid.replace("'", "") + "');return false;\" class=\"resultStatusHelpLink\">";
                str += _("Inspect ...");
                str += "</a>";
                str += "</span>";
            }
            str += "</p>";

            this.hideTimeline("showStatusMessage");
            $(".messageContainer", this.container).html(str).show();
        },

        hideStatusMessage: function() {
            $(".messageContainer", this.container).hide().html("");
            this.showTimeline("showStatusMessage");
        },

        onJobProgress: function() {
            //var model = this.model.searchJob;
            //if (model && model.get("isDone")) {
            //  // Notifying PageStatus that a render is beginning.
            //  if (!this.renderMonitor) {
            //      this.renderMonitor = Splunk.Globals["PageStatus"].register(this.moduleType + " - rendering final data - " + this.container.attr("id"));
            //  }
            //}
            this.update();
        },

        /**
         * Like other modules, when any new context comes down from above, it
         * clears any selection state it may have had.
         * and notifies the timeline to display the data from the new sid.
         */
        onContextChange: function() {
            var model = this.model.searchJob;
            var sid = model ? model.id : null;

            // from this point, until the timelineDataAvailable event is fired, we must
            // disable or ignore all interaction.
            this.showDataControls(false);

            // when getting a new context, reset the selection range.
            this.clearSelectionRange();

            if (this._timeline) {
                // select all if SID has changed
                if (sid != this._prevSID) {
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
                this._timeline.setBucketCount(parseInt(this.getParam("maxBucketCount"), 10));
            }

            // show or hide module if insufficient status buckets
            if (sid && (model.entry.content.get("statusBuckets") < 1)) {
                this.hideTimeline("statusBuckets");
                this.hide("views-shared-CanvasTimeline-statusBuckets");
            } else {
                this.show("views-shared-CanvasTimeline-statusBuckets");
                this.showTimeline("statusBuckets");
            }

            this.update();
        },

        /**
         * Fired when the timeline tells us it has finished rendering a new copy of
         * the timelineData.  Note that this does not mean the job is done.
         */
        onDataUpdated: function(event) {
            var model = this.model.searchJob;
            if (!model)
                return;

            // screen out previews and (for the timeline) async updates onJobProgress
            if (!model.isNew() && model.isDone()) {
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

            if (!model.isNew()) {
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
            var earliestTime = event.selectionMinimum;
            var latestTime = event.selectionMaximum;
            if (isNaN(earliestTime) || isNaN(latestTime) || (earliestTime === latestTime)) {
                this.selectAll();
                return;
            }

            this.isEntireRangeSelected = false;
            this.selectAllLink.removeClass("disabled");
            this.zoomInLink.removeClass("disabled");

            if ((earliestTime !== this._selectedEarliestTime) || (latestTime !== this._selectedLatestTime)) {
                this._selectedEarliestTime = earliestTime;
                this._selectedLatestTime = latestTime;
                this.trigger("selectionChanged", { earliestTime: earliestTime, latestTime: latestTime });
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
            if (!this.model)
                return;

            var properties = {
                "dispatch.earliest_time": range.getEarliestTimeTerms(),
                "dispatch.latest_time": range.getLatestTimeTerms(),
                "display.events.timelineEarliestTime": "",
                "display.events.timelineLatestTime": ""
            };

            this.model.report.entry.content.set(properties);
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
            var range = new SplunkTimeRange(earliestTime, latestTime);
            var tooltip = _(sprintf(
                ungettext(
                    _("%(eventCount)s event %(timeRangeString)s"),
                    _("%(eventCount)s events %(timeRangeString)s"),
                    eventCount
                ),
                { eventCount: SplunkI18N.format_decimal(eventCount), timeRangeString: range.toConciseString() }
            ));
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
                return SplunkI18N.format_scientific(num, "##0E0");
            return SplunkI18N.format_decimal(num);
        },

        formatDate: function(time, timeZoneOffset, dateFormat) {
            if (dateFormat) {
                var customFormat = this._CUSTOM_DATE_FORMATS[dateFormat];
                if (customFormat) {
                    var localeName = locale_name();
                    if (customFormat[localeName])
                        dateFormat = customFormat[localeName];
                    else if (locale_uses_day_before_month() && customFormat["day_before_month"])
                        dateFormat = customFormat["day_before_month"];
                }
            }
            return SplunkI18N.format_date(this.epochToDateTime(time, timeZoneOffset), dateFormat);
        },

        formatTime: function(time, timeZoneOffset, timeFormat) {
            if (timeFormat == "full")
                return SplunkI18N.format_time_microseconds(this.epochToDateTime(time, timeZoneOffset), timeFormat);
            return SplunkI18N.format_time(this.epochToDateTime(time, timeZoneOffset), timeFormat);
        },

        formatDateTime: function(time, timeZoneOffset, dateFormat, timeFormat) {
            if (timeFormat == "full")
                return SplunkI18N.format_datetime_microseconds(this.epochToDateTime(time, timeZoneOffset), dateFormat, timeFormat);
            return SplunkI18N.format_datetime(this.epochToDateTime(time, timeZoneOffset), dateFormat, timeFormat);
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

        template: '\
            <div class="format-timeline dropdown pull-left">\
                <a href="#" class="dropdown-toggle btn-pill"><%- formatLabel %><span class="caret"></span></a>\
                <div class="dropdown-menu dropdown-menu-selectable dropdown-menu-narrow" style="top: 26px; margin-left: -86px;">\
                    <div class="arrow" style="margin-left: -10px;"></div>\
                    <ul class="format-timeline-view">\
                        <li class="format-timeline-hidden"><a href="#"><%- hiddenLabel %></a></li>\
                        <li class="format-timeline-compact"><a href="#"><%- compactLabel %></a></li>\
                        <li class="format-timeline-full"><a href="#"><%- fullLabel %></a></li>\
                    </ul>\
                    <ul class="format-timeline-scale">\
                        <li class="format-timeline-linear"><a href="#"><%- linearLabel %></a></li>\
                        <li class="format-timeline-log"><a href="#"><%- logLabel %></a></li>\
                    </ul>\
                </div>\
            </div>\
            <div class="controlLinks noData noSelection">\
                <a href="#" class="zoomOut disabled btn-pill"><span class="icon-minus"></span> <%- zoomOutLabel %></a>\
                <a href="#" class="zoomIn disabled btn-pill"><span class="icon-plus"></span> <%- zoomInLabel %></a>\
                <a href="#" class="selectAll disabled btn-pill"><span class="icon-x"></span> <%- deselectLabel %></a>\
                <span class="bucketSize pull-right"></span>\
            </div>\
            <div class="timelineContainer" style="width:<%- width %>; height:<%- height %>; <%- wrapperStyle %>"></div>\
        '

    }, {
        DEFAULT_PROPERTY_VALUES: _DEFAULT_PROPERTY_VALUES
    });

    /**
     * Timeline interface classes appear below.
     *
     * Each interface must include the following methods:
     *
     *   initialize(module:Module) : void
     *   dispose() : void
     *   update() : int
     *   setJobID(value:String) : void
     *   setBucketCount(value:Number) : void
     *   setMinimalMode(value:Boolean) : void
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

    Timeline.CanvasTimeline = (function() {
        var c = function(module) {
            this.initialize(module);
        };
        c.prototype = {

            initialize: function(module) {
                this.module = module;

                this.onPrintStart = this.onPrintStart.bind(this);
                module.onDataUpdated = module.onDataUpdated.bind(module);
                module.onSelectionChanged = module.onSelectionChanged.bind(module);
                module.zoomIn = module.zoomIn.bind(module);

                $(document).bind("PrintStart", this.onPrintStart);

                this._timeline = new ChartingTimeline(SplunkUtil.make_url("/splunkd/__raw/services"), "");
                this._timeline.externalInterface.formatTooltip = module.formatTooltip.bind(module);
                this._timeline.externalInterface.formatSimpleString = module.formatSimpleString.bind(module);
                this._timeline.externalInterface.formatNumericString = module.formatNumericString.bind(module);
                this._timeline.externalInterface.formatNumber = module.formatNumber.bind(module);
                this._timeline.externalInterface.formatDate = module.formatDate.bind(module);
                this._timeline.externalInterface.formatTime = module.formatTime.bind(module);
                this._timeline.externalInterface.formatDateTime = module.formatDateTime.bind(module);
                this._timeline.set("timeZone", SplunkUtil.getConfigValue("SERVER_ZONEINFO"));
                this._timeline.set("enableChartClick", true);
                this._timeline.on("updated", module.onDataUpdated);
                this._timeline.on("selectionChanged", module.onSelectionChanged);
                this._timeline.on("chartDoubleClicked", module.zoomIn);

                if (module.model.serverInfo && module.model.serverInfo.isLite())
                    this._timeline.set("seriesColor", 0xF58220);

                //var foregroundColor = module.getCSSColor([module.container], "border-left-color");
                //if (foregroundColor)
                //  this._timeline.set("foregroundColor", Number(foregroundColor.replace("#", "0x")));

                //var seriesColor = module.getCSSColor([module.container], "border-right-color");
                //if (seriesColor)
                //  this._timeline.set("seriesColor", Number(seriesColor.replace("#", "0x")));

                if (SplunkUtil.normalizeBoolean(module.getParam("minimalMode")))
                    this._timeline.set("minimalMode", true);

                if (module.isTimelineShowing())
                    this._timeline.appendTo($(".timelineContainer", module.container));

                if (SplunkUtil.normalizeBoolean(module.getParam("enableResize")))
                    module.enableResizable();

                module.onContextChange();
                module.update();
            },

            dispose: function() {
                if (this._timeline) {
                    this._timeline.off("updated", this.module.onDataUpdated);
                    this._timeline.off("selectionChanged", this.module.onSelectionChanged);
                    this._timeline.off("chartDoubleClicked", this.module.zoomIn);
                    this._timeline.dispose();
                    this._timeline = null;
                }

                $(document).unbind("PrintStart", this.onPrintStart);
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
                this._timeline.set("bucketCount", value);
            },

            setMinimalMode: function(value) {
                if (!this._timeline)
                    return;
                this._timeline.set("minimalMode", value);
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
                this._timeline.remove();
            },

            show: function() {
                if (!this._timeline)
                    return;
                this._timeline.appendTo($(".timelineContainer", module.container));
                this._timeline.updateSize();
                this._timeline.validate();
                // ensure resize handle is always at the bottom
                $(".ui-resizable-handle", module.container).appendTo($(".timelineContainer", module.container));
            },

            onPrintStart: function() {
                if (!this._timeline)
                    return;
                this._timeline.updateSize();
                this._timeline.validate();
            }

        };

        return c;
    })();

    return Timeline;

});
