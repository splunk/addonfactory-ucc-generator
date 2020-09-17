define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'util/dataset_utils',
        'splunk.util'
    ],
    function(
        $,
        _,
        BaseCommand,
        ColumnModel,
        datasetUtils,
        splunkUtil
    ) {
        var TYPES = {
            NULL: 'null',
            EMPTY: 'empty',
            BOTH: 'both'
        };

        var FillValues = BaseCommand.extend({
            _displayName: _('Fill Null or Empty Values').t(),
            _placeholderSPL: 'eval',
            _advancedCommand: BaseCommand.EVAL_EXISTING_FIELD,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL'
            },
            
            defaults: function() {
                return FillValues.getDefaults();
            },

            validateSPL: function (value, attr, options) {
                var errorString = this.validateForTypes(this.getWhitelistedTypes());

                if (!this.hasValidRequiredColumn()) {
                    return _('Select a field with null or empty values.').t();
                }
                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('FillValues must be in a valid state before you can generate SPL.');
                }
                
                var requiredColumnGuid = this.requiredColumns.first().id,
                    fieldNameDoubleQuoted = this.getFieldNameFromGuid(requiredColumnGuid, { doubleQuoteWrap: true }),
                    expression = this.getExpression();

                return 'eval ' + fieldNameDoubleQuoted + '=' + expression;
            },

            getAdvancedCommandAttributes: function() {
                return {
                    expression: this.getExpression()
                };
            },

            getExpression: function() {
                var fieldNameSingleQuoted = this.hasValidRequiredColumn() ?
                        this.getFieldNameFromGuid(this.requiredColumns.first().id, { singleQuoteWrap: true }) :
                        '\'\'',
                    fillValue = datasetUtils.splEscape(this.get('fillValue') || '0'),
                    condition,
                    nullCondition = splunkUtil.sprintf('isnull(%s)', fieldNameSingleQuoted),
                    emptyCondition = splunkUtil.sprintf('%s=""', fieldNameSingleQuoted),
                    bothCondition = nullCondition + ' OR ' + emptyCondition;

                switch (this.get('fillType')) {
                    case FillValues.TYPES.NULL:
                        condition = nullCondition;
                        break;
                    case FillValues.TYPES.EMPTY:
                        condition = emptyCondition;
                        break;
                    case FillValues.TYPES.BOTH:
                        condition = bothCondition;
                        break;
                }

                return splunkUtil.sprintf('if(%s, "%s", %s)', condition, fillValue, fieldNameSingleQuoted);
            },

            isDirty: function() {
                return BaseCommand.prototype.isDirty.apply(this, arguments) ||
                    // Evaluate as dirty if SPL hasn't been set yet and there is no value set for fill null value
                    // (Indicates the user just entered the editor form)
                    !this.get('spl') &&
                    !this.get('fillValue');
            }
        }, {
            blacklist: [
                {
                    selection: BaseCommand.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._RAW, ColumnModel.TYPES._TIME ]
                },
                {
                    selection: BaseCommand.SELECTION.CELL,
                    types: [ ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._RAW, ColumnModel.TYPES._TIME ]
                },
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            TYPES: TYPES,
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.FILL_VALUES,
                    fillType: TYPES.NULL
                }, BaseCommand.getDefaults());
            }
        });

        return FillValues;
    }
);