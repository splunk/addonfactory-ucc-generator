define(
    [
        'underscore',
        'jquery',
        'models/Base',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'util/dataset_utils',
        'splunk.util'
    ],
    function(
        _,
        $,
        BaseModel,
        BaseCommandModel,
        ColumnModel,
        datasetUtils,
        splunkUtil
    ) {
        // Various filter comparator types
        var FILTER_TYPES = {
                CONTAINS: "contains",
                DOESNOTCONTAIN: "doesNotContain",
                STARTSWITH: "startsWith",
                DOESNOTSTARTWITH: "doesNotStartWith",
                ENDSWITH: "endsWith",
                DOESNOTENDWITH: "doesNotEndWith",
                EQUALS: "equals",
                DOESNOTEQUAL: "doesNotEqual",
                MATCHES: "matches",
                LESSTHAN: "lessThan",
                LESSTHANOREQUALTO: "lessThanOrEqualTo",
                GREATERTHAN: "greaterThan",
                GREATERTHANOREQUALTO: "greaterThanOrEqualTo",
                ISNULL: "isNull",
                ISNOTNULL: "isNotNull",
                ISEMPTY: "isEmpty",
                ISNOTEMPTY: "isNotEmpty",
                ISTRUE: "isTrue",
                ISFALSE: "isFalse"
            },
            FILTER_ITEMS = {},
            FILTER_CONFIGS = {},
            EQUALS_COMMANDS = {},

            getFilterItems = function(type) {
                var allFilterItems = _.extend({}, FILTER_ITEMS,
                        EQUALS_COMMANDS[type === ColumnModel.TYPES["NUMBER"] ?
                            ColumnModel.TYPES["NUMBER"] :
                            ColumnModel.TYPES["STRING"]]),
                    filterConfigs = FILTER_CONFIGS[type] || {},
                    whitelistedItems = {};

                _.each(filterConfigs.whitelist, function(filter) {
                    whitelistedItems[filter] = allFilterItems[filter];
                }.bind(this));

                return {
                    defaultComparator: filterConfigs.defaultComparator,
                    items: whitelistedItems
                };
            };


        EQUALS_COMMANDS[ColumnModel.TYPES["NUMBER"]] = {};
        EQUALS_COMMANDS[ColumnModel.TYPES["NUMBER"]][FILTER_TYPES["EQUALS"]] = {
            label: "=",
            spl: {
                search: '%(field)s = %(value)s',
                where: 'mvcount(mvfilter(tonumber(%(field)s) == %(value)s)) >= 1'
            }
        };
        EQUALS_COMMANDS[ColumnModel.TYPES["NUMBER"]][FILTER_TYPES["DOESNOTEQUAL"]] = {
            label: "!=",
            spl: {
                search: '%(field)s != %(value)s',
                where: 'mvcount(mvfilter(tonumber(%(field)s) != %(value)s)) >= 1 OR isnull(%(field)s)'
            }
        };

        EQUALS_COMMANDS[ColumnModel.TYPES["STRING"]] = {};
        EQUALS_COMMANDS[ColumnModel.TYPES["STRING"]][FILTER_TYPES["EQUALS"]] = {
            label: _("equals").t(),
            spl: {
                search: '%(field)s = "%(value)s"',
                where: 'mvcount(mvfilter(lower(%(field)s) == lower("%(value)s"))) >= 1'
            },
            canUseEmptyString: true
        };
        EQUALS_COMMANDS[ColumnModel.TYPES["STRING"]][FILTER_TYPES["DOESNOTEQUAL"]] = {
            label: _("does not equal").t(),
            spl: {
                search:'%(field)s != "%(value)s"',
                where: 'mvcount(mvfilter(lower(%(field)s) != lower("%(value)s"))) >= 1 OR isnull(%(field)s)'
            },
            canUseEmptyString: true
        };

        // Mapping for the label and SPL for each type of filter comparator
        FILTER_ITEMS[FILTER_TYPES["CONTAINS"]] = {
            label: _("contains").t(),
            spl: {
                search: '%(field)s = "*%(value)s*"',
                where: 'mvcount(mvfilter(like(lower(%(field)s), lower("%%%(value)s%%")))) >= 1'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["DOESNOTCONTAIN"]] = {
            label: _("does not contain").t(),
            spl: {
                search: '%(field)s != "*%(value)s*"',
                where: 'mvcount(mvfilter(NOT like(lower(%(field)s), lower("%%%(value)s%%")))) >= 1 OR isnull(%(field)s)'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["STARTSWITH"]] = {
            label: _("starts with").t(),
            spl: {
                search: '%(field)s = "%(value)s*"',
                where: 'mvcount(mvfilter(like(lower(%(field)s), lower("%(value)s%%")))) >= 1'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["DOESNOTSTARTWITH"]] = {
            label: _("does not start with").t(),
            spl: {
                search: '%(field)s != "%(value)s*"',
                where: 'mvcount(mvfilter(like(lower(%(field)s), lower("%(value)s%%")))) == 0'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["ENDSWITH"]] = {
            label: _("ends with").t(),
            spl: {
                search: '%(field)s = "*%(value)s"',
                where: 'mvcount(mvfilter(like(lower(%(field)s), lower("%%%(value)s")))) >= 1'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["DOESNOTENDWITH"]] = {
            label: _("does not end with").t(),
            spl: {
                search: '%(field)s != "*%(value)s"',
                where: 'mvcount(mvfilter(like(lower(%(field)s), lower("%%%(value)s")))) == 0'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["MATCHES"]] = {
            label: _("matches pattern").t(),
            spl: {
                search: '%(field)s = "%(value)s"',
                where: 'mvcount(mvfilter(like(lower(%(field)s), lower("%(value)s")))) >= 1'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["LESSTHAN"]] = {
            label: "<",
            spl: {
                // search: '%(field)s < %(value)s',
                where: 'mvcount(mvfilter(tonumber(%(field)s) < %(value)s)) >= 1'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["LESSTHANOREQUALTO"]] = {
            label: "<=",
            spl: {
                // search: '%(field)s <= %(value)s',
                where: 'mvcount(mvfilter(tonumber(%(field)s) <= %(value)s)) >= 1'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["GREATERTHAN"]] = {
            label: ">",
            spl: {
                // search: '%(field)s > %(value)s',
                where: 'mvcount(mvfilter(tonumber(%(field)s) > %(value)s)) >= 1'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["GREATERTHANOREQUALTO"]] = {
            label: ">=",
            spl: {
                // search: '%(field)s >= %(value)s',
                where: 'mvcount(mvfilter(tonumber(%(field)s) >= %(value)s)) >= 1'
            }
        };
        FILTER_ITEMS[FILTER_TYPES["ISNULL"]] = {
            label: _("is null").t(),
            spl: {
                search: 'NOT %(field)s = "*"',
                where: 'isnull(%(field)s)'
            },
            rightSideDisabled: true
        };
        FILTER_ITEMS[FILTER_TYPES["ISNOTNULL"]] = {
            label: _("is not null").t(),
            spl: {
                search: '%(field)s = "*"',
                where: 'isnotnull(%(field)s)'
            },
            rightSideDisabled: true
        };
        FILTER_ITEMS[FILTER_TYPES["ISEMPTY"]] = {
            label: _("is empty").t(),
            spl: {
                search: '%(field)s = ""',
                where: 'mvcount(mvfilter(%(field)s != "")) == 0'
            },
            rightSideDisabled: true
        };
        FILTER_ITEMS[FILTER_TYPES["ISNOTEMPTY"]] = {
            label: _("is not empty").t(),
            spl: {
                search: 'NOT %(field)s = ""',
                where: 'mvcount(mvfilter(%(field)s != "")) >= 1'
            },
            rightSideDisabled: true
        };
        FILTER_ITEMS[FILTER_TYPES["ISTRUE"]] = {
            label: _("is true").t(),
            spl: {
                search: '%(field)s = true',
                where: 'mvcount(mvfilter(lower(%(field)s) == true)) >= 1'
            },
            rightSideDisabled: true
        };
        FILTER_ITEMS[FILTER_TYPES["ISFALSE"]] = {
            label: _("is false").t(),
            spl: {
                search: '%(field)s = false',
                where: 'mvcount(mvfilter(lower(%(field)s) == false)) >= 1'
            },
            rightSideDisabled: true
        };

        // Mapping for each column type to the filter items and types for each one
        FILTER_CONFIGS[ColumnModel.TYPES["_RAW"]] = {
            defaultComparator: FILTER_TYPES["CONTAINS"],
            whitelist: [
                FILTER_TYPES["EQUALS"],
                FILTER_TYPES["DOESNOTEQUAL"],
                FILTER_TYPES["CONTAINS"],
                FILTER_TYPES["DOESNOTCONTAIN"],
                FILTER_TYPES["STARTSWITH"],
                FILTER_TYPES["DOESNOTSTARTWITH"],
                FILTER_TYPES["ENDSWITH"],
                FILTER_TYPES["DOESNOTENDWITH"],
                FILTER_TYPES["MATCHES"]
            ]
        };
        FILTER_CONFIGS[ColumnModel.TYPES["NUMBER"]] = {
            defaultComparator: FILTER_TYPES["EQUALS"],
            whitelist: [
                FILTER_TYPES["EQUALS"],
                FILTER_TYPES["DOESNOTEQUAL"],
                FILTER_TYPES["LESSTHAN"],
                FILTER_TYPES["LESSTHANOREQUALTO"],
                FILTER_TYPES["GREATERTHAN"],
                FILTER_TYPES["GREATERTHANOREQUALTO"],
                FILTER_TYPES["ISNULL"],
                FILTER_TYPES["ISNOTNULL"],
                FILTER_TYPES["ISEMPTY"],
                FILTER_TYPES["ISNOTEMPTY"]
            ]
        };
        FILTER_CONFIGS[ColumnModel.TYPES["BOOLEAN"]] = {
            defaultComparator: FILTER_TYPES["EQUALS"],
            whitelist: [
                FILTER_TYPES["ISTRUE"],
                FILTER_TYPES["ISFALSE"],
                FILTER_TYPES["ISNULL"],
                FILTER_TYPES["ISNOTNULL"],
                FILTER_TYPES["ISEMPTY"],
                FILTER_TYPES["ISNOTEMPTY"]
            ]
        };
        FILTER_CONFIGS[ColumnModel.TYPES["STRING"]] = {
            defaultComparator: FILTER_TYPES["CONTAINS"],
            whitelist: [
                FILTER_TYPES["EQUALS"],
                FILTER_TYPES["DOESNOTEQUAL"],
                FILTER_TYPES["CONTAINS"],
                FILTER_TYPES["DOESNOTCONTAIN"],
                FILTER_TYPES["STARTSWITH"],
                FILTER_TYPES["DOESNOTSTARTWITH"],
                FILTER_TYPES["ENDSWITH"],
                FILTER_TYPES["DOESNOTENDWITH"],
                FILTER_TYPES["MATCHES"],
                FILTER_TYPES["ISNULL"],
                FILTER_TYPES["ISNOTNULL"],
                FILTER_TYPES["ISEMPTY"],
                FILTER_TYPES["ISNOTEMPTY"]
            ]
        };
        FILTER_CONFIGS[ColumnModel.TYPES["IPV4"]] = {
            defaultComparator: FILTER_TYPES["CONTAINS"],
            whitelist: [
                FILTER_TYPES["ISNULL"],
                FILTER_TYPES["ISNOTNULL"],
                FILTER_TYPES["ISEMPTY"],
                FILTER_TYPES["ISNOTEMPTY"],
                FILTER_TYPES["EQUALS"],
                FILTER_TYPES["DOESNOTEQUAL"],
                FILTER_TYPES["CONTAINS"],
                FILTER_TYPES["DOESNOTCONTAIN"],
                FILTER_TYPES["STARTSWITH"],
                FILTER_TYPES["DOESNOTSTARTWITH"],
                FILTER_TYPES["ENDSWITH"],
                FILTER_TYPES["DOESNOTENDWITH"],
                FILTER_TYPES["MATCHES"]
            ]
        };
        FILTER_CONFIGS[ColumnModel.TYPES["_TIME"]] = {
            defaultComparator: FILTER_TYPES["CONTAINS"],
            whitelist: []
        };
        FILTER_CONFIGS[ColumnModel.TYPES["EPOCH_TIME"]] = {
            defaultComparator: FILTER_TYPES["CONTAINS"],
            whitelist: []
        };

        var FilterValues = BaseCommandModel.extend({
            _displayName: _('Filter by Value').t(),
            _placeholderSPL: BaseCommandModel.SEARCH,
            _advancedCommand: BaseCommandModel.SEARCH,
            isSearchPoint: true,

            initialize: function(attributes, options) {
                BaseCommandModel.prototype.initialize.apply(this, arguments);

                this.setWhereDependentAttributes();
                this.on('editorValuesChange', this.setWhereDependentAttributes);
            },

            setWhereDependentAttributes: function() {
                if (this.shouldUseWhere()) {
                    this._placeholderSPL = BaseCommandModel.WHERE;
                    this._advancedCommand = BaseCommandModel.WHERE;
                } else {
                    this._placeholderSPL = BaseCommandModel.SEARCH;
                    this._advancedCommand = BaseCommandModel.SEARCH;
                }
            },

            // Create an editor value for each required column
            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};

                var editorValues = [];

                if (!this.editorValues.length) {
                    this.requiredColumns.each(function(requiredColumn) {
                        var currentColumn = this.columns.get(requiredColumn.id),
                            currentColumnType = currentColumn.get('type'),
                            editorValue = {
                                columnGuid: requiredColumn.id,
                                comparator: initialStateOptions.initialComparator ||
                                    getFilterItems(currentColumnType).defaultComparator
                            };

                        if (initialStateOptions.textVal) {
                            editorValue.filterString = initialStateOptions.textVal;
                        } else if (initialStateOptions.cellVal) {
                            editorValue.filterString = initialStateOptions.cellVal;
                        }
                        editorValues.push(editorValue);
                    }.bind(this));

                    this.editorValues.reset(editorValues);
                }
            },

            defaults: function() {
                return FilterValues.getDefaults();
            },

            validation: {
                spl: 'validateSPL'
            },

            validateSPL: function(value, attr, options) {
                var typeErrorString = this.validateForTypes(this.getWhitelistedTypes()),
                    errorString;
                
                if (!this.editorValues.length) {
                    return _('You must have at least one defined filter.');
                }

                if (typeErrorString) {
                    return typeErrorString;
                }

                this.editorValues.each(function(editorValue) {
                    var filterString = editorValue.get('filterString'),
                        comparator = editorValue.get('comparator'),
                        columnGuid = editorValue.get('columnGuid'),
                        column = this.columns.get(columnGuid),
                        type = column && column.get('type');

                    if (!column) {
                        editorValue.set('hasError', true);
                        if (!errorString) {
                            errorString = _('One or more conditions require fields that have been removed.').t();
                        }
                    } else if (errorString) {
                        return;
                    } else if (!_.contains(FILTER_CONFIGS[type].whitelist, comparator)) {
                        errorString = splunkUtil.sprintf(_('A condition defined for %s is not compatible with the field\'s type \"%s\".').t(),
                            column.get('name'),
                            type
                        );
                    // We only care about the filter string if it's not being disabled
                    } else if (!getFilterItems(type).items[comparator].rightSideDisabled) {
                        // Return error message for empty string and null values,
                        // unless a value is not required (Right side is disabled)
                        if (!filterString && !getFilterItems(type).items[comparator].canUseEmptyString) {
                            if (this.editorValues.length > 1) {
                                errorString = _('One or more conditions are missing values.').t();
                            } else {
                                errorString = _('No value was entered for the condition.').t();
                            }

                        // Make sure that if the type is numeric, so is the value
                        } else if (type === ColumnModel.TYPES['NUMBER'] && !datasetUtils.isNumber(filterString)) {
                            errorString = _('You are filtering on a numerically-typed field. Its filter can only contain numerical values.').t();

                        // Throw if the user tries to use wildcards (* or %), except for * when matching patterns
                        } else if (_.contains(filterString, "\*") &&
                            comparator !== FILTER_TYPES['MATCHES']) {
                            errorString = _('Asterisks are only permitted when matching a pattern.').t();
                        } else if (_.contains(filterString, "%") && this.shouldUseWhere()) {
                            errorString = _('Percent signs are not permitted.').t();
                        }
                    }
                }.bind(this));

                // Intentionally return null, indicating no error, if there is not one set
                return errorString;
            },

            generateSPL: function(options) {
                options = options || {};
            
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('FilterValues must be in a valid state before you can generate SPL.');
                }

                var command = this.shouldUseWhere() ? 'where' : 'search',
                    expression = this.getExpression();

                return command + ' ' + expression;
            },

            getAdvancedCommandAttributes: function() {
                return {
                    expression: this.getExpression()
                };
            },

            getExpression: function() {
                var shouldUseWhere = this.shouldUseWhere(),
                    command = shouldUseWhere ? 'where' : 'search',
                    // A radio sets this value, determining how to handle multiple values
                    operator = this.get('filterAllValues') ? ' AND ' : ' OR ';

                return this.editorValues.map(function(editorValue) {
                    var comparator = editorValue.get('comparator'),
                        columnGuid = editorValue.get('columnGuid'),
                        fieldName = shouldUseWhere ?
                            this.getFieldNameFromGuid(columnGuid, { singleQuoteWrap: true }) :
                            this.getFieldNameFromGuid(columnGuid, { doubleQuoteWrap: true }),
                        column = this.columns.get(columnGuid),
                        type,
                        filterItems,
                        replacementString,
                        filterString;

                    if (!column) {
                        return;
                    }

                    type = column.get('type');
                    filterItems = getFilterItems(type).items[comparator];
                    replacementString = filterItems.spl[command];
                    filterString = datasetUtils.splEscape(editorValue.get('filterString') || '');

                    if (shouldUseWhere) {
                        filterString = filterString.replace(/\*/g, '%');
                    }

                    return splunkUtil.sprintf(replacementString, {
                        field: fieldName,
                        value: filterString
                    });
                }, this).join(operator);
            },

            shouldUseWhere: function() {
                return this.requiredColumns.any(function(col) {
                    var column = this.columns.get(col.id);
                    return column && column.get('type') === ColumnModel.TYPES['NUMBER'];
                }.bind(this));
            }
        }, {
            blacklist: [
                {
                    selection: BaseCommandModel.SELECTION.MULTICOLUMN,
                    types: [ ColumnModel.TYPES._TIME, ColumnModel.TYPES.EPOCH_TIME ]
                },
                {
                    selection: BaseCommandModel.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._TIME, ColumnModel.TYPES.EPOCH_TIME ]
                },
                {
                    selection: BaseCommandModel.SELECTION.CELL,
                    types: [ ColumnModel.TYPES._TIME, ColumnModel.TYPES.EPOCH_TIME ]
                },
                {
                    selection: BaseCommandModel.SELECTION.TABLE
                }
            ],
            filterTypes: FILTER_TYPES,
            getFilterItems: getFilterItems,
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommandModel.FILTER_VALUES,
                    filterAllValues: false
                }, BaseCommandModel.getDefaults());
            }
        });

        return FilterValues;
    }
);
