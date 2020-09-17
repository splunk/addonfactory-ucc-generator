define(
    [
        'underscore',
        'models/datasets/commands/Base'
    ],
    function(
        _,
        BaseCommandModel
    ) {
        var Where = BaseCommandModel.extend({
            _displayName: _('Filter (Advanced)').t(),
            _placeholderSPL: 'where',
            _useAST: true,
            isSearchPoint: true,

            initialize: function(attributes, options) {
                BaseCommandModel.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL'
            },

            defaults: function() {
                return Where.getDefaults();
            },

            validateSPL: function(value, attr, option) {
                var expression = (this.get('expression') || "").trim();

                // Make sure we have a valid string
                if (!_.isString(expression) || !expression.length) {
                    return _('Provide a where expression.').t();
                }

                return this.validateASTErrors() || this.validatePipes();
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Where must be in a valid state before you can generate SPL.');
                }
                
                var expression = this.get('expression');
                return 'where ' + expression.trim();
            }
        }, {
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommandModel.WHERE
                }, BaseCommandModel.getDefaults());
            }
        });

        return Where;
    }
);
