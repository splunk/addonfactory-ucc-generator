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
        var Eval = BaseCommand.extend({
            _displayName: _('Eval').t(),
            _placeholderSPL: 'eval',
            _useAST: true,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },

            defaults: function() {
                return Eval.getDefaults();
            },

            validateSPL: function(value, attr, option) {
                var fieldName = this.get('newFieldName'),
                    expression = this.get('expression'),
                    invalidFieldMessage = this.validateFieldName(fieldName);

                if (invalidFieldMessage && !this.columns.findWhere({ name: fieldName })) {
                    return invalidFieldMessage;
                }

                if (_.isUndefined(expression) || /^\s*$/.test(expression)) {
                    return _('Provide an eval expression.').t();
                }

                return this.validateASTErrors() || this.validatePipes() || this.validateReferencedFieldsExistence();
            },

            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Eval must be in a valid state before you can generate SPL.');
                }

                return 'eval "' + this.get('newFieldName') + '"=' + this.get('expression').trim();
            },

            updateRequiredColumns: function() {
                this.updateRequiredColumnsFromReferencedASTFields();
            },
            
            propagateColumnRemove: function(removedColumn, options) {
                if (removedColumn.get('name') === this.get('newFieldName')) {
                    // we do not want to propagate the removal of this column because the user has hand-written
                    // the column name into a text box
                    return;
                }
                
                return BaseCommand.prototype.propagateColumnRemove.apply(this, arguments);
            }
        }, {
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.EVAL,
                    newFieldName: ''
                }, BaseCommand.getDefaults());
            }
        });

        return Eval;
    }
);
