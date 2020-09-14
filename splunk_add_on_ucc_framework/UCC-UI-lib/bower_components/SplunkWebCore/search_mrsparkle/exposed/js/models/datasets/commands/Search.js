define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base'
    ],
    function(
        $,
        _,
        BaseCommand
    ) {
        var Search = BaseCommand.extend({
            _displayName: _('Search').t(),
            _placeholderSPL: 'search',
            isSearchPoint: true,
            _useAST: true,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            // Set the initial search for the user based on their selection
            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};

                var initialSearch = '';

                if (!this.get('expression')) {
                    if (initialStateOptions.columnName) {
                        initialSearch += '"' + initialStateOptions.columnName + '"=';
                    }

                    if (initialStateOptions.selectionValue) {
                        if (initialStateOptions.isText) {
                            initialSearch += '*' + initialStateOptions.selectionValue + '*';
                        } else {
                            initialSearch += initialStateOptions.selectionValue;
                        }
                    }

                    this.set('expression', initialSearch);
                }

                this.updateRequiredColumns();
            },

            defaults: function() {
                return Search.getDefaults();
            },

            validation: {
                spl: 'validateSPL'
            },

            validateSPL: function(value, attr, option) {
                var expression = this.get('expression');

                if (_.isUndefined(expression) || /^\s*$/.test(expression)) {
                    return _('Provide a search string.').t();
                }

                return this.validateASTErrors() || this.validatePipes() || this.validateReferencedFieldsExistence();
            },

            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Search must be in a valid state before you can generate SPL.');
                }

                return 'search ' + this.get('expression').trim();
            },

            updateRequiredColumns: function() {
                this.updateRequiredColumnsFromReferencedASTFields();
            }
        }, {
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.SEARCH
                }, BaseCommand.getDefaults());
            }
        });
        
        return Search;
    }
);
