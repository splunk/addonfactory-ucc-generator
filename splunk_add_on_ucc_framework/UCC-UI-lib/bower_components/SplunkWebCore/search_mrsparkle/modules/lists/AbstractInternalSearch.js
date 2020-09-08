
Splunk.Module.AbstractInternalSearch = $.klass(Splunk.Module, {

    DEFAULT_STATUS_BUCKETS: 300,

    initialize: function($super, container) {
        $super(container);
        this.logger = Splunk.Logger.getLogger("Splunk.module.AbstractInternalSearch.js");
        this.messenger = Splunk.Messenger.System.getInstance();

        this._internalSearch = null;

        if (this.getParam('search') || this.getParam('savedSearch')) {
            this.dispatchInternalJob();

            $(document).bind('jobProgress', function(event, job) {
                if (this._internalSearch && 
                    this._internalSearch.job &&
                    this._internalSearch.job.getSearchId() == job.getSearchId()) {
                    this.onInternalJobProgress(event);
                }
            }.bind(this));

             //see simlar comment above for jobProgress
            $(document).bind('jobDone', function(event, job) {
                if (this._internalSearch && 
                    this._internalSearch.job &&
                    this._internalSearch.job.getSearchId() == job.getSearchId()) {
                    this.onInternalJobDone(event);
                }
            }.bind(this));

            $(document).bind('jobStatusChanged', function(event, sid, status) {
                if (this._internalSearch && 
                    this._internalSearch.job &&
                    this._internalSearch.job.getSearchId() == sid) {
                    this.onInternalJobStatusChanged(event);
                }
            }.bind(this));
        } else {
            this.messenger.send('error', 'Splunk.module.AbstractInternalSearch', sprintf('SearchLister module %(moduleId)s was not given a search or a saved search name to power itself and thus cannot render any data.', {moduleId: this.moduleId}));
        }
    },

    dispatchInternalJob: function(force) {
        // First cancel any running jobs
        if (this._internalSearch && 
            this._internalSearch.job &&
            this._internalSearch.job.getSearchId()) {
            this._internalSearch.job.cancel();
        }

        var search = this.getParam('search');
        var savedSearch = this.getParam('savedSearch');
        var entityName = this.getParam('entityName');
        var statusBuckets = this.getParam('statusBuckets');
        var useHistory = this.getParam('useHistory');

        if (search) {
            var earliest = this.getParam('earliest');
            var latest = this.getParam('latest');

            this._internalSearch = new Splunk.Search(search);

            // Properly set the timerange, if provided
            if (earliest || latest) {
                var range = new Splunk.TimeRange(earliest, latest);
                this._internalSearch.setTimeRange(range);
            }
            
        } else if (savedSearch) {
            // Case 1: we get a bad SavedSearch name. 
            if (!this.getParam('jsonSearch')) {
                this.displayInlineErrorMessage(sprintf(_('Could not find a saved search named "%(savedSearch)s".'), this._params));
                return;
            }
            
            // Valid saved search name so we should go try to retrieve it
            this._internalSearch = Splunk.Search.resurrect(this.getParam('jsonSearch'));
            this._internalSearch.job.setAsAutoCancellable(false);
            
            // Case 2: We get a valid saved search but no job is returned and we have useHistory == true
            if (this._internalSearch.isJobDispatched() == false &&
                useHistory.toLowerCase() == 'true') {
                
                var msg = '';
                if (window.$C && window.$C.hasOwnProperty('SPLUNKD_FREE_LICENSE') && window.$C['SPLUNKD_FREE_LICENSE']) {
                    msg = sprintf(_('The module "%(moduleType)s" has its useHistory flag set to True, which is not compatible with a free license. Try setting useHistory to Auto or False.'), {'moduleType': this.moduleType});
                } else {
                    msg = sprintf(_('Could not find a job in the saved search "%(savedSearch)s" history.'), this._params);
                }
                this.displayInlineErrorMessage(msg);
                return;
            }
        } else {
            this.logger.error('Assertion failed, no search or saved search provided for module=', this.moduleType);
            return;
        }

        if (this._internalSearch) {
            var failHandler = function(failedSearch) {
                this.logger.error(this.moduleType, "Internal context failed to dispatch job for search=", failedSearch.toString());
                this.displayInlineErrorMessage(sprintf(_('The internal search "%(searchStr)s" for the "%(moduleType)s" module failed.'), {searchStr: failedSearch.toString(), moduleType: this.moduleType}));
            }.bind(this);

            var successHandler = function(dispatchedSearch) {
                this.logger.debug("Successfully dispatched the internal search=", dispatchedSearch.toString(), 'for module=', this.moduleType);
            }.bind(this);

            // If we're looking for events make sure there are some statusBuckets
            if (entityName == 'events') {
                if (!statusBuckets) statusBuckets = this.DEFAULT_STATUS_BUCKETS;
                this._internalSearch.setMinimumStatusBuckets(statusBuckets);                
            }

            var useIntentions = this.getParam('applyOuterIntentionsToInternalSearch');

            var outerSearch = this.getContext().get("search");
            
            if (useIntentions && outerSearch.hasIntentions()) {
                var outerIntentions = $.extend(true, [], outerSearch._intentions);
                for(var i=0; i<outerIntentions.length; i++) {
                    this._internalSearch.addIntention(outerIntentions[i]);
                }
            }
            var useTimeRange = this.getParam('applyOuterTimeRangeToInternalSearch');
            if (useTimeRange && this._internalTimeRange) {
                this._internalSearch.setTimeRange(this._internalTimeRange);
            }

            // NOTE: the force param will be set to true whenever this is being 
            //       called from onContextChange
            if (force || (!useIntentions && !useTimeRange)) {
                // This protects against dispatching a stubbed out job created by the resurrection framework. 
                if ((useHistory.toLowerCase() == 'false') ||
                    (useHistory.toLowerCase() == 'auto' && !this._internalSearch.isJobDispatched())) {
                    this._internalSearch.dispatchJob(successHandler, failHandler, this.getGroupName());
                    this.onInternalJobDispatched();
                }
            }
        } else {
            this.logger.error('Somehow AbstractInternalSearch never got an internal context with which to dispatch a job. Not much we can do here.');
        }
    },

    onContextChange: function() {
        var useIntentions = this.getParam('applyOuterIntentionsToInternalSearch');
        var useTimeRange  = this.getParam('applyOuterTimeRangeToInternalSearch');
        

        if (useIntentions || useTimeRange) {
            var hasIntentions   = false;
            var hasNewTimeRange = false;

            var outerContext = this.getContext();
            var outerSearch  = outerContext.get("search");

            if (useIntentions) {
                hasIntentions = outerSearch.hasIntentions;
            }
            if (useTimeRange) {
                range = outerSearch.getTimeRange().clone();
                if (!this._internalTimeRange || !range.equalToRange(this._internalTimeRange)) {
                    hasNewTimeRange = true;
                    this._internalTimeRange = range;
                }
            }
            if ((useIntentions && hasIntentions) || (useTimeRange && hasNewTimeRange)) {
                this.dispatchInternalJob(true);
            }
        }
    },
    
    onInternalJobProgress: function() {},
    onInternalJobDone: function() {},
    onInternalJobStatusChanged: function() {},
    onInternalJobDispatched: function() {},
    
    isInternalSearchDone: function() {
        return !!(this._internalSearch && this._internalSearch.job && this._internalSearch.job.isDone());
    }
});
