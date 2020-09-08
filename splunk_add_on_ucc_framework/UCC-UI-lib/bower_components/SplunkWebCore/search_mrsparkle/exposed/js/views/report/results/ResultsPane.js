define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/JobDispatchState',
        'views/shared/LazyResultsTableDrilldown',
        'views/shared/ReportVisualizer',
        'views/report/tablecontrols/Master',
        'models/Base',
        'models/search/Job',
        'util/drilldown',
        'util/splunkd_utils',
        'splunk.util',
        'uri/route',
        'helpers/VisualizationRegistry'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        Base,
        JobDispatchState,
        LazyResultsTableDrilldown,
        ReportVisualizer,
        TableControls,
        BaseModel,
        Job,
        drilldownUtil,
        splunkd_utils,
        splunkUtil,
        route,
        VisualizationRegistry
    ){

        // Override the entry in the Visualization Registry for a statistics table and replace
        // the renderer with the lazy ultra-drilldown results table.
        var defaultTableVizConfig = VisualizationRegistry.findVisualizationForConfig({
            'display.general.type': 'statistics'
        });
        VisualizationRegistry.register($.extend(true, {}, defaultTableVizConfig, { factory: LazyResultsTableDrilldown }));

        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.model.state = new BaseModel();

                this.children.jobDispatchState = new JobDispatchState({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    },
                    mode: this.model.searchJob.entry.content.get('isPreviewEnabled') ? 'results_preview' : 'results'
                });
            },
            initializeControls: function() {
                this.children.controls = new TableControls({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        state: this.model.state
                    },
                    mode: this.model.searchJob.entry.content.get('isPreviewEnabled') ? 'results_preview' : 'results',
                    offsetKey: "display.prefs.statistics.offset",
                    countKey: "display.prefs.statistics.count"
                });
            },

            initializeTable : function() {
                this.children.table = new ReportVisualizer({
                    model: {
                        config: this.model.report.entry.content,
                        application: this.model.application,
                        state: this.model.state
                    },
                    tableDockOffset: 36,
                    allowResize: false,
                    generalTypeOverride: ReportVisualizer.GENERAL_TYPES.STATISTICS
                });
                this.listenTo(this.children.table, 'drilldown', this.handleDrilldown);
                this.listenTo(this.children.table, 'searchDataModelsChange', this.bindTableSearchDataModels);
            },

            initializeViz: function() {
                this.children.viz = new ReportVisualizer({
                    model: {
                        config: this.model.report.entry.content,
                        application: this.model.application
                    },
                    allowResize: false,
                    generalTypeOverride: ReportVisualizer.GENERAL_TYPES.VISUALIZATIONS
                });
                this.listenTo(this.children.viz, 'drilldown', this.handleDrilldown);
                this.listenTo(this.children.viz, 'searchDataModelsChange', this.bindVizSearchDataModels);
            },
            startListening: function() {
                this.listenTo(this.model.searchJob.entry.content, "change:dispatchState change:resultCount change:resultPreviewCount", _.debounce( function() {
                    if (this.active) {
                        this.visibility();
                    }
                }, 0));
            },
            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;
                this.ensureDeactivated({deep:true});
                this.render();
                Base.prototype.activate.call(this, clonedOptions);
                this.visibility();
                return this;
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }

                Base.prototype.deactivate.apply(this, arguments);

                if (this.children.controls) {
                    this.children.controls.remove();
                    delete this.children.controls;
                }
                if (this.children.table) {
                    this.children.table.remove();
                    delete this.children.table;
                    this.unbindTableSearchDataModels();
                }
                if (this.children.viz) {
                    this.children.viz.remove();
                    delete this.children.viz;
                    this.unbindVizSearchDataModels();
                }
                
                return this;
            },
            showVizChild: function() {
                var needsRender = false,
                    $wrapper = $('<div class="chart-viewer"></div>'),
                    wrapperSelector = 'div.chart-viewer';

                if (!this.$el.children(wrapperSelector)[0]) {
                    //Append before controls only if they have been initialized
                    if (this.children.controls){
                        $wrapper.insertBefore(this.children.controls.el);
                    } else {
                        $wrapper.appendTo(this.$el);
                    }
                }

                if (!this.children.viz.isAddedToDocument()) {
                    this.children.viz.appendTo(this.$(wrapperSelector));
                    needsRender = true;
                }
                
                if (!this.children.viz.active) {
                    this.children.viz.activate({deep: true });
                }
                if(needsRender) {
                    this.children.viz.load().render();
                }
                this.children.viz.$el.show();
            },
            visibility: function() {
                var resultCount = this.model.searchJob.entry.content.get('isPreviewEnabled') ?
                        this.model.searchJob.entry.content.get('resultPreviewCount') :
                        this.model.searchJob.entry.content.get('resultCount');

                if (resultCount === 0) {
                    this.children.jobDispatchState.activate({deep: true}).$el.show();
                    if (this.children.controls) {
                        this.children.controls.deactivate({deep: true }).$el.hide();
                    }
                    if (this.children.table) {
                        this.children.table.deactivate({deep: true }).$el.hide();
                    }
                    if (this.children.viz) {
                        this.children.viz.deactivate({deep: true }).$el.hide();
                    }
                } else {
                    this.children.jobDispatchState.deactivate({deep: true}).$el.hide();
                    if (splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.statistics.show'))){
                        if (!this.children.controls) {
                            this.initializeControls();
                            this.children.controls.render().appendTo(this.$el);
                        }
                        if (!this.children.table) {
                            this.initializeTable();
                            this.children.table.render().appendTo(this.$el);
                        }
                        this.children.controls.activate({deep: true}).$el.show();
                        this.children.table.load().activate({deep: true}).$el.show();
                        this.bindTableSearchDataModels();
                    }

                    if (splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.visualizations.show'))) {
                        if (!this.children.viz) {
                            this.initializeViz();
                        }
                        this.showVizChild();
                        this.bindVizSearchDataModels();
                    }
                }
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.children.jobDispatchState.render().appendTo(this.$el);
                }
                return this;
            },
            handleDrilldown: function(clickInfo, options) {
                var reportContent = this.model.report.entry.content,
                    applicationModel = this.model.application,
                    fieldMetadata = this.model.searchJob.entry.content.get('fieldMetadataResults'),
                    query = {
                        search: reportContent.get('search'),
                        earliest: reportContent.get('dispatch.earliest_time'),
                        latest: reportContent.get('dispatch.latest_time')
                    };

                route.redirectTo(
                    drilldownUtil.applyDrilldownIntention(clickInfo, query, fieldMetadata, applicationModel, options)
                        .then(function(drilldownInfo) {
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
            bindTableSearchDataModels: function() {
                this.unbindTableSearchDataModels();
                this.model.tableSearchData = this.children.table.getSearchDataModel();
                this.model.tableSearchDataParams = this.children.table.getSearchDataParamsModel();
                if (!this.model.tableSearchData || !this.model.tableSearchDataParams) {
                    return;
                }
                this.model.tableSearchData.fetchData.set(this.model.tableSearchDataParams.attributes, { silent: true });
                Job.registerArtifactModel(this.model.tableSearchData, this.model.searchJob, Job.RESULTS_PREVIEW);
                this.options.flashMessagesHelper.register(this.model.tableSearchData, [splunkd_utils.FATAL, splunkd_utils.ERROR]);
                this.listenTo(this.model.tableSearchDataParams, 'change', function() {
                    this.model.tableSearchData.fetchData.set(this.model.tableSearchDataParams.attributes);
                });
            },
            unbindTableSearchDataModels: function() {
                if (this.model.tableSearchData) {
                    Job.unregisterArtifactModel(this.model.tableSearchData, this.model.searchJob);
                    this.options.flashMessagesHelper.unregister(this.model.tableSearchData);
                }
                if (this.model.tableSearchDataParams) {
                    this.stopListening(this.model.tableSearchDataParams);
                }
            },
            bindVizSearchDataModels: function() {
                this.unbindVizSearchDataModels();
                this.model.vizSearchData = this.children.viz.getSearchDataModel();
                this.model.vizSearchDataParams = this.children.viz.getSearchDataParamsModel();
                if (!this.model.vizSearchData || !this.model.vizSearchDataParams) {
                    return;
                }
                this.model.vizSearchData.fetchData.set(this.model.vizSearchDataParams.attributes, { silent: true });
                Job.registerArtifactModel(this.model.vizSearchData, this.model.searchJob, Job.RESULTS_PREVIEW);
                this.options.flashMessagesHelper.register(this.model.vizSearchData, [splunkd_utils.FATAL, splunkd_utils.ERROR]);
                this.listenTo(this.model.vizSearchDataParams, 'change', function() {
                    this.model.vizSearchData.fetchData.set(this.model.vizSearchDataParams.attributes);
                });
                this.listenTo(this.model.vizSearchData, 'change', function() {
                    this.model.vizSearchData.set({
                        meta: {
                            done:  this.model.searchJob.isDone()
                        }
                    }, { silent: true });
                });
            },
            unbindVizSearchDataModels: function() {
                if (this.model.vizSearchData) {
                    Job.unregisterArtifactModel(this.model.vizSearchData, this.model.searchJob);
                    this.options.flashMessagesHelper.unregister(this.model.vizSearchData);
                }
                if (this.model.vizSearchDataParams) {
                    this.stopListening(this.model.vizSearchDataParams);
                }
            }
        });
    }
);