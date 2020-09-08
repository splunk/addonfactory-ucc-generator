//put Module in the namespace if it isnt already there.
Splunk.namespace("Module.DispatchingModule");

// A simple ascii representation of the Splunk timeline
Splunk.Module.AsciiTimeline = $.klass(Splunk.Module.DispatchingModule, {
    _selectionTimeRange : false,
   
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("ascii_timeline.js");
        this._chartContainer   = $(".timelineChart", this.container);
        this.selectionHeaderContainer = $(".selectionHeader", this.container);

        this.container.bind("selectstart", function(evt) {
            return false;
        });
    },

    onBeforeJobDispatched: function(search) {
        // needs at least one status bucket in it's dispatched searches.
        search.setMinimumStatusBuckets(300);
    },

    getResultURL: function() {
        var context = this.getContext();
        var search  = context.get("search");
        return search.getUrl('timeline');
    },

    onJobProgress: function(event) {
        this.logger.debug(this.moduleType + " onJobProgress");
        this.getResults();
    },

    /** 
     * if a new search comes down from above, we automatically clear any selection. 
     */
    onContextChange: function() {
        this._selectionTimeRange = false;
    },

    /* 
    We override getModifiedContext, because this class implements a 'selection' state. In this case
    it implements a "Selection Time" behaviour.  Children will display data from the selected time range.
    */
    getModifiedContext: function() {
        var context = this.getContext();
        if (this._selectionTimeRange) {
            this.logger.debug(this.moduleType, ".getModifiedContext - has a selectionRange so it will return a modified context.");

            // TODO - when it's children are eventsViewers, fieldViewers, fieldPickers, etc... 
            //        Then the same searchId can be reused.
            //        However when there's a child like FlashChart or ResultsTable
            //        that gets results, we need to redispatch.
            
            var search  = context.get("search");
            search.setTimeRange(this._selectionTimeRange);
            context.set("search", search);
        }
        return context;
    },

    renderResults: function(resultXML) {
        this._chartContainer.html('');

        var table = $('<table width="95%" />');
        var tr = $('<tr />').appendTo(table);

        var maxCount = 0;
        var maxChars = 10;
       
        // one loop to find the maxCount.
        $(resultXML).find('timeline').find("bucket").each(function() {
            maxCount = Math.max(maxCount, $(this).attr("c"));
        });
       
        $('<td class="leftAxis">' + maxCount + '--</td>').appendTo(tr);
       
        // another loop to draw the bars.
        // Since we need both a) to reference the object in context, with 'this', and b) to reference this Module instance,
        //     we need to create a small closure here.
        var moduleInstance = this;
        $(resultXML).find('timeline').find("bucket").each(function() {
           
            var count = $(this).attr("c");
            var charCount = Math.ceil(maxChars * count / maxCount);
           
            var td = $('<td class="bar" />');
            for (var i=0; i<charCount; i++) {
                $('<div />').html('X').appendTo(td);
            }
           
            td.attr("count",count);
            td.attr("earliesttime",$(this).text());
            td.attr("duration",$(this).attr("d"));
            td.attr("etz", $(this).attr("etz"));
            td.attr("ltz", $(this).attr("ltz"));
            td.mousedown(function(mozEvent) {
                moduleInstance._handleMouseDown(mozEvent,this);
            });
            td.mouseup(function(mozEvent) {
                moduleInstance._handleMouseUp(mozEvent,this);
            });
            td.appendTo(tr);
           
        });
       
        $('<td class="rightAxis">--' + maxCount + '</td>').appendTo(tr);
       
        // highlight histogram by selectionTimeRange
        if (this._selectionTimeRange) {
            //this.logger.warn("selectionTimeRange =", this._selectionTimeRange.toConciseString());
            this.highlightSelectedTimeRange(tr);
        }
        table.appendTo(this._chartContainer);
    },
   
    _handleMouseDown: function(evt,tdNode) {
        // prevent the ascii bars from getting selected by dragging.
        evt.preventDefault();
        // if this is a shift click, then we do nothing on mousedown.
        if (evt.shiftKey) return false;
        this._mouseDownTimeRange = this._getTimeRangeForBucket(tdNode);
        return false;
    },

    _handleMouseUp: function(evt,tdNode) {
        evt.preventDefault();
        if (!this._mouseDownTimeRange) return false;
        var range = this._getTimeRangeForBucket(tdNode);
        this.logger.debug(this.moduleType, "mouseUp timeRange=", range.toConciseString());
        this.logger.debug(this.moduleType, "mouseDown timeRange=", this._mouseDownTimeRange.toConciseString());

        var selectionTimeRange;
        var earliestRange = range;
        var latestRange   = range;
        // if the user dragged to the left
        if (this._mouseDownTimeRange.getAbsoluteEarliestTime() >= range.getAbsoluteLatestTime()) {
            latestRange   = this._mouseDownTimeRange.clone();
        }
        // if the user dragged to the right
        else if (range.getAbsoluteEarliestTime() >= this._mouseDownTimeRange.getAbsoluteLatestTime()) {
            earliestRange = this._mouseDownTimeRange;
        }
        
        selectionTimeRange = new Splunk.TimeRange(earliestRange.getAbsoluteEarliestTime(),latestRange.getAbsoluteLatestTime(), earliestRange.earliestServerOffsetThen, latestRange.latestServerOffsetThen);

        selectionTimeRange.setAsSubRangeOfJob(true);
        // set the internal property that will change the job inherited by children.
        this._selectionTimeRange = selectionTimeRange;
        
        // highlight histogram by selectionTimeRange
        this.highlightSelectedTimeRange();

        // push the modified search to our children.
        this.pushContextToChildren();
        return false;
    },
   
    _getTimeRangeForBucket: function(start, end) {
        if (!start && !end) {
            this.logger.debug(this.moduleType, "._getTimeRangeForBucket given undefined buckets. exiting and returning 'all time'");
            return new Splunk.TimeRange();
        }
        else if (!start) {
            this.logger.error(this.moduleType, "._getTimeRangeForBucket - start undefined. Using end");
            start = end;
        }
        // quite a normal case.  For convenience end argument is often omitted.
        else {
            if (!end) end = start;
        }
        
        var earliestTime = start.getAttribute("earliesttime");
        var latestTime   = parseFloat(end.getAttribute("earliesttime")) + parseFloat(end.getAttribute("duration"));
        
        var startTZ = start.getAttribute("etz") / 60;
        var endTZ= start.getAttribute("etz") / 60;

        var range = new Splunk.TimeRange(earliestTime, latestTime, startTZ, endTZ);
        return range;
    },

    highlightSelectedTimeRange: function(chartContainer) {
        if (!chartContainer) chartContainer = this._chartContainer;
        this.logger.debug(this.moduleType, ".highlightHistogramByTimeRange -", this._selectionTimeRange);
        var totalCount = 0;
        var bars =  $('td.bar', chartContainer);
        for (var i=0; i<bars.length;i++) {
            var bucketTimeRange = this._getTimeRangeForBucket(bars[i]);   
            var bar = $(bars[i]);
            if (this._selectionTimeRange.containsRange(bucketTimeRange))   {
                bar.addClass("highlight");
                totalCount += parseInt(bar.attr("count"), 10);
            }
            else bar.removeClass("highlight");
        }
        // update the selection date display.
        this.updateSelectionHeader(totalCount);
    },

    updateSelectionHeader: function(totalCount) {
        var headerStr = ["selected:"];
        headerStr.push(Splunk.util.getCommaFormattedNumber(totalCount));
        headerStr.push("events");
        headerStr.push(this._selectionTimeRange.toConciseString());
       
        this.selectionHeaderContainer.text(headerStr.join(" "));
    },
   
    resetUI: function() {
        this._chartContainer.empty();
    }
});
