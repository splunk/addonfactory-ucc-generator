
Splunk.Module.ReportBuilderSearchField = $.klass(Splunk.Module.BaseReportBuilderField, {


    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("report_builder_search_field.js");
        this.input = $('textarea', this.container)
            .keypress(function(uselessEvent) {this.pushContextToChildren();}.bind(this))
            .blur(function(uselessEvent) {this.pushContextToChildren();}.bind(this));
        this.setAdvancedMode(false);
        $(document).bind('incompatibleWithBasicMode', function(event, message) {
            this.logger.debug('got incompatibleWithBasicMode event, enabling text box; ' + message);
            this.setAdvancedMode(true);
            this.input.focus();
        }.bind(this));
    },

    setInputField: function(searchStr) {
        this.input.val(Splunk.util.stripLeadingSearchCommand(searchStr));
    },

    onParseFailure: function() {
        this.messenger.send('info', 'splunk.search', _("Splunk cannot construct a working search from your entry. Please try again."));
    },

    onContextChange: function() {
        var context = this.getContext();
        this.setAdvancedMode(context.get("reporting.advancedMode"));
        search = context.get("search");
        
        // we bounce this search off the parser get the current search string for our textarea. 
        search.absorbIntentions(this.setInputField.bind(this), this.onParseFailure.bind(this));
    },

    getModifiedContext: function() {
        var context = this.getContext();
        var search  = context.get("search");

        //if (!search) {
        //    // there's a transient fail here during resurrection. It seems to be immediately cleared by subsequent win, 
        //    // TODO - needs further investigation.
        //    this.logger.error("Assertion failed ", this.moduleType, ".getModifiedContext() called but module has null search. Exiting.");
        //    return false
        //}

        if (!this.input.prop("disabled")) {
            var inheritedTimeRange = search.getTimeRange();
            search  = new Splunk.Search(this.input.val(), inheritedTimeRange);
            context.set("search", search);
        }
        return context;
    },
    setAdvancedMode: function(bool) {
        if (bool) {
            this.input.removeAttr("disabled");
        } else {
            this.input.attr("disabled", "true");
        }
    },
    applyContext: function(context) {
        var search = context.get("search");
        // we might conceivably have upstream click interaction in a reporting view someday
        // so we dont rewrite our field for non-resurrected contexts.
        if (!this.isPageLoadComplete()) {
            this.setInputField(search.toString());
        }
    }
});

