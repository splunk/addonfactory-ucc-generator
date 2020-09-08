
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.HiddenChartFormatter = $.klass(Splunk.Module, {
    SETTING_PREFIX: 'charting.',   
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("HiddenChartFormatter.js");
        this.hide(this.HIDDEN_MODULE_KEY);
    },
       
    getModifiedContext: function() {
        var context = this.getContext();
        for (var paramName in this._params) {

            if (this._params.hasOwnProperty(paramName)) {
                var name = (paramName.indexOf(this.SETTING_PREFIX) !=0) ? this.SETTING_PREFIX + paramName : paramName;
                context.set(name, this._params[paramName]);
            }
        }
        return context;
    }
});
