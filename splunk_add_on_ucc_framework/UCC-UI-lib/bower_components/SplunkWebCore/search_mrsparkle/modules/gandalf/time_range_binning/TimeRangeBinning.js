
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.TimeRangeBinning = $.klass(Splunk.Module.BaseReportBuilderField, {
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("time_range_binning.js");
        this.mode = 'auto';
        this._inputElement = $("input[type=text]",this.container)
            .keyup(function(){this.pushContextToChildren();}.bind(this));
        this._fieldsetOuter = $(".trpFieldsetOuter", this.container);
        this._customOptions = $(".trpFieldsetInner", this.container);    
        this._toggleLink = $(".trbToggle", this.container)
            .click(function(){this.toggleTimeRangeBinning();}.bind(this));
        this._radioButtons = $('input[name="trbOptions"]', this.container)
            .click(function(evt){this.handleOptionChange(evt);}.bind(this));                        
    },
    getPlotIntentionArg: function() {
        var selectedOption = $("select option:selected",this.container);
        var plotArgs = {};
        var intVal = this._inputElement.attr("value");
        if (!Splunk.util.isInt(intVal) || this.mode == 'auto') return false; 
        var spanArg = intVal + this._selectElement.val();
        this.lazyAdd(spanArg,"span", plotArgs);
        return plotArgs;
    },
    absorbPlotIntentionArg: function(intentionArg) {
        if (intentionArg.hasOwnProperty("span")) {
            var intVal = parseInt(intentionArg["span"],10);
            var unitVal = intentionArg["span"].replace(intVal,"");
            this._inputElement.val(intVal);
            this._selectElement.val(unitVal);
            this.mode = 'custom';
            return true;
        } else {
            this.mode = 'auto';   
        }
        return (intentionArg["mode"] == "timechart");
        
    },
    isCompatibleWithIntention: function(plotIntention) {
        if (!plotIntention) return false;
        if (!plotIntention["arg"].hasOwnProperty("mode") || (plotIntention["arg"]["mode"] !="timechart")) {
            return false;
        }
        return true;
    },
    applyContext: function($super, context) {
        return $super(context);
        //this.show();
    },
    toggleTimeRangeBinning: function(){
        var $t = this._toggleLink;
        if ( $t.hasClass('trbOn') ) {
            $t.removeClass('trbOn');
            this._fieldsetOuter.hide();   
        } else {
            $t.addClass('trbOn');
            this._fieldsetOuter.show();
        }
        return false;
    },
    handleOptionChange: function(evt) {
        var t = evt.target;
        if ( $(t).is('#trbCustom') ){
            this._customOptions.show();
            this.mode = 'custom';
        } else {
            this._customOptions.hide();
            this.mode = 'auto';
        }
        this.pushContextToChildren();
    }
});
