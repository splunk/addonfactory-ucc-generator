define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'util/dataset_utils'
    ],
    function(
        $,
        _,
        BaseCommand,
        datasetUtils
    ) {
        var EvalExistingField = BaseCommand.extend({
            _displayName: _('Eval').t(),
            _placeholderSPL: 'eval',
            _useAST: true,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
                
                // In this command the user has to select an existing field to operate on, but
                // then has the ability to refer to many more fields in the expression they write.
                // The fields in the expression will be added to the requiredColumns, but the first
                // requiredColumn should always be the field they have chosen to operate on. If that
                // field is removed, it should be replaced with an empty field to fail validation.
                this.requiredColumns.on('remove', function(removedColumn, updatedCollection, options) {
                   if (options.index === 0) {
                       this.requiredColumns.add({}, { at: 0 });
                   } 
                }, this);
            },

            // If we're coming from the clean menu and there's a column name, then set the newFieldName to be
            // that column name, and the eval expression to that column name wrapped in single quotes
            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};

                if (initialStateOptions.columnName) {
                    if (!this.get('expression')) {
                        this.set('expression', '\'' + initialStateOptions.columnName + '\'');
                    }
                }

                this.updateRequiredColumns();
            },

            validation: {
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },

            defaults: function() {
                return EvalExistingField.getDefaults();
            },

            validateSPL: function(value, attr, option) {
                var fieldName = this.getFieldName(),
                    expression = this.get('expression'),
                    invalidFieldMessage = this.validateFieldName(fieldName);
                
                if (!this.hasValidRequiredColumn()) {
                    return _('Select a field to eval.').t();
                }

                if (invalidFieldMessage && !this.columns.findWhere({ name: fieldName })) {
                    return invalidFieldMessage;
                }

                if (_.isUndefined(expression) || /^\s*$/.test(expression)) {
                    return _('Provide an eval expression.').t();
                }

                return this.validateASTErrors() || this.validatePipes() || this.validateReferencedFieldsExistence();
            },
            
            getFieldName: function() {
                var requiredColumn = this.requiredColumns.first();
                return requiredColumn && this.getFieldNameFromGuid(requiredColumn.id);
            },

            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Eval must be in a valid state before you can generate SPL.');
                }

                return 'eval "' + this.getFieldName() + '"=' + this.get('expression').trim();
            },

            updateRequiredColumns: function() {
                var columnsToRetain = [(this.requiredColumns.first() || {})];
                this.updateRequiredColumnsFromReferencedASTFields(columnsToRetain);
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.TABLE }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.EVAL_EXISTING_FIELD
                }, BaseCommand.getDefaults());
            }
        });

        return EvalExistingField;
    }
);
