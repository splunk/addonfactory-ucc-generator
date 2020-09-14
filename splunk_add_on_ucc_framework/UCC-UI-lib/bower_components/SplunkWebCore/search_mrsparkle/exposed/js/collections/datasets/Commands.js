define(
    [
        'jquery',
        'underscore',
        'collections/Base',
        'models/datasets/PolymorphicCommand'
    ],
    function (
        $,
        _,
        BaseCollection,
        PolymorphicCommandModel
    ) {
        return BaseCollection.extend({
            model: PolymorphicCommandModel,

            initialize: function() {
                BaseCollection.prototype.initialize.apply(this, arguments);

                this.on('changeColumn', function(changedColumn, originCommand, options) {
                    this.propagateChangeColumn(changedColumn, originCommand, options);
                }, this);

                this.on('addColumn', function(addedColumn, originCommand, options) {
                    this.propagateAddColumn(addedColumn, originCommand, options);
                }, this);

                this.on('removeColumn', function(removedColumn, originCommand, options) {
                    this.propagateRemoveColumn(removedColumn, originCommand, options);
                }, this);

                this.on('resetColumns', function(newColumnsCollection, originCommand, options) {
                    this.propagateResetColumns(newColumnsCollection, originCommand, options);
                }, this);
                
                this.on('remove', this.handleRemovedCommand, this);
            },

            sync: function(method, model, options) {
                throw new Error('sync not allowed for the Commands collection');
            },

            addNewCommand: function(values, options) {
                values = values || {};
                // Because options is augmented it is dangerous to change the shared reference
                options = $.extend(true, {}, options || {});

                var commandModel,
                    valuesCopy = $.extend(true, {}, values),
                    updateDfd,
                    addDfd = $.Deferred();

                // Need to set this flag when triggering 'add'
                options.add = true;

                delete values.columns;
                delete values.selectedColumns;
                delete values.editorValues;

                // Don't forget to pass type into addNewCommand for PolymorphicCommandModel to read!
                commandModel = new PolymorphicCommandModel(values, options);
                if (!valuesCopy.columns) {
                    if (options.at === 0) {
                        // No columns to backfill from, so always start with an empty array
                        valuesCopy.columns = [];
                    } else if (this.at(options.at - 1)) {
                        // Use the previous command's columns if they exist
                        valuesCopy.columns = this.at(options.at - 1).columns.toJSON() || [];
                    } else if (options.at >= 0 || _.isUndefined(options.at)) {
                        // If you don't specify an at, or the at is beyond the last command in the collection,
                        // then add will add to the end, so we'll use the last command columns here.
                        valuesCopy.columns = this.getLastCommandColumnsJSON() || [];
                    } else {
                        throw new Error('Passed an invalid at index to addNewCommand!');
                    }
                }

                // Reset with any editor values passed in to the editor values array
                if (valuesCopy.editorValues && commandModel.editorValues) {
                    commandModel.editorValues.reset(valuesCopy.editorValues);
                }

                commandModel.columns.reset(valuesCopy.columns, options);
                // Need to add required columns if they are passed instead of selected columns
                commandModel.resetRequiredColumns(valuesCopy.selectedColumns || valuesCopy.requiredColumns);

                // Now that the columns/editorValues/requiredColumns in place, we can set the initial state
                commandModel.setInitialState(options.initialStateOptions);

                if (commandModel.isComplete()) {
                    updateDfd = commandModel.updateSPL(options);
                }
                
                // Because updateSPL may use the AST, we need to use a deferred to make sure we update before we add.
                $.when(updateDfd).always(function() {
                    // Using silent:true here in order to propagate column changes before firing any triggers related
                    // to adding to the commands.
                    this.add(commandModel, _.extend({}, options, {silent:true}));
                    commandModel.applyChangesToColumns(valuesCopy, options);
                    this.trigger('add', commandModel, this, options);
                    addDfd.resolve();
                }.bind(this));
                
                // Return the deferred when the add has been done and triggered
                return addDfd;
            },
            
            handleRemovedCommand: function(removedCommand, updatedCollection, options) {
                options = options || {};
                var commandIdxBeforeRemoved = options.index - 1,
                    commandBeforeRemoved = this.at(commandIdxBeforeRemoved),
                    commandAfterRemoved = this.at(options.index),
                    newFieldGuids = options.newFieldGuids,
                    requiredColumns = [],
                    otherColumns = [];

                // If the new fields created by this command have not explicitly been passed
                // in, then we should see if the command makes new fields by performing a diff
                // of the command being removed and the command before it.
                if (!newFieldGuids && commandBeforeRemoved && commandAfterRemoved) {
                    newFieldGuids = removedCommand.getAddedColumnGuids({
                        comparisonColumnsCollection: commandBeforeRemoved.columns
                    });
                }

                // Handle any fields created by the command being removed
                if (newFieldGuids) {
                    _.each(newFieldGuids, function(newFieldGuid) {
                        var removedColumn = removedCommand.columns.get(newFieldGuid);
                        if (removedColumn) {
                            this.propagateRemoveColumn(removedColumn, removedCommand, { originCommandIdx: commandIdxBeforeRemoved });
                        }
                    }.bind(this));
                }

                // If there are command before the command being removed then we must ensure
                // that the state of the columns in the command before the removed command
                // are propagated to the command after the command being removed.
                if (commandIdxBeforeRemoved >= 0) {
                    commandBeforeRemoved.columns.each(function(column) {
                        var matchedColumn = removedCommand.requiredColumns.get(column.id);

                        if (matchedColumn) {
                            requiredColumns.push(column.toJSON());
                        } else {
                            otherColumns.push(column.toJSON());
                        }
                    }, this);

                    // We have to ensure that that columns from the command before the command
                    // being removed are now the canonical columns for the commands after the command
                    // being removed.
                    if (commandAfterRemoved) {
                        commandAfterRemoved.setFromCommandJSON({
                                columns: requiredColumns
                            },
                            {
                                remove: false,
                                // We must ensure that if this command renamed a column that subsequent
                                // commands no longer use that name for the column
                                forceNameForwardPropagationOnce: true,
                                commandRemoval: true
                            }
                        );
                        
                        commandAfterRemoved.setFromCommandJSON({
                                columns: otherColumns
                            },
                            {
                                remove: false,
                                merge: false,
                                // We must ensure that if this command renamed a column that subsequent
                                // commands no longer use that name for the column
                                forceNameForwardPropagationOnce: true,
                                commandRemoval: true
                            }
                        );
                    }
                }
            },

            getLastCommandColumnsJSON: function() {
                var lastCommand = this.last(),
                    lastCommandCols = lastCommand && lastCommand.columns;
                return lastCommandCols && lastCommandCols.toJSON();
            },

            getPreviousCommandColumns: function(command) {
                var prev = this.getPreviousCommand(command);
                return prev ? prev.columns : undefined;
            },

            getPreviousCommand: function(command) {
                var index = this.indexOf(command);

                if (index > 0) {
                    return this.at(index - 1);
                } else {
                    return undefined;
                }
            },

            propagateChangeColumn: function(changedColumn, originCommand, options) {
                var optionsCopy = $.extend(true, {}, options || {});

                var originCommandIdx = this.indexOf(originCommand),
                    columnNameChanged = changedColumn.hasChanged('name'),
                    previousColumnName = columnNameChanged && changedColumn.previous('name'),
                    currentCommand,
                    currentCommandMatchedColumn,
                    currentCommandMatchedColumnName;
                
                // See if we've been told to propagate a change of a column name
                if (optionsCopy.forceNameForwardPropagationOnce) {
                    if (columnNameChanged) {
                        if (!optionsCopy.forceName) {
                            // At this point the previous name is the only name in which we
                            // should continue to propagate on.
                            optionsCopy.forceName = previousColumnName;
                        }
                    }
                }

                // backward propagation
                for (var i = (originCommandIdx - 1); i >= 0; i--) {
                    currentCommand = this.at(i);
                    currentCommandMatchedColumn = currentCommand && currentCommand.columns.get(changedColumn.id);

                    // we will stop propagation if the name has changed
                    if (currentCommandMatchedColumn &&
                            (changedColumn.isTouchedByComparison(currentCommandMatchedColumn))) {
                        break;
                    }

                    currentCommand.propagateColumnChange(changedColumn, optionsCopy);
                }

                // forward propagation
                for (var j = (originCommandIdx + 1); j < this.length; j++) {
                    currentCommand = this.at(j);
                    currentCommandMatchedColumn = currentCommand && currentCommand.columns.get(changedColumn.id);
                    currentCommandMatchedColumnName = currentCommandMatchedColumn && currentCommandMatchedColumn.get('name');
                    optionsCopy.previousColumnName = previousColumnName;
                    
                    if (currentCommandMatchedColumn && optionsCopy.forceNameForwardPropagationOnce) {
                        if (currentCommandMatchedColumnName === optionsCopy.forceName) {
                            // The current command name matched the name that we have to force changes onto
                            // setting the previousColumnName will ensure that isTouchedByComparison returns false
                            optionsCopy.previousColumnName = optionsCopy.forceName;
                        }
                    }
                    
                    if (currentCommand.stopForwardPropagation ||
                            (currentCommandMatchedColumn &&
                                changedColumn.isTouchedByComparison(currentCommandMatchedColumn, { previousColumnName: optionsCopy.previousColumnName }))) {
                        break;
                    }
                    
                    currentCommand.propagateColumnChange(changedColumn, optionsCopy);
                }
            },

            propagateAddColumn: function(addedColumn, originCommand, options) {
                var originCommandIdx = this.indexOf(originCommand),
                    currentCommand;

                for (var i = (originCommandIdx + 1); i < this.length; i++) {
                    currentCommand = this.at(i);

                    if (currentCommand && currentCommand.stopForwardPropagation) {
                        break;
                    }

                    currentCommand.propagateColumnAdd(addedColumn, options);
                }
            },

            propagateRemoveColumn: function(removedColumn, originCommand, options) {
                options = options || {};

                var originCommandIdx = options.originCommandIdx || this.indexOf(originCommand),
                    currentCommand;

                for (var i = (originCommandIdx + 1); i < this.length; i++) {
                    currentCommand = this.at(i);

                    if (currentCommand && currentCommand.stopForwardPropagation) {
                        break;
                    }

                    currentCommand.propagateColumnRemove(removedColumn, options);
                }
            },

            propagateResetColumns: function(newColumnsCollection, originCommand, options) {
                var originCommandIdx = this.indexOf(originCommand),
                    currentCommand;

                for (var i = (originCommandIdx + 1); i < this.length; i++) {
                    currentCommand = this.at(i);

                    if (currentCommand && currentCommand.stopForwardPropagation) {
                        break;
                    }

                    currentCommand.propagateColumnReset(newColumnsCollection, options);
                }
            },

            validateSubsequentCommands: function(removedFields, startingIndex) {
                var failingFields = [],
                    currentCommand,
                    newFailingGuids,
                    failingGuids;
                
                // Iterate through beginning with the specified index
                for (var i = startingIndex + 1; i < this.length; i++) {
                    currentCommand = this.at(i);
                    // If any of the passed in guids being removed are in the required Columns
                    // for this command, add it to the array of failing guids
                    failingGuids = _.pluck(currentCommand.requiredColumns.filter(function(column) {
                        return _.contains(removedFields, column.id);
                    }), 'id');
                    
                    // Get the guids that are not already part of the set of failing fields array
                    newFailingGuids = _(failingGuids).difference(_(failingFields).pluck('id'));
                    
                    failingFields = failingFields.concat(_.map(newFailingGuids, function(guid) {
                        var currentColumn = currentCommand.columns.get(guid);
                        // If the current commands columns contains the guid, grab it
                        return  currentColumn ? 
                            currentColumn : 
                            // If the column is not in the current command, it must have been removed,
                            // so grab the previous set of columns and find the column
                            this.getPreviousCommandColumns(currentCommand).get(guid);
                    }.bind(this)));
                }
                // If there are failing fields, return them; else, return undefined
                if (failingFields.length) {
                    return failingFields;
                } 
            }
        });
    }
);
