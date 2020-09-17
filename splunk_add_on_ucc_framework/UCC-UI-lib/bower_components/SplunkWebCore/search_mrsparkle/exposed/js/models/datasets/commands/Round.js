define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'util/math_utils'
    ],
    function(
        $,
        _,
        BaseCommand,
        ColumnModel,
        mathUtils
    ) {
        var Round = BaseCommand.extend({
            _displayName: _("Round Values").t(),
            _placeholderSPL: "round",

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL'
            },

            defaults: function() {
                return Round.getDefaults();
            },

            validateSPL: function() {
                var errorString = this.validateForTypes(this.getWhitelistedTypes()),
                    decimalPlaces = this.get('decimalPlaces');

                if (!this.hasValidRequiredColumn()) {
                    return _('Select a numeric field.').t();
                }

                if (!mathUtils.isInteger(decimalPlaces)) {
                    return _('Decimal places must be an integer.').t();
                }

                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Round Values must be in a valid state before you can generate SPL.');
                }

                var requiredField = this.requiredColumns.first(),
                    fieldName = this.getFieldNameFromGuid(requiredField.get('id')),
                    decimalPlaces = this.get('decimalPlaces');

                return 'eval "' + fieldName + '"=round(\'' + fieldName + '\',' + decimalPlaces + ')';
            }
        }, {
            blacklist: [
                {
                    selection: BaseCommand.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES.BOOLEAN, ColumnModel.TYPES.STRING,
                        ColumnModel.TYPES.IPV4, ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._TIME ]
                },
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.CELL },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.ROUND,
                    isComplete: true,
                    decimalPlaces: 0
                }, BaseCommand.getDefaults());
            }
        });

        return Round;
    }
);
