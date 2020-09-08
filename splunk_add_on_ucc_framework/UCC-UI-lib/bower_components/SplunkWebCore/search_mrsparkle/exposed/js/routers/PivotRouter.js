define(
    [
        'jquery',
        'underscore',
        'collections/services/datamodel/DataModels',
        'models/Base',
        'models/classicurl',
        'models/config',
        'models/services/datamodel/DataModel',
        'models/search/Job',
        'routers/DependencyAggregationBase',
        'models/pivot/PivotReport',
        'models/pivot/PivotSearch',
        'models/pivot/PivotJob',
        'models/pivot/datatable/PivotableDataTable',
        'models/services/AppLocal',
        'models/shared/User',
        'models/services/server/ServerInfo',
        'models/shared/TimeRange',
        'models/shared/Application',
        'collections/services/data/ui/Times',
        'views/extensions/DeclarativeDependencies',
        'views/shared/ResponsiveHeaderPage',
        'views/data_model_explorer/DataModelExplorer',
        'views/pivot/PivotView',
        'views/pivot/dialogs/PermissionMismatchDialog',
        'views/pivot/dialogs/CreateReportDialog',
        'views/pivot/dialogs/CreateDashboardPanelDialog',
        'views/pivot/dialogs/SaveDataModelDialog',
        'views/shared/reportcontrols/dialogs/savereport/Master',
        'views/shared/jobstatus/buttons/ExportResultsDialog',
        'views/pivot/dialogs/SharePivotDialog',
        'views/pivot/errors/ErrorDisplay',
        'views/pivot/errors/ErrorPayload',
        'views/shared/FlashMessages',
        'helpers/pivot/ReportHistoryManager',
        'helpers/pivot/PivotVisualizationManager',
        'helpers/Printer',
        'uri/route',
        'util/splunkd_utils',
        'util/general_utils',
        'util/drilldown',
        'util/time',
        'util/console',
        'splunk.util',
        'splunk.window'
    ],
    function(
        $,
        _,
        DataModelCollection,
        BaseModel,
        classicurl,
        configModel,
        DataModel,
        Job,
        DependencyAggregationBase,
        PivotReport,
        PivotSearch,
        PivotJob,
        PivotableDataTable,
        AppLocal,
        User,
        ServerInfo,
        TimeRange,
        Application,
        Times,
        DeclarativeDependencies,
        ResponsiveHeaderPage,
        DataModelExplorer,
        PivotView,
        PermissionMismatchDialog,
        CreateReportDialog,
        CreateDashboardPanelDialog,
        SaveDataModelDialog,
        SavereportMaster,
        ExportResultsDialog,
        SharePivotDialog,
        ErrorDisplay,
        ErrorPayload,
        FlashMessages,
        ReportHistoryManager,
        pivotVizManager,
        Printer,
        route,
        splunkdUtils,
        generalUtils,
        drilldownUtil,
        timeUtils,
        console,
        splunkUtils,
        splunkWindow
    ) {

        // dynamically add dependency declaration behavior to some shared dialog views.
        SavereportMaster = DeclarativeDependencies(SavereportMaster).extend({}, {
            apiDependencies: {
                report: PivotReport,
                reportPristine: { resourceType: PivotReport, flags: ['pristine'] },
                application: Application,
                user: User,
                searchJob: Job
            }
        });
        ExportResultsDialog = DeclarativeDependencies(ExportResultsDialog).extend({}, {
            apiDependencies: {
                searchJob: Job,
                application: Application
            }
        });

        // create an internal model sub-classes that will help with dependency bootstrapping
        var NormalizedDatasetInfo = BaseModel.extend({});

        // constants to represents the three steps in the pivot flow
        var SELECT_DATA_MODEL_STEP = 'select-data-model-step',
            SELECT_OBJECT_STEP = 'select-object-step',
            PIVOT_STEP = 'pivot-step';

        // constants and a private static method for acceleration mode
        var ALL_TIME_ADHOC_ACCELERATION = 'all-time-adhoc-acceleration',
            ELASTIC_ADHOC_ACCELERATION = 'elastic-adhoc-acceleration',
            NO_ADHOC_ACCELERATION = 'no-adhoc-acceleration';

        var FLASH_MESSAGES_WHITELIST = [splunkdUtils.FATAL, splunkdUtils.ERROR, splunkdUtils.WARNING];
        var SKIP_DATA_MODEL_SELECTION = 'skip-data-model-selection';

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

        var PivotRouter = DependencyAggregationBase.extend({

            initialize: function() {
                DependencyAggregationBase.prototype.initialize.apply(this, arguments);
                this.elasticMode = PivotRouter.ADHOC_ACCELERATION_MODE === PivotRouter.ELASTIC_ADHOC_ACCELERATION;
                this.noAccelerationMode = PivotRouter.ADHOC_ACCELERATION_MODE === PivotRouter.NO_ADHOC_ACCELERATION;
                this.classicurl = classicurl;
                this.reportHistoryManager = new ReportHistoryManager();
                this.flashMessages = new FlashMessages();
                this.flashMessagesHelper = this.flashMessages.flashMsgHelper;
                this.application = this.model.application;

                this._bodyView = null;

                this._createPageView = _.once(this._createPageView);

                // Expose these because unit tests need to be able to reach in and mock them.
                // TODO fix those tests
                this.dataModel = new DataModel();
                this.report = new PivotReport();
                this.timeRange = new TimeRange();
                this.collectJob = new Job();
                this.pivotJob = new PivotJob({}, { delay: 500, processKeepAlive: true });
            },

            page: function(locale, app, page) {
                if (this.model.serverInfo.isLite()) {
                    return;
                }
                this.enablePageView = false;
                DependencyAggregationBase.prototype.page.apply(this, arguments);
                this._tearDownEventBindings();
                this._generateDependencyContext().done(function(context) {
                    if (!context) {
                        var hideChrome = splunkUtils.normalizeBoolean(this.model.classicurl.get('hideChrome'));
                        route.redirectTo(route.datasets(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            this.model.application.get('app'),
                            hideChrome ? { data: { hideChrome: true } } : undefined
                        ));
                        return;
                    }
                    // For convenience, let the handlers use the same context information as the dependency fetch.
                    // This may change in the future.
                    this.handlerContext = context;
                    var dependencyDescriptor = {
                        pageView: ResponsiveHeaderPage,
                        bodyView: context.bodyViewConstructor,
                        router: PivotRouter
                    };
                    this.aggregator.fetchAll(dependencyDescriptor, context)
                        .then(function(resources) {
                            this._readRouterResources(resources.router, context);
                            this._pageView = this._createPageView(resources.pageView);
                            this._pageView.replaceAll($('.preload'));
                            if (this._bodyView) {
                                this._bodyView.remove();
                            }
                            this._bodyView = new context.bodyViewConstructor({
                                apiResources: resources.bodyView,
                                flashMessages: this.flashMessages
                            });
                            this._bodyView.render().appendTo($('.main-section-body'));
                            this.setPageTitle(context.pageTitle);
                        }.bind(this))
                        .fail(this._onDependencyLoadError.bind(this));
                }.bind(this));
            },

            _readRouterResources: function(resources, context) {
                this.seedJob = resources.seedJob;
                this.dataModelObject = resources.dataModelObject;
                this.pivotSearch = resources.pivotSearch;
                this.dataTable = resources.dataTable;
                this.datasetInfo = resources.datasetInfo;

                this.dialogResources = _(resources).pick('saveNewDialog', 'dashboardDialog',
                    'saveDataModelDialog', 'saveDialog', 'exportDialog', 'shareDialog',
                    'permissionMismatchDialog');

                if (context.flowStep === PIVOT_STEP) {
                    this._setupEventBindings();
                }
            },
                
            _setupEventBindings: function() {
                if (this.report) {
                    var reportContent = this.report.entry.content;

                    // some general listeners for dispatching new routes or doing replace state operations
                    this.listenTo(this.report, 'change:id', function() {
                        this._populateUrlFromReport(this.report, { trigger: true });
                    });
                    this.listenTo(this.report, 'reportConfigChange', function() {
                        this._bodyView.clearData();
                        // pre-render the data container so it appears how it will look when the page re-dispatches,
                        // but put it in a disabled state so the user doesn't continue to make changes (SPL-83469)
                        this._bodyView.renderContainer({ disabled: true });
                        this._decorateReportElements(this.report, this.dataTable, { silent: true });
                        this._bodyView.showInitializingMessage();
                        this._redispatchReport();
                    });
                    this.listenTo(this.report, 'visualizationTypeChange', this._handleVizTypeChange);
                    this.listenTo(reportContent, 'change', function() {
                        // If the this.report id is also changing, ignore this handler since the once above will
                        // trigger a new route.
                        if (this.report.hasChanged('id')) {
                            return;
                        }
                        var changed = reportContent.changedAttributes();
                        // attributes associated with changing the visualization should be ignored here
                        // they will be updated automatically on the next call to populateUrlFromReport
                        delete changed['display.visualizations.show'];
                        delete changed['display.statistics.show'];
                        delete changed['display.visualizations.type'];
                        delete changed['display.visualizations.charting.chart'];
                        if (!_.isEmpty(changed)) {
                            this._populateUrlFromReport(this.report, { replaceState: true });
                        }
                    });
                    this.listenTo(this.report, 'clear', this._clearReport);
                    this.listenTo(this.report, 'drilldown', this._handleDrilldown);
                    // wire up other custom this.report events
                    this.listenTo(this.report, 'saveAsReport', this._saveNewReport);
                    this.listenTo(this.report, 'saveAsDashboardPanel', this._saveNewDashboardPanel);
                    this.listenTo(this.report, 'save', this._saveReport);
                }
                if (this.pivotJob) {
                    this.listenTo(this.pivotJob, 'rebuildAcceleration', function() {
                        this.classicurl.unset('accSid');
                        this.classicurl.save({}, { trigger: true });
                    });
                    // wire up other custom job events
                    this.listenTo(this.pivotJob, 'inspectAcceleration', function() {
                        this._inspectJob(this.collectJob);
                    });
                    this.listenTo(this.pivotJob, 'inspect', function() {
                        this._inspectJob(this.pivotJob);
                    });
                    this.listenTo(this.pivotJob, 'print', function() { Printer.printPage(); });
                    this.listenTo(this.pivotJob, 'export', this._exportJob);
                    this.listenTo(this.pivotJob, 'share', this._shareJob);
                    this.listenTo(this.pivotJob, 'reload', function() {
                        this._populateUrlFromReport(this.report, { trigger: true, reload: true });
                    });
                    this.flashMessagesHelper.register(this.pivotJob, FLASH_MESSAGES_WHITELIST);

                    // in elastic mode, extra listeners are needed for additional control of the paused/running state of the collect job
                    if(this.elasticMode && !this.dataTable.isAccelerated()) {
                        if(this.collectJob.entry.content.get('isTimeCursored')) {
                            this.listenTo(this.pivotJob.entry.content, 'change:isDone', function() {
                                if(this.pivotJob.isDone()) {
                                    this.collectJob.pause();
                                }
                            });
                        }
                        this.listenTo(this.pivotJob, 'fakeControlAction', function(action) {
                            if(action in { pause: true, finalize: true }) {
                                this.collectJob.pause();
                            }
                            else if(action === 'unpause') {
                                this.collectJob.unpause();
                            }
                        });
                    }
                }
                if (this.dataModel) {
                    this.listenTo(this.dataModel, 'save', this._saveDataModel);
                }
                if (this.collectJob) {
                    this.flashMessagesHelper.register(this.collectJob, FLASH_MESSAGES_WHITELIST);
                }
                if (this.seedJob) {
                    this.flashMessagesHelper.register(this.seedJob, FLASH_MESSAGES_WHITELIST);
                }
                if (this.pivotSearch) {
                    this.flashMessagesHelper.register(this.pivotSearch, FLASH_MESSAGES_WHITELIST);
                }
            },
                
            _tearDownEventBindings: function() {
                this.stopListening();
                if (this.report) {
                    this.reportHistoryManager.unregister(this.report);
                }
                if (this.collectJob) {
                    this.flashMessagesHelper.unregister(this.collectJob);
                }
                if (this.seedJob) {
                    this.flashMessagesHelper.unregister(this.seedJob);
                }
                if (this.pivotSearch) {
                    this.flashMessagesHelper.unregister(this.pivotSearch);
                }
                if (this.pivotJob) {
                    this.flashMessagesHelper.unregister(this.pivotJob);
                }
            },
                
            _handleVizTypeChange: function() {
                var contentToConfig = function(content) {
                    return ({
                        reportLevelAttributes: content.filterByWildcards(PivotReport.PIVOT_CONTENT_FILTER),
                        cells: content.cells.toJSON(),
                        rows: content.rows.toJSON(),
                        columns: content.columns.toJSON()
                    });
                };
    
                var reportContent = this.report.entry.content,
                    oldConfig = contentToConfig(reportContent);
    
                this._bodyView.clearData();
                this.reportHistoryManager.applyConfigUpdates(this.report, this.dataTable.getFieldList(), { silent: true });
                this.reportHistoryManager.applyVisualizationUpdates(this.report);
    
                // if applying the updates changed the report config, trigger a new route, otherwise just re-render
                if(_.isEqual(contentToConfig(reportContent), oldConfig)) {
                    this._bodyView.renderContainer();
                    this._bodyView.renderData();
                    this._populateUrlFromReport(this.report, { replaceState: true });
                }
                else {
                    // pre-render the data container so it appears how it will look when the page re-dispatches,
                    // but put it in a disabled state so the user doesn't continue to make changes (SPL-83469)
                    this._bodyView.renderContainer({ disabled: true });
                    this.pivotJob.stopPolling();
                    this._bodyView.showInitializingMessage();
                    this._redispatchReport();
                }
            },
    
            _redispatchReport: function() {
                this.pivotSearch.clear();
                var reportContent = this.report.entry.content,
                    pivotJson = this.report.getPivotJSON(),
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
    
                this.pivotSearch.set({ pivotJson: JSON.stringify(pivotJson) });
                this.pivotSearch.fetch({ data: this._generatePivotSearchFetchData(this.dataModel) })
                    .done(function() {
                        reportContent.set({ search: this.pivotSearch.get('pivotSearch') }, { silent: true });
                        this._populateUrlFromReport(this.report, { trigger: true, reload: true });
                    }.bind(this))
                    .fail(function() {
                        this._bodyView.renderErrors();
                        // The config controls will have been disabled in preparation for a re-dispatch.
                        // Enable them again here so the user can recover from the error (SPL-85033).
                        this._bodyView.renderContainer({ disabled: false });
                    }.bind(this));
            },
    
            _clearReport: function() {
                this.reportHistoryManager.clearHistory();
                var urlArgs = this.classicurl.pick('accSid');
                if (this.dataModel.isTemporary()) {
                    _.extend(urlArgs, this.classicurl.pick('seedSid', 'fields', 'field_coverage'));
                }
                else if (this.datasetInfo.has('dataset')) {
                    urlArgs.dataset = splunkUtils.searchUnescape(this.datasetInfo.get('dataset'));
                    urlArgs.type = this.datasetInfo.get('type');
                }
                else {
                    urlArgs.model = this.dataModel.id;
                    urlArgs.object = this.dataModelObject.get('objectName');
                }
                this.classicurl.clear();
                this.classicurl.save(urlArgs, { trigger: true });
            },
    
            _saveNewReport: function() {
                this._prepareReportForSave();
                this.saveNewDialog = new CreateReportDialog({
                    apiResources: this.dialogResources.saveNewDialog,
                    onHiddenRemove: true,
                    preventSidReuse: true
                });
                this.saveNewDialog.render().appendTo($('body'));
                this.saveNewDialog.show();
                this.listenToOnce(this.saveNewDialog, 'action:flowExited', this._onDialogFlowExited);
            },
    
            _saveNewDashboardPanel: function() {
                this.dashboardDialog = new CreateDashboardPanelDialog({
                    apiResources: this.dialogResources.dashboardDialog,
                    onHiddenRemove: true
                });
    
                this.dashboardDialog.render().appendTo($('body'));
                this.dashboardDialog.show();
                this.listenToOnce(this.dashboardDialog, 'action:flowExited', this._onDialogFlowExited);
            },
    
            _saveReport: function() {
                var reportVisibility = this.report.entry.acl.get('sharing'),
                    dataModelVisibility = this.dataModel.entry.acl.get('sharing');
    
                // SPL-74393, a report can't be saved if it is shared but its data model is private
                // detect that permission mismatch and display a helpful dialog
                if(dataModelVisibility === 'user' && reportVisibility !== 'user') {
                    this.permissionMismatchDialog = new PermissionMismatchDialog({
                        apiResources: this.dialogResources.permissionMismatchDialog,
                        onHiddenRemove: true
                    });
                    this.permissionMismatchDialog.render().appendTo($('body'));
                    this.permissionMismatchDialog.show();
                }
                else {
                    this._prepareReportForSave();
                    this.saveDialog = new SavereportMaster({
                        apiResources: this.dialogResources.saveDialog,
                        onHiddenRemove: true,
                        chooseVisualizationType: false,
                        preventSidReuse: true
                    });
    
                    this.saveDialog.render().appendTo($('body'));
                    this.saveDialog.show();
                }
            },
    
            // Because the pivot interface does not support viewing the report as a visualization
            // and a stats table at the same time, make sure that the saved report only shows
            // one or the other but not both (SPL-99805)
            _prepareReportForSave: function() {
                var reportContent = this.report.entry.content;
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
    
            _saveDataModel: function() {
                this.saveDataModelDialog = new SaveDataModelDialog({
                    apiResources: this.dialogResources.saveDataModelDialog,
                    onHiddenRemove: true
                });
                this.saveDataModelDialog.render().appendTo($('body')).show();
                this.listenToOnce(this.saveDataModelDialog, 'action:flowExited', this._onDialogFlowExited);
            },
    
            // If a dialog flow is exited in a state where the data model needs to be updated, update the pivot search
            // then clear all references to the temporary data model from the URL and trigger a new route.
            _onDialogFlowExited: function(dataModelNeedsUpdate, newPivotSearch) {
                this.report.entry.content.set({ search: newPivotSearch });
                if(dataModelNeedsUpdate) {
                    this.classicurl.set({ q: newPivotSearch });
                    this._clearTemporaryDataModelFromUrl();
                    this.classicurl.save({}, { trigger: true });
                }
            },
    
            _inspectJob: function(job) {
                var root = this.application.get('root'),
                    locale = this.application.get('locale'),
                    app = this.application.get('app');
    
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
    
            _exportJob: function() {
                this.exportDialog = new ExportResultsDialog({
                    apiResources: this.dialogResources.exportDialog
                });
    
                this.exportDialog.render().appendTo($('body'));
                this.exportDialog.show();
            },
    
            _shareJob: function() {
                var shareLink = route.pivot(
                    this.application.get('root'),
                    this.application.get('locale'),
                    this.application.get('app'),
                    { data: this.classicurl.toJSON(), absolute: true }
                );
                this.shareDialog = new SharePivotDialog({
                    apiResources: this.dialogResources.shareDialog,
                    shareLink: shareLink 
                });
                this.shareDialog.render().appendTo($('body'));
                this.shareDialog.show();
            },
            
            _handleDrilldown: function(clickInfo, options) {
                var delimiter = ':::',
                    allValue = 'ALL',
                    otherValue = 'OTHER',
                    reportContent = this.report.entry.content,
                    fields = [],
                    values = [],
                    postFields = [],
                    postValues = [],
                    rowContext = clickInfo.rowContext || {},
                    rowSplits = reportContent.rows.toArray(),
                    type = clickInfo.type,
                    applicationModel = this.application;
    
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
                        postFields.push(this.dataTable.convertToFullyQualifiedName(cellValue.get('fieldName')));
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
                                fields.push(this.dataTable.convertToFullyQualifiedName(columnSplit.get('fieldName')));
                                values.push(allValue);
                            }
                            else if (columnSplitValues.length > i) {
                                fields.push(this.dataTable.convertToFullyQualifiedName(columnSplit.get('fieldName')));
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
    
                var fieldMetadata = this.pivotJob.entry.content.get('fieldMetadataResults'),
                    query = {
                        search: this.pivotSearch.get('drilldownSearch'),
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

            _generateDependencyContext: function() {
                return this.classicurl.fetch().then(function() {
                    var flowStep, bodyViewConstructor, pageTitle;
                    if(this.classicurl.get('q') || this.classicurl.get('s') || this.classicurl.get('seedSid')
                            || (this.classicurl.get('model') && this.classicurl.get('object'))
                            || this.classicurl.get('dataset')) {
                        flowStep = PIVOT_STEP;
                        bodyViewConstructor = PivotView;
                        pageTitle = _('Pivot').t();
                    } else if(this.classicurl.get('model')) {
                        flowStep = SELECT_OBJECT_STEP;
                        bodyViewConstructor = DataModelExplorer;
                        pageTitle = _('Select a Dataset').t();
                    } else {
                        // If the URL argument don't match a supported scheme, return null to notify
                        // the consumer that we need to redirect.
                        return null;
                    }
                    return ({
                        urlArgs: this.classicurl.toJSON(),
                        flowStep: flowStep,
                        bodyViewConstructor: bodyViewConstructor,
                        pageTitle: pageTitle,
                        appOwner: this.application.pick('app', 'owner'),
                        elasticMode: this.elasticMode,
                        noAccelerationMode: this.noAccelerationMode
                    });
                }.bind(this));
            },

            // Wrapped with _.once in initialize()
            _createPageView: function(resources) {
                var pageViewRenderedDfd = $.Deferred();
                // We'll be using a ResponsiveHeaderPage for Pivot
                var pageView = new ResponsiveHeaderPage({
                    splunkBar: this.enableSplunkBar,
                    showAppsList: this.showAppsList,
                    showAppNav: this.enableAppBar,
                    footer: false,
                    section: 'pivot',
                    apiResources: resources,
                    deferreds: {
                        pageViewRendered: pageViewRenderedDfd
                    }
                });
                pageView.render();
                pageViewRenderedDfd.resolve();
                return pageView;
            },

            _onDependencyLoadError: function(errorPayload) {
                if (!errorPayload) {
                    errorPayload = _('An error occurred loading the page.').t();
                }
                if (_.isString(errorPayload)) {
                    errorPayload = ErrorPayload.fromString(errorPayload);
                } else if (!(errorPayload instanceof ErrorPayload)) {
                    errorPayload = ErrorPayload.fromRawResponse(errorPayload);
                }
                var errorDisplay = new ErrorDisplay({
                    model: {
                        application: this.application
                    },
                    errorPayload: errorPayload
                });
                this.aggregator.fetchAll({ pageView: ResponsiveHeaderPage })
                    .done(function(resources) {
                        var pageView = this._createPageView(resources.pageView);
                        pageView.replaceAll($('.preload'));
                        errorDisplay.render().appendTo($('.main-section-body'));
                    }.bind(this))
                    .fail(function() {
                        errorDisplay.render().replaceAll($('.preload'));
                    })
                    .always(function() {
                        this._generateDependencyContext().done(function(context) {
                            this.setPageTitle(context.pageTitle);
                        }.bind(this));
                    }.bind(this));
            },

            _addDependencyHandlers: function(aggregator) {
                DependencyAggregationBase.prototype._addDependencyHandlers.apply(this, arguments);

                // Sorted Data Model collection
                aggregator.addHandler(DataModelCollection, _.once(function() {
                    var dataModels = new DataModelCollection();
                    dataModels.fetchData.set({ sortKey: 'displayName', sortDirection: 'asc', count: 20, concise: true }, { silent: true });
                    var dfd = dataModels.fetch({ data: this.handlerContext.appOwner })
                        .then(function() {
                            // If there is only one non-empty data model, signal that the data model selection should be skipped,
                            // unless the "noredirect" flag is set.
                            if(dataModels.length === 1 && this.handlerContext.flowStep === SELECT_DATA_MODEL_STEP
                                    && !dataModels.models[0].isEmpty() && !this.classicurl.get('noredirect')) {
                                var firstModel = dataModels.models[0];
                                return $.Deferred().reject(SKIP_DATA_MODEL_SELECTION, { modelId: firstModel.get('id') });
                            }
                        }.bind(this));
                    return { resource: dataModels, deferred: dfd };
                }.bind(this)));

                // The user's Time Presets
                aggregator.addHandler(Times, _.once(function() {
                    var times = new Times();
                    return { resource: times, deferred: times.fetch({ data: _.extend({ count: -1 }, this.handlerContext.appOwner) }) };
                }.bind(this)));

                // An empty, pristine version of the Pivot Report model
                aggregator.addHandler(PivotReport, ['pristine'], function() {
                    return new PivotReport();
                });

                // The raw version of the Pivot Report model.  For each dependency fetching session, this will serve as the
                // starting point for the report, to be enhanced with attributes from the URL, data model, pivot query, etc.
                aggregator.addHandler(PivotReport, ['raw'], function(previous) {
                    var reportId = this.handlerContext.urlArgs.s;
                    if (previous && previous.get('id') === reportId) {
                        return previous;
                    }
                    var report = new PivotReport();
                    if (reportId) {
                        report.set({ id: reportId });
                    }
                    // If we're not recycling the previous report, there are certain content-level attributes that need
                    // to be copied over from it.
                    if (previous) {
                        var persistentAttrs = previous.entry.content.filterByWildcards(PivotReport.PIVOT_CONTENT_FILTER, { allowEmpty: true });
                        report.entry.content.set(persistentAttrs);
                    }
                    return report.fetch({ data: this.handlerContext.appOwner }).then(
                        function() { return report; },
                        function() {
                            return new ErrorPayload(ErrorPayload.TYPES.REPORT, { report: report });
                        }
                    );
                }.bind(this));

                // The preliminary version of the Pivot Report model.
                // This version will include the attributes from the saved/searches endpoint with any relevant defaults
                // and URL arguments layered in.  The main distinction between this and the "raw" version above is that
                // this is always the same instance that gets updated in-place with the current state, whereas the "raw"
                // version can be a new instance each time.  This allows the "raw" version to serve as a cache that prevents
                // duplicate requests to the back end, without getting polluted by page-specific state.
                aggregator.addHandler(PivotReport, ['preliminary'], function(previous, aggregator) {
                    var dfd = aggregator.waitFor(PivotReport, ['raw']).then(function(rawReport) {
                        this.report.clear({ silent: true });
                        this.report.setFromSplunkD(rawReport.toSplunkD(), { silent: true });
                        if (this.report.isNew()) {
                            this.report.entry.content.set({ 'display.prefs.statistics.count': '20' }, { silent: true });
                            this.report.setVisualizationType(pivotVizManager.STATISTICS_TABLE, { silent: true });
                        }
                        this._populateReportFromUrl(this.report, { silent: true });
                    }.bind(this));
                    return { resource: this.report, deferred: dfd };
                }.bind(this));

                // The full representation of the report time range.  The initial earliest/latest settings
                // are parsed either from the URL or the saved report, and then the time range model is
                // populated with additional information from the back end.
                aggregator.addHandler(TimeRange, function(previous, aggregator) {
                    var timeRange = this.timeRange;
                    var initialSettingsPromise = function() {
                        if (this.handlerContext.urlArgs.earliest) {
                            return {
                                earliest: this.handlerContext.urlArgs.earliest,
                                latest: this.handlerContext.urlArgs.latest
                            };
                        }
                        return aggregator.waitFor(PivotReport, ['preliminary']).then(function(report) {
                            var reportContent = report.entry.content;
                            return {
                                earliest: reportContent.get('dispatch.earliest_time'),
                                latest: reportContent.get('dispatch.latest_time')
                            };
                        });
                    }.bind(this);
                    return $.when(initialSettingsPromise()).then(function(initialSettings) {
                        timeRange.set(initialSettings, { silent: true });
                        return timeRange.save().then(
                            // success filter, if the time range is valid we're good to go
                            function() { return timeRange; },
                            // fail filter, reset the report's time range to all time and try again
                            function() {
                                timeRange.restoreDefaults();
                                timeRange.set({ earliest: 0 });
                                timeRange.unset('latest');
                                return timeRange.save().then(function() { return timeRange; });
                            }
                        );
                    }.bind(this));
                }.bind(this));

                // The normalized dataset info is an internal model "type" used to remove code duplication from
                // dependency handlers.  Its contents can have three different formats.
                //
                // 1) When operating on a data model object, contains:
                //      "model" -> fully qualified data model id
                //      "object" -> name of data model object
                // 2) When operating on an sid, contains:
                //      "seedSid" -> sid to use as input for generating the data model
                //      "fields" -> (optional) comma-separated whitelist of fields to use
                //      "field_coverage" -> (optional) cutoff of field coverage, only fields with <= coverage are used
                // 3) When operating on a dataset that is not a data model object, contains:
                //      "model" -> fully qualified id of data-model-equivalent resource
                //      "dataset" -> short name of dataset
                //      "type" -> the type of dataset (savedsearch, lookup, etc.)
                aggregator.addHandler(NormalizedDatasetInfo, function(previous, aggregator) {
                    // Helper function to parse dataset info from a "| pivot" search string.
                    // The search string can have two forms:
                    //      | pivot <data model name> <object name> ...
                    //      | pivot <dataset type>:<dataset name> <object name> ...
                    var parseDatasetInfoFromSearch = function(search) {
                        var modelAndObject = PivotReport.parseModelAndObjectFromSearch(search);
                        if(!modelAndObject || modelAndObject.length < 3) {
                            return aggregator.waitFor(PivotReport, ['preliminary']).then(function(report) {
                                return $.Deferred().reject(
                                    new ErrorPayload(ErrorPayload.TYPES.PIVOT_SEARCH, { report: report })
                                );
                            });
                        }
                        var shortModelName = modelAndObject[1];

                        if (shortModelName.indexOf(':') > -1) {
                            var typeAndDataset = shortModelName.split(':');
                            return normalizeFromDatasetAndType(typeAndDataset[1], typeAndDataset[0]);
                        }
                        return new NormalizedDatasetInfo({
                            model: this._constructFullyQualifiedModelName(encodeURIComponent(modelAndObject[1])),
                            object: modelAndObject[2]
                        });
                    }.bind(this);

                    // Helper function to construct a dataset info model from a dataset name and type.
                    // Handles the special case where the dataset type is actually a data model object,
                    // in which case the data model and object names should be used directly.
                    var normalizeFromDatasetAndType = function(dataset, type) {
                        if (type === 'datamodel') {
                            var modelAndObject = dataset.split('.');
                            return new NormalizedDatasetInfo({
                                model: this._constructFullyQualifiedModelName(modelAndObject[0]),
                                object: modelAndObject[1]
                            });
                        }

                        var typedDatasetName = type + ':' + dataset;

                        return new NormalizedDatasetInfo({
                            dataset: dataset,
                            type: type,
                            model: this._constructFullyQualifiedModelName(encodeURIComponent(typedDatasetName))
                        });
                    }.bind(this);

                    // In the case of URL arguments like "model"/"object", "dataset"/"type", "seedSid", or "q",
                    // the dataset info can be computed directly without any other dependencies.
                    var urlArgs = this.handlerContext.urlArgs;
                    if (urlArgs.model) {
                        return new NormalizedDatasetInfo({
                            model: this._constructFullyQualifiedModelName(urlArgs.model),
                            object: urlArgs.object
                        });
                    }
                    if (urlArgs.dataset) {
                        var escapedDatasetName = splunkUtils.searchEscape(urlArgs.dataset);
                        return normalizeFromDatasetAndType(escapedDatasetName, urlArgs.type);
                    }
                    if (urlArgs.seedSid) {
                        return new NormalizedDatasetInfo(_(urlArgs).pick('seedSid', 'fields', 'field_coverage'));
                    }
                    if (urlArgs.q) {
                        return parseDatasetInfoFromSearch(urlArgs.q);
                    }
                    if (!urlArgs.s) {
                        return $.Deferred().reject(
                            _('Missing required URL arguments: one of "q", "model", "seedSid", "s", "dataset"').t()
                        );
                    }
                    // When operating only on an "s" URL argument, we need to fetch that report and
                    // parse the dataset info from its search string.
                    return aggregator.waitFor(PivotReport, ['raw']).then(function(report) {
                        return parseDatasetInfoFromSearch(report.entry.content.get('search'));
                    });
                }.bind(this));

                // The current Data Model
                aggregator.addHandler(DataModel, function(previous, aggregator) {
                    return aggregator.waitFor(NormalizedDatasetInfo).then(function(datasetInfo) {
                        // If the data model should be created from an sid, delegate to that handler.
                        if (this.handlerContext.flowStep === PIVOT_STEP && datasetInfo.has('seedSid')) {
                            return aggregator.waitFor(DataModel, ['from sid']);
                        }
                        // Similarly, generating a data model from a dataset delegates to that handler.
                        if (this.handlerContext.flowStep === PIVOT_STEP && datasetInfo.has('dataset')) {
                            return aggregator.waitFor(DataModel, ['from dataset']);
                        }
                        // If we get here we're operating on an existing data model and object,
                        // so just do a straight-forward fetch by id.
                        var normalizedModelId = datasetInfo.get('model');
                        if (previous && previous.get('id') === normalizedModelId) {
                            return previous;
                        }
                        var dataModel = this.dataModel;
                        dataModel.clear({ silent: true });
                        dataModel.set({ id: normalizedModelId }, { silent: true });
                        return dataModel.fetch({ data: this.handlerContext.appOwner }).then(
                            function() { return dataModel; },
                            function() {
                                return new ErrorPayload(
                                    ErrorPayload.TYPES.DATA_MODEL,
                                    { dataModel: dataModel }
                                );
                            }
                        );
                    }.bind(this));
                }.bind(this));

                // The current Data Model when created from a seed sid
                aggregator.addHandler(DataModel, ['from sid'], function(previous) {
                    if (previous && previous.get('sid') === this.handlerContext.urlArgs.seedSid) {
                        return previous;
                    }
                    var dataModel = this.dataModel;
                    var fetchData = _.extend(
                        { sid: this.handlerContext.urlArgs.seedSid }, this.handlerContext.appOwner, _(this.handlerContext.urlArgs).pick('fields', 'field_coverage')
                    );
                    return dataModel.fetch({ data: fetchData }).then(
                        function() { return dataModel; },
                        function() {
                            return new ErrorPayload(ErrorPayload.TYPES.SEED_SID, { seedSid: this.handlerContext.urlArgs.seedSid });
                        }.bind(this)
                    );
                }.bind(this));

                // The current Data Model when created from a dataset
                aggregator.addHandler(DataModel, ['from dataset'], function(previous) {
                    if (previous && previous.get('dataset') === this.handlerContext.urlArgs.dataset) {
                        return previous;
                    }
                    var dataModel = this.dataModel;
                    return aggregator.waitFor(NormalizedDatasetInfo).then(function(datasetInfo) {
                        var fetchData = _.extend(
                            datasetInfo.pick('dataset', 'type'),
                            this.handlerContext.appOwner
                        );
                        return dataModel.fetch({ data: fetchData }).then(
                            function() { return dataModel; },
                            function() {
                                return new ErrorPayload(ErrorPayload.TYPES.DATASET, { datasetName: datasetInfo.get('dataset') });
                            }
                        );
                    }.bind(this));
                }.bind(this));

                // The current Data Model Object
                aggregator.addHandler(DataModel.Object, function(previous, aggregator) {
                    var dfd = $.when(
                        aggregator.waitFor(DataModel),
                        aggregator.waitFor(NormalizedDatasetInfo)
                    );
                    return dfd.then(function(dataModel, datasetInfo) {
                        // In the case of generated data models (from an sid or a dataset), there will only be one object.
                        if (datasetInfo.has('seedSid')) {
                            if (dataModel.entry.content.objects.length === 0) {
                                return $.Deferred().reject(
                                    new ErrorPayload(ErrorPayload.TYPES.SEED_SID, { seedSid: datasetInfo.get('seedSid') })
                                );
                            }
                            return dataModel.entry.content.objects.at(0);
                        }
                        if (datasetInfo.has('dataset')) {
                            if (dataModel.entry.content.objects.length === 0) {
                                console.error('The dataset generated an empty data model.');
                                return $.Deferred().reject(
                                    new ErrorPayload(ErrorPayload.TYPES.DATASET, { datasetName: datasetInfo.get('dataset') })
                                );
                            }
                            return dataModel.entry.content.objects.at(0);
                        }
                        // Otherwise, find the object by name.
                        if (dataModel.entry.content.objects.length === 0) {
                            return $.Deferred().reject(
                                _('The data model does not contain any objects.').t()
                            );
                        }
                        var objectName = datasetInfo.get('object');
                        // If the object name is not explicitly specified, default to the first object in the data model.
                        var object = objectName ? 
                            dataModel.objectByName(objectName) : 
                            dataModel.entry.content.objects.at(0);
                        if (!object) {
                            return $.Deferred().reject(
                                new ErrorPayload(ErrorPayload.TYPES.OBJECT, { objectName: objectName, dataModel: dataModel })
                            );
                        }
                        return object;
                    }.bind(this));
                }.bind(this));

                // The "pivotable data table" is an adapter that can be driven by a data model object
                // or a dataset.  Most views in the pivot UI will consume this resource so that they don't
                // need any conditional logic for the different drivers.  The exceptions are usually calls to
                // action that are specific to data models or datasets.
                aggregator.addHandler(PivotableDataTable, function(previous, aggregator) {
                    var dfd = $.when(
                        aggregator.waitFor(DataModel),
                        aggregator.waitFor(DataModel.Object),
                        aggregator.waitFor(NormalizedDatasetInfo)
                    );
                    return dfd.then(function(dataModel, dataModelObject, datasetInfo) {
                        if (datasetInfo.has('dataset')) {
                            return PivotableDataTable.createFromDataset(dataModelObject,
                                {fullyQualifiedId: this._constructFullyQualifiedDatasetName(datasetInfo),
                                 displayName: datasetInfo.get("dataset")});
                        }
                        if (dataModel.entry.content.get('dataset.type') === DataModel.DOCUMENT_TYPES.TABLE) {
                            return PivotableDataTable.createFromDataset(dataModelObject,
                                {fullyQualifiedId: dataModel.id,
                                 displayName: dataModel.entry.content.get('displayName')});
                        }
                        return PivotableDataTable.createFromDataModelObject(dataModelObject, dataModel);
                    }.bind(this));
                }.bind(this));

                // The next version in the lifecycle of the Pivot Report model.
                // This version is guaranteed to have a query filled in, whether in the form of a search string
                // or some initial pivot JSON.
                aggregator.addHandler(PivotReport, ['query guaranteed'], function(previous, aggregator) {
                    // If there is already a search string - either from the URL or from an existing report -
                    // then no additional pre-processing is needed.
                    if (this.handlerContext.urlArgs.q || this.handlerContext.urlArgs.s) {
                        return aggregator.waitFor(PivotReport, ['preliminary']);
                    }
                    // If not - this means we are starting a new report from scratch - generate an initial
                    // pivot configuration by explicitly adding cells/rows/columns.
                    var dfd = $.when(
                        aggregator.waitFor(PivotReport, ['preliminary']),
                        aggregator.waitFor(PivotableDataTable)
                    );
                    return dfd.then(function(report, dataTable) {
                        report.entry.content.set({ baseClass: dataTable.get('id') }, { silent: true });
                        if(this.handlerContext.urlArgs.cells) {
                            report.addElement('cell', dataTable.getFieldByName(this.handlerContext.urlArgs.cells), { silent: true });
                        }
                        else {
                            report.addElement('cell', dataTable.getFieldByName(dataTable.get('id')), { silent: true });
                        }
                        if(this.handlerContext.urlArgs.rows) {
                            if(this.handlerContext.urlArgs.rows !== '_time') {
                                report.entry.content.set({ rowLimitType: 'descending' }, { silent: true });
                            }
                            report.addElement('row', dataTable.getFieldByName(this.handlerContext.urlArgs.rows), { silent: true });
                        }
                        if(this.handlerContext.urlArgs.columns) {
                            report.addElement('column', dataTable.getFieldByName(this.handlerContext.urlArgs.columns), { silent: true });
                        }
                        return report;
                    }.bind(this));
                }.bind(this));

                // The pivot search model contains all of the information about the current pivot query.  This includes
                // its representation as a structured JSON object and as a "| pivot" search string, and some additional
                // equivalent searches that consumers might need (e.g. "tstats search", "raw search", "drilldown search").
                //
                // The pivot search can be fetched two ways.  Either a "| pivot" search string can be the input and
                // it will be translated to pivot JSON, or vice versa.
                aggregator.addHandler(PivotSearch, function(previous, aggregator) {
                    // Set up parallel promises for the data model and the full query report, we might not need them.
                    var dataModelPromise = aggregator.waitFor(DataModel);
                    var fullQueryReportPromise = aggregator.waitFor(PivotReport, ['query guaranteed']);

                    // Construct a promise for the fetch data to use when populating the pivot search.
                    // If the data model is being generated from an sid we need to wait for that, otherwise
                    // we can just construct the fetch data from the model id.
                    var fetchDataPromise = aggregator.waitFor(NormalizedDatasetInfo).then(function(datasetInfo) {
                        if (datasetInfo.has('seedSid')) {
                            return dataModelPromise.then(this._generatePivotSearchFetchData.bind(this));
                        }
                        return this._generatePivotSearchFetchDataFromModelId(datasetInfo.get('model'));
                    }.bind(this));
                    var pivotSearch = new PivotSearch();

                    // Helper function to fetch the pivot search and populate an error payload if it fails.
                    var fetchPivotSearch = function(fetchData) {
                        return pivotSearch.fetch({ data: fetchData }).then(
                            function() { return pivotSearch; },
                            function() {
                                var dfd = $.when(
                                    aggregator.waitFor(PivotReport, ['preliminary']),
                                    aggregator.waitFor(NormalizedDatasetInfo)
                                );
                                return dfd.then(function(report, datasetInfo) {
                                    return $.Deferred().reject(new ErrorPayload(
                                        ErrorPayload.TYPES.PIVOT_SEARCH,
                                        { report: report, dataModelId: datasetInfo.get('model') }
                                    ));
                                });
                            }
                        );
                    };
                    var dfd = $.when(
                        fetchDataPromise,
                        aggregator.waitFor(PivotReport, ['preliminary']),
                        aggregator.waitFor(NormalizedDatasetInfo)
                    );
                    return dfd.then(function(fetchData, report, datasetInfo) {
                        // If the "| pivot" form of the query is already known, use that as the input.
                        var reportSearchString = report.entry.content.get('search');
                        if (reportSearchString) {
                            pivotSearch.set({ pivotSearch: reportSearchString });
                            return fetchPivotSearch(fetchData);
                        }
                        // Otherwise, the pivot JSON will have to be pulled out of the report.  This means we have
                        // to wait for the "query guaranteed" version of the report to be ready.
                        return fullQueryReportPromise.then(function(report) {
                            var pivotJson = report.getPivotJSON();
                            // Usually the data model id will already be contained in the pivot JSON, or can be pulled
                            // from the normalized dataset info.
                            if (pivotJson.dataModel || datasetInfo.has('model')) {
                                pivotJson.dataModel = pivotJson.dataModel || _(datasetInfo.get('model').split('/')).last();
                                pivotSearch.set({ pivotJson: JSON.stringify(pivotJson) });
                                return fetchPivotSearch(fetchData);
                            }
                            // The exception is the generate-from-sid case, where the data model is not known until
                            // the data model itself has been populated by the back end.
                            return dataModelPromise.then(function(dataModel) {
                                pivotJson.dataModel = _(dataModel.get('id').split('/')).last();
                                pivotSearch.set({ pivotJson: JSON.stringify(pivotJson) });
                                return fetchPivotSearch(fetchData);
                            });
                        }.bind(this));
                    }.bind(this));
                }.bind(this));

                // The finalized version of the Pivot Report model
                // It will be enriched with any relevant information from the data model object, time range,
                // and parsed pivot query (aka the pivot search model).
                aggregator.addHandler(PivotReport, function(previous, aggregator) {
                    // If the data model object turns out to not have _time as a field, we won't need
                    // the time presets.  This is an uncommon case so we go ahead and request the time
                    // presets but make sure not block on them if we don't need to.
                    var timePresetsPromise = aggregator.waitFor(Times);
                    var dfd = $.when(
                        aggregator.waitFor(PivotReport, ['query guaranteed']),
                        aggregator.waitFor(PivotableDataTable),
                        aggregator.waitFor(PivotSearch),
                        aggregator.waitFor(TimeRange)
                    );
                    dfd = dfd.then(function(report, dataTable, pivotSearch, timeRange) {
                        var reportContent = report.entry.content;
                        reportContent.set({
                            search: pivotSearch.get('pivotSearch'),
                            'dispatch.earliest_time': timeRange.get('earliest')
                        }, { silent: true });
                        if (timeRange.has('latest')) {
                            reportContent.set({ 'dispatch.latest_time': timeRange.get('latest') }, { silent: true });
                        } else {
                            reportContent.unset('dispatch.latest_time', { silent: true });
                        }
                        report.setFromPivotJSON(pivotSearch.get('pivotJson'), { silent: true });
                        this._decorateReportElements(report, dataTable, { silent: true });

                        var indexTimeField = dataTable.getIndexTimeField();
                        // _time is not guaranteed to be a field, so if it's not there leave the filters empty
                        if(indexTimeField) {
                            return timePresetsPromise.then(function(timePresets) {
                                report.addElement('filter', indexTimeField.toJSON(), { at: 0, silent: true });
                                reportContent.filters.at(0).setTimeRange(timeRange, timePresets);
                                return report;
                            });
                        }
                        return report;
                    }.bind(this));
                    dfd = dfd.done(function(report) {
                        this.reportHistoryManager.register(report);
                        this.reportHistoryManager.applyVisualizationUpdates(report);
                        this._populateUrlFromReport(report, { replaceState: true });
                    }.bind(this));
                    return dfd;
                }.bind(this));

                // The "seed job" used when operating on an sid.  The UI logic does not need to interact directly
                // with this job, but it does need to be kept alive so that it isn't reaped in the middle of
                // the user's session.
                aggregator.addHandler(Job, ['seed job'], function() {
                    var seedJob = new Job({}, { delay: Job.DEFAULT_LONG_POLLING_INTERVAL, processKeepAlive: true });
                    if (this.handlerContext.urlArgs.seedSid) {
                        seedJob.set({ id: this.handlerContext.urlArgs.seedSid });
                        seedJob.fetch({ data: this.handlerContext.appOwner }).done(function() {
                            if (!seedJob.isDone()) {
                                seedJob.startPolling();
                                seedJob.stopKeepAlive();
                            }
                        });
                    }
                    return seedJob;
                }.bind(this));

                // The "collect job" powers the pivot UI's ad-hoc acceleration.  Its purpose is to run a search over the
                // base search of the current "pivotable data table" and store the results in a temporary tsidx namespace.
                // As the user changes their query configuration, another job is dispatched against that tsidx namespace
                // to get query-specific results, without having to restart the entire query (see the "pivot job" handler below).
                //
                // There are three modes - configured instance-wide - for this ad-hoc acceleration:
                // 1) No Acceleration -> don't use a collect job
                // 2) Elastic Acceleration -> run a collect job only over the time range for the user's current query
                // 3) All-Time Acceleration -> run a collect job over all time
                aggregator.addHandler(Job, ['collect job'], function(previous, aggregator) {
                    var collectJob = this.collectJob;
                    // Ad-hoc acceleration is disabled, no need for a collect job.
                    if (this.handlerContext.noAccelerationMode) {
                        return this._disposeOfCollectJob(collectJob);
                    }
                    // First we fetch the state of the collect job referenced by the `accSid` URL argument
                    // (if there is one), the current data table, and the current time range.
                    // These are all requested in parallel but represented as separate promises
                    // because there are cases where not all are needed.
                    var collectReattachPromise;
                    if (this.handlerContext.urlArgs.accSid) {
                        collectJob.set({ id: this.handlerContext.urlArgs.accSid }, { silent: true });
                        collectReattachPromise = collectJob.fetch({ data: this.handlerContext.appOwner });
                    } else {
                        collectReattachPromise = $.Deferred().reject();
                    }
                    var timeRangePromise = aggregator.waitFor(TimeRange);
                    return $.when(
                        aggregator.waitFor(PivotableDataTable),
                        aggregator.waitFor(PivotReport, ['preliminary'])
                    ).then(function(dataTable, preliminaryReport) {
                        // If the data table has its own acceleration, no need for a collect job.
                        if (dataTable.isAccelerated()) {
                            return this._disposeOfCollectJob(collectJob);
                        }
                        var reportContent = preliminaryReport.entry.content;
                        var baseSearch = dataTable.get('baseSearch');
                        var dataTableCollectSearch = this._constructCollectSearch(baseSearch);
                        // Now we attempt to "re-attach" to the existing collect job, making sure that it's compatible
                        // with the current query configuration.
                        return collectReattachPromise.then(
                            function() {
                                // An existing collect job was found, we need to see if we can re-use it.
                                var requestSearch = collectJob.entry.content.request.get('search');
                                if (this.handlerContext.elasticMode) {
                                    // If the query is real-time, acceleration can't be used, so dispose of the current collect job.
                                    if (timeUtils.isRealtime(reportContent.get('dispatch.earliest_time'))) {
                                        return this._disposeOfCollectJob(collectJob, { destroy: true });
                                    }
                                    // In elastic mode, we need to fully populate the time range model before we can figure
                                    // out what to do with the existing collect job.
                                    return timeRangePromise.then(function(timeRange) {
                                        // If the existing collect job's doesn't match the current pivotable data table, or its time range is incompatible
                                        // with the current query time range, then dispose of it and kick off a new one.
                                        if (dataTableCollectSearch !== requestSearch || this._shouldHandleCollectTimeRangeMismatch(collectJob, timeRange)) {
                                            return this._dispatchNewElasticCollectJob(collectJob, baseSearch, timeRange, { destroyExisting: true }).then(function() {
                                                return this._waitForRunningCollect(collectJob, timeRange, baseSearch).then(function() {
                                                    return this._ensureCollectRunningState(collectJob, timeRange);
                                                }.bind(this));
                                            }.bind(this));
                                        }
                                        // Otherwise, we can re-use the existing collect job.
                                        return this._waitForRunningCollect(collectJob, timeRange, baseSearch).then(function() {
                                            return this._ensureCollectRunningState(collectJob, timeRange);
                                        }.bind(this));
                                    }.bind(this));
                                }
                                // In all-time mode, we can re-use the existing collect job as long as the search strings match.
                                // If not, we dispatch a new collect job.
                                if (dataTableCollectSearch !== requestSearch) {
                                    return this._dispatchNewCollectJob(collectJob, baseSearch, { destroyExisting: true });
                                }
                                return collectJob;
                            }.bind(this),
                            function() {
                                // No existing collect job exists.
                                this._disposeOfCollectJob(collectJob);
                                if (this.handlerContext.elasticMode) {
                                    // If the query is real-time, acceleration can't be used, so don't dispatch a new collect job.
                                    if (timeUtils.isRealtime(reportContent.get('dispatch.earliest_time'))) {
                                        return $.Deferred().resolve(collectJob);
                                    }
                                    // In elastic mode, we need to fully populate the time range model before we can figure
                                    // out how to correctly dispatch a new collect job.
                                    return timeRangePromise.then(function(timeRange) {
                                        // Otherwise, dispatch a new collect job based on the current time range.
                                        return this._dispatchNewElasticCollectJob(collectJob, baseSearch, timeRange).then(function() {
                                            return this._waitForRunningCollect(collectJob, timeRange, baseSearch).then(function() {
                                                return this._ensureCollectRunningState(collectJob, timeRange);
                                            }.bind(this));
                                        }.bind(this));
                                    }.bind(this));
                                }
                                // In all-time mode, just dispatch a new collect job over all time.
                                return this._dispatchNewCollectJob(collectJob, baseSearch);
                            }.bind(this)
                        );
                    }.bind(this));
                }.bind(this));

                // The "pivot job" is the one that actually fetches the results that correspond to the user's query.
                // At a high level, it reads from the pivot search model, and based on the current configuration either
                // dispatches its "tstats search" against a tsidx namespace (the data table's or the collect job's), or
                // dispatches its "raw search".
                aggregator.addHandler(PivotJob, function(previous, aggregator) {
                    var pivotJob = this.pivotJob;
                    var oldPivotJob = this.pivotJob.clone();
                    // We create a few parallel promises, the pivot search and the report are always needed to
                    // dispatch the pivot job, but the data model object and collect job might not be.
                    var dataTablePromise = aggregator.waitFor(PivotableDataTable);
                    var collectJobPromise = aggregator.waitFor(Job, ['collect job']);
                    var dispatchDataPromise = $.when(
                        aggregator.waitFor(PivotSearch),
                        aggregator.waitFor(PivotReport, ['preliminary'])
                    );
                    dispatchDataPromise = dispatchDataPromise.then(function(pivotSearch, report) {
                        var reportContent = report.entry.content;
                        // Set up the initial job dispatch data, if a "tstatsSearch" and "tsidxNamespace" are added
                        // later they will trump the "search" defined here.
                        var dispatchData = _.extend(this.handlerContext.appOwner, {
                            search: pivotSearch.get('search'),
                            earliest_time: reportContent.get('dispatch.earliest_time') || 0
                        });

                        if(reportContent.get('dispatch.latest_time')) {
                            dispatchData.latest_time = reportContent.get('dispatch.latest_time');
                        }

                        // If acceleration is disabled system-wide, dispatch with the raw search.
                        if (this.handlerContext.noAccelerationMode) {
                            return dispatchData;
                        }
                        return dataTablePromise.then(function(dataTable) {
                            // If the data table has its own acceleration, use that to dispatch the pivot job
                            // in accelerated mode with a tstats search.
                            if (dataTable.isAccelerated()) {
                                dispatchData.tsidxNamespace = dataTable.get('accelerationNamespace');
                                dispatchData.tstatsSearch = pivotSearch.get('tstatsSearch').replace(
                                    new RegExp(PivotRouter.TSIDX_NAMESPACE_TOKEN, 'g'),
                                    dataTable.get('accelerationNamespace')
                                );
                                return dispatchData;
                            }
                            // In elastic mode, if the query is real-time, then explicitly dispatch the pivot job
                            // with the raw search info because there is no collect job.  In all-time mode this will
                            // be handled internally by the pivot job dispatch logic.
                            if (this.handlerContext.elasticMode && timeUtils.isRealtime(dispatchData.earliest_time)) {
                                return dispatchData;
                            }
                            // If we get here we are using the collect job for ad-hoc acceleration.  Wait for it to have
                            // an sid and then use that to dispatch the pivot job in accelerated mode with a tstats search.
                            return collectJobPromise.then(function(collectJob) {
                                dispatchData.sid = collectJob.get('id');
                                dispatchData.tstatsSearch = pivotSearch.get('tstatsSearch').replace(
                                    new RegExp(PivotRouter.TSIDX_NAMESPACE_TOKEN, 'g'),
                                    'sid=' + collectJob.get('id')
                                );
                                return dispatchData;
                            });
                        }.bind(this));
                    }.bind(this));
                    dispatchDataPromise.done(function(dispatchData) {
                        oldPivotJob.destroy();
                        dispatchData.provenance = 'UI:Pivot';
                        pivotJob.stopPolling();
                        pivotJob.clear();
                        pivotJob.save({}, { data: dispatchData }).done(function() {
                            pivotJob.startPolling();
                        });
                    });
                    return pivotJob;
                }.bind(this));

                // Alias any dependencies on a job model to use the "pivot job".  It is designed to have the same external
                // API as the basic job model, so it should be given to any shared views that operate on a job (e.g. progress bar).
                aggregator.addHandler(Job, function(previous, aggregator) {
                    return aggregator.waitFor(PivotJob);
                });
            },

            _populateReportFromUrl: function(report) {
                var reportContent = report.entry.content,
                    uriAttrs = _(this.classicurl.toJSON()).omit('model');

                // if the report cannot be populated with a search, give it an initial pivot JSON
                if(uriAttrs.q) {
                    generalUtils.transferKey(uriAttrs, 'q', 'search');
                }

                // handle earliest/latest
                if(uriAttrs.hasOwnProperty('earliest')) {
                    generalUtils.transferKey(uriAttrs, 'earliest', 'dispatch.earliest_time');
                }
                else if(!reportContent.get('dispatch.earliest_time')) {
                    uriAttrs['dispatch.earliest_time'] = 0;
                }
                generalUtils.transferKey(uriAttrs, 'latest', 'dispatch.latest_time');

                report.entry.content.set(uriAttrs);
            },

            _decorateReportElements: function(report, dataTable, options) {
                var reportContent = report.entry.content,
                    elementCollections = [reportContent.filters, reportContent.columns, reportContent.rows, reportContent.cells];

                _(elementCollections).each(function(collection) {
                    collection.each(function(element) {
                        // the objectCount field will not necessarily have owner defined
                        var field = dataTable.getFieldByName(element.get('fieldName')),
                            setObject = { displayName: field.displayName };

                        if(collection === reportContent.filters && element.get('filterType') === 'limit') {
                            var limitByField = dataTable.getFieldByName(element.get('limitBy'));
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

            _populateUrlFromReport: function(report, options) {
                options = options || {};
                var reportContent = report.entry.content,
                    customAttrs = {},
                    reportAttrs = reportContent.filterChangedByWildcards(PivotReport.REPORT_FORMAT_FILTER, { allowEmpty: true }),
                    // update the viz type related properties in the URL if the report doesn't have the default viz type,
                    // or if there are existing viz type related properties already in the URL
                    shouldUpdateVizType = report.getVisualizationType() !== pivotVizManager.STATISTICS_TABLE ||
                        this.classicurl.has('display.visualizations.show');
    
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
    
                _(['model', 'object', 'type', 'dataset', 'cells', 'rows', 'columns', 'reload']).each(function(key) { this.classicurl.unset(key); }, this);
                if(options.reload) {
                    customAttrs.reload = true;
                }
    
                reportAttrs.q = reportContent.get('search');
                if(report.isNew()) {
                    this.classicurl.unset('s');
                }
                else {
                    this._clearTemporaryDataModelFromUrl();
                    customAttrs.s = report.get('id');
                }
    
                customAttrs.earliest = reportContent.get('dispatch.earliest_time');
                if(reportContent.get('dispatch.latest_time')) {
                    customAttrs.latest = reportContent.get('dispatch.latest_time');
                }
                else {
                    this.classicurl.unset('latest');
                }
                this.classicurl.save($.extend(customAttrs, reportAttrs), options);
            },
            
            _clearTemporaryDataModelFromUrl: function() {
                this.classicurl.unset('seedSid');
                this.classicurl.unset('fields');
                this.classicurl.unset('field_coverage');
            },

            // normalize the data model name into a fully-qualified version that uses the current app/owner context
            // if the given name is already fully qualified, it will still be modified to use the current app/owner context
            // this is done to mimic the context that will be looked up when the data model name is used to dispatch a pivot search
            // so that any permission errors can be caught sooner and displayed correctly
            _constructFullyQualifiedModelName: function(modelName) {
                if(!modelName) {
                    return null;
                }
                var app = this.application.get('app'),
                    owner = this.application.get('owner'),
                    shortName = modelName.indexOf('/') > -1 ? _(modelName.split('/')).last() : modelName;

                // shortName will already be URL-safe because it comes from the fully-qualified data model URL
                return '/servicesNS/' + encodeURIComponent(owner) + '/' + encodeURIComponent(app) + '/' + DataModel.prototype.url + '/' + shortName;
            },

            // naive implementation of the logic to generate a fully qualified dataset name,
            // currently the only type of non-data-model-based dataset that pivot supports is saved search.
            _constructFullyQualifiedDatasetName: function(datasetInfo) {
                var app = this.application.get('app'),
                    owner = this.application.get('owner'),
                    datasetName = splunkUtils.searchUnescape(datasetInfo.get('dataset'));

                return '/servicesNS/' + encodeURIComponent(owner) + '/' + encodeURIComponent(app) + '/saved/searches/' + encodeURIComponent(datasetName);
            },

            _constructCollectSearch: function(baseSearch) {
                if (/\| tscollect \| stats count$/.test(baseSearch)) {
                    return baseSearch;
                }
                return baseSearch + ' | tscollect | stats count';
            },

            _disposeOfCollectJob: function(collectJob, options) {
                options = options || {};
                this.classicurl.unset('accSid');
                this.classicurl.save({}, { replaceState: true });
                if(options.destroy) {
                    collectJob.destroy();
                }
                collectJob.clear({ silent: true });
                return collectJob;
            },

            _dispatchNewCollectJob: function(collectJob, baseSearch, options) {
                options = options || {};
                var dispatchParams = _.extend(
                    this.application.pick('app', 'owner'),
                    _(options).pick('earliest_time', 'latest_time'),
                    {
                        search: this._constructCollectSearch(baseSearch),
                        status_buckets: 0,
                        auto_cancel: 100,
                        provenance: 'UI:Pivot'
                    }
                );

                this._disposeOfCollectJob(collectJob, { destroy: !!options.destroyExisting });
                return collectJob.save({}, { data: dispatchParams }).then(function() {
                    this.classicurl.save({ accSid: collectJob.get('id') }, { replaceState: true });
                    return collectJob;
                }.bind(this));
            },

            // Dispatches a new collect job, but constrained to the given time range.
            _dispatchNewElasticCollectJob: function(collectJob, baseSearch, timeRange, options) {
                options = _.extend({}, options);
                var reportLatest = timeRange.get('latest');
                if (this.elasticMode && reportLatest && reportLatest !== 'now') {
                    options.latest_time = reportLatest;
                }
                var cursoredMode = collectJob.isNew() || collectJob.entry.content.get('isTimeCursored');
                if (this.elasticMode && !cursoredMode) {
                    options.earliest_time = timeRange.get('earliest') || 0;
                }
                return this._dispatchNewCollectJob(collectJob, baseSearch, options);
            },

            // Compares an existing job's dispatch time range to the given time range,
            // returns whether or not that collect job could be used for that time range.
            _shouldHandleCollectTimeRangeMismatch: function(collectJob, timeRange) {
                var reportLatest = timeRange.get('latest') || 'now',
                    collectRequest = collectJob.entry.content.request,
                    collectLatest = collectRequest.get('latest_time') || 'now';

                // If the latest times don't match, the job is not compatible with the
                // time range.
                if(reportLatest !== collectLatest) {
                    return true;
                }
                // If the collect job has a meaningful time cursor, then an earliest time mismatch is ok,
                // the job will just be run until it has covered the time range and then will be paused.
                // If we can't use the job's time cursor, then earliest time mismatches are not compatible.
                var cursoredMode = collectJob.entry.content.get('isTimeCursored'),
                    reportEarliest = timeRange.get('earliest') || 0,
                    collectEarliest = collectRequest.get('earliest_time') || 0;

                return !cursoredMode && (reportEarliest !== collectEarliest);
            },

            // Given a collect job and a query time range, makes sure the job is in the correct running state
            // (i.e. if the job has covered the time range, pause it, if not, un-pause it).
            // Assumes that the job is already past the "preparing" dispatch states.
            _ensureCollectRunningState: function(collectJob, timeRange) {
                var collectContent = collectJob.entry.content;
                // if the collect is done, no need to do anything
                if(collectContent.get('isDone')) {
                    return collectJob;
                }
                var cursorTimeIso = collectContent.get('cursorTime'),
                    cursorTimeEpoch = cursorTimeIso ? parseFloat(splunkUtils.getEpochTimeFromISO(cursorTimeIso)) : 0,
                    reportEarliestEpoch = timeRange.get('earliest_epoch');

                // we know that the job is not done, so if cursorTime is zero it can be assumed to be a virtual-index job
                // and we treat the cursor time as at its max value
                if(cursorTimeEpoch === 0) {
                    cursorTimeEpoch = Infinity;
                }

                // if the collect cursor is before the report earliest, make sure the collect job is paused
                if(cursorTimeEpoch < reportEarliestEpoch) {
                    return $.when(collectContent.get('isPaused') || collectJob.pause()).then(function() { return collectJob; });
                }
                // otherwise, make sure the collect job is running
                return $.when(!collectContent.get('isPaused') || collectJob.unpause()).then(function() { return collectJob; });
            },

            // Returns a promise that will resolve with the given collect job is past the "preparing" dispatch state.
            // This is important because the job's "isTimeCursored" attribute is not valid until that time.
            // If the given job is not compatible with the given time range, this method will internally dispatch a new one.
            _waitForRunningCollect: function(collectJob, timeRange, baseSearch) {
                if(!collectJob.isPreparing()) {
                    if(this._shouldHandleCollectTimeRangeMismatch(collectJob, timeRange)) {
                        return this._dispatchNewElasticCollectJob(collectJob, baseSearch, timeRange, { destroyExisting: true });
                    }
                    return $.Deferred().resolve(collectJob);
                }
                var dfd = $.Deferred();
                collectJob.startPolling();
                this.listenToOnce(collectJob, 'prepared', function() {
                    collectJob.stopPolling();
                    if(this._shouldHandleCollectTimeRangeMismatch(collectJob, timeRange)) {
                        this._dispatchNewElasticCollectJob(collectJob, baseSearch, timeRange, { destroyExisting: true })
                            .done(function() { dfd.resolve(collectJob); });
                        return;
                    }
                    dfd.resolve(collectJob);
                }, this);
                return dfd;
            },
                
            // fetch the full representation of the pivotSearch
            _generatePivotSearchFetchData: function(dataModel) {
                if(!dataModel.isTemporary()) {
                    
                    return this._generatePivotSearchFetchDataFromModelId(
                        this._constructFullyQualifiedModelName(dataModel.get('id'))
                    );
                }
                var fetchData = this._generatePivotSearchFetchDataFromModelId(null);
                fetchData.modelJson = dataModel.toSplunkD().entry[0].content.description;
                return fetchData;
            },

            // an optimization for quicker bootstrapping of the page, this should only be called
            // directly if it is known for sure that the data model is not temporary.
            // otherwise _generatePivotSearchFetchData should be used instead
            _generatePivotSearchFetchDataFromModelId: function(dataModelId) {
                // the token will be replaced with an actual namespace when dispatching the pivot job
                var fetchData = _.extend(
                    { namespace: PivotRouter.TSIDX_NAMESPACE_TOKEN },
                    this.application.pick('app', 'owner')
                );
                if(dataModelId) {
                    fetchData.dataModel = dataModelId;
                }
                return fetchData;
            }

        },
        {
            apiDependencies: function(context) {
                if (context.flowStep !== PIVOT_STEP) {
                    return {};
                }
                return {
                    report: PivotReport,
                    pivotJob: Job,
                    collectJob: { resourceType: Job, flags: ['collect job'] },
                    seedJob: { resourceType: Job, flags: ['seed job'] },
                    dataModel: DataModel,
                    dataModelObject: DataModel.Object,
                    dataTable: PivotableDataTable,
                    pivotSearch: PivotSearch,
                    datasetInfo: NormalizedDatasetInfo,

                    saveNewDialog: CreateReportDialog,
                    dashboardDialog: CreateDashboardPanelDialog,
                    saveDataModelDialog: SaveDataModelDialog,
                    saveDialog: SavereportMaster,
                    exportDialog: ExportResultsDialog,
                    shareDialog: SharePivotDialog,
                    permissionMismatchDialog: PermissionMismatchDialog
                };
            },
            // exported for testing only
            TSIDX_NAMESPACE_TOKEN: '__NAMESPACE_TOKEN__',
            ALL_TIME_ADHOC_ACCELERATION: ALL_TIME_ADHOC_ACCELERATION,
            ELASTIC_ADHOC_ACCELERATION: ELASTIC_ADHOC_ACCELERATION,
            NO_ADHOC_ACCELERATION: NO_ADHOC_ACCELERATION,
            ADHOC_ACCELERATION_MODE: getAdhocAccelerationMode()
        });

        return PivotRouter;
    }
);
