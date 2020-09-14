Splunk.Module.Segmentation = $.klass(Splunk.Module.DispatchingModule, {
    PARAM_KEY : "default",
    initialize: function($super, container){
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        this.logger = Splunk.Logger.getLogger("Splunk.Module.Segmentation");
        this.select = $("select[name='segmentation']", this.container);
        this.select.bind("change", this.handleSelectChange.bind(this));
    },
    /**
     * Returns relevant information to downstream modules by modifying the .
     * context it received from upstream modules. 
     * 
     * @type Context
     * @return a context object with relevant keys modified.
     */
    /**
     * Returns shared settings for broadcasting.
     */
    getModifiedContext: function(){
        var context = this.getContext();
        context.set("results.segmentation", this.getSelectedSegmentation());
        return context;
    },
   /**
    * Returns selected option value casted as a number.
    */
   getSelectedSegmentation: function(){
       var val = this.getParam(this.PARAM_KEY);
       if(!val){
           this.setParam(this.PARAM_KEY, this.select.val(), true);
       }
       return this.getParam(this.PARAM_KEY);
   },
   /**
    * Handle select change.
    */
   handleSelectChange: function(evt) {
       this.setParam(this.PARAM_KEY, this.select.val());
       this.pushContextToChildren();
   }   
});