define([
            'jquery',
            'underscore',
            'controllers/Base',
            'models/config',
            'models/search/Job',
            'models/pivot/PivotJob',
            'models/pivot/PivotReport',
            'models/pivot/PivotSearch',
            'models/services/search/IntentionsParser',
            'models/shared/TimeRange',
            'views/pivot/dialogs/PermissionMismatchDialog',
            'views/pivot/dialogs/CreateReportDialog',
            'views/pivot/dialogs/CreateDashboardPanelDialog',
            'views/pivot/dialogs/SaveDataModelDialog',
            'views/shared/reportcontrols/dialogs/savereport/Master',
            'views/shared/jobstatus/buttons/ExportResultsDialog',
            'views/pivot/dialogs/SharePivotDialog',
            'views/pivot/PivotView',
            'helpers/pivot/PivotVisualizationManager',
            'helpers/Printer',
            'helpers/user_agent',
            'uri/route',
            'util/general_utils',
            'util/splunkd_utils',
            'util/console',
            'splunk.util',
            'splunk.window',
            'util/drilldown'
        ],
        function(
            $,
            _,
            Base,
            configModel,
            Job,
            PivotJob,
            PivotReport,
            PivotSearch,
            IntentionsParser,
            TimeRange,
            PermissionMismatchDialog,
            CreateReportDialog,
            CreateDashboardPanelDialog,
            SaveDataModelDialog,
            SavereportMaster,
            ExportResultsDialog,
            SharePivotDialog,
            PivotView,
            pivotVizManager,
            Printer,
            userAgent,
            route,
            generalUtils,
            splunkdUtils,
            console,
            splunkUtils,
            splunkWindow,
            drilldownUtil
        ) {

    var ALL_TIME_ADHOC_ACCELERATION = 'all-time-adhoc-acceleration',
        ELASTIC_ADHOC_ACCELERATION = 'elastic-adhoc-acceleration',
        NO_ADHOC_ACCELERATION = 'no-adhoc-acceleration';

    var getAdhocAccelerationMode = function() {
        // first check the deprecated boolean setting, respect it only if set to false
        if(!splunkUtils.normalizeBoolean(configModel.get('ENABLE_PIVOT_ADHOC_ACCELERATION'))) {
            return NO_ADHOC_ACCELERATION;
        }
        // now respect the mode
        var configMode = configModel.get('PIVOT_ADHOC_ACCELERATION_MODE') || '';
        switch(configMode.toLowerCase()) {
            case 'alltime':
                return ALL_TIME_ADHOC_ACCELERATION;
            case 'none':
                return NO_ADHOC_ACCELERATION;
            default:
                return ELASTIC_ADHOC_ACCELERATION;
        }
    };

    var PivotController = Base.extend({

        /**
         * @contructor
         * @param options {Object} {
         *     model: {
                    application <models.Application> the application model,
                    classicurl <models.classicurl> the URL param model,
                    dataModel <models.services.datamodel.DataModel> the data model,
                    report <models.pivot.PivotReport> the report
                    appLocal <models.services.AppLocal> the local splunk app
                    user <models.services/admin.User> the current user
                },
                collection: {
                    timePresets <collections.services.data.ui.Times> the time presets for the current user,
                    dataModels <collections.services.datamodel.DataModels> the data models available in the current context
                },
                reportHistoryManager <helpers.pivot.ReportHistoryManager> a helper for managing changes in visualization type,
                routerReadyDfd {$.Deffered} a deferred object representing when the router has loaded all of its dependencies,
                flashMessages: <views.shared.FlashMessages> a messages view with router models/collections already registered
         * }
         */

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.initModels();
            this.appOwner = {
                app: this.model.application.get('app'),
                owner: this.model.application.get('owner')
            };
            this.reportHistoryManager = this.options.reportHistoryManager;
            this.elasticMode = PivotController.ADHOC_ACCELERATION_MODE === PivotController.ELASTIC_ADHOC_ACCELERATION;
            this.noAccelerationMode = PivotController.ADHOC_ACCELERATION_MODE === PivotController.NO_ADHOC_ACCELERATION;
            var that = this;
            // bootstrap everything the controller needs, there are cases where this process will be synchronous,
            // so we have to defer triggering its events so that listeners are guaranteed to be set up
            // TODO [sff] maybe an actual deferred interface for the controller's ready/failed events?
            this.model.classicurl.fetch({ silentClear: true }).done(function() {
                $.when(that.bootstrap(), that.options.routerReadyDfd)
                    .done(function() {
                        that.reportHistoryManager.register(that.model.report);
                        that.reportHistoryManager.applyVisualizationUpdates(that.model.report);
                        that.populateUrlFromReport({ replaceState: true });
                        if(that.elasticMode && !that.model.collectJob.isNew()) {
                            that.waitForRunningCollect().done(_(that.dispatchPivotJob).bind(that));
                        }
                        else {
                            that.dispatchPivotJob();
                        }
                        that.initViews();
                        that.initEventBindings();
                        _.defer(function() { that.trigger('ready'); });
                    })
                    .fail(function(errorType, redirectUrl) {
                        _.defer(function() { that.trigger('failed', errorType, redirectUrl); });
                    });
            });
        },

        initModels: function() {
            this.model.collectJob = new Job();
            this.model.pivotJob = new PivotJob({}, { delay: 500, processKeepAlive: true });
            this.model.pivotSearch = new PivotSearch();
            this.model.timeRange = new TimeRange();

            this.registerWithMessages(this.model.pivotJob);
            this.registerWithMessages(this.model.pivotSearch);
            // the collect job will be registered in the bootstrapCollectJob method
        },

        remove: function() {
            this.model.pivotJob.stopPolling();
            this.model.pivotJob.destroy();
            if(this.seedJob) {
                this.seedJob.stopPolling();
            }
            return Base.prototype.remove.apply(this, arguments);
        },

        /**
         * returns a promise that will be resolved when all necessary models have been placed in a fresh state
         * additionally the current modelName, objectName, and object will be set as instance properties
         */

        bootstrap: function() {
            var that = this;
            return this.bootstrapReportAndDataModel().then(
                // success filter, finalize the report and initialize the collect job if necessary
                function() {
                    that.object = that.model.dataModel.objectByName(that.objectName);
                    if(!that.object) {
                        // we don't send the object name to the back end, so if it doesn't exist we have to
                        // generate the error message client-side
                        var message = splunkdUtils.createMessageObject(
                            splunkdUtils.ERROR,
                            splunkUtils.sprintf(_('The %s object does not exist in the data model.').t(), that.objectName)
                        );
                        that.model.dataModel.trigger('serverValidated', false, that.model.dataModel, [message]);
                        return $.Deferred().reject(PivotController.OBJECT_ERROR);
                    }
                    // in elastic mode, the report must be finalized before bootstrapping the collect job
                    // this is because the fully parsed time range is needed
                    if(that.elasticMode) {
                        return that.finalizeReport().then(function() {
                            return $.when(that.object.get('tsidxNamespace') || that.bootstrapCollectJob());
                        });
                    }
                    // if not in elastic mode, bootstrapping the collect job and finalizing the report can be done in parallel
                    return $.when(
                        that.object.get('tsidxNamespace') || that.bootstrapCollectJob(),
                        that.finalizeReport()
                    );
                }
            );
        },

        bootstrapReportAndDataModel: function() {
            var that = this;
            // if the URI has an "s" param it trumps any others
            if(this.model.classicurl.get('s')) {
                return this.bootstrapReport(this.model.classicurl.get('s')).then(
                    // success filter, bootstrap the data model
                    function() {
                        that.model.report.entry.content.set({ 'display.prefs.statistics.count': '20' });
                        var searchString = that.model.classicurl.get('q') || that.model.report.entry.content.get('search'),
                            modelAndObject = PivotReport.parseModelAndObjectFromSearch(searchString);

                        if(!modelAndObject || modelAndObject.length < 3) {
                            return $.Deferred().reject(PivotController.PIVOT_SEARCH_ERROR);
                        }
                        that.modelName = that.constructFullyQualifiedModelName(modelAndObject[1]);
                        that.objectName = modelAndObject[2];
                        return that.bootstrapDataModel(that.modelName);
                    }
                );
            }
            // if the URL has a seedSid, we will be bootstrapping the data model using that sid
            if(!this.model.classicurl.has('seedSid')) {
                // otherwise we need to get the model and object from the URI
                // if the URI has a "q" param, parse the model and object from it
                if(this.model.classicurl.has('q')) {
                    var modelAndObject = PivotReport.parseModelAndObjectFromSearch(this.model.classicurl.get('q'));
                    if(!modelAndObject || modelAndObject.length < 3) {
                        return $.Deferred().reject(PivotController.PIVOT_SEARCH_ERROR);
                    }
                    this.modelName = this.constructFullyQualifiedModelName(modelAndObject[1]);
                    this.objectName = modelAndObject[2];
                }
                // if not, the URI must have model and object in it
                else {
                    this.modelName = this.constructFullyQualifiedModelName(this.model.classicurl.get('model'));
                    this.objectName = this.model.classicurl.get('object');
                }
                if(!this.modelName || !this.objectName) {
                    var pageRouter = route.getContextualPageRouter(this.model.application),
                        redirectUrl = this.modelName ? pageRouter.pivot({ data: { model: this.modelName } })
                            : pageRouter.pivot();

                    return $.Deferred().reject(PivotController.URL_ERROR, redirectUrl);
                }
            }
            var dataModelBootstrap = this.model.classicurl.has('seedSid') ?
                    // When bootstrapping from sid, make sure the "modelName" and "objectName" instance member are created.
                    this.bootstrapDataModelFromSid(this.model.classicurl.get('seedSid')).then(function() {
                        that.modelName = that.constructFullyQualifiedModelName(that.model.dataModel.id);
                        var objects = that.model.dataModel.entry.content.objects;
                        if(objects.length === 0) {
                            throw new Error('The generated data model does not contain any objects');
                        }
                        that.objectName = objects.at(0).get('objectName');
                    }) :
                    this.bootstrapDataModel(this.modelName);

            return $.when(dataModelBootstrap, this.bootstrapReport()).then(
                // success filter, apply some additional defaults to the report
                function() {
                    that.model.report.entry.content.set({
                        'display.prefs.statistics.count': '20'
                    });
                    that.model.report.setVisualizationType(pivotVizManager.STATISTICS_TABLE);
                    return this;
                }
            );
        },

        bootstrapReport: function(reportId) {
            // if the report id from the URL matches the existing report, resolve immediately
            if(reportId && this.model.report.id === reportId) {
                return $.Deferred().resolve();
            }
            // when clearing and re-populating the report, we want to preserve the state of the "pivot content" attributes
            var persistentAttrs = this.model.report.entry.content.filterByWildcards(PivotReport.PIVOT_CONTENT_FILTER, { allowEmpty: true });
            this.model.report.clear();
            // and if there is no reportId in the URL but the report defaults are already populated,
            // we can use them to reset the report to its defaults and resolve immediately
            if(!reportId && !this.model.reportDefaults.entry.isNew()) {
                this.model.report.setFromSplunkD(this.model.reportDefaults.toSplunkD());
                this.model.report.entry.content.set(persistentAttrs);
                return $.Deferred().resolve();
            }
            this.model.report.entry.content.set(persistentAttrs);
            this.model.report.unset(this.model.report.idAttribute);
            if(reportId) {
                this.model.report.set({ id: reportId });
            }
            var that = this;
            return this.model.report.fetch().then(
                // success filter, cache the report defaults if we can
                function() {
                    if(that.model.report.isNew()) {
                        that.model.reportDefaults.setFromSplunkD(that.model.report.toSplunkD());
                    }
                    return this;
                },
                // fail filter, emit an error type
                function() { return $.Deferred().reject(PivotController.REPORT_ERROR); }
            );
        },

        finalizeReport: function() {
            this.populateReportFromUrl();
            this.model.pivotSearch.clear();
            this.model.report.entry.content.set({
                baseClassLineage: this.object.getFieldByName(this.objectName).owner
            });
            var reportSearch = this.model.report.entry.content.get('search');
            if(reportSearch) {
                this.model.pivotSearch.set({ pivotSearch: reportSearch });
            }
            else {
                var pivotJson = this.model.report.getPivotJSON();
                if(!pivotJson.dataModel) {
                    pivotJson.dataModel = _(this.modelName.split('/')).last();
                }
                this.model.pivotSearch.set({ pivotJson: JSON.stringify(pivotJson) });
            }
            var that = this,
                pivotSearchFetch = this.model.pivotSearch.fetch({ data: this.generatePivotSearchFetchData() });

            return $.when(pivotSearchFetch, this.bootstrapTimeRange()).then(
                // success filter, fill out the report
                function() {
                    that.model.report.entry.content.set({ search: that.model.pivotSearch.get('pivotSearch') });
                    that.model.report.setFromPivotJSON(that.model.pivotSearch.get('pivotJson'));
                    that.decorateReportElements();
                    that.addTimeRangeFilter();
                    return this;
                },
                // fail filter, emit an error type
                // this is a safe assumption because bootstrapTimeRange is designed to always succeed
                function() { return $.Deferred().reject(PivotController.PIVOT_SEARCH_ERROR); }
            );
        },

        // fetch the full representation of the pivotSearch with a token for the namespace
        // the token will be replaced with an actual namespace when dispatching the pivot job
        generatePivotSearchFetchData: function() {
            var fetchData = _.extend(
                { namespace: PivotController.TSIDX_NAMESPACE_TOKEN },
                this.model.application.pick('app', 'owner')
            );
            if(this.model.dataModel.isTemporary()) {
                fetchData.modelJson = this.model.dataModel.toSplunkD().entry[0].content.description;
            }
            else {
                fetchData.dataModel = this.modelName;
            }
            return fetchData;
        },

        bootstrapTimeRange: function() {
            var that = this,
                reportContent = this.model.report.entry.content;

            this.model.timeRange.restoreDefaults();
            this.model.timeRange.set({
                earliest: reportContent.get('dispatch.earliest_time'),
                latest: reportContent.get('dispatch.latest_time')
            });
            return this.model.timeRange.save().then(
                // no success filter, if the time range is valid we're good to go
                null,
                // fail filter, reset the report's time range to all time and try again
                function() {
                    reportContent.set({ 'dispatch.earliest_time': 0 });
                    reportContent.unset('dispatch.latest_time');
                    // recursion warning
                    return that.bootstrapTimeRange();
                }
            );
        },

        bootstrapDataModel: function(modelName) {
            if(this.model.dataModel.id && this.constructFullyQualifiedModelName(this.model.dataModel.id) === modelName) {
                return $.Deferred().resolve();
            }
            this.model.dataModel.clear();
            this.model.dataModel.set({ id: modelName });
            return this.model.dataModel.fetch().then(
                // no success filter needed
                null,
                // fail filter, emit a specific error type
                function() { return PivotController.DATA_MODEL_ERROR; }
            );
        },

        bootstrapDataModelFromSid: function(seedSid) {
            if(this.model.dataModel.has('sid') && this.model.dataModel.get('sid') === seedSid) {
                return $.Deferred().resolve();
            }
            this.model.dataModel.clear();
            var fetchData = _.extend(
                { sid: seedSid },
                this.model.application.pick('app', 'owner'),
                this.model.classicurl.pick('fields', 'field_coverage')
            );
            var that = this;
            return this.model.dataModel.fetch({ data: fetchData }).then(
                // Success filter, make sure the job will be kept alive.
                _(function() {
                    this.seedJob = new Job({}, { delay: Job.DEFAULT_LONG_POLLING_INTERVAL, processKeepAlive: true });
                    this.seedJob.set(this.seedJob.idAttribute, seedSid);
                    this.seedJob.fetch({ data: that.model.application.pick('app', 'owner') }).then(
                        // In the success handler, poll the job if it's not already done.
                        _(function() {
                            if(!this.seedJob.isDone()) {
                                this.seedJob.startPolling();
                                this.seedJob.stopKeepAlive();
                            }
                        }).bind(this),
                        // This fail handler should never be called.
                        // If the job can't be found the data model fetch should have failed.
                        function() {
                            console.error(
                                'The seed job could not be found even though the data model was generated.  This should never happen.'
                            );
                        }
                    );
                }).bind(this),
                // Fail filter, emit a specific error type.
                function() { return PivotController.SEED_SID_ERROR; }
            );
        },

        constructCollectSearch: function(baseSearch) {
            return baseSearch + ' | tscollect | stats count';
        },

        shouldHandleCollectTimeRangeMismatch: function() {
            if(!this.elasticMode) {
                return false;
            }
            var reportLatest = this.model.timeRange.get('latest') || 'now',
                collectRequest = this.model.collectJob.entry.content.request,
                collectLatest = collectRequest.get('latest_time') || 'now';

            if(reportLatest !== collectLatest) {
                return true;
            }
            var cursoredMode = this.model.collectJob.entry.content.get('isTimeCursored'),
                reportEarliest = this.model.timeRange.get('earliest') || 0,
                collectEarliest = collectRequest.get('earliest_time') || 0;

            return !cursoredMode && (reportEarliest !== collectEarliest);
        },

        disposeOfCollectJob: function(options) {
            options = options || {};
            var cursoredMode = this.model.collectJob.entry.content.get('isTimeCursored');
            this.model.classicurl.unset('accSid');
            this.model.classicurl.save({}, { replaceState: true });
            if(options.destroy) {
                this.model.collectJob.destroy();
            }
            this.model.collectJob.clear();
            if(options.dispatchNew) {
                return this.dispatchNewCollectJob(!cursoredMode);
            }
            return $.Deferred().resolve();
        },

        dispatchNewCollectJob: function(nonCursoredMode) {
            // assume that the objectSearch does not have the leading 'search' command
            var that = this,
                fullObjectSearch = this.object.get('objectSearch'),
                dispatchParams = $.extend({
                    search: this.constructCollectSearch(fullObjectSearch),
                    status_buckets: 0,
                    auto_cancel: 100
                }, this.appOwner);

            // in elastic mode, match the latest time of the collect to this of the report
            // unless the report latest time is 'now', in which case the collect job doesn't need a latest time
            var reportLatest = this.model.timeRange.get('latest');
            if(this.elasticMode && reportLatest && reportLatest !== 'now') {
                dispatchParams.latest_time = reportLatest;
            }
            if(this.elasticMode && nonCursoredMode) {
                dispatchParams.earliest_time = this.model.timeRange.get('earliest') || 0;
            }

            // register with the messages display here to avoid an error from the first fetch to see if the sid is still valid
            this.registerWithMessages(this.model.collectJob);
            return this.model.collectJob.save({}, { data: dispatchParams }).then(
                function() {
                    that.model.classicurl.save({ accSid: that.model.collectJob.id }, { replaceState: true });
                },
                function() {
                    return PivotController.COLLECT_JOB_ERROR;
                }
            );
        },

        bootstrapCollectJob: function() {
            if(this.noAccelerationMode) {
                this.model.classicurl.unset('accSid');
                this.model.classicurl.save({}, { replaceState: true });
                return $.Deferred().resolve();
            }
            var that = this,
                shouldDeleteCollectJob = this.elasticMode && this.model.timeRange.isRealtime('earliest');

            // if no acceleration sid is in the URL, then dispatch a brand new collect job
            if(!this.model.classicurl.has('accSid')) {
                if(shouldDeleteCollectJob) {
                    return $.Deferred().resolve();
                }
                return this.dispatchNewCollectJob();
            }
            // otherwise try to re-attach to the sid in from the URL
            this.model.collectJob.set(this.model.collectJob.idAttribute, this.model.classicurl.get('accSid'));
            return this.model.collectJob.fetch({ data: this.appOwner }).then(
                // success filter, if the job still exists we can just use it as long as the objectSearch has not changed
                // in elastic mode we also have to make sure the latest time of the collect job matches the report
                function() {
                    if(shouldDeleteCollectJob) {
                        return that.disposeOfCollectJob({ destroy: true });
                    }
                    var requestSearch = that.model.collectJob.entry.content.request.get('search'),
                        objectSearch = that.object.get('objectSearch');

                    if(that.constructCollectSearch(objectSearch) !== requestSearch) {
                        return that.disposeOfCollectJob({ dispatchNew: true });
                    }
                    if(that.shouldHandleCollectTimeRangeMismatch()) {
                        return that.disposeOfCollectJob({ destroy: true, dispatchNew: true });
                    }

                    // we now know we can safely re-use the existing collect job
                    // in elastic mode, make sure its paused/running state is correct first
                    return that.elasticMode ? that.ensureCollectRunningState() : this;
                },
                // fail filter handles the case that the job no longer exists, so we need to dispatch a new one
                function() {
                    that.model.classicurl.unset('accSid');
                    that.model.classicurl.save({}, { replaceState: true });
                    that.model.collectJob.unset(that.model.collectJob.idAttribute);
                    if(shouldDeleteCollectJob) {
                        return $.Deferred().resolve();
                    }
                    return that.dispatchNewCollectJob();
                }
            );
        },

        waitForRunningCollect: function() {
            if(!this.model.collectJob.isPreparing()) {
                if(this.shouldHandleCollectTimeRangeMismatch()) {
                    return this.disposeOfCollectJob({ destroy: true, dispatchNew: true });
                }
                return $.Deferred().resolve();
            }
            var that = this,
                dfd = $.Deferred();

            this.model.collectJob.startPolling();
            this.listenToOnce(this.model.collectJob, 'prepared', function() {
                that.model.collectJob.stopPolling();
                if(that.shouldHandleCollectTimeRangeMismatch()) {
                    that.disposeOfCollectJob({ destroy: true, dispatchNew: true }).done(_(dfd.resolve).bind(dfd));
                    return;
                }
                dfd.resolve();
            });
            return dfd;
        },

        // inspects the current cursorTime of the collect job and compares it to the time range of the report
        // returns a promise to put the collect job in the correct paused/unpaused state
        // assumes that any mistmatch between latest time of the collect job and report has already been handled
        ensureCollectRunningState: function() {
            var collectContent = this.model.collectJob.entry.content;
            // if the collect is done, no need to do anything
            if(collectContent.get('isDone')) {
                return $.Deferred().resolve();
            }
            var cursorTimeIso = collectContent.get('cursorTime'),
                cursorTimeEpoch = cursorTimeIso ? parseFloat(splunkUtils.getEpochTimeFromISO(cursorTimeIso)) : 0,
                reportEarliestEpoch = this.model.timeRange.get('earliest_epoch');

            // we know that the job is not done, so if cursorTime is zero it can be assumed to be a virtual-index job
            // and we treat the cursort time as at its max value
            if(cursorTimeEpoch === 0) {
                cursorTimeEpoch = Infinity;
            }

            // if the collect cursor is before the report earliest, make sure the collect job is paused
            if(cursorTimeEpoch < reportEarliestEpoch) {
                return $.when(collectContent.get('isPaused') || this.model.collectJob.pause());
            }
            // otherwise, make sure the collect job is running
            return $.when(!collectContent.get('isPaused') || this.model.collectJob.unpause());
        },

        dispatchPivotJob: function() {
            var that = this,
                reportContent = this.model.report.entry.content,
                dispatchData = {
                    search: this.model.pivotSearch.get('search'),
                    earliest_time: reportContent.get('dispatch.earliest_time') || 0,
                    app: this.model.application.get('app'),
                    owner: this.model.application.get('owner')
                };

            if(reportContent.get('dispatch.latest_time')) {
                dispatchData.latest_time = reportContent.get('dispatch.latest_time');
            }
            if(this.object.get('tsidxNamespace')) {
                dispatchData.tsidxNamespace = this.object.get('tsidxNamespace');
                dispatchData.tstatsSearch = this.model.pivotSearch.get('tstatsSearch').replace(
                    new RegExp(PivotController.TSIDX_NAMESPACE_TOKEN, 'g'),
                    this.object.get('tsidxNamespace')
                );
            }
            else if(!this.model.collectJob.isNew()) {
                dispatchData.sid = this.model.collectJob.id;
                dispatchData.tstatsSearch = this.model.pivotSearch.get('tstatsSearch').replace(
                    new RegExp(PivotController.TSIDX_NAMESPACE_TOKEN, 'g'),
                    'sid=' + this.model.collectJob.id
                );
            }

            this.model.pivotJob.save({}, { data: dispatchData })
                .done(function() {
                    that.model.pivotJob.startPolling();
                });
        },

        initViews: function() {
            this.masterView = this.children.pivotView = new PivotView({
                model: {
                    application: this.model.application,
                    report: this.model.report,
                    dataModel: this.model.dataModel,
                    searchJob: this.model.pivotJob,
                    appLocal: this.model.appLocal,
                    user: this.model.user,
                    pivotSearch: this.model.pivotSearch
                },
                collection: {
                    dataModels: this.collection.dataModels,
                    timePresets: this.collection.timePresets
                },
                flashMessages: this.options.flashMessages
            });
        },

        initEventBindings: function() {
            var report = this.model.report,
                reportContent = report.entry.content;

            // some general listeners for dispatching new routes or doing replace state operations
            this.listenTo(report, 'change:id', function() {
                this.populateUrlFromReport({ trigger: true });
            });
            this.listenTo(report, 'reportConfigChange', function() {
                this.masterView.clearData();
                // pre-render the data container so it appears how it will look when the page re-dispatches,
                // but put it in a disabled state so the user doesn't continue to make changes (SPL-83469)
                this.masterView.renderContainer({ disabled: true });
                this.decorateReportElements({ silent: true });
                this.masterView.showInitializingMessage();
                this.redispatchReport();
            });
            this.listenTo(report, 'visualizationTypeChange', this.handleVizTypeChange);
            this.listenTo(reportContent, 'change', function() {
                // If the report id is also changing, ignore this handler since the once above will
                // trigger a new route.
                if(this.model.report.hasChanged(this.model.report.idAttribute)) {
                    return;
                }
                var changed = reportContent.changedAttributes();
                // attributes associated with changing the visualization should be ignored here
                // they will be updated automatically on the next call to populateUrlFromReport
                delete changed['display.visualizations.show'];
                delete changed['display.statistics.show'];
                delete changed['display.visualizations.type'];
                delete changed['display.visualizations.charting.chart'];
                if(!_.isEmpty(changed)) {
                    this.populateUrlFromReport({ replaceState: true });
                }
            });
            this.listenTo(report, 'clear', this.clearReport);
            this.listenTo(this.model.pivotJob, 'rebuildAcceleration', function() {
                this.model.classicurl.unset('accSid');
                this.model.classicurl.save({}, { trigger: true });
            });

            this.listenTo(report, 'drilldown', this.handleDrilldown);
            // wire up other custom report events
            this.listenTo(report, 'saveAsReport', this.saveNewReport);
            this.listenTo(report, 'saveAsDashboardPanel', this.saveNewDashboardPanel);
            this.listenTo(report, 'save', this.saveReport);
            this.listenTo(this.model.dataModel, 'save', this.saveDataModel);

            // wire up other custom job events
            this.listenTo(this.model.pivotJob, 'inspectAcceleration', function() {
                this.inspectJob(this.model.collectJob);
            });
            this.listenTo(this.model.pivotJob, 'inspect', function() {
                this.inspectJob(this.model.pivotJob);
            });
            this.listenTo(this.model.pivotJob, 'print', function() { Printer.printPage(); });
            this.listenTo(this.model.pivotJob, 'export', this.exportJob);
            this.listenTo(this.model.pivotJob, 'share', this.shareJob);
            this.listenTo(this.model.pivotJob, 'reload', function() {
                this.populateUrlFromReport({ trigger: true, reload: true });
            });

            // in elastic mode, extra listeners are needed for additional control of the paused/running state of the collect job
            if(this.elasticMode && !this.object.get('tsidxNamespace')) {
                if(this.model.collectJob.entry.content.get('isTimeCursored')) {
                    this.listenTo(this.model.pivotJob.entry.content, 'change:isDone', function() {
                        if(this.model.pivotJob.isDone()) {
                            this.model.collectJob.pause();
                        }
                    });
                }
                this.listenTo(this.model.pivotJob, 'fakeControlAction', function(action) {
                    if(action in { pause: true, finalize: true }) {
                        this.model.collectJob.pause();
                    }
                    else if(action === 'unpause') {
                        this.model.collectJob.unpause();
                    }
                });
            }
        },

        handleVizTypeChange: function() {
            var contentToConfig = function(content) {
                return ({
                    reportLevelAttributes: content.filterByWildcards(PivotReport.PIVOT_CONTENT_FILTER),
                    cells: content.cells.toJSON(),
                    rows: content.rows.toJSON(),
                    columns: content.columns.toJSON()
                });
            };

            var reportContent = this.model.report.entry.content,
                oldConfig = contentToConfig(reportContent);

            this.masterView.clearData();
            this.reportHistoryManager.applyConfigUpdates(this.model.report, this.object.getReportFields(), { silent: true });
            this.reportHistoryManager.applyVisualizationUpdates(this.model.report);

            // if applying the updates changed the report config, trigger a new route, otherwise just re-render
            if(_.isEqual(contentToConfig(reportContent), oldConfig)) {
                this.masterView.renderContainer();
                this.masterView.renderData();
                this.populateUrlFromReport({ replaceState: true });
            }
            else {
                // pre-render the data container so it appears how it will look when the page re-dispatches,
                // but put it in a disabled state so the user doesn't continue to make changes (SPL-83469)
                this.masterView.renderContainer({ disabled: true });
                this.model.pivotJob.stopPolling();
                this.masterView.showInitializingMessage();
                this.redispatchReport();
            }
        },

        redispatchReport: function() {
            this.model.pivotSearch.clear();
            var reportContent = this.model.report.entry.content,
                pivotJson = this.model.report.getPivotJSON(),
                indexTimeFilter = _(pivotJson.filters).findWhere({ fieldName: '_time', type: 'timestamp' });

            if(indexTimeFilter) {
                reportContent.set({ 'dispatch.earliest_time': indexTimeFilter.earliestTime }, { silent: true });
                if(indexTimeFilter.latestTime) {
                    reportContent.set({ 'dispatch.latest_time': indexTimeFilter.latestTime }, { silent: true });
                }
                else {
                    reportContent.unset('dispatch.latest_time', { silent: true });
                }
                pivotJson.filters = _(pivotJson.filters).without(indexTimeFilter);
            }

            this.model.pivotSearch.set({ pivotJson: JSON.stringify(pivotJson) });
            var that = this;
            this.model.pivotSearch.fetch({ data: this.generatePivotSearchFetchData() })
                .done(function() {
                    reportContent.set({ search: that.model.pivotSearch.get('pivotSearch') }, { silent: true });
                    that.populateUrlFromReport({ trigger: true, reload: true });
                })
                .fail(function() {
                    that.masterView.renderErrors();
                    // The config controls will have been disabled in preparation for a re-dispatch.
                    // Enable them again here so the user can recover from the error (SPL-85033).
                    that.masterView.renderContainer({ disabled: false });
                });
        },

        clearReport: function() {
            this.reportHistoryManager.clearHistory();
            var urlArgs = this.model.classicurl.pick('accSid');
            if(this.model.dataModel.isTemporary()) {
                _.extend(urlArgs, this.model.classicurl.pick('seedSid', 'fields', 'field_coverage'));
            }
            else {
                urlArgs.model = this.modelName;
                urlArgs.object = this.objectName;
            }
            this.model.classicurl.clear();
            this.model.classicurl.save(urlArgs, { trigger: true });
        },

        saveNewReport: function() {
            this._prepareReportForSave();
            this.children.saveNewDialog = new CreateReportDialog({
                model:  {
                    report: this.model.report,
                    application: this.model.application,
                    user: this.model.user,
                    dataModel: this.model.dataModel,
                    pivotSearch: this.model.pivotSearch,
                    searchJob: this.model.pivotJob
                },
                onHiddenRemove: true,
                preventSidReuse: true
            });
            this.children.saveNewDialog.render().appendTo($('body'));
            this.children.saveNewDialog.show();
            this.listenToOnce(this.children.saveNewDialog, 'action:flowExited', this.onDialogFlowExited);
        },

        saveNewDashboardPanel: function() {
            this.children.dashboardDialog = new CreateDashboardPanelDialog({
                model:  {
                    report: this.model.report,
                    application: this.model.application,
                    user: this.model.user,
                    dataModel: this.model.dataModel,
                    pivotSearch: this.model.pivotSearch,
                    searchJob: this.model.pivotJob
                },
                onHiddenRemove: true
            });

            this.children.dashboardDialog.render().appendTo($('body'));
            this.children.dashboardDialog.show();
            this.listenToOnce(this.children.dashboardDialog, 'action:flowExited', this.onDialogFlowExited);
        },

        saveReport: function() {
            var reportVisibility = this.model.report.entry.acl.get('sharing'),
                dataModelVisibility = this.model.dataModel.entry.acl.get('sharing');

            // SPL-74393, a report can't be saved if it is shared but its data model is private
            // detect that permission mismatch and display a helpful dialog
            if(dataModelVisibility === 'user' && reportVisibility !== 'user') {
                this.children.permissionMismatchDialog = new PermissionMismatchDialog({
                    model: {
                        application: this.model.application
                    },
                    onHiddenRemove: true
                });
                this.children.permissionMismatchDialog.render().appendTo($('body'));
                this.children.permissionMismatchDialog.show();
            }
            else {
                this._prepareReportForSave();
                this.children.saveDialog = new SavereportMaster({
                    model: {
                        report: this.model.report,
                        reportPristine: new PivotReport(),
                        intentionsParser: this.model.intentionsParser,
                        application: this.model.application,
                        user: this.model.user,
                        searchJob: this.model.pivotJob
                    },
                    onHiddenRemove: true,
                    chooseVisualizationType: false,
                    preventSidReuse: true
                });

                this.children.saveDialog.render().appendTo($('body'));
                this.children.saveDialog.show();
            }
        },

        // Because the pivot interface does not support viewing the report as a visualization
        // and a stats table at the same time, make sure that the saved report only shows
        // one or the other but not both (SPL-99805)
        _prepareReportForSave: function() {
            var reportContent = this.model.report.entry.content;
            var generalType = reportContent.get('display.general.type');
            if (generalType === 'visualizations') {
                reportContent.set({
                    'display.visualizations.show': '1',
                    'display.statistics.show': '0'
                });
            } else if (generalType === 'statistics') {
                reportContent.set({
                    'display.visualizations.show': '0',
                    'display.statistics.show': '1'
                });
            }
        },

        saveDataModel: function() {
            this.children.saveDataModelDialog = new SaveDataModelDialog({
                model: {
                    report: this.model.report,
                    application: this.model.application,
                    user: this.model.user,
                    dataModel: this.model.dataModel
                },
                onHiddenRemove: true
            });
            this.children.saveDataModelDialog.render().appendTo($('body')).show();
            this.listenToOnce(this.children.saveDataModelDialog, 'action:flowExited', this.onDialogFlowExited);
        },

        // If a dialog flow is exited in a state where the data model needs to be updated, update the pivot search
        // then clear all references to the temporary data model from the URL and trigger a new route.
        onDialogFlowExited: function(dataModelNeedsUpdate, newPivotSearch) {
            this.model.report.entry.content.set({ search: newPivotSearch });
            if(dataModelNeedsUpdate) {
                this.model.classicurl.set({ q: newPivotSearch });
                this.clearTemporaryDataModelFromUrl();
                this.model.classicurl.save({}, { trigger: true });
            }
        },

        inspectJob: function(job) {
            var root = this.model.application.get('root'),
                locale = this.model.application.get('locale'),
                app = this.model.application.get('app');

            splunkWindow.open(
                route.jobInspector(root, locale, app, job.id),
                'splunk_job_inspector',
                {
                    width: 870,
                    height: 560,
                    menubar: false
                }
            );
        },

        exportJob: function() {
            this.children.exportDialog = new ExportResultsDialog({
                model: {
                    searchJob: this.model.pivotJob,
                    application: this.model.application
                }
            });

            this.children.exportDialog.render().appendTo($('body'));
            this.children.exportDialog.show();
        },

        shareJob: function() {
            var shareLink = route.pivot(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                this.model.application.get('app'),
                { data: this.model.classicurl.toJSON(), absolute: true }
            );
            this.children.shareDialog = new SharePivotDialog({ shareLink: shareLink });
            this.children.shareDialog.render().appendTo($('body'));
            this.children.shareDialog.show();
        },

        handleDrilldown: function(clickInfo, options) {
            var delimiter = ':::',
                allValue = 'ALL',
                otherValue = 'OTHER',
                reportContent = this.model.report.entry.content,
                fields = [],
                values = [],
                postFields = [],
                postValues = [],
                rowContext = clickInfo.rowContext || {},
                rowSplits = reportContent.rows.toArray(),
                type = clickInfo.type,
                applicationModel = this.model.application;

            // Special case handling for when the drilldown type is "row" but there are no row splits, the
            // drilldown action should show all events, which can be accomplished by setting nulls for fields and values.
            // (SPL-101228)
            if (type === 'row' && rowSplits.length === 0) {
                fields = [null];
                values = [null];
            } else if(type !== 'column') {
                fields = _(rowSplits).chain()
                    .invoke('getComputedLabel')
                    .filter(function(field) {
                        return field !== '_time' && rowContext.hasOwnProperty('row.' + field);
                    })
                    .value();
                values = _(fields).map(function(field) {
                    return rowContext['row.' + field];
                });
            }

            // // handle multi-value fields
            var name2RowContext = rowContext['row.' + clickInfo.name2];
            if (type === 'cell' && _.isArray(name2RowContext) && name2RowContext.length > 1) {
                // we need to map the cell click information to its corresponding cell value element
                // if there are multiple cell elements, this is done by matching the label (which is guaranteed to be unique)
                var cellValueLabel = _(clickInfo.name2.split(delimiter)).last(),
                    cells = reportContent.cells,
                    cellValue = cells.length === 1 ? cells.at(0) : cells.find(function(cellModel) {
                        return cellModel.getComputedLabel() === cellValueLabel;
                    });
                if (cellValue) {
                    postFields.push(this.object.addLineagePrefix(cellValue.get('fieldName'), cellValue.get('owner')));
                    postValues.push(clickInfo.value2);
                }
            }

            if ((type === 'cell' || type === 'column') && clickInfo.hasOwnProperty('name2')) {
                var columnSplits = (type === 'column') ? reportContent.columns.slice(0, 1) : reportContent.columns.toArray(),
                    // if there are multiple column splits or multiple cell values,
                    // split the column name on the delimiter that the pivot back end uses
                    columnSplitValues = (columnSplits.length > 1 || reportContent.cells.length > 1) ?
                        _(clickInfo.name2.split(delimiter)).map($.trim) :
                        [$.trim(clickInfo.name2)],
                    isAllColumn = columnSplitValues[0] === allValue,
                    isOtherColumn = columnSplitValues[0] === otherValue;

                if (!isOtherColumn) {
                    _(columnSplits).each(function(columnSplit, i) {
                        // if we're drilling into the ALL column, every column splits should be set to ALL
                        if (isAllColumn) {
                            fields.push(this.object.addLineagePrefix(columnSplit.get('fieldName'), columnSplit.get('owner')));
                            values.push(allValue);
                        }
                        else if (columnSplitValues.length > i) {
                            fields.push(this.object.addLineagePrefix(columnSplit.get('fieldName'), columnSplit.get('owner')));
                            values.push(columnSplitValues[i]);
                        }
                    }, this);
                }
                // For column drilldown, the upstream handlers will do the right thing for OTHER.
                else if(type === 'cell') {
                    fields.push(otherValue);
                    values.push(clickInfo.value2);
                }
            }

            values = _(values).map(function(value) { return value === allValue ? '*' : value; });

            var fieldMetadata = this.model.pivotJob.entry.content.get('fieldMetadataResults'),
                query = {
                    search: this.model.pivotSearch.get('drilldownSearch'),
                    earliest: reportContent.get('dispatch.earliest_time'),
                    latest: reportContent.get('dispatch.latest_time')
                };

            options = _.extend({ fields: fields, values: values }, options);
            route.redirectTo(
                drilldownUtil.applyDrilldownIntention(clickInfo, query, fieldMetadata, applicationModel, options)
                    .then(function(drilldownInfo) {
                        if (postFields.length > 0) {
                            drilldownInfo.q += ' | search';
                            _(postFields).each(function(field, i) {
                                // quote and quote-escape the field and value
                                drilldownInfo.q += ' "' +
                                field.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"") +
                                '" = "' +
                                postValues[i].replace(/\\/g, "\\\\").replace(/\"/g, "\\\"") +
                                '"';
                            });
                        }
                        return route.search(
                            applicationModel.get('root'),
                            applicationModel.get('locale'),
                            applicationModel.get('app'),
                            { data: drilldownInfo }
                        );
                    }),
                drilldownUtil.shouldDrilldownInNewTab(clickInfo, options)
            );
        },

        // TODO [sff] is there a better way to do this?
        // the report needs the display names of the elements to work correctly, but that is not part of the pivot config
        decorateReportElements: function(options) {
            var reportContent = this.model.report.entry.content,
                elementCollections = [reportContent.filters, reportContent.columns, reportContent.rows, reportContent.cells];

            _(elementCollections).each(function(collection) {
                collection.each(function(element) {
                    // the objectCount field will not necessarily have owner defined
                    var field = this.object.getFieldByName(element.get('fieldName'), element.get('owner')),
                        setObject = { displayName: field.displayName };

                    if(collection === reportContent.filters && element.get('filterType') === 'limit') {
                        var limitByField = this.object.getFieldByName(element.get('limitBy'));
                        setObject.limitByDisplayName = limitByField.displayName;
                        setObject.limitByDataType = limitByField.type;
                    }

                    element.set(setObject, options);
                }, this);
            }, this);

            _(elementCollections).each(function(collection) {
                collection.invoke('refreshLabel', options);
            });
        },

        addTimeRangeFilter: function() {
            var reportContent = this.model.report.entry.content,
                indexTimeField = this.object.getIndexTimeField();

            // _time is not guaranteed to be a field, so if it's not there leave the filters empty
            if(indexTimeField) {
                this.model.report.addElement('filter', indexTimeField, { at: 0 });
                reportContent.filters.at(0).setTimeRange(this.model.timeRange, this.collection.timePresets);
            }
        },

        populateReportFromUrl: function() {
            var reportContent = this.model.report.entry.content,
                uriAttrs = _(this.model.classicurl.toJSON()).omit('model');

            // if the report cannot be populated with a search, give it an initial pivot JSON
            if(uriAttrs.q) {
                generalUtils.transferKey(uriAttrs, 'q', 'search');
            }
            else if(!reportContent.get('search')) {
                this.populateInitialPivotJSON(uriAttrs);
                _(['object', 'cells', 'rows', 'columns']).each(function(key) { delete uriAttrs[key]; });
            }

            // handle earliest/latest
            if(uriAttrs.hasOwnProperty('earliest')) {
                generalUtils.transferKey(uriAttrs, 'earliest', 'dispatch.earliest_time');
            }
            else if(!reportContent.get('dispatch.earliest_time')) {
                uriAttrs['dispatch.earliest_time'] = 0;
            }
            generalUtils.transferKey(uriAttrs, 'latest', 'dispatch.latest_time');

            this.model.report.entry.content.set(uriAttrs);
        },

        populateInitialPivotJSON: function(uriAttrs) {
            this.model.report.entry.content.set({ 'baseClass': this.objectName });
            var object = this.model.dataModel.objectByName(this.objectName);
            if(uriAttrs.cells) {
                this.model.report.addElement('cell', object.getFieldByName(uriAttrs.cells));
            }
            else {
                this.model.report.addElement('cell', object.getFieldByName(this.objectName));
            }
            if(uriAttrs.rows) {
                if(uriAttrs.rows !== '_time') {
                    this.model.report.entry.content.set({ rowLimitType: 'descending' });
                }
                this.model.report.addElement('row', object.getFieldByName(uriAttrs.rows));
            }
            if(uriAttrs.columns) {
                this.model.report.addElement('column', object.getFieldByName(uriAttrs.columns));
            }
        },

        populateUrlFromReport: function(options) {
            options = options || {};
            var reportContent = this.model.report.entry.content,
                customAttrs = {},
                reportAttrs = reportContent.filterChangedByWildcards(PivotReport.REPORT_FORMAT_FILTER, { allowEmpty: true }),
                // update the viz type related properties in the URL if the report doesn't have the default viz type,
                // or if there are existing viz type related properties already in the URL
                shouldUpdateVizType = this.model.report.getVisualizationType() !== pivotVizManager.STATISTICS_TABLE ||
                    this.model.classicurl.has('display.visualizations.show');

            // delete display attributes that should not be permalinked
            delete reportAttrs['display.statistics.sortColumn'];
            delete reportAttrs['display.statistics.sortDirection'];

            // if the viz type is not the default, always add the viz type properties to the URL
            if(shouldUpdateVizType) {
                reportAttrs['display.visualizations.show'] = reportContent.get('display.visualizations.show');
                reportAttrs['display.statistics.show'] = reportContent.get('display.statistics.show');
                reportAttrs['display.visualizations.type'] = reportContent.get('display.visualizations.type');
                reportAttrs['display.visualizations.charting.chart'] = reportContent.get('display.visualizations.charting.chart');
            }

            var that = this;
            _(['model', 'object', 'cells', 'rows', 'columns', 'reload']).each(function(key) { that.model.classicurl.unset(key); });
            if(options.reload) {
                customAttrs.reload = true;
            }

            reportAttrs.q = reportContent.get('search');
            if(this.model.report.isNew()) {
                this.model.classicurl.unset('s');
            }
            else {
                this.clearTemporaryDataModelFromUrl();
                customAttrs.s = this.model.report.id;
            }

            customAttrs.earliest = reportContent.get('dispatch.earliest_time');
            if(reportContent.get('dispatch.latest_time')) {
                customAttrs.latest = reportContent.get('dispatch.latest_time');
            }
            else {
                this.model.classicurl.unset('latest');
            }
            this.model.classicurl.save($.extend(customAttrs, reportAttrs), options);
        },

        clearTemporaryDataModelFromUrl: function() {
            this.model.classicurl.unset('seedSid');
            this.model.classicurl.unset('fields');
            this.model.classicurl.unset('field_coverage');
        },

        // normalize the data model name into a fully-qualified version that uses the current app/owner context
        // if the given name is already fully qualified, it will still be modified to use the current app/owner context
        // this is done to mimic the context that will be looked up when the data model name is used to dispatch a pivot search
        // so that any permission errors can be caught sooner and displayed correctly
        constructFullyQualifiedModelName: function(modelName) {
            if(!modelName) {
                return null;
            }
            var app = this.model.application.get('app'),
                owner = this.model.application.get('owner'),
                shortName = modelName.indexOf('/') > -1 ? _(modelName.split('/')).last() : modelName;

            // shortName will already be URL-safe because it comes from the fully-qualified data model URL
            return '/servicesNS/' + encodeURIComponent(owner) + '/' + encodeURIComponent(app) + '/' + this.model.dataModel.url + '/' + shortName;
        },

        registerWithMessages: function(model) {
            this.options.flashMessages.flashMsgHelper.register(
                model,
                [splunkdUtils.FATAL, splunkdUtils.ERROR, splunkdUtils.WARNING]
            );
        },

        unRegisterWithMessages: function(model) {
            this.options.flashMessages.flashMsgHelper.unregister(model);
        }

    },
    {
        DATA_MODEL_ERROR: 'data-model-error',
        OBJECT_ERROR: 'object-error',
        REPORT_ERROR: 'report-error',
        URL_ERROR: 'url-error',
        COLLECT_JOB_ERROR: 'collect-job-error',
        PIVOT_SEARCH_ERROR: 'pivot-search-error',
        SEED_SID_ERROR: 'seed-sid-error',

        // exported for testing only
        TSIDX_NAMESPACE_TOKEN: '__NAMESPACE_TOKEN__',
        ALL_TIME_ADHOC_ACCELERATION: ALL_TIME_ADHOC_ACCELERATION,
        ELASTIC_ADHOC_ACCELERATION: ELASTIC_ADHOC_ACCELERATION,
        NO_ADHOC_ACCELERATION: NO_ADHOC_ACCELERATION,
        ADHOC_ACCELERATION_MODE: getAdhocAccelerationMode()
    });

    return PivotController;

});
