
Splunk.Module.SavedSearches = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);
        this.getResults();
    }
});