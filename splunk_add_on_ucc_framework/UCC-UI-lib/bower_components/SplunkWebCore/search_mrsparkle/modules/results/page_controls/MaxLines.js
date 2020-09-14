
Splunk.Module.MaxLines = $.klass(Splunk.Module.DispatchingModule, {

    // defines the parameter key both for
    // a) persisting the maxLines param to the persistence layer, and
    // b) in the context to communicate with other modules downstream.
    CONTEXT_KEY: 'maxLines',
    CONTEXT_NAMESPACE: 'results',
    PARAM_KEY: 'default',

    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        this.logger = Splunk.Logger.getLogger("MaxLines.js");
        this.select = $("select[name='maxLines']", this.container);

        // provide a fallback for unit tests.
        if (this.select.length==0) {
            this.select = $("<select/>").appendTo(this.container);
        }

        // attach handlers
        this.select.bind("change", this.handleSelectChange.bind(this));
    },

    ///////////////////////////////////////////////////////////////////////////
    // subclassed methods
    ///////////////////////////////////////////////////////////////////////////

    getModifiedContext: function() {
        var context = this.getContext();
        var namespacedKey = this.CONTEXT_NAMESPACE + "." + this.CONTEXT_KEY;
        context.set(namespacedKey, this.getSelectedMaxLines());
        return context;
    },


    ///////////////////////////////////////////////////////////////////////////
    //  Internal methods
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Returns selected option value casted as a number.
     */
    getSelectedMaxLines: function() {
        var val = this.getParam(this.PARAM_KEY);
        if (!val) {
            this.setParam(this.PARAM_KEY, this.select.val(), true);
        }
        val = parseInt(this.getParam(this.PARAM_KEY), 10);
        if (isNaN(val) || val < 0) {
            this.logger.error('getSelectedMaxLines - Invalid max lines value; defaulting to 10');
            return 10;
        }
        return val;
    },


    /**
     * Handles user selection change on the max lines selector
     */
    handleSelectChange: function(evt) {
        this.setParam(this.PARAM_KEY, this.select.val());
        this.logger.debug('handleSelectChange - changing maxLines=' + this.getParam(this.PARAM_KEY));
        this.pushContextToChildren();
    }

});