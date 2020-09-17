//put Module in the namespace if it isnt already there.
Splunk.namespace("Module");

Splunk.Module.AbstractPagedModule = $.klass(Splunk.Module.DispatchingModule, {

    initialize: function($super, container) {
        $super(container);
        this.sortField = null;
        this.sortAsc   = null;
        this.INTENTION_NEGATE_TERM = "negateterm";
        this.INTENTION_ADD_TERM    = "addterm";
        this.INTENTION_CLEAR_TERM  = "clear";
        //negate and replace modifier keys (term clicking) can take one of shiftKey, altKey, ctrlKey or metaKey.
        this.MODIFIER_CUSTOM_MAP = [
            {"userAgentRex": /Macintosh/, "negate": "altKey", "replace": "metaKey"},//note: FF altKey+metaKey and click results in hand only possible negate/replace combo is shiftKey+metaKey or shiftKey+altKey.
            {"userAgentRex": /Linux.*Chrome/, "negate": "ctrlKey", "replace": "shiftKey"},
            {"userAgentRex": /Linux/, "negate": "ctrlKey", "replace": "metaKey"},
            {"userAgentRex": /Windows/, "negate": "altKey", "replace": "ctrlKey"}
        ];
        this.MODIFER_DEFAULT = {"userAgentRex": /.*/, "negate": "altKey", "replace": "metaKey"};

    
        var modifier = this.getModifier();
        this.negateModifier = modifier.negate;
        this.replaceModifier = modifier.replace;
        
        
        // although these are guaranteed to be present by the conf, 
        // even the defaults there will only apply if
        // a) this instance never gets given a settingsMap with these keys defined.
        // b) no subclass sets another value in its initialize.
        this._PAGINATION_KEYS = ["count", "maxLines", "offset"];
        this._PAGINATION_KEY_NAMESPACE = "results";
        this._previousSID = null;
        this.mergeLoadParamsIntoContext(this._PAGINATION_KEY_NAMESPACE, this._PAGINATION_KEYS);
    },
    // methods that are common to both eventsViewer and resultsViewer.
    getResultParams: function($super) {
        var params = $super();
        var context = this.getContext();
        // we only add the PAGE_SETTINGS keys, not any of the other keys which will be present.
        for (var i=0; i<this._PAGINATION_KEYS.length; i++) {
            var rawKey = this._PAGINATION_KEYS[i];
            var namespacedKey = this._PAGINATION_KEY_NAMESPACE + "." + rawKey;
            // only add it if we have some value for it.
            if (context.has(namespacedKey)) {
                params[rawKey] = context.get(namespacedKey);
            }
        }
        var fields = this.getNormalizedFields();
        if (fields.length > 0) {
            params["field_list"] = fields;
        }
        //TODO - now that there's only one this should be at least inlined
        //       however its worth looking into whether this whole legacy 
        //       patchwork of inconsistent variable names can be removed.
        var INCONSISTENT_NAMES = {"maxLines" : "max_lines"};
        for (var name in INCONSISTENT_NAMES) {
            if (params.hasOwnProperty(name)) {
                var patchedName = INCONSISTENT_NAMES[name];
                params[patchedName] = params[name];
                delete params[name];
            }
        }
        var search = context.get("search");
        var range = search.getTimeRange();
        if (range.isSubRangeOfJob()) {
            params.earliest_time = range.getEarliestTimeTerms();
            params.latest_time = range.getLatestTimeTerms();
        }
        // if this module is going to request events, 
        // and the job's sorting is 'realtime', 
        // and there is no explicit sorting that we're going to ask for,
        // then we invert the offset arithmetic.
        if (search.job.getEventSorting() == "realtime" && this.getParam("entityName")=="events" && !this.getSortField()) {
            // this method gives us the actual event available count, 
            // even when the number is obtained from summing over 
            // selected buckets in the timeline. 
            var totalAvailable = search.getEventAvailableCount();
            
            // always have to change offset, but sometimes we have to lower count as well, 
            // or else the last page will repeat events from the penultimate page.
            var reversedOffset = Math.max(totalAvailable - params.offset - params.count, 0);
            var reversedCount  = Math.min(params.count, totalAvailable-params.offset);
            params.offset = reversedOffset;
            params.count  = reversedCount;

            params.reverse_order = 1;
        }
        return params;
    },


    getSortField: function() {return this.sortField;},
    setSortField: function(field) {this.sortField = field;},
    getSortAsc: function() {return this.sortAsc;},
    setSortAsc: function(isAscending) {this.sortAsc = isAscending;},
    

    /**
     * useful method used to get the context's fields (fields list specified by upstream modules)
     * if none exist, it will then return any 'fields' param this module itself specifies
     * if neither exist, it returns an empty array.
     */
    getNormalizedFields: function() {
        var loadParamFields = this.getParam("fields");
        var contextFields = this.getContext().get("results.fields") || [];
        if (loadParamFields && contextFields.length > 0) {
            this.logger.error("Possible misconfiguration -  'fields' is both specified directly on ", this.moduleType, " and specified upstream. Local param will be ignored.");
        }
        if (contextFields.length > 0) {
            return contextFields;
        }
        else if (loadParamFields) {
            return Splunk.util.stringToFieldList(loadParamFields);
        }
        return [];
    },
    
    onContextChange: function() {
        var context = this.getContext();
        var search = context.get("search"); 
        if (search.job.getSearchId() != this._previousSID) {
            this.resetUI();
            this._previousSID = search.job.getSearchId();
        }
        // The search could come to us totally done or it could still be running.  
        // in appropriate cases we call getResults once right away.
                
        if (search.isJobDispatched() && (search.job.isDone() || (search.job.getEventCount() > 0)) ) {
            //if this.haveResultParamsChanged()
            this.getResults();
        }
    },
    




    /////////////////////////
    // Intention methods used by both EventsViewer and SimpleResultsTable
    /**
     * Retrieve the best match of modifier key bindings based on navigator.userAgent.
     * Merges MODIFIER_CUSTOM_MAP and MODIFER_DEFAULT constants and peforms reverse iteration 
     * where the lowest index MODIFIER_CUSTOM_MAP entry takes highest precedent and 
     * MODIFER_DEFAULT takes lowest.
     * 
     * @type Object
     * @return The best match modifier object literal. Note: See a MODIFIER_CUSTOM_MAP entry or MODIFER_DEFAULT for attribute specifications.
     */
    getModifier: function(){
        var userAgent = navigator.userAgent || "";
        var modifierMatch = null;
        for(var i=this.MODIFIER_CUSTOM_MAP.length-1; i>-1; i--){
            var modifier = this.MODIFIER_CUSTOM_MAP[i];
            if(userAgent.search(modifier.userAgentRex)!=-1){
                modifierMatch = modifier;
            }
        }
        if(!modifierMatch){
            this.logger.warn("Could not find matching MODIFIER_CUSTOM_MAP, reverting to MODIFER_DEFAULT.");
            modifierMatch = this.MODIFER_DEFAULT;
        }
        //this.logger.info("Modifier keys bound with userAgentRex", modifierMatch.userAgentRex.toString(), "negate modifier", modifierMatch.negate, "replace modifier", modifierMatch.replace, "for navigator.userAgent", userAgent);
        return modifierMatch;
    },

    /**
     * Get an intention name based on a UI event and keyboard modifier state.
     *
     * @param {Object} event The DOM event triggered.
     * @type String
     * @return The intention name adjusted to negate modifier setting. 
     */
    getIntentionName: function(event){
        return (event[this.negateModifier])?this.INTENTION_NEGATE_TERM:this.INTENTION_ADD_TERM;
    },

    /**
     * Convenience method for retrieving a normalized intention based on internal key-binding settings.
     * 
     * @param {Object} intention Object literal in standard intention format.
     * @param {Object} event The DOM event triggered.
     * 
     * @type Object
     * @return An object literal in standard intention format.
     */
    getKeydownMutatedIntention: function(intention, event){
        return (event[this.replaceModifier])?{arg: intention, name: this.INTENTION_CLEAR_TERM}:intention;
    },
    
    /**
     * Convenience method for passing an intention to (a) parent(s).
     *
     * @param {Object} intention See Splunk.Search specification.
     */
    passIntention: function(intention){
        var context = new Splunk.Context();
        var search  = new Splunk.Search("*");
        search.addIntention(intention);
        context.set("search", search);
        this.passContextToParent(context);
    }
});
Splunk.Module.AbstractPagedModule.isAbstract = true;
