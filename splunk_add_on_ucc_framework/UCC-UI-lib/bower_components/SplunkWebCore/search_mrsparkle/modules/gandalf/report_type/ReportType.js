
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.ReportType = $.klass(Splunk.Module.BaseReportBuilderField, {
   
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("report_type.js");
        this._selectElement.val('');
    },
    onUIChange: function(event) {
        this.abandonViewState = true;
        this.pushContextToChildren();
    },
    getPlotIntentionArg: function() {
        var selectedOption = $("select option:selected",this.container);
        var plotArgs = {};
        var modeValue = this._selectElement.val();
        this.lazyAdd(modeValue,"mode", plotArgs);
        if (modeValue in {"top" : 1, "rare" : 1}) {
            this.lazyAdd("1000","limit", plotArgs);
        }
        return plotArgs;
    },
    absorbPlotIntentionArg: function(intentionArg) {
        if (intentionArg.hasOwnProperty("mode")) {
            this._selectElement.val(intentionArg["mode"]);
            if (this._selectElement.val() == intentionArg["mode"]) {
                if (intentionArg.hasOwnProperty("splitbyfields")) {
                    this.logger.warn("This is a 'top' search but we cannot deal with 'splitbyfields' so we bail.");
                    this.puntToAdvancedMode();
                }
                delete intentionArg["mode"];
                if (intentionArg.hasOwnProperty("limit")) {
                    // TODO - we have nowhere to resurrect this to so it gets thrown away.
                    delete intentionArg["limit"];
                }
                return true;
            }
            else {
                this.logger.error("we received a mode value that we are unable to resurrect - ", intentionArg["mode"], ". Punting to advanced mode.");
                this.puntToAdvancedMode();
            }
        }
        return false;
    },
    getModifiedContext: function() {
        var argumentDict = this.getPlotIntentionArg();
        // the fact that we preserve the jobInstance is a little unusual.
        // typically modules that know they are modifying the search within their 
        // context, will bleach away the Job information.   
        // However for BaseReportBuilderField
        // instances, it is very helpful to pass along the preexisting job, as
        // so downstream modules can obtain the field list and other information
        // about the 'dataset'.
        var context = this.getContext();
        var search  = context.get("search");
        if (this.abandonViewState) {
            search.setViewStateId(null);
        }
        
        var plotIntention = search.getIntentionReference("plot");
        // make one if there isnt one.
        if (!plotIntention) {
            if (this._selectElement.val()) {
                plotIntention = {"name":"plot","arg":{}};
                search.addIntention(plotIntention);
            // pulldown is currently set to a null value like 'choose'
            } else {
                return context;
            }
        }               
        if (argumentDict) {
            for (var key in argumentDict) {
                if (plotIntention["arg"].hasOwnProperty(key)) {
                    this.logger.error(this.moduleType, "plot intention already has a value for " , key);
                    if (this.getFieldType) {
                        this.logger.error(this.moduleType, this.getFieldType(), " plot intention already has a value for " , key);
                    }
                }
                plotIntention["arg"][key] = argumentDict[key];
            }
            context.set("search", search);
            return context;
        }
        
    },
    applyContext: function($super, context) {
        $super(context);
        var search = context.get("search");
        var plotIntention = search.getIntentionReference("plot");
        if (!plotIntention && search.job.areResultsTransformed()) {
            this.logger.warn("report type module detected a transforming search with no plot intention. Punting to advanced mode.");
            this.puntToAdvancedMode();
        } else if (search.decompositionFailed) {
            this.logger.warn(this.moduleType, " decomposition failed and we have no intentions. Punting to advanced mode.");
            this.puntToAdvancedMode();
        }
        else {
            if (context.get("reporting.advancedMode")) {
                this.hide();
            } else {
                this.show();
            }
        }
    }
});
