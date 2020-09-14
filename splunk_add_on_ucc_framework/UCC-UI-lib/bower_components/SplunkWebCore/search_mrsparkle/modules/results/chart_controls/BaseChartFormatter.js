Splunk.Module.BaseChartFormatter = $.klass(Splunk.Module, {

    initialize: function($super, container){
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;

        this.logger = Splunk.Logger.getLogger("BaseChartFormatter.js");

        this._formElement = $();


        // try to init the default <select> element
        var elements = $("select", this.container);
        if (elements.length > 0) {
            this._formElement = $(elements[0]);
            if (elements.length > 1) {
                logger.warn('initialize - ' + this.moduleType + ' has extraneous form elements');
            }

            this._formElement.bind('change', this.handleInputChange.bind(this));
        }
        this._contextKey = "SETTING_NAME_NOT_SET";
        this.PROPERTY_MANAGER_SPECIAL_CHARS= new Array("#", "@");

        // init the internal param map with the default value
        //this.setParam('default', this._formElement.val(), true);
        this.assertParamsMatchUI('initialize');
    },

    /**
     * makes the single context modification associated with this chart formatter module.
     * The actual key is defined in this._contextKey, but the persistence
     * param name for all ChartFormatters is 'default'.  This is an optional stanza
     * that can be added to the conf file and persisted.
     *
     */
    getModifiedContext: function() {
        var context = this.getContext();
        if (this.isCompatibleWithContext()) {
            var search  = context.get("search");
            var plotIntention = search.popIntention("plot");
            // if theres no plot intention at all, we assume the app developer
            // knows what they're doing and we let the control be visible.
            if (!plotIntention || this.isCompatibleWithIntention(plotIntention)) {
                context.set(this._contextKey, this.getParam('default'));
                this.assertParamsMatchUI("getModifiedContext");
                return context;
            }
        }
        if (this._safeDefault != null) {
            context.set(this._contextKey, this._safeDefault);
        }
        return context;
    },

    assertParamsMatchUI: function(callingMethodName) {
        if (this.getParam("default") != this._formElement.val()) {
            this.logger.error("Assertion failed in ", this.moduleType, ".", callingMethodName, " . Params have drifted out of sync with the UI\ngetParam('default')=", this.getParam("default"), " formElement.val()=", this._formElement.val());
        }
    },  
    handleInputChange: function(evt) {
        this.setParam('default', this._formElement.val());
        this.logger.debug('handleInputChange - got default=' + this.getParam('default'));
        this.pushContextToChildren();

	var parent = this.parent;
	while (parent) {
	    if (parent.updateHistory) {
		parent.updateHistory();
	    }
	    parent = parent.parent;
	}
    },
    showIfCompatible : function() {
        // there might be a better solution, but if nobody has ever given us a
        // a context reference, we cannot let getContext() load it below
        // because in resurrection cases
        // a) this can trigger nasty jaBridge exceptions
        // b) a race condition in resurrection that may or may not have been resolved by
        //    reversing the order of pushSettings and pushContext.
        if (!this.baseContext) {
            this.hide('contextCompatibility');
        }

        if (this.isCompatibleWithContext()) {

            var context = this.getContext();
            var search  = context.get("search");
            var plotIntention = search.popIntention("plot");
            // if theres no plot intention at all, we assume the app developer
            // knows what they're doing and we let the control be visible.
            if (!plotIntention || this.isCompatibleWithIntention(plotIntention)) {
                this.show('contextCompatibility');
                this.enableCompatibleOptions();
            }
        } else {
            this.hide('contextCompatibility');
        }
    },
    /*
     * Subclasses will implement this method, which is how they turn themselves
     * visible or invisible depending on other settings being set above them.
     */
    isCompatibleWithContext: function() {return true;},
    /*
     * Subclasses will implement this method, which is how they turn themselves
     * visible or invisible depending on other settings being set above them.
     */
    enableCompatibleOptions: function() {},

    
    /*
     *  the visibility of these modules can change depending on certain values in the 
     * Context.
     * Subclasses will implement this function, which is how they turn themselves
     * visible or invisible depending on plotIntention properties being set above them.
     * the overall story is that they should implement isCompatibleWithIntention to check for 
     * intention-only conditions,  and then implement isCompatibleWithContext to check for 
     * anything and everything else
     * TODO - now that settings and contexts are together again these two methods can be 
     *        merged.
     */
    isCompatibleWithIntention: function(plotIntention) {return true;},
    /*
     * Not to be overridden, this base class implementation wires up the generic
     * logic of checking the isCompatibleWithIntention method.
     */
    onContextChange: function() {
        var context = this.getContext();
        // this is the part where we look for a value specified upstream 
        // by either a HiddenChartFormatter, or potentially by a viewstate, 
        // and we adopt that value as our own. 
        if (context.has(this._contextKey)){
            var value = context.get(this._contextKey);
            this._formElement.val(value);
            this.setParam('default', value, true);
        }
        this.showIfCompatible();
    },

    /**
     * certain characters, only if present as the first character, 
     * have special meaning to the property manager and must be escaped 
     * by doubling.
     */  
    escapePropertyManagerControlChars: function(value) {
        for (var i=0, l=this.PROPERTY_MANAGER_SPECIAL_CHARS.length; i<l; i++) {
            if (value.substring(0,1) == this.PROPERTY_MANAGER_SPECIAL_CHARS[i]) { 
                var ch = this.PROPERTY_MANAGER_SPECIAL_CHARS[i];
                return value.replace(ch, ch.concat(ch));
            }
        }
        return value;
    }
});
Splunk.Module.BaseChartFormatter.isAbstract = true;
