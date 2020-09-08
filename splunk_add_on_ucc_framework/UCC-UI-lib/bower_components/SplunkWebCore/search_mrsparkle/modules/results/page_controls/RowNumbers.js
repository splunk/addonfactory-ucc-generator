Splunk.Module.RowNumbers = $.klass(Splunk.Module.DispatchingModule, {
    PARAM_KEY: "default",
    /**
     * Constructor.
     */
    initialize: function($super, container){
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        this.logger = Splunk.Logger.getLogger("Splunk.Module.RowNumbers");
        this.checkbox = $("input[name='displayRowNumbers']", this.container);
        this.checkbox.bind("click", this.onRowNumbers.bind(this));
    },
    /**
     * Triggered when a user changes the status of the enable row numbers checkbox.
     * 
     * @param {Object} evt The jQuery fired normalized event.
     */
    onRowNumbers: function(evt){
        //make the checkbox checked/unchecked immediately before blocking operations.
        setTimeout(
            function(){
                this.setParam(this.PARAM_KEY, this.checkbox.prop("checked"));
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
    getModifiedContext: function(){
        var context = this.getContext();
        context.set("results.displayRowNumbers", this.isChecked());
        return context;
    },    
    /**
     * Returns if checkbox has been selected or not.
     * 
     * @type Boolean
     * @return Checked status.
     */
    isChecked: function(){
        if(this.getParam(this.PARAM_KEY)==null){
            this.setParam(this.PARAM_KEY, this.checkbox.prop("checked"));
        }
        return Splunk.util.normalizeBoolean(this.getParam(this.PARAM_KEY));
    }
});