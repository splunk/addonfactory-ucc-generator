Splunk.Module.AbstractSearchLister = $.klass(Splunk.Module.AbstractInternalSearch, {

    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        this._internalSearchDeferred = $.Deferred();
        
        this._settingsThatCallGetResults = {
            sortDir: this.getParam('sortDir'),
            sortKey: this.getParam('sortKey'), 
            count: this.getParam('count'), 
            offset: this.getParam('offset')
        };
    },
    
    /**
     * Search Listers are not ready to push contexts until their
     * internal jobs are finished.
     */
    isReadyForContextPush: function($super) {
        if (!$super()) return false;
        var allSquaredAway = (this.isInternalSearchDone() && !this.isDisabled());
        if (allSquaredAway) {
            return Splunk.Module.CONTINUE;
        } else {
            return Splunk.Module.DEFER;
        }
    },
    
    onInternalJobProgress: function() {
        if (this.getParam('entityName') == 'events') {
            this.getResults();
            this.updatePaginator(this._internalSearch.job.getEventCount());
        }
    },

    onInternalJobDone: function() {
        this.getResults();
        if (this.getParam('entityName') == 'events') {
            this.updatePaginator(this._internalSearch.job.getEventCount());
        } else {
            this.updatePaginator(this._internalSearch.job.getResultCount());
        }
    },

    updatePaginator: function(count) {
        var context = this.getContext();
        var paginatorLink = context.get('results.totalCountCallback');
        if (paginatorLink && typeof paginatorLink == 'function') {
            paginatorLink(count);
        }
    },

    onUserAction: function(event) {
        if (Splunk.util.normalizeBoolean(this.getParam('searchWhenChanged'))) {
            this.logger.debug(sprintf('%(moduleType)s has its searchWhenChanged flag set to true. This may result in many unexpected dispatches.', {'moduleType': this.moduleType}));
            this.pushContextToChildren();
            return;
        // We do the check here and not in the onInternalJobDone
        // method because we need to allow the getResults method
        // call renderResults and activate the underlying module.
        // Note there is nothing explicit about this call so if
        // isReadyForContextPush still returns false somehow, this
        // will fail.
        } else if (this.pushContextWhenReady) {
            this.pushContextToChildren();
        } else {
            this.setChildContextFreshness(false);
        }
    },

    /**
     * modify the context for downstream modules.
     */
    getModifiedContext: function() {
        var context = this.getContext();
        if (this.isDisabled()) return context;

        var settingToCreate = this.getParam('settingToCreate');
        var tokenPrefix = this.getParam('tokenPrefix');
        var val = this.getListValue();
        if (settingToCreate) {
            if (val) context.set(settingToCreate, val);
        } else if (tokenPrefix) {
            var tokens = this.getTokenValues();
            for (var key in tokens) {
                context.set(tokenPrefix + '.' + key, tokens[key]);
            }
        }
        
        var token = this.getToken();
        if (token && val) {
            context.set('form.'+token, val);
        }
        
        return context;
    },

    isDisabled: function() {return false;},
    getListValue: function() {return null;},
    getTokenValues: function() {return {};},

    onContextChange: function($super) {
        // if applyOuterIntentionsToInternalSearch is true, 
        // this call to $super() is the only way the job will get kicked off. 
        $super();
        if (!this.isInternalSearchDone()) {
            return;
        }
        var context = this.getContext();
        var resultsDict = context.getAll("results");
        
        var shouldUpdate = false;
        for (var settingName in this._settingsThatCallGetResults) {
            // TODO - this is a neat trick but it can be reworked more cleanly using mergeLoadParamsIntoContext()
            if (resultsDict && resultsDict.hasOwnProperty(settingName) && this._settingsThatCallGetResults[settingName] != resultsDict[settingName]) {
                shouldUpdate = true;
                this._settingsThatCallGetResults[settingName] = resultsDict[settingName];
            }
        }

        if (shouldUpdate) this.getResults();
    },

    getResultURL: function(params) {
        var listURI = Splunk.util.make_url(sprintf('/api/lists/jobs/%s/%s', this._internalSearch.job.getSID(), this.getParam('entityName')));
        if (params) listURI += '?' + jQuery.param(params);
        return listURI;
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

        var fields = this.getFields('searchFieldsToDisplay');
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
    
    getResultsErrorHandler: function(xhr, textStatus, exception) {
        if (xhr.status >= 404) {
            var errorMsg = _('This SearchLister module could not retrieve its results.  A %(status)s error was returned with the following text "%(statusText)s".');
            var errorVars = {status: xhr.status, statusText: xhr.statusText};
            this.displayInlineErrorMessage(sprintf(errorMsg, errorVars));
        }
    },

    getInternalSearchDeferred: function() {
        return this._internalSearchDeferred.promise();
    },
    
    /**
     * Simulate a user action after the job is completely loaded.
     */
    renderResults: function(html) {
        $('div.error', this.container).prependTo(this.container);
        if (this.isInternalSearchDone()) {
            this.onUserAction();
        }
        this._internalSearchDeferred.resolve();
    }

});
