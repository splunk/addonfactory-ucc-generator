Splunk.Module.FlashChart = $.klass(Splunk.Module.FlashWrapper, {

    /**
     * Defines the prefix for settings that should be automatically passed
     * into the charting library.
     *
     * Ex: to set font size, set "charting.fontSize"
     *
     */
    SETTING_PREFIX: 'charting.',

    LEADING_UNDERSCORE_PREFIX: "VALUE_",

    USE_FLASH_POLLER: false,
    _selection : null,
    /* with multiple orthogonal ways in which something can be visible or invisible
     * every mechanism that shows/hides modules has to provide a unique key.
     * We take the following and append the moduleId.
     */ 
    DRILLDOWN_VISIBILITY_KEY : "FlashChartInteractionValidity",

    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("FlashChart.js");
        
        this.legend_onSetLabels = this.legend_onSetLabels.bind(this);
        this.legend_onLabelIndexMapChanged = this.legend_onLabelIndexMapChanged.bind(this);

        // strings that flash may ask to be localized
        _("Open as image");
        _("Full screen");
        _("Results Error:");
        _("No result data.");

        // if set to 'foo', the drilldown keys coming out of getModifiedContext() will look like "foo.name", "foo.value"
        this.drilldownPrefix = this.getParam("drilldownPrefix");
        // attach status message on/off
        this.container.bind("mouseenter", this.onStatusMouseenter.bind(this));
        this.container.bind("mouseleave", this.onStatusMouseleave.bind(this));
    },

    onLoadStatusChange: function($super,statusInt) {
        $super(statusInt);
        if (statusInt == Splunk.util.moduleLoadStates.WAITING_FOR_HIERARCHY) {
            this.hideDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);
        }
    },
    
    /**
     * We assume that FlashCharts always require transformed results
     * see comments on this function in DispatchingModule.js for more details.
     */
    requiresTransformedResults: function() {return true;},

    initializeBridge: function($super) {
        $super();
        this.bridge.addProperty("legend.numLabels", this.legend_numLabels.bind(this));
        this.bridge.addMethod("legend.setLabels", this.legend_setLabels.bind(this));
        this.bridge.addMethod("legend.getLabelIndex", this.legend_getLabelIndex.bind(this));
        this.bridge.addEvent("legend.setLabels");
        this.bridge.addEvent("legend.labelIndexMapChanged");
        
    },

    /**
     * The only reason you'd have a child of a FlashChart is if you wanted to give it 
     * various children that represent drilldown configurations. 
     * Therefore if we have children, we automatically turn on the highlighting cues.
     */
    addChild: function($super, child) {
        this._enableDrilldown = true;
        this.setBridgeProperty("enableChartClick", true);
        // NOTE THAT WE MAY LATER DISABLE THIS IN chart='pie', because the special-casing of legend 
        // items there breaks our model.
        this.setBridgeProperty("enableLegendClick", true);
        return $super(child);
    },

    legend_numLabels: function() {
        return Splunk.Legend.numLabels();
    },
    legend_setLabels: function(labels) {
        Splunk.Legend.setLabels(this.bridge.id(), labels);
    },
    legend_getLabelIndex: function(label) {
        return Splunk.Legend.getLabelIndex(label);
    },
    legend_onSetLabels: function() {
        this.bridge.dispatchEvent("legend.setLabels");
    },
    legend_onLabelIndexMapChanged: function() {
        this.bridge.dispatchEvent("legend.labelIndexMapChanged");
    },


    onConnect: function($super, isReconnect) {
        
        Splunk.Legend.register(this.bridge.id());
        Splunk.Legend.addEventListener("setLabels", this.legend_onSetLabels);
        Splunk.Legend.addEventListener("labelIndexMapChanged", this.legend_onLabelIndexMapChanged);
        this.bridge.addEventListener('chartClicked', this.onChartClicked.bind(this));
        this.bridge.addEventListener('legendClicked', this.onLegendClicked.bind(this));
        
        $super(isReconnect); // called last since it sets _isBridgeConnected == true
        if (this._enableDrilldown) {
            this.setBridgeProperty("enableChartClick", true);
            this.setBridgeProperty("enableLegendClick", true);
        }
    },
    

    onClose: function($super) {
        Splunk.Legend.removeEventListener("labelIndexMapChanged", this.legend_onLabelIndexMapChanged);
        Splunk.Legend.removeEventListener("setLabels", this.legend_onSetLabels);
        Splunk.Legend.unregister(this.bridge.id());

        $super();
    },


    onContextChange: function() {
        
        $('.resultStatusMessage', this.container).hide().html('');

        if (!this._isBridgeConnected) {
            this.logger.debug("bridge is not connected onContextChange. Exiting. onContextChange will fire onConnect.");
            return;
        }
        this.hideDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);
        
        this._selection = null;

        var context = this.getContext();
        var search  = context.get("search");
        var sid = search.job.getSearchId();
        var postProcess = search.getPostProcess();
        
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
            if (search.job.getResultCount() == 0 && !postProcess) {
                this.showStatusMessage('results', 'nodata', sid);
            } else {
                this.hideStatusMessage();
            }
        }

        // This handles the case where the sid has high byte chars in it.
        // It should probably be removed when Gatt has implemented encoding in his Flash lib.
        if (sid != null) {
            this.setBridgeProperty("jobID", encodeURIComponent(encodeURIComponent(sid)));
        } else {
            this.setBridgeProperty("jobID", sid);
        }
        
        // Handle post process
        var pp = search.getPostProcess();
        if (pp) {
            this.callBridgeMethod("setValue", "data.search", pp);
        } else {
            this.callBridgeMethod("clearValue", "data.search");
        }
        // in certain cases depending on onConnect, onContextChange, we need to nudge the swf to render.
        this.update();

        var propertyManagerHash = context.getAll("charting");

        // TEMPORARY -- the charting.swf special cases the handling of the legend in pie. 
        //              legend items there are basically the same as the data values, 
        //              and are not showing a split-by field. 
        //              However it does it such that when the legend click comes, 
        //              we've lost the information of the field-name so i cannot special case it here. 
        // For now I've just disabled legend clicking.
        this.setBridgeProperty("enableLegendClick", (propertyManagerHash["chart"] != "pie"));


        // if this is a scatter chart we set some other values that make for more sensible defaults. 
        // and that will 98% of the time make life better. 
        // TODO - this is a possible candidate to be pulled into a generic pluggable validation/normalization mechanism in Context. 
        if (propertyManagerHash["chart"] == "scatter") {
            this.callBridgeMethod("setValue", "axisX", "numeric");
            this.callBridgeMethod("setValue", "axisX.fitZero", "false");
            this.callBridgeMethod("setValue", "axisY.fitZero", "false");
        } else {
            this.callBridgeMethod("clearValue", "axisX");
            this.callBridgeMethod("clearValue", "axisX.fitZero");
            this.callBridgeMethod("clearValue", "axisY.fitZero");
        }
            
    
        var plotIntention = search.getIntentionReference("plot");
        var isTopOrRare = (plotIntention && plotIntention["arg"]["mode"] in {"top":1, "rare":1});
        
        // #1 - special case for top/rare, where we tell the charting system to only render the top N rows.
        if (this._params["maxRowsForTop"] && isTopOrRare && (propertyManagerHash["chart"] != "pie")) {
            this.setBridgeProperty("resultsCount", this._params["maxRowsForTop"]);
        } else {
            this.setBridgeProperty("resultsCount", this.getParam('maxResultCount'));
        }
        
        // #2 - another special case for top/rare, where we suppress the 'percent' field.
        try {
            if (isTopOrRare) {
                this.setBridgeProperty("fieldHideList", ["percent"]);
            } else {
                this.setBridgeProperty("fieldHideList", null);
            }
        } catch(e) {
            this.logger.error("error trying to set the fieldHideList");
        }
        if (plotIntention && plotIntention["arg"]["mode"]=="chart") {
            this.determineAxisType(plotIntention["arg"]);
        }
        // set the ancillary props
        if (propertyManagerHash && propertyManagerHash.hasOwnProperty('chartTitle') && propertyManagerHash['chartTitle']) {
            $('.chartTitle', this.container).text(propertyManagerHash['chartTitle']).show();
        } else {
            $('.chartTitle', this.container).hide();
        }
        
        // set the flash chart properties
        for (var key in propertyManagerHash) {
            if (propertyManagerHash.hasOwnProperty(key)) {
                //this.logger.debug('FlashChart - set ' + key + '=' + propertyManagerHash[key]);
                try {
                    this.logger.info("setValue from propertyManagerHash", key);
                    this.callBridgeMethod("setValue", 
                        key, 
                        this.resolveStaticURL(key, propertyManagerHash[key])
                    );
                } catch (e) {
                    this.logger.error("catching a jabridge exception '", e, "'. Basically this is the SPL-17758 problem. catching it so it doesnt derail everything. ");
                }
            }
        }        
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
                if (isNumeric) {
                    this.callBridgeMethod("setValue", "axisX", "numeric");
                    this.callBridgeMethod("setValue", "axisX.fitZero", "false");
                } else {
                    // revert to whatever internal defaults or autoswitching the swf has..
                    this.callBridgeMethod("clearValue", "axisX");
                    this.callBridgeMethod("clearValue", "axisX.fitZero");
                }
            });
            
        }.bind(this));
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

    onJobProgress: function($super) {
        $super();
        if (this.USE_FLASH_POLLER) return false;
        var context = this.getContext();
        var search  = context.get("search");
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
        else if (search.job.getResultCount() == 0 && !postProcess) {
            if (search.job.isDone()) {
                this.showStatusMessage('results', 'nodata', search.job.getSearchId());
            } else {
                this.showStatusMessage('results', 'waiting', search.job.getSearchId());
            }
        } else {
            this.hideStatusMessage();
        }
        if (search.job.isPreviewable()) {
            this.update();
        }
    },
    onJobDone: function($super) {
        $super();
        if (this.USE_FLASH_POLLER) return false;
        this.update();
        
        var context = this.getContext();
        var search = context.get("search");
        var postProcess = search.getPostProcess();
        if (search.job.getResultCount() == 0 && !postProcess) {
            this.showStatusMessage('results', 'nodata', search.job.getSearchId());
        } else {
            this.hideStatusMessage();
        }
    },
    onDataUpdated: function($super, event) {
        $super(event);

        if (event.updateCount < this.updateId)
            return;

        var context = this.getContext();
        var search = context.get("search");
        if (!search.isJobDispatched() || !search.job.isDone() || !search.getPostProcess())
            return;

        var dataRows = this.callBridgeMethod("getValue", "data.numRows");
        if (dataRows === "0")
            this.showStatusMessage('results', 'nodata', search.job.getSearchId());
    },
    onLegendClicked: function(event) {
        var seriesStr = event.text;
        this._selection = {};
        this._selection.name2 = this.stripUnderscoreFieldPrefix(event.text);
        if (event.ctrlKey) {
            // because flash is weird, they have already taken the confusing step 
            // of normalizing the whole mac/pc commandKey!=ctrlKey thing for us. 
            // so ctrlKey,  on mac,  is actually the commandKey.   All is well. 
            this._selection.modifierKey = event.ctrlKey;
        }
        this.showDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);
        
        this.pushContextToChildren();
    },
    onChartClicked: function(event) {
        var data = event.data;
        var fields = event.fields;
        
        this.showDescendants(this.DRILLDOWN_VISIBILITY_KEY + "_" + this.moduleId);
        this._selection = null;
        
        for (var i=0;i<fields.length; i++) {

            if (!this._selection) this._selection = {};
            // Although in the data they are called 'fields', in a more fundamental sense that is not always true. 
            var name = fields[i];
            if (data.hasOwnProperty(name)) {
                if (i==0) {
                    this._selection.name  = name;
                    this._selection.value = data[name];
                }
                else if (i==1) {
                    this._selection.name2  = this.stripUnderscoreFieldPrefix(name);
                    this._selection.value2 = data[name];
                } else {
                    this.logger.error("we only support 2-d drilldown at the moment.");
                    this.logger.error(fields);
                    this.logger.error(data);
                }
            }
            else {
                this.logger.message("Assertion failed - received a click event but there was a field in fields that was not in the data.");
            }
        }
        if (this._selection.name=="_time") {
            if (data["_span"]) {
                var duration = parseFloat(data["_span"]);
                var startTime   = parseFloat(Splunk.util.getEpochTimeFromISO(this._selection.value));
                var endTime     = startTime + duration;
                this._selection.timeRange = new Splunk.TimeRange(startTime, endTime);
            }
        } 
        
        if (this._selection && event.ctrlKey) {
            // because flash is weird, they have already taken the confusing step 
            // of normalizing the whole mac/pc commandKey!=ctrlKey thing for us. 
            // so ctrlKey,  on mac,  is actually the commandKey.   All is well. 
            this._selection.modifierKey = event.ctrlKey;
        }
        this.pushContextToChildren();
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

            /*
            if (search.getPostProcess()) {
                search.setPostProcess(false);
                searchModified = true;
            }
            */

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
    
    /**
     * display a search job status message
     */
    showStatusMessage: function(entity_name, msg, sid) {
        this.statusEnabled = true;
        var self = this;
        var getArgs = {
            entity_name: entity_name,
            msg: msg,
            sid: sid
        };
        $('.messageContainer', this.container).load(
            Splunk.util.make_url('/module/search/FlashChart/statusMessage')
            + '?' + Splunk.util.propToQueryString(getArgs),
            function() { 
                if (self.statusEnabled) { $(this).show(); }
            }); // fix for weird timing issue
        
    },
    
    hideStatusMessage: function() {
        this.statusEnabled = false;
        $('.messageContainer', this.container).hide().html('');
    },
    
    /**
     * handle hover state on the status messages
     */
    onStatusMouseenter: function(evt) {
        $('.resultStatusMessage .resultStatusHelp', this.container).css('visibility', 'visible');
    },

    /**
     * handle hover state out on the status messages
     */
    onStatusMouseleave: function(evt) {
        $('.resultStatusMessage .resultStatusHelp', this.container).css('visibility', 'hidden');
    }

    
    
    
});
