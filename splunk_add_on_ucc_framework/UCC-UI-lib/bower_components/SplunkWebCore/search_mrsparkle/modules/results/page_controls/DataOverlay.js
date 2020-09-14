Splunk.Module.DataOverlay = $.klass(Splunk.Module.DispatchingModule, {
    PARAM_KEY: 'default',
    /**
     * Constructor.
     */
    initialize: function($super, container){
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        this.logger = Splunk.Logger.getLogger("Splunk.Module.DataOverlay");
        this.select = $("select[name='dataOverlayMode']", this.container);
        this.select.bind("change", this.handleSelectChange.bind(this));
    },
    /**
     * Returns shared settings for broadcasting.
     */
    getModifiedContext: function(){
        var context = this.getContext();
        context.set("results.dataOverlayMode",  this.getSelectedDataOverlayMode());
        return context;
    },
    /**
     * Returns selected option value.
     * 
     * @type String
     * @return The current dataOverlayMode sticky param value or selected value.
     */
    getSelectedDataOverlayMode: function(){
        var val = this.getParam(this.PARAM_KEY);
        if(!val){
            this.setParam(this.PARAM_KEY, this.select.val(), true);
        }
        return this.getParam(this.PARAM_KEY);
    },
    /**
     * Handle an onchange event for the select element.
     * 
     * @param {Object} evt The jQuery fired normalized event.
     */
    handleSelectChange: function(evt) {
        this.setParam(this.PARAM_KEY, this.select.val());
        this.pushContextToChildren();
    }
});