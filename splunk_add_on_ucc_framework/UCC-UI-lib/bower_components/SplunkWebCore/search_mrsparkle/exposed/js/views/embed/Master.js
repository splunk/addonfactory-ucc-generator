define(
    [
        'module',
        'underscore',
        'views/Base',
        'views/shared/JobDispatchState',
        'views/embed/Results',
        'views/embed/Error',
        './Master.pcss'
    ],
    function(module, _, BaseView, JobDispatchStateView, ResultsView, ErrorView, css) {
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         application: <models.shared.Application>,
             *         job: <models.search.Job>,
             *         report: <models.search.Report>,
             *         result: <models.services.search.jobs.Result>,
             *         resultJSONRows: <models.services.search.jobs.ResultJsonRows>,
             *         summary: <models.services.search.jobs.Summary>,
             *         mapState: <models.Base>
             *     },
             *     {
             *         histories: <collections.services.saved.searches.Histories>,
             *         selectedFields: <collections.search.SelectedFields>,
             *         workflowActions: <collections.services.data.ui.WorkflowActions>
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.jobDispatchState = new JobDispatchStateView({
                    mode: 'auto',
                    model: {
                        searchJob: this.model.job,
                        application: this.model.application
                    }
                });
                this.children.results = new ResultsView({
                    model: {
                        application: this.model.application,
                        job: this.model.job,
                        report: this.model.report,
                        result: this.model.result,
                        resultJSONRows: this.model.resultJSONRows,
                        summary: this.model.summary,
                        mapState: this.model.mapState
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    }
                });
                this.children.error = new ErrorView({
                    model: this.model.report,
                    collection: this.collection.histories
                });
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.job.entry.content, 'change:resultCount change:resultPreviewCount change:eventCount change:eventAvailableCount change:dispatchState', _.debounce(this.visibility));
            },
            visibility: function() {
                var type = this.model.report.entry.content.get('display.general.type');
                if (type==='events') {
                    if (this.model.job.entry.content.get('eventCount') === 0 || this.model.job.entry.content.get('eventAvailableCount') === 0) {
                        this.children.results.$el.hide();
                    } else {
                        this.children.results.$el.show();
                    }
                } else if(type==='statistics' || type==='visualizations') {
                    var resultCount = this.model.job.entry.content.get('isPreviewEnabled') ? this.model.job.entry.content.get('resultPreviewCount') : this.model.job.entry.content.get('resultCount');
                    if (resultCount === 0) {
                        this.children.results.$el.hide();
                    } else {
                        this.children.results.$el.show();
                    }
                } else {
                    this.children.results.$el.hide();
                }
            },
            render: function() {
                this.visibility();
                this.$el.append(this.children.error.render().el);
                this.$el.append(this.children.jobDispatchState.render().el);
                this.$el.append(this.children.results.render().el);
            }
        });
    }
);
