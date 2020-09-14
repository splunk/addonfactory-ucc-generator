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
        var ChangeCase = BaseCommand.extend({
            _displayName: _("Change Case").t(),
            _placeholderSPL: "eval",
            _advancedCommand: BaseCommand.EVAL_EXISTING_FIELD,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL'
            },

            defaults: function() {
                return ChangeCase.getDefaults();
            },

            validateSPL: function(value, attr, options) {
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
                    throw new Error('ChangeCase must be in a valid state before you can generate SPL.');
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
                var caseString = this.get('toUpper') ? 'upper' : 'lower',
                    fieldNameSingleQuoted = this.hasValidRequiredColumn() ?
                        this.getFieldNameFromGuid(this.requiredColumns.first().id, { singleQuoteWrap: true }) :
                        '\'\'';

                return caseString + '(' + fieldNameSingleQuoted + ')';
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.CELL },
                {
                    selection: BaseCommand.SELECTION.COLUMN,
                    types: [
                        ColumnModel.TYPES._RAW,
                        ColumnModel.TYPES._TIME,
                        ColumnModel.TYPES.EPOCH_TIME,
                        ColumnModel.TYPES.NUMBER,
                        ColumnModel.TYPES.BOOLEAN,
                        ColumnModel.TYPES.IPV4
                    ]
                },
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.CHANGE_CASE,
                    toUpper: false
                }, BaseCommand.getDefaults());
            }
        });

        return ChangeCase;
    }
);
