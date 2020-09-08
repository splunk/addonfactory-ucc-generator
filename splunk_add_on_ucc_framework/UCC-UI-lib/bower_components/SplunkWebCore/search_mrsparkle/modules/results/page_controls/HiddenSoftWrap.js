Splunk.Module.HiddenSoftWrap = $.klass(Splunk.Module.DispatchingModule, {
    
    // defines the key used by the module settingsMap services
    CONTEXT_KEY: 'results.softWrap',

    // defines the module configuration key to persist the checkbox state
    CONF_KEY: 'enable',
    
    initialize: function($super, container){
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        this.enabled = this.getParam(this.CONF_KEY);
    },

    /**
     * Returns relevant information to downstream modules by modifying the .
     * context it received from upstream modules. 
     *
     * @type Context
     * @return a context object with relevant keys modified.
     */
    getModifiedContext: function() {
        var context = this.getContext();
        context.set(this.CONTEXT_KEY, this.enabled);
        return context;
    }
});
