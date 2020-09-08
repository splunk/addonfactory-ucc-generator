Splunk.Module.HiddenFieldPicker = $.klass(Splunk.Module.DispatchingModule, {
   
    // define list of fields that are always requested, regardless of module
    // configuration
    COMPULSORY_FIELD_LIST: ["_raw","_time"],
    
    _selectedFields: [],
   
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        
    
        // init with the current view parameters; default to empty and 
        // - remember not to write out to persistence layer
        // - also beware that the param system is happy to return literal null values here
        //   and we need to interpret those as an empty list
        var fieldParam = this.getParam('fields', '') || [];
        this.setSelectedFieldList(fieldParam, true);
        this.hide(this.HIDDEN_MODULE_KEY);
    },

    // Following the rule of thumb for status buckets and required field list
    // this module does NOT set either,  since 
    //a) it itself does not require the data
    //b) there are ways to use this module such that the data is not necessary
    //   consider 'allowTransformedFieldSelect' on SRT.
    //onBeforeJobDispatched: function(search) {
    
    /**
     * Returns the module's current field list as an array.
     *
     */
    getSelectedFieldList: function() {
        return this._selectedFields.concat();
    },
    
    /**
     * Sets the current field list.
     * 
     * @param {string | array} list A list or array of fields to use
     * @param {boolean} writeSessionOnly Indicates whether or not the field
     *      list is restricted to just the current session and is not written
     *      to the persistence layer; use 'true' if just initializing
     *
     */
    setSelectedFieldList: function(list, writeSessionOnly) {    
        // normalize into array before storing locally
        if (typeof(list) == 'string') {
            this._selectedFields = Splunk.util.stringToFieldList(list);
        } else if ($.isArray(list)) {
            this._selectedFields = list.slice(0);
        } else {
            throw new Error('Cannot set field list; value must be either string or array');
        }
    },
    
    /**
     * Returns the field list through search context; the compulsory fields
     * are those that are required by other modules, but we don't bother
     * to persist
     *
     */
    getModifiedContext: function() {
        var context = this.getContext();

        if (Splunk.util.normalizeBoolean(this.getParam('strictMode'))) {
            context.set('results.fields', this.getSelectedFieldList());
        } else {
            context.set('results.fields', this.getSelectedFieldList().concat(this.COMPULSORY_FIELD_LIST));
        }
        return context;
    }
    
});