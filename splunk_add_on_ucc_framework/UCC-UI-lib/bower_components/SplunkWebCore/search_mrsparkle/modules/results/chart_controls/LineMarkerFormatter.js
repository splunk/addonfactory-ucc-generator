Splunk.namespace("Module");

Splunk.Module.LineMarkerFormatter = $.klass(Splunk.Module.BaseChartFormatter, {
   
    initialize: function($super, container){
        $super(container);
   
        this.logger = Splunk.Logger.getLogger("line_marker_formatter.js");
        this._contextKey = "charting.chart.showMarkers";
    },
    /*
     * Line markers are only available for line charts.
     * don't display the element for anything else.
    */
    isCompatibleWithContext: function() {
        var context = this.getContext();

        var relevantChartTypes = {"line":1};
        return relevantChartTypes.hasOwnProperty(context.get("charting.chart"));
    }
});
