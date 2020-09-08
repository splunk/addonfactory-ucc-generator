define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'util/dataset_utils'
    ],
    function(
        $,
        _,
        BaseModel,
        BaseCommandModel,
        ColumnModel,
        datasetUtils
    ) {
        var Replace = BaseCommandModel.extend({
            _displayName: _('Replace Values').t(),
            _placeholderSPL: 'replace',

            initialize: function(attributes, options) {
                BaseCommandModel.prototype.initialize.apply(this, arguments);
            },

            // Create an editor value to start the user off based on their selection
            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};

                if (!this.editorValues.length) {
                    if (initialStateOptions.selectionValue) {
                        this.editorValues.reset([{
                            oldValue: initialStateOptions.isText ?
                                '*' + initialStateOptions.selectionValue + '*' :
                                initialStateOptions.selectionValue,
                            newValue: ''
                        }]);
                    } else {
                        this.editorValues.reset([{
                            oldValue: '',
                            newValue: ''
                        }]);
                    }
                }
            },
            
            defaults: function() {
                return Replace.getDefaults();
            },
            
            validation: {
                spl: 'validateSPL'
            },
            
            validateSPL: function (value, attr, options) {
                var allOldValues = this.editorValues.pluck('oldValue'),
                    errorString = this.validateForTypes(this.getWhitelistedTypes()),
                    currentEditorValue,
                    oldValue,
                    newValue;
                
                if (!this.hasValidRequiredColumn()) {
                    return _('Select a field with values you want to replace.').t();
                }

                if (this.editorValues.length === 0) {
                    return _('Add one or more values.').t();
                }

                if (errorString) {
                    return errorString;
                }

                for (var i = 0; i < this.editorValues.length; i++) {
                    currentEditorValue = this.editorValues.at(i);
                    oldValue = currentEditorValue.get('oldValue');
                    newValue = currentEditorValue.get('newValue');

                    if (_.isEmpty(oldValue) && _.isEmpty(newValue)) {
                        return _('For each replacement, either a current value or a new value must be defined.').t();
                    }
                }

                if (_.uniq(allOldValues).length < allOldValues.length) {
                    return _('You cannot have two or more duplicated current values.').t();
                }
            },
            
            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Replace must be in a valid state before you can generate SPL.');
                }
                
                var spl = 'replace ',
                    requiredColumn = this.requiredColumns.at(0),
                    field = this.getFieldNameFromGuid(requiredColumn.id, { doubleQuoteWrap: true }),
                    valuesArray = this.editorValues.map(function(editorValue) {
                        var oldValue = datasetUtils.splEscape(editorValue.get('oldValue') || ''),
                            newValue = datasetUtils.splEscape(editorValue.get('newValue') || '');

                        return '"' + oldValue + '" with "' + newValue  + '"';
                    }.bind(this));
                
                return spl + valuesArray.join(', ') + ' in ' + field;
            }

        }, {
            blacklist: [
                {
                    selection: BaseCommandModel.SELECTION.TEXT,
                    types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES._TIME, ColumnModel.TYPES.EPOCH_TIME ]
                },
                {
                    selection: BaseCommandModel.SELECTION.CELL,
                    types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES._TIME, ColumnModel.TYPES.EPOCH_TIME ]
                },
                {
                    selection: BaseCommandModel.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES._TIME, ColumnModel.TYPES.EPOCH_TIME ]
                },
                { selection: BaseCommandModel.SELECTION.MULTICOLUMN },
                { selection: BaseCommandModel.SELECTION.TABLE }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommandModel.REPLACE
                }, BaseCommandModel.getDefaults());
            }
        });

        return Replace;
    }
);
