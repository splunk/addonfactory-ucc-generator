Splunk.Module.HiddenPostProcess = $.klass(Splunk.Module.DispatchingModule, {
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        this.hide(this.HIDDEN_MODULE_KEY);
    },
    getModifiedContext: function() {
        var context = this.getContext();
        var search  = context.get("search");
        search.setPostProcess(this.getParam('search'));
        context.set("search", search);
        return context;
    }
});
