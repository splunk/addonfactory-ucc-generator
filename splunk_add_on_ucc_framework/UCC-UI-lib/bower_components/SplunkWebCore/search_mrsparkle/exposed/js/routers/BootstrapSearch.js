define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/BaseSearch',
        'models/search/Job',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
        _,
        $,
        Backbone,
        BaseSearch,
        SearchJobModel,
        splunkd_utils,
        splunkUtil
    ) {
        return BaseSearch.extend({
            initialize: function(options) {
                options = options || {};
                BaseSearch.prototype.initialize.apply(this, arguments);
                this.loadingMessage = _('Loading...').t();
                this.requiresRoles = options.requiresRoles;
                this.reportRequired = false;
            },
            
            //Our only Action method
            page: function(locale, app, page) {
                BaseSearch.prototype.page.apply(this, arguments);
                
                if (!this.shouldRender) {
                    this.deactivate();
                } else {
                    this.baseDeactivateDeferred.resolve();
                }
                
                //Times collection first for the search bar
                if (this.deferreds.times.state() !== 'resolved') {
                    this.collection.times.fetch({
                        data: {
                            app: this.model.application.get("app"),
                            owner: this.model.application.get("owner"),
                            count: -1
                        },
                        success: function(model, response) {
                            this.deferreds.times.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.times.resolve();
                        }.bind(this)
                    });
                }
                
                //models
                if (this.deferreds.uiPrefs.state() !== 'resolved') {
                    this.model.uiPrefs.bootstrap(this.deferreds.uiPrefs, this.model.application.get("page"), this.model.application.get("app"), this.model.application.get("owner"));
                }
                
                if (this.deferreds.appLocal.state() !== 'resolved') {
                    this.model.appLocal.fetch({
                        url: splunkd_utils.fullpath(this.model.appLocal.url + "/" + encodeURIComponent(this.model.application.get("app"))),
                        data: {
                            app: this.model.application.get("app"),
                            owner: this.model.application.get("owner")
                        },
                        success: function(model, response) {
                            this.deferreds.appLocal.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.appLocal.resolve();
                        }.bind(this)
                    });
                }
                
                if (this.deferreds.workflowActions.state() !== 'resolved') {
                    this.collection.workflowActions.fetch({
                        data: {
                            app: this.model.application.get("app"),
                            owner: this.model.application.get("owner"),
                            count: -1,
                            sort_key: "name",
                            search: 'disabled=false'
                        },
                        success: function(model, response) {
                            this.deferreds.workflowActions.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.workflowActions.resolve();
                        }.bind(this)
                    });
                }
                
                if (this.requiresRoles) {
                    if (this.deferreds.roles.state() !== 'resolved') {
                        this.collection.roles.fetch({
                            success: function(model, response) {
                                this.deferreds.roles.resolve();
                            }.bind(this),
                            error: function(model, response) {
                                this.deferreds.roles.resolve();
                            }.bind(this)
                        });
                    }
                } else {
                    this.deferreds.roles.resolve();
                }
                
                $.when(this.baseDeactivateDeferred).then(function(){
                    //set the defaults for the pagination and sorting
                    this.model.report.entry.content.set({
                        'display.prefs.events.offset': '0',
                        'display.prefs.statistics.offset': '0',
                        'display.events.table.sortDirection': 'asc',
                        'display.statistics.sortDirection': 'asc'
                    });
                    
                    //data bootstrap
                    this.bootstrapDeferred = $.Deferred();
                    
                    $.when(this.deferreds.uiPrefs, this.deferreds.userPref).then(function() {
                        this.model.classicUrl.fetch({
                            success: function(model, response){                             
                                this.autoPause = SearchJobModel.getAutoPauseInterval(this.model.classicUrl.get("auto_pause"));
                                                                
                                //remove values that should not be permalinked
                                this.model.classicUrl.set({
                                    'display.events.timelineEarliestTime': undefined,
                                    'display.events.timelineLatestTime': undefined,
                                    'display.prefs.events.offset': undefined,
                                    'display.prefs.statistics.offset': undefined,
                                    'display.statistics.sortColumn': undefined,
                                    'display.statistics.sortDirection': undefined,
                                    'display.events.table.sortColumn': undefined,
                                    'display.events.table.sortDirection': undefined
                                });
                                
                                this.syncFromClassicURL();
                            }.bind(this)
                        });
                    }.bind(this));
                    
                    $.when(
                        this.deferreds.roles,
                        this.deferreds.times,
                        this.deferreds.appLocal,
                        this.deferreds.user,
                        this.deferreds.workflowActions,
                        this.deferreds.pageViewRendered,
                        this.deferreds.preloadReplaced,
                        this.deferreds.serverInfo,
                        this.bootstrapDeferred
                    ).then(function(){
                        this.baseActivateDeferred.resolve();
                    }.bind(this));                    
                }.bind(this));
            },
            
            syncFromClassicURL: function(options) {
                options = options || {};
                
                var jobFetchDeferred = options.jobFetchDeferred || $.Deferred(),
                    jobCreationDeferred = options.jobCreationDeferred || $.Deferred(),
                    reportFetchDeferred = options.reportFetchDeferred || $.Deferred(),
                    timeRangeDeferred = options.timeRangeDeferred || $.Deferred(),
                    mergeFromSearchDeferred = options.mergeFromSearchDeferred || $.Deferred(),
                    reportIdFromUrl = this.model.classicUrl.get('s'),
                    searchFromUrl = splunkUtil.stripLeadingSearchCommand(this.model.classicUrl.get('q')),
                    jobIdFromUrl = this.model.classicUrl.get('sid'),
                    attrsFromUrl = this.model.classicUrl.filterByWildcards(this.url_filter, { allowEmpty: true }),
                    //Set fetchUserPref to true to layer in user prefs
                    attrsFromUserPrefs = this.model.userPref ? this.model.userPref.entry.content.filterByWildcards(this.user_prefs_filter) : {},
                    uiPrefsOffFromUrl = this.model.classicUrl.get('uiprefsoff'),
                    attrsFromJob = {},
                    attrsFromUIPrefs = {},
                    shouldFetchTableAST = this.shouldFetchTableAST(),
                    tableASTFetchDeferred, searchFromReport, searchFromJob, search;
                    
                // Determine if this page should fetch the tableAST
                if (shouldFetchTableAST) {
                    tableASTFetchDeferred = options.tableASTDeferred || $.Deferred();
                } else {
                    tableASTFetchDeferred = ((options.tableASTDeferred && options.tableASTDeferred.resolve()) || $.Deferred().resolve());
                }
                    
                //for testing purposes we will not use UI prefs if the url tells us to
                if (!uiPrefsOffFromUrl) {
                    attrsFromUIPrefs = this.model.uiPrefs.entry.content.filterByWildcards(this.job_filter);
                } else {
                    attrsFromUIPrefs['display.events.type'] = 'list';
                }
                
                if (this.reportRequired && !reportIdFromUrl) {
                    var noReportIdError = splunkd_utils.createSplunkDMessage(splunkd_utils.FATAL, _("No report was specified.").t());
                    this.model.report._onerror(this.model.report, noReportIdError);
                    jobFetchDeferred.resolve();
                    reportFetchDeferred.resolve();
                    jobCreationDeferred.resolve();
                    timeRangeDeferred.resolve();
                    this.bootstrapDeferred.resolve();
                    return;
                }
                //we need to mediate the legacy attrs from the URL to the report
                this.mediateClassicUrlAttrsToReport(attrsFromUrl);
                this.mediateUserPrefsAttrs(attrsFromUserPrefs);
                
                //if we don't have a report, a job, or a search string to load then we should show initial help
                if (!reportIdFromUrl && !jobIdFromUrl && !searchFromUrl) {
                    this.mergeFromEmptyState(timeRangeDeferred, attrsFromUserPrefs, attrsFromUIPrefs, attrsFromUrl);
                    if (this.model.report.isSampled() && this.model.report.isRealTime()) {
                        // SPL-106268: In this case, URL has dispatch.sample_ratio with a value greater than 1 and the time range is real-time. 
                        // We need to make sure the URL is consistent after sampling is disabled in the call of this.model.report.adjustSampleRatio.
                        this.model.classicUrl.save({'dispatch.sample_ratio': '1'}, {replaceState: true});
                    }
                    this.model.report.adjustSampleRatio();
                    this.model.report.syncCustomSampleRatio();
                    return;
                }

                this.reportBootstrap(reportFetchDeferred, jobCreationDeferred, reportIdFromUrl, searchFromUrl, jobIdFromUrl);
                // Report router extends from BootstrapSearch needs report is fetched before jobBootstrap can be called
                $.when(reportFetchDeferred).then(function() {
                    this.jobBootstrap(jobFetchDeferred, jobCreationDeferred, reportIdFromUrl, searchFromUrl, jobIdFromUrl);
                }.bind(this));

                $.when(jobFetchDeferred).then(function() {
                    if (this.reportRequired && this.model.report.isNew()) {
                        jobCreationDeferred.resolve();
                        timeRangeDeferred.resolve();
                        return;
                    }
                    
                    searchFromReport = this.model.report.entry.content.get('search');
                    searchFromJob = splunkUtil.stripLeadingSearchCommand(this.model.searchJob.getSearch());
                    
                    //merge the attrs from the ui prefs into the report
                    if (this.model.report.isNew()) {
                        //the ui prefs should trump the report defaults    
                        this.model.report.entry.content.set($.extend({}, attrsFromUserPrefs, attrsFromUIPrefs));
                    } else {
                        //the values we get from the report should trump the ui pref values
                        var defaults = this.model.report.entry.content.toJSON();
                        _.defaults(defaults, attrsFromUIPrefs);
                        this.model.report.entry.content.set($.extend({}, defaults));
                    }

                    //merge the attrs from the job and the url into the report
                    search = this.getSearch(searchFromUrl, searchFromReport, searchFromJob);
                    
                    // Once the search is determined get the AST for the search string
                    if (shouldFetchTableAST && (tableASTFetchDeferred.state() !== 'resolved')) {
                        this.tableASTBootstrap(tableASTFetchDeferred, search);
                    }
                    
                    if (this.shouldStartNewSearch()) {
                        // merge the attrs from the url into the report and start a job
                        this.model.report.entry.content.set($.extend({}, attrsFromUrl, {search: search}));
                        this.model.report.adjustSampleRatio();
                        this.startNewSearch(jobCreationDeferred, search, attrsFromUrl, options);
                    } else if (!this.model.searchJob.isNew()) {
                        // merge the attrs from the url and the job into the report and use existing job
                        this.mergeFromSearch(jobCreationDeferred, search, attrsFromUrl, attrsFromJob, options);
                    } else {
                        //merge the attrs from the url into the report but don't start a job
                        this.model.report.entry.content.set($.extend({}, attrsFromUrl, {search: search}));
                        jobCreationDeferred.resolve();
                    }

                    $.when(jobCreationDeferred).then(function(){
                        this.model.report.syncDrilldownMode();
                        this.model.report.syncCustomSampleRatio();
                        this.populateSelectedFieldsFromReport();
                        this.timeRangeBootstrap(timeRangeDeferred);
                    }.bind(this));
                }.bind(this));

                $.when(jobCreationDeferred, timeRangeDeferred, tableASTFetchDeferred).then(function() {
                    if (!this.model.searchJob.isNew()){
                        if (!this.model.searchJob.isPreparing()) {
                            this.model.report.setSearchTab({ 
                                isTransforming: this.model.searchJob.isReportSearch(),
                                isUneventfulReportSearch: this.model.searchJob.isUneventfulReportSearch(),
                                canPatternDetect: this.model.user.canPatternDetect()
                            });
                            this.registerSearchJobFriends();
                        }
                        this.populateClassicUrlFromSearchJob();
                        this.model.searchJob.startPolling();
                    }
                    this.bootstrapDeferred.resolve();
                }.bind(this));
            },
            
            mergeFromEmptyState: function(timeRangeDeferred, attrsFromUserPrefs, attrsFromUIPrefs, attrsFromUrl) {
                //merge the attrs from the url into the report
                this.model.report.entry.content.set($.extend({}, attrsFromUserPrefs, attrsFromUIPrefs, attrsFromUrl));
                
                //need to bootstrap the timerange for the timerangepicker
                this.timeRangeBootstrap(timeRangeDeferred);
                
                //we need to show the initial help page with the metadata job
                $.when(timeRangeDeferred).then(function() {
                    if (splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.enableMetaData')) && !this.model.serverInfo.isLite()) {
                        this.startMetaDataSearch(this.bootstrapDeferred);
                    } else {
                        this.bootstrapDeferred.resolve();
                    }
                }.bind(this));
            },
            
            getSearch: function(searchFromUrl, searchFromReport, searchFromJob) {
                var search;
                if (this.model.searchJob.isNew()) {
                    if (searchFromUrl && ($.trim(searchFromUrl) !== $.trim(searchFromReport))) {
                        search = searchFromUrl;
                    } else {
                        search = searchFromReport;
                    }
                } else {
                    //If searchFromUrl != searchFromJob the job will already of been deemed invalid and the id unset.
                    //At this point if there is a job it should be used.
                    search = searchFromJob;
                }
                return search;
            },

            /**
             * Determine if a new search job should be created. 
             *
             * @return {Boolean} Indicates if a new search job should be run.
             */
            shouldStartNewSearch: function() {
                return this.model.searchJob.isNew();
            },
                                   
            /**
             * Merge job and url attr to the report when a job already exists. 
             *
             * @param jobCreationDeferred {String} Resovled when attrs are synced since a new job does not need to be crated.
             * @param search {String} Search to merge into the report.
             * @param attrsFromUrl {Object} Attr from Url to merge into the report.
             * @param attrsFromJob {Object} Attr from Job to merge into the report.
             */
            mergeFromSearch: function(jobCreationDeferred, search, attrsFromUrl, attrsFromJob, options) {
                var syncJobPreview;
                
                //get the attrs from the job for mediation
                attrsFromJob = this.model.searchJob.entry.content.custom.filterByWildcards(this.job_filter);
                attrsFromJob["display.page.search.mode"] = this.model.searchJob.getAdhocSearchMode();
                attrsFromJob["dispatch.earliest_time"] = this.model.searchJob.getDispatchEarliestTimeOrAllTime();
                attrsFromJob["dispatch.latest_time"] = this.model.searchJob.getDispatchLatestTimeOrAllTime();
                attrsFromJob["dispatch.sample_ratio"] = this.model.searchJob.getSampleRatio();
                
                //make sure that the job has the same preview setting as the report
                if (this.model.searchJob.entry.acl.canWrite()) {
                    syncJobPreview = this.model.searchJob.setPreview(splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.general.enablePreview')));
                } else {
                    syncJobPreview = $.Deferred().resolve();
                }
                
                //merge the attrs from the url and the job into the report
                this.model.report.entry.content.set($.extend({}, attrsFromUrl, attrsFromJob, {search: search}));
                
                syncJobPreview.always(function(){
                    jobCreationDeferred.resolve();
                }.bind(this));
            },

            /**
             * Create a new search job. 
             *
             * @param jobCreationDeferred {String} Resovled when job has been created or failed. Resolved in addNewSearchListeners.
             * @param search {String} The search the job should run.
             * @param reportMediatedAttrs {Object} Custom attr to set on the search job.
             */
            startNewSearch: function(jobCreationDeferred, search, reportMediatedAttrs) {
                var searchToStart;
                
                if (search) {
                    searchToStart = new SearchJobModel();
                    
                    if (reportMediatedAttrs) {
                        this.deleteOneTimeUseAttrs(reportMediatedAttrs);
                        //don't store the pattern sensitivity with the job
                        delete reportMediatedAttrs["display.page.search.patterns.sensitivity"];
                        searchToStart.entry.content.custom.set(reportMediatedAttrs);
                    }
                    
                    this.addNewSearchListeners(searchToStart, jobCreationDeferred);
                    searchToStart.save({}, {
                        data: {
                            search: search,
                            earliest_time: this.model.report.entry.content.get('dispatch.earliest_time'),
                            latest_time: this.model.report.entry.content.get('dispatch.latest_time'),
                            auto_cancel: SearchJobModel.DEFAULT_AUTO_CANCEL,
                            auto_pause: this.autoPause ? this.autoPause : undefined,
                            status_buckets: 300,
                            ui_dispatch_app: this.model.application.get('app'),
                            preview: this.model.report.entry.content.get('display.general.enablePreview'),
                            adhoc_search_level: this.model.report.entry.content.get('display.page.search.mode'),
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner'),
                            indexedRealtime: this.model.report.entry.content.get('dispatch.indexedRealtime'),
                            sample_ratio: this.model.report.entry.content.get('dispatch.sample_ratio'),
                            check_risky_command: this.shouldCheckRiskyCommand(search),
                            provenance: this.getJobProvenance()
                        }
                    });
                } else {
                    this.jobBootstrapErrors = [
                        splunkd_utils.createMessageObject(
                            splunkd_utils.FATAL,
                            _('No search was specified.').t()
                        )
                    ];
                    jobCreationDeferred.resolve();
                }
            },

            addNewSearchListeners: function(newSearchModel, jobCreationDeferred) {
                //let the full model lifecycle take place before proxying
                newSearchModel.on('sync', function(model, response, options) {
                    var messages;
                    this.model.searchJob.clear();
                    this.model.searchJob.setFromSplunkD(newSearchModel.toSplunkD());
                    if (this.jobBootstrapErrors && this.jobBootstrapErrors.length > 0) {
                        messages = this.jobBootstrapErrors;
                    } else if (model.error.get('messages')) {
                        messages = model.error.get('messages');
                    }
                    if (messages) {
                        this.model.searchJob.error.set({
                            messages: messages
                        });
                    }
                    //clear auto_pause
                    this.model.classicUrl.unset("auto_pause");
                    newSearchModel.off();
                    jobCreationDeferred.resolve();
                }, this);
                
                newSearchModel.on('error', function(model, response, options) {
                    this.model.searchJob.trigger('error', this.model.searchJob, response);
                    model.off();
                    jobCreationDeferred.resolve();
                }, this);
            },

            /**
            * Outputs the value to be assigneded to the peram check_risky_command when creating a new job.
            *
            * @param <String> search
            * @return <Boolean>
            */
            shouldCheckRiskyCommand: function(search) {
                // Only show risky warning on 1st page view.
                return this.pageViewCount <= 1;
            },
            
            shouldFetchTableAST: function() {
                return false;
            },
            
            registerSearchJobFriends: function(options) {
                options = _.extend({}, options, { registerResultJsonCols: false, registerResultJsonRows: false });
                BaseSearch.prototype.registerSearchJobFriends.call(this, options);
            },

            reportBootstrap: function(reportFetchDeferred, jobCreationDeferred, reportIdFromUrl, searchFromUrl, jobIdFromUrl) {
                if (reportIdFromUrl) {
                    this.model.report.set("id", this.applyModelFullPathToName(this.model.report, reportIdFromUrl));
                }
                
                //fetch the report no matter what
                //if we don't have an id then we need the defaults
                this.model.report.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner")
                    },
                    
                    success: function(model, response){
                        //set the report pristine before anything has been set on the report
                        this.model.reportPristine.setFromSplunkD(this.model.report.toSplunkD());
                        if (!this.fetchExternalVisualization) {
                            reportFetchDeferred.resolve();
                            return;
                        }
                        this.externalVisualizationBootstrap(this.model.report).done(function() {
                            reportFetchDeferred.resolve();
                        });
                    }.bind(this),

                    error: function(model, response){
                        var errorResponse = response;

                        this.model.report.unset("id");
                        this.model.classicUrl.save({s: undefined}, {replaceState: true});

                        if (this.reportRequired || (reportIdFromUrl && !searchFromUrl && !jobIdFromUrl)){
                            //the user only provided a bad reportId
                            //we should initialize the UI with the bad report
                            this.model.report._onerror(this.model.report, response);
                            reportFetchDeferred.resolve();
                            jobCreationDeferred.resolve();
                        } else {
                            //fetch the report defaults and populate the report with them, and put the report into an error state
                            this.model.reportPristine.fetch({
                                success: function(model, response) {
                                    this.model.report.setFromSplunkD(this.model.reportPristine.toSplunkD());
                                    this.model.report.trigger("error", this.model.report, errorResponse);
                                    reportFetchDeferred.resolve();
                                }.bind(this),
                                error: function(model, response) {
                                    //this is extremely bad, it means we couldn't fetch _new
                                    reportFetchDeferred.resolve();
                                }.bind(this)
                            });
                        }
                    }.bind(this)
                });
            },

            /**
             * Bootstrap search job with an existing job id from URL.
             */
            jobBootstrap: function(jobFetchDeferred, jobCreationDeferred, reportIdFromUrl, searchFromUrl, jobIdFromUrl){
                if (jobIdFromUrl) {
                    //only fetch the job if we have an id
                    this.fetchJob(jobIdFromUrl, jobFetchDeferred, jobCreationDeferred, reportIdFromUrl, searchFromUrl);
                } else {
                    jobFetchDeferred.resolve();
                }
            },

            /**
             * Fetch existing job with job id from URL.
             *
             * @param jobIdFromUrl {String} Used to fetch a job.
             * @param jobFetchDeferred {Object} Resolve it after the job fetching is done.
             * @param jobCreationDeferred {Object} Resolve it only when job fetching fails and URL only contains a job id.
             * @param reportIdFromUrl {String} Used to check if URL has a report id.
             * @param searchFromUrl {String} Used to check if URL has a search string.
             */
            fetchJob: function(jobIdFromUrl, jobFetchDeferred, jobCreationDeferred, reportIdFromUrl, searchFromUrl) {
                    this.model.searchJob.set("id", jobIdFromUrl);
                    this.model.searchJob.fetch({
                        success: function(model, response){
                            var searchFromJob = splunkUtil.stripLeadingSearchCommand(model.getSearch());
                            if (this.bootstrappedJobIsInvalid(searchFromUrl, searchFromJob)) {
                                this.model.classicUrl.save({sid: undefined}, {replaceState: true});
                                this.model.searchJob.unset("id");
                            }
                            jobFetchDeferred.resolve();
                        }.bind(this),

                        error: function(model, response){
                            this.model.classicUrl.save({sid: undefined}, {replaceState: true});
                            this.model.searchJob.unset("id");

                            if (jobIdFromUrl && !searchFromUrl && !reportIdFromUrl){
                                //the user only provided a bad jobId
                                //we should initialize the UI with the bad job
                                jobFetchDeferred.resolve();
                                jobCreationDeferred.resolve();
                            } else {
                                //save this error for when we make the job
                                this.jobBootstrapErrors = [
                                     splunkd_utils.createMessageObject(
                                         splunkd_utils.WARNING,
                                         _("The job could not be loaded. A new job has been started with the same search.").t()
                                     )
                                ];
                                //we have other searches to use
                                //don't broadcast an error
                                jobFetchDeferred.resolve();
                            }
                        }.bind(this)
                    });
            },
            
            bootstrappedJobIsInvalid: function(searchFromUrl, searchFromJob) {
                return (searchFromUrl && ($.trim(searchFromUrl) !== $.trim(searchFromJob)));
            },
            
            timeRangeBootstrap: function(timeRangeDeferred) {
                this.model.timeRange.save(
                    {
                        'earliest': this.model.report.entry.content.get('dispatch.earliest_time'),
                        'latest': this.model.report.entry.content.get('dispatch.latest_time')
                    },
                    {
                        validate: false,
                        success: function(model, response) {
                            timeRangeDeferred.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            timeRangeDeferred.resolve();
                        }.bind(this)
                    }
                );
            },
            
            // Fetch the AST for the search string
            tableASTBootstrap: function(tableASTFetchDeferred, search) {
                this.model.tableAST.set({
                    spl: splunkUtil.addLeadingSearchCommand(search, true)
                });
                
                this.model.tableAST.fetch({
                    data: {
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner')
                    },
                    success: function(model, response) {
                        tableASTFetchDeferred.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        tableASTFetchDeferred.resolve();
                    }.bind(this)
                });
            }
        });
    }
);
