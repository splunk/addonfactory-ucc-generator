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
        var RemoveFields = BaseCommand.extend({
            _displayName: _('Remove Fields').t(),
            _placeholderSPL: 'fields -',

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            defaults: function() {
                return RemoveFields.getDefaults();
            },

            validation: {
                spl: 'validateSPL'
            },

            validateSPL: function(value, attr, options) {
                var errorString = this.validateForTypes(this.getWhitelistedTypes());
                if (!this.hasValidRequiredColumn()) {
                    return _('Select one or more fields.').t();
                }
                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('RemoveFields must be in a valid state before you can generate SPL.');
                }

                var currentColumnIds = this.requiredColumns.pluck('id'),
                    // Work off the previous command, if passed in
                    // If we don't have a previous command, but we are already part of the commands collection,
                    // we can use the collection to get the previous columns (our field we will or have removed may not be in the
                    // current working commands column collection)
                    workingCommand = options.previousCommand || (this.collection && this.collection.getPreviousCommand(this)) || this,
                    // Get the fields, being sure to strip out any undefineds that come back.
                    fieldsStr = _(workingCommand.convertGuidsToFields(currentColumnIds, {
                        doubleQuoteWrap: true})).reject(function(fieldName) {
                            return _.isUndefined(fieldName);
                        }.bind(this)).join(', ');
                return 'fields - ' + fieldsStr;
            },

            filterRemovedColumns: function(idsToRemove) {
                return this.getPreviousColumns().filter(function(column) {
                    return !_.contains(idsToRemove, column.id);
                }.bind(this));
            },

            applyChangesToColumns: function(values, options) {
                this.columns.remove(values.selectedColumns);
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
                {
                    selection: BaseCommand.SELECTION.MULTICOLUMN,
                    types: [ ColumnModel.TYPES._TIME ]
                }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.REMOVE,
                    isComplete: true
                }, BaseCommand.getDefaults());
            }
        });

        return RemoveFields;
    }
);
