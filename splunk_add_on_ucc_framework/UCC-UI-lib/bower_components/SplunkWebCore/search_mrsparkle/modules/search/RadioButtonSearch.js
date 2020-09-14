//put Module in the namespace if it isnt already there.
Splunk.namespace("Module.FieldSearch");

/* The RadioButtonSearchField provides a radio button on/off interface search field.  Changing
 * the value from on/off submits the search.  Values for the two states are passed from config.   
 */
Splunk.Module.RadioButtonSearch = $.klass(Splunk.Module.FieldSearch, {

    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        this.searchForm = $('form', this.container);
        this.searchForm.submit(this._onFormSubmit.bind(this));
        this._radioFields = $("input[type='radio']", this.container)
            .bind("change", this._onChange.bind(this));

        this._field = this._params['field'] || false;
    },
    _onChange: function(evt) {
        evt.preventDefault();
        this._onFormSubmit();
        return false;
    },
    /*
     * NOTE: this implementation returns a string when an arg exits, but sometimes
     * intention args can be dicts --  ie. {someField:someValue}.
     */
    getIntentionArg: function() {
        var searchTerm = $('input:radio', this.container).filter(':checked').attr('value');

        if (this._field) {
               var arg = {};
            arg[this._field] = searchTerm || "*";
            searchTerm = arg;
        }
        return searchTerm || false;
    },
    clearInputField: function() {
        var nullRadio = $("input[value='']", this.container);
        if (nullRadio.length > 0) {
            nullRadio.attr("checked","checked");
            return true;
        }
        return false;
    },
    applyContext: function(context) {
        var priorArgument = this.getIntentionArg();
        var wasCleared = false;
        if (!this.isPageLoadComplete()) {
            wasCleared = this.clearInputField();
        }
                   
        // TODO - i dont think we have anything pulling from literals.conf yet?
        var FAILED_RESURRECTION_MESSAGE = sprintf(_("%(moduleType)s instance was unable to find its search parameters in this search. This means this view cannot correctly display this search."), {moduleType: this.moduleType});

        var search = context.get("search");
        var positiveMatch = false;
        if (this._field) {
            var intention = search.popIntention('addterm', this._field);
            // if this is a key==value intention, and the key matches.
            if (intention && intention["arg"].hasOwnProperty(this._field)) {
                var intentionArgValue = intention["arg"][this._field];
                this._radioFields.each(function(i) {
                    if (intentionArgValue == $(this).attr("value")) {
                        $(this).attr("checked","checked");
                        positiveMatch = true;
                        return false;
                    }
                });
            }
        } else {
            this._radioFields.each(function(i) {
                if (this.isPageLoadComplete() && !$(this).attr('value')) return;
                var matchingIntention = search.popIntention('addterm', $(this).attr('value'));
                if (matchingIntention) {
                    $(this).attr("checked","checked");
                    positiveMatch = true;
                    // NOTE - not actually a return. Since we're in an each()
                    // this is more of a break;
                    return false;
                }
            });
        }
        if (positiveMatch) {
            // we matched, so commit changes.
            context.set("search", search);
        }
        if (!this.isPageLoadComplete()) {
            if (!wasCleared && !positiveMatch) {
                throw FAILED_RESURRECTION_MESSAGE + '' + _("Splunk was also unable to find an '' value input to select.");
            }
        } else if (priorArgument != this.getIntentionArg()) {
            this.pushContextToChildren();
            // return true to stop the context from propagating upward any further.
            return true;
        }
    }
});
