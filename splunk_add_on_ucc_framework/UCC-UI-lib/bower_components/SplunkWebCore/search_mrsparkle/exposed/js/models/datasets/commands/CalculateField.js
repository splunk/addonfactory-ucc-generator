define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'splunk.util'
    ],
    function(
        $,
        _,
        BaseCommand,
        ColumnModel,
        splunkUtil
        ) {
        var CalculateField =  BaseCommand.extend({
            _displayName: _('Calculate Field').t(),
            _placeholderSPL: 'eval',
            _advancedCommand: BaseCommand.EVAL,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            defaults: function() {
                return CalculateField.getDefaults();
            },

            validation: {
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },

            setInitialState: function() {
                this.updateRequiredColumns();
            },

            validateSPL: function(value, attr, option) {
                var newFieldName = this.get('newFieldName'),
                    operator = this.get('operator'),
                    invalidFieldMessage = this.validateFieldName(newFieldName),
                    errorString = this.validateForTypes(this.getWhitelistedTypes()),
                    invalidEditorMessage;

                // Verify there is a valid new field name
                if (invalidFieldMessage) {
                    return invalidFieldMessage;
                }

                if (errorString) {
                    return errorString;
                }

                // Verify that each editor value in turn has the correct values
                this.editorValues.find(function(editorValue) {
                    var columnGuid = editorValue.get('columnGuid'),
                        valueInput = editorValue.get('valueInput');

                    if (!_.isUndefined(columnGuid) && !_(this.columns.pluck('id')).contains(columnGuid)) {
                        invalidEditorMessage = _("Select a numeric field.").t();
                    } else if (_.isUndefined(columnGuid) && !_.isNumber(valueInput)) {
                        invalidEditorMessage = _("Enter a numeric value.").t();
                    }

                    if (invalidEditorMessage) {
                        return true;
                    }
                }.bind(this));

                // Return the message from searching through the editor values
                if (invalidEditorMessage) {
                    return invalidEditorMessage;
                }

                // Verify there are either a single numeric value or 2 values to operate on if the first value is a field
                if (this.editorValues.length === 0) {
                    return _('Add a numeric value.').t();
                } else if (this.editorValues.length === 1 && this.editorValues.at(0).get('columnGuid')) {
                    return _('You are operating on a numeric field.  Add a second numeric field or value.').t();
                }

                // Verify there is an operator selected
                if (!operator && this.editorValues.length > 1) {
                    return _('Select an arithmetic operator.').t();
                }
            },

            getEditorValueAtIndex: function(index) {
                var editorValueModel = this.editorValues.at(index),
                    editorValue,
                    modelGuid;

                if (!editorValueModel) {
                    return '';
                }

                modelGuid = editorValueModel.get('columnGuid');
                
                if (modelGuid) {
                    editorValue = this.getFieldNameFromGuid(modelGuid, { singleQuoteWrap: true });
                } else {
                    editorValue = editorValueModel.get('valueInput');
                    if (!_.isUndefined(editorValue)) {
                        editorValue += '';
                    }
                }
                    
                return editorValue || '';
            },

            isFieldRow: function(editorValue) {
                return !!_.isString(editorValue.get('columnGuid'));
            },

            // Need to refresh the required columns on editor value changes
            updateRequiredColumns: function() {
                // Call set with the array of values,
                this.requiredColumns.set(
                    _.map(this.editorValues.pluck('columnGuid'), function(id) {
                        return {
                            id: id
                        };
                    })
                );
            },

            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Calculate Field must be in a valid state before you can generate SPL.');
                }

                var newFieldName = this.get('newFieldName'),
                    expression = this.getExpression();

                return 'eval "' + newFieldName + '" = ' + expression;
            },

            getAdvancedCommandAttributes: function() {
                return {
                    newFieldName: this.get('newFieldName'),
                    expression: this.getExpression()
                };
            },

            getExpression: function() {
                var expression = this.getEditorValueAtIndex(0) || '\'\'',
                    secondValue,
                    operator;

                if (this.editorValues.length > 1) {
                    secondValue = this.getEditorValueAtIndex(1) || '\'\'';
                    operator = this.get('operator');
                    expression += ' ' + operator + ' ' + secondValue;
                }

                return expression;
            }
        }, {
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.CALCULATE_FIELD,
                    newFieldName: ''
                }, BaseCommand.getDefaults());
            },
            // Blacklist is purposely empty; you can add a calculated field regardless of selection
            blacklist: []
        });

        return CalculateField;
    }
);
