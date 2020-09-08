define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/ReportVisualizer',
        'views/shared/eventsviewer/LazyEventsViewer',
        'models/search/Job',
        'splunk.config',
        'splunk.util'
    ],
    function(
        _,
        module,
        BaseView,
        ReportVisualizer,
        LazyEventsViewerView,
        Job,
        splunkConfig,
        splunkUtils
    ) {
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     {
             *     model: {
             *         application: <models.shared.Application>,
             *         job: <models.search.Job>,
             *         report: <models.search.Report>,
             *         result: <models.services.search.jobs.Result>,
             *         resultJSONRows: <models.services.search.jobs.ResultJsonRows>,
             *         summary: <models.services.search.jobs.Summary>
             *     },
             *     collection: {
             *         selectedFields: <collections.search.SelectedFields>,
             *         workflowActions: <collections.services.data.ui.WorkflowActions>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.activate();
            },
            startListening: function() {
            	this.listenTo(this.model.job, 'prepared', this.render);
            },
            render: function() {
                this.removeChildren();
                if (this.model.job.isNew() || this.model.job.isPreparing()) {
                    return this;
                }
                if (this.model.job.isReportSearch()) {
                    var showVisualization = splunkUtils.normalizeBoolean(this.model.report.entry.content.get('display.visualizations.show'));
                    this.children.display = new ReportVisualizer({
                        model: {
                            config: this.model.report.entry.content,
                            application: this.model.application
                        },
                        allowResize: false,
                        sortableFields: false,
                        tableDockOffset: -1,
                        generalTypeOverride: showVisualization ?
                            ReportVisualizer.GENERAL_TYPES.VISUALIZATIONS : ReportVisualizer.GENERAL_TYPES.STATISTICS
                    });
                    this.bindReportVisualizerModels();
                    this.listenTo(this.children.display, 'searchDataModelsChange', this.bindReportVisualizerModels);
                } else {
                    this.children.display = new LazyEventsViewerView({
                        model: {
                            result: this.model.result,
                            summary: this.model.summary,
                            searchJob: this.model.job,
                            report: this.model.report,
                            application: this.model.application
                        },
                        collection: {
                            selectedFields: this.collection.selectedFields,
                            workflowActions: this.collection.workflowActions
                        },
                        selectableFields: false,
                        sortableFields: false,
                        headerMode: 'dock',
                        headerOffset: -1,
                        allowRowExpand: false,
                        allowModalize: false,
                        defaultDrilldown: false
                    });
                }
                this.children.display.load();
                this.$el.append(this.children.display.activate({deep: true}).render().el);
                var html = this.compiledTemplate({splunkConfig: splunkConfig});
                this.$el.append(html);
                return this;
            },
            remove: function() {
                this.unbindReportVisualizerModels();
                return BaseView.prototype.remove.apply(this, arguments);
            },
            bindReportVisualizerModels: function() {
                this.unbindReportVisualizerModels();
                this.model.vizSearchData = this.children.display.getSearchDataModel();
                this.model.vizSearchDataParams = this.children.display.getSearchDataParamsModel();
                if (!this.model.vizSearchData || !this.model.vizSearchDataParams) {
                    return;
                }
                this.model.vizSearchData.fetchData.set(_.extend(
                    { oid: this.model.application.get('oid') },
                    this.model.vizSearchDataParams.attributes
                ),
                { silent: true });
                Job.registerArtifactModel(this.model.vizSearchData, this.model.job, Job.RESULTS_PREVIEW);
                this.listenTo(this.model.vizSearchDataParams, 'change', function() {
                    this.model.vizSearchData.fetchData.set(this.model.vizSearchDataParams.attributes);
                });
                this.listenTo(this.model.vizSearchData, 'change', function() {
                    this.model.vizSearchData.set({
                        meta: {
                            done:  this.model.job.isDone()
                        }
                    }, { silent: true });
                });
            },
            unbindReportVisualizerModels: function() {
                if (this.model.vizSearchData) {
                    Job.unregisterArtifactModel(this.model.vizSearchData, this.model.job);
                }
                if (this.model.vizSearchDataParams) {
                    this.stopListening(this.model.vizSearchDataParams);
                }
            },
            template: '\
                <% if (splunkConfig.EMBED_FOOTER) { %>\
                    <footer>\
                        <div>\
                        <% if (splunkConfig.EMBED_FOOTER.toLowerCase() === "splunk>") { %>\
                            <span class="icon-splunk"></span><span class="icon-greater"></span>\
                        <% } else { %>\
                            <%- splunkConfig.EMBED_FOOTER %>\
                        <% } %>\
                        </div>\
                    </footer>\
                <% } %>\
            '
        });
    }
);
