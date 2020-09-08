Splunk.Module.SplitModeFormatter = $.klass(Splunk.Module.BaseChartFormatter, {
   
    initialize: function($super, container){
        $super(container);
   
        this.logger = Splunk.Logger.getLogger("SplitModeFormatter.js");
        this._contextKey = "charting.layout.splitSeries";
        
        // if the module is incompatible with the context or with the settings, it will 
        // return this value in addition to hiding itself.
        this._safeDefault = "false";
    },
    
    isCompatibleWithIntention: function(plotIntention) {
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
        
        var relevantChartTypes = {"area":1, "bar":1, "column":1, "line":1};
        return relevantChartTypes.hasOwnProperty(context.get("charting.chart"));
    }

});