define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'models/datasets/Column'
    ],
    function(
        $,
        _,
        BaseCommand,
        ColumnModel
        ) {
        var Coalesce = BaseCommand.extend({
            _displayName: _('Coalesce').t(),
            _placeholderSPL: 'eval',
            fieldPickerBlacklistSelection: BaseCommand.SELECTION.MULTICOLUMN,
            _advancedCommand: BaseCommand.EVAL,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            defaults: function() {
                return Coalesce.getDefaults();
            },

            validation: {
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },

            validateSPL: function(value, attr, option) {
                var newFieldName = this.get('newFieldName'),
                    invalidFieldMessage = this.validateFieldName(newFieldName),
                    errorString = this.validateForTypes(this.getWhitelistedTypes({ selectionType: BaseCommand.SELECTION.MULTICOLUMN }));

                if (!this.hasValidRequiredColumns()) {
                    return _('Select two or more fields to coalesce.').t();
                }

                if (invalidFieldMessage) {
                    return invalidFieldMessage;
                }

                if (errorString) {
                    return errorString;
                }
            },

            hasValidRequiredColumns: function() {
                var colsWithoutIds = this.requiredColumns.filter(function(col) {
                    return col.isNew();
                }, this);
                return this.requiredColumns.length >= 2 && !colsWithoutIds.length;
            },

            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Coalesce must be in a valid state before you can generate SPL.');
                }

                var newFieldName = this.get('newFieldName'),
                    expression = this.getExpression();

                return 'eval "' + newFieldName + '"=' + expression;
            },

            getAdvancedCommandAttributes: function() {
                return {
                    newFieldName: this.get('newFieldName'),
                    expression: this.getExpression()
                };
            },

            getExpression: function() {
                var currentColumnIds = this.requiredColumns.pluck('id'),
                    coalescedFieldNames = this.convertGuidsToFields(currentColumnIds, { singleQuoteWrap: true }).join(', ');

                return 'coalesce(' + coalescedFieldNames + ')';
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.CELL },
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.TEXT },
                { selection: BaseCommand.SELECTION.COLUMN },
                { selection: BaseCommand.SELECTION.MULTICOLUMN, types: [ColumnModel.TYPES._RAW] }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.COALESCE,
                    newFieldName: ''
                }, BaseCommand.getDefaults());
            }
        });
        
        return Coalesce;
    }
);
