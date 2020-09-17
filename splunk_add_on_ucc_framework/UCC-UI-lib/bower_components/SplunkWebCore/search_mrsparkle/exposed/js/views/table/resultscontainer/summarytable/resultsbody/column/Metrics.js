define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base'
    ],
    function(
        _,
        $,
        module,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'list-summary-container',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            startListening: function(options) {
                this.listenTo(this.model.state, 'cutSelection', this.handleCutSelection);
                this.listenTo(this.model.state, 'clearCutSelection', this.handleClearCutSelection);
            },

            events: {
                'mouseenter .list-summary:not(".disabled")': function(e) {
                    this.model.state.trigger('columnInteraction', this.options.colIndex, 'hover', true);
                },
                'mouseleave .list-summary:not(".disabled")': function(e) {
                    this.model.state.trigger('columnInteraction', this.options.colIndex, 'hover', false);
                },
                'mousedown .list-summary:not(".disabled")': function(e) {
                    this.model.state.trigger('clearSelection');
                },
                'mouseup .list-summary:not(".disabled")': function(e) {
                    var $target = $(e.currentTarget),
                        isCtrlClick = e.metaKey || e.ctrlKey || false,
                        isShiftClick = e.shiftKey || false;
                    this.model.state.trigger('columnSelection', $target, isCtrlClick, isShiftClick);
                }
            },

            handleCutSelection: function() {
                this.$('.list-summary.column-selected').addClass('column-cut');
            },

            handleClearCutSelection: function() {
                this.$('.list-summary').removeClass('column-cut');
            },

            enableSelection: function(enable) {
                if (enable) {
                    this.$('.list-summary').removeClass('disabled');
                } else {
                    this.$('.list-summary').addClass('disabled');
                }
            },

            render: function() {
                var currentCommandModel = this.model.dataset.getCurrentCommandModel(),
                    shouldDisableSelection = !currentCommandModel.isComplete() || !currentCommandModel.isValid(),
                    extractedMetrics = this.model.resultJsonRows.extractMetrics(this.model.column),
                    loadingMessage = _('Loading...').t(),
                    metrics;

                if (!extractedMetrics.length && !this.model.dataSummaryJob.isDone()) {
                    // If there are no metrics yet, then display loading message as placeholder under the 3 metrics that are common to all field types
                    metrics = [
                        {
                            label: this.model.resultJsonRows.parseLabelFromKey(this.model.resultJsonRows.MATCHED_TYPE),
                            value: loadingMessage
                        },
                        {
                            label: this.model.resultJsonRows.parseLabelFromKey(this.model.resultJsonRows.MISMATCHED_TYPE),
                            value: loadingMessage
                        },
                        {
                            label: this.model.resultJsonRows.parseLabelFromKey(this.model.resultJsonRows.NULL_VALUES),
                            value: loadingMessage
                        }
                    ];
                } else {
                    metrics = extractedMetrics;
                }

                this.$el.html(this.compiledTemplate({
                    _: _,
                    colIndex: this.options.colIndex,
                    metrics: metrics
                }));

                this.enableSelection(!shouldDisableSelection);

                return this;
            },

            template: '\
                <div class="list-summary" data-col-index=<%- colIndex %> >\
                    <% _.each(metrics, function(metric) { %>\
                        <div class="list-summary-row <% if (metric.breakAfter) { %>list-summary-row-last <% } %>">\
                            <div class="list-summary-label <%- metric.className ? metric.className.toLowerCase() : \'\' %> <% if (metric.isZero) {%> summary-zero <% } %>" >\
                                <%- metric.label %> \
                            </div>\
                            <div class="list-summary-value"><%- metric.value %></div>\
                            <div class="list-summary-spacer">&nbsp;</div>\
                        </div>\
                    <% }); %>\
                </div>\
            '
        });
    }
);
