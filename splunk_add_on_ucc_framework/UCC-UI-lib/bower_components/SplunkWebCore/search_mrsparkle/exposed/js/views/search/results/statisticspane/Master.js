define(
    [
        'jquery',
        'underscore',
        'module',
        'models/services/search/jobs/ResultJsonRows',
        'models/search/Job',
        'models/Base',
        'views/Base',
        'views/search/results/statisticspane/StatisticsControls',
        'views/shared/LazyResultsTableDrilldown',
        'views/shared/ReportVisualizer',
        'views/search/results/shared/JobDispatchStateMessage',
        'views/search/results/shared/NoStatistics',
        'uri/route',
        'util/drilldown',
        'helpers/VisualizationRegistry'
    ],
    function(
        $,
        _,
        module,
        ResultJsonRows,
        Job,
        BaseModel,
        Base,
        StatisticsControls,
        LazyResultsTableDrilldown,
        ReportVisualizer,
        JobDispatchState,
        NoStatistics,
        route,
        drilldownUtil,
        VisualizationRegistry
    ) {

        // Override the entry in the Visualization Registry for a statistics table and replace
        // the renderer with the lazy ultra-drilldown results table.
        var defaultTableVizConfig = VisualizationRegistry.findVisualizationForConfig({
            'display.general.type': 'statistics'
        });
        VisualizationRegistry.register($.extend(true, {}, defaultTableVizConfig, { factory: LazyResultsTableDrilldown }));
        
        return Base.extend({
            moduleId: module.id,
            className: 'tab-pane',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.model.state = new BaseModel();

                //child views
                this.children.jobDispatchState = new JobDispatchState({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    },
                    mode: this.model.searchJob.entry.content.get('isPreviewEnabled') ? 'results_preview' : 'results'
                });
                
                this.children.noStatistics = new NoStatistics({
                    model: {
                        report: this.model.report,
                        appLocal: this.model.appLocal,
                        application: this.model.application,
                        user: this.model.user,
                        summary: this.model.summary
                    }
                });
                
                this.children.statisticsControls = new StatisticsControls({
                    model: {
                        report: this.model.report,
                        timeline: this.model.timeline,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        state: this.model.state,
                        user: this.model.user
                    }
                });

                this.children.reportVisualizer = new ReportVisualizer({
                    model: {
                        config: this.model.report.entry.content,
                        application: this.model.application,
                        state: this.model.state
                    },
                    tableDockOffset: 36,
                    enableEditing: true,
                    generalTypeOverride: ReportVisualizer.GENERAL_TYPES.STATISTICS
                });
                //TODO: remove when all the views don't activate on init
                this.children.reportVisualizer.deactivate({ deep: true });
            },
            startListening: function() {
                this.listenTo(this.children.reportVisualizer, 'drilldown', function(clickInfo, options) {
                    var reportContent = this.model.report.entry.content,
                        applicationModel = this.model.application,
                        fieldMetadata = this.model.searchJob.entry.content.get('fieldMetadataResults'),
                        query = {
                            search: reportContent.get('search'),
                            earliest: reportContent.get('dispatch.earliest_time'),
                            latest: reportContent.get('dispatch.latest_time')
                        };

                    var drilldownPromise = drilldownUtil.applyDrilldownIntention(
                            clickInfo, query, fieldMetadata, applicationModel, options);
                    if (drilldownUtil.shouldDrilldownInNewTab(clickInfo, options)) {
                        route.redirectTo(
                            drilldownPromise.then(function(drilldownInfo) {
                                return route.search(
                                    applicationModel.get('root'),
                                    applicationModel.get('locale'),
                                    applicationModel.get('app'),
                                    { data: drilldownInfo }
                                );
                            }),
                            true
                        );
                    } else {
                        drilldownPromise.done(function(drilldownInfo) {
                            reportContent.set({
                                search: drilldownInfo.q,
                                'dispatch.earliest_time': drilldownInfo.earliest,
                                'dispatch.latest_time': drilldownInfo.latest
                            });
                        });
                    }
                });
                
                this.listenTo(this.model.report.entry.content, 'change:display.visualizations.type', function() {
                    if (this.active) {
                        this.visibility();
                    }
                });
                this.listenTo(this.model.searchJob.entry.content, 'change:resultPreviewCount change:resultCount change:dispatchState change:isPreviewEnabled',  _.debounce(function() {
                    if (this.active) {
                        this.visibility();
                    }
                }, 0));
                this.listenTo(this.children.reportVisualizer, 'searchDataModelsChange', this.bindReportVisualizerModels);
            },
            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;
                this.ensureDeactivated({deep:true});
                Base.prototype.activate.call(this, clonedOptions);
                this.visibility();
                return this;
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                Base.prototype.deactivate.apply(this, arguments);
                this.model.state.clear();
                this.unbindReportVisualizerModels();
                return this;
            },
            visibility: function() {
                var resultCount = this.model.searchJob.entry.content.get('isPreviewEnabled') ? this.model.searchJob.entry.content.get('resultPreviewCount') : this.model.searchJob.entry.content.get('resultCount');
                this.children.jobDispatchState.options.mode = this.model.searchJob.entry.content.get('isPreviewEnabled') ? 'results_preview' : 'results';

                if (!this.model.searchJob.isReportSearch()) {
                    this.children.jobDispatchState.deactivate({deep: true}).$el.hide();
                    this.children.noStatistics.activate({deep: true}).$el.show();
                    this.children.statisticsControls.deactivate({deep: true}).$el.hide();
                    this.children.reportVisualizer.deactivate({deep: true}).$el.hide();
                    return;
                }
                if (resultCount === 0) {
                    this.children.jobDispatchState.activate({deep: true}).$el.show();
                    this.children.noStatistics.deactivate({deep: true}).$el.hide();
                    this.children.statisticsControls.activate({deep: true}).$el.show();
                    this.children.reportVisualizer.deactivate({deep: true}).$el.hide();
                    this.unbindReportVisualizerModels();
                } else {
                    this.children.jobDispatchState.deactivate({deep: true}).$el.hide();
                    this.children.noStatistics.deactivate({deep: true}).$el.hide();
                    this.children.statisticsControls.activate({deep: true}).$el.show();
                    this.children.reportVisualizer.$el.show();
                    this.children.reportVisualizer.load().activate({deep: true, skipUpdate: true});
                    this.bindReportVisualizerModels();
                }
            },
            
            bindReportVisualizerModels: function() {
                this.unbindReportVisualizerModels();
                this.model.vizSearchData = this.children.reportVisualizer.getSearchDataModel();
                this.model.vizSearchDataParams = this.children.reportVisualizer.getSearchDataParamsModel();
                if (!this.model.vizSearchData || !this.model.vizSearchDataParams) {
                    return;
                }
                this.model.vizSearchData.fetchData.set(this.model.vizSearchDataParams.attributes, { silent: true });
                Job.registerArtifactModel(this.model.vizSearchData, this.model.searchJob, Job.RESULTS_PREVIEW);
                this.listenTo(this.model.vizSearchDataParams, 'change', function() {
                    this.model.vizSearchData.fetchData.set(this.model.vizSearchDataParams.attributes);
                });
            },
            unbindReportVisualizerModels: function() {
                if (this.model.vizSearchData) {
                    Job.unregisterArtifactModel(this.model.vizSearchData, this.model.searchJob);
                }
                if (this.model.vizSearchDataParams) {
                    this.stopListening(this.model.vizSearchDataParams);
                }
            },

            remove: function() {
                Base.prototype.remove.apply(this);
                this.unbindReportVisualizerModels();
            },
            
            render: function() {
                if (!this.el.innerHTML) {
                    this.children.noStatistics.render().appendTo(this.$el);
                    this.children.statisticsControls.render().appendTo(this.$el);
                    this.children.jobDispatchState.render().appendTo(this.$el);
                    this.children.reportVisualizer.render().appendTo(this.$el);
                }
                return this;
            }
    });
});
