
//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

/* The FieldSearch provides a simple input field.
 * Typically collections of FieldSearchs and other small classes
 * will be used to provide an interface much like the old "FormSearch"
 */
Splunk.Module.FieldSearch = $.klass(Splunk.Module, {
   
    // TODO  given our new namespacing, im not sure where these old global
    // constants should live.
    keys: {
        ENTER : 13,
        UP_ARROW: 38,
        DOWN_ARROW: 40,
        LEFT_ARROW: 37,
        RIGHT_ARROW: 39,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        SPACE_BAR: 32,
        TAB: 9,
        ESCAPE: 27
    },
    
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        
       
        this.logger = Splunk.Logger.getLogger("FieldSearch.js");
        
        this.searchForm = $('form', this.container);
        this.input = $('input', this.container);
        this.fieldName = this.input.attr('name');
        
        if (!this.fieldName) {
            this.logger.warn(this.moduleType, "Warning - there's no fieldName. using FIELD_NAME_UNSET" );
            this.fieldName = "FIELD_NAME_UNSET";
        }
        
        this.bindEventListeners();
    },


    /**
     * Attaches UI event listeners to standard handlers.  Keep this as a separate
     * method to facilitate subclassing
     */
    bindEventListeners: function() {
        this.searchForm.submit(this._onFormSubmit.bind(this));
        this.input.bind("keydown", this._onKeyDown.bind(this));
    },
    
    
    /*
     * One of the basic methods that FieldSearch adds to the world.
     * this way child classes dont have to override getModifiedContext,
     * they can just override getIntentionArg.
     * NOTE: if you're in a sort of 'null' selection state, and trying to make
     * no changes to the job, make sure to return false, or else you may force
     * jobs to be dispatched unnecessarily.
     * NOTE: this implementation returns a dict, but intention args are sometimes just strings.
     */
    getIntentionArg: function() {
        var fieldValue = this.input.attr('value');
        if (!fieldValue) return false;
        var argumentDict = {};
        argumentDict[this.fieldName] = fieldValue;
        return argumentDict;
    },
    applyContext: function(context) {
        var search = context.get("search");
        this.logger.debug(this.moduleType ,".applyContext received ", search);
        if (!this.isPageLoadComplete()) {
            this.clearInputField();
        }
        var intention = search.popIntention('addterm', this.fieldName);
        if (intention){
            //we popped off an intention so we have to commit our change to the context.
            context.set("search", search);

            this.logger.debug(this.moduleType ,".applyContext has matched an intention and is removing it from context.");
            var fieldValue = intention["arg"][this.fieldName];
            if (this.input.attr('value') == fieldValue) {
                this.setInputField('');
            // otherwise add this value to our field.
            } else {
                this.setInputField(fieldValue);
            }
            if (this.isPageLoadComplete()) {
                this.pushContextToChildren();
                // return true to stop the context from propagating upward any further.
                return true;
            }
        }
        return false;
    },
    getModifiedContext: function() {
        var context = this.getContext();
        var argumentDict = this.getIntentionArg();
        if (argumentDict) {
            var search  = context.get("search");    
            search.abandonJob();
            search.addIntention({
                "name" : 'addterm',
                "arg" : argumentDict
            });
            context.set("search", search);
        }
        return context;
    },
    _onFormSubmit: function() {
        // freaky...  abusing setTimeout like this, beware that it will
        // call your function with random numbers as the first argument.
        // moral -- DONT PASS BOUND FUNCTIONS DIRECTLY to setTimeout.
        setTimeout(function(randomNumberOfDoom){this.pushContextToChildren();}.bind(this),0);
        return false;
    },
   
    setInputField: function(searchStr) {
        this.logger.debug(this.moduleType, ".setInputField old=", this.input.text(), "new=", searchStr);
        try {
            this.input.attr("value",searchStr);
        }
        catch(e) {
            this.input.text(searchStr);
        }
    },
    clearInputField: function() {
        try {
            this.input.attr("value",'');
        }
        catch(e) {
            this.input.text('');
        }
    },
    _onKeyDown: function(evt) {
        var keyCode  = evt.keyCode;
        if (keyCode == this.keys['ENTER']) {
            evt.preventDefault();
            this._onFormSubmit();
            return false;
        } else {
            for (var key in this.keys) {
                if (keyCode == this.keys[key]) return;
            }
            this.setChildContextFreshness(false);
        }
    }
});
