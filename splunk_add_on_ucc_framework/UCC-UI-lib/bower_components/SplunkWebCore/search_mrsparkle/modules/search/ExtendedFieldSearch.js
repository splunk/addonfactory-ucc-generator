Splunk.Module.ExtendedFieldSearch = $.klass(Splunk.Module.FieldSearch, {

    INTENTION_NAME_KEY: 'name',
    INTENTION_ARG_KEY: 'arg',
    STRING_REPLACE_VALUE_KEY: 'value',

    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        
        this.logger = Splunk.Logger.getLogger("ExtendedFieldSearch.js");
    },


    /**
     * Adds an intention to the context and returns it.
     */
    getModifiedContext: function() {
        var inputValue = this.getReplacementValue();
        var intention = this.getIntention(inputValue);

        // because stringreplace intention breaks the model it requires special treatment 
        // in all client code. 
        // Even if the user leaves the field blank, in the case of stringreplace we cant 
        // just not insert the intention.  Instead, we need to insert a null stringreplace 
        // in order to remove the token from the base Search String. 
        var isStringReplace = (intention["name"] == "stringreplace");
        var context = this.getContext();
        if (inputValue || isStringReplace) {
            var search  = context.get("search");
            // TODO - this is going to be applied in 'null' stringreplace cases but 
            // inpecting the stringreplace args and trying to infer it's logic is too scary.
            search.abandonJob();
            search.addIntention(intention);
            context.set("search", search);
        }
        
        var token = this.getToken();
        if (inputValue && token) {
            context.set('form.'+token, inputValue);
        }
        return context;
    },

    /**
     * Retrieves the intention defined in the view conf.
     * If a replacementValue is passed in, a best effort will be made
     * to use the replacementMap, also defined in the view conf, to
     * map the replacementValue onto the intention.
     *
     * @param replacementValue {String, Integer} any value that should be applied to the target as defined in the replacementMap.
     */
    getIntention: function(replacementValue) {
        var intention = $.extend(true, {}, this._params['intention']);
        if (replacementValue != null) {
            var replacementMap = $.extend(true, {}, this._params['replacementMap']);
            if (typeof(replacementMap[this.INTENTION_ARG_KEY]) == 'undefined') {
                this.logger.debug('The replacementMap provided does not define a "' + this.INTENTION_ARG_KEY + '" key so nothing can be replaced.');
                return intention;
            }

            // Forcing this to only replace vals in an intentions 'arg' dict.
            // Hopefully this reduces some shooting in the foot.
            this._setDeepestNodes(replacementMap, intention, replacementValue);
        }
        return intention;
    },
    
    /**
     * Returns the value that should be set in the intention, based on the defined replacementMap.
     */
    getReplacementValue: function() { 
        var val = $.trim(this.input.attr('value'));
        
        // This should return null only if the stringreplace intention is defined.
        // This replaces the null value from the intention
        // so that the parser is not trying to handle null values for things like addterm intentions.
        // Really, if intentions are to stick around, they should codified into proper classes.
        if (val == '' && 
            this._params['intention'].hasOwnProperty('name') &&
            this._params['intention']['name'] == 'stringreplace') {
            return null;
        }
        return val;
    },
    
    onContextChange: function($super) {
        var context = this.getContext();
        var formValue = context.get('form.'+this.token);
        if (formValue) {
            this.setInputField(formValue);
        }
        $super();            
    },
    
    resetUI: function() {
	    this.setInputField(this._params['default'] || '');
    },
    
    /**
     * A pseudo private method that traverses an object map, descends to its deepest nodes
     * and replaces the target object with a value defined by val. This allows for the definition
     * of a target object with arbitrary levels of depth, while replacing only a specific subset
     * of nodes as defined in the map.
     *
     * @param map {Object} An object that mirrors a portion of the target, defining the deepest nodes to be replaced with val.
     * @param target {Object} The object whose nodes will be set to val, assuming they match the map target.
     * @param val {String, Int, Float} The value to set on target's nodes based on the map.
     */
    _setDeepestNodes: function(map, target, val) {
        for (var key in map) {
            // If the map defines a key that is not a leaf, and not in the target then something is wrong
            if (typeof(target[key]) == 'undefined' && typeof(map[key]) == 'object' && map[key] !== null) {
                this.logger.warn(sprintf('Cannot find key %s defined in the replacementMap in the target.', key));
                return;
            }

            if (typeof(map[key]) == 'object' && map[key] !== null) {
                this._setDeepestNodes(map[key], target[key], val);
            }
            else {
                // We potentially allow leaf nodes to be added to the target
                target[key] = val;
            }
        }
    }
});
