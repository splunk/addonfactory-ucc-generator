Splunk.namespace("Module");

Splunk.Module.NullValueFormatter = $.klass(Splunk.Module.BaseChartFormatter, {
   
    initialize: function($super, container){
        $super(container);
   
        this.logger = Splunk.Logger.getLogger("null_value_formatter.js");
        this._contextKey = "charting.chart.nullValueMode";   
    },
    /*
     * If we are stacking things, we cannot use log scale.
     */
    isCompatibleWithContext: function() {
        var context = this.getContext();
        if (!context.has("charting.chart")) return true;
       
        var relevantChartTypes = {"area":1, "line":1};
        return relevantChartTypes.hasOwnProperty(context.get("charting.chart"));
    }
});