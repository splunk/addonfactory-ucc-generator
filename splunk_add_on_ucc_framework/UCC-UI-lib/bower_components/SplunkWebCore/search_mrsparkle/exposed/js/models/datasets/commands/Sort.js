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
        var Sort = BaseCommand.extend({
            _displayName: _('Sort').t(),
            _placeholderSPL: 'sort',

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            // Set the order to the default one passed in on every required column
            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};

                this.requiredColumns.each(function(requiredColumn) {
                    if (!requiredColumn.get('order')) {
                        requiredColumn.set('order', initialStateOptions.order);
                    }
                }, this);
            },

            defaults: function() {
                return Sort.getDefaults();
            },
            
            validation: {
                spl: 'validateSPL'
            },
            
            validateSPL: function(value, attr, option) {
                var errorString = this.validateForTypes(this.getWhitelistedTypes());
                if (!this.hasValidRequiredColumn()) {
                    return _('Add one or more fields.').t();
                }
                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Sort must be in a valid state before you can generate SPL.');
                }
                
                // Add '-' prefix to field names if order is descending
                // Could add '+' if order is ascending, but leaving it out as it isn't necessary
                var fieldStringArray = this.requiredColumns.map(function(requiredColumn) {
                    return (requiredColumn.get('order') === 'descending' ? '-' : '') + this.getFieldNameFromGuid(requiredColumn.id, { doubleQuoteWrap: true });
                }.bind(this));

                return 'sort ' + fieldStringArray.join(', ');
            }

        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.CELL },
                {
                    selection: BaseCommand.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._RAW ]
                },
                { selection: BaseCommand.SELECTION.TEXT },
                {
                    selection: BaseCommand.SELECTION.MULTICOLUMN,
                    types: [ ColumnModel.TYPES._RAW ]
                }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.SORT,
                    isComplete: true
                }, BaseCommand.getDefaults());
            }
        });
        
        return Sort;
    }
);
