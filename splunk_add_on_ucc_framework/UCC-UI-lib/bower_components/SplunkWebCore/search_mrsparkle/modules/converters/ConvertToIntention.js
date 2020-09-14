Splunk.Module.ConvertToIntention = $.klass(Splunk.Module, {
    
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement  = Splunk.Module.ALWAYS_REQUIRE;
        this.parentEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        this._legacyIntentionReplace = /\$target\$/;
        
        if (this.getParam('settingToConvert')) {
            this._matches = [];
        } else {
            this._matches = Splunk.util.discoverReplacementTokens(this.getParam('intention'));
        }
        this.hide(this.HIDDEN_MODULE_KEY);
    },
    
    

    getModifiedContext: function() {
        var context = this.getContext();
        var legacyTarget = this.getParam('settingToConvert');
        var intention = $.extend(true, {}, this.getParam('intention'));
        var search = context.get("search");
        if (legacyTarget) {
            var setting = context.get(legacyTarget);
            if (!setting) setting = "";
            intention = Splunk.util.replaceTokens(intention, this._legacyIntentionReplace, setting);
        } else {
            for (var i=0; i<this._matches.length; i++) {
                var key = this._matches[i];
                var replacer = new RegExp("\\$" + key + "\\$");
                intention = Splunk.util.replaceTokens(intention, replacer, context.get(key));
            }
        }
        search.addIntention(intention);
        context.set("search", search);
        return context;
    }
});
