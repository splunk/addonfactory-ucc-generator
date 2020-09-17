
Splunk.Module.HiddenIntention = $.klass(Splunk.Module, {

    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        
        this.logger = Splunk.Logger.getLogger("hidden_intention.js");
        this.messenger = Splunk.Messenger.System.getInstance();
        this.hide(this.HIDDEN_MODULE_KEY);
    },

    getModifiedContext: function() {
        var context = this.getContext();
        var search  = context.get("search");
        search.abandonJob();
        search.addIntention(this._params["intention"]);
        if (this._params["earliest"] || this._params["latest"]) {
            var range = new Splunk.TimeRange(this._params["earliest"], this._params["latest"]);
            search.setTimeRange(range);
        }
        context.set("search", search);
        return context;
    },

    getIntentionArgKey: function() {
        var ourIntention = this._params["intention"];
        if (!ourIntention) return false;
        for (var key in ourIntention["arg"]) {
            if (ourIntention["arg"].hasOwnProperty(key))  return key;
        }
        return false;
    },

    /**
     * Returns Boolean indicating whether or not the given intention object
     * precisely matches the intention this module is configured to insert.
     */
    _doesIntentionMatch: function(intention) {
        var ourIntention = this._params["intention"];
        if (ourIntention["name"] != intention["name"]) {
            return false;
        }
        var ourIntentionArgKey = this.getIntentionArgKey();
        var ourIntentionArgValue = intention["arg"][ourIntentionArgKey];
       
        if (ourIntentionArgKey) {
            if (intention["arg"].hasOwnProperty(ourIntentionArgKey)) {
                var retVal = (intention["arg"][ourIntentionArgKey] == ourIntentionArgValue);
                if (!retVal) {
                    this.logger.error(intention["arg"][ourIntentionArgKey], "doesnt match", ourIntentionArgValue);
                }
                return retVal;
            }
            return false;
        }
        return (intention["arg"] == ourIntention["arg"]);
    },

    applyContext: function(context) {
        if (this.isPageLoadComplete()) return false;
        
        var search = context.get("search");
        if (this._params.hasOwnProperty("intention")) {
            var intentionArgKey = this.getIntentionArgKey();
            var intention = search.popIntention(this._params["intention"]["name"], intentionArgKey);
            // if we popped the intention off, we push our modified search back in.
            if (intention) {
                context.set("search", search);
            }
            
        }
    }
});
