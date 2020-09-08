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
        var DELIMITERS = {
            SPACE: '\\s',
            COMMA: ',',
            TAB: '\\t',
            PIPE: '|'
        };

        var Split = BaseCommand.extend({
            _displayName: _('Split Fields').t(),
            _placeholderSPL: 'eval',

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};

                // Enforce a minimum of 2 output fields
                while (this.editorValues.length < 2) {
                    this.editorValues.add({ name: '' });
                }
            },

            defaults: function() {
                return Split.getDefaults();
            },

            validation: {
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },

            getFieldsToAddAsArray: function() {
                return this.editorValues.pluck('name');
            },

            validateSPL: function(value, attr, option) {
                var invalidFieldMessage,
                    fieldNames = this.editorValues.pluck('name'),
                    errorString = this.validateForTypes(this.getWhitelistedTypes());

                if (!this.hasValidRequiredColumn()) {
                    return _('Select a field to split.').t();
                }

                if (this.editorValues.length < 2) {
                    return _('You must have at least two new fields.').t();
                }

                if (errorString) {
                    return errorString;
                }

                this.editorValues.find(function(editorValue) {
                    var fieldName = editorValue.get('name');
                    invalidFieldMessage = this.validateFieldName(fieldName);
                    return invalidFieldMessage !== undefined;
                }, this);

                if (invalidFieldMessage) {
                    return invalidFieldMessage;
                }

                // Prevent duplicate new field names
                if (_.uniq(fieldNames).length < fieldNames.length) {
                    return _('Field names must be unique.').t();
                }

                if (this.get('delimiter') === undefined || this.get('delimiter') === "") {
                    return _('Define a delimiter.').t();
                }
            },

            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Split must be in a valid state before you can generate SPL.');
                }

                var rexOriginalField = this.getFieldNameFromGuid(this.requiredColumns.first().id, {doubleQuoteWrap: true}),
                    splitOriginalField = this.getFieldNameFromGuid(this.requiredColumns.first().id, {singleQuoteWrap: true}),
                    useDefaultDelimiters = (this.get('delimiterFromPicker') !== ''),
                    delimiter = this.get('delimiter') || '',
                    useRex = useDefaultDelimiters && (delimiter === DELIMITERS.TAB || delimiter === DELIMITERS.SPACE),
                    fieldsSPL;

                if (useRex) {
                    fieldsSPL = this.editorValues.map(function(newField, i) {
                        // Because \t and \s are escaped special characters, they need to be interpreted as regexes.
                        return '(?<"' + newField.get('name') + '">[^' + delimiter + ']*)?';
                    }, this).join(delimiter + '?');

                    return 'rex field=' + rexOriginalField + ' "' + fieldsSPL + '"';
                } else {
                    delimiter = datasetUtils.splEscape(delimiter);
                    fieldsSPL = this.editorValues.map(function(newField, i) {
                        // We must call split() on each individual output field, rather than call them once and store
                        // the output in a temporary field before calling mvindex(), because a temp field may have field
                        // collision implications and clutter the field space.
                        return newField.get('name') + '=mvindex(split(' + splitOriginalField + ', "' + delimiter + '"),' + i + ')';
                    }, this).join(', ');

                    return 'eval ' + fieldsSPL;
                }
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.CELL },
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.TEXT },
                {
                    selection: BaseCommand.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._TIME ]
                },
                { selection: BaseCommand.SELECTION.MULTICOLUMN }
            ],
            DELIMITERS: DELIMITERS,
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.SPLIT,
                    delimiter: DELIMITERS.SPACE
                }, BaseCommand.getDefaults());
            }
        });

        return Split;
    }
);
