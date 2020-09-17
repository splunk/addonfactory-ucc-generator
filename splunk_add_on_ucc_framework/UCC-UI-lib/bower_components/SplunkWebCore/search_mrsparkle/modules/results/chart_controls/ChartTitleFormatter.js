Splunk.namespace("Module");

Splunk.Module.ChartTitleFormatter = $.klass(Splunk.Module.BaseChartFormatter, {
   
    initialize: function($super, container){
        $super(container);
   
        this.logger = Splunk.Logger.getLogger("chart_title_formatter.js");
       
        this._formElement = $("input",this.container)
            .bind("change", this.handleInputChange.bind(this));
   
        this._contextKey = "charting.chartTitle";
   
    },
    /**
     * 'sticky' persistence implementation is not compatible 
     * with how certain modules pick up data-driven defaults.  
     * (by a lucky coincidence the sticky persistence is not even really useful for these modules, so im 
     * pre-emptively short-circuiting it by overriding getModifiedContext
     */
    getModifiedContext: function(){
        var context = this.getContext();
        context.set(this._contextKey, this._formElement.val());
        return context;
    }
});