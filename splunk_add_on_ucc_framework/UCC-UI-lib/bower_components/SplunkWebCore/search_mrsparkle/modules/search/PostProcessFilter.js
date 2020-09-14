//put Module in the namespace if it isnt already there.
Splunk.namespace("Module.FieldSearch");

/* The FieldSearch provides a query input area along with a submit button. 
 * In this version, the initial DOM elements are added to the container.
 * In the render() method, in the interest of encapsulation and to enable a
 * simple override of render() overrides to change the appearance.
 */
Splunk.Module.PostProcessFilter = $.klass(Splunk.Module.FieldSearch, {
    
    /*
     * overriding initialize to set up references and event handlers.
     */
    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        
        this.logger = Splunk.Logger.getLogger("search_field.js");
        this.fieldName = false;
        this._attachEventHandlers();
          
	},

    _attachEventHandlers: function() {
        this.input = $('input', this.container);
        this.input.bind("keypress", this._onKeyDown.bind(this));
    },

    applyContext: function($super,context) {},
   
    _getUserEnteredSearch: function() {
        return this.input.attr('value') || '';
    },

    /**
     * Necessitated by the need to resurrect jobs, sometimes search filters
     * may need to have their terms explicitly set.
     */
    setSearchTerm: function(terms) {
        this.input.attr('value', terms);
    },

    onContextChange: function() {
        var context = this.getContext();
        var search  = context.get("search");
        this.setSearchTerm(search.getPostProcess() || '');
    },

    /*
     *  Note:  Although getModifiedContext often just adds an intention,
     * sometimes it may also replace the Job instance.
     */
    getModifiedContext: function() {
        // pass through if the job has a search id
        var context = this.getContext();
        var search  = context.get("search");
        var searchTermStr = this._getUserEnteredSearch();
        this.logger.info('getModifiedContext - got search=', searchTermStr);
        if (searchTermStr) {   
	    var friendly = Splunk.util.normalizeBoolean(this.getParam("friendlySearch"));
            if (friendly && searchTermStr[0] != '|' && 0 != searchTermStr.toLowerCase().indexOf("search")) {
		    searchTermStr = "search " + searchTermStr;
	    }
	    var prefix = this.getParam("prefixSearch");
	    if (prefix) {
		searchTermStr = prefix + "|" + searchTermStr;
	    }

            search.setPostProcess(searchTermStr);
            context.set("search", search);
        }
       
        return context;
    },
    _onFormSubmit: function($super, event) {
        this.baseContext = null;
        return $super(event);
    },
    _onKeyDown: function(evt) {
        var keyCode  = evt.keyCode;
        if (keyCode == this.keys['ENTER']) {
                // SPL-19367
                // TODO: this is a temp workaround to hiding the autocomplete after an enter key
                this.input.blur();
                this.input.focus();
                // END TODO
                
                evt.preventDefault();
                this._onFormSubmit();
                return false;
            }
    }
});
