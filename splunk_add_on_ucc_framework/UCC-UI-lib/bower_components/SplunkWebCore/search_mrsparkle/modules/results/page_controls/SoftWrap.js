
Splunk.Module.SoftWrap = $.klass(Splunk.Module.DispatchingModule, {
    
    // defines the key used by the module settingsMap services
    CONTEXT_KEY: 'results.softWrap',

    // defines the module configuration key to persist the checkbox state
    CONF_KEY: 'enable',
    
    initialize: function($super, container){
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        
        this.logger = Splunk.Logger.getLogger("SoftWrap.js");
        this.checkbox = $("input[name='enable']", this.container);
        this.checkbox.bind("click", this.onSoftWrapChange.bind(this));
    },

    /**
     * Triggered when a user changes the status of the soft wrap checkbox.
     */
    onSoftWrapChange: function(evt){
        //make the checkbox checked/unchecked immediately before blocking operations.
        setTimeout(
            function(){
                this.setParam(this.CONF_KEY, this.isChecked());
                this.logger.info("onSoftWrapChange - isChecked=", this.getParam(this.CONF_KEY));
                this.pushContextToChildren();
            }.bind(this),
            0
        );
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
        context.set(this.CONTEXT_KEY, this.isChecked());
        return context;
    },
   
    /**
     * Returns if the word wrap checkbox has been selected or not.
     */
    isChecked: function() {
        return Splunk.util.normalizeBoolean(
            this.checkbox.prop('checked')
        );
    }
});
