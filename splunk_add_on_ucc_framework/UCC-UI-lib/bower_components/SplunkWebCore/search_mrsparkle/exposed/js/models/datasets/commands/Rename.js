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
        var Rename = BaseCommand.extend({
            _displayName: _('Rename Field').t(),
            _placeholderSPL: "rename",
            
            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            // Set the newFieldName to be the old field name
            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};

                if (!this.get('newFieldName')) {
                    if (!initialStateOptions.columnName) {
                        throw new Error('No column name passed into Rename\'s setInitialState');
                    }

                    if (datasetUtils.isValidFieldName(initialStateOptions.columnName)) {
                        this.set('newFieldName', initialStateOptions.columnName);
                    }
                }
            },

            defaults: function() {
                return Rename.getDefaults();
            },
            
            validation: {
                spl: 'validateSPL',
                collisionFields: 'validateCollisionFields'
            },
            
            validateSPL: function (value, attr, options) {
                var newFieldName = this.get('newFieldName'),
                    invalidFieldMessage = this.validateFieldName(newFieldName),
                    errorString = this.validateForTypes(this.getWhitelistedTypes());

                if (!this.hasValidRequiredColumn()) {
                    return _('Select a field to rename.').t();
                }

                if (invalidFieldMessage) {
                    return invalidFieldMessage;
                }

                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Rename must be in a valid state before you can generate SPL.');
                }
                
                var requiredColumn = this.requiredColumns.at(0),
                    previousCommand = options.previousCommand || this.collection.getPreviousCommand(this);

                return 'rename ' + previousCommand.getFieldNameFromGuid(requiredColumn.id, { doubleQuoteWrap: true }) + ' AS "' + this.get('newFieldName') + '"';
            },

            getOriginalColumnName: function(commandPristine) {
                var previousCommand = commandPristine.collection.getPreviousCommand(commandPristine),
                    requiredColumn = this.requiredColumns.at(0) || {};
                return previousCommand.getFieldNameFromGuid(requiredColumn.id);
            },

            isDirty: function(commandPristine) {
                // We pre-populate newName on the inmem command model with the current name of the column,
                // which makes the inmem model look different from the pristine. isDirty would then report
                // "true", which isn't right, so we'll override isDirty here to ignore that case.
                var hasDefaultName = this.get('newFieldName') === this.getOriginalColumnName(commandPristine);
                if (commandPristine.get('newFieldName') === undefined && hasDefaultName) {
                    return false;
                }
                return BaseCommand.prototype.isDirty.apply(this, arguments);
            },
            
            setFromCommandJSON: function(jsonPayload, options) {
                var requiredColumn = this.requiredColumns.at(0) || {};
                
                options = options || {};
                
                // In the case of a removed command before a rename we need to ensure that 
                // we do not clobber the new name of the column in this command.
                
                if (options.commandRemoval && jsonPayload && jsonPayload.columns) {
                    // clone the jsonPayload because we are going to be altering it
                    jsonPayload = $.extend(true, {}, jsonPayload);
                    // clone the options because we are going to be changing them
                    options = $.extend(true, {}, options);
                    // no need to clone again
                    options.skipClone = true;
                    
                    // Because the rename command is special in that it creates the location
                    // where a column is considered touched then we should respect the state
                    // of its required column.
                    jsonPayload.columns = _.filter(jsonPayload.columns, function(column){
                        return (column.id !== requiredColumn.id);
                    }.bind(this));
                }
                
                return BaseCommand.prototype.setFromCommandJSON.call(this, jsonPayload, options);
            }

        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.CELL },
                { selection: BaseCommand.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES._TIME ]
                },
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}),  {
                    type: BaseCommand.RENAME
                }, BaseCommand.getDefaults());
            }
        });

        return Rename;
    }
);
