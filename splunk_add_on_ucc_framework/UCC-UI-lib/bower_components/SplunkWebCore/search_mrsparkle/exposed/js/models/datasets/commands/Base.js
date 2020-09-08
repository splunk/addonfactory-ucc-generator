define(
    [
        'jquery',
        'underscore',
        'collections/Base',
        'collections/datasets/Columns',
        'collections/datasets/RequiredColumns',
        'models/Base',
        'models/datasets/TableAST',
        'models/datasets/Column',
        'models/datasets/RequiredColumn',
        'splunk.util',
        'util/general_utils',
        'util/dataset_utils'
    ],
    function(
        $,
        _,
        BaseCollection,
        ColumnsCollection,
        RequiredColumnsCollection,
        BaseModel,
        TableAST,
        ColumnModel,
        RequiredColumnModel,
        splunkUtils,
        generalUtils,
        datasetUtils
    ) {
        var SELECTION = {
            TABLE: 'table',
            MULTICOLUMN: 'multicolumn',
            COLUMN: 'column',
            CELL: 'cell',
            TEXT: 'text'
        };

        var Command = BaseModel.extend({
            _displayName: undefined,
            _placeholderSPL: undefined,
            _useAST: false,
            _advancedCommand: undefined,

            // Determine if this command should use a new search or a loadjob
            // of the results of the closest previous _searchPoint command.
            isSearchPoint: false,

            fieldPickerBlacklistSelection: SELECTION.COLUMN,

            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);

                this.initializeAssociated();

                this.columns.on('change', function(changedColumn, options) {
                    this.trigger('changeColumn', changedColumn, this, options);
                }, this);
                
                this.columns.on('add', function(addedColumn, columns, options) {
                    this.trigger('addColumn', addedColumn, this, options);
                }, this);
                
                this.columns.on('remove', function(removedColumn, columns, options) {
                    this.trigger('removeColumn', removedColumn, this, options);
                }, this);
                
                this.columns.on('reset', function(resetColumns, options) {
                    this.trigger('resetColumns', resetColumns, this, options);
                }, this);
                
                this.requiredColumns.on('add remove reset change', function() {
                    this.trigger('requiredColumnsChange');
                }, this);

                this.editorValues.on('add remove reset change', function() {
                    this.trigger('editorValuesChange');
                }, this);
                
                this.on('change:type', function(model, type) {
                    throw new Error('You cannot change the type of a command. They must be constructed by type.');
                }, this);
            },

            defaults: function() {
                return Command.getDefaults();
            },

            validation: {
                type: function(value) {
                    if (!value) {
                        throw new Error('You must have a type set on the command.');
                    }
                },
                
                spl: 'validateSPL'
            },
            
            validateSPL: function(value, attr, option) {
                throw new Error('You must define your own validateSPL method');
            },

            validateASTErrors: function() {
                var astError = this.ast && this.ast.error.get('messages');

                // Make sure no ill formed commands are slipped in here
                if (astError && astError.length) {
                    return splunkUtils.escapeHtml(astError[0].message);
                }
            },

            validatePipes: function() {
                var astSources = this.ast && this.ast.get('ast') && this.ast.get('ast').sources;

                // If sources has stuff in it, then that means the user piped to another command.
                // Easier to go through the AST here instead of trying to do any parsing ourselves.
                if (astSources && astSources.length > 0) {
                    return _('Pipes to other Splunk commands are not allowed.').t();
                }
            },
            
            initializeAssociated: function() {
                // do a dynamic lookup of the current constructor so that this method is inheritance-friendly
                var RootClass = this.constructor;
                this.associated = this.associated || {};
                
                this.columns = this.columns || new RootClass.Columns();
                this.associated.columns = this.columns;

                this.requiredColumns = this.requiredColumns || new RootClass.RequiredColumns();
                this.associated.requiredColumns = this.requiredColumns;

                this.editorValues = this.editorValues || new RootClass.EditorValues();
                this.associated.editorValues = this.editorValues;
            },

            // Individual commands can override this to do any custom setup work on their attributes
            setInitialState: function(initialStateOptions) { },

            sync: function(method, model, options) {
                throw new Error('sync not allowed for a Command model');
            },
            
            parse: function(response, options) {
                this.initializeAssociated();
                
                response = $.extend(true, {}, response);
                
                if (response.columns) {
                    this.columns.reset(response.columns, options);
                    delete response.columns;
                }

                if (response.requiredColumns) {
                    this.requiredColumns.reset(response.requiredColumns, options);
                    delete response.requiredColumns;
                }

                if (response.editorValues) {
                    this.editorValues.reset(response.editorValues, options);
                    delete response.editorValues;
                }
                
                return response;
            },

            setFromCommandJSON: function(jsonPayload, options) {
                options = options || {};
                if (!options.skipClone) {
                    jsonPayload = $.extend(true, {}, jsonPayload);
                }

                if (jsonPayload) {
                    if (jsonPayload.columns) {
                        this.columns.set(jsonPayload.columns, options);
                        delete jsonPayload.columns;
                    }

                    if (jsonPayload.requiredColumns) {
                        this.requiredColumns.set(jsonPayload.requiredColumns, options);
                        delete jsonPayload.requiredColumns;
                    }

                    if (jsonPayload.editorValues) {
                        this.editorValues.reset(jsonPayload.editorValues, options);
                        delete jsonPayload.editorValues;
                    }
                }
                
                return this.set(jsonPayload, options);
            },

            clear: function(options) {
                var setDefaultsOptions = _.extend({}, options, {
                    setDefaults: true
                });
                BaseModel.prototype.clear.call(this, setDefaultsOptions);
            },
            
            toJSON: function(options) {
                var baseJSON = BaseModel.prototype.toJSON.apply(this, arguments),
                    columnsJSON = this.columns.toJSON(options),
                    requiredColumnsJSON = this.requiredColumns.toJSON(options),
                    editorValuesJSON = this.editorValues.toJSON(options);
                
                if (!_.isEmpty(baseJSON) || !_.isEmpty(columnsJSON)) {
                    baseJSON.columns = columnsJSON;
                }
                
                if (!_.isEmpty(baseJSON) || !_.isEmpty(requiredColumnsJSON)) {
                    baseJSON.requiredColumns = requiredColumnsJSON;
                }

                if (!_.isEmpty(baseJSON) || !_.isEmpty(editorValuesJSON)) {
                    baseJSON.editorValues = editorValuesJSON;
                }
                
                return baseJSON;
            },
            
            /**
             * Interface method, you must override this method to ask the command to generate the current SPL for itself
             */
            generateSPL: function(options) {
                throw new Error('You must override generateSPL in your command model.');
            },

            /**
             * Ask the command to generate the current SPL for itself and set it
             */
            updateSPL: function(options) {
                options = options || {};
                _.defaults(options, {
                    validate: true
                });
                // Some commands need context of the previous command in order to do their validation. And our
                // validation plugin sucks and doesn't allow any way for us to pass options to any of our validation
                // functions. So, we're setting the previousCommand on the model itself so validateSPL can do its
                // checking. Then we remove it. This is dumb but what can you do.
                this.previousCommand = options.previousCommand;

                // Create the deferred and callback to run to validate and set the SPL
                var dfd = null,
                    setCallback = function() {
                        var isComplete = false,
                            spl,
                            setReturnVal;

                        if (!options.validate || this.isValid(true)) {
                            isComplete = true;
                            spl = this.generateSPL(options);
                        } else {
                            // Make sure that we force isComplete to be false and clear spl.
                            // The set below will not set anything if validation fails
                            this.set({
                                isComplete: isComplete,
                                spl: spl
                            });
                        }

                        setReturnVal = this.set({
                            isComplete: isComplete,
                            spl: spl
                        }, options);

                        delete this.previousCommand;
                        return setReturnVal;
                    }.bind(this);
                
                // If the flag is set to use the AST to validate an SPL query first
                if (this._useAST) {
                    // Get a new AST model
                    this.ast = new TableAST();

                    // We should only fetch the AST if we are told to validate. The contract is that you can have
                    // AST validation checks on your validateSPL method, but those checks should pass if the AST has not
                    // been fetched. Then, we will fetch the AST and in the callback we will validate with the fetched AST.
                    if (options.validate && !this.validate()) {
                        dfd = this.fetchAST();
                    }
                    
                    // Run the set callback when the AST fetch is resolved
                    $.when(dfd).always(function() {
                        setCallback();
                    }.bind(this));
                } else {
                    // If we don't need to use the AST, then run the callback immediately
                    // And by not setting dfd, we will return a null deferred, which will resolve immediately
                    setCallback();
                }
                return dfd;
            },
            
            // This will fetch the ast for the search as provided by the getASTSearchSPL function,
            // overridden by individual commands
            fetchAST: function() {
                // Return if the ast hasn't been previously created
                if (!this.ast) {
                    return null;
                }
                // Create a new AST Model to fetch the current SPL
                var dfd = $.Deferred();
                
                // Set the SPL provided by the overridden getASTSearchSPL function
                this.ast.set({
                    spl: this.getASTSearchSPL()
                });
                
                // Fetch the AST, resolving the deferred when completing the request
                this.ast.fetch({
                    data: {
                        app: this.get('app') || "",
                        owner: this.get('owner') || ""
                    },
                    success: function(model, response) {
                        dfd.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        // Need to defer rejecting this to allow error events to run
                        _.defer(dfd.reject);
                    }.bind(this)
                });
                
                // Return the deferred
                return dfd;
            },
            
            // Defaults to the command's generateSPL(). Can override if you need more specific behavior.
            getASTSearchSPL: function() {
                return this.generateSPL({ skipValidation: true });
            },
            
            // Set the app and owner for command that need such for the AST fetch
            setAppAndOwnerForAST: function(applicationModel) {
                this.set({
                    app: applicationModel.get('app'),
                    owner: applicationModel.get('owner')
                });    
            },

            // Override this method for each Command Model that alters the Table's Columns
            // with a routine to apply those changes to its own Columns Collection.
            // Default: no-op
            applyChangesToColumns: function(values, options) { },
            
            // If you want forward propagation to STOP without touching this command then you
            // must override this with true. This will be useful for reporting commands that
            // fundamentally change the entire set of available columns
            
            stopForwardPropagation: false,
            
            propagateColumnChange: function(changedColumn, options) {
                var changedAttributes = changedColumn.changedAttributes();
                
                if (changedAttributes && !_.isEmpty(changedAttributes)) {
                    var matchedColumn = this.columns.get(changedColumn.id);
                    
                    if (matchedColumn && (!changedColumn.isTouchedByComparison(matchedColumn, options))) {
                        matchedColumn.set(changedAttributes, options);
                    }
                }
                
                return this;
            },
            
            propagateColumnAdd: function(addedColumn, options) {
                return this.columns.add(addedColumn, options);
            },
            
            propagateColumnRemove: function(removedColumn, options) {
                this.requiredColumns.remove(this.requiredColumns.get(removedColumn.id), options);
                return this.columns.remove(removedColumn, options);
            },
            
            propagateColumnReset: function(newColumnsCollection, options) {
                // NOTE: The default of this reset propagation is to force a SET of the columns
                // set will do a smart update of the propagation
                // YOU MUST OVERRIDE TO PROVIDE YOUR OWN USE OF PREVIOUS COMMANDS
                
                return this.columns.set(newColumnsCollection.toJSON(), options);
            },

            validateForTypes: function(typesArray) {
                var errorString,
                    // Ignore _raw and _time types as fields cannot be retyped to those types, and user is unaware of those unique types.
                    cleanedTypesArray = _.without(typesArray, ColumnModel.TYPES._RAW, ColumnModel.TYPES._TIME),
                    typeLabelsArray = _.map(cleanedTypesArray, function(type) { return ColumnModel.TYPE_LABELS[type]; }),
                    typesString = typeLabelsArray.join(_(', ').t());

                this.requiredColumns.find(function(column) {
                    var actualColumn = this.columns.get(column.id),
                        matchedType = _.find(typesArray, function(type) {
                            return actualColumn && (actualColumn.get('type') === type);
                        }, this);
                    if (!matchedType && actualColumn) {
                        if (cleanedTypesArray.length > 1) {
                            errorString = splunkUtils.sprintf(_("Field has type \"%s\" but must have one of types \"%s\".").t(), ColumnModel.TYPE_LABELS[actualColumn.get("type")], typesString);
                        } else {
                            errorString = splunkUtils.sprintf(_("Field has type \"%s\" but must have type \"%s\".").t(), ColumnModel.TYPE_LABELS[actualColumn.get("type")], typesString);
                        }
                    }
                }.bind(this));

                return errorString;
            },

            getWhitelistedTypes: function(options) {
                options = options || {};
                var typesList = _.values(ColumnModel.TYPES),
                    // If the user passes in a selectionType, then use that blacklist. Else, default to looking at Column blacklist.
                    blacklist = _.where(this.getBlacklist(), { selection: (options.selectionType || SELECTION.COLUMN) }),
                    blacklistedTypes = blacklist.length && blacklist[0].types;
                if (blacklist.length) {
                    // Column is blacklisted for this command, so find whitelist by diffing all types and blacklisted types
                    if (blacklistedTypes) {
                        return _.difference(typesList, blacklistedTypes);
                    } else {
                        // All field types are blacklisted if types attr is unspecified
                        return [];
                    }
                } else {
                    // Column is not blacklisted for this command. All field types are whitelisted.
                    return typesList;
                }
            },

            getGuidForColIndex: function(colIndex) {
                if (0 > colIndex || colIndex > (this.columns.length - 1)) {
                    throw new Error('Provided an invalid colIndex argument to getGuidForColIndex - not in range');
                }

                return this.columns.at(colIndex).id;
            },

            getDisplayName: function() {
                if (this._displayName) {
                    return this._displayName;
                }
                throw new Error('You must set _displayName in your command model.');
            },

            getDisplaySPL: function(options) {
                if (!this.isComplete()) {
                    if (this._placeholderSPL) {
                        return this._placeholderSPL;
                    }
                    throw new Error('You must set _placeholderSPL in your command model or override getDisplaySPL().');
                }
                return this.get('spl') || this.generateSPL(options);
            },

            isBaseCommand: function() {
                return this.get('type') === Command.INITIAL_DATA;
            },
            
            isNew: function() {
                return _.isUndefined(this.get('isComplete'));
            },
            
            isComplete: function() {
                return (this.get('isComplete') === true);
            },
            
            isInvalid: function() {
                return (!this.isNew() && !this.isComplete());
            },
            
            isDirty: function(commandPristine) {
                // Need to ignore attributes that have undefined values as these are
                // not synced from command to commandPristine in setFromCommandJSON()
                var workingAttributes = generalUtils.stripUndefinedAttrs(this.toJSON()),
                    pristineAttributes = generalUtils.stripUndefinedAttrs(commandPristine.toJSON());
                return !(_.isEqual(workingAttributes, pristineAttributes));
            },

            getBlacklist: function() {
                return this.constructor.blacklist;
            },

            resetRequiredColumns: function(columnGuids) {
                var newRequiredColumns = [];
                _.each(columnGuids, function(guid) {
                    if (_.isObject(guid)) {
                        newRequiredColumns.push(new RequiredColumnModel(guid));
                    } else  {
                        newRequiredColumns.push(new RequiredColumnModel({ id: guid }));
                    }
                }, this);
                this.requiredColumns.reset(newRequiredColumns);
            },

            convertGuidsToFields: function(guidArray, options) {
                options = options || {};
                
                return _.map(guidArray, function(guid) {
                    return this.getFieldNameFromGuid(guid, options);
                }, this);
            },

            getFieldNameFromGuid: function(guid, options) {
                options = options || {};
                
                var column = this.columns.get(guid),
                    name;
                
                if (!column) {
                    return undefined;
                }
                
                name = column.get('name');
                
                if (name && options.singleQuoteWrap) {
                    return '\'' + name + '\'';
                }
                
                if (name && options.doubleQuoteWrap) {
                    return '"' + name + '"';
                }
                
                return name;
            },

            isTypeBlacklisted: function(type) {
                var columnBlacklistArray = _.where(this.getBlacklist(), { selection: this.fieldPickerBlacklistSelection }),
                    columnBlacklist;

                if (columnBlacklistArray.length) {
                    columnBlacklist = columnBlacklistArray[0];
                    // If columnBlacklist.types is defined, find out if it's in the array.
                    if (columnBlacklist && columnBlacklist.types !== undefined) {
                        return _.contains(columnBlacklist.types, type);
                    }

                    // If there is a columnBlacklist, but no types are defined, all types are blacklisted.
                    return true;
                }

                // If columnBlacklist is undefined, no field types are blacklisted.
                return false;
            },

            getPreviousColumns: function() {
                if (this.collection) {
                    return this.collection.getPreviousCommandColumns(this);
                }
            },
            
            getAddedColumnGuids: function(options) {
                options = options || {};
                var comparisonColumnsCollection = options.comparisonColumnsCollection || this.getPreviousColumns();
                
                if (comparisonColumnsCollection && comparisonColumnsCollection.length) {
                    return _.difference(this.columns.pluck('id'), comparisonColumnsCollection.pluck('id'));
                }
            },

            /*
               This function helps the editor forms figure out if a column to add has a name collision with another
               column in the table, either in this command or in a future command.
               BY DEFAULT, this returns the value for the 'newFieldName' attribute on the command model, but if you
               have more specific behavior (ex: commands/Join), you MUST override this!
             */
            getFieldsToAddAsArray: function() {
                var newFieldName = this.get('newFieldName');

                if (newFieldName) {
                    return [ newFieldName ];
                }
            },

            /*
               If you want to validate collision fields, just add 'collisionFields: "validateCollisionFields"' in the
               validation hash in your command model.
             */
            validateCollisionFields: function() {
                var collisionFields = this.get('collisionFields');

                if (collisionFields && collisionFields.length) {
                    return splunkUtils.sprintf(_('The field(s) %s share the same name as another field in your table and cannot be added.').t(), collisionFields.join(', '));
                }
            },

            hasValidRequiredColumn: function() {
                var requiredColumn = this.requiredColumns.first();

                // Verify there is a required column, with an ID
                if (!requiredColumn || requiredColumn.isNew()) {
                    return false;
                }

                return true;
            },
            
            // Calls into util in order to standardize error message
            validateFieldName: function(string) {
                if (!datasetUtils.isValidFieldName(string)) {
                    return _('Field names cannot be blank, start with an underscore, or contain quotes or spaces.').t();
                }
            },

            validateRexFieldName: function(string) {
                if (!datasetUtils.isValidRexFieldName(string)) {
                    return _('Field names for this command cannot be blank, start with an underscore, or contain any non-alphanumeric characters.').t();
                }
            },

            validateReferencedFieldsExistence: function() {
                var referencedFieldNames,
                    allReferencedFieldsExist,
                    commandColumns;

                // We have to look to the previous command's columns to figure out what fields can be referenced in the
                // expression. First, see if this.previousCommand was set on the model (happens for inmem commands that
                // we're trying to validate). Then see if we can just grab the previous command if it's already in a
                // collection. Fallback is just using this.columns, but I don't think that should ever happen.
                if (this.previousCommand) {
                    commandColumns = this.previousCommand.columns;
                } else if (this.collection) {
                    commandColumns = this.getPreviousColumns();
                } else {
                    commandColumns = this.columns;
                }

                if (this.ast) {
                    referencedFieldNames = this.ast.getReferencedFieldsNameList();
                    allReferencedFieldsExist = _.all(referencedFieldNames, function(name) {
                        return !!commandColumns.findWhere({ name: name });
                    }.bind(this));

                    if (!allReferencedFieldsExist) {
                        return _('The expression references one or more fields that are not in the table.').t();
                    }
                }
            },

            // Interface for updating required columns, no-op unless defined
            updateRequiredColumns: function() { },

            updateRequiredColumnsFromReferencedASTFields: function(columnsToRetain) {
                columnsToRetain = columnsToRetain || [];
                
                var referencedFieldNames,
                    referencedColumnIds;

                if (this.ast) {
                    referencedFieldNames = this.ast.getReferencedFieldsNameList();
                    referencedColumnIds = _.compact(_.map(referencedFieldNames, function(name) {
                        var foundColumn = this.columns.findWhere({ name: name });

                        if (foundColumn) {
                            return { id: foundColumn.id };
                        }
                    }.bind(this)));
                }

                this.requiredColumns.reset(columnsToRetain.concat(referencedColumnIds || []));
            },

            getAdvancedCommandJSON: function() {
                return $.extend(true, {}, this.getAdvancedCommandAttributes(), {
                    type: this._advancedCommand,
                    selectedColumns: this.requiredColumns.pluck('id'),
                    columns: this.columns.toJSON(),
                    isComplete: this.isComplete()
                });
            },

            /*
              Interface for commands that can be escaped to an advanced version. Must be implemented for those commands.
              Maps the attributes in the normal version to the advanced one.
             */
            getAdvancedCommandAttributes: function() {
                throw new Error('Tried to get advanced command attributes for a command that doesn\'t have an advanced version!');
            }
        }, {
            Columns: ColumnsCollection,
            RequiredColumns: RequiredColumnsCollection,
            EditorValues: BaseCollection,
            /* 
             * 
             * Command names go here to keep them consistent
             *
             */
            INITIAL_DATA: 'initialdata',
            SORT: 'sort',
            RENAME: 'rename',
            TRUNCATE: 'truncate',
            JOIN: 'join',
            REPLACE: 'replace',
            DEDUP: 'dedup',
            EXTRACT_DATE_TIME: 'extractDateTime',
            REMOVE: 'remove',
            REX: 'rex',
            FILTER_VALUES: 'filtervalues',
            REMOVE_NON_NUMERICAL_VALUES: 'removenonnumericalvalues',
            FILL_VALUES: 'fillvalues',
            EVAL: 'eval',
            EVAL_EXISTING_FIELD: 'evalexisting',
            RANGEMAP: 'rangemap',
            SEARCH: 'search',
            CONCATENATE: 'concatenate',
            DUPLICATE: 'duplicate',
            STATS: 'stats',
            CHANGE_CASE: 'changecase',
            FILTER_REGEX: 'filterregex',
            ADVANCED_REX: 'advancedrex',
            COALESCE: 'coalesce',
            WHERE: 'where',
            SPLIT: 'split',
            CALCULATE_FIELD: 'calculatefield',
            ROUND: 'round',
            BUCKET: 'bucket',

            SELECTION: SELECTION,
            blacklist: [],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    isComplete: undefined
                });
            }
        });
        
        return Command;
    }
);
