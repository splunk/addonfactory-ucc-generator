define(
    [
        'jquery',
        'underscore',
        'module',
        'collections/datasets/Cells',
        'models/datasets/commands/Base',
        'views/Base',
        'views/shared/datasettable/resultsbody/Row'
    ],
    function(
        $,
        _,
        module,
        CellsCollection,
        BaseCommand,
        BaseView,
        TableRowView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tbody',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            startListening: function(options) {
                this.listenTo(this.model.state, 'clearSelection', this.clearSelection);
                this.listenTo(this.model.state, 'columnInteraction', this.toggleClassForColumn);
                this.listenTo(this.model.state, 'tableInteraction', this.toggleClassForTable);
                this.listenTo(this.model.state, 'cutSelection', this.handleCutSelection);
                this.listenTo(this.model.state, 'clearCutSelection', this.handleClearCutSelection);
            },

            handleCutSelection: function() {
                this.$('td.selected').addClass('cut');
                this.$('td.column-selected').addClass('column-cut');
                this.$('td.column-selected-end').addClass('column-cut-end');
            },

            handleClearCutSelection: function(shouldAddSelection) {
                if (shouldAddSelection) {
                    this.clearSelection();
                    this.$('td.cut').addClass('selected');
                    this.$('td.column-cut').addClass('column-selected');
                    this.$('td.column-cut-end').addClass('column-selected-end');
                }
                this.$('td.cut, td.column-cut, td.column-cut-end').removeClass('cut column-cut column-cut-end');
            },

            clearSelection: function() {
                this.$('td.selected, td.text-selected, td.column-selected, td.column-selected-end').removeClass('selected text-selected column-selected column-selected-end');

                // This will get rid of all the spans that are controlling the text selections
                _.each(this.$('td div span.selection'), function(el) {
                    $(el).remove();
                }, this);
            },

            toggleClassForColumn: function(index, className, add) {
                var $tdsInColumn = this.$('td[data-col-index=' + index + ']');

                if (add) {
                    $tdsInColumn.addClass(className);
                } else {
                    $tdsInColumn.removeClass(className);
                }
            },

            toggleClassForTable: function(className, add) {
                var $allTds = this.$('td'),
                    $everyTdButLastCol = $allTds.not(':last-child'),
                    $tdsInLastCol = $allTds.filter(':last-child');

                if (add) {
                    // If we're told to add column-selected to every td, we actually need to add it to every td but
                    // those in the last column, and give the last column ones a -end suffix.
                    if (className === 'column-selected') {
                        $everyTdButLastCol.addClass(className);
                        $tdsInLastCol.addClass(className + '-end');
                    } else {
                        $allTds.addClass(className);
                    }
                } else {
                    $allTds.removeClass(className);
                }
            },

            rowsFromCollection: function() {
                var fields = this.model.resultJsonRows.get('fields');
                
                return _.map(this.model.resultJsonRows.get('rows'), function(row, idx) {
                    return new TableRowView({
                        model: {
                            dataset: this.model.dataset,
                            state: this.model.state,
                            config: this.model.config
                        },
                        collection: {
                            cells: this.extractCellsAsCollection(row, fields),
                            columns: this.collection.columns
                        },
                        idx: idx + 1,
                        editingMode: this.options.editingMode
                    });
                }, this);
            },

            extractCellsAsCollection: function(row, fields) {
                var cellsCollection = new CellsCollection();
                
                _.each(row, function(cellValue, idx) {
                    var columnModel = this.collection.columns.at(idx);

                    if (columnModel) {
                        cellsCollection.add({
                            // If the cell value is already an array, it's multivalued and should be left alone.
                            // If it's not, it's a string, so we should normalize it to be an array of one item.
                            // This makes the _.each(cellValue) part easier.
                            values: _.isArray(cellValue) ? cellValue : [cellValue],
                            isMultivalued: _.isArray(cellValue),
                            idx: idx,
                            field: fields[idx],
                            columnType: columnModel.get('type')
                        });
                    }
                }, this);
                
                return cellsCollection;
            },

            removeOldRows: function() {
                _(this.children.rows).each(function(row) {
                    row.deactivate({ deep: true });
                    row.debouncedRemove({ detach: true });
                }, this);

                this.children = {};
            },

            addNewRows: function() {
                _(this.children.rows).each(function(row) {
                    row.render().activate().appendTo(this.$el);
                }, this);
            },

            enableSelection: function(enable) {
                _(this.children.rows).each(function(row) {
                    row.enableSelection(enable);
                }, this);
            },

            render: function() {
                this.removeOldRows();
                this.children.rows = this.rowsFromCollection();
                this.addNewRows();
                _.defer(function() {
                    this.model.state.rowsRenderedDfd.resolve();                    
                }.bind(this));

                return this;
            }
        });
    }
);
