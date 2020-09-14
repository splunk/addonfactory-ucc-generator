
Splunk.Module.ManagerBar = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);
        // TODO this may be overly aggressive but its better to do it sooner rather than later. 
        this.childEnforcement  = Splunk.Module.NEVER_ALLOW;
        this.parentEnforcement = Splunk.Module.NEVER_ALLOW;
    }
});

