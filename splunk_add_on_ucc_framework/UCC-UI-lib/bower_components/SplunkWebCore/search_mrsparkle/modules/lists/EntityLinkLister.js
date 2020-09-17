Splunk.Module.EntityLinkLister = $.klass(Splunk.Module.AbstractEntityLister, {

    initialize: function($super, container) {
        $super(container);
        this._lastClicked = null;
    },

    getListValue: function() {
        var val = this._lastClicked;
        this._lastClicked = null;
        return val;
    },

    onUserAction: function($super, event) {
        var val = $(event.target).attr('rel');
        if (val != null) this._lastClicked = val;
        event.preventDefault();
        $super(event);
    },

    renderResults: function(html) {
        $('ul', this.container).empty();
        $('ul', this.container).append(html);
        $('div.error', this.container).prependTo(this.container);
        $('ul li a', this.container).bind('click', this.onUserAction.bind(this));
        this.hasLoaded = true;
    }

});
