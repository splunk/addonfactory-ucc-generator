define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'util/dataset_utils'
    ],
    function(
        $,
        _,
        BaseCommand,
        ColumnModel,
        datasetUtils
    ) {
        var ExtractDateTime = BaseCommand.extend({
            _displayName: _("Format Timestamp").t(),
            _placeholderSPL: "eval",
            _advancedCommand: BaseCommand.EVAL,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },
            
            defaults: function() {
                return ExtractDateTime.getDefaults();
            },

            validation: {
                newFieldName: {
                    required: true,
                    msg: _("Provide a new field name.").t()
                },
                formatPattern: {
                    required: true,
                    msg: _("Select a format.").t()
                },
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },
            
            validateSPL: function(value, attr, option) {
                var newFieldName = this.get('newFieldName'),
                    formatPattern = this.get('formatPattern'),
                    errorString = this.validateForTypes(this.getWhitelistedTypes()),
                    invalidFieldMessage = this.validateFieldName(newFieldName);

                if (invalidFieldMessage) {
                    return invalidFieldMessage;
                }
                
                if (!formatPattern) {
                    return _("Select a predefined format or enter a custom pattern.").t();
                }

                if (!this.hasValidRequiredColumn()) {
                    return _("Provide an epoch time field, such as _time.").t();
                }
                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('ExtractDateTime must be in a valid state before you can generate SPL.');
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
                var formatPattern = datasetUtils.splEscape(this.get('formatPattern') || ''),
                    field = this.hasValidRequiredColumn() ?
                        this.getFieldNameFromGuid(this.requiredColumns.first().id, { singleQuoteWrap: true }) :
                        '\'\'';

                return 'strftime(' + field + ', "' + formatPattern + '")';
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.CELL },
                {
                    selection: BaseCommand.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES.STRING, ColumnModel.TYPES.NUMBER, ColumnModel.TYPES.BOOLEAN, ColumnModel.TYPES.IPV4 ]
                },
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.EXTRACT_DATE_TIME
                }, BaseCommand.getDefaults());
            }
        });

        return ExtractDateTime;
    }
);
