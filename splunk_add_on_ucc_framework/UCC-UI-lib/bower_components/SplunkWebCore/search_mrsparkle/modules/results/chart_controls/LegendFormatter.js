Splunk.namespace("Module");

Splunk.Module.LegendFormatter = $.klass(Splunk.Module.BaseChartFormatter, {
   
    initialize: function($super, container){
        $super(container);
   
        this.logger = Splunk.Logger.getLogger("legend_formatter.js");
        this._contextKey = "charting.legend.placement";
    },  

    /**
     * disable for gauges and pie charts
     */
    isCompatibleWithContext: function() {
        var context = this.getContext();
        if (!context.has("charting.chart")) return true;
        
        var incompatibleChartTypes = {
            'radialGauge':1,
            'fillerGauge':1,
            'markerGauge':1,
            'pie':1
        };
        return !incompatibleChartTypes.hasOwnProperty(context.get('charting.chart'));
    }
    
});
