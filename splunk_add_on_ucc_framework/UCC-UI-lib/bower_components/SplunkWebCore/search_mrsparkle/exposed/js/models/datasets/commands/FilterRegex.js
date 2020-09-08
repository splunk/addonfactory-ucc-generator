define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'models/datasets/Column'
    ],
    function(
        $,
        _,
        BaseCommand,
        ColumnModel
    ) {
        var FilterRegex = BaseCommand.extend({
            _displayName: _('Filter with Regex').t(),
            _placeholderSPL: 'regex',
            isSearchPoint: true,
            _useAST: true,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL'
            },

            defaults: function() {
                return FilterRegex.getDefaults();
            },

            validateSPL: function(value, attr, option) {
                var astError = this.ast && this.ast.error.get('messages'),
                    astSources = this.ast && this.ast.get('ast') && this.ast.get('ast').sources,
                    errorString = this.validateForTypes(this.getWhitelistedTypes());

                if (!this.hasValidRequiredColumn()) {
                    return _('Select a field to filter on.').t();
                }

                if (_.isEmpty(this.get('regex'))) {
                    return _('A regex must be provided.').t();
                }

                if (astError && astError.length) {
                    return astError[0].message;
                }

                // If sources has stuff in it, then that means the user piped to another command.
                // Easier to go through the AST here instead of trying to do any parsing ourselves.
                if (astSources && astSources.length > 0) {
                    return _('Pipes to other Splunk commands are not allowed.').t();
                }

                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('FilterRegex must be in a valid state before you can generate SPL.');
                }

                var requiredColumnId = this.requiredColumns.first().id,
                    fieldName = this.getFieldNameFromGuid(requiredColumnId, { doubleQuoteWrap: true }),
                    regex = this.get('regex');

                return 'regex ' + fieldName + '="' + regex + '"';
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._TIME, ColumnModel.TYPES.EPOCH_TIME ]
                },
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.CELL,
                    types: [ ColumnModel.TYPES._TIME, ColumnModel.TYPES.EPOCH_TIME ]
                }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.FILTER_REGEX
                }, BaseCommand.getDefaults());
            }
        });
        
        return FilterRegex;
    }
);