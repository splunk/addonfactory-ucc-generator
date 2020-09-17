
Splunk.Module.AdvancedModeToggle = $.klass(Splunk.Module, {


    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("advanced_mode_switcher.js");
        this.toggle = $('.advancedModeToggle', this.container)
            .click(function(event) {
                this.setAdvancedMode(!this.isAdvancedMode());
                this.pushContextToChildren();
            }.bind(this));
        this._titles = [_("Define report using search language"),_("Define report data through a form")];
        this.setAdvancedMode(false);
        this.messenger = Splunk.Messenger.System.getInstance();
        
        this._puntMessages = [];

        $(document).bind('incompatibleWithBasicMode', function(event, message) {
            this._puntMessages.push(message);
        }.bind(this));

    },

    setAdvancedMode: function(bool) {
        if (bool) {
            this.toggle.text(this._titles[1]);
        } else {
            this.toggle.text(this._titles[0]);
        }

        // in report builder views, the GenericHeader modules need to be hidden in advanced mode. 
        // there's three ways i can see and the other two are evil and/or dumb. 
        // evil way:  hardcode resultsHeader to look for 'reporting.advancedMode' in the settings map.
        // dumb way: make a generic way of having modules hide themselves 
        // if they see a specified setting with a specified value. 
        // sounds like a good idea but you'd almost never want to just 'hide'.
        // instead you'd want to "hide and disable", or "hide and set yourself to a 
        // null value" if you follow....
        // which all requires more thinking and is more similar to BaseChartFormatter.isCompatibleWithContext()
        // than anything else.   
        // at any rate a generic solution demands more care and more thought.
        var descendants = this.getDescendants();
        for (var i=0, len=descendants.length; i<len; i++) {
            if (descendants[i].moduleType == "Splunk.Module.GenericHeader") {
                var visibilityClass = "advancedModeHidesHeaders";
                if (bool) descendants[i].hide(visibilityClass);
                else descendants[i].show(visibilityClass);
            }
        }
    },

    isAdvancedMode: function() {
        return (this.toggle.text() == this._titles[1]);
    },

    getModifiedContext: function() {
        var context = this.getContext();
        var advancedModeCallback = function() {
            this.setAdvancedMode(true);
            this.setLoadState(Splunk.util.moduleLoadStates.HAS_CONTEXT);
            
            this.pushContextToChildren();
        }.bind(this);

        context.set("reporting.advancedMode", this.isAdvancedMode());
        context.set("reporting.advancedModeCallback", advancedModeCallback);
        return context;
    }, 

    applyContext: function($super, context) {
        if (this._puntMessages.length > 0) {
            this.setAdvancedMode(true);
            this.pushContextToChildren();
            this._smokingGun = false;

            message = _("This search can only be loaded in the advanced mode.");
            if (this._puntMessages.length > 0) {
                var detailMessage = this._puntMessages[this._puntMessages.length-1];
                if (detailMessage) message += " " + detailMessage;
            }
            this.messenger.send('info', 'splunk.search', message);        
        }
    }
});
