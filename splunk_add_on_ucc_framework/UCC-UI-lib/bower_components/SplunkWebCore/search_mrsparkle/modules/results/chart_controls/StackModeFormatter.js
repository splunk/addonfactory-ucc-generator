Splunk.namespace("Module");

Splunk.Module.StackModeFormatter = $.klass(Splunk.Module.BaseChartFormatter, {
   
    initialize: function($super, container){
        $super(container);
   
        this.logger = Splunk.Logger.getLogger("StackModeFormatter.js");
        this._contextKey = "charting.chart.stackMode";
        // if the module is incompatible with the context or with the settings, it will 
        // return this value in addition to hiding itself.
        this._safeDefault = "none";
    },
    
    isCompatibleWithIntention: function(plotIntention) {
        // decomposition will sometimes give us a 'userEntered' mode, in which case we dont 
        // make any assumptions as to whether stackMode is legal or illegal. 
        if (plotIntention["arg"]["mode"] == "userEntered") return true;
        
        // stackMode is only relevant in chart or timechart
        if (plotIntention["arg"]["mode"] != "chart" && plotIntention["arg"]["mode"] != "timechart") return false;

        // if a module has dictated that there should be no splitType, we obey.
        if (plotIntention["arg"]["splitType"] == "none") return false;

        return true;
    },

    /*
     * only area, bar and column can be stacked. 
     * For line charts it's very misleading
     * for scatter, pie charts it's nonsense.
     */
    isCompatibleWithContext: function() {
        var context = this.getContext();
        if (!context.has("charting.chart")) return true;
        
        var relevantChartTypes = {"area":1, "bar":1, "column":1};
        return relevantChartTypes.hasOwnProperty(context.get("charting.chart"));
    }

});