//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.ViewRedirector = $.klass(Splunk.Module, {
    
    // define standard set of window.open() options
    DEFAULT_WINDOW_FEATURES : "status=1,toolbar=1,location=1,menubar=1,resizable=1,scrollbars=1,directories=1",
    
    // define the *.conf [param] name prefix used to pass additional params
    URI_PARAM_PREFIX: 'uriParam.',
    
    initialize: function($super, container){
        $super(container);
        this.childEnforcement  = Splunk.Module.NEVER_ALLOW;
        this.parentEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        // kinda weird, but it can be "True", or "False", or any other string. 
        // if it's a random string we basically will pass it straight through to window.open.
        // Goal was to not have more than one config param, and avoid config params that are only applicable if 
        // other config params have certain values..
        this.popupWindowFeatures = this.DEFAULT_WINDOW_FEATURES;
        try {
            this.defaultToPopup = Splunk.util.normalizeBoolean(this._params["popup"], true);
        } catch(e) {
            this.defaultToPopup = true;
            this.popupWindowFeatures = this._params["popup"];
        }
        this.hide(this.HIDDEN_MODULE_KEY);
    },
    
    addChild: function($super, child) {
        this.logger.error(this.moduleType, 'module is configured with a child module. There is no reason to do this and so it is probably a mistake.');
        return $super(child);
    },
    
    /*
     * The most natural way to do this is to override onContextChange.
     * However that wouldnt prevent the module's descendants from getting
     * updates, and dispatching searches while the user is leaving the page.
     * Therefore, instead of pushing to children, we redirect the user
     * to the specified view.
     */
    pushContextToChildren: function($super, explicitContext) {
        var context = explicitContext || this.getContext();
        // we open in a popup window, if the click context says modifier key was held down at the time
        // or if we're configured to always popup.
        var openInPopup = context.get("click.modifierKey") || this.defaultToPopup;
        
        var search  = context.get("search");

        if (!this.isPageLoadComplete()) {
            this.logger.debug(this.moduleType + " - initial page load detected. Not redirecting");
            return false;
        }
        var args = {};
        var qsDict = Splunk.util.queryStringToProp(document.location.search);
            
        if (Splunk.util.normalizeBoolean(this._params["sendBaseSID"])) {
            // second time through we'll have a base_sid which is the event search
            // and the regular sid, which we resurrected the modules from.
            if (qsDict.hasOwnProperty("base_sid")) {
                args["base_sid"] = qsDict["base_sid"];
            }
            else if (qsDict.hasOwnProperty("sid")) {
                args["base_sid"] = qsDict["sid"];
            }
            // first time through we use the regular sid we linked in on.
            else if (search.isJobDispatched()) {
                args["base_sid"] = context.job.getSearchId();
            } else {
                this.logger.error(this.moduleType, " is configured to send the underlying sid, but its context hasnt been dispatched and there are no sids in the URL");
            }
        }
        if (search.getViewStateId()) {
            args["vs"] = search.getViewStateId();
        }
        
        // apply any wildcarded parameters specified in the view XML via the
        // uriParam.* param
        for (var key in this._params) {
            if (this._params.hasOwnProperty(key)) {
                if (key.length > this.URI_PARAM_PREFIX.length 
                    && key.indexOf(this.URI_PARAM_PREFIX) == 0) {
                    args[key.substring(this.URI_PARAM_PREFIX.length)] = this._params[key];
                }
            }
        }
        
        this.sendToView(args, openInPopup);
    },

    /**
     * largely delegates to Search.sendToView(). 
     * however we also pass through relevant parameters from the module config.
     */
    sendToView: function(additionalArgs, openInPopup) {
        var context = this.getContext();
        var search  = context.get("search");
        var options = {};
        options["windowFeatures"] = this.popupWindowFeatures;
        search.sendToView(this._params["viewTarget"], additionalArgs, Splunk.util.normalizeBoolean(this._params["dispatchBeforeRedirect"]), openInPopup, options);
    }
});