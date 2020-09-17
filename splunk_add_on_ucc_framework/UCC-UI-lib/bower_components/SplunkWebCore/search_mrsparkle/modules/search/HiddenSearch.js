
Splunk.Module.HiddenSearch = $.klass(Splunk.Module, {

    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        
        this.logger = Splunk.Logger.getLogger("hidden_search.js");
        this.messenger = Splunk.Messenger.System.getInstance();
        this.hide(this.HIDDEN_MODULE_KEY);
        this.sid = null;
        var hashParams = Splunk.util.queryStringToProp(Splunk.util.getHash());
        var meta = this.container.closest('.dashboardCell').find('.paneledit').attr("data-sequence");
        var key = 'panel_' + meta + '.sid';
        if (meta && hashParams.hasOwnProperty(key)) {
            this.sid = hashParams[key];
            this.logger.info('Soft refresh; reuse job sid', this.sid);
            delete hashParams[key];
            window.location.hash = Splunk.util.propToQueryString(hashParams);
        }
    },

    /**
     * Passes a Context object to its children where the search instance 
     * has been modified. Specifically the search string will be changed 
     * to match the string defined in the view configuration.
     */   
    getModifiedContext: function() {
        var context = this.getContext();
        var search  = context.get("search");
        
        search.abandonJob();

        if (this.sid) {
            search.job = Splunk.Globals.Jobber.buildJob(this.sid);
            context.set("search", search);
            return context;
        }
        
        if (this._params.hasOwnProperty('search')) {
            search.setBaseSearch(this._params['search']);
        }
        if (this._params["earliest"] || this._params["latest"]) {
            var range = new Splunk.TimeRange(this._params["earliest"], this._params["latest"]);
            search.setTimeRange(range);
        }
        if (this._params.hasOwnProperty("maxCount")) {
            search.setMaxCount(this._params["maxCount"]);
        }
        if (this._params.hasOwnProperty("maxEvents")) {
            search.setMaxEvents(this._params["maxEvents"]);
        }
	//if (this._params.hasOwnProperty("reuseMaxSecondsAgo")) {
	//search.setReuseMaxSecondsAgo(this._params["reuseMaxSecondsAgo"]);
	//}

        context.set("search", search);
        return context;
    }
});
