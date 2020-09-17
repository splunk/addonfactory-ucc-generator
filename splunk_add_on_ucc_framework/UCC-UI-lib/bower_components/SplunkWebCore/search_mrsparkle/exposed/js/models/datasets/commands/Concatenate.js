define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'util/dataset_utils',
        'util/general_utils'
    ],
    function(
        $,
        _,
        BaseCommand,
        datasetUtils,
        generalUtils
    ) {
        var Concatenate = BaseCommand.extend({
            _displayName: _('Concatenate').t(),
            _placeholderSPL: 'eval',
            _advancedCommand: BaseCommand.EVAL,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);

                this._editorValueId = 1;
            },

            // Create an editor value for each requiredColumn
            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};

                if (!this.editorValues.length) {
                    this.requiredColumns.each(function(requiredColumn) {
                        this.editorValues.add({ columnGuid: requiredColumn.id });
                    }, this);
                }
            },

            defaults: function() {
                return Concatenate.getDefaults();
            },

            validation: {
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },

            // Asking for an editor value ID increments the internal counter.
            // This helps the editor values' sort order in the command editor.
            getUniqueEditorValueId: function() {
                var editorValueId = this._editorValueId;
                this._editorValueId++;
                return editorValueId.toString();
            },

            editorValueIsText: function(editorValue) {
                return _.isUndefined(editorValue.get('columnGuid'));
            },

            validateSPL: function(value, attr, option) {
                var newFieldName = this.get('newFieldName'),
                    editorValue,
                    invalidFieldMessage = this.validateFieldName(newFieldName),
                    i = 0;


                if (invalidFieldMessage) {
                    return invalidFieldMessage;
                }

                if (this.editorValues.length < 2) {
                    return _('Select at least two fields or text strings to concatenate.').t();
                }

                for (; i < this.editorValues.length; i++) {
                    editorValue = this.editorValues.at(i);

                    if (this.editorValueIsText(editorValue) && !editorValue.get('text').length) {
                        return _('One or more of your strings is empty.').t();
                    }

                    if (!this.editorValueIsText(editorValue) &&
                            _.isUndefined(this.getFieldNameFromGuid(editorValue.get('columnGuid')))) {
                        return _('One or more fields to concatenate have been removed.').t();
                    }
                }
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Concatenate must be in a valid state before you can generate SPL.');
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
                var text,
                    fieldName;

                return this.editorValues.map(function(editorValue) {
                    if (this.editorValueIsText(editorValue)) {
                        return '"' + datasetUtils.splEscape(editorValue.get('text') || '') + '"';
                    } else {
                        fieldName = this.getFieldNameFromGuid(editorValue.get('columnGuid'), { singleQuoteWrap: true }) || '\'\'';
                        // If you concatenate two fields, and one of the values in either field is null, the result
                        // is null. We don't want that, we just want the null to be treated as an empty string.
                        return 'if(isnull(' + fieldName + '), "", ' + fieldName + ')';
                    }
                }, this).join('.');
            },

            isDirty: function(commandPristine) {
                var workingAttributes = generalUtils.stripUndefinedAttrs(this.toJSON()),
                    pristineAttributes = generalUtils.stripUndefinedAttrs(commandPristine.toJSON());

                // The "id" attribute on each of the editor values is just used for jQueryUI's sorting and
                // shouldn't be used for comparison at all.
                _.each(workingAttributes.editorValues, function(editorValue) {
                    delete editorValue.id;
                }, this);
                _.each(pristineAttributes.editorValues, function(editorValue) {
                    delete editorValue.id;
                }, this);

                return !(_.isEqual(workingAttributes, pristineAttributes));
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.CELL },
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.CONCATENATE
                }, BaseCommand.getDefaults(overrides));
            }
        });
        
        return Concatenate;
    }
);
