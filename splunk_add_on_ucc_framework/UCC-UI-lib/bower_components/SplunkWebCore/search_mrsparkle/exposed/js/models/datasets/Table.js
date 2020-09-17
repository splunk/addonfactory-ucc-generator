define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'models/SplunkDBase',
        'models/ACLReadOnly',
        'models/shared/Cron',
        'models/shared/TimeRange',
        'models/services/datamodel/DataModel',
        'models/datasets/commands/Base',
        'models/datasets/commands/InitialData',
        'models/datasets/Column',
        'collections/datasets/Commands',
        'collections/datasets/Columns',
        'splunk.util'
    ],
    function(
        $,
        _,
        BaseModel,
        SplunkDBaseModel,
        ACLReadOnlyModel,
        CronModel,
        TimeRangeModel,
        DataModel,
        BaseCommand,
        InitialDataCommand,
        Column,
        CommandsCollection,
        ColumnsCollection,
        splunkUtil
    ) {
        var TableModel = DataModel.extend({
            initialize: function(attributes, options) {
                options = options || {};
                
                DataModel.prototype.initialize.call(this, attributes, options);
                
                this.commands.on('add remove reset change', this.populateTableFromCommands, this);
                this.entry.content.on('change:dataset.commands', this.populateCommandsFromTable, this);
                
                // When the attributes are passed into the constructor like in collection creation then change
                // events do not fire
                if (this.entry.content.get('dataset.commands')) {
                    this.populateCommandsFromTable();
                }
                
                this.selectedColumns.on('add remove reset change', this.populateTableFromSelectedColumns, this);
                this.entry.content.on('change:dataset.display.selectedColumns', this.populateSelectedColumnsFromTable, this);
                
                this.on('applyAction', this.populateTableFromCommands, this);
            },

            initializeAssociated: function() {
                DataModel.prototype.initializeAssociated.apply(this, arguments);
                
                // do a dynamic lookup of the current constructor so that this method is inheritance-friendly
                var RootClass = this.constructor;
                this.associated = this.associated || {};
                
                //associated
                this.commands = this.commands || new RootClass.Commands();
                this.associated.commands = this.commands;
                
                this.selectedColumns = this.selectedColumns || new RootClass.SelectedColumns();
                this.associated.selectedColumns = this.selectedColumns;
            },
            
            parse: function(response) {
                var parsedResponse = DataModel.prototype.parse.apply(this, arguments);
                
                if (this.isNew()) {
                    this.entry.content.set({
                        'dataset.type': 'table'
                    });
                }
                
                return parsedResponse;
            },
            
            parseSplunkDPayload: function(payload, options) {
                var entry = payload.entry,
                    acceleration,
                    content;
                
                if (entry && entry.length > 0 && entry[0].content) {
                    content = entry[0].content;
                    
                    if (content.acceleration) {
                        acceleration = JSON.parse(content.acceleration); // String representation of the acceleration JSON
                    }
                    
                    if (_(acceleration).isObject()) {
                        this.entry.content.acceleration.set(acceleration, $.extend({ parse: true }, options));
                    }
                }
                
                return payload;
            },

            populateCommandsFromTable: function() {
                var commands = [];
                //turn off the listener so that we don't have a circular reference
                this.commands.off('add remove reset change', this.populateTableFromCommands, this);

                //set fields into a collection (facilitates mgt)
                _.each(this.entry.content.toObject('dataset.commands') || [], function(command) {
                    commands.push(command);
                });

                this.commands.reset(commands, {parse: true});

                //turn the listener back on
                this.commands.on('add remove reset change', this.populateTableFromCommands, this);
            },

            populateTableFromCommands: function(commandModel, commands, options) {
                if (!(commands instanceof CommandsCollection) && !options) {
                    options = commands;
                }
                options = options || {};
                //turn off the listener so that we don't have a circular reference
                this.entry.content.off('change:dataset.commands', this.populateCommandsFromTable, this);

                var newCommandIdx = this.getCurrentCommandIdx(),
                    newCommand,
                    safeCommand,
                    lastCommandBeforeDisabledIndex,
                    shouldOpenEditor = 0;

                if (options.add) {
                    if (_.isNumber(options.at)) {
                        newCommandIdx = options.at;
                    } else if (_.isUndefined(newCommandIdx)) {
                        newCommandIdx = 0;
                    } else if (!_.isUndefined(this.entry.content.get('dataset.display.currentCommand'))) {
                        newCommandIdx++;
                    }
                }

                safeCommand = this.getLastSafeCommandForCommandIndex(newCommandIdx);
                // Snap to first error if there are any disabled commands
                lastCommandBeforeDisabledIndex = this.commands.indexOf(safeCommand) + 1;
                newCommandIdx = newCommandIdx > lastCommandBeforeDisabledIndex ? lastCommandBeforeDisabledIndex : newCommandIdx;
                newCommand = this.commands.at(newCommandIdx);

                if (options.forceOpenEditor || (newCommand && !newCommand.isComplete() && !newCommand.isModalized)) {
                    shouldOpenEditor = 1;
                }

                this.entry.content.set({
                    'dataset.commands': JSON.stringify(this.commands.toJSON()),
                    'dataset.display.currentCommand': newCommandIdx,
                    'dataset.display.showEditor': shouldOpenEditor
                }, options);

                //turn the listener back on
                this.entry.content.on('change:dataset.commands', this.populateCommandsFromTable, this);
            },

            populateSelectedColumnsFromTable: function() {
                var selectedColumns = [];

                this.selectedColumns.off('add remove reset change', this.populateTableFromSelectedColumns, this);

                _.each(this.entry.content.toObject('dataset.display.selectedColumns') || [], function(selectedColumn) {
                    selectedColumns.push(selectedColumn);
                });

                this.selectedColumns.set(selectedColumns);

                this.selectedColumns.on('add remove reset change', this.populateTableFromSelectedColumns, this);
            },

            populateTableFromSelectedColumns: function(selectedColumnModel, selectedColumns, options) {
                this.entry.content.off('change:dataset.display.selectedColumns', this.populateSelectedColumnsFromTable, this);

                this.entry.content.set({
                    'dataset.display.selectedColumns': JSON.stringify(this.selectedColumns.toJSON())
                });

                this.entry.content.on('change:dataset.display.selectedColumns', this.populateSelectedColumnsFromTable, this);
            },

            clearSelections: function() {
                this.selectedColumns.reset();
                // Can't set them to undefined because they'll get cleared by jQuery's extend(). Setting them to
                // empty string effectively clears them out anyway, so this is fine.
                this.entry.content.set({
                    'dataset.display.selectedColumnValue': '',
                    'dataset.display.selectedText': '',
                    'dataset.display.selectedStart': '',
                    'dataset.display.selectedEnd': '',
                    'dataset.display.selectionType': '',
                    'dataset.display.isSelectionError': ''
                });
            },

            initBaseCommand: function(values, options) {
                values = values || {};
                options = options || {};

                values.type = BaseCommand.INITIAL_DATA;
                if (!values.columns) {
                    values.columns = [];
                }

                if (!this.commands.length) {
                    this.commands.addNewCommand(values, options);
                    return true;
                }
            },

            migrateFromSearch: function(options) {
                var optionsCopy = $.extend(true, {}, (options || {})),
                    search = optionsCopy.search || this.entry.content.get('search'),
                    selectedFields = optionsCopy.selectedFields || this.entry.content.toObject('dataset.search.fields') || [],
                    columnsCollection = new ColumnsCollection(),
                    didCreateInitialDataCommand,
                    initialDataCommand;

                _.each(selectedFields, function(field) {
                    columnsCollection.addColumn({
                        columnName: field
                    });
                }, this);

                if (this.ast && !this.ast.isTransforming()) {
                    columnsCollection.setInitialColumns();
                }

                // Ensure that the commands list is already empty
                if (search && (this.commands.length === 0)) {
                    didCreateInitialDataCommand = this.initBaseCommand({
                        baseSPL: search,
                        selectedMethod: (optionsCopy.selectedMethod || InitialDataCommand.METHODS.SEARCH)
                    }, optionsCopy);
                    initialDataCommand = this.commands.first();

                    if (didCreateInitialDataCommand) {
                        initialDataCommand.columns.reset(columnsCollection.toJSON());

                        if (optionsCopy.selectedDataset) {
                            initialDataCommand.resetSelectedDataset(optionsCopy.selectedDataset);
                        }
                    }

                    // isComplete will normally be false (have to go through Initial Data) but if you extend a dataset
                    // with fixed fields, then we consider Initial Data to be complete, and we should proceed to table UI.
                    initialDataCommand.set('isComplete', optionsCopy.selectedDataset && optionsCopy.selectedDataset.isFixedFields());
                    this.entry.content.set({
                        'search': initialDataCommand.generateSPL(),
                        'dataset.commands': JSON.stringify([initialDataCommand]),
                        'dataset.display.currentCommand': 0
                    }, optionsCopy);
                }
            },

            setSelectedColumnsForNewCommandIndex: function(newCommandIdx) {
                var newCommand = this.commands.at(newCommandIdx);

                if (newCommand) {
                    // First, get rid of any selected columns that won't exist when we move to the new index
                    this.selectedColumns.reset(this.selectedColumns.filter(function(column) {
                        return newCommand.columns.findWhere({ id: column.get('id') });
                    }.bind(this)));

                    // If we don't have a valid selection after that, then reset back to the first column.
                    if (!this.hasValidSelection({ commandIndex: newCommandIdx }) && newCommand.columns.length) {
                        this.selectedColumns.reset({
                            id: newCommand.columns.first().id
                        });
                        this.entry.content.set('dataset.display.selectionType', 'column');
                    }
                }
            },

            // Make sure the model value is not undefined, null, or empty string
            valueIsVaildSelection: function(value) {
                return !(_.isUndefined(value) || _.isNull(value) ||(value === ""));
            },

            hasValidSelection: function(options) {
                options = options || {};

                var selectionType = this.entry.content.get('dataset.display.selectionType'),
                    selectedText = this.entry.content.get('dataset.display.selectedText'),
                    selectedColumnValue = this.entry.content.get('dataset.display.selectedColumnValue'),
                    selectedStart = this.entry.content.get('dataset.display.selectedStart'),
                    selectedEnd = this.entry.content.get('dataset.display.selectedEnd'),
                    selectedColumnsClone = this.selectedColumns.clone(),
                    commandModel = this.commands.at(options.commandIndex) || this.getCurrentCommandModel(),
                    hasSelectedColumnValue = this.valueIsVaildSelection(selectedColumnValue),
                    hasSelectedText = this.valueIsVaildSelection(selectedText),
                    hasSelectedStart = this.valueIsVaildSelection(selectedStart),
                    hasSelectedEnd = this.valueIsVaildSelection(selectedEnd),
                    hasTextSelection,
                    hasCellSelection,
                    hasColumnSelection,
                    hasTableSelection;

                if (!this.commands.length) {
                    return false;
                }

                selectedColumnsClone.reset(selectedColumnsClone.filter(function(column) {
                    return commandModel.columns.findWhere({ id: column.get('id') });
                }.bind(this)));

                hasTextSelection = (selectionType === 'text') && (selectedColumnsClone.length === 1) && hasSelectedColumnValue &&
                    hasSelectedText && hasSelectedStart && hasSelectedEnd;

                hasCellSelection = (selectionType === 'cell') && (selectedColumnsClone.length === 1) && hasSelectedColumnValue &&
                    !hasSelectedText && !hasSelectedStart && !hasSelectedEnd;

                hasColumnSelection = (selectionType === 'column') && selectedColumnsClone.length && !hasSelectedColumnValue &&
                    !hasSelectedText && !hasSelectedStart && !hasSelectedEnd;

                hasTableSelection = (selectionType === 'table') && !selectedColumnsClone.length && !hasSelectedColumnValue &&
                    !hasSelectedText && !hasSelectedStart && !hasSelectedEnd;

                return hasColumnSelection || hasTableSelection || hasCellSelection || hasTextSelection;
            },

            getCurrentCommandIdx: function() {
                var currentCommandIdx = parseInt(this.entry.content.get('dataset.display.currentCommand'), 10),
                    lastCommandIdx = this.commands.length - 1;

                if (_.isNaN(currentCommandIdx)) {
                    if (this.commands.length) {
                        return lastCommandIdx;
                    }
                    return undefined;
                }

                if (currentCommandIdx < 0) {
                    return 0;
                }

                if (currentCommandIdx > lastCommandIdx) {
                    if (lastCommandIdx < 0) {
                        return undefined;
                    }
                    return lastCommandIdx;
                }

                return currentCommandIdx;
            },

            getCurrentCommandModel: function() {
                return this.commands.models[this.getCurrentCommandIdx()];
            },
            
            getNearestSearchPointIdx: function(idx) {
                var currentCommandIdx = isNaN(idx) ? this.getCurrentCommandIdx() : idx;
                
                for (var i = currentCommandIdx; i >= 0; i--) {
                    if (this.commands.at(i).isSearchPoint) {
                        return i;
                    }
                }
                
                return currentCommandIdx;
            },

            // TODO: SPL-125758
            // getSearch should become an async function because updateSPL is actually async
            getSearch: function(idx, options) {
                options = options || {};
                
                var currentCommandIdx = isNaN(idx) ? this.getCurrentCommandIdx() : idx,
                    splArray = [],
                    currentCommand = this.commands.at(currentCommandIdx),
                    i = 0,
                    nearestSearchPointIdx,
                    eventsString;
                
                if (!this.commands.length) {
                    return this.entry.content.get('search') || '';
                }

                if (options.respectSearchPoints && !currentCommand.isSearchPoint) {
                    if (!options.searchPointJob) {
                        throw new Error('You must specify the searchPointJob to get the proper search.');
                    }
                    
                    if (!options.searchPointJob.prepared) {
                        throw new Error('The searchPointJob must be prepared before getting the loadjob search.');
                    }
                    
                    nearestSearchPointIdx = this.getNearestSearchPointIdx(currentCommandIdx);

                    if (this.getSearch(nearestSearchPointIdx, options) !== splunkUtil.stripLeadingSearchCommand(options.searchPointJob.getSearch())) {
                        throw new Error('The searchPointJob does not match the search for the nearest search point.');
                    }
                    
                    eventsString = options.searchPointJob.isReportSearch() ? 'false' : 'true';
                    splArray.push('| loadjob ' + options.searchPointJob.id + ' events=' + eventsString + ' require_finished=false');
                    i = nearestSearchPointIdx + 1;
                }

                for (; i <= currentCommandIdx; i++) {
                    currentCommand = this.commands.at(i);
                    if (currentCommand.isComplete()) {
                        // All commands are now updated once per page route, so none should need to updateSPL again, but
                        // I'm leaving these checks in just in case. You can also pass "forceUpdateSPL" to force an update.
                        if (options.forceUpdateSPL || currentCommand.validate() || !currentCommand.get('spl')) {
                            currentCommand.updateSPL();
                        }
                        splArray.push(currentCommand.get('spl'));
                    }
                }

                // If we're respecting search points, we need to pass in the isTransforming option
                if (options.respectSearchPoints && currentCommand.isSearchPoint && splArray.length) {
                    splArray.push(this.getDiversitySearchComponent({ isTransforming: options.isTransforming }));
                }

                return _.flatten(splArray).join(' | ').trim().replace(/\s+/g, ' ');
            },

            getFullSearch: function(options) {
                return this.getSearch(this.commands.length - 1, options);
            },

            isDirty: function(otherTable, whitelist) {
                whitelist = whitelist || TableModel.DIRTY_WHITELIST;
                return DataModel.prototype.isDirty.call(this, otherTable, whitelist);
            },
            
            isValid: function() {
                return !!(this.commands.length &&
                    !this.commands.find(
                        function(command) {
                            // The order of these checks is actually important because the
                            // Backbone.validation library will populate the command models
                            // with errors if they happen to be invalid. This is acceptable
                            // on complete commands that shouldn't be valid.
                            return !command.isComplete() || !command.isValid(true);
                        }
                    )
                );
            },

            isTableMode: function() {
                return (this.entry.content.get('dataset.display.mode') === TableModel.MODES.TABLE);
            },
            
            isDataSummaryMode: function() {
                return (this.entry.content.get('dataset.display.mode') === TableModel.MODES.DATA_SUMMARY);
            },

            getFields: function() {
                if (!this.commands.length) {
                    return [];
                }
                
                return this.commands.at(this.commands.length - 1).columns.toJSON();
            },
            
            getTypedFields: function() {
                return this.getFields();
            },
            
            getType: function() {
                return DataModel.DOCUMENT_TYPES.TABLE;
            },
            
            getDatasetDisplayType: function() {
                return TableModel.DATASET_DISPLAY_TYPES.TABLE;
            },
            
            getDescription: function() {
                return this.entry.content.get('dataset.description');
            },
            
            getFormattedName: function() {
                return this.entry.content.get('displayName');
            },

            setSelectedColumn: function(columnIndex) {
                var currentCommand = this.getCurrentCommandModel(),
                    columnGuid;

                if (columnIndex < currentCommand.columns.length) {
                    columnGuid = currentCommand.getGuidForColIndex(columnIndex);
                }

                if (columnGuid) {
                    this.selectedColumns.add({
                        id: columnGuid
                    });
                }
            },

            setSelectionTypeToColumn: function() {
                this.entry.content.set('dataset.display.selectionType', 'column');
                this.entry.content.set('dataset.display.selectedColumnValue', '');
                this.entry.content.set('dataset.display.selectedText', '');
                this.entry.content.set('dataset.display.isSelectionError', '');
                this.entry.content.set('dataset.display.selectedStart', '');
                this.entry.content.set('dataset.display.selectedEnd', '');
            },

            // This function's purpose is to find if this command is changing or adding the name of any field and,
            // if it is, finding if there are any fields in the future that are named the same. That throws us into
            // a weird state so we need to prevent against that.
            // Can pass in your own fieldsToAdd or pass in the inmem/pristine commands and this function will determine
            // the fields being added for you.
            setCollidingFieldNames: function(options) {
                options = options || {};

                var i,
                    currentCommandIndex = this.getCurrentCommandIdx(),
                    collisionFields = [],
                    fieldsToAdd,
                    currentCommand,
                    matchingColumn;

                if (options.fieldsToAdd) {
                    fieldsToAdd = options.fieldsToAdd;
                } else {
                    // We've already checked the pristine's fields to add, so we should only consider the inmem ones.
                    // The only exception to this is when setInitialState tries to set any one of the fieldsToAdd -
                    // in that case, we need to make sure that we don't let that set happen (since it would create
                    // a collision field on the pristine). See SPL-121185.
                    fieldsToAdd = options.commandPristine.isComplete() ?
                        _.difference(options.command.getFieldsToAddAsArray(), options.commandPristine.getFieldsToAddAsArray()) :
                        options.command.getFieldsToAddAsArray();
                }

                _.each(fieldsToAdd, function(fieldName) {
                    // We're starting at currentCommandIndex-1 because the columns of the commandModel before any
                    // changes have been applied are essentially the same as the previous command's columns. That's
                    // also why we're ignoring the columns of the current command.
                    for (i = (currentCommandIndex - 1); i < this.commands.length; i++) {
                        currentCommand = this.commands.at(i);

                        if (currentCommand && (i !== currentCommandIndex)) {
                            matchingColumn = currentCommand.columns.find(function(column) {
                                return column.get('name') === fieldName;
                            });

                            if (matchingColumn) {
                                collisionFields.push(fieldName);
                            }
                        }
                    }
                }, this);

                if (options.command) {
                    options.command.set('collisionFields', _.uniq(collisionFields));
                }
                return collisionFields;
            },

            getLastSafeCommandForCommandIndex: function(commandIndex) {
                var currentCommandIndex = commandIndex || this.getCurrentCommandIdx(),
                    currentCommand,
                    lastSafeCommand,
                    i;

                for (i = 0; i <= currentCommandIndex; i++) {
                    currentCommand = this.commands.at(i);

                    if (currentCommand && currentCommand.isComplete() && currentCommand.isValid(true)) {
                        lastSafeCommand = currentCommand;
                    } else {
                        break;
                    }
                }

                return lastSafeCommand;
            },

            isTable: function() {
                return true;
            }
        }, {
            Cron: CronModel,
            WorkingTimeRange: TimeRangeModel,
            Commands: CommandsCollection,
            SelectedColumns: ColumnsCollection,
            
            DIRTY_WHITELIST: [
              '^dataset\.display\..*$',
              '^dataset\.commands$'
            ],
            
            MODES: {
                TABLE: 'table',
                DATA_SUMMARY: 'datasummary'
            },
            DATASET_DISPLAY_TYPES: {
                TABLE: _('table').t()
            }
        });
        
        // break the shared reference to Entry and do not use the DataModel Entry because its Content model
        // defines a very custom toJSON.
        TableModel.Entry = SplunkDBaseModel.Entry.extend({});
        // now we can safely extend Entry.Content
        TableModel.Entry.Content = SplunkDBaseModel.Entry.Content.extend({
            defaults: {
                'dataset.type': 'table',
                'eai:type': 'datamodel',
                'dataset.display.mode': 'table'
            }
        });
        
        return TableModel;
    }
);
