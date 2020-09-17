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
        var Dedup = BaseCommand.extend({
            _displayName: _("Remove Duplicates").t(),
            _placeholderSPL: "dedup",
            isSearchPoint: true,
            
            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL'
            },
            
            defaults: function() {
                return Dedup.getDefaults();
            },

            validateSPL: function (value, attr, options) {
                var errorString = this.validateForTypes(this.getWhitelistedTypes());
                if (!this.hasValidRequiredColumn()) {
                    return _("Provide one or more fields.").t();
                }
                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Dedup must be in a valid state before you can generate SPL.');
                }
                
                var spl = 'dedup ',
                    requiredFieldGuids = this.requiredColumns.pluck('id'),
                    requiredFieldsStr = this.convertGuidsToFields(requiredFieldGuids, { doubleQuoteWrap: true }).join(' ');

                return spl + requiredFieldsStr;
            }
            
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.CELL },
                {
                    selection: BaseCommand.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._RAW ]
                },
                { selection: BaseCommand.SELECTION.TEXT },
                {
                    selection: BaseCommand.SELECTION.MULTICOLUMN,
                    types: [ ColumnModel.TYPES._RAW ]
                }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.DEDUP,
                    isComplete: true
                }, BaseCommand.getDefaults(overrides));
            }
        });

        return Dedup;
    }
);