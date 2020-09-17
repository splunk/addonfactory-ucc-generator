define(
    [
        'underscore',
        'jquery',
        'collections/Base',
        'models/datasets/Column',
        'splunk.util'
    ],
    function (
        _,
        $,
        BaseCollection,
        ColumnModel,
        splunkUtils
    ) {
        var EXTERNAL_FIELD_REGEX = /^[^_]/,
            INITIAL_COLUMNS = [
                {
                    type: ColumnModel.TYPES._TIME,
                    name: '_time'
                }, {
                    type: ColumnModel.TYPES._RAW,
                    name: '_raw'
                }
            ];

        return BaseCollection.extend({
            model: ColumnModel,
            
            initialize: function() {
                BaseCollection.prototype.initialize.apply(this, arguments);
            },
            
            sync: function(method, model, options) {
                throw new Error('sync not allowed for the Column collection');
            },
            
            columnsListToString: function() {
                return splunkUtils.fieldListToString(this.map(function(column) {
                    return column.get('name');
                }));
            },

            // Filters out internal (_-prefixed) fields
            getExternalFields: function() {
                return this.map(function(column) {
                    return column.get('name');
                }).filter(this.isExternalField, this);
            },

            isExternalField: function(fieldName) {
                return EXTERNAL_FIELD_REGEX.test(fieldName);
            },

            // If _raw and/or _time are not added, this function will add them as columns.
            // Can pass a pristine columns collection so the guids are preserved, if you'd like.
            setInitialColumns: function(options) {
                options = options || {};

                var rawColumn = this.findWhere({ name: '_raw' }),
                    timeColumn = this.findWhere({ name: '_time' });

                if (!rawColumn) {
                    this.addColumn({
                        columnName: '_raw',
                        pristineColumns: options.pristineColumns
                    });
                }

                if (!timeColumn) {
                    this.addColumn({
                        columnName: '_time',
                        pristineColumns: options.pristineColumns
                    });
                }
            },

            setExtraColumns: function(options) {
                options = options || {};

                var indexColumn, sourcetypeColumn;

                if (options.includeIndex) {
                    indexColumn = this.findWhere({ name: 'index' });
                    if (!indexColumn) {
                        this.addColumn({
                            columnName: 'index',
                            pristineColumns: options.pristineColumns
                        });
                    }
                }

                if (options.includeSourcetype) {
                    sourcetypeColumn = this.findWhere({ name: 'sourcetype' });
                    if (!sourcetypeColumn) {
                        this.addColumn({
                            columnName: 'sourcetype',
                            pristineColumns: options.pristineColumns
                        });
                    }
                }
            },

            // Adds a column to the collection. Main benefits over using Backbone's add include:
            //   - Preservation of guids/type if you pass in a pristineColumns collection
            //   - Use of the comparator to insert in the correct position
            //   - Can determine what type to use based on a fields summary model
            addColumn: function(options) {
                options = options || {};
                _.defaults(options, {
                    useComparator: true,
                    deleteComparator: true
                });

                var pristineColumns = options.pristineColumns,
                    columnName = options.columnName,
                    fieldsSummaryModel = options.fieldsSummaryModel,
                    pristineColumn,
                    pristineColumnId,
                    pristineColumnType,
                    addedColumn;

                if (pristineColumns) {
                    pristineColumn = this.findPristineColumn(pristineColumns, columnName);
                    pristineColumnId = pristineColumn && pristineColumn.id;
                    pristineColumnType = pristineColumn && pristineColumn.get('type');
                }

                if (options.useComparator) {
                    this.useComparator({
                        comparator: options.comparator
                    });
                }

                if (pristineColumnId) {
                    addedColumn = this.add({
                        name: columnName,
                        type: pristineColumnType,
                        id: pristineColumnId
                    });
                } else {
                    addedColumn = this.add({
                        name: columnName,
                        type: this.determineTypeForColumn({
                            columnName: columnName,
                            fieldsSummaryModel: fieldsSummaryModel
                        })
                    });
                }

                if (options.deleteComparator) {
                    this.deleteComparator();
                }

                return addedColumn;
            },

            // Adds columns to the collection. Main benefits over using Backbone's add include:
            //   - Preservation of guids/type if you pass in a pristineColumns collection
            //   - Use of the comparator to insert in the correct position
            //   - Can determine what type to use based on a fields summary model
            addColumns: function(columns, options) {
                // Create a fresh copy, in order to avoid altering the initially passed in columns
                var addResults,
                    columnsCopy = (columns || []).slice();
                options = options || {};
                _.defaults(options, {
                    useComparator: true,
                    deleteComparator: true
                });

                if (columnsCopy.length === 0) {
                    return;
                // Only call add column if its not a model
                } else if (columnsCopy.length === 1 && !(columnsCopy[0] instanceof ColumnModel)) {
                    // Just adding a singular column, so merge everything in together
                    return this.addColumn($.extend(true, {}, columnsCopy[0], options));
                }

                if (options.useComparator) {
                    this.useComparator({
                        comparator: options.comparator
                    });
                }

                _.each(columnsCopy, function(column, idx) {
                    var pristineColumn;
                    // If this is a column model, check if there is a matching pristine model
                    if (column instanceof ColumnModel) {
                        pristineColumn = this.findPristineColumn(options.pristineColumns, column.get('name'));
                        if (pristineColumn) {
                            columnsCopy[idx] = new ColumnModel($.extend(true, column.toJSON(), {
                                type: pristineColumn.get('type'),
                                id: pristineColumn.id
                            }));
                        }
                    } else {
                        pristineColumn = this.findPristineColumn(options.pristineColumns, column.columnName);
                        if (pristineColumn) {
                            column.id = pristineColumn.id;
                            column.type = pristineColumn.get('type');
                        } else {
                            column.type = this.determineTypeForColumn({
                                columnName: column.columnName,
                                fieldsSummaryModel: column.fieldsSummaryModel
                            });
                        }
                        column.name = column.columnName;
                        // Clear out these values to avoid having them set on the models themselves
                        delete column.columnName;
                        delete column.fieldsSummaryModel;
                    }
                }.bind(this));
                
                addResults = this.add(columnsCopy);

                if (options.deleteComparator) {
                    this.deleteComparator();
                }
                return addResults;
            },

            findPristineColumn: function(pristineColumns, columnName) {
                return pristineColumns ?  pristineColumns.findWhere({ name: columnName }) : undefined;
            },

            // Can pass in a fieldsSummaryModel to help in determining the type. Defaults to string.
            determineTypeForColumn: function(options) {
                options = options || {};

                var columnName = options.columnName,
                    fieldsSummaryModel = options.fieldsSummaryModel,
                    columnType;

                if (columnName === '_raw') {
                    columnType = ColumnModel.TYPES._RAW;
                } else if (columnName === '_time') {
                    columnType = ColumnModel.TYPES._TIME;
                } else {
                    if (fieldsSummaryModel && fieldsSummaryModel.isNumeric()) {
                        columnType = ColumnModel.TYPES.NUMBER;
                    } else {
                        columnType = ColumnModel.TYPES.STRING;
                    }
                }

                return columnType;
            },

            // Enables the comparator for addition or sorting. Can pass your own comparator if you don't want the default.
            useComparator: function(options) {
                options = options || {};

                if (options.comparator) {
                    this.comparator = options.comparator;
                } else {
                    this.comparator = this.defaultComparator;
                }
            },

            deleteComparator: function() {
                delete this.comparator;
            },

            // Columns are sorted as follows:
            //   - _time, if present, is always in the beginning
            //   - _raw, if present, is always at the end
            //   - all other columns are sorted between _time and _raw by lowercase name
            defaultComparator: function(columnOne, columnTwo) {
                var columnOneName = columnOne.get('name').toLowerCase(),
                    columnTwoName = columnTwo.get('name').toLowerCase();

                if (columnOneName === '_time' || columnTwoName === '_raw') {
                    return -1;
                }

                if (columnOneName === '_raw' || columnTwoName === '_time') {
                    return 1;
                }

                if (columnOneName < columnTwoName) {
                    return -1;
                } else {
                    return 1;
                }
            }
        }, {
            INITIAL_COLUMNS: INITIAL_COLUMNS
        });
    }
);