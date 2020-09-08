Splunk.Module.AddTotals = $.klass(Splunk.Module.DispatchingModule, {
    
        // defines the module configuration key to persist the checkbox state
        CONF_KEY: 'enable',

        initialize: function($super, container){
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        this.logger = Splunk.Logger.getLogger("AddTotals.js");
        this.checkbox = $("input[name='enable']", this.container);
        this.checkbox.bind("click", this.onEnableTotalsChange.bind(this));
    },
    /**
     * Triggered when a user changes the status of the enable preview checkbox.
     */
    onEnableTotalsChange: function(evt){
        this.pushContextToChildren();
    },
    
    /**
     * add our change for modules downstream. 
     */
    getModifiedContext: function() {
        var context = this.getContext();
        var search  = context.get("search");
        
        if (this.isChecked()) {
            search.setPostProcess("addtotals col=t");
            context.set("search", search);
        }

        return context;
    },
   
    /**
     * Returns if the word wrap checkbox has been selected or not.
     */
    isChecked: function() {
        return Splunk.util.normalizeBoolean(this.checkbox.prop('checked'));
    }
});
