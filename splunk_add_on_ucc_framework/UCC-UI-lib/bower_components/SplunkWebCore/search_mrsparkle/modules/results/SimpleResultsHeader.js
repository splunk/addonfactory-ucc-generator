
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.SimpleResultsHeader = $.klass(Splunk.Module.DispatchingModule, {
    initialize: function($super, container) {
        $super(container);

        // Note: these params are marked as required in the conf.  
        // so the view itself will have thrown an exception if they were absent. 
        // however the unit testing doesnt currently know how to set required params
        this._entityName   = this._params["entityName"]   || "(required entityName unset)";
        this._headerFormat = this._params["headerFormat"] || "(required headerFormat unset) %s";
        this._replacementTokens = Splunk.util.discoverReplacementTokens(this._headerFormat);
    },
    
    /**
     * We sometimes will require transformed results
     * see comments on this function in DispatchingModule.js for more details.
     */
    requiresTransformedResults: function() {
        return (this._entityName=="results");
    },

    onBeforeJobDispatched: function(search) {
        if (this._entityName=="events") search.setMinimumStatusBuckets(1);
    },

    onJobProgress: function() {
        var search = this.getContext().get("search");
        var count = this.getEntityCount(search);
        this.setCountHeader(count, search.job.isDone());
    },

    onContextChange: function() {
        var search = this.getContext().get("search");
        var newSID = search.job.getSearchId();
        // if either weve never had a job, or this job is different from the last
        // one we had.
        if (!this._previousSID || this._previousSID != newSID) {
            this._previousSID = newSID;
        }
        this.onJobProgress();
    },

    ////////////////////////////////
    // Methods that are not overriding anything.
    ////////////////////////////////
    getEntityCount: function(search) {
        switch  (this._entityName) {
            case "auto" :
                return  search.job.areResultsTransformed() ? search.job.getResultCount() : search.getEventCount();
            case "events" :
                return search.getEventCount();
            case "results" :
                return search.job.getResultCount();
            case "scanned" :
                return search.job.getScanCount();
            //TODO - it would be cool if this could be wired up to a fieldValue...
            // in which case it would have to talk to the summary endpoint, and
            // defer the actual writing of the count into the DOM to a passed callback.
            default:
                this.logger.error("fell into default case of switch entityName=", this._entityName);
                break;
        }
    },
    
    setCountHeader: function(count, isDone) {
        var context = this.getContext();
        
        var modifier = (isDone) ? "" : "≥ ";
        var countStr = modifier + Splunk.util.getCommaFormattedNumber(count);

        var finalStr = this._headerFormat;
        // legacy stuff for sprintf format which was supported for  %(count)s
        
        if (finalStr.indexOf("%(count)s")!=-1) {
            finalStr = sprintf(finalStr, {count: countStr});
        }

        for (var i=0; i<this._replacementTokens.length; i++) {
            var token = this._replacementTokens[i];
            var replacer = new RegExp("\\$" + token + "\\$");
            var value;
            switch (token) {
                case "count":
                    value = countStr;
                    break;
                case "time":
                    value = context.get("search").getTimeRange().toConciseString();
                    break;
                //majority case. The tokens are just keys in the context namespace.
                default:
                    value = context.get(token);
                    break;
            }
            finalStr = Splunk.util.replaceTokens(finalStr, replacer, value);
        }
        $(".headerText", this.container).text(finalStr);
    },
    
    resetUI: function() {
        this.setCountHeader(0, true);
        $(".headerText", this.container).text("");
    }
});
