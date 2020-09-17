define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'splunk.util'
    ],
    function(
        $,
        _,
        BaseCommand,
        ColumnModel,
        splunkUtils
    ) {
        var Join = BaseCommand.extend({
            _displayName: _('Lookup').t(),
            _placeholderSPL: 'lookup',

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },

            defaults: function() {
                return Join.getDefaults();
            },

            getFieldsToAddAsArray: function() {
                return this.get('fieldsToAdd');
            },

            // Join's kind of weird in that the user doesn't actually define the field names coming into the table,
            // unlike all other commands. So, the user has no clue what to do when their fields collide.
            // Especially true when joining from the same lookup twice. See SPL-124640.
            validateCollisionFields: function() {
                var collisionFields = this.get('collisionFields');

                if (collisionFields && collisionFields.length) {
                    return splunkUtils.sprintf(_('You cannot add the following fields from your lookup because they already exist in your table: %s. Rename the existing fields and try again.').t(), collisionFields.join(', '));
                }
            },

            validateSPL: function(value, attr, options) {
                var errorString = this.validateForTypes(this.getWhitelistedTypes()),
                    hasIncompleteFieldPair;

                if (!this.get('datasetNameToJoin')) {
                    return _('Select a lookup.').t();
                }

                if (!this.hasValidRequiredColumn()) {
                    return _('Provide one or more field pairs. They define the common fields in the table and lookup.').t();
                }

                hasIncompleteFieldPair = this.requiredColumns.any(function(requiredColumn) {
                    return !(requiredColumn.get('columnToJoinWith'));
                }, this);
                if (hasIncompleteFieldPair) {
                    return _('One or more of your field pairs is incomplete.').t();
                }

                if (_.isEmpty(this.get('fieldsToAdd'))) {
                    return _('Provide one or more fields to add to the table.').t();
                }

                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Join must be in a valid state before you can generate SPL.');
                }
                
                var columnFromTable,
                    columnFromDataset,
                    base = 'lookup ',
                    datasetName = '"' + this.get('datasetNameToJoin') + '" ',
                    conditions = this.requiredColumns.map(function(column) {
                            columnFromTable = this.getFieldNameFromGuid(column.get('id'));
                            columnFromDataset = column.get('columnToJoinWith');

                            return (columnFromTable === columnFromDataset) ?
                                '"' + columnFromTable + '"' :
                                '"' + columnFromDataset + '" as "' + columnFromTable + '"';
                        }, this).join(', '),
                    output = ' OUTPUT ',
                    fieldsToAdd = this.get('fieldsToAdd') && this.get('fieldsToAdd').map(function(field) {
                            return '"' + field + '"'; 
                        }).join(', ');

                return base + datasetName + conditions + output + fieldsToAdd;
            }

        }, {
            blacklist: [
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
                    type: BaseCommand.JOIN
                }, BaseCommand.getDefaults());
            }
        });

        return Join;
    }
);
