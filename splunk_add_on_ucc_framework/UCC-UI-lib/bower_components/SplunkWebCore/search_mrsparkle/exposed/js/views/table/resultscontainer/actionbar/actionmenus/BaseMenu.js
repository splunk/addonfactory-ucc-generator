define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/PolymorphicCommand',
        'views/shared/PopTart'
    ],
    function(
        $,
        _,
        module,
        PolymorphicCommand,
        PopTartView
    ) {
        return PopTartView.extend({
            moduleId: module.id,
            className: 'dropdown-menu dataset-action-menu-dropdown',

            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click .command-menu-item': function(e) {
                    e.preventDefault();

                    var $target = $(e.target),
                        itemName = $target.data('item-name'),
                        item = _.where(this.commandMenuItems, { className: itemName })[0];

                    if (!$target.hasClass('disabled')) {
                        this.handleActionClicked(item);
                    }
                }
            },

            handleActionClicked: function(item) {
                var callback = function() {
                        this.createCommand(item.commandConfigs, item.prepareOptions);
                    }.bind(this),
                    fields;

                // If this can break subsequent commands, validate the selected columns being altered
                // that will in turn affect commands further down the command chain
                if (item.validateSubsequentCommands) {
                    fields = this.model.table.commands.validateSubsequentCommands(
                        this.model.table.selectedColumns.pluck('id'),
                        this.model.table.getCurrentCommandIdx()
                    );

                    if (fields) {
                        // Can't create the field dialog here because we need the poptart to hide, which will destroy
                        // all children. Parent will take care of it.
                        this.model.state.trigger('showFieldDialog', {
                            fields: _.invoke(fields, 'get', 'name'),
                            callback: callback
                        });
                    } else {
                        callback();
                    }
                } else if (item.commandConfigs) {
                    callback();
                }

                this.hide();
            },

            createCommand: function(commandConfigs, prepareOptionsFn) {
                var options = {
                        initialStateOptions: prepareOptionsFn ? prepareOptionsFn.call(this, commandConfigs) : {},
                        at: this.model.table.getCurrentCommandIdx() + 1
                    },
                    combinedValues = $.extend(true, {}, commandConfigs, {
                        selectedColumns: this.model.table.selectedColumns.pluck('id')
                    });
                
                // If the command is not going to be complete when we add it, we should
                // not re-render the entire table and have to re-populate all of the models
                // and collections.
                if (!combinedValues.isComplete) {
                    this.model.state.set('fastRoute', true);
                }

                this.model.table.commands.addNewCommand(combinedValues, options);
            },

            createCommandMenuItems: function() {
                _.each(this.commandMenuItems, function(menuItem) {
                    var linkDescription = menuItem.description ? '<span class="link-description">' + menuItem.description + '</span>' : '',
                        $menuItem = $('<li><a href="#" class="command-menu-item command-menu-' + menuItem.className +
                        '" data-item-name="' + menuItem.className + '">' + linkDescription + menuItem.label + '</a></li>');

                    // Checks the whitelist/blacklist of each Menu Item to disable
                    // ones that are invalid for this selection operation
                    if (menuItem.disabled) {
                        $menuItem.find('a.command-menu-item').addClass('disabled');
                    }
                    this.$('.action-menu-items').append($menuItem);
                    if (menuItem.insertDividerAfter) {
                        this.$('.action-menu-items').append($('<li class="divider"></li>'));
                    }
                }.bind(this));
            },

            updateDisabledState: function() {
                if (!this.model.table.commands || this.model.table.commands.length === 0) {
                    return;
                }
                _.each(this.commandMenuItems, function(menuItem) {
                    menuItem.disabled = this.shouldDisableMenuItem(menuItem);
                }.bind(this));
            },

            // Tells parent whether all Menu Items in this Dropdown are disabled
            // so that the parent can disable the activator/ActionBarItem as well
            allChildrenDisabled: function() {
                return _.every(this.commandMenuItems, function(menuItem) {
                    return menuItem.disabled;
                }.bind(this));
            },

            shouldDisableMenuItem: function(menuItem) {
                /*
                    Expects COMMAND_MENU_ITEMS/ACTION_MENU_ITEMS specification for each action menu item
                    to specify a blacklist that determines what Table selection causes that menu item
                    to become disabled.
                    An example of the 'blacklist' matrix syntax is:
                    blacklist: [
                        {
                            // Selection of whole table has no type, so there is no 'types' array expected
                            selection: 'table'
                        },
                        {
                            // Selection of a cell with a number or boolean type disables this menu item
                            selection: 'cell',
                            types: ['number', 'boolean']
                        },
                        {
                            // Selection of multiple columns of any types disables this menu item
                            // (If no 'types' array is specified, all of that selection's types are blacklisted)
                            selection: 'multicolumn'
                        }
                        // All single column selections enable this menu item
                        // (If a selection's dictionary is not specified, none of that selection's types are blacklisted)
                    ]
                */
                // Action Menu Items have a blacklist directly defined on itself because it does not have a corresponding Command Model
                // However, Command Menu Items must get their blacklist from the Command Model
                var blacklist = menuItem.blacklist || PolymorphicCommand.getBlacklist(menuItem.commandConfigs),
                    selectedColumnGuids = this.model.table.selectedColumns.pluck('id'), // column guids
                    selectionType = this.model.table.entry.content.get('dataset.display.selectionType'), // e.g. 'cell'
                    columns = this.model.table.getCurrentCommandModel().columns,
                    selectedColumnCount = selectedColumnGuids && selectedColumnGuids.length,
                    isMultiColumnSelection = selectedColumnCount > 1,
                    blacklistedColumn,
                    selectedColumn,
                    selectedColumnGuid,
                    fieldType;

                // TODO: Rex command does not currently work in Data Summary Mode.
                // Will re-enable when rex generation logic has moved to Python.
                if (!this.model.table.isTableMode() && menuItem.disableForSummaryMode) {
                    return true;
                }

                if (isMultiColumnSelection) {
                    // No need to look at selectionType
                    // but must iterate over selectedColumnGuids' columns to check each column type
                    // and make sure none of them are specified in the blacklist
                    blacklistedColumn = _.find(selectedColumnGuids, function(guid) {
                        selectedColumn = columns.get(guid);
                        if (selectedColumn) {
                            fieldType = selectedColumn.get('type');
                            return this.isBlacklisted(blacklist, 'multicolumn', fieldType);
                        }
                    }.bind(this));
                    if (blacklistedColumn) {
                        return true;
                    }
                    return false;
                } else if (selectedColumnCount === 1) {
                    // Single Column Selected
                    selectedColumnGuid = selectedColumnGuids[0];
                    // Look up column by GUID
                    selectedColumn = columns.get(selectedColumnGuid);
                    if (selectedColumn) {
                        // Figure out column's field type
                        fieldType = selectedColumn.get('type');
                        if (this.isBlacklisted(blacklist, selectionType, fieldType)) {
                            return true;
                        }
                        return false;
                    }
                } else if (selectedColumnCount === 0) {
                    // Table Selected
                    if (this.isBlacklisted(blacklist, 'table')) {
                        return true;
                    }
                    return false;
                }
            },

            isBlacklisted: function(blacklist, selectionType, fieldType) {
                var selectionDict = _.where(blacklist, { selection: selectionType }),
                    typesArray,
                    allTypesBlacklisted,
                    typeBlacklisted;
                if (selectionDict.length > 0) {
                    typesArray = selectionDict[0].types;
                    allTypesBlacklisted = !typesArray;
                    typeBlacklisted = typesArray && typesArray.indexOf(fieldType) !== -1;
                    if (allTypesBlacklisted || typeBlacklisted) {
                        return true;
                    }
                }
                return false;
            },

            render: function() {
                this.$el.html(PopTartView.prototype.template_menu);
                this.$el.append(this.compiledTemplate({}));
                this.createCommandMenuItems();
                return this;
            },

            template: '\
                <ul class="action-menu-items"></ul>\
            '
        },
        // TODO: Remove SELECTION dictionary when all Action Menus have
        // moved their blacklists to their Command Models
        {
            SELECTION: {
                TABLE: 'table',
                MULTICOLUMN: 'multicolumn',
                COLUMN: 'column',
                CELL: 'cell',
                TEXT: 'text'
            }
        });
    }
);
