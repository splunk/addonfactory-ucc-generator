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
        var Rangemap = BaseCommand.extend({
            _displayName: _('Map Ranges').t(),
            _placeholderSPL: 'eval',

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            // Create an editor value to start the user off based on their selection
            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};

                var selectionValue = parseInt(initialStateOptions.selectionValue, 10),
                    lowerLimit = '',
                    upperLimit = '';

                if (!this.editorValues.length) {
                    if (selectionValue && selectionValue > 0) {
                        lowerLimit = 0;
                        upperLimit = selectionValue;
                    } else if (selectionValue && selectionValue < 0) {
                        lowerLimit = selectionValue;
                        upperLimit = 0;
                    }

                    this.editorValues.add({
                        value: '',
                        lowerLimit: lowerLimit,
                        upperLimit: upperLimit
                    });
                }
            },

            validation: {
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },

            defaults: function() {
                return Rangemap.getDefaults();
            },

            validateSPL: function() {
                var currentRangeValue,
                    lowerLimit,
                    upperLimit,
                    value,
                    newFieldName = this.get('newFieldName'),
                    errorString = this.validateForTypes(this.getWhitelistedTypes()),
                    invalidFieldMessage = this.validateFieldName(newFieldName);

                if (!this.hasValidRequiredColumn()) {
                    return _('Select one numerical field to map ranges.').t();
                }
                
                if (errorString) {
                    return errorString;
                }

                if (this.editorValues.length === 0) {
                    return _("Provide at least one range.").t();
                }

                if (invalidFieldMessage) {
                    return invalidFieldMessage;
                }

                for (var i = 0; i < this.editorValues.length; i++) {
                    currentRangeValue = this.editorValues.at(i);
                    lowerLimit = currentRangeValue.get('lowerLimit');
                    upperLimit = currentRangeValue.get('upperLimit');
                    value = currentRangeValue.get('value');

                    if (!datasetUtils.isNumber(lowerLimit)) {
                        return _("Provide a numeric lower range limit.").t();
                    }
                    if (!datasetUtils.isNumber(upperLimit)) {
                        return _("Provide a numeric upper range limit.").t();
                    }
                    if (parseInt(lowerLimit, 10) >= parseInt(upperLimit, 10)) {
                        return _("Each upper range limit must be greater than its corresponding lower range limit.").t();
                    }
                    if (!value) {
                        return _("Specify a value for each range.").t();
                    }
                }
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Rangemap must be in a valid state before you can generate SPL.');
                }
                
                // Example SPL: eval range=case(bytes>=1 AND bytes <=30, "green", bytes>=31 AND bytes <=39,
                // "blue", bytes>=40 AND bytes <=41, "red", 1=1, "gray"), where 1=1 denotes the default
                var requiredField = this.requiredColumns.first(),
                    requiredFieldGuid = requiredField && requiredField.get('id'),
                    fieldName = this.getFieldNameFromGuid(requiredFieldGuid, { singleQuoteWrap: true }),
                    newFieldName = this.get('newFieldName'),
                    defaultValue = datasetUtils.splEscape(this.get('defaultValue') || ''),
                    rangesString;

                rangesString = this.editorValues.map(function(rangeValue) {
                    var lowerLimit = rangeValue.get('lowerLimit'),
                        upperLimit = rangeValue.get('upperLimit'),
                        value = datasetUtils.splEscape(rangeValue.get('value'));

                    return fieldName + '>=' + lowerLimit + ' AND ' + fieldName + '<=' + upperLimit + ', "' + value + '"';
                }, this).join(', ');

                if (!_.isEmpty(defaultValue)) {
                    rangesString += ', 1=1, "' + defaultValue + '"';
                }

                return 'eval "' + newFieldName + '"=case(' + rangesString + ')';
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
                {
                    selection: BaseCommand.SELECTION.CELL,
                    types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES.BOOLEAN, ColumnModel.TYPES.STRING,
                        ColumnModel.TYPES.IPV4, ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._TIME ]
                },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.RANGEMAP
                }, BaseCommand.getDefaults());
            }
        });

        return Rangemap;
    }
);
