Splunk.Module.AbstractEntityLister = $.klass(Splunk.Module, {

    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        this.hasLoaded = false;
    },

    onLoadStatusChange: function($super, statusInt) {
        $super(statusInt);
        if (statusInt == Splunk.util.moduleLoadStates.WAITING_FOR_HIERARCHY) this.getResults();
    },

    /**
     * Entity Listers are not ready to push contexts until their
     * entity call  has returned
     */
    isReadyForContextPush: function($super) {
        if (!$super()) return false;
        if (this.hasLoaded) return Splunk.Module.CONTINUE;
        else return Splunk.Module.DEFER;
    },

    updatePaginator: function(count) {
        var context = this.getContext();
        var paginatorLink = context.get('results.totalCountCallback');
        if (paginatorLink && typeof paginatorLink == 'function') {
            paginatorLink(count);
        }
    },

    onUserAction: function(event) {
        if (this.pushContextWhenReady) {
            this.pushContextWhenReady = false;
            this.pushContextToChildren();
        } else if (this.hasLoaded && Splunk.util.normalizeBoolean(this.getParam('searchWhenChanged'))) {
            this.pushContextToChildren();
        } else {
            this.setChildContextFreshness(false);
        }
    },

    /**
     * Modify the context information for downstream modules.
     */
    getModifiedContext: function() {
        var context = this.getContext();
        var keyToCreate = this.getParam('settingToCreate');
        if (!this.isDisabled() && keyToCreate) {
            var val = this.getListValue();
            if (val) context.set(this.getParam('settingToCreate'), val);
        }
        return context;
    },

    isDisabled: function() {return false;},

    getListValue: function() {return null;},
    
    onContextChange: function() {
        if(this.isPageLoadComplete()) this.getResults();
    },

    getResultURL: function(params) {
        var listUri = Splunk.util.make_url(sprintf('/api/lists/entities/%s', this.getParam('entityPath')));
        if (params) listUri += '?' + jQuery.param(params);
        return listUri;
    },

    /**
     * Returns json encoded copies of the fields defined in the
     * view config. These are passed to the list endpoints and
     * used to generate the proper list of data.
     *
     * @return {Array} array of json encoded strings.
     */
    getFields: function(fieldName) {
        var output = [];
        if (this.getParam(fieldName)) {
            $.each(this.getParam(fieldName), function(i, field){
                if (!field.hasOwnProperty('label') && !field.hasOwnProperty('multiLabel')) return;
                output.push(JSON.stringify(field));
            });
        }
        return output;
    },

    /**
     * Returns an Object Literal that acts as a key/value map for query
     * params used in the getResults call.
     *
     * @returns {Object} Key/value map of parameters to send to getResults.
     */
    getResultParams: function() {
        var context = this.getContext();
        var params = {};

        var fields = this.getFields('entityFieldsToDisplay');
        if (fields.length > 0) params.fields = fields;

        var staticFields = this.getFields('staticFieldsToDisplay');
        if (staticFields.length > 0) params.staticFields = staticFields;

        // Output mode
        var outputMode = this.getParam('outputMode');
        if (outputMode) params.output_mode = outputMode;
        
        // Usually from paginator
        var count = context.get('results.count') || this.getParam('count') || 0;
        var offset = context.get('results.offset') || this.getParam('offset') || 0;
        if (count || count == 0) params.count = count;
        if (offset || offset == 0) params.offset = offset;
        
        // Usually from Sorter module
        var sortKey = context.get('results.sortKey') || this.getParam('sortKey');
        var sortDir = context.get('results.sortDir') || this.getParam('sortDir');
        if (sortKey) params.sort_key = sortKey;
        if (sortDir) params.sort_dir = sortDir;
        
        // Some ListURIGenerators add these
        var namespace = this.getParam('namespace');
        var owner = this.getParam('owner');
        if (namespace) params.namespace = namespace;
        if (owner) params.owner = owner;
        
        // The delimiter to use between fields
        var delimiter = this.getParam('delimiter');
        if (delimiter) params.delimiter = delimiter;

        // The post process search to apply
        var postProcess = this.getParam('postProcess');
        if (postProcess) params.search = postProcess;

        return params;
    },
    
    getResultsCompleteHandler: function(xhr, textStatus) {
        var length = xhr.getResponseHeader('X-Splunk-List-Length');
        if (length || length == 0) {
            this.updatePaginator(length);
        }
    },
    
    getResultsErrorHandler: function(xhr, textStatus, exception) {
        if (xhr.status >= 404) {
            var errorMsg = _('This EntityLister module could not retrieve its results.  A %(status)s error was returned with the following text "%(statusText)s".');
            var errorVars = {status: xhr.status, statusText: xhr.statusText};
            this.displayInlineErrorMessage(sprintf(errorMsg, errorVars));
        }
    },

    renderResults: function(html) {
        $('div.error', this.container).prependTo(this.container);
        this.hasLoaded = true;
        this.onUserAction();
    }

});
