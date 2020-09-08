/** THE RESURRECTION SHIP!!!!!!!!!!!!!!!! **/
Splunk.Module.HiddenSavedSearch = $.klass(Splunk.Module, {
    savedSearch: null,
    NO_JOB_FOUND_MESSAGE : _('No scheduled job was found for saved search "%(name)s".'),
    NO_JOB_FOUND_WITH_NEXT_RUN_MESSAGE : _('No scheduled job was found for saved search "%(name)s". The next scheduled run for this search is at %(time)s'),
    USE_HISTORY_TRUE_FREE_MODE_MSG: _('This HiddenSavedSearch module is configured with the parameter useHistory set to True. This is not compatible with a free license, try setting useHistory to Auto or False in this view\'s configuration.'),

    initialize: function($super, container) {
        $super(container);
        this.childEnforcement = Splunk.Module.ALWAYS_REQUIRE;
        
        this.messenger = Splunk.Messenger.System.getInstance();
        if (this._params['jsonSearch']) {
            var boundingGroup = this.getGroupName();
            //TODO - group has been effectively refactored into a 'search' space here. 
            //       We should make it a second param to resurrect, rather than a property of the jsonSearch literal
            if (boundingGroup) {
                this._params['jsonSearch']["group"] = boundingGroup;
            }
            this.savedSearch = Splunk.Search.resurrect(this._params['jsonSearch']);
            this.savedSearch.job.setAsAutoCancellable(false);
        }
        else {
            this.savedSearch = null;
        }

        var hashParams = Splunk.util.queryStringToProp(Splunk.util.getHash());
        var meta = this.container.closest('.dashboardCell').find('.paneledit').attr("data-sequence");
        var key = 'panel_' + meta + '.sid';
        if (meta && hashParams.hasOwnProperty(key)) {
            this.sid = hashParams[key];
            this.logger.info('Soft refresh; reuse job sid', this.sid);
            delete hashParams[key];
            window.location.hash = Splunk.util.propToQueryString(hashParams);
        } else {
            this.sid = null;
        }

        this.hide(this.HIDDEN_MODULE_KEY);
    },

    getModifiedContext: function() {

        // fail if somehow we got a null context. 
        if (!this.savedSearch) {
            // TODO - move these strings to the top of the file.
            this.displayInlineErrorMessage(sprintf(_("Configuration error - we were not able to find a saved search called '%s'."),  this._params["savedSearch"]));
            this.logger.error(this.moduleType + " null context resurrected");
            return new Splunk.Context();
        }
        
        // fail if somehow we got a context but its not a saved search. 
        if (!this.savedSearch.getSavedSearchName()) {
            this.logger.error(this.moduleType + " context resurrected somehow without saved search name");
        }
        // so far so good but there's a couple error cases to check.
        else {
            
            var context = this.getContext();
            var inheritedSearch  = context.get("search");

	    if (this.sid) {
		inheritedSearch.job = Splunk.Globals.Jobber.buildJob(this.sid);
		context.set("search", inheritedSearch);
		return context;
	    }

            var savedSearch = this.savedSearch.clone();
            // 1) we were configured with parents that want to alter the search but we have inherited a specific timerange from parent modules.
            if (!inheritedSearch.getTimeRange().isAllTime()) {  
                if (savedSearch.isJobDispatched()) {
                    if (savedSearch.job.delegate) {
                        // TODO - move these strings to the top of the file.
                        this.displayInlineErrorMessage(_("Configuration error - HiddenSavedSearch is being run as a schedule and is configured to listen to the time picker. Scheduled results will not be shown."));
                    } else {
                        this.logger.warn(this.moduleType, " is using a saved search that was dispatched by an upstream module but NOT by the scheduler. Abandoning job.");
                    }
                    savedSearch.abandonJob();
                } else {
                    this.logger.info(this.moduleType, " is using a saved search and a module above has altered the timerange to ", inheritedSearch.getTimeRange());
                }
                savedSearch.setTimeRange(inheritedSearch.getTimeRange());
            }

            // 2) we were configured with parents that want to add intentions. Not supported at all so log an error.
            if (inheritedSearch.hasIntentions() && savedSearch.isJobDispatched()) {
            
                this.displayInlineErrorMessage("Configuration not supported - HiddenSavedSearch does not yet support layering additional intentions on top of a saved search.");
            }

            // 3) among the permutations of useHistory and isJobDispatched there are 2 more error conditions we check for.
            if (this._params['useHistory'].toLowerCase() == 'true'  && !savedSearch.isJobDispatched()) {

                var args = {name: savedSearch.getSavedSearchName()};
                var jobNotFoundMessage;
                if (window.$C && window.$C.hasOwnProperty('SPLUNKD_FREE_LICENSE') && window.$C['SPLUNKD_FREE_LICENSE']) {
                    jobNotFoundMessage = this.USE_HISTORY_TRUE_FREE_MODE_MSG;
                } else {
                    jobNotFoundMessage = sprintf(this.NO_JOB_FOUND_MESSAGE,args);

                    // if we know the next scheduled run, we rebake the message with that info.
                    if (savedSearch.next_scheduled_time) {
                        args["time"] = savedSearch.next_scheduled_time;
                        jobNotFoundMessage = sprintf(this.NO_JOB_FOUND_WITH_NEXT_RUN_MESSAGE,args);
                    }
                }

                // TODO - move these strings to the top of the file.
                this.displayInlineErrorMessage(jobNotFoundMessage);
                return null;
            }

	    //if (this._params.hasOwnProperty("reuseMaxSecondsAgo")) {
	    //savedSearch.setReuseMaxSecondsAgo(this._params["reuseMaxSecondsAgo"]);
	    //}
	    
            context.set("search", savedSearch);
            return context;
        }
        return null;
    }
});
