define(
    [
        'underscore',
        'jquery',
        'module',
        'collections/datasets/Columns',
        'models/datasets/Column',
        'views/Base',
        'views/shared/datasettable/TableHeader',
        'views/shared/datasettable/resultsbody/Master',
        'views/shared/delegates/TableHeadStatic',
        'views/shared/delegates/TableDock',
        'views/shared/waitspinner/Master',
        'util/dataset_utils',
        './Master.pcss'
    ],
    function(
        _,
        $,
        module,
        ColumnsCollection,
        ColumnModel,
        BaseView,
        TableHeadView,
        ResultsBodyView,
        TableHeadStatic,
        TableDock,
        WaitSpinnerView,
        datasetUtils,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'table-wrapper',

            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.tableId = this.cid + '-table';

                this.collection = this.collection || {};
                this.collection.columns = new ColumnsCollection();

                this.children.thead = new TableHeadView({
                    model: {
                        dataset: this.model.dataset,
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        ast: this.model.ast
                    },
                    collection: {
                        columns: this.collection.columns
                    },
                    editingMode: this.options.editingMode
                });
                
                this.children.resultsBody = new ResultsBodyView({
                    model: {
                        dataset: this.model.dataset,
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        config: this.model.config
                    },
                    collection: {
                        columns: this.collection.columns
                    },
                    editingMode: this.options.editingMode
                });

                if (this.options.useDock) {
                    this.children.tableDock = new TableDock({
                        el: this.el,
                        offset: 0,
                        defaultLayout: 'fixed'
                    });
                    this.$el.addClass('shared-datasettable-docking-header');
                }
                
                this.children.waitSpinner = new WaitSpinnerView({
                    color: 'green',
                    size: 'medium',
                    frameWidth: 19
                });
            },
            
            startListening: function(options) {
                this.listenTo(this.model.state, 'updateTableHeadStatic', function() {
                    this.updateTableHead();
                });
                this.listenTo(this.model.state, 'updateTableHeadStaticStyles', function($elements, styles) {
                    this.updateTableHeadStyles($elements, styles);
                });
                this.listenTo(this.model.state, 'addClassToTableHeadStatic', function(classToAdd) {
                    this.children.tableHeadStatic && this.children.tableHeadStatic.trigger('addClass', classToAdd);
                });
                this.listenTo(this.model.state, 'removeClassesFromTableHeadStatic', function(classesToRemove) {
                    this.children.tableHeadStatic && this.children.tableHeadStatic.trigger('removeClass', classesToRemove);
                });
                this.listenTo(this.model.state, 'clearSelection', function() {
                    this.model.dataset.clearSelections();
                });
                this.listenTo(this.model.state, 'setSelectedColumn', function(colIndex) {
                    this.model.dataset.setSelectedColumn(colIndex);
                });
                this.listenTo(this.model.resultJsonRows, 'change:fields', this.updateColumnsCollection);
                this.listenTo(this.model.resultJsonRows, 'change', this.render);
                this.listenTo(this.model.state, 'restoreScrollPosition', this.restoreScrollPosition);

                this.listenTo(this.model.state, 'change:tableEnabled', function() {
                    var enable = this.model.state.get('tableEnabled');
                    this.children.thead.enableSelection(enable);
                    this.children.resultsBody.enableSelection(enable);
                }, this);
            },
            
            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }
                
                this.children.waitSpinner.stop();
                this.children.waitSpinner.$el.hide();
                this.$el.removeClass('disabled');
                
                this.updateColumnsCollection();
                this.updateTableHead();

                return BaseView.prototype.activate.apply(this, arguments);
            },

            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }
                BaseView.prototype.deactivate.apply(this, arguments);
                
                if (this.children.tableHeadStatic) {
                    this.$('.scroll-table-wrapper').off('scroll');
                }
                
                this.children.waitSpinner.$el.show();
                !this.children.waitSpinner.active && this.children.waitSpinner.start();
                this.$el.addClass('disabled');
                
                return this;
            },

            onAddedToDocument: function(options) {
                this.updateTableHead();
                this.restoreScrollPosition();

                return BaseView.prototype.onAddedToDocument.apply(this, arguments);
            },

            restoreScrollPosition: function() {
                if (this.children.tableHeadStatic) {
                    var scrollLeft = this.model.dataset.entry.content.get('dataset.display.scrollLeft');

                    scrollLeft && this.$('.scroll-table-wrapper').scrollLeft(scrollLeft);
                }
            },

            saveScrollPosition: function() {
                if (this.children.tableHeadStatic) {
                    var scrollLeft = this.$('.scroll-table-wrapper').scrollLeft();

                    if (scrollLeft !== null) {
                        this.model.dataset.entry.content.set('dataset.display.scrollLeft', scrollLeft);
                    }
                }
            },

            bindDOMListeners: function() {
                if (this.children.tableHeadStatic) {
                    this.$('.scroll-table-wrapper').on('scroll', this.saveScrollPosition.bind(this));
                }
            },

            updateColumnsCollection: function() {
                var columnsData = [],
                    lastSafeCommand,
                    fields = this.model.resultJsonRows.get('fields') || [];

                if (this.model.dataset.isTable()) {
                    lastSafeCommand = this.model.dataset.getLastSafeCommandForCommandIndex();
                    
                    if (lastSafeCommand) {
                        columnsData = lastSafeCommand.columns.toJSON();
                    }
                } else {
                    columnsData = this.model.dataset.getTypedFields({ withoutUnfixed: true });
                }

                if (!columnsData.length) {
                    // TODO: Lookup Table Files (e.g.| from inputlookup:"geo_attr_countries.csv") currently do not get fields
                    // back from their EAI endpoint, so we need to look at resultJsonRows to get field information.
                    _(fields).each(function(field) {
                        columnsData.push({
                            name: field
                        });
                    }, this);
                }

                // Initial data uses this flag to auto type columns
                if (this.options.autoTypeColumns) {
                    this.guessColumnTypes(columnsData, lastSafeCommand);
                }
                this.collection.columns.reset(columnsData);
            },

            guessColumnTypes: function(columnsData, command) {
                var rows = this.model.resultJsonRows.get('rows') || [],
                    fields = this.model.resultJsonRows.get('fields') || [],
                    matchedTypeCountObj,
                    i,
                    j,
                    value,
                    columnObj,
                    threshold;

                for (i = 0; i < fields.length; i++) {
                    matchedTypeCountObj = {
                        ip: 0,
                        bool: 0,
                        number: 0
                    };
                    columnObj = _.find(columnsData, function(columnObj) {
                        return columnObj.name === fields[i];
                    }.bind(this));

                    if (columnObj && (columnObj.type === ColumnModel.TYPES.STRING)) {
                        for (j = 0; j < rows.length; j++) {
                            value = rows[j][i];
                            threshold = rows.length / 2;

                            if (datasetUtils.isIPV4(value)) {
                                matchedTypeCountObj.ip++;

                                if (matchedTypeCountObj.ip > threshold) {
                                    columnObj.type = ColumnModel.TYPES.IPV4;
                                    break;
                                }
                            } else if (datasetUtils.isBoolean(value)) {
                                matchedTypeCountObj.bool++;

                                if (matchedTypeCountObj.bool > threshold) {
                                    columnObj.type = ColumnModel.TYPES.BOOLEAN;
                                    break;
                                }
                            } else if (datasetUtils.isNumber(value)) {
                                matchedTypeCountObj.number++;

                                if (matchedTypeCountObj.number > threshold) {
                                    columnObj.type = ColumnModel.TYPES.NUMBER;
                                    break;
                                }
                            }
                        }
                    }
                }

                // Save the type information to the actual table
                if (command) {
                    command.columns.reset(columnsData);
                }
            },

            updateTableHead: function() {
                if (this.children.tableDock) {
                    _.defer(this.children.tableDock.update.bind(this.children.tableDock));
                } else if (this.children.tableHeadStatic) {
                    this.children.tableHeadStatic.update();
                }
            },

            updateTableHeadStyles: function($elements, styles) {
                if (this.children.tableDock) {
                    _.defer(this.children.tableDock.updateStyles.bind(this.children.tableDock), $elements, styles);
                } else if (this.children.tableHeadStatic) {
                    this.children.tableHeadStatic.updateStyles($elements, styles);
                }
            },
            
            render: function() {
                var resultRows = this.model.resultJsonRows.get('rows');
                
                this.$el.html(this.compiledTemplate({
                    tableId: this.tableId,
                    addStaticHead: !this.options.useDock
                }));
                
                this.children.waitSpinner.render().prependTo(this.$el).$el.hide();

                if (resultRows && resultRows.length) {
                    if (!this.options.useDock) {
                        if (this.children.tableHeadStatic) {
                            this.children.tableHeadStatic.remove();
                            delete this.children.tableHeadStatic;
                        }
                        
                        this.children.tableHeadStatic = new TableHeadStatic({
                            el: this.$el,
                            disableAutoResize: true,
                            fixedColumnWidths: true,
                            draggable: true
                        });
                    }
                    
                    this.children.thead.render().appendTo(this.$('.table-results'));
                    this.children.resultsBody.render().appendTo(this.$('.table-results'));

                    this.updateColumnsCollection();

                    this.updateTableHead();
                    this.bindDOMListeners();
                    this.restoreScrollPosition();
                }

                return this;
            },
            
            template: '\
                <% if (addStaticHead) { %>\
                    <div class="header-table-static"></div>\
                    <div class="scroll-table-wrapper">\
                <% } %>\
                <table class="table table-results" id="<%= tableId %>">\</table>\
                <% if (addStaticHead) { %>\
                    </div>\
                <% } %>\
            '
        });
    }
);
