define(
    [
        'underscore',
        'jquery',
        'module',
        'models/search/Job',
        'models/shared/fetchdata/ResultsFetchData',
        'models/datasets/Summary',
        'models/datasets/TableAST',
        'views/Base',
        'views/table/initialdata/FieldsPicker',
        'views/shared/FlashMessages',
        'util/general_utils',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        JobModel,
        ResultsFetchDataModel,
        SummaryModel,
        TableASTModel,
        BaseView,
        FieldsPicker,
        FlashMessages,
        generalUtils,
        splunkUtil
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                var pristineColumns = this.model.table.commands.length && this.model.table.commands.first().columns;
                if (pristineColumns && pristineColumns.length) {
                    this.hasInitialColumns = true;
                }

                // Each content view can run its own search job to find fields.
                // TODO: We should try to reuse these jobs a bit more instead of spinning new ones off often.
                this.model.fieldsSummarySearchJob = new JobModel({}, {
                    delay: JobModel.DEFAULT_POLLING_INTERVAL,
                    processKeepAlive: true,
                    keepAliveInterval: JobModel.DEFAULT_KEEP_ALIVE_INTERVAL
                });
                this.model.fieldsSummary = new SummaryModel();

                this.deferreds = this.options.deferreds;
            },

            activate: function(options) {
                options = options || {};

                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                // When a content view becomes active, it will potentially have a different search and different columns.
                $.when(options.waitDeferred).always(function() {
                    this.fetchTimeRange();
                    this.handleSearchChange();
                    this.handleColumnsChange();
                }.bind(this));

                return BaseView.prototype.activate.apply(this, arguments);
            },

            events: {
                'click .initial-data-done': function(e) {
                    e.preventDefault();
                    this.model.table.trigger('doneButtonClicked');
                }
            },

            startListening: function(options) {
                this.listenTo(this.collection.columns, 'add remove', this.handleColumnsChange);
                this.listenTo(this.model.table.entry.content, 'change:dataset.display.diversity', this.handleSearchChange);
                this.listenTo(this.model.table.entry.content, 'change:dataset.display.limiting', this.handleSearchChange);
                this.listenTo(this.collection.columns, 'add remove', this.handleEmptyFields);
                this.listenTo(this.model.resultJsonRows, 'change', this.handleEmptyFields);
                this.listenTo(this.model.table.entry.content, 'newSample', function() {
                    this.deferreds.timeRange = $.Deferred();
                    this.fetchTimeRange();
                    this.handleSearchChange();
                });
            },

            handleSearchChange: function(options) {
                var spl = this.model.command.generateBaseSearchSPL({ skipValidation: true }),
                    isTransforming,
                    diversityComponent,
                    searchToRun,
                    astDeferred,
                    clearModelsDoneDeferred,
                    updateDoneDeferred;

                options = options || {};
                _.defaults(options, {
                    preview: true,
                    skipFieldsFetch: false,
                    auto_cancel: JobModel.DEFAULT_AUTO_CANCEL
                });

                if (!this.model.searchJob.isNew()) {
                    clearModelsDoneDeferred = this.clearResultsModels();
                }
                astDeferred = this.fetchBasesearchTableAST();

                $.when(clearModelsDoneDeferred, astDeferred, this.deferreds.timeRange).then(function() {
                    isTransforming = this.model.basesearchTableAST.isTransforming();
                    if (isTransforming) {
                        this.hasInitialColumns = false;
                    }
                    diversityComponent = this.model.table.getDiversitySearchComponent({
                        isTransforming: isTransforming
                    }).join(' | ');
                    searchToRun = diversityComponent.length ? spl && (spl + ' | ' + diversityComponent) : spl;
                    this.listenTo(this.model.searchJob, 'prepared', function() {
                        this.model.searchJob.registerJobProgressLinksChild(JobModel.RESULTS_PREVIEW, this.model.resultJsonRows, this.fetchResultJSONRows, this);
                    });

                    // We're only going to do anything if we have a search
                    if (searchToRun) {
                        updateDoneDeferred = this.model.command.updateSPL();

                        $.when(updateDoneDeferred).always(function() {
                            if (this.model.command.isValid()) {
                                this.showDoneButton();

                                // We need to add in _raw/_time if the search is not transforming and we haven't done so before
                                if (!isTransforming && !this.hasInitialColumns) {
                                    this.collection.columns.setInitialColumns({
                                        pristineColumns: this.model.tablePristine.commands.first().columns
                                    });

                                    this.hasInitialColumns = true;
                                }

                                //We also need to potentially add Index and Sourcetype columns
                                this.collection.columns.setExtraColumns({
                                    pristineColumns: this.model.tablePristine.commands.first().columns,
                                    includeIndex: options.includeIndex,
                                    includeSourcetype: options.includeSourcetype
                                });

                                // A dataset that has fixed fields doesn't need to fetch fields
                                if (!options.skipFieldsFetch) {
                                    this.fetchFieldsForPicker();
                                }

                                if (!this.model.searchJob.isNew()) {
                                    throw new Error('Old jobs did not get cleared!');
                                }

                                this.model.searchJob.save({}, {
                                    data: {
                                        app: this.model.application.get('app'),
                                        owner: this.model.application.get('owner'),
                                        search: searchToRun,
                                        preview: options.preview,
                                        earliest_time: '',
                                        latest_time: this.model.timeRange.get('latest_epoch'),
                                        auto_cancel: options.auto_cancel,
                                        sample_ratio: this.model.table.getDispatchRatio({ isTransforming: isTransforming }),
                                        check_risky_command: this.shouldCheckRiskyCommand(),
                                        auto_finalize_ec: this.model.table.getEventLimit({ isTransforming: isTransforming })
                                    },

                                    success: function(model, response) {
                                        if (!this.model.searchJob.isPreparing()) {
                                            this.model.searchJob.registerJobProgressLinksChild(JobModel.RESULTS_PREVIEW, this.model.resultJsonRows, this.fetchResultJSONRows, this);
                                        }

                                        this.model.searchJob.startPolling();
                                    }.bind(this)
                                });
                            } else {
                                this.hideDoneButton();
                                this.removeFieldsPicker();
                            }
                        }.bind(this));
                    } else {
                        this.removeFieldsPicker();
                    }
                }.bind(this));
            },

            handleColumnsChange: function() {
                // this.model.command.columns determine which columns the shared datasettable shows,
                // so based on the user's selections, we need to mediate those to the command.
                this.model.command.columns.reset(this.collection.columns.toJSON());
                this.fetchResultJSONRows();
            },

            handleEmptyFields: function() {
                if (!this.model.searchJob.isNew() && this.collection.columns.length === 0) {
                    this.model.command.trigger('showEmptyField');
                    this.hideDoneButton();
                } else {
                    this.model.command.trigger('hideEmptyField');
                    this.showDoneButton();
                }
            },

            // As the job triggers progress events or the columns change, we'll reach this function,
            // which will actually get the JSON rows based on the columns.
            fetchResultJSONRows: function(options) {
                options = options || {};

                if (this.model.searchJob.isDone()) {
                    this.model.state.set('loading', true);
                    var fetchDataModel = new ResultsFetchDataModel(),
                        columns = this.collection.columns.columnsListToString() || '*',
                        data = $.extend(
                            fetchDataModel.toJSON(),
                            {
                                show_metadata: false,
                                include_null_fields: true,
                                field_list: columns,
                                time_format: '%s.%Q'
                            }
                        );
                    
                    $.extend(true, data, options);

                    this.model.resultJsonRows.safeFetch({
                        data: data,
                        success: function() {
                            this.model.state.set('loading', false);
                        }.bind(this),
                        error: function() {
                            this.model.state.set('loading', false);
                        }.bind(this)
                    });
                }
            },

            // This is what runs the summary job to populate the fields picker with available fields
            fetchFieldsForPicker: function() {
                var clearModelsDoneDeferred = this.clearSummaryModels(),
                    fieldsJobDeferred;

                this.fieldsSummaryDoneDeferred = $.Deferred();

                $.when(clearModelsDoneDeferred).then(function() {
                    // If the AST tells us that the search is transforming,
                    // then we should just take the fields from the AST.
                    if (this.model.basesearchTableAST.isTransforming()) {
                        this.fieldsSummaryDoneDeferred.resolve();
                    } else {
                        this.listenTo(this.model.fieldsSummarySearchJob, 'prepared', this.registerJobProgressLinks);

                        if (!this.model.fieldsSummarySearchJob.isNew()) {
                            throw new Error('Old jobs did not get cleared!');
                        }

                        fieldsJobDeferred = this.model.fieldsSummarySearchJob.save({}, {
                            data: {
                                // Only get the BaseSearch, which doesn't have the | fields yet
                                search: this.model.command.generateBaseSearchSPL() + ' | head 1000',
                                earliest_time: this.model.fieldsSummarySearchJob.getDispatchEarliestTimeOrAllTime(),
                                latest_time: this.model.fieldsSummarySearchJob.getDispatchLatestTimeOrAllTime(),
                                preview: false,
                                app: this.model.application.get('app'),
                                owner: this.model.application.get('owner'),
                                ui_dispatch_app: this.model.application.get('app')
                            }
                        });

                        $.when(fieldsJobDeferred).then(function() {
                            if (!this.model.fieldsSummarySearchJob.isPreparing()) {
                                this.registerJobProgressLinks();
                            }
                            this.model.fieldsSummarySearchJob.startPolling();
                        }.bind(this));

                        this.listenToOnce(this.model.fieldsSummary, 'sync', function() {
                            this.fieldsSummaryDoneDeferred.resolve();
                        }.bind(this));
                    }

                    this.renderFieldsPicker();
                }.bind(this));
            },

            fetchTimeRange: function() {
                if ((this.deferreds.timeRange.state() !== 'resolved')) {
                    this.model.timeRange.set({
                        latest: 'now',
                        latest_epoch: undefined,
                        sample_seed: undefined
                    });

                    this.model.timeRange.save({},
                        {
                            validate: false,
                            success: function(model, response) {
                                this.deferreds.timeRange.resolve();
                            }.bind(this),
                            error: function(model, response) {
                                this.deferreds.timeRange.resolve();
                            }.bind(this)
                        }
                    );
                }
            },

            registerJobProgressLinks: function() {
                this.model.fieldsSummarySearchJob.registerJobProgressLinksChild(JobModel.SUMMARY, this.model.fieldsSummary, this.fetchFieldsSummary, this);
            },

            fetchFieldsSummary: function() {
                var resultPreviewCount;

                if (this.model.fieldsSummarySearchJob.isDone()) {
                    resultPreviewCount = this.model.fieldsSummarySearchJob.entry.content.get('resultPreviewCount');

                    if (_.isNumber(resultPreviewCount) && (resultPreviewCount > 0)) {
                        this.model.fieldsSummary.safeFetch({
                            data: {
                                min_freq: 0,
                                earliest_time: this.model.fieldsSummarySearchJob.getDispatchEarliestTimeOrAllTime(),
                                latest_time: this.model.fieldsSummarySearchJob.getDispatchLatestTimeOrAllTime()
                            }
                        });
                    } else {
                        this.fieldsSummaryDoneDeferred.resolve();
                    }
                }
            },

            fetchBasesearchTableAST: function(options) {
                options = options || {};

                var astDeferred = $.Deferred(),
                    basesearchSPL = this.model.command.generateBaseSearchSPL(),
                    basesearchSPLWithLeadingSearch = basesearchSPL && splunkUtil.addLeadingSearchCommand(basesearchSPL, true),
                    currentSPL = options.currentSPL || basesearchSPLWithLeadingSearch,
                    astSPL = this.model.basesearchTableAST.get('spl');

                // First, let's see we even have any SPL. If no SPL, we can't fetch the AST.
                // Also, if the AST has already been fetched with the current search, we shouldn't fetch it again.
                if (_.isEmpty(currentSPL) || ((currentSPL === astSPL) && this.model.basesearchTableAST.get('ast'))) {
                    astDeferred.resolve();
                    return astDeferred;
                }

                // The ast is not in sync with the current search so clear it
                this.model.basesearchTableAST.fetchAbort();
                this.model.basesearchTableAST.clear();

                // Now fetch it based on the new search
                this.model.basesearchTableAST.set({
                    spl: currentSPL
                });

                this.model.basesearchTableAST.fetch({
                    success: function(model, response) {
                        astDeferred.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        astDeferred.resolve();
                    }.bind(this)
                }, options);

                return astDeferred;
            },

            // This function clears the fieldsSummarySearchJob and the fieldsSummary models
            clearSummaryModels: function() {
                var searchJobModelDeferred = this.clearSearchJobModel(this.model.fieldsSummarySearchJob),
                    clearSummaryDoneDeferred = $.Deferred();

                $.when(searchJobModelDeferred).then(function() {
                    this.model.fieldsSummary.fetchAbort();
                    this.model.fieldsSummary.off(null, null, this);
                    this.model.fieldsSummary.clear();

                    clearSummaryDoneDeferred.resolve();
                }.bind(this));

                return clearSummaryDoneDeferred;
            },

            // This function clears the searchJob and the resultJsonRows models
            clearResultsModels: function() {
                var searchJobModelDeferred = this.clearSearchJobModel(this.model.searchJob),
                    clearResultsDoneDeferred = $.Deferred();

                $.when(searchJobModelDeferred).then(function() {
                    this.model.resultJsonRows.fetchAbort();
                    this.model.resultJsonRows.clear();

                    clearResultsDoneDeferred.resolve();
                }.bind(this));

                return clearResultsDoneDeferred;
            },

            // This function takes in a searchJobModel and calls destroy() on it to handle cleanup properly
            clearSearchJobModel: function(searchJobModel) {
                var destroyDeferred,
                    clearSearchDfd = $.Deferred();

                if (!searchJobModel.isNew()) {
                    searchJobModel.fetchAbort();
                    searchJobModel.off(null, null, this);

                    destroyDeferred = searchJobModel.destroy();
                    destroyDeferred && destroyDeferred.always(function() {
                        searchJobModel.clear();
                        clearSearchDfd.resolve();
                    }.bind(this));
                } else {
                    clearSearchDfd.resolve();
                }
                return clearSearchDfd;
            },

            // Here we actually render the fields picker view, which includes the list picker and the apply button.
            renderFieldsPicker: function() {
                this.removeFieldsPicker();

                this.children.fieldsPicker = new FieldsPicker({
                    model: {
                        ast: this.model.basesearchTableAST,
                        command: this.model.command,
                        fieldsSummary: this.model.fieldsSummary,
                        state: this.model.state,
                        table: this.model.table,
                        tablePristine: this.model.tablePristine
                    },
                    collection: {
                        columns: this.collection.columns,
                        customAddedFieldPickerItems: this.collection.customAddedFieldPickerItems
                    },
                    deferred: [this.fieldsSummaryDoneDeferred, this.astDeferred]
                });

                this.children.fieldsPicker.activate({ deep: true }).render().insertBefore(this.$('.initial-data-done'));
            },

            removeFieldsPicker: function() {
                if (this.children.fieldsPicker) {
                    this.children.fieldsPicker.deactivate({ deep: true }).remove();
                    delete this.children.fieldsPicker;
                }
            },

            shouldCheckRiskyCommand: function() {
                // Only show risky warning on 1st page view.
                return this.model.state.get('pageViewCount') <= 1;
            },

            appendDoneButton: function() {
                var doneButton = '<a href="#" class="btn btn-primary initial-data-done">' + _('Done').t() + '</a>';
                $(doneButton).appendTo(this.$el);
            },

            hideDoneButton: function() {
                this.$('.initial-data-done').hide();
            },

            showDoneButton: function() {
                this.$('.initial-data-done').show();
            }
        });
    }
);