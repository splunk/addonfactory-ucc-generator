define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/Base',
        'models/Base',
        'models/classicurl',
        'models/datasets/Table',
        'models/datasets/TableAST',
        'models/datasets/commands/Base',
        'models/datasets/commands/InitialData',
        'models/datasets/DataSummarySearchJob',
        'models/datasets/PolymorphicDataset',
        'models/search/Job',
        'models/shared/TimeRange',
        'models/shared/fetchdata/ResultsFetchData',
        'models/services/search/jobs/ResultJsonRows',
        'models/datasets/DataSummaryResultJsonRows',
        'models/services/search/jobs/Summary',
        'models/datasets/DataSummarySummary',
        'models/services/search/jobs/Timeline',
        'models/services/data/ui/Pref',
        'collections/services/authorization/Roles',
        'collections/services/data/ui/Times',
        'collections/services/configs/SearchBNFs',
        'views/table/Master',
        'mixins/dataset',
        'util/general_utils',
        'splunk.util'
    ],
    function(
        _,
        $,
        Backbone,
        Base,
        BaseModel,
        classicUrlModel,
        TableModel,
        TableASTModel,
        BaseCommandModel,
        InitialDataCommandModel,
        DataSummarySearchJobModel,
        PolymorphicDatasetModel,
        SearchJobModel,
        TimeRangeModel,
        ResultsFetchDataModel,
        ResultJsonRowsModel,
        DataSummaryResultJsonRowsModel,
        SummaryModel,
        DataSummarySummaryModel,
        TimelineModel,
        UIPrefsModel,
        RolesCollection,
        TimesCollection,
        SearchBNFsCollection,
        TableView,
        datasetMixin,
        general_utils,
        splunkUtil
    ) {
        return Base.extend({
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);
                this.fetchUser = true;
                this.fetchUserPref = true;
                this.fetchAppLocals = true;
                this.fetchAppLocal = true;
                this.loadingMessage = _('Loading...').t();
                this.enableFooter = false;
                
                this.setPageTitle(_('Table').t());
                
                this.uiPrefsFilter = [
                    "^display.prefs.showSPL$"
                ];
                
                this.tableFilter = [
                    "^dataset\..*",
                    "^displayName$",
                    "^search$"
                ];
                
                this.urlFilter = [
                    "^dataset\..*"
                ];
                
                this.userPrefsFilter = [
                    "^default_earliest_time$",
                    "^default_latest_time$"
                ];

                // Models:
                // The Job that will get the current events/results set
                this.model.searchPointJob = new SearchJobModel({}, {delay: SearchJobModel.DEFAULT_POLLING_INTERVAL, processKeepAlive: true, keepAliveInterval: SearchJobModel.DEFAULT_LONG_POLLING_INTERVAL});
                // The Job that runs the loadjob and processing of the searchPoint (if necessary). If you are on a search point 
                // then two models will be the same pointer.
                this.model.currentPointJob = new SearchJobModel({}, {delay: SearchJobModel.DEFAULT_POLLING_INTERVAL, processKeepAlive: true, keepAliveInterval: SearchJobModel.DEFAULT_LONG_POLLING_INTERVAL});

                // The Job that powers the Data Summary component
                this.model.dataSummaryJob = new DataSummarySearchJobModel({}, {delay: SearchJobModel.DEFAULT_POLLING_INTERVAL, processKeepAlive: true, keepAliveInterval: SearchJobModel.DEFAULT_LONG_POLLING_INTERVAL});
                // We don't want realtime searches, so override the time range default
                this.model.dataSummaryTimeRange = new (TimeRangeModel.extend({
                    defaults: {
                        enableRealTime: false
                    }
                }))();
                this.collection.times = new TimesCollection();
                this.collection.roles = new RolesCollection();
                this.collection.searchBNFs = new SearchBNFsCollection();

                // We're going to mixin the dataset mixin, because table models are datasets too
                _.defaults(TableModel.prototype, datasetMixin);
                this.model.table = new TableModel();
                this.model.tablePristine = new TableModel();
                this.model.tableAST = new TableASTModel();
                this.model.classicUrl = classicUrlModel;
                
                /** Table Models **/
                this.model.resultJsonRows = new ResultJsonRowsModel();

                /** Data Summary Models **/
                this.model.dataSummarySummary = new DataSummarySummaryModel();
                this.model.dataSummaryTimeline = new TimelineModel();
                this.model.dataSummaryResultJsonRows = new DataSummaryResultJsonRowsModel();
                
                this.model.uiPrefs = new UIPrefsModel();
                this.model.state = new BaseModel();
                this.model.searchPointTimeRange = new TimeRangeModel({
                    earliest: '',
                    latest: 'now'
                });
                
                // Deferreds
                this.deferreds.uiPrefs = $.Deferred();
                this.deferreds.preloadReplaced = $.Deferred();
                this.deferreds.searchPointTimeRange = $.Deferred();
                this.deferreds.timesCollection = $.Deferred();
                this.deferreds.rolesCollection = $.Deferred();
                this.deferreds.searchBNFsCollection = $.Deferred();
            },
            
            // Our only Action method. This gets called by our route map in the Base router.
            page: function(locale, app, page) {
                Base.prototype.page.apply(this, arguments);

                // Fetch searchBNFs, which powers the search IDE experience in initial data's advanced search mode
                if (this.deferreds.searchBNFsCollection.state() !== 'resolved') {
                    this.collection.searchBNFs.fetch({
                        data: {
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner'),
                            count: 0
                        },
                        parseSyntax: true,
                        success: function (model, response) {
                            this.deferreds.searchBNFsCollection.resolve();
                        }.bind(this),
                        error: function (model, response) {
                            this.deferreds.searchBNFsCollection.resolve();
                        }.bind(this)
                    });
                }

                this.baseActivateDeferred = $.Deferred();
                this.baseDeactivateDeferred = $.Deferred();

                if (!this.shouldRender) {
                    // Deactivating cleans up the models and attempts to stop in flight requests
                    this.deactivate();
                } else {
                    this.baseDeactivateDeferred.resolve();
                }

                // Fetch the necessary models
                if (this.deferreds.uiPrefs.state() !== 'resolved') {
                    this.model.uiPrefs.bootstrap(this.deferreds.uiPrefs, this.model.application.get("page"), this.model.application.get("app"), this.model.application.get("owner"));
                }

                // Get the timerange of now for the session of creating searchPoint jobs
                if (this.deferreds.searchPointTimeRange.state() !== 'resolved') {
                    this.timeRangeBootstrap(this.deferreds.searchPointTimeRange, this.model.searchPointTimeRange);
                }

                // Get the times collection for creating data summary job
                if (this.deferreds.timesCollection.state() !== 'resolved') {
                    this.timesCollectionBootstrap(this.deferreds.timesCollection);
                }

                if (this.deferreds.rolesCollection.state() !== 'resolved') {
                    this.rolesCollectionBootstrap(this.deferreds.rolesCollection);
                }

                // When we have properly deactivated we know that we are in a clean state where
                // all of the previous payloads have been cleaned up and fetches in flight have
                // been stopped.
                $.when(this.baseDeactivateDeferred).then(function(){
                    // Data bootstrap deferred
                    this.bootstrapDeferred = $.Deferred();

                    // Wait till we get the UI Prefs because they will need to be layered in over the table's keys
                    $.when(this.deferreds.userPref, this.deferreds.uiPrefs, this.deferreds.searchPointTimeRange).then(function() {

                        // Get the values from the query string of the URL in a model with them as key/value pairs
                        this.model.classicUrl.fetch({
                            success: function(model, response) {

                                // Fetch the remaining models to be bootstrapped and then merge the datasources:
                                // 1. The URL
                                // 2. The UI Prefs
                                // 3. The Table model
                                // 4. The 'from' Table/Dataset
                                // 5. The job (potentially)
                                this.syncFromClassicURL();
                            }.bind(this)
                        });
                    }.bind(this));

                    // Wait till the 'pageView,' which is the wrapper of all the content, has been
                    // rendered to initialize our own view
                    $.when(this.deferreds.pageViewRendered, this.deferreds.searchBNFsCollection).then(function() {
                        if (this.shouldRender) {
                            this.initializeTableView();
                            // Get rid of the preload DOM and put in the pageView DOM
                            $('.preload').replaceWith(this.pageView.el);
                            this.deferreds.preloadReplaced.resolve();
                        }
                    }.bind(this));

                    $.when(
                        // These deferreds for model bootstrapping come from the Base router
                        this.deferreds.appLocal,
                        this.deferreds.appLocals,
                        this.deferreds.user,
                        this.deferreds.pageViewRendered,
                        this.deferreds.preloadReplaced,
                        this.deferreds.serverInfo,
                        this.bootstrapDeferred
                    ).then(function() {
                        // set up all the listeners down the tree of the table views
                        this.tableView.activate({ deep: true, skipRender: true });
                        // set up our listeners
                        this.activate();

                        // We only have to render the table view on the first time load
                        if (this.shouldRender) {
                            this.tableView.render().replaceContentsOf($('.main-section-body'));
                            $(document).trigger('rendered');
                        }
                    }.bind(this));
                }.bind(this));
           },
            
            // Remember: if you add a listener on anything, you MUST call .off() on that same object in deactivate!
            activate: function() {
                this.model.state.set('pageViewCount', this.pageViewCount);

                // Arbitrators to determine when to push on the history stack
                this.model.table.entry.content.on('change', function(model, options) {
                    var changed = this.model.table.entry.content.changedAttributes(),
                        uiPrefsPopulationDeferred = $.Deferred();

                    options = options || {};

                    this.populateUIPrefs(uiPrefsPopulationDeferred, changed);

                    $.when(uiPrefsPopulationDeferred).always(function() {

                        // the id of the table has been updated
                        if (this.model.table.id && (this.model.table.id !== this.model.tablePristine.id)) {
                            options.forceAttrs = { t: this.model.table.id };
                            options.forceTrigger = true;
                        }

                        this.populateClassicUrl(changed, options);
                    }.bind(this));
                }, this);

                this.model.table.on('change:id', function(){
                    this.model.classicUrl.save(
                        {
                            't': this.model.table.id
                        },
                        {
                            trigger: true
                        }
                    );
                }, this);

                this.model.table.entry.content.on('newSample', function() {
                    // Only produce a new sample if we have a search job already
                    if (this.model.classicUrl.get('spsid') || this.model.classicUrl.get('cpsid')) {

                        // Ensure that the 'now' timestamp has been reset
                        this.model.searchPointTimeRange.set({
                            latest: 'now',
                            latest_epoch: undefined,
                            sample_seed: undefined
                        });
                        this.deferreds.searchPointTimeRange = $.Deferred();

                        // Blow away the existing search jobs and force a new page route
                        this.model.classicUrl.save(
                            {
                                spsid: undefined,
                                cpsid: undefined
                            },
                            {
                                trigger: true
                            }
                        );
                    }
                }, this);

                this.model.dataSummaryJob.on('reload', this.loadNewSummaryJob, this);
            },
            
            // Deactivating cleans up the models and attempts to stop in flight requests
            deactivate: function() {
                // deactivate the table view tree first to make sure there are no side effects to cleaning up the models
                this.tableView.deactivate({ deep: true });
                
                if (!this.shouldRender) {
                    this.model.state.off(null, null, this);
                    this.model.table.off(null, null, this);
                    this.model.table.entry.content.off(null, null, this);
                }
                
                this.model.searchPointJob.off(null, null, this);
                this.model.currentPointJob.off(null, null, this);
                this.model.dataSummaryJob.off(null, null, this);

                if (!this.model.state.get('fastRoute')) {
                    this.model.searchPointJob.clear();
                    this.model.currentPointJob.clear();
                    this.model.dataSummaryJob.clear();
                    this.model.dataSummaryTimeRange.clear({setDefaults: true});
                    this.model.dataSummarySummary.fetchAbort();
                    this.model.dataSummarySummary.clear();
                    this.model.dataSummaryTimeline.fetchAbort();
                    this.model.dataSummaryTimeline.clear();
                    this.model.dataSummaryResultJsonRows.fetchAbort();
                    this.model.dataSummaryResultJsonRows.clear();
                    this.model.state.clear();
                    this.model.table.clear({setDefaults: true});
                    this.model.tablePristine.clear({setDefaults: true});
                    this.model.tableAST.fetchAbort();
                    this.model.tableAST.clear();
                    this.model.resultJsonRows.fetchAbort();
                    this.model.resultJsonRows.clear();
                }
                
                // This deferred is a hold over from when we had to perform async job cleanup like pausing
                // Since this will most likely come back we should keep the interface to this method be async.
                this.baseDeactivateDeferred.resolve();
            },
            
            // Create the router's table view tree
            initializeTableView: function () {
                if (!this.tableView) {
                    this.tableView = new TableView({
                        model: {
                            application: this.model.application,
                            appLocal: this.model.appLocal,
                            config: this.model.config,
                            currentPointJob: this.model.currentPointJob,
                            dataSummaryJob: this.model.dataSummaryJob,
                            dataSummaryResultJsonRows: this.model.dataSummaryResultJsonRows,
                            dataSummarySummary: this.model.dataSummarySummary,
                            dataSummaryTimeline: this.model.dataSummaryTimeline,
                            dataSummaryTimeRange: this.model.dataSummaryTimeRange,
                            resultJsonRows: this.model.resultJsonRows,
                            searchPointJob: this.model.searchPointJob,
                            serverInfo: this.model.serverInfo,
                            state: this.model.state,
                            table: this.model.table,
                            tablePristine: this.model.tablePristine,
                            tableAST: this.model.tableAST,
                            user: this.model.user
                        },
                        collection: {
                            appLocals: this.collection.appLocals,
                            roles: this.collection.roles,
                            searchBNFs: this.collection.searchBNFs,
                            times: this.collection.times
                        },
                        deferreds: {
                            appLocal: this.deferreds.appLocal,
                            user: this.deferreds.user
                        }
                    });
                }
            },
            
            // Fetch the remaning models to be bootstrapped and then merge the datasources
            syncFromClassicURL: function(options) {
                options = options || {};
                
                // The deferreds for fetching and ensuring the models have been prepared and merged
                var searchPointJobFetchDeferred = options.searchPointJobFetchDeferred || $.Deferred(),
                    searchPointJobCreationDeferred = options.searchPointJobCreationDeferred || $.Deferred(),
                    currentPointJobFetchDeferred = options.currentPointJobFetchDeferred || $.Deferred(),
                    currentPointJobCreationDeferred = options.currentPointJobCreationDeferred || $.Deferred(),
                    tableFetchDeferred = options.tableFetchDeferred || $.Deferred(),
                    updateSPLDeferreds = options.updateSPLDeferreds || [],
                    determineAndCreateSearchPointJobDeferred = options.determineAndCreateSearchPointJobDeferred || $.Deferred(),
                    determineAndCreateCurrentPointJobDeferred = options.determineAndCreateCurrentPointJobDeferred || $.Deferred(),
                    dataSummaryJobFetchDeferred = options.dataSummaryJobFetchDeferred || $.Deferred(),
                    dataSummaryJobCreationDeferred = options.dataSummaryJobCreationDeferred || $.Deferred(),
                    dataSummaryTimeRangeDeferred = options.dataSummaryTimeRangeDeferred || $.Deferred(),
                    determineAndCreateDataSummaryJobDeferred = options.determineAndCreateDataSummaryJobDeferred || $.Deferred(),
                    tableASTFetchDeferred = options.tableASTDeferred || $.Deferred(),
                    //Set fetchUserPref to true to layer in user prefs
                    timeRangeAttrsFromUserPrefs = this.model.userPref ? this.model.userPref.entry.content.filterByWildcards(this.userPrefsFilter) : {},
                    timeRangeAttrsFromTable,
                    timeRangeArrsFromUrl,
                    // The following define what querystring characters we expect for the table page
                    tableIdFromUrl = this.model.classicUrl.get('t'),
                    
                    // bs defines a baseSearch, and will be ignored if the table is defined in the url
                    // with commands or directly with 't'
                    baseSearchFromUrl = splunkUtil.stripLeadingSearchCommand(this.model.classicUrl.get('bs')),
                    
                    // The two job ids tell us how to reconstitute the UI without running new searches
                    searchPointJobIdFromUrl = this.model.classicUrl.get('spsid'),
                    currentPointJobIdFromUrl = this.model.classicUrl.get('cpsid'),
                    dataSummaryJobIdFromUrl = this.model.classicUrl.get('dssid'),

                    // Use a filter to get all the other attributes we care about in one object
                    attrsFromUrl = this.model.classicUrl.filterByWildcards(this.urlFilter, { allowEmpty: true }),
                    
                    // Turning off ui-prefs is from a QA request so they can test without it
                    uiPrefsOffFromUrl = this.model.classicUrl.get('uiprefsoff'),
                    attrsFromUIPrefs = {};


                if (this.model.state.get('fastRoute') && !this.shouldRender) {
                    // Need to set this, as we may be coming from a forward button state
                    this.model.table.entry.content.set($.extend(true, {}, attrsFromUrl));
                    
                    // During the normal new page route we have multiple asynchronous waits that allow
                    // Backbone to clear out the listeners on the models and collections that we pass down.
                    // Because fastRoute circumvents all async calls we still need some way to make sure
                    // we don't have lots of queued up listeners fired. Debouncing the resolution of this
                    // deferred allows Backbone to clear all of it listeners while the Table router's 
                    // listeners are deactivated.
                    _.debounce(function() {
                        // Resolve the deferred and return;  No need to kick off new jobs, etc.
                        this.bootstrapDeferred.resolve();
                        this.model.state.unset('fastRoute');
                    }.bind(this), 0)();
                    
                    return;
                }

                // For testing purposes we will not use UI prefs if the url tells us to
                if (!uiPrefsOffFromUrl) {
                    attrsFromUIPrefs = this.model.uiPrefs.entry.content.filterByWildcards(this.uiPrefsFilter);
                }
                
                // If we don't have a table, basesearch, or commands defined, then we should show the empty page state.
                // Note that on the search page you could reconstitute the UI from sharing a job.
                // Job sharing is not possible here and they should not be expected to reconstitute the UI
                if (!tableIdFromUrl && !baseSearchFromUrl && !attrsFromUrl['dataset.commands']) {
                    this.mergeIntoTableFromEmptyState(attrsFromUIPrefs, attrsFromUrl);
                    this.model.state.set('initialDataState', InitialDataCommandModel.STATES.EDITING);
                    return;
                }

                // Fetch the table
                this.tableBootstrap(tableFetchDeferred, searchPointJobFetchDeferred, currentPointJobFetchDeferred, tableIdFromUrl, baseSearchFromUrl);

                $.when(tableFetchDeferred).then(function() {
                    // Merge the attrs from the ui prefs into the table
                    this.mergeAttrsFromUIPrefsIntoTable(attrsFromUIPrefs);

                    // Merge attrs from the url into the table, they always trump everything else
                    this.model.table.entry.content.set($.extend(true, {}, attrsFromUrl));
                    // Once per page route, we need to update the SPL of all the commands to ensure they're in a proper state
                    updateSPLDeferreds = this.updateTableCommandsAndSelectedColumns();

                    // Updating can be async for any commands that use the AST. Wait until they're all done before continuing.
                    $.when.apply($, updateSPLDeferreds).always(function() {
                        // Set the search on the table to be saved as the full search from the commands
                        // if there are no commands then set the search to be the baseSearch from the url
                        this.model.table.entry.content.set('search', this.model.table.getFullSearch() || baseSearchFromUrl);
                        // Need this before kicking off search jobs
                        this.tableASTBootstrap(tableASTFetchDeferred);

                        $.when(tableASTFetchDeferred).then(function() {
                            if (this.model.table.isTableMode()) {
                                // Fetch the searchPointJob
                                this.searchPointJobBootstrap(searchPointJobFetchDeferred, searchPointJobIdFromUrl);

                                // Fetch the currentPointJob after the searchPointJob because they may be the same job
                                $.when(searchPointJobFetchDeferred).then(function() {
                                    this.currentPointJobBootstrap(currentPointJobFetchDeferred, currentPointJobIdFromUrl, searchPointJobIdFromUrl);
                                    // Once we have fetched the table and the jobs, we have all the data we need to merge to the correct table
                                    $.when(currentPointJobFetchDeferred).then(function() {
                                        dataSummaryJobCreationDeferred.resolve();
                                        determineAndCreateDataSummaryJobDeferred.resolve();

                                        this.determineAndCreateSearchPointJob(
                                            determineAndCreateSearchPointJobDeferred,
                                            searchPointJobCreationDeferred,
                                            currentPointJobCreationDeferred
                                        );
                                    }.bind(this));
                                }.bind(this));

                            } else {
                                // Fetch the dataSummaryJob
                                this.dataSummaryJobBootstrap(dataSummaryJobFetchDeferred, dataSummaryJobIdFromUrl);

                                $.when(dataSummaryJobFetchDeferred).then(function() {
                                    searchPointJobCreationDeferred.resolve();
                                    currentPointJobCreationDeferred.resolve();
                                    determineAndCreateSearchPointJobDeferred.resolve();
                                    determineAndCreateCurrentPointJobDeferred.resolve();
                                    tableASTFetchDeferred.resolve();

                                    timeRangeAttrsFromTable = {
                                        earliest: this.model.table.entry.content.get('dataset.display.datasummary.earliestTime'),
                                        latest: this.model.table.entry.content.get('dataset.display.datasummary.latestTime')
                                    };
                                    timeRangeArrsFromUrl = {
                                        earliest: attrsFromUrl['dataset.display.datasummary.earliestTime'],
                                        latest: attrsFromUrl['dataset.display.datasummary.latestTime']
                                    };
                                    this.mediateUserPrefsTimeRangeAttrs(timeRangeAttrsFromUserPrefs);

                                    // If the table is new, want want to layer user prefs over any empty
                                    // strings coming from the timerange attributes
                                    if (this.model.table.isNew()) {
                                        // User jquery's extend so we rid ourselves of undefined attrs
                                        this.model.dataSummaryTimeRange.set($.extend({},
                                            timeRangeAttrsFromTable,
                                            timeRangeAttrsFromUserPrefs,
                                            timeRangeArrsFromUrl
                                        ), false);
                                    } else {
                                        this.model.dataSummaryTimeRange.set($.extend({},
                                            timeRangeAttrsFromTable,
                                            timeRangeArrsFromUrl
                                        ), false);
                                    }
                                    this.timeRangeBootstrap(dataSummaryTimeRangeDeferred, this.model.dataSummaryTimeRange);

                                    $.when(dataSummaryTimeRangeDeferred).then(function() {
                                        this.determineAndCreateDataSummaryJob(
                                            determineAndCreateDataSummaryJobDeferred,
                                            dataSummaryJobCreationDeferred
                                        );
                                    }.bind(this));
                                }.bind(this));
                            }
                        }.bind(this));
                    }.bind(this));
                }.bind(this));

                // Once the searchPointJob has been created (or verified, or skipped) we are close to done syncing
                // NOTE: we cannot make the currentPointJob until the searchPointJob has gotten pass the prepared stage
                $.when(determineAndCreateSearchPointJobDeferred).then(function() {
                    if (this.model.table.isTableMode()) {
                        // OK, so now we need to know if we actually made a searchPointJob after all that
                        if (!this.model.searchPointJob.isNew()){
                            // We need a search that is done in order to create the current point job.
                            if (this.model.searchPointJob.isDone()) {
                                // We know that we can safely create the currentPointJob
                                this.determineAndCreateCurrentPointJob(
                                    determineAndCreateCurrentPointJobDeferred,
                                    currentPointJobCreationDeferred
                                );
                                
                                this.registerSearchPointJobFriends();
                            } else {
                                // We cannot safely create the currentPointJob at this time because the searchPointJob needs
                                // to be passed prepared to know if it is transforming, but we also don't want to hold up rendering the UI.
                                // We create a one time listener to capture when the job is prepared and do the right thing
                                this.listenToOnce(this.model.searchPointJob, 'done', function() {
                                    var determineAndCreateCurrentPointJobDfd = $.Deferred(),
                                        currentPointJobCreationDfd = $.Deferred();

                                    // We know that we can safely create the currentPointJob
                                    this.determineAndCreateCurrentPointJob(
                                        determineAndCreateCurrentPointJobDfd,
                                        currentPointJobCreationDfd
                                    );

                                    this.registerSearchPointJobFriends();

                                    $.when(determineAndCreateCurrentPointJobDfd).then(function() {
                                        if (!this.model.currentPointJob.isNew()){

                                            if (!this.model.currentPointJob.isPreparing()) {
                                                this.registerCurrentPointJobFriends();
                                            } else {
                                                this.listenToOnce(this.model.currentPointJob, 'prepared', function() {
                                                    this.registerCurrentPointJobFriends();
                                                }.bind(this));
                                            }

                                            if (this.model.currentPointJob.id !== this.model.searchPointJob.id) {
                                                this.model.currentPointJob.startPolling();
                                            }
                                            this.populateClassicUrlFromCurrentPointJob();
                                        }
                                    }.bind(this));
                                }.bind(this));
                                determineAndCreateCurrentPointJobDeferred.resolve();
                            }
                            
                            this.populateClassicUrlFromSearchPointJob();
                            this.model.searchPointJob.startPolling();
                        } else {
                            determineAndCreateCurrentPointJobDeferred.resolve();
                        }
                    } else {
                        // If we are not in table mode then we should make sure to keep the jobs from the
                        // table mode alive.
                        if (!this.model.searchPointJob.isNew()) {
                            // Poll the search point job so it stays alive
                            this.model.searchPointJob.startPolling();
                        }
                    }
                }.bind(this));
                
                $.when(determineAndCreateCurrentPointJobDeferred).then(function() {
                    if (this.model.table.isTableMode()) {
                        if (!this.model.currentPointJob.isNew()) {
                            if (!this.model.currentPointJob.isPreparing()) {
                                this.registerCurrentPointJobFriends();
                            } else {
                                this.listenToOnce(this.model.currentPointJob, 'prepared', function() {
                                    this.registerCurrentPointJobFriends();
                                }.bind(this));
                            }

                            if (this.model.currentPointJob.id !== this.model.searchPointJob.id) {
                                this.model.currentPointJob.startPolling();
                            }
                            
                            this.populateClassicUrlFromCurrentPointJob();
                        }
                    } else {
                        // If we are not in table mode then we should make sure to keep the jobs from the
                        // table mode alive.
                        if (!this.model.currentPointJob.isNew()) {
                            if (this.model.currentPointJob.id !== this.model.searchPointJob.id) {
                                this.model.currentPointJob.startPolling();
                            }
                        }
                    }
                }.bind(this));

                $.when(determineAndCreateDataSummaryJobDeferred).then(function() {
                    if (this.model.table.isDataSummaryMode()) {
                        if (!this.model.dataSummaryJob.isNew()) {
                            if (!this.model.dataSummaryJob.isPreparing()) {
                                this.registerDataSummaryJobFriends();
                            } else {
                                this.listenToOnce(this.model.dataSummaryJob, 'prepared', function() {
                                    this.registerDataSummaryJobFriends();
                                }.bind(this));
                            }
    
                            this.model.dataSummaryJob.startPolling();
    
                            this.populateClassicUrlFromDataSummaryJob();
                        } else {
                            // If we are not in data summary mode then we should make sure to keep the jobs from the
                            // data summary mode alive.
                            if (!this.model.dataSummaryJob.isNew()) {
                                this.model.dataSummaryJob.startPolling();
                            }
                        }
                    }
                }.bind(this));

                $.when(determineAndCreateSearchPointJobDeferred,
                        determineAndCreateCurrentPointJobDeferred,
                        determineAndCreateDataSummaryJobDeferred).then(function() {
                    // Yes, we are actually all done and ready to render some tables!
                    this.bootstrapDeferred.resolve();
                }.bind(this));
            },
            
            // This is the case where we don't have a table or basesearch defined in the URL
            mergeIntoTableFromEmptyState: function(attrsFromUIPrefs, attrsFromUrl) {
                // Fetch the defaults from _new
                var tableFetchDeferred = this.model.table.fetch();

                $.when(tableFetchDeferred).always(function() {
                    // Merge the attrs from the url and the UI Prefs into the table
                    this.model.table.entry.content.set($.extend(true, {}, attrsFromUIPrefs, attrsFromUrl));

                    // We need to set the first base search command to be edited
                    this.model.table.initBaseCommand();

                    // All done signal
                    this.bootstrapDeferred.resolve();
                }.bind(this));
            },
            
            // Fetches and prepares the table model
            tableBootstrap: function(tableFetchDeferred, searchPointJobFetchDeferred, currentPointJobFetchDeferred, tableIdFromUrl, baseSearchFromUrl) {
                if (tableIdFromUrl) {
                    this.model.table.set("id", tableIdFromUrl);
                }

                // Fetch the table no matter what.
                // If we don't have an id then we need the defaults.
                this.model.table.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner")
                    },
                    
                    success: function(model, response){
                        // Set the table pristine before anything else has been merged into the table model
                        this.model.tablePristine.setFromSplunkD(this.model.table.toSplunkD());
                        tableFetchDeferred.resolve();
                    }.bind(this),
                    
                    // No table, the only thing we can do is try to fall back to the baseSearch
                    error: function(model, response){
                        var errorResponse = response;
                        
                        // This id, if it existed, was no good. Take it out of the URL
                        this.model.table.unset("id");
                        this.model.classicUrl.save({t: undefined}, {replaceState: true});
                        
                        if (tableIdFromUrl && !baseSearchFromUrl) {
                            // The user only provided a bad tableId.
                            // We should initialize the UI with the bad table.
                            this.model.table._onerror(this.model.table, errorResponse);
                            
                            // Resolve all of our needed deferreds
                            tableFetchDeferred.resolve();
                            searchPointJobFetchDeferred.resolve();
                            currentPointJobFetchDeferred.resolve();
                        } else {
                            // Now that we have cleared out the id...
                            // Fetch the table defaults and populate the table with them,
                            // and put the table into an error state.
                            this.model.tablePristine.fetch({
                                success: function(model, response) {
                                    this.model.table.setFromSplunkD(this.model.tablePristine.toSplunkD());
                                    this.model.table._onerror(this.model.table, errorResponse);
                                    tableFetchDeferred.resolve();
                                }.bind(this),
                                error: function(model, response) {
                                    // this is extremely bad, it means we couldn't fetch _new
                                    tableFetchDeferred.resolve();
                                }.bind(this)
                            });
                        }
                    }.bind(this)
                });
            },
            
            // Fetches the searchPointJob
            searchPointJobBootstrap: function(searchPointJobFetchDeferred, searchPointJobIdFromUrl) {
                // Only fetch the job if we have an id
                if (searchPointJobIdFromUrl) {
                    this.model.searchPointJob.set("id", searchPointJobIdFromUrl);
                    
                    this.model.searchPointJob.fetch({
                        success: function(model, response){
                            searchPointJobFetchDeferred.resolve();
                        }.bind(this),
                        
                        // The job no longer exists
                        error: function(model, response){
                            // This id, if it existed, was no good. Take it out of the URL
                            this.model.classicUrl.save({spsid: undefined}, {replaceState: true});
                            this.model.searchPointJob.unset("id");
                            
                            // We will end up making a new searchPointjob so we leave it new
                            searchPointJobFetchDeferred.resolve();
                        }.bind(this)
                    });
                } else {
                    searchPointJobFetchDeferred.resolve();
                }
            },
            
            // Fetches the currentPointJob
            currentPointJobBootstrap: function(currentPointJobFetchDeferred, currentPointJobIdFromUrl, searchPointJobIdFromUrl) {
                // If the searchPointJob is new still, then this job must also be new
                if (this.model.searchPointJob.isNew()) {
                    currentPointJobFetchDeferred.resolve();
                    return;
                }
                
                // See if the currentPointJob and searchPointJob are the same job
                if (currentPointJobIdFromUrl === searchPointJobIdFromUrl) {
                    this.model.currentPointJob.setFromSplunkD(this.model.searchPointJob.toSplunkD());
                    currentPointJobFetchDeferred.resolve();
                    return;
                }
                
                // Only fetch the job if we have an id
                if (currentPointJobIdFromUrl) {
                    this.model.currentPointJob.set("id", currentPointJobIdFromUrl);
                    
                    this.model.currentPointJob.fetch({
                        success: function(model, response){
                            currentPointJobFetchDeferred.resolve();
                        }.bind(this),
                        
                        // The job no longer exists
                        error: function(model, response){
                            // This id, if it existed, was no good. Take it out of the URL
                            this.model.classicUrl.save({cpsid: undefined}, {replaceState: true});
                            this.model.currentPointJob.unset("id");
                            
                            // We will end up making a new currentPointjob
                            currentPointJobFetchDeferred.resolve();
                        }.bind(this)
                    });
                } else {
                    currentPointJobFetchDeferred.resolve();
                }
            },

            dataSummaryJobBootstrap: function(dataSummaryJobFetchDeferred, dataSummaryJobIdFromUrl) {
                // Only fetch the job if we have an id
                if (dataSummaryJobIdFromUrl) {
                    this.model.dataSummaryJob.set("id", dataSummaryJobIdFromUrl);

                    this.model.dataSummaryJob.fetch({
                        success: function(model, response){
                            dataSummaryJobFetchDeferred.resolve();
                        }.bind(this),

                        // The job no longer exists
                        error: function(model, response){
                            // This id, if it existed, was no good. Take it out of the URL
                            this.model.classicUrl.save({dssid: undefined}, {replaceState: true});
                            this.model.dataSummaryJob.unset("id");

                            // We will end up making a new dataSummaryJob so we leave it new
                            dataSummaryJobFetchDeferred.resolve();
                        }.bind(this)
                    });
                } else {
                    dataSummaryJobFetchDeferred.resolve();
                }
            },

            // Fetch the timerange for the jobs that power the table or the
            // summary search timerangepicker
            timeRangeBootstrap: function(timeRangeDeferred, timeRangeModel) {
                timeRangeModel.save({},
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
            
            // Fetch the AST for the current command
            tableASTBootstrap: function(tableASTFetchDeferred) {
                // We need the ast in the table model for getting the diversity component
                var currentCommandIdx = this.model.table.getCurrentCommandIdx(),
                    search = this.model.table.getSearch(currentCommandIdx);
                
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
            },

            timesCollectionBootstrap: function(timesCollectionDeferred) {
                this.collection.times.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        count: -1
                    },
                    success: function(model, response) {
                        timesCollectionDeferred.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        timesCollectionDeferred.resolve();
                    }.bind(this)
                });
            },

            rolesCollectionBootstrap: function(rolesCollectionDeferred) {
                this.collection.roles.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        count: -1
                    },
                    success: function(model, response) {
                        rolesCollectionDeferred.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        rolesCollectionDeferred.resolve();
                    }.bind(this)
                });
            },

            // merges in the attrs from the UI Prefs into the table depending on if the
            // table is new or not
            mergeAttrsFromUIPrefsIntoTable: function(attrsFromUIPrefs) {
                if (this.model.table.isNew()) {
                    // The ui prefs should trump the table defaults
                    this.model.table.entry.content.set($.extend({}, attrsFromUIPrefs));
                } else {
                    // The values we get from the table should trump the ui pref values
                    var defaults = this.model.table.entry.content.toJSON();
                    _.defaults(defaults, attrsFromUIPrefs);
                    this.model.table.entry.content.set($.extend({}, defaults));
                }
            },

            updateTableCommandsAndSelectedColumns: function() {
                var updateSPLDeferreds;

                this.model.table.setSelectedColumnsForNewCommandIndex(this.model.table.getCurrentCommandIdx());
                
                updateSPLDeferreds = this.model.table.commands.map(function(command) {
                    if (!command.isNew()) {
                        return command.updateSPL();
                    }
                }.bind(this));
                
                $.when.apply($, updateSPLDeferreds).always(function() {
                    this.model.classicUrl.save({
                        'dataset.commands': this.model.table.entry.content.get('dataset.commands'),
                        'dataset.display.selectedColumns': this.model.table.entry.content.get('dataset.display.selectedColumns')
                    }, {
                        replaceState: true
                    });
                }.bind(this));
                
                return updateSPLDeferreds;
            },
            
            // Determines if the searchPointJob is the correct job for the table at the currently selected command
            shouldStartNewSearchPointSearch: function(nearestSearchPointIdx) {
                var search,
                    isTransforming = this.model.tableAST.isTransforming();
                
                if (!this.model.table.isTableMode()) {
                    return false;
                }

                search = this.model.table.getSearch();
                // There's no search for the search point job, so return false here
                if (search === "") {
                    return false;
                }
                
                if (this.model.searchPointJob.isNew()) {
                    return true;
                }

                search = this.model.table.getSearch(nearestSearchPointIdx, {
                    respectSearchPoints: true,
                    isTransforming: isTransforming
                });

                // If the current searchPointJob has the correct search then no need to run again
                if (splunkUtil.stripLeadingSearchCommand(this.model.searchPointJob.getSearch()) === search) {
                    
                    // If the search's sample ratio matches the Table's sample ratio then we have the same diversity setting.
                    if (this.model.table.getDispatchRatio({isTransforming: isTransforming}) === this.model.searchPointJob.entry.content.get('sampleRatio')) {
                        return false;
                    }
                }
                
                return true;
            },
            
            // Figure out from the currently chosen command position if the searchPointJob is the correct
            // one, create it if it isn't
            determineAndCreateSearchPointJob: function(determineAndCreateSearchPointJobDeferred, searchPointJobCreationDeferred, currentPointJobCreationDeferred) {
                var currentCommandIdx = this.model.table.getCurrentCommandIdx(),
                    nearestSearchPointIdx = this.model.table.getNearestSearchPointIdx(currentCommandIdx, nearestSearchPointIdx),
                    shouldStartNewSearchPointSearch = this.shouldStartNewSearchPointSearch(nearestSearchPointIdx),
                    isLastCommand = _.isUndefined(currentCommandIdx) || (currentCommandIdx === (this.model.table.commands.length - 1)),
                    // if the dataset was not created with the table builder then it will not have dataset.commands populated
                    shouldMigrateTable = (this.model.table.isNew() && !this.model.table.entry.content.get('dataset.commands')) && isLastCommand,
                    isTransforming = this.model.tableAST.isTransforming(),
                    syncJobPreview, search, searchPointLatestTime, eaiAST, eaiASTDeferred;

                if (shouldMigrateTable) {
                    // Fetch a Table AST now to get the potential EAI model
                    eaiAST = new TableASTModel({
                        spl: splunkUtil.addLeadingSearchCommand(this.model.table.entry.content.get('search'), true)
                    });
                    eaiASTDeferred = $.Deferred();

                    eaiAST.fetch({
                        success: function(model, response) {
                            eaiASTDeferred.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            eaiASTDeferred.resolve();
                        }.bind(this)
                    });
                    
                    $.when(eaiASTDeferred).then(function() {
                        // set the AST onto the table model so that the table model can introspect the AST
                        this.model.table.ast = eaiAST;
                        
                        var fromDatasetPayloads = eaiAST.getFromCommandObjectPayloads(),
                            fromDatasetObject = fromDatasetPayloads[fromDatasetPayloads.length - 1],
                            selectedDataset;
                            
                        // Now that we have fetched the AST we can see if there is a dataset
                        // associated with this search
                        if (fromDatasetObject && fromDatasetObject.eai) {
                            // Now we need to instantiate the selectedDataset
                            
                            selectedDataset = new PolymorphicDatasetModel(fromDatasetObject.eai, { parse: true });
                            
                            this.model.table.migrateFromSearch({
                                selectedDataset: selectedDataset,
                                selectedMethod: InitialDataCommandModel.METHODS.DATASET
                            });
                        } else {
                            this.model.table.migrateFromSearch();
                        }
                        
                        // Make sure the URL reflects the migration
                        this.populateClassicUrlFromTable();
                        
                        // Use the initial data command search to start the new job
                        search = this.model.table.getSearch(0, {
                            respectSearchPoints: true,
                            isTransforming: isTransforming
                        });

                        // If we have a search, that means we have at least one complete command
                        if (search) {
                            this.startNewSearch(
                                searchPointJobCreationDeferred,
                                this.model.searchPointJob,
                                search,
                                {
                                    latest_time: this.model.searchPointTimeRange.get('latest_epoch'),
                                    sample_ratio: this.model.table.getDispatchRatio({isTransforming: isTransforming})
                                }
                            );
                        // If we don't, then we're not going to make a searchPointJob anyway, so just resolve the
                        // deferred. The initial table modal will handle the rest.
                        } else {
                            // There should never be a search job running here, because startNewSearch (which creates
                            // the first job) blows up if we have no search string, and we wouldn't be in this area
                            // of the code if we had a search string. Best to just stoppolling/clear to be safe.
                            this.model.searchPointJob.stopPolling();
                            this.model.searchPointJob.clear();
                            this.model.currentPointJob.stopPolling();
                            this.model.currentPointJob.clear();
                            this.model.resultJsonRows.clear();

                            searchPointJobCreationDeferred.resolve();
                            currentPointJobCreationDeferred.resolve();
                            this.bootstrapDeferred.resolve();
                        }
                    }.bind(this));
                
                } else if (shouldStartNewSearchPointSearch) {
                    
                    search = this.model.table.getSearch(nearestSearchPointIdx, {
                        respectSearchPoints: true,
                        isTransforming: isTransforming
                    });

                    // Make sure we try to re-use the same sample_seed from the starting searchPointJob
                    this.startNewSearch(
                        searchPointJobCreationDeferred,
                        this.model.searchPointJob,
                        search,
                        {
                            latest_time: this.model.searchPointTimeRange.get('latest_epoch'),
                            sample_ratio: this.model.table.getDispatchRatio({isTransforming: isTransforming}),
                            sample_seed: this.model.searchPointTimeRange.get('sample_seed')
                        }
                    );

                } else {
                    // Make sure that the searchPointJob has the preview set to true
                    // someone from the job manager or even the search page could have set it to false
                    if (this.model.searchPointJob.entry.acl.canWrite()) {
                        syncJobPreview = this.model.searchPointJob.setPreview(true);
                    } else {
                        syncJobPreview = $.Deferred().resolve();
                    }

                    // Migrate the lastest time from the job into the searchPointTimeRange.
                    // Also get the sample seed so that the same seed is used across this
                    // instance of the table router.
                    searchPointLatestTime = this.model.searchPointJob.getDispatchLatestTime();
                    this.model.searchPointTimeRange.set({
                        latest: searchPointLatestTime,
                        latest_epoch: searchPointLatestTime,
                        sample_seed: this.model.searchPointJob.entry.content.get('sampleSeed')
                    });

                    syncJobPreview.always(function(){
                        searchPointJobCreationDeferred.resolve();
                    }.bind(this));
                }

                $.when(searchPointJobCreationDeferred).then(function(){
                    determineAndCreateSearchPointJobDeferred.resolve();
                }.bind(this));
            },
            
            // Determines if the currentPointJob is the correct job for the table at the currently selected command
            shouldStartNewCurrentPointSearch: function(search, currentCommandIdx, nearestSearchPointIdx) {
                if (!this.model.table.isTableMode()) {
                    return false;
                }
                
                if (currentCommandIdx === nearestSearchPointIdx) {
                    return false;
                }
                
                if (splunkUtil.stripLeadingSearchCommand(this.model.currentPointJob.getSearch()) === search) {
                    return false;
                }
                
                return true;
            },
            
            // Figure out from the currently chosen command position if the currentPointJob is the correct
            // one, create it if it isn't
            determineAndCreateCurrentPointJob: function(determineAndCreateCurrentPointJobDeferred, currentPointJobCreationDeferred) {
                var currentCommandIdx = this.model.table.getCurrentCommandIdx(),
                    nearestSearchPointIdx = this.model.table.getNearestSearchPointIdx(currentCommandIdx),
                    search = this.model.table.getSearch(currentCommandIdx, {
                        respectSearchPoints: true,
                        searchPointJob: this.model.searchPointJob,
                        isTransforming: this.model.tableAST.isTransforming()
                    }),
                    shouldStartNewCurrentPointSearch = this.shouldStartNewCurrentPointSearch(search, currentCommandIdx, nearestSearchPointIdx);
                
                if (shouldStartNewCurrentPointSearch) {
                    this.startNewSearch(currentPointJobCreationDeferred, this.model.currentPointJob, search);
                    
                } else if (!shouldStartNewCurrentPointSearch && (currentCommandIdx === nearestSearchPointIdx)) {
                    // The currentPoint happens to also be a searchPoint
                    this.model.currentPointJob.setFromSplunkD(this.model.searchPointJob.toSplunkD());
                    currentPointJobCreationDeferred.resolve();
                    
                } else {
                    currentPointJobCreationDeferred.resolve();
                }
                
                $.when(currentPointJobCreationDeferred).then(function(){
                    determineAndCreateCurrentPointJobDeferred.resolve();
                }.bind(this));
            },

            shouldStartNewSummaryJob: function(search) {
                var dataSummaryJobSearch = splunkUtil.stripLeadingSearchCommand(this.model.dataSummaryJob.getSearch()),
                    dataSummaryJobEarliestTime = this.model.dataSummaryJob.getDispatchEarliestTimeOrAllTime(),
                    dataSummaryJobLatestTime = this.model.dataSummaryJob.getDispatchLatestTimeOrAllTime(),
                    tableDataSummaryEarliestTime = this.model.dataSummaryTimeRange.get('earliest'),
                    tableDataSummaryLatestTime = this.model.dataSummaryTimeRange.get('latest');

                if (!this.model.table.isDataSummaryMode()) {
                    return false;
                }
                
                if (this.model.dataSummaryJob.isNew()) {
                    return true;
                }

                // If the current dataSummaryJob has the correct search then no need to run again
                if ((dataSummaryJobSearch === search) &&
                        (dataSummaryJobEarliestTime === tableDataSummaryEarliestTime) &&
                        (dataSummaryJobLatestTime === tableDataSummaryLatestTime)) {

                    return false;
                }

                return true;
            },

            determineAndCreateDataSummaryJob: function(determineAndCreateDataSummaryJobDeferred, dataSummaryJobCreationDeferred) {
                var currentCommandIdx = this.model.table.getCurrentCommandIdx(),
                    currentCommand = this.model.table.commands.at(currentCommandIdx),
                    initialSearch = this.model.table.getSearch(currentCommandIdx),
                    search,
                    shouldStartNewSummaryJob;

                if (!currentCommand) {
                    dataSummaryJobCreationDeferred.resolve();
                    determineAndCreateDataSummaryJobDeferred.resolve();
                    return;
                }

                search = this.model.dataSummaryJob.appendStatsToSearch(initialSearch, { columns: currentCommand.columns}),
                shouldStartNewSummaryJob = this.shouldStartNewSummaryJob(search, currentCommandIdx);

                if (shouldStartNewSummaryJob) {
                    this.startNewSearch(dataSummaryJobCreationDeferred, this.model.dataSummaryJob, search, {
                        earliest_time: this.model.dataSummaryTimeRange.get('earliest'),
                        latest_time: this.model.dataSummaryTimeRange.get('latest'),
                        adhoc_search_level: 'verbose',
                        preview: true
                    });
                } else {
                    dataSummaryJobCreationDeferred.resolve();
                }

                $.when(dataSummaryJobCreationDeferred).then(function(){
                    determineAndCreateDataSummaryJobDeferred.resolve();
                }.bind(this));
            },
            
            // Method to start either the searchPointJob or the currentPointJob
            startNewSearch: function(jobCreationDeferred, jobModel, search, options) {
                options = options || {};
                _.defaults(options, {
                    preview: false,
                    adhoc_search_level: 'smart',
                    earliest_time: '',
                    latest_time: ''
                });
                var searchToStart;
                
                if (search) {
                    searchToStart = new SearchJobModel();
                    
                    // Allow the job that will proxy to have a full sync lifecycle before proxying
                    this.addNewSearchListeners(jobCreationDeferred, searchToStart, jobModel);

                    searchToStart.save({}, {
                        data: {
                            search: search,
                            earliest_time: options.earliest_time,
                            latest_time: options.latest_time,
                            auto_cancel: SearchJobModel.DEFAULT_AUTO_CANCEL,
                            status_buckets: 300,
                            ui_dispatch_app: this.model.application.get('app'),
                            preview: options.preview,
                            // TODO: loadjob does not work for fields from the searchPointJob in fast mode
                            adhoc_search_level: options.adhoc_search_level,
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner'),
                            sample_seed: options.sample_seed || undefined,
                            sample_ratio: options.sample_ratio || undefined,
                            auto_finalize_ec: this.model.table.getEventLimit({isTransforming: this.model.tableAST.isTransforming()})
                        }
                    });
                } else {
                    throw new Error('startNewSearch was called without a search!');
                }
            },
            
            // Let the full model lifecycle take place before proxying the job created from startNewSearch
            addNewSearchListeners: function(jobCreationDeferred, newSearchModel, proxyToJobModel) {
                newSearchModel.on('sync', function(model, response, options) {
                    var messages = newSearchModel.error.get('messages');
                    
                    proxyToJobModel.clear();
                    proxyToJobModel.setFromSplunkD(newSearchModel.toSplunkD());
                    
                    if (messages) {
                        proxyToJobModel.error.set({
                            messages: messages
                        });
                    }
                    
                    newSearchModel.off();
                    jobCreationDeferred.resolve();
                }, this);
                
                newSearchModel.on('error', function(model, response, option) {
                    proxyToJobModel.trigger('error', proxyToJobModel, response);
                    newSearchModel.off();
                    jobCreationDeferred.resolve();
                }, this);
            },
            
            // Register the job endpoints that will be polled when the searchPointJob triggers a
            // jobProgress event
            registerSearchPointJobFriends: function(options) {
                // TODO: is this a no-op for now? What sub endpoints do we always need from the searchPointJob?
            },
            
            // Register the job endpoints that will be polled when the currentPointJob triggers a
            // jobProgress event
            registerCurrentPointJobFriends: function(options) {
                var job = this.model.currentPointJob;
                
                if (this.model.currentPointJob.id === this.model.searchPointJob.id) {
                    job = this.model.searchPointJob;
                }
                
                job.registerJobProgressLinksChild(SearchJobModel.RESULTS_PREVIEW, this.model.resultJsonRows, this.fetchResultJSONRows, this);
            },

            registerDataSummaryJobFriends: function(options) {
                this.model.dataSummaryJob.registerJobProgressLinksChild(SearchJobModel.SUMMARY, this.model.dataSummarySummary, this.fetchDataSummarySummary, this);
                this.model.dataSummaryJob.registerJobProgressLinksChild(SearchJobModel.TIMELINE, this.model.dataSummaryTimeline, this.fetchDataSummaryTimeline, this);
                this.model.dataSummaryJob.registerJobProgressLinksChild(SearchJobModel.RESULTS_PREVIEW, this.model.dataSummaryResultJsonRows, this.fetchDataSummaryResultJSONRows, this);
            },
            
            // Fetch the results that will power the table. output_mode=json_rows makes sure that the table always comes back in the table format.
            fetchResultJSONRows: function(options) {
                options = options || {};
                
                var job = this.model.currentPointJob,
                    lastSafeCommand = this.model.table.getLastSafeCommandForCommandIndex(),
                    columns = lastSafeCommand && lastSafeCommand.columns,
                    field_list = columns && columns.columnsListToString();
                                
                if (this.model.currentPointJob.id === this.model.searchPointJob.id) {
                    job = this.model.searchPointJob;
                }
                
                if (job.isDone()) {
                    
                    var fetchDataModel = new ResultsFetchDataModel();
                    
                    var data = $.extend(
                        true,
                        fetchDataModel.toJSON(),
                        {
                            show_metadata: false,
                            include_null_fields: true,
                            field_list: field_list,
                            time_format: '%s.%Q'
                        }
                    );
                    
                    $.extend(true, data, options);
                    
                    this.model.resultJsonRows.safeFetch({
                        data: data
                    });
                }
            },

            fetchDataSummarySummary: function() {
                this.model.dataSummarySummary.safeFetch({
                    data: {
                        min_freq: 0,
                        top_count: 100 // Get top 100 values for Data Summary top results list
                    }
                });
            },

            fetchDataSummaryTimeline: function() {
                this.model.dataSummaryTimeline.safeFetch();
            },

            fetchDataSummaryResultJSONRows: function(options) {
                options = options || {};

                if (this.model.dataSummaryJob.entry.content.get('isPreviewEnabled') || this.model.dataSummaryJob.isDone()) {
                    var fetchDataModel = new ResultsFetchDataModel();

                    var data = $.extend(
                        fetchDataModel.toJSON(),
                        {
                            time_format: '%s.%Q'
                        }
                    );

                    $.extend(true, data, options);

                    this.model.dataSummaryResultJsonRows.safeFetch({
                        data: data
                    });
                }
            },

            // When relevant models change (jobs, table, etc...) and need to be permalinked, this method puts them into the
            // queryString and decides if a new back button state is required
            populateClassicUrl: function(changedAttrs, options) {
                var changedAttrsModel, urlFilteredAttrs;
                options = options || {};
                options.forceAttrs = options.forceAttrs || {};
                
                if (changedAttrs && !_.isEmpty(changedAttrs)){
                    changedAttrs = $.extend(true, {}, changedAttrs);
                    changedAttrsModel = new BaseModel(changedAttrs);
                    urlFilteredAttrs = changedAttrsModel.filterByWildcards(this.tableFilter, {allowEmpty: true});
                    
                    // Merge in the forced attributes from options 
                    _.extend(urlFilteredAttrs, options.forceAttrs);
                    
                    if (!_.isEmpty(urlFilteredAttrs)){
                        var currentCommand = parseInt(urlFilteredAttrs['dataset.display.currentCommand'], 10),
                            currentCommandChanged = (currentCommand >= 0),
                            trigger = urlFilteredAttrs['dataset.commands'] ||
                                urlFilteredAttrs['dataset.display.diversity'] ||
                                urlFilteredAttrs['dataset.display.limiting'] ||
                                // Is set to empty string when all time, therefore need to check if a string is present
                                _.isString(urlFilteredAttrs['dataset.display.datasummary.earliestTime']) ||
                                _.isString(urlFilteredAttrs['dataset.display.datasummary.latestTime']) ||
                                urlFilteredAttrs['dataset.display.mode'];

                        if (options.forceTrigger || trigger || currentCommandChanged) {
                            // Unset the currentPointJob on the page load so we always check if we need a new one
                            urlFilteredAttrs.cpsid = options.forceAttrs.cpsid || undefined;
                            if (this.model.table.isTableMode() && this.model.tableAST.isTransforming()) {
                                // Need to rerun the search point job
                                urlFilteredAttrs.spsid = undefined;
                            } else {
                                // The data summary job can no longer be valid so we should remove it from the url
                                urlFilteredAttrs.dssid = undefined;
                            }

                            // Push a back button state
                            this.model.classicUrl.save(urlFilteredAttrs, {
                                trigger: true
                            });
                        } else {
                            // Update the current back button state
                            this.model.classicUrl.save(urlFilteredAttrs, {
                                replaceState: true
                            });
                        }
                    }
                }
            },
            
            // When the table model changes in a way that should be persisted to ui-prefs, this does the POST
            populateUIPrefs: function(uiPrefsPopulationDeferred, changedAttrs) {
                var data = {},
                    changedAttrsModel, filteredAttrs, changedAttrsCopy;
                
                if (changedAttrs && !_.isEmpty(changedAttrs)) {
                    changedAttrsCopy = $.extend(true, {}, changedAttrs);
                    changedAttrsModel = new BaseModel(changedAttrsCopy);
                    filteredAttrs = changedAttrsModel.filterByWildcards(this.uiPrefsFilter, {allowEmpty: true});
                    
                    if (!_.isEmpty(filteredAttrs)){
                        if (this.model.uiPrefs.isNew()) {
                            data = {
                                app: this.model.application.get("app"),
                                owner: this.model.application.get("owner")
                            };
                        }
                        
                        this.model.uiPrefs.entry.content.set(filteredAttrs);
                        this.model.uiPrefs.save({}, {
                            data: data,
                            success: function(model, response) {
                                uiPrefsPopulationDeferred.resolve();
                            }.bind(this),
                            error: function(model, response) {
                                uiPrefsPopulationDeferred.resolve();
                            }.bind(this)
                        });
                        return;
                    }
                }
                uiPrefsPopulationDeferred.resolve();
            },
            
            // Mediate the id of the searchPointJob into the right queryString attr
            populateClassicUrlFromSearchPointJob: function() {
                var attrs = {
                    spsid: this.model.searchPointJob.entry.content.get('sid')
                };
                
                this.model.classicUrl.save(attrs, {
                    replaceState: true
                });
            },
            
            // Mediate the id of the currentPointJob into the right queryString attr
            populateClassicUrlFromCurrentPointJob: function() {
                var attrs = {
                    cpsid: this.model.currentPointJob.entry.content.get('sid')
                };
                
                this.model.classicUrl.save(attrs, {
                    replaceState: true
                });
            },

            populateClassicUrlFromDataSummaryJob: function() {
                var attrs = {
                    dssid: this.model.dataSummaryJob.entry.content.get('sid')
                };

                this.model.classicUrl.save(attrs, {
                    replaceState: true
                });
            },
            
            // Mediate the attrs of the table into the right queryString attrs
            populateClassicUrlFromTable: function() {
                var attrs = {
                    'dataset.commands': this.model.table.entry.content.get('dataset.commands'),
                    'dataset.display.currentCommand': this.model.table.entry.content.get('dataset.display.currentCommand'),
                    'dataset.display.diversity': this.model.table.entry.content.get('dataset.display.diversity'),
                    'dataset.display.limiting': this.model.table.entry.content.get('dataset.display.limiting')
                };
                
                this.model.classicUrl.save(attrs, {
                    replaceState: true
                });
            },
            
            mediateUserPrefsTimeRangeAttrs: function(attrs) {
                general_utils.transferKey(attrs, 'default_earliest_time', 'earliest');
                general_utils.transferKey(attrs, 'default_latest_time', 'latest');
            },

            loadNewSummaryJob: function(options) {
                this.model.classicUrl.save({
                    dssid: undefined
                }, {
                    trigger: true
                });
            }
        });
    }
);
