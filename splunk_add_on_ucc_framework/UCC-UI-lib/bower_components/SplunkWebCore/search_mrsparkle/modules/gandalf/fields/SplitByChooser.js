
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.SplitByChooser = $.klass(Splunk.Module.BaseReportBuilderField, {
   
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("single_splitby_chooser.js");
        // even though we dont want this module to force dispatches, we do want to take
        // advantage of existing sids when we have one.
        $(document).bind('jobProgress', function(event, job) {
            var context = this.getContext();
            var search  = context.get("search");
            if (search && (search.job.getSearchId() == job.getSID())) {
                this.onJobProgress(event);
            }
        }.bind(this));
    },

    isCompatibleWithIntention: function(plotIntention) {
        if (!plotIntention) {
            return false;
        }
        
        var relevantModes = {"timechart":1, "chart":1};
        if (!plotIntention["arg"].hasOwnProperty("mode") || !(plotIntention["arg"]["mode"] in relevantModes)) {
            return false;
        }
        if (plotIntention["arg"]["splitType"] != "single") {
            return false;
        }
        return true;
    },

    getPlotIntentionArg: function() {
        var selectedOption = $("select option:selected",this.container);
        var value = (this.__resurrectedFieldName )  ? this.__resurrectedFieldName : selectedOption.attr("value");
        if (!value) return false;
        return {splitby: value};
    },

    onBeforeJobDispatched: function(search) {
        search.setMinimumStatusBuckets(1);
        search.setRequiredFields(["*"]);
    },

    onJobProgress: function() {
        this.getResults();
    },

    getResultURL: function($super, params) {
        this.logger.info(this.moduleType, "getting field list.");
        params = params || {};
        params["top_count"] = 0;

        var qsDict = Splunk.util.queryStringToProp(document.location.search);
        var baseSID = qsDict["base_sid"];
        if (baseSID) {
            var search = Splunk.Search.resurrectFromSearchId(baseSID);
            return search.getUrl('summary', params);
        }
        this.logger.error("we are unable to determine a usable URL to retrieve the available fields");
    },

    renderResults: function(xml) {
        // we save the value that was selected, for later.
        var selectedVal = this._selectElement.val();
        this._selectElement.html('');
        var moduleInstance = this;
        $("<option/>")
            .text(_("( no split by )"))
            .attr("value", "")
            .appendTo(moduleInstance._selectElement);
       
        $(xml).find("summary").find("field").each(function() {
            var fieldName = $(this).attr('k');
            var optionText = [fieldName];
            var isNumeric = $(this).find("mean").length > 0;
            if (isNumeric) {
                optionText.push(" (n)");
            }
            //optionText.push("  - (" + $(this).attr('dc')+ ")");

            $("<option/>")
                .text(optionText.join(""))
                .attr("value", fieldName)
                .attr("s:isnumeric", isNumeric)
                .appendTo(moduleInstance._selectElement);
        });
        // setting the previous selectedVal.  Not ideal, because there's some
        // interaction warts.
        // one weirdness:  mouseovers actually change what jquery gets back from
        // val(), even though onchange wasnt actually fired..  Very odd.
        if (this.__resurrectedFieldName) {
            this._selectElement.val(this.__resurrectedFieldName);
            if (this._selectElement.val() == this.__resurrectedFieldName) {
                this.__resurrectedFieldName = null;
            } else {
                this.logger.warn("could not find our field to resurrect ", this.__resurrectedFieldName, " but maybe this job is still running and the field hasnt turned up yet. Punting to advanced mode.");
                this.puntToAdvancedMode(_("Splunk could not find the selected split-by field in the underlying job."));
            }
        }
        else if (selectedVal) {
            this._selectElement.val(selectedVal);
        }
        
        // see overridden hide() method for an explanation of this nonsense.  yes, I overrode hide().
        if ( $.browser.msie && $.browser.version == '6.0' ) {
            this.showIfCompatible();   
        }
    },

    absorbPlotIntentionArg: function(intentionArg) {
        
        if (intentionArg.hasOwnProperty("splitby")) {
            this.__resurrectedFieldName = intentionArg["splitby"];
            delete intentionArg["splitby"];
            this.show();
            return true;
        } else {
            this.hide();
            return false;
        }
    },

    applyContext: function($super, context) {
        var search = context.get("search");
        // see comment in single_field_chooser.js
        // we dont know whether we'll end up being relevant, so we hide ourselves and 
        // if we end up being relevant, absorbPlotIntentionArg will end up showing us again.
        this._baseSID = search.job.getSearchId();
        
        // order is important.  The unit testing for this makes the getResults call synchronous
        // so for the coverage to be meaningful it has to happen after the main applyContext logic has happened.
        var retVal = $super(context);

        this.getResults();
        return retVal;
    },

    show: function($super) {
        $super();
        
        if ( $.browser.msie && $.browser.version == '6.0' ) {
            $(this.container).find('select').show(); 
        } 
    },

    hide: function($super) {
        $super();
        
        /* welcome to the nonsense.  IE6, because it can, decides to reshow our select elements when their contents 
         * are changed, even though they're within a hidden element.  so this part basically just jolts them back into hidden
         * status so they don't appear scattered across the page.  oh, and just .hide() doesn't work, you have to completely flip
         * the bits.  
         */
        if ( $.browser.msie && $.browser.version == '6.0' ) {
            $(this.container).find('select').show().hide(); 
        }
    }
});
