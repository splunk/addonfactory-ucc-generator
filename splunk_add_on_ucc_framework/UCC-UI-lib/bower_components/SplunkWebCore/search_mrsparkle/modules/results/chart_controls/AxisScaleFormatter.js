Splunk.namespace("Module");

Splunk.Module.AxisScaleFormatter = $.klass(Splunk.Module.BaseChartFormatter, {
   
    initialize: function($super, container){
        $super(container);
   
        this.logger = Splunk.Logger.getLogger("axis_scale_formatter.js");
        this._contextKey = "charting.secondaryAxis.scale";
        // if the module is incompatible with the context or with the settings, it will 
        // return this value in addition to hiding itself.
        this._safeDefault = "";
    },
    /*
     * If we are stacking things, we cannot use log scale. 
     * we dont actually *do* anything about it here. See BaseChartFormatter
     */
    isCompatibleWithContext: function() {
        var context = this.getContext();

        // first check chart types
        if (!context.has("charting.chart")) return true;
        var incompatibleChartTypes = {
            'radialGauge':1,
            'fillerGauge':1,
            'markerGauge':1,
            'pie':1,
            'ratioBar':1
        };
        if (incompatibleChartTypes.hasOwnProperty(context.get('charting.chart'))) {
            return false;
        }

        // then check for stack specification
        if (!context.has("charting.chart.stackMode")) return true;
        var value = context.get("charting.chart.stackMode");
        if (value == "stacked" || value == "stacked100") {
            return false;
        } else {
            return true;
        }   
    }
});
