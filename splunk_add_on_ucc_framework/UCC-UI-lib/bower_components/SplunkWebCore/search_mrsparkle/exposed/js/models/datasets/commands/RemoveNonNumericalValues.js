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
        var RemoveNonNumericalValues = BaseCommand.extend({
            _displayName: _("Remove Non-Numerical Values").t(),
            _placeholderSPL: "eval",
            _advancedCommand: BaseCommand.EVAL_EXISTING_FIELD,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL'
            },

            defaults: function() {
                return RemoveNonNumericalValues.getDefaults();
            },

            validateSPL: function (value, attr, options) {
                var errorString = this.validateForTypes(this.getWhitelistedTypes());
                if (!this.hasValidRequiredColumn()) {
                    return _('Select a field.').t();
                }
                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('RemoveNonNumericalValues must be in a valid state before you can generate SPL.');
                }

                var requiredColumnGuid = this.requiredColumns.first().id,
                    fieldNameDoubleQuoted = this.getFieldNameFromGuid(requiredColumnGuid, { doubleQuoteWrap: true }),
                    expression = this.getExpression();

                return 'eval ' + fieldNameDoubleQuoted + ' = ' + expression;
            },

            getAdvancedCommandAttributes: function() {
                return {
                    expression: this.getExpression()
                };
            },

            getExpression: function() {
                var fieldNameSingleQuoted = this.hasValidRequiredColumn() ?
                        this.getFieldNameFromGuid(this.requiredColumns.first().id, { singleQuoteWrap: true }) :
                        '\'\'';

                return 'mvfilter(isnum(' + fieldNameSingleQuoted + '))';
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.CELL },
                { selection: BaseCommand.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES._TIME ]
                },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.REMOVE_NON_NUMERICAL_VALUES,
                    isComplete: true
                }, BaseCommand.getDefaults());
            }
        });
        
        return RemoveNonNumericalValues;
    }
);