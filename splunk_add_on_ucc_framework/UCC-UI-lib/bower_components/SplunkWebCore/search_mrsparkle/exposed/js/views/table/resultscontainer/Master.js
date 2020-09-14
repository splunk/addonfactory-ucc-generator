define(
    [
        'underscore',
        'jquery',
        'module',
        'models/search/Job',
        'models/datasets/commands/InitialData',
        'views/Base',
        'views/table/resultscontainer/actionbar/Master',
        'views/shared/datasetcontrols/jobstatus/Master',
        'views/shared/datasettable/Master',
        'views/shared/JobDispatchState',
        'views/shared/FlashMessages',
        'views/table/resultscontainer/summarytable/Master',
        'util/splunkd_utils',
        './Master.pcss'
    ],
    function(
        _,
        $,
        module,
        SearchJobModel,
        InitialDataModel,
        BaseView,
        ActionBar,
        JobStatusView,
        TableView,
        JobDispatchStateView,
        FlashMessages,
        SummaryView,
        splunkdUtils,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'dataset-results-container',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.actionBar = new ActionBar({
                    model: {
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        table: this.model.table,
                        application: this.model.application,
                        currentPointJob: this.model.currentPointJob
                    }
                });

                this.children.table = new TableView({
                    model: {
                        dataset: this.model.table,
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        config: this.model.config,
                        ast: this.model.tableAST
                    },
                    editingMode: true
                });

                this.children.summary = new SummaryView({
                    model: {
                        dataset: this.model.table,
                        resultJsonRows: this.model.dataSummaryResultJsonRows,
                        state: this.model.state,
                        config: this.model.config,
                        summary: this.model.dataSummarySummary,
                        timeline: this.model.dataSummaryTimeline,
                        dataSummaryJob: this.model.dataSummaryJob,
                        ast: this.model.tableAST
                    }
                });

                this.children.jobStatusView = new JobStatusView({
                    model: {
                        application: this.model.application,
                        table: this.model.table,
                        searchPointJob: this.model.searchPointJob,
                        currentPointJob: this.model.currentPointJob,
                        dataSummaryJob: this.model.dataSummaryJob,
                        dataSummaryTimeRange: this.model.dataSummaryTimeRange,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        resultJsonRows: this.model.resultJsonRows,
                        ast: this.model.tableAST
                    },
                    collection: {
                        times: this.collection.times
                    },
                    hasTimeRangePicker: true
                });

                this.errorTypes = [splunkdUtils.FATAL, splunkdUtils.ERROR];

                this.children.flashMessages = new FlashMessages({
                    model: {
                        tableAST: this.model.tableAST
                    },
                    whitelist: this.errorTypes
                });
            },

            startListening: function(options) {
                this.listenTo(this.model.resultJsonRows, 'change', function() {
                    // The job may not be done before we start showing events in the table. Get rid of the job dispatch
                    // view in that case.
                    if (this.model.resultJsonRows.hasRows()) {
                        this.removeJobDispatchState();
                    }
                    this.updateActionBarState();
                });
                this.listenTo(this.model.dataSummarySummary, 'sync', function() {
                    // The job may not be done before we start showing events in the table. Get rid of the job dispatch
                    // view in that case.
                    if (this.model.dataSummarySummary.getEventCount() > 0) {
                        this.removeJobDispatchState();
                    }
                    this.updateActionBarState();
                });

                // Summary endpoint only returns events if there are external (non-underscore) fields in the search.
                // If there are only internal fields, we look at the resultJsonRows instead of the summaryModel to
                // determine if there is data in the summary table.
                this.listenTo(this.model.dataSummaryResultJsonRows, 'sync', function() {
                    if (this.model.dataSummaryResultJsonRows.hasRows()) {
                        this.removeJobDispatchState();
                    }
                    this.updateActionBarState();
                });
                this.listenTo(this.model.table, 'toggleTableState', this.updateActionBarState);
            },

            activate: function(options) {
                var optionsClone = $.extend(true, {}, options || {});
                optionsClone.deep = false;

                if (this.active) {
                    return BaseView.prototype.activate.call(this, optionsClone);
                }

                this.manageStateOfChildren();

                return BaseView.prototype.activate.call(this, optionsClone);
            },

            updateActionBarState: function(shouldDisable) {
                var hasResults,
                    currentCommandModel = this.model.table.getCurrentCommandModel(),
                    shouldDisableActionBar = !currentCommandModel.isComplete() || !currentCommandModel.isValid();

                hasResults = (this.model.table.isTableMode() && this.model.resultJsonRows.hasRows()) ||
                    (!this.model.table.isTableMode() && this.children.summary.shouldRenderTable());

                if (hasResults && !(shouldDisableActionBar || shouldDisable)) {
                    this.children.actionBar.updateMenuItemsState({disable: false});
                } else {
                    this.children.actionBar.updateMenuItemsState({disable: true});
                }
            },

            manageStateOfChildren: function() {
                var isError = splunkdUtils.messagesContainsOneOfTypes(this.model.tableAST.error.get('messages'), this.errorTypes),
                    mode = this.model.tableAST.isTransforming() ? 'results' : '';

                this.removeJobDispatchState();

                if (isError) {
                    this.children.flashMessages.activate({ deep: true }).$el.show();
                    this.children.actionBar.deactivate({ deep: true }).$el.hide();
                    this.children.summary.deactivate({ deep: true }).$el.hide();
                    this.children.table.deactivate({ deep: true }).$el.hide();
                    this.children.jobStatusView.deactivate({ deep: true }).$el.hide();
                } else {
                    this.children.flashMessages.deactivate({ deep: true }).$el.hide();
                    this.children.actionBar.activate({ deep: true }).$el.css('display', 'flex');
                    this.updateActionBarState();

                    if (this.model.table.isTableMode()) {
                        this.children.summary.deactivate({ deep: true }).$el.hide();

                        // If initial data was canceled, we actually don't want to render the table, we just want it to
                        // go back to being shown right before the initial data flow was started.
                        if (this.model.state.get('initialDataState') === InitialDataModel.STATES.CANCELED) {
                            this.children.table.activate({ deep: true }).$el.css('display', '');
                        } else {
                            this.children.table.activate({ deep: true }).render().$el.css('display', '');
                        }

                        this.model.state.trigger('restoreScrollPosition');

                        if (this.model.table.getCurrentCommandModel().isSearchPoint) {
                            // If search job is running or search job completed with no results, then show job dispatch state view with loading/error message
                            if (!this.model.searchPointJob.isDone() || !this.model.resultJsonRows.hasRows()) {
                                var jobDispatchStateMsgs = {};
                                jobDispatchStateMsgs[SearchJobModel.RUNNING] = {
                                    msg : _('Now loading table dataset.').t()
                                };
                                this.children.jobDispatchState = new JobDispatchStateView({
                                    model: {
                                        searchJob: this.model.searchPointJob,
                                        application: this.model.application
                                    },
                                    mode: mode,
                                    jobDispatchStateMsgs: jobDispatchStateMsgs
                                });
                            }
                        } else {
                            // If search job is running or search job completed with no results, then show job dispatch state view with loading/error message
                            if (!this.model.currentPointJob.isDone() || !this.model.resultJsonRows.hasRows()) {
                                this.children.jobDispatchState = new JobDispatchStateView({
                                    model: {
                                        searchJob: this.model.currentPointJob,
                                        application: this.model.application
                                    },
                                    mode: mode
                                });
                            }
                        }
                    } else {
                        this.children.table.deactivate({ deep: true }).$el.hide();
                        this.children.summary.activate({ deep: true }).render().$el.css('display', '');

                        if (!this.model.dataSummaryJob.isDone() || !this.children.summary.shouldRenderTable()) {
                            this.children.jobDispatchState = new JobDispatchStateView({
                                model: {
                                    searchJob: this.model.dataSummaryJob,
                                    application: this.model.application
                                },
                                mode: 'results' // Summary search is always transforming
                            });
                        }
                    }

                    if (this.children.jobDispatchState) {
                        this.children.jobDispatchState.activate({deep: true}).render().insertAfter(this.$('.table-resultscontainer-actionbar'));
                    }

                    if (this.$el.html() && !this.children.jobStatusView.$el.html()) {
                        this.children.jobStatusView.activate({ deep: true }).render().insertAfter(this.$('.table-resultscontainer-actionbar'));
                    } else {
                        this.children.jobStatusView.activate({deep: true});
                    }
                }
            },

            removeJobDispatchState: function() {
                if (this.children.jobDispatchState) {
                    this.children.jobDispatchState.deactivate({ deep: true }).remove();
                    delete this.children.jobDispatchState;
                }
            },

            render: function() {
                this.children.flashMessages.render().appendTo(this.$el);
                this.children.actionBar.render().appendTo(this.$el);
                this.children.table.insertAfter(this.$('.table-resultscontainer-actionbar'));
                this.children.summary.insertAfter(this.$('.table-resultscontainer-actionbar'));
                this.children.jobStatusView.activate({ deep: true }).render().insertAfter(this.$('.table-resultscontainer-actionbar'));
                this.manageStateOfChildren();

                return this;
            }
        });
    }
);
