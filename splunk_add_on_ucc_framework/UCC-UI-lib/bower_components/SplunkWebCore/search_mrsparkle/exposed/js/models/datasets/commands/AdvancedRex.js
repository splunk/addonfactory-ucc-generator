define(
    [
        'jquery',
        'underscore',
        'models/datasets/Column',
        'models/datasets/commands/Base',
        'util/dataset_utils'
    ],
    function(
        $,
        _,
        ColumnModel,
        BaseCommandModel,
        datasetUtils
    ) {
        var AdvancedRex = BaseCommandModel.extend({
            _displayName: _('Extract with Regex').t(),
            _placeholderSPL: 'rex',
            _useAST: true,

            initialize: function(attributes, options) {
                BaseCommandModel.prototype.initialize.apply(this, arguments);
            },

            defaults: function() {
                return AdvancedRex.getDefaults();
            },

            validation: {
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },

            getFieldsToAddAsArray: function() {
                return this.ast && this.ast.getModifiedFieldsNameList();
            },

            validateSPL: function(value, attr, option) {
                var maxMatch = this.get('maxMatch'),
                    i = 0,
                    fieldsToAdd = this.getFieldsToAddAsArray() || [],
                    invalidFieldNameMessage;

                if (!this.hasValidRequiredColumn()) {
                    return _('Provide a field to extract from.').t();
                }

                if (_.isEmpty(this.get('regex'))) {
                    return _('Provide a regular expression.').t();
                }

                for (; i < fieldsToAdd.length; i++) {
                    invalidFieldNameMessage = this.validateRexFieldName(fieldsToAdd[i]);

                    if (invalidFieldNameMessage) {
                        return invalidFieldNameMessage;
                    }
                }

                if (maxMatch && (!datasetUtils.isInteger(maxMatch) || maxMatch < 0)) {
                    return _('Max match must be an integer greater than or equal to 0.').t();
                }

                // Make sure no ill formed commands are slipped in here
                // (no need to check for pipes because user input is quote wrapped)
                return this.validateASTErrors();
            },

            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('AdvancedRex must be in a valid state before you can generate SPL.');
                }

                var fieldName = this.getFieldNameFromGuid(this.requiredColumns.first().get('id'), { doubleQuoteWrap: true }),
                    regex = this.get('regex'),
                    maxMatch = this.get('maxMatch');

                if (_.isUndefined(maxMatch) || maxMatch === 1) {
                    return 'rex field=' + fieldName + ' "' + regex + '"';
                } else {
                    return 'rex field=' + fieldName + ' "' + regex + '" max_match=' + maxMatch;
                }
            }
        }, {
            blacklist: [
                { selection: BaseCommandModel.SELECTION.TABLE },
                { selection: BaseCommandModel.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._TIME, ColumnModel.TYPES.EPOCH_TIME ]
                },
                { selection: BaseCommandModel.SELECTION.MULTICOLUMN },
                { selection: BaseCommandModel.SELECTION.CELL,
                    types: [ ColumnModel.TYPES._TIME, ColumnModel.TYPES.EPOCH_TIME ]
                }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommandModel.ADVANCED_REX
                }, BaseCommandModel.getDefaults());
            }
        });
        
        return AdvancedRex;
    }
);
