define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/table/resultscontainer/summarytable/resultsbody/column/Metrics',
        'views/table/resultscontainer/summarytable/resultsbody/column/TopResult',
        'models/datasets/Column'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        MetricsResultsView,
        TopResultsView,
        ColumnModel
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'summary-table-column',

            attributes: function() {
                return {
                    'data-col-index': this.options.colIndex
                };
            },

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            cellsFromCollection: function() {
                var results = this.model.summary.extractTopResults(this.model.column.get('name'));

                return _(results).map(function(result) {
                    return new TopResultsView({
                        model: {
                            dataset: this.model.dataset,
                            state: this.model.state,
                            column: this.model.column
                        },
                        result: result,
                        colIndex: this.options.colIndex
                    });
                }, this);
            },

            shouldRenderTopResults: function() {
                // It does not make sense to display top results for _raw and timestamp fields
                return !this.model.column.isSplunkTime()
                    && (this.model.column.get('type') !== ColumnModel.TYPES._RAW);
            },

            enableSelection: function(enable) {
                this.children.metricsResultsView && this.children.metricsResultsView.enableSelection(enable);
                _.each(this.children.topResultsViews, function(resultView) {
                    resultView.enableSelection(enable);
                }, this);
            },

            render: function() {
                var columnWidth = this.model.column.get('display.width');
                if (columnWidth) {
                    this.$el.width(columnWidth);
                }
                this.$el.attr('data-col-index', this.options.index);
                this.$el.addClass('column-' + this.model.column.get('name'));

                // Metrics View
                if (this.children.metricsResultsView) {
                    this.children.metricsResultsView.deactivate({deep: true}).remove();
                    delete this.children.metricsResultsView;
                }
                this.children.metricsResultsView = new MetricsResultsView({
                    model: {
                        dataset: this.model.dataset,
                        timeline: this.model.timeline,
                        resultJsonRows: this.model.resultJsonRows,
                        column: this.model.column,
                        state: this.model.state,
                        dataSummaryJob: this.model.dataSummaryJob
                    },
                    colIndex: this.options.colIndex
                });
                this.children.metricsResultsView.activate({deep: true}).render().appendTo(this.$el);

                // Top Results Views
                if (this.shouldRenderTopResults()) {
                    _.each(this.children.topResultsViews, function(resultView, i) {
                        resultView.deactivate({deep: true}).remove();
                        delete this.children.topResultsViews[i];
                    }, this);

                    this.children.topResultsViews = this.cellsFromCollection();

                    _.each(this.children.topResultsViews, function(resultView) {
                        resultView.render().activate({deep: true}).appendTo(this.$el);
                    }, this);
                }

                return this;
            }
        });
    }
);


