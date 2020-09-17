define(
    [
        'jquery',
        'underscore',
        'module',
        'collections/Base',
        'collections/datasets/Columns',
        'views/table/resultscontainer/summarytable/resultsbody/column/Master',
        'views/Base'
    ],
    function(
        $,
        _,
        module,
        BaseCollection,
        ColumnsCollection,
        ColumnView,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'summary-table-results',

            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            startListening: function(options) {
                this.listenTo(this.model.state, 'clearSelection', this.clearSelection);
                this.listenTo(this.model.state, 'columnInteraction', this.toggleClassForColumn);
                this.listenTo(this.model.state, 'tableInteraction', this.toggleClassForTable);
                this.listenTo(this.model.state, 'cutSelection', this.handleCutSelection);
                this.listenTo(this.model.state, 'clearCutSelection', this.handleClearCutSelection);
            },

            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                if (this.active) {
                    return BaseView.prototype.activate.call(this, clonedOptions);
                }

                this.render();

                return BaseView.prototype.activate.call(this, clonedOptions);
            },

            handleCutSelection: function() {
                this.$('div.summary-table-column.column-selected').addClass('column-cut');
            },

            handleClearCutSelection: function(shouldAddSelection) {
                if (shouldAddSelection) {
                    this.clearSelection();
                    this.$('div.summary-table-column.column-cut').addClass('column-selected');
                }
                this.$('div.summary-table-column.column-cut').removeClass('column-cut');
            },

            columnsFromCollection: function() {
                return this.collection.columns.map(function(column, i) {
                    return new ColumnView({
                        model: {
                            column: column,
                            dataset: this.model.dataset,
                            resultJsonRows: this.model.resultJsonRows,
                            summary: this.model.summary,
                            timeline: this.model.timeline,
                            state: this.model.state,
                            dataSummaryJob: this.model.dataSummaryJob
                        },
                        colIndex: i
                    });
                }, this);
            },

            addNewColumns: function() {
                _.each(this.children.columns, function(columnView) {
                    columnView.activate({deep:true}).render().appendTo(this.$el);
                }, this);
            },

            // Interaction handlers

            clearSelection: function() {
                this.$('div.selected, div.column-selected, div.text-selected').removeClass('selected column-selected text-selected');

                // This will get rid of all the spans that are controlling the text selections
                _.each(this.$('span.selection'), function(el) {
                    $(el).remove();
                }, this);
            },

            toggleClassForColumn: function(index, className, add) {
                var $column = this.$('div[data-col-index=' + index + ']');

                if (add) {
                    $column.addClass(className);
                } else {
                    $column.removeClass(className);
                }
            },

            toggleClassForTable: function(className, add) {
                var $allCols = this.$('.summary-table-column');

                if (add) {
                    $allCols.addClass(className);
                } else {
                    $allCols.removeClass(className);
                }
            },

            enableSelection: function(enable) {
                _.each(this.children.columns, function(columnView) {
                    columnView.enableSelection(enable);
                }, this);
            },

            removeOldColumns: function() {
                _(this.children.columns).each(function(column) {
                    column.deactivate({ deep: true });
                    column.debouncedRemove({ detach: true });
                }, this);
            },

            render: function(options) {
                // Only create column views from scratch if this is the first time rendering, or column order has changed.
                if (!this.$el.html() || (options && options.columnsAreDifferent)) {
                    this.removeOldColumns();

                    this.children.columns = this.columnsFromCollection();
                    _.each(this.children.columns, function(columnView) {
                        columnView.activate({deep:true}).render().appendTo(this.$el);
                    }, this);
                } else {
                // Otherwise, column views are already activated and in DOM. Just re-render their contents.
                    _.each(this.children.columns, function(columnView) {
                        columnView.render();
                    }, this);
                }

                return this;
            }
        });
    }
);