Splunk.Module.SearchLinkLister = $.klass(Splunk.Module.AbstractSearchLister, {

    initialize: function($super, container) {
        $super(container);
        this._lastClickedVal = null;
        this._lastClickedLabel = null;
        this._lastClickedKey = null;
    },

    getListValue: function() {
        var val = this._lastClickedVal;
        // TODO - commenting this out because it seems potentially harmful now 
        // that the UI can flush baseContexts and re-request... 
        // when this was here,  any second call to getListValue would return null. 
        //this._lastClicked = null;
        return val;
    },

    getTokenValues: function() {
        return { 
            'value': this._lastClickedVal,
            'key': this._lastClickedKey,
            'label': this._lastClickedLabel
        };
    },

    onUserAction: function($super, event) {
        var val = $(event.target).attr('rel');
        var key = $(event.target).attr('key');
        var label = $(event.target).text();
        if (val != null) this._lastClickedVal = val;
        if (key != null) this._lastClickedKey = key;
        if (label != null) this._lastClickedLabel = label;
        event.preventDefault();
        // we use the simonSays trick to make the framework's pushes NOT go through. 
        // but the user initiated pushes will always go through.
        this.pushContextToChildren(null, true);
        //$super();
    },

    renderResults: function(html) {
        $('ul', this.container).empty();
        $('ul', this.container).append(html);
        $('div.error', this.container).prependTo(this.container);
        $('ul li a', this.container).bind('click', this.onUserAction.bind(this));
    },
    pushContextToChildren: function($super, explicitContext, simonSays) {
        if (!this.isPageLoadComplete || simonSays) {
            $super(explicitContext);
        }
    }

});
