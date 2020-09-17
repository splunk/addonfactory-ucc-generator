Splunk.namespace("Module");

Splunk.Module.YAxisRangeMinimumFormatter = $.klass(Splunk.Module.BaseChartFormatter, {
   
    initialize: function($super, container){
        $super(container);
   
        this.logger = Splunk.Logger.getLogger("secondary_axis_range_minimum_formatter.js");
       
        this._formElement = $("input",this.container)
            .bind("change", this.handleInputChange.bind(this));
       
        this._contextKey = "charting.secondaryAxis.minimumNumber";
    },
    /*
     * Minimum secondary axis number is available for area, line, bar, column, scatter
     * keep in mind the x and y axis switch when going to bar...
     * TODO, figure out how to deal with this switching.
    */
    isCompatibleWithContext: function() {
        var context = this.getContext();
        var relevantChartTypes = {"area":1, "line":1, "bar":1, "column":1, "scatter":1};
        return relevantChartTypes.hasOwnProperty(context.get("charting.chart"));
    }
});