Splunk.Module.JSChart = $.klass(Splunk.Module.DispatchingModule, {

    LEADING_UNDERSCORE_PREFIX: "VALUE_",
    DRILLDOWN_VISIBILITY_KEY : "JSChartInteractionValidity",

    CATEGORY_LABEL_CUTOFF: 80,
    DEFAULT_MAX_SERIES: 50,

    // if we have an SVG renderer use a delay of 0 for display reflow events, otherwise 25 ms
    DISPLAY_REFLOW_DELAY: (!!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect) ? 0 : 25,

    MANUAL_RESIZE_EVENT: 'ChartManualResize', // fired to indicate a chart has been manually resized
    DISPLAY_REFLOW_EVENT: 'Splunk.Events.REDRAW', // fired by higher-level objects when a display reflows
    PANEL_DROP_EVENT: 'Splunk.Events.PANEL_DROP', // fired by the drag-and-drop controller when a panel is dropped

    DEFAULT_MAX_ROWS_FOR_TOP: 20,
    TOP_RARE_FIELD_HIDE_LIST: ['percent'],

    initialize: function($super, container) {
        $super(container);

        this._selection = null;
        this._enableDrilldown = false;
        this._isVisible = true;
        this.renderMonitor = false;
        this.updateId = -1;
        this.sid = 0;
        this.resultsCount = 500;
        this.pp = false;
        this.offset = false;
        this.properties = {};
        this.redrawNeeded = false;
        this.legendFieldList = [];
        this.legendFieldMap = {};
        this.requestID = 0;
        this.chart = false;
        this.chartingLibLoaded = false;
        this.hasPendingDraw = false;

        this.renderSuccessDfd = $.Deferred();

        if(Splunk.util.getConfigValue('JSCHART_TEST_MODE', false) === true) {
            this.properties['testMode'] = true;
        }

        // if set to 'foo', the drilldown keys coming out of getModifiedContext() will look like "foo.name", "foo.value"
        this.drilldownPrefix = this.getParam("drilldownPrefix");
        this.moduleId = $(container).attr('id');

        // create a div inside the module element that will serve as a rendering target for the chart
        // otherwise it will clobber the contents of the module element every time it draws a chart
        this.$moduleElement = $('.JSChartContainer', $(container));
        this.chartContainer = ($('<div class="highcharts-placeholder"></div>')
                                .css({
                                    height: '100%',
                                    width: '100%',
                                    overflow: 'hidden'
                                })
                                .appendTo(this.$moduleElement))[0];

        // dynamically load in the HighCharts source and js_charting adapter files
        var that = this;
        var dependencies = [
            Splunk.util.make_url('/static/build/jscharting/index.js')
        ];
        // if we are the first JSChart module initialized, this next line will fetch the charting depencies
        // otherwise it will be a no-op for script.js
        $script(dependencies, 'jschart_dependencies');
        // either way, bind to the on-ready event for the dependencies
        $script.ready('jschart_dependencies', function() {
            // the charting dependencies are now loaded, if there was a call to draw in the interim, execute that draw now
            that.chartingLibLoaded = true;
            if(that.hasPendingDraw) {
                that.draw(that.updateId);
                that.hasPendingDraw = false;
            }
        });

        if(Splunk.util.normalizeBoolean(this.getParam("enableResize"))) {
            this.enableResizable();
        }

        Splunk.Legend.register(this.moduleId);
        this.legendManager = {
            setLabels: function(labels) {
                Splunk.Legend.setLabels(this.moduleId, labels);
            }.bind(this),

            getLabelIndex: function(label) {
                return Splunk.Legend.getLabelIndex(label);
            },

            numLabels: function() {
                return Splunk.Legend.numLabels();
            }
        };
        Splunk.Legend.addEventListener("labelIndexMapChanged", function() {
            if(this.chart && this.chart.requiresExternalColorPalette()) {
                this.applyColorsAndDraw(this.legendFieldList, this.pendingCallback);
            }
        }.bind(this));

        this.setProperty("enableChartClick", this._enableDrilldown);
        this.setProperty("enableLegendClick", this._enableDrilldown);

        this.logger = Splunk.Logger.getLogger("js_chart.js");

        $(document).bind("PrintStart", this.onPrintStart.bind(this));
        $(document).bind("PrintEnd", this.onPrintEnd.bind(this));

        $(document).bind(this.DISPLAY_REFLOW_EVENT, function() {
            setTimeout(function() {
                this.onDisplayReflow();
            }.bind(this), this.DISPLAY_REFLOW_DELAY);
        }.bind(this));
        // call onDisplayReflow here to handle the case where the page loads in a 'reflowed' configuration
        // specifically this is a work-around for the case where a dashboard is soft-refreshing in Edit mode from the viz editor
        this.onDisplayReflow();

        $(document).bind(this.PANEL_DROP_EVENT, function(event, data) {
            // when a global panel drop event is fired, check to see if it was our container that was dropped
            // in which case fire the internal onPanelDrop method
            if($.contains(data.droppedElement, this.container[0])) {
                this.onPanelDrop();
            }
        }.bind(this));

        this.sniffCssStyles();
    },

    onLoadStatusChange: function($super,statusInt) {
        $super(statusInt);
        if (statusInt == Splunk.util.moduleLoadStates.WAITING_FOR_HIERARCHY) {
            this.hideDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);
        }
    },

    onPrintStart: function() {
        this.resize();
    },

    onPrintEnd: function() {
        this.resize();
    },

    /**
     * We assume that JSChart always require transformed results
     * see comments on this function in DispatchingModule.js for more details.
     */
    requiresTransformedResults: function() {
        return true;
    },

    /**
     * Current version of jQuery ui is buggy. Additional logic to make things work consistently.
     */

    enableResizable: function(){
        if (!($.browser.safari && $.browser.version < "526")) { //disable resizing for safari 3 and below only
            this.$moduleElement.resizable({
                autoHide: true,
                helper: "ui-resizable-helper",
                handles: "s",
                stop: this.onResizeStop.bind(this)
            });
            this.$moduleElement.mouseup( //workaround until jquery ui is updated
                function(event){
                    $(this).width('100%');
                }
            );
        }
    },

    /**
     * Handle a resize stop event from the Resizable jQuery extension. See http://docs.jquery.com/UI/Resizable
     * Saves the new height with a 'px' suffix to viewstate.conf.
     *
     * @param {Object} event Original browser event.
     * @param {Object} ui Prepared ui object having the following attributes: http://docs.jquery.com/UI/Resizable#overview
     */

    onResizeStop: function(event, ui) {
        $(this.chartContainer).height(ui.size.height);
        this.resize();
        $(event.target).width('100%');
        // in case the chart is part of a dashboard, we fire this custom event here to nudge the panels into alignment
        $(document).trigger(this.MANUAL_RESIZE_EVENT);
        this.setParam('height', ui.size.height + "px");
    },

    onDisplayReflow: function() {
        // reflow can involve modification of parent element's max-height, make sure to respect it
        var newChartHeight,
            parentMaxHeight = this.container.parent().css('max-height');
        if(parentMaxHeight === 'none') {
            // the parent has no max height, so revert to the cached previous height if it exists
            // otherwise ignore the reflow event
            if(!this.previousChartHeight) {
                return;
            }
            newChartHeight = this.previousChartHeight;
            this.previousChartHeight = undefined;
        }
        else {
            // the parent now has a max height, so cache the current height (if we haven't already) and set our height to match the parent
            if(!this.previousChartHeight) {
                this.previousChartHeight = $(this.chartContainer).height();
            }
            newChartHeight = parentMaxHeight;
        }
        this.container.css({'max-height': parentMaxHeight});
        $(this.chartContainer).height(newChartHeight);
        this.resize();

        // XXX this is a pretty big hack...
        // for reasons not understood, some reflow events (drag-and-drop moves) will cause the chart's hover interactions to stop working
        // the chart needs a "nudge" in the form of an artificial click event fired on mouse over
        if(this.chart && this.chart.hcChart) {
            var self = this;
            $(this.chartContainer).bind('mouseover.postReflowNudge', function() {
                $(self.chart.hcChart.container).focus().trigger('click');
                $(self).unbind('.postReflowNudge');
            });
        }
    },

    resetUI: function() {
        this.hideStatusMessage();
        this.hideInlineMessage();
        this.destroyChart();
    },

    onPanelDrop: function() {
        // for the VML renderer have to redraw the dropped chart or it will lose its colors
        // accomplish this by calling pushDataToChart, which automatically redraws the chart with the most recent data
        if(this.chart && $.browser.msie && $.browser.version in {"6.0": true, "7.0": true, "8.0": true}) {
            this.updateId++;
            this.pushDataToChart(this.updateId);
        }
    },

    /**
     * The only reason you'd have a child of a JSChart is if you wanted to give it
     * various children that represent drilldown configurations.
     * Therefore if we have children, we automatically turn on the highlighting cues.
     */
    addChild: function($super, child) {
        this._enableDrilldown = true;
        this.setProperty("enableChartClick", true);
        // NOTE THAT WE MAY LATER DISABLE THIS IN chart='pie', because the special-casing of legend
        // items there breaks our model.
        this.setProperty("enableLegendClick", true);
        return $super(child);
    },

    getResultParams: function($super) {
        var params = $super();
        var context = this.getContext();

        if (!this.sid) {
            this.logger.error(this.moduleType, "Assertion Failed. getResultParams was called, but searchId is missing from my job.");
        }

        params.sid = this.sid;
        params.count = this.resultsCount;
        params.showOffset = 1;
        params.segmentation = 'raw';
        params.output_mode = 'json_cols';
        if(this.pp) {
            params.search = this.pp;
        }
        if(this.offset) {
            params.offset = this.offset;
        }

        return params;
    },

    getResultURL: function(params) {
        var context = this.getContext();
        var search  = context.get("search");

        var uri = Splunk.util.make_url('/splunkd/__raw/search/jobs/', this.sid,
                        (search.job.isDone()) ? '/results' : '/results_preview');
        uri += '?' + Splunk.util.propToQueryString(params);
        return uri;
    },

    getResultsErrorHandler: function($super, xhr, textStatus, errorThrown) {
        $super(xhr, textStatus, errorThrown);
        // SPL-54975, this handler will also be triggered if the request is aborted,
        // we don't want to show the No Data message in that case
        if(textStatus !== 'abort') {
            this.showStatusMessage('results', 'nodata', this.sid);
        }
    },

    renderResults: function(response) {
        var context;
        this.updateId++;
        if(response===""){
            // may be a 204 (no content) from server
            // do not process further
            return;
        }
        if(response && response.columns) {
            if(this.requestID != this.properties['jobID']) {
                this.destroyChart();
                this.requestID = this.properties['jobID'];
            }
            this.response = response;
            // check the number of series, if it is larger than the "maxSeries" parameter,
            // truncate and set a flag to indicate that an inline message should be shown
            if(this.response.columns.length > this.DEFAULT_MAX_SERIES) {
                this.response.columns = response.columns.slice(0, this.DEFAULT_MAX_SERIES);
                this.response.fields = response.fields.slice(0, this.DEFAULT_MAX_SERIES);
                this.response.numSeriesTruncated = true;
            }
            // check for a top/rare search and respect the "maxRowsForTop" parameter if it is set (or use the module default)
            // this truncation takes precedence over all others since this is a parameter that should be part of the getResults URL
            // also suppress the "percent" field for top/rare
            // don't do this for pie charts
            if(this.resultsAreTopOrRare(this.response) && this.properties['chart'] !== 'pie') {
                var maxRowsForTop = parseInt(this._params["maxRowsForTop"], 10) || this.DEFAULT_MAX_ROWS_FOR_TOP;
                this.response = this.sliceResultsBySeriesLength(this.response, maxRowsForTop);
                this.setProperty("fieldHideList", this.TOP_RARE_FIELD_HIDE_LIST);
                this.setProperty("axisLabelsY.integerUnits", 'true');
            }
            else {
                context = this.getContext();
                var integerUnits = context.get('charting.axisLabelsY.integerUnits') || context.get('charting.secondaryAxisLabels.integerUnits');
                this.setProperty("fieldHideList", null);
                this.setProperty("axisLabelsY.integerUnits", integerUnits);
            }
        }
        // even if there is no data, we let the instruction to draw trickle down
        // and assume the chart will do the right thing.

        context = this.getContext();
        var search = context.get("search");
        if (response.columns.length > 0 || search.getTimeRange().isRealTime()) {
        if(!this.chart || this.redrawNeeded) {
            this.draw(this.updateId);
        }
        else {
            this.pushDataToChart(this.updateId);
        }
        }
        else {
            var sid = context.get('charting.data.jobID') || search.job.getSearchId();
            if(search.job.isDone()) {
                this.showStatusMessage('results', 'nodata', sid);
            }
            else {
                this.showStatusMessage('results', 'waiting', sid);
            }
        }
    },

    // as a work-around we are testing for the presence of the _tc field for indication of a "top" or "rare" search
    resultsAreTopOrRare: function(response) {
        for(var i = 0; i < response.fields.length; i++) {
            if(response.fields[i] === "_tc") {
                return true;
            }
        }
        return false;
    },

    // creates a new results object with all series truncated to the number given
    sliceResultsBySeriesLength: function(response, howMany) {
        var sliced = $.extend(true, {}, response);
        for(var i = 0; i < response.columns.length; i++) {
            sliced.columns[i] = response.columns[i].slice(0, howMany);
        }
        return sliced;
    },

    onContextChange: function() {
        $('.messageContainer', this.container).hide().html('');
        this.hideDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);
        this._selection = null;

        var context = this.getContext();
        var search  = context.get("search");
        var sid = context.get('charting.data.jobID') || search.job.getSearchId();

        this.extractPropertiesFromContext(context, search, sid);

        // initially the value of the shouldRedraw flag depends on whether there were any results to draw in the first place,
        // later we will force it to false if a new search has been kicked off
        var resultCount = search.job.getResultCount();
        var searchIsRealTime = search.getTimeRange().isRealTime();

        var shouldRedraw = (resultCount > 0);
        if(this.sid != sid) {
            if(this.sid != 0) {
                this.destroyChart();
                this.response = false;
            }
            this.sid = sid;
            // if the search has changed, there is no point in redrawing the chart with the existing data
            shouldRedraw = false;
        }

        // if we have something to display, fetch new results
        if(resultCount > 0 || searchIsRealTime || this.pp) {
            this.getResults();
        }
        // otherwise redraw if we have results and a new search has not been kicked off,
        // if a new search has been kicked off, do nothing and wait for onJobProgress
        else if(shouldRedraw) {
            this.updateId++;
            // timing issue here, have to wait for the history manager to modify the URL
            // because HighCharts uses it as a unique identifier
            setTimeout(function() {
                this.redrawIfNeeded(this.updateId);
            }.bind(this), 0);
        }
    },

    extractPropertiesFromContext: function(context, search, sid) {
        if(context.get('charting.data.offset')) {
            var offset = parseInt(context.get('charting.data.offset'), 10);
            if(!isNaN(offset)) {
                this.offset = offset;
            }
        }

        // #1 - special case for top/rare, where we tell the charting system to only render the top N rows.
        if (this._params["maxRowsForTop"] && isTopOrRare && (propertyManagerHash["chart"] != "pie")) {
            this.setProperty("resultsCount", this._params["maxRowsForTop"]);
            this.resultsCount = this._params["maxRowsForTop"];
        } else {
            this.setProperty("resultsCount", this.getParam('maxResultCount'));
            this.resultsCount = this.getParam('maxResultCount');
        }

        if(context.get('charting.data.count')) {
            var count = parseInt(context.get('charting.data.count'), 10);
            if(!isNaN(count)) {
                this.resultsCount = count;
            }
        }

        // This handles the case where the sid has high byte chars in it.
        // It should probably be removed when Gatt has implemented encoding in his Flash lib.
        if (sid != null) {
            this.setProperty("jobID", encodeURIComponent(encodeURIComponent(sid)));
        }
        else {
            this.setProperty("jobID", sid);
        }

        // Handle post process
        var pp = search.getPostProcess();
        if (pp) {
            this.pp = pp;
        }
        else {
            this.pp = false;
        }

        // if the job is already done there will be no progress events, and right here the jobId assignment
        // will trigger the final render.
        // In order for PageStatus to be notified of these renders, we have to set up a monitor here.
        if (search.job.isDone()) {
            // Notifying PageStatus that a render is beginning.
            if (!this.renderMonitor) {
                this.renderMonitor = Splunk.Globals['PageStatus'].register(this.moduleType + ' - rendering final data - ' + this.container.attr('id'));
            }
            // also need to put up the message if we're done AND there's no data.
            // the check in onJobDone isnt sufficient cause chart formatting changes and the like
            // will push a new context with the same dispatched job.
            if (search.job.getResultCount() == 0 && !pp) {
                this.showStatusMessage('results', 'nodata', sid);
            } else {
                this.hideStatusMessage();
            }
        }

        var propertyManagerHash = context.getAll("charting");

        // TEMPORARY -- the charting.swf special cases the handling of the legend in pie.
        //              legend items there are basically the same as the data values,
        //              and are not showing a split-by field.
        //              However it does it such that when the legend click comes,
        //              we've lost the information of the field-name so i cannot special case it here.
        // For now I've just disabled legend clicking.
        this.setProperty("enableLegendClick", (propertyManagerHash["chart"] != "pie"));


        // if this is a scatter chart we set some other values that make for more sensible defaults.
        // and that will 98% of the time make life better.
        // TODO - this is a possible candidate to be pulled into a generic pluggable validation/normalization mechanism in Context.

        var plotIntention = search.getIntentionReference("plot");
        var isTopOrRare = (plotIntention && plotIntention["arg"]["mode"] in {"top":1, "rare":1});


        // #2 - another special case for top/rare, where we suppress the 'percent' field.
        // this is currently being handled in renderResults
//        if(isTopOrRare) {
//            this.setProperty("fieldHideList", ["percent"]);
//        }
//        else {
//            this.setProperty("fieldHideList", null);
//        }
        if (plotIntention && plotIntention["arg"]["mode"]=="chart") {
            this.determineAxisType(plotIntention["arg"]);
        }
        // set the ancillary props
        if (propertyManagerHash && propertyManagerHash.hasOwnProperty('chartTitle') && propertyManagerHash['chartTitle']) {
            $('.chartTitle', this.container).text(propertyManagerHash['chartTitle']).show();
        } else {
            $('.chartTitle', this.container).hide();
        }

        // set the chart properties
        for (var key in propertyManagerHash) {
            if (propertyManagerHash.hasOwnProperty(key)) {
                this.setProperty(key, this.resolveStaticURL(key, propertyManagerHash[key]));
            }
        }
    },

    getModifiedContext: function() {
        var context = this.getContext();
        if (this._selection) {
            for (key in this._selection) {
                context.set(this.drilldownPrefix + "." + key, this._selection[key]);
            }

            var searchModified = false;
            var search = context.get("search");

            var searchRange  = search.getTimeRange();
            // if the selection itself has a timeRange (ie this is a timechart or an event click)
            // then we use that.
            if (this._selection.timeRange) {
                search.setTimeRange(this._selection.timeRange);
                searchModified = true;
            // otherwise, if this is a relative or realtime search.
            // then we take the current absolute-time snapshot FROM THE JOB
            // and use that as the drilldown timerange.
            } else if (!searchRange.isAbsolute() && !searchRange.isAllTime()) {
                var job = this.getContext().get("search").job;
                search.setTimeRange(job.getTimeRange());
                searchModified = true;
            }

            // push the modified search back into the context.
            if (searchModified) context.set("search", search);
        }
        return context;
    },

    /**
     *  override isReadyForContextPush to stop the pushes downstream
     * when we have no selected state
     */
    isReadyForContextPush: function($super) {
        if (!this._selection) {
            return Splunk.Module.CANCEL;
        }
        return $super();
    },

    resolveStaticURL: function(propertyName, propertyValue) {
        if (propertyName && propertyValue && (propertyValue.substring(0, 8) == "/static/"))
        {
            var lastDotIndex = propertyName.lastIndexOf(".");
            if (lastDotIndex > 0)
            {
                propertyName = propertyName.substring(lastDotIndex + 1, propertyName.length);
                if ((propertyName == "source") || (propertyName == "sourcePath"))
                {
                    var hadTrailingSlash = (propertyValue.charAt(propertyValue.length - 1) == "/");
                    propertyValue = Splunk.util.make_url(propertyValue);
                    var hasTrailingSlash = (propertyValue.charAt(propertyValue.length - 1) == "/");
                    if (hasTrailingSlash != hadTrailingSlash)
                        propertyValue = hadTrailingSlash ? propertyValue + "/" : propertyValue.substring(0, propertyValue.length - 1);
                }
            }
        }
        return propertyValue;
    },

    determineAxisType: function(intentionArg) {
        var fieldNames = [];

        //var fieldsList   = plotIntention["arg"]["fields"]
        // TODO - plot intentions in mode="chart" unfortunately extract the x-axis arg as though it was a 'splitby', which its not.
        var splitBy = intentionArg["splitby"];
        // TODO See above comment about mode="chart" and splitBy
        if (splitBy) fieldNames.push(splitBy);
        // TODO - when the above is fixed, the correct thing to do will be to get the [1] element from the fields themselves.
        //for (var i=0;i<fieldsList.length; i++) {
        //    fieldNames.push(fieldsList[i][1]);
        //}

        var args = {
            field_list:  fieldNames,
            top_count: 0,
            min_freq: 0
        };
        // we want a context that was run with statusBuckets>0.
        // If there's a base_sid attribute in the URL, that is exactly the general sort of thing
        // that guy is there for.  If he's there we use him.
        var search;
        var qsDict = Splunk.util.queryStringToProp(document.location.search);
        if (qsDict.hasOwnProperty("base_sid")) {
            search = Splunk.Search.resurrectFromSearchId(qsDict["base_sid"]);
        } else {
            // if no base_sid was found, we try and use our own sid, but it's quite likely
            // it was run with status_buckets=0 so our summary request will fail.
            search = this.getContext().get("search");
        }
        $.get(search.getUrl('summary', args), function(resultXML) {
            $.each($(resultXML).find("field"), function(index) {
                var fieldElt = $(this);
                // treat as numeric if HALF or more of the occurences are considered numeric
                var isNumeric = (fieldElt.attr("nc") > fieldElt.attr("c")/2);
//                if (isNumeric) {
//                    //this.callBridgeMethod("setValue", "axisX", "numeric");
//                    //this.callBridgeMethod("setValue", "axisX.fitZero", "false");
//                } else {
//                    // revert to whatever internal defaults or autoswitching the swf has..
//                    //this.callBridgeMethod("clearValue", "axisX");
//                    //this.callBridgeMethod("clearValue", "axisX.fitZero");
//                }
            });

        }.bind(this));
    },

    onJobProgress: function() {
        if(!this._isVisible) {
            return;
        }
        var context = this.getContext();
        var search  = context.get("search");
        var resultCount = search.job.getResultCount();
        var searchIsRealTime = search._range._relativeArgs.latest.isRealTime;
        var searchIsTransforming = search.job.areResultsTransformed();
        var postProcess = search.getPostProcess();
        var preparing = search.job.isPreparing();       
 
        if(preparing) {
            var msg = 'preparing';
            if(search.job.isQueued())
            {
                msg = 'queued';
            }
            else if(search.job.isParsing())
            {
                msg = 'parsing';
            }
            this.showStatusMessage('results', msg, search.job.getSearchId());
        }
        // if the search is non-transforming, don't try to plot the results
        // unless the search is being post-processed
        else if(!searchIsTransforming && !postProcess) {
            this.showStatusMessage('results', 'nontransforming', null);
        }
        else if(resultCount == 0 && search.job.isDone() && !postProcess) {
            this.showStatusMessage('results', 'nodata', search.job.getSearchId());
        }
        else if(resultCount == 0 && !searchIsRealTime && !postProcess) {
            this.showStatusMessage('results', 'waiting', search.job.getSearchId());
        }
        else {
            this.hideStatusMessage();
            if(search.job.isPreviewable() && context.get('charting.data.preview') !== 'false') {
                this.getResults();
            }
            if (search.job.isDone() && !this.renderMonitor) {
                // Notifying PageStatus that a render is beginning.
                this.renderMonitor = Splunk.Globals['PageStatus'].register(this.moduleType + ' - rendering final data - ' + this.container.attr('id'));
            }
        }
    },

    onJobDone: function($super) {
        $super();

        if(!this._isVisible) {
            return;
        }

        var context = this.getContext();
        var search = context.get("search");
        var searchIsTransforming = search.job.areResultsTransformed();
        var postProcess = search.getPostProcess();

        // if the search is non-transforming, don't try to plot the results
        // unless the search is being post-processed
        if(!searchIsTransforming && !postProcess) {
            this.showStatusMessage('results', 'nontransforming', null);
        }
        else if ((search.job.getResultCount() == 0 && !postProcess)) {
            this.showStatusMessage('results', 'nodata', search.job.getSearchId());
        }
        else {
            this.hideStatusMessage();
            this.getResults();
        }
    },

    stripUnderscoreFieldPrefix: function(fieldName) {
        // this and similar code in SimpleResultsTable is a temporary fix for SPL-27829
        // certain modules, notably SimpleResultsTable, (and even when displaying 'results'),
        // will suppress or otherwise treat underscore fields specially.
        // to circumvent negative effects from this, whenever reporting commands like chart
        // and timechart find themselves generating columns that begin with underscores,
        // they will tack on a bizarre "VALUE_" prefix to the column names.
        // Two wrongs dont really make a right but hopefully this provokes some discussion
        // between S&I and UI to resolve these issues in a better way.
        if (fieldName.indexOf(this.LEADING_UNDERSCORE_PREFIX) !=-1) {
            return fieldName.replace(this.LEADING_UNDERSCORE_PREFIX, "_");
        }
        return fieldName;
    },

    onDataUpdated: function(event) {
        var context = this.getContext();
        var search  = context.get("search");
        // screen out previews and (for the timeline) async updates onJobProgress
        if (search.isJobDispatched() && search.job.isDone()) {
            // each time you call 'update' you get back an int that increments each time.
            // We keep this int as a local property - this.updateId
            // if the 'updateCount' of this particular dataUpdated event, matches the last
            // update we asked for,  then we mark it complete.
            // it's possible however that we asked for another update RIGHT when the penultimate
            // update request returned.  That's what this check is doing.
            if (this.renderMonitor && (event.updateCount >= this.updateId)) {
                this.renderMonitor.loadComplete();
                this.renderMonitor = false;
            }
        }
    },

    _changeVisibility: function() {
        var visible = true;
        for (var mode in this._invisibilityModes) {
            if (this._invisibilityModes.hasOwnProperty(mode)) {
                visible = false;
            }
        }
        if(visible) {
            this.container.show();
            this._isVisible = true;
        }
        else {
            this.container.hide();
            this._isVisible = false;
        }
    },

    onLegendClicked: function(event) {
        this._selection = {
            modifierKey: event.modifierKey,
            name2: this.stripUnderscoreFieldPrefix(event.name2)
        };
        this.showDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);
        this.pushContextToChildren();
    },

    onChartClicked: function(event) {
        this._selection = {
            modifierKey: event.modifierKey,
            name: event.name,
            value: event.value,
            name2: this.stripUnderscoreFieldPrefix(event.name2),
            value2: event.value2
        };

        if(event.name === '_time' && event._span) {
            var duration = parseFloat(event._span),
                startTime = parseInt(event.value, 10),
                endTime = startTime + duration;
            this._selection.timeRange = new Splunk.TimeRange(startTime, endTime);

        }
        if(event.hasOwnProperty('rowContext')) {
            this._selection.rowContext = event.rowContext;
        }
        this.showDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);
        this.pushContextToChildren();
    },

    /**
     * display a search job status message
     */

    showStatusMessage: function(entity_name, msg, sid) {
        this.destroyChart();
        this.statusEnabled = true;
        if(msg === "nontransforming") {
            $('.messageContainer', this.container).hide();
            $('.nonTransformingWarning', this.container).show();
        }
        else {
            $('.nonTransformingWarning', this.container).hide();
            var self = this;
            var getArgs = {
                entity_name: entity_name,
                msg: msg,
                sid: sid
            };
            $('.messageContainer', this.container).load(
                Splunk.util.make_url('/module/search/JSChart/statusMessage')
                + '?' + Splunk.util.propToQueryString(getArgs),
                function() {
                    if (self.statusEnabled) { $(this).show(); }
                }); // fix for weird timing issue
        }
    },

    hideStatusMessage: function() {
        this.statusEnabled = false;
        $('.messageContainer', this.container).hide().html('');
        $('.nonTransformingWarning', this.container).hide();
    },

    showInlineMessage: function() {
        $('.inlineMessageContainer', this.container).show();
    },

    hideInlineMessage: function() {
        $('.inlineMessageContainer', this.container).hide();
    },

    // look for css styles being applied to FlashChart, not JSChart (for backwards compatibility)
    sniffCssStyles: function() {
        // doing our best to put the mock FlashChart element in the right document context, but style rules based on children number might not work
        var $mockFlashChart = $('<div class="FlashChart" style="display: none"></div>').insertAfter(this.container);

        this.properties.backgroundColor = $mockFlashChart.css('backgroundColor') || "#ffffff";
        this.properties.foregroundColor = $mockFlashChart.css('borderLeftColor') || "#000000";
        this.properties.fontColor = $mockFlashChart.css('color') || "#000000";

        $mockFlashChart.remove();
    },

    redrawIfNeeded: function(updateCount) {
        if(this.redrawNeeded) {
            this.draw(updateCount);
        }
        else {
            this.onDataUpdated({updateCount: updateCount});
        }
    },

    draw: function(updateCount) {
        // if dependencies are not loaded yet, defer the draw the their on-ready callback
        if(!this.chartingLibLoaded) {
            this.hasPendingDraw = true;
            return;
        }
        var i, newFieldList,
            data = this.getChartReadyData(this.response, this.properties),
            drawCallback = function(chartWrapper) {
                this.redrawNeeded = false;
                this.onDataUpdated({updateCount: updateCount});
                this.updateGlobalReference(chartWrapper);
            }.bind(this);

        this.destroyChart();
        this.chart = Splunk.JSCharting.createChart(this.chartContainer, this.properties);

        this.chart.on('pointClick', this.onChartClicked.bind(this));
        this.chart.on('legendClick', this.onLegendClicked.bind(this));

        this.chart.prepare(data);

        if(this.chart.requiresExternalColorPalette()) {
            newFieldList = this.chart.getFieldList();
            this.applyColorsAndDraw(newFieldList, drawCallback);
        }
        else {
            this.renderChart(drawCallback);
        }
    },

    pushDataToChart: function(updateCount) {
        var newFieldList,
            data = this.getChartReadyData(this.response, this.properties),
            successCallback = function(chartObject) {
                this.onDataUpdated({updateCount: updateCount});
                this.updateGlobalReference(chartObject);
            }.bind(this);

        this.chart.prepare(data);
        if(this.chart.requiresExternalColorPalette()) {
            newFieldList = this.chart.getFieldList();
            this.applyColorsAndDraw(newFieldList, successCallback);
        }
        else {
            this.renderChart(successCallback);
        }
    },

    // this function is an abstraction for a debounced draw routine
    // multiple calls to this function within the debounce interval will only result in one draw operation
    // all callbacks will be collected and fired when the actual draw takes place
    renderChart: function(callback) {
        // if the render success deferred is resolved, then it is left over from a previous render, so refresh it
        if(this.renderSuccessDfd.state() === 'resolved') {
            this.renderSuccessDfd = $.Deferred();
        }
        // add the given callback to the render success deferred
        this.renderSuccessDfd.then(callback);

        // now set up the debounced draw routine
        var that = this,
            Throttler = Splunk.Module.JSChart.RenderThrottler;

        if(this.drawTimeout) {
            clearTimeout(this.drawTimeout);
            Throttler.unRegisterPendingDraw();
        }
        this.drawTimeout = setTimeout(function() {
            if(!that.chart) {
                return;
            }
            that.chart.draw(function(chart) {
                Throttler.unRegisterPendingDraw();
                that.renderSuccessDfd.resolve(chart);
            });
            that.drawTimeout = false;
        }, Throttler.getDebounceInterval());
        Throttler.registerPendingDraw();
    },

    getChartReadyData: function(response, properties) {
        if(!response) {
            response = { columns: [], fields: [] };
        }
        var adjustedResponse;
        this.hideInlineMessage();
        this.properties['axisLabelsX.hideCategories'] = false;
        // for pie and scatter charts or gauges, don't adjust the raw response
        if(properties.chart in {pie: true, scatter: true, radialGauge: true, fillerGauge: true, markerGauge: true}) {
            adjustedResponse = response;
        }

        var context = this.getContext(),
            search = context.get("search"),
        truncationLimit = parseInt(context.get('charting.chart.resultTruncationLimit'),10) ||
                          parseInt(this.getParam('resultTruncationLimit'), 10);


        //set a limit on the total number of data points based on the chart type and renderer
        var actualPointsPerSeries = (response.columns.length > 0) ? response.columns[0].length : 0,
            // the SVG renderer can handle more column-type points than the VML renderer
            maxColumnPoints = ($.browser.msie && $.browser.version in {"6.0": true, "7.0": true, "8.0": true}) ? 1000 : 1200,
            maxLinePoints = 2000,
            // if a truncation limit was specified and is greater than zero, use it instead of the automatic limits
            maxPoints = (truncationLimit > 0) ? truncationLimit : ((properties.chart in {line: true, area: true}) ? maxLinePoints : maxColumnPoints),
            numSeries = response.fields.length,
            pointsAllowedPerSeries = Math.floor(maxPoints / numSeries);


        this.properties['resultTruncationLimit'] = truncationLimit;


        if(actualPointsPerSeries > pointsAllowedPerSeries) {
            this.logger.info("Charting data truncation warning: Actual points per series, " + actualPointsPerSeries +", was greater than points allowed per series, " + pointsAllowedPerSeries + ".");
            adjustedResponse = this.sliceResultsBySeriesLength(response, pointsAllowedPerSeries);
            this.showInlineMessage();
        }
        if(search.job.getResultCount() > this.resultsCount){
            this.logger.info("Charting data truncation warning: Search generated " + search.job.getResultCount() + " results, allowed " + this.resultsCount + ".");
            adjustedResponse = response;
            this.showInlineMessage();
        }
        else {
            adjustedResponse = response;
        }

        /*
        // for category-based charting, use the CATEGORY_LABEL_CUTOFF to determine if labels should be shown
        if(!this.resultsAreTopOrRare(response)) {
            var numCategories = (adjustedResponse.columns.length > 0) ? adjustedResponse.columns[0].length : 0;
            if(false && numCategories > this.CATEGORY_LABEL_CUTOFF) {
                this.properties['axisLabelsX.hideCategories'] = true;
            }
        }
        */

        if(response.numSeriesTruncated && !(properties.chart in {pie: true, scatter: true, radialGauge: true, fillerGauge: true, markerGauge: true})) {
            this.showInlineMessage();
        }

        return Splunk.JSCharting.extractChartReadyData(adjustedResponse);
    },

    // create/update the reference to the chart object in the global map so it is accessible for automated testing
    updateGlobalReference: function(chartWrapper) {
        var chartObject = chartWrapper.hcChart || chartWrapper.getChartObject();
        Splunk.Module.JSChart.setChartById(this.moduleId, chartObject);
    },

    applyColorsAndDraw: function(fieldList, callback) {
        var i, loopLabel, masterIndex, localIndex,
            shouldNotifyMaster = false,
            legendTotalSize = this.legendManager.numLabels();

        this.legendFieldList = fieldList;

        // make sure the legend field map is up to date, will need to fetch new label mappings if
        // a new label was added that doesn't have an index in the master legend manager
        for(i = 0; i < this.legendFieldList.length; i++) {
            loopLabel = this.legendFieldList[i];
            masterIndex = this.legendManager.getLabelIndex(loopLabel);
            localIndex = this.legendFieldMap[loopLabel];
            if(masterIndex === -1) {
                // the label is not being tracked by the master
                shouldNotifyMaster = true;
            }
            else {
                // the master legend is tracking this label, so we can safely use the same index
                this.legendFieldMap[loopLabel] = masterIndex;
            }
        }
        // if the shouldNotifyMaster flag is set, have to notify the master legend manager and wait for an update
        if(shouldNotifyMaster) {
            this.legendManager.setLabels(this.legendFieldList);
            this.pendingCallback = callback;
        }
        // otherwise we have what we need to draw right away
        else {
            this.chart.setExternalColorPalette(this.legendFieldMap, legendTotalSize);
            this.renderChart(callback);
        }
    },

    resize: function() {
        if(this.chart) {
            // resizing is expensive, make sure the dimensions actually changed before doing it
            var currentWidth = this.chart.chartWidth,
                currentHeight = this.chart.chartHeight,
                newWidth = $(this.chartContainer).width(),
                newHeight = $(this.chartContainer).height();

            if(currentWidth != newWidth || currentHeight != newHeight) {
                this.chart.resize(newWidth, newHeight);
            }
        }
    },

    setProperty: function(propertyName, value) {
        if(typeof value === "string") {
            value = this.unescapePropertyValue(value);
        }
        if(this.properties[propertyName] !== value) {
            this.properties[propertyName] = value;
            this.onPropertyChanged(propertyName, value);
        }
    },

    // any property value beginning with '#' or '@' is escaped by duplicating that character
    // un-escape them by removing the duplicate
    unescapePropertyValue: function(escapedValue) {
        var value = escapedValue.replace(/^@@/, '@').replace(/^##/, '#');
        return value;
    },

    getProperty: function(propertyName){
        return this.properties[propertyName];
    },

    // based on the property name, decides if the chart can be updated in place,
    // or flips the redrawNeeded boolean so a full redraw will take place on the
    // next call to redrawIfNeeded
    onPropertyChanged: function(name, value) {
        if(name == 'jobID') {
            // a new job is being kicked off, so reset all legend color data
            this.legendIndexMap = {};
            this.globalLegendSize = 0;
            this.localLegendSize = 0;
            return;
        }
        if(name == 'chartTitle') {
            return;
        }
        if(name == 'chart' || name == 'layout.splitSeries') {
            this.destroyChart();
        }
        this.redrawNeeded = true;
    },

    destroyChart: function() {
        if(this.chart) {
            this.chart.destroy();
            $(this.chartContainer).empty();
            this.chart = false;
        }
    },

    chartIsAGauge: function() {
        return (this.properties.chart in {radialGauge: 1, fillerGauge: 1, markerGauge: 1});
    }

});

Splunk.Module.JSChart.RenderThrottler = {

    DRAW_TIMEOUT_MULTIPLIER: (function() {
        var hasSVG = !!document.createElementNS &&
                            !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
        return hasSVG ? 10 : 200;
    })(),

    numPendingDraws: 0,

    registerPendingDraw: function() {
        this.numPendingDraws++;
    },

    unRegisterPendingDraw: function() {
        if(this.numPendingDraws > 0) {
            this.numPendingDraws--;
        }
    },

    getDebounceInterval: function() {
        return this.DRAW_TIMEOUT_MULTIPLIER * (this.numPendingDraws) + 10;
    }

};

// some "class" level methods for managing the various charts on a given page
// FOR TESTING ONLY!

Splunk.Module.JSChart.chartByIdMap = {};

Splunk.Module.JSChart.getChartById = function(moduleId) {
    return this.chartByIdMap[moduleId];
};

Splunk.Module.JSChart.setChartById = function(moduleId, chart) {
    this.chartByIdMap[moduleId] = chart;
};
