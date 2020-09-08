//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.ViewRedirectorLink = $.klass(Splunk.Module.ViewRedirector, {
    initialize: function($super, container){
        $super(container);
        
        $("a", this.container).click(function(event) {
            var popup = Splunk.util.normalizeBoolean(this._params["popup"]);
            this.sendToView({}, popup);
            return false;
        }.bind(this));
        // unless dispatchBeforeRedirect is set, there is no reason to show the module until 
        // we receive a context.
        if (!Splunk.util.normalizeBoolean(this._params["dispatchBeforeRedirect"])) {
            $("a", this.container).hide();
        }
        // its parent class ViewRedirector will have called hide.
        this.show(this.HIDDEN_MODULE_KEY);
    },
    /*
     * update the URL so that on right-click it will at least send them to the sid url.
     */
    onContextChange: function() {
        var context = this.getContext();
        var search  = context.get("search");
        
        var path = Splunk.util.make_url("/app/", Splunk.util.getCurrentApp(), this._params["viewTarget"]);
    
        var url = path + "?";
        if (search.isJobDispatched()) {
            var sid = search.job.getSearchId();
            url += $.param({"sid": sid});
        }
        $("a", this.container)
            .show()
            .attr("href", url);
    },
    /*
     * prevent the context from being pushed to child modules
     */
    pushContextToChildren: function($super, explicitContext) {
        return false;
    }
});
