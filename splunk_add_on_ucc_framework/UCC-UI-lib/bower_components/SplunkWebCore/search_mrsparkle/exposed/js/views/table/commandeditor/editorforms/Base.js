define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'models/shared/User',
        'views/Base',
        'views/table/modals/AdvancedEditorReturn',
        'views/table/modals/FieldRemovalDialog',
        'util/dataset_utils',
        'uri/route'
    ],
    function(
        _,
        $,
        module,
        BaseCommandModel,
        ColumnModel,
        UserModel,
        BaseView,
        AdvancedEditorReturnDialog,
        FieldRemovalDialog,
        datasetUtils,
        route
    ) {
        var CLASS_NAME = 'commandeditor-form overlay-parent',
            COMMANDEDITOR_SECTION = '<div class="commandeditor-section-scrolling"></div>',
            COMMANDEDITOR_SECTION_SELECTOR = '.commandeditor-section-scrolling',
            BUTTON_CONTAINER = '<div class="commandeditor-button-container"><div class="commandeditor-buttons"></div></div>',
            BUTTON_CANCEL = '<a href="#" class="btn commandeditor-cancel">' + _("Cancel").t() + '</a>',
            BUTTON_APPLY = '<a href="#" class="btn btn-primary commandeditor-apply">' + _("Apply").t() + '</a>',
            BUTTON_EDIT = '<a href="#" class="btn btn-primary commandeditor-edit">' + _("Edit").t() + '</a>',
            BUTTON_CONTAINER_SELECTOR = '.commandeditor-buttons',
            BUTTON_CANCEL_SELECTOR = '.commandeditor-cancel',
            BUTTON_APPLY_SELECTOR = '.commandeditor-apply',
            ADVANCED_EDITOR_SELECTOR = '.advanced-editor-link',
            ADVANCED_EDITOR_LINK = '<a href="#" class="advanced-editor-link"></a>',
            ADVANCED_EDITOR_RETURN_SELECTOR = '.advanced-editor-return-link',
            ADVANCED_EDITOR_RETURN_LINK = '<a href="#" class="advanced-editor-return-link"></a>';

        return BaseView.extend({
            moduleId: module.id,
            className: CLASS_NAME,
            isError: false,
            initializeEmptyRequiredColumn: false,

            // Override focusSelector to focus on a different element
            focusSelector: '.btn:not(.disabled):not([disabled]):not(.active), input[type=text], textarea',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                if (this.model.commandPristine.validationError) {
                    this.isError = true;
                }

                if (this.initializeEmptyRequiredColumn) {
                    this.addEmptyRequiredColumn();
                }
            },

            addEmptyRequiredColumn: function() {
                if (!this.model.command.requiredColumns.length) {
                    this.model.command.requiredColumns.add({});
                }
            },

            // If you extend this class and need your own events object then you need to declare it like:
            // $.extend({}, BaseEditor.prototype.events, {
            events: {
                'click a.commandeditor-apply:not(.disabled)': function(e) {
                    e.preventDefault();
                    this.handleApply();
                },
                'click a.commandeditor-cancel:not(.disabled)': function(e) {
                    e.preventDefault();
                    this.handleCancel();
                },
                'click .advanced-editor-link': function(e) {
                    e.preventDefault();

                    this.model.state.set({
                        workingAttributes: this.model.command.getAdvancedCommandAttributes(),
                        previousJSON: this.model.commandPristine.toJSON()
                    });
                    this.replaceCurrentCommand({
                        values: this.model.commandPristine.getAdvancedCommandJSON()
                    });
                },
                'click .advanced-editor-return-link:not(.disabled)': function(e) {
                    e.preventDefault();
                    var replaceFn = function() {
                        this.replaceCurrentCommand();
                    }.bind(this);

                    if (this.model.command.isDirty(this.model.commandPristine)) {
                        this.children.returnModal = new AdvancedEditorReturnDialog({
                            model: {
                                state: this.model.state
                            },
                            onHiddenRemove: true
                        });
                        this.listenToOnce(this.model.state, 'returnToPrevious', replaceFn);
                        this.children.returnModal.render().appendTo($('body')).show();
                    } else {
                        replaceFn();
                    }
                }
            },

            onAddedToDocument: function() {
                BaseView.prototype.onAddedToDocument.apply(this, arguments);

                if (!this.model.command.isComplete()) {
                    this.focusFirstInput();
                }
            },

            focusFirstInput: function() {
                this.$(this.focusSelector).first().focus();
            },

            startListening: function() {
                // Update Apply Button state if user adds new attributes to the command itself
                // or its nested collections (manually triggered in Base Command)
                this.listenTo(this.model.command, 'change changeColumn addColumn removeColumn resetColumns requiredColumnsChange editorValuesChange', this.updateButtonStates);
            },

            updateButtonStates: function() {
                if (this.model.command.isDirty(this.model.commandPristine) ||
                        !this.model.command.isComplete()) {
                    this.$(BUTTON_APPLY_SELECTOR).removeClass('disabled');

                    if (this.model.command.isInvalid()) {
                        this.$(BUTTON_CANCEL_SELECTOR).addClass('disabled');
                    } else {
                        this.$(BUTTON_CANCEL_SELECTOR).removeClass('disabled');
                    }

                    $('.commandeditor-collapse').hide();
                    this.model.state.set('tableEnabled', false);
                } else {
                    this.$(BUTTON_APPLY_SELECTOR).addClass('disabled');
                    this.$(BUTTON_CANCEL_SELECTOR).addClass('disabled');
                    $('.commandeditor-collapse').show();
                    this.model.state.set('tableEnabled', true);
                }
            },

            handleCancel: function() {
                // If model is complete, then reload the editor from the last set of saved changes
                if (this.model.command.isComplete() ||
                        // This is to make sure if the user has applied a command already, but then has failed validation
                        (!this.model.command.isValid(true) && !!this.model.commandPristine.get('spl')) ) {
                    this.model.state.trigger('editorReload');
                } else {
                    this.model.table.commands.remove(this.model.commandPristine);
                }
            },

            // Override this method to handle your own click of the apply button, but make sure to call this at the end!
            handleApply: function(options) {
                var addedColumnGuids,
                    acceptCallback,
                    declineCallback,
                    dfd;

                options = options || {};

                // Set this before we updateSPL so we can catch validation errors
                this.setCollidingFieldNames();

                // Get the deferred, which will need to be resolved to set the SPL if the SPL
                // validation is dependant on the AST; If not, the deferred will be null and resolve immediately
                dfd = this.model.command.updateSPL(options.updateSPLOptions);
                $.when(dfd).then(function() {
                    this.model.command.unset('collisionFields');

                    if (!this.model.command.validationError) {
                        // Callback to set the command pristine with the model changes
                        acceptCallback = function() {
                            this.setScrollWidthToAddedColumns();
                            this.model.state.trigger('commandApplied');
                            this.model.commandPristine.setFromCommandJSON(this.model.command.toJSON(options.toJSONOptions), {skipClone: true});
                        }.bind(this);
                        declineCallback = function() {
                            this.model.command.setFromCommandJSON(this.model.commandPristine.toJSON(options.toJSONOptions), {skipClone: true});
                        }.bind(this);

                        if (options.validateFields) {
                            this.verifyRemovedFields({
                                acceptCallback: acceptCallback,
                                declineCallback: declineCallback
                            });
                        } else {
                            acceptCallback();
                        }
                    } else {
                        addedColumnGuids = this.model.command.getAddedColumnGuids({
                            comparisonColumnsCollection: this.model.commandPristine.columns
                        });
                        this.model.command.columns.remove(addedColumnGuids);
                    }
                }.bind(this));
            },

            // Adds several new fields to the current columns collection, proxying to addNewField.
            // First removes all fields that were added before but are gone now, and then adds the ones that didn't
            // exist before but do now.
            addNewFields: function() {
                var currentFieldsToAdd = this.model.command.getFieldsToAddAsArray(),
                    // Doesn't matter what the command pristine thinks it added if it's not complete
                    pristineFieldsToAdd = this.model.commandPristine.isComplete() ? this.model.commandPristine.getFieldsToAddAsArray() : [],
                    addedFields = _.difference(currentFieldsToAdd, pristineFieldsToAdd),
                    removedFields = _.difference(pristineFieldsToAdd, currentFieldsToAdd);

                _.each(removedFields, function(removedField) {
                    var removedFieldInColumnsCollection = this.model.command.columns.findWhere({
                        name: removedField
                    });
                    this.model.command.columns.remove(removedFieldInColumnsCollection);
                }.bind(this));

                _.each(addedFields, function(addedField, i) {
                    this.addNewField({
                        name: addedField
                    }, {
                        offsetForAddIndex: i,
                        alreadyVetted: true
                    });
                }, this);
            },

            // Adds a new field to the current columns collection. (Almost) every command that adds one or more columns
            // should call this.
            // Includes logic for inserting the columns at the right position and only adding when necessary.
            //
            // @param values {object} - the values given to the new column. The "name" for the new column defaults to
            //                          the newFieldName attribute on the command. Can pass other things like type.
            // @param options {object} - options to this function.
            //     @param addIndex {int} - where to add this new column. Defaults to the right of the last seen required column.
            //     @param offsetForAddIndex {int} - any value to add to addIndex. Useful when adding a bunch of columns
            //                                      at once (join, split, etc) and you want them to show up in the right order.
            //                                      Defaults to 0.
            //     @param newFieldNameKey {str} - the key for the new field name, defaults to newFieldName
            //     @param alreadyVetted {bool} - whether to always add a new column or not. Defaults to false.
            addNewField: function(values, options) {
                values = values || {};
                options = options || {};

                var currentCommandColumns = this.model.command.columns,
                    requiredColumnNames = _.map(this.model.command.requiredColumns.pluck('id'), function(id) {
                        return this.model.command.getFieldNameFromGuid(id);
                    }, this),
                    addedColumnGuids = this.model.commandPristine.getAddedColumnGuids(),
                    staleColumn;

                _.defaults(options, {
                    addIndex: this.getColIndexForNewColumn(currentCommandColumns.pluck('name'), requiredColumnNames),
                    offsetForAddIndex: 0,
                    newFieldNameKey: 'newFieldName',
                    alreadyVetted: false
                });
                _.defaults(values, {
                    name: this.model.command.get(options.newFieldNameKey)
                });

                // We should bail from adding any invalid field names - validation will display the right message
                if (!datasetUtils.isValidFieldName(values.name)) {
                    return;
                }

                // We NEVER add a column with the same name as another in our table!
                if (!currentCommandColumns.findWhere({ name: values.name })) {
                    // If addedColumnGuids is falsy, then we haven't added this column before. Thus, we should add it.
                    // You can also pass alreadyVetted: true to ignore this check and add anyway. You would do this when
                    // bulk adding columns and vetting that this field should be added, since it's likely addedColumnGuids
                    // is truthy even though you still need to add stuff. See addNewFields as an example.
                    if (options.alreadyVetted || !addedColumnGuids || !addedColumnGuids.length) {
                        currentCommandColumns.add(values, {
                            at: options.addIndex + options.offsetForAddIndex,
                            validate: true
                        });
                    // If we don't need to add the column, then the only thing we need to worry about is if the column changed
                    // names. If it did, then we need to update its name. Any other attributes will get handled in setFromCommandJSON.
                    } else if (values.name !== this.model.commandPristine.get(options.newFieldNameKey)) {
                        staleColumn = currentCommandColumns.findWhere({ name: this.model.commandPristine.get(options.newFieldNameKey) });
                        staleColumn.set('name', values.name);
                    }
                }
            },

            setScrollWidthToAddedColumns: function() {
                var previousIdx = this.model.table.getCurrentCommandIdx() - 1,
                    previousColumns = previousIdx < 0 ? [] : this.model.table.commands.at(previousIdx).columns,
                    fnOptions = previousColumns.length ? {comparisonColumnsCollection: previousColumns} : {},
                    newColumns = this.model.command.getAddedColumnGuids(fnOptions) || [],
                    index = -1,
                    // We have to include the width of the select all column
                    sumOfWidths = ColumnModel.WIDTH_SELECT_ALL;

                // Get the last index in the list of column IDs
                if (newColumns.length) {
                    // Iterate through and escape the loop as soon as the first item is found
                    _.find(this.model.command.columns.pluck('id'), function(columnId, idx) {
                        if (_.contains(newColumns, columnId)) {
                            index = idx;
                            return true;
                        }
                    }.bind(this));
                }

                // If the index isn't at least 1, we have no where to scroll to
                if (index < 1) {
                    return;
                }

                // Scroll to the first added column, but include the selected column next to it.
                for (var i = 0; i < index - 1; i++) {
                    sumOfWidths += this.model.command.columns.at(i).getWidth();
                }

                this.model.table.entry.content.set('dataset.display.scrollLeft', sumOfWidths);
            },

            // Having this method proxy to the table model lets it be overridden by other editorforms
            setCollidingFieldNames: function() {
                this.model.table.setCollidingFieldNames({
                    command: this.model.command,
                    commandPristine: this.model.commandPristine
                });
            },

            verifyRemovedFields: function(options) {
                options = options || {};

                var fieldIdsToVerify = options.fieldIdsToVerify,
                    challengeFields;

                if (!fieldIdsToVerify) {
                    // Default to checking the difference between the inmem and pristine commands
                    fieldIdsToVerify = this.model.commandPristine.getAddedColumnGuids({
                        comparisonColumnsCollection: this.model.command.columns
                    });
                }

                if (fieldIdsToVerify && fieldIdsToVerify.length) {
                    challengeFields = this.model.table.commands.validateSubsequentCommands(
                        fieldIdsToVerify,
                        this.model.table.getCurrentCommandIdx()
                    );

                    if (challengeFields && challengeFields.length) {
                        this.children.fieldRemovalDialog && this.children.fieldRemovalDialog.deactivate({ deep: true }).remove();
                        this.children.fieldRemovalDialog = new FieldRemovalDialog({
                            fields: _.invoke(challengeFields, 'get', 'name')
                        });
                        this.children.fieldRemovalDialog.render().appendTo($('body')).show();
                        this.listenTo(this.children.fieldRemovalDialog, 'accepted', function() {
                            options.acceptCallback && options.acceptCallback();
                        });
                        this.listenTo(this.children.fieldRemovalDialog, 'declined', function() {
                            options.declineCallback && options.declineCallback();
                        });

                        return;
                    }
                }

                options.acceptCallback && options.acceptCallback();
            },

            getFieldPickerItems: function(options) {
                options = options || {};
                var columns = this.model.commandPristine.collection.getPreviousCommandColumns(this.model.commandPristine),
                    items = [];

                columns.each(function(col) {
                    if (!this.model.commandPristine.isTypeBlacklisted(col.get('type'))){
                        if (!options.blacklist || !_.contains(options.blacklist, col.get('type'))) {
                            items.push({value: col.id, label: col.get('name')});
                        }
                    }
                }, this);

                return items;
            },

            appendButtons: function(container) {
                var $buttonContainer = $(BUTTON_CONTAINER);
                $buttonContainer.appendTo(container || this.$el);
                $(BUTTON_CANCEL).appendTo($buttonContainer.find(BUTTON_CONTAINER_SELECTOR));
                $(BUTTON_APPLY).appendTo($buttonContainer.find(BUTTON_CONTAINER_SELECTOR));
                this.updateButtonStates();
            },

            getColIndexForNewColumn: function(currentCommandColumnsArray, referencedFields) {
                if (referencedFields) {
                    var i = currentCommandColumnsArray.length - 1;

                    // Iterate over the columns in reverse order. As soon as we find a column that was in
                    // the referenced fields, we return i+1, aka the right of that column.
                    for (; i >= 0; i--) {
                        if (referencedFields.indexOf(currentCommandColumnsArray[i]) > -1) {
                            return i + 1;
                        }
                    }
                }
                return currentCommandColumnsArray.length;
            },

            replaceCurrentCommand: function(options) {
                options = options || {};

                var at = this.model.table.commands.indexOf(this.model.commandPristine),
                    values = options.values ? options.values : this.model.state.get('previousJSON'),
                    dfd;

                if (!values) {
                    throw new Error('Tried to replace a command with no values passed in and no previous JSON to return to!');
                }

                this.model.table.commands.remove(this.model.commandPristine, { silent: true });
                this.model.state.set({
                    fastRoute: true
                });
                dfd = this.model.table.commands.addNewCommand(values, {
                    at: at,
                    // When using the escape hatch, we want the editor open, even though the command could be complete
                    forceOpenEditor: true
                });
                return dfd;
            },

            appendAdvancedEditorLink: function($container) {
                var $buttonContainer = $container || this.$el,
                    linkDisplayText = '',
                    $linkEl = $(ADVANCED_EDITOR_LINK);

                switch (this.model.command._advancedCommand) {
                    case BaseCommandModel.EVAL:
                        linkDisplayText = _('Edit as eval command').t();
                        break;

                    case BaseCommandModel.EVAL_EXISTING_FIELD:
                        linkDisplayText = _('Edit as eval command').t();
                        break;

                    case BaseCommandModel.SEARCH:
                        linkDisplayText = _('Edit as search command').t();
                        break;

                    case BaseCommandModel.WHERE:
                        linkDisplayText = _('Edit as where command').t();
                        break;

                    case BaseCommandModel.ADVANCED_REX:
                        linkDisplayText = _('Edit as rex command').t();
                        break;
                }

                $linkEl.text(linkDisplayText);
                $linkEl.appendTo($buttonContainer);
            },

            appendAdvancedEditorReturnLink: function($container) {
                var $buttonContainer = $container || this.$el,
                    linkDisplayText = _('Return to simple editor').t(),
                    $linkEl = $(ADVANCED_EDITOR_RETURN_LINK);

                $linkEl.text(linkDisplayText);
                $linkEl.appendTo($buttonContainer);
            },

            getHelpLink: function(locationString) {
                var appName = UserModel.CORE_JS_APP_NAMES.DATASETS_EXTENSIONS,
                    localApp = this.collection.appLocals.find(function(localApp) { return localApp.entry.get('name') === appName; }),
                    appVersion = localApp && localApp.entry.content.get('version'),
                    isCoreApp = false,
                    appDocSectionOverride = false; // use [appName:appVersion] location prefix

                return route.docHelpInAppContext(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    locationString,
                    appName,
                    appVersion,
                    isCoreApp,
                    appDocSectionOverride
                );
            }

        }, {
            CLASS_NAME: CLASS_NAME,
            COMMANDEDITOR_SECTION: COMMANDEDITOR_SECTION,
            COMMANDEDITOR_SECTION_SELECTOR: COMMANDEDITOR_SECTION_SELECTOR,
            BUTTON_CONTAINER: BUTTON_CONTAINER,
            BUTTON_APPLY: BUTTON_APPLY,
            BUTTON_CANCEL: BUTTON_CANCEL,
            BUTTON_EDIT: BUTTON_EDIT,
            BUTTON_CONTAINER_SELECTOR: BUTTON_CONTAINER_SELECTOR,
            BUTTON_APPLY_SELECTOR: BUTTON_APPLY_SELECTOR,
            BUTTON_CANCEL_SELECTOR: BUTTON_CANCEL_SELECTOR,
            ADVANCED_EDITOR_SELECTOR: ADVANCED_EDITOR_SELECTOR,
            ADVANCED_EDITOR_RETURN_SELECTOR: ADVANCED_EDITOR_RETURN_SELECTOR
        });
    }
);
