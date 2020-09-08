
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.ResultsHeader = $.klass(Splunk.Module.SimpleResultsHeader, {

    customTimeHeaders: [],

    initialize: function($super, container) {
        $super(container);
        this._eventCountHeader = $(".numberOfEvents", this.container);
        this._entityLabelHeader = $(".entityLabelStr", this.container);
        this._timeRangeHeader  = $(".timeRangeStr", this.container);
        
        this._entityLabel = this.getParam("entityLabel");
        this._entityLabelSingular = this.getParam("entityLabelSingular");

        if (!this._entityLabel) {
            this.logger.error(this.moduleType, ".initialize Assertion failed. Required param entityLabel not set.");
            this._entityLabel = "events";
        }

        // report_builder link part 1.
        // Based on what comps are showing,
        // this will probably be moved into its own module.
        if (this._params.hasOwnProperty("link")) {
            // there's no href cause its not assigned until onJobProgress
            this._link = $("<a/>")
                .hide()
                .text(this._params["link"]["label"])
                .prependTo($(this.container));

            if (this._params["link"]["popup"]) {
                this._link.attr("rel", "popup");
            }
            var moduleInstance = this;
            this._link.click(function(event) {
                // whether or not the link loads in this page or a popup window, 
                // we have to make sure now that when this window object fires onunload, we dont simply cancel it.
                
                var search = this.getContext().get("search");
                search.job.setAsAutoCancellable(false);

                if ($(this).attr("rel") == "popup") {
                    this._popupWindow = window.open($(this).attr("href"), moduleInstance ._params["link"]["viewTarget"], "resizable=yes,status=no,scrollbars=yes,toolbar=no");
                    try {
                        this._popupWindow.focus();
                    } catch(e) {}
                    return false;
                } else {
                    return true;
                } 
            });
        }
        this.messenger = Splunk.Messenger.System.getInstance();
        this.customTimeHeaders = this._params["customTimeHeaders"] || [];
    },
    onJobProgress: function(){
        var search = this.getContext().get("search");
        var count = this.getEntityCount(search);
        this.setCountHeader(count, search.job.isDone());
        this.updateTimeHeader();
    },
    onContextChange: function() {
        var context = this.getContext();
        var search = context.get("search");
        var newSID = search.job.getSearchId();
        
        // TODO - here is another use case for that idea of writing a context.hasChanged("search")   (delegating to Search.isEqualTo)
        // if either weve never had a job, or this job is different from the last
        // one we had.
        if (!this._previousSID || this._previousSID != newSID) {
            this._previousSID = newSID;
            this.resetUI();
            if (this._link) this._link.hide();
        }

        var count = this.getEntityCount(search);
        this.setCountHeader(count, search.job.isDone());
        this.updateTimeHeader();

    },
    getMatchingCustomHeader: function(range) {
        for (var i=0; i<this.customTimeHeaders.length; i++) {
            var item = this.customTimeHeaders[i];
            var itemRange = new Splunk.TimeRange(item["earliest_time"], item["latest_time"]);

            if (range.equalToRange(itemRange)) {
                if ("header_label" in item) {
                    return item["header_label"];
                } else if ("label" in item) {
                    var label = item["label"];
                    // might not be 100% correct but we lowercase the first letter.
                    return label.slice(0,1).toLowerCase() + label.slice(1);
                } 
            }
        }
        return false;
    },
    updateTimeHeader: function() {
        var header,
            search = this.getContext().get("search"),
            job = search.job;
        if(job._dispatchState === "FAILED"){
            header = "";
        }else{
            var relativeRange = search.getTimeRange();
            var actualIndexRange = new Splunk.TimeRange(job["_searchEarliestTime"], job["_searchLatestTime"]);
            if(job.isRealTimeSearch()){
                //the last case should never be hit, but here just in case.
                header = this.getMatchingCustomHeader(relativeRange) || relativeRange.toConciseString() || _("in real time");
            }else{
                if(!isNaN(relativeRange._constructorArgs[0]) && !isNaN(relativeRange._constructorArgs[1])){
                    actualIndexRange = new Splunk.TimeRange(relativeRange._constructorArgs[0], relativeRange._constructorArgs[1]);
                }
                header = actualIndexRange.toConciseString();
            }
        }
        this._timeRangeHeader.text(header);
    },
    onJobDone: function() {
        // report_builder link part 2.
        var context = this.getContext();
        var search  = context.get("search");
        var count = this.getEntityCount(search);
        if (this._link && count>0) {
            var path = Splunk.util.make_url("/app/", Splunk.util.getCurrentApp(), this._params["link"]["viewTarget"]);
            var url = path + "?" + $.param({"sid": search.job.getSearchId()});
            this._link.attr("href", url);
            this._link.show().css({display: 'inline'});
        }
        this.updateTimeHeader();
    },
    setCountHeader: function(count, isDone) {
        var modifier = (isDone) ? "" : "&#8805; ";
        this._eventCountHeader.html(modifier + Splunk.util.getCommaFormattedNumber(count));

        if (this._entityLabelSingular) {
            this._entityLabelHeader.text(ungettext(_(this._entityLabelSingular), _(this._entityLabel), count));
        } else {
            this._entityLabelHeader.text(_(this._entityLabel));
        }
    },
    resetUI : function() {
        this._eventCountHeader.html('');
        this._entityLabelHeader.html('');
        this._timeRangeHeader.html('');
    }
});
