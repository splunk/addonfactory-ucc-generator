define(
    [
        'underscore',
        'jquery',
        'collections/datasets/Aggregates',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'splunk.util'
    ],
    function(
        _,
        $,
        AggregatesCollection,
        BaseCommand,
        ColumnModel,
        splunkUtils
    ) {
        var FUNCTIONS = {
            COUNT_VALUES: {
                label: _('count values').t(),
                value: 'count',
                whitelist: [
                    ColumnModel.TYPES.NUMBER,
                    ColumnModel.TYPES.STRING,
                    ColumnModel.TYPES.IPV4,
                    ColumnModel.TYPES.BOOLEAN,
                    ColumnModel.TYPES.EPOCH_TIME,
                    ColumnModel.TYPES._TIME
                ]
            },
            DISTINCT_COUNT_VALUES: {
                label: _('distinct count values').t(),
                value: 'dc',
                whitelist: [
                    ColumnModel.TYPES.NUMBER,
                    ColumnModel.TYPES.STRING,
                    ColumnModel.TYPES.IPV4,
                    ColumnModel.TYPES.BOOLEAN,
                    ColumnModel.TYPES.EPOCH_TIME,
                    ColumnModel.TYPES._TIME
                ]
            },
            MAX: {
                label: _('max').t(),
                value: 'max',
                whitelist: [ ColumnModel.TYPES.NUMBER ]
            },
            MIN: {
                label: _('min').t(),
                value: 'min',
                whitelist: [ ColumnModel.TYPES.NUMBER ]
            },
            MEAN: {
                label: _('mean').t(),
                value: 'mean',
                whitelist: [ ColumnModel.TYPES.NUMBER ]
            },
            MEDIAN: {
                label: _('median').t(),
                value: 'median',
                whitelist: [ ColumnModel.TYPES.NUMBER ]
            },
            MODE: {
                label: _('mode').t(),
                value: 'mode',
                whitelist: [ ColumnModel.TYPES.NUMBER ]
            },
            POPULATION_STANDARD_DEVIATION: {
                label: _('population standard deviation').t(),
                value: 'stdevp',
                whitelist: [ ColumnModel.TYPES.NUMBER ]
            },
            RANGE: {
                label: _('range').t(),
                value: 'range',
                whitelist: [ ColumnModel.TYPES.NUMBER ]
            },
            STANDARD_DEVIATION: {
                label: _('standard deviation').t(),
                value: 'stdev',
                whitelist: [ ColumnModel.TYPES.NUMBER ]
            },
            SUM: {
                label: _('sum').t(),
                value: 'sum',
                whitelist: [ ColumnModel.TYPES.NUMBER ]
            },
            VARIANCE: {
                label: _('variance').t(),
                value: 'var',
                whitelist: [ ColumnModel.TYPES.NUMBER ]
            }
        };
        
        var StatsCommand = BaseCommand.extend({
            _displayName: _('Stats').t(),
            _placeholderSPL: 'stats',
            isSearchPoint: true,
            _useAST: true,
            
            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);

                this.initializeAssociated();

                this.aggregates.on('add remove reset change', function() {
                    this.trigger('aggregatesChange');
                }, this);
            },

            initializeAssociated: function() {
                BaseCommand.prototype.initializeAssociated.apply(this, arguments);

                var RootClass = this.constructor;
                this.associated = this.associated || {};

                this.aggregates = this.aggregates || new RootClass.Aggregates();
                this.associated.aggregates = this.aggregates;
            },

            parse: function(response, options) {
                response = BaseCommand.prototype.parse.apply(this, arguments);

                if (response.aggregates) {
                    this.aggregates.reset(response.aggregates, options);
                    delete response.aggregates;
                }

                return response;
            },

            setFromCommandJSON: function(jsonPayload, options) {
                options = options || {};

                if (!options.skipClone) {
                    jsonPayload = $.extend(true, {}, jsonPayload);
                }

                if (jsonPayload) {
                    if (jsonPayload.aggregates) {
                        this.aggregates.set(jsonPayload.aggregates, options);
                        this.aggregates.setFunctions(jsonPayload.aggregates, options);
                        delete jsonPayload.aggregates;
                    }
                }

                return BaseCommand.prototype.setFromCommandJSON.call(this, jsonPayload, options);
            },

            toJSON: function(options) {
                var baseJSON = BaseCommand.prototype.toJSON.apply(this, arguments),
                    aggregatesJSON = this.aggregates.toJSON(options);

                if (!_.isEmpty(baseJSON) || !_.isEmpty(aggregatesJSON)) {
                    baseJSON.aggregates = aggregatesJSON;
                }

                return baseJSON;
            },

            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};
                _.defaults(initialStateOptions, {
                    aggregateGuids: [],
                    splitByGuids: [],
                    addRowCount: false
                });

                if (!this.aggregates.length && initialStateOptions.aggregateGuids.length) {
                    _.each(initialStateOptions.aggregateGuids, function(aggregateGuid) {
                        this.aggregates.add({ columnGuid: aggregateGuid });
                    }, this);
                }
                // We're using editorValues for the split by columns
                if (!this.editorValues.length && initialStateOptions.splitByGuids.length) {
                    _.each(initialStateOptions.splitByGuids, function(splitByGuid) {
                        this.editorValues.add({ columnGuid: splitByGuid });
                    }, this);
                }
                if (initialStateOptions.addRowCount) {
                    this.set('rowCount', true);
                }

                this.updateRequiredColumns();
            },
            
            validation: {
                spl: 'validateSPL'
            },
            
            validateSPL: function() {
                var i = 0,
                    j = 0,
                    errorString = this.validateForTypes(this.getWhitelistedTypes()),
                    currentAggregate,
                    currentFunctions,
                    currentSplitBy;

                if (errorString) {
                    return errorString;
                }

                for (; i < this.aggregates.length; i++) {
                    currentAggregate = this.aggregates.at(i);
                    currentFunctions = currentAggregate.functions;

                    if (_.isUndefined(this.getPreviousCommandFieldNameFromGuid(currentAggregate.get('columnGuid')))) {
                        return _('Each aggregate must define a field name.').t();
                    }

                    if (!currentFunctions.length) {
                        return _('Each aggregate must add at least one function.').t();
                    }
                }

                for (; j < this.editorValues.length; j++) {
                    currentSplitBy = this.editorValues.at(j);

                    if (_.isUndefined(this.getPreviousCommandFieldNameFromGuid(currentSplitBy.get('columnGuid')))) {
                        return _('Each split by must define a field name.').t();
                    }
                }

                if (!this.aggregates.length && !splunkUtils.normalizeBoolean(this.get('rowCount'))) {
                    return _('Add at least one aggregate field or the row count.').t();
                }

                if (_.intersection(this.aggregates.pluck('columnGuid'), this.editorValues.pluck('columnGuid')).length) {
                    return _('You cannot use the same field as an aggregate and a split by.').t();
                }

                if (this.ast && this.ast.hasError()) {
                    return this.ast.error.get('messages')[0].text;
                }
            },
            
            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Stats must be in a valid state before you can generate SPL.');
                }

                var aggregatesStr,
                    countStr = '',
                    splitBysStr = this.editorValues.length ? ' by ' : '';

                aggregatesStr = this.aggregates.map(function(aggregate) {
                    var columnGuidForAggregate = aggregate.get('columnGuid');

                    return aggregate.functions.map(function(func) {
                        return this.getFunctionDisplayName({
                            func: func.get('value'),
                            columnGuid: columnGuidForAggregate
                        });
                    }, this).join(', ');
                }, this).join(', ');

                if (splunkUtils.normalizeBoolean(this.get('rowCount'))) {
                    if (this.aggregates.length) {
                        countStr = ', count';
                    } else {
                        countStr = 'count';
                    }
                }

                splitBysStr += this.editorValues.map(function(splitBy) {
                    return this.getPreviousCommandFieldNameFromGuid(splitBy.get('columnGuid'), options);
                }, this).join(', ');

                return 'stats ' + aggregatesStr + countStr + splitBysStr;
            },

            getFunctionListPickerItems: function(options) {
                options = options || {};

                var previousCommandColumns = this.getPreviousColumns(),
                    column = previousCommandColumns && previousCommandColumns.get(options.columnGuid),
                    columnType = column && column.get('type'),
                    functionListPickerItems = [];

                _.each(FUNCTIONS, function(func) {
                    if (func.whitelist.indexOf(columnType) > -1) {
                        functionListPickerItems.push(func);
                    }
                }, this);

                return functionListPickerItems;
            },

            getPreviousCommandFieldNameFromGuid: function(guid, options) {
                var previousCommand;

                if (this.collection) {
                    previousCommand = this.collection.getPreviousCommand(this);
                // In the case we're operating on an inmem model, this.previousCommand will help us
                } else if (this.previousCommand) {
                    previousCommand = this.previousCommand;
                }

                if (previousCommand) {
                    return previousCommand.getFieldNameFromGuid(guid, options);
                }
            },

            getFunctionDisplayName: function(options) {
                options = options || {};
                var columnName;

                if (options.func && options.columnGuid) {
                    columnName = this.getPreviousCommandFieldNameFromGuid(options.columnGuid, options);

                    if (columnName) {
                        return options.func + '(' + columnName + ')';
                    }
                }
            },

            updateRequiredColumns: function() {
                var newRequiredColumns = [];

                this.aggregates.each(function(aggregate) {
                    newRequiredColumns.push({ id: aggregate.get('columnGuid') });
                }, this);

                this.editorValues.each(function(splitBy) {
                    newRequiredColumns.push({ id: splitBy.get('columnGuid') });
                }, this);

                this.requiredColumns.reset(newRequiredColumns);
            }
        }, {
            Aggregates: AggregatesCollection,
            blacklist: [
                { selection: BaseCommand.SELECTION.COLUMN, types: [ ColumnModel.TYPES._RAW ] },
                { selection: BaseCommand.SELECTION.MULTICOLUMN, types: [ ColumnModel.TYPES._RAW ] },
                { selection: BaseCommand.SELECTION.CELL },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.STATS,
                    rowCount: false
                }, BaseCommand.getDefaults());
            },
            FUNCTIONS: FUNCTIONS
        });
        
        return StatsCommand;
    }
);