define(
    [
        'underscore',
        'module',
        'views/table/resultscontainer/actionbar/actionmenus/BaseMenu',
        'models/datasets/Column',
        'models/datasets/commands/Base',
        'models/datasets/commands/FilterValues',
        'models/datasets/commands/Dedup',
        'models/datasets/commands/Truncate',
        'models/datasets/commands/Search',
        'models/datasets/commands/FilterRegex'

    ],
    function(
        _,
        module,
        BaseMenu,
        ColumnModel,
        BaseCommandModel,
        FilterValuesModel,
        DedupModel,
        TruncateModel,
        SearchModel,
        FilterRegexModel
    ) {
        var prepareFilterOptions = function(commandConfigs) {
            var options = {
                    initialComparator: commandConfigs.initialComparator
                },
                selectionType = this.model.table.entry.content.get('dataset.display.selectionType'),
                selectedValue = this.model.table.entry.content.get('dataset.display.selectedColumnValue');

            if (selectionType === BaseCommandModel.SELECTION.CELL && selectedValue === "") {
                if (commandConfigs.initialComparator === FilterValuesModel.filterTypes['EQUALS']) {
                    options.initialComparator = FilterValuesModel.filterTypes['ISEMPTY'];
                } else if (commandConfigs.initialComparator === FilterValuesModel.filterTypes['DOESNOTEQUAL']) {
                    options.initialComparator = FilterValuesModel.filterTypes['ISNOTEMPTY'];
                }
            } else if (selectionType === BaseCommandModel.SELECTION.CELL && _.isNull(selectedValue)) {
                if (commandConfigs.initialComparator === FilterValuesModel.filterTypes['EQUALS']) {
                    options.initialComparator = FilterValuesModel.filterTypes['ISNULL'];
                } else if (commandConfigs.initialComparator === FilterValuesModel.filterTypes['DOESNOTEQUAL']) {
                    options.initialComparator = FilterValuesModel.filterTypes['ISNOTNULL'];
                }
            }
            
            if (selectionType === BaseCommandModel.SELECTION.CELL) {
                options.cellVal = _.isNull(selectedValue) ? "null" : selectedValue;
            } else if (selectionType === BaseCommandModel.SELECTION.TEXT) {
                options.textVal = this.model.table.entry.content.get('dataset.display.selectedText');
            }

            return options;
        };

        return BaseMenu.extend({
            moduleId: module.id,
            commandMenuItems: [
                {
                    className: 'filter-values',
                    label: _('Filter by Value...').t(),
                    commandConfigs: FilterValuesModel.getDefaults(),
                    insertDividerAfter: true,
                    prepareOptions: prepareFilterOptions
                },
                {
                    className: 'filter-equals-value',
                    label: _('Equals Selected Value').t(),
                    commandConfigs: FilterValuesModel.getDefaults({
                        initialComparator: FilterValuesModel.filterTypes['EQUALS'],
                        isComplete: true
                    }),
                    blacklist: [
                        { selection: BaseMenu.SELECTION.TEXT },
                        { selection: BaseMenu.SELECTION.COLUMN },
                        { selection: BaseMenu.SELECTION.CELL,
                            types: [ ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._TIME, ColumnModel.TYPES._RAW]
                        },
                        { selection: BaseMenu.SELECTION.MULTICOLUMN },
                        { selection: BaseMenu.SELECTION.TABLE }
                    ],
                    prepareOptions: prepareFilterOptions
                },
                {
                    className: 'filter-not-equals-value',
                    label: _('Does Not Equal Selected Value').t(),
                    commandConfigs: FilterValuesModel.getDefaults({
                        initialComparator: FilterValuesModel.filterTypes['DOESNOTEQUAL'],
                        isComplete: true
                    }),
                    blacklist: [
                        { selection: BaseMenu.SELECTION.TEXT },
                        { selection: BaseMenu.SELECTION.COLUMN },
                        { selection: BaseMenu.SELECTION.CELL,
                            types: [ ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._TIME, ColumnModel.TYPES._RAW]
                        },
                        { selection: BaseMenu.SELECTION.MULTICOLUMN },
                        { selection: BaseMenu.SELECTION.TABLE }
                    ],
                    prepareOptions: prepareFilterOptions
                },
                {
                    className: 'filter-contains-selection',
                    label: _('Contains Selected Text').t(),
                    commandConfigs: FilterValuesModel.getDefaults({
                        initialComparator: FilterValuesModel.filterTypes['CONTAINS'],
                        isComplete: true
                    }),
                    blacklist: [
                        { selection: BaseMenu.SELECTION.CELL },
                        { selection: BaseMenu.SELECTION.COLUMN },
                        { selection: BaseMenu.SELECTION.TEXT,
                            types: [ ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._TIME, ColumnModel.TYPES.BOOLEAN, ColumnModel.TYPES.NUMBER ]
                        },
                        { selection: BaseMenu.SELECTION.MULTICOLUMN },
                        { selection: BaseMenu.SELECTION.TABLE }
                    ],
                    prepareOptions: prepareFilterOptions
                },
                {
                    className: 'filter-not-contains-selection',
                    label: _('Does Not Contain Selected Text').t(),
                    commandConfigs: FilterValuesModel.getDefaults({
                        initialComparator: FilterValuesModel.filterTypes['DOESNOTCONTAIN'],
                        isComplete: true
                    }),
                    blacklist: [
                        { selection: BaseMenu.SELECTION.CELL },
                        { selection: BaseMenu.SELECTION.COLUMN },
                        { selection: BaseMenu.SELECTION.TEXT,
                            types: [ ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._TIME, ColumnModel.TYPES.BOOLEAN, ColumnModel.TYPES.NUMBER ]
                        },
                        { selection: BaseMenu.SELECTION.MULTICOLUMN },
                        { selection: BaseMenu.SELECTION.TABLE }
                    ],
                    prepareOptions: prepareFilterOptions
                },
                {
                    className: 'filter-remove-null-values',
                    label: _('Is Not Null').t(),
                    insertDividerAfter: true,
                    commandConfigs: FilterValuesModel.getDefaults({
                        initialComparator: FilterValuesModel.filterTypes['ISNOTNULL'],
                        isComplete: true
                    }),
                    blacklist: [
                        { selection: BaseMenu.SELECTION.CELL },
                        { selection: BaseMenu.SELECTION.COLUMN,
                            types: [ ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._TIME, ColumnModel.TYPES._RAW ]
                        },
                        { selection: BaseMenu.SELECTION.MULTICOLUMN,
                            types: [ ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._TIME, ColumnModel.TYPES._RAW ]
                        },
                        { selection: BaseMenu.SELECTION.TABLE },
                        { selection: BaseMenu.SELECTION.TEXT }
                    ],
                    prepareOptions: prepareFilterOptions
                },
                {
                    className: 'filter-remove-duplicates',
                    label: _('Remove Duplicates').t(),
                    insertDividerAfter: true,
                    commandConfigs: DedupModel.getDefaults()
                },
                {
                    className: 'filter-truncate',
                    label: _('Limit Rows').t(),
                    insertDividerAfter: true,
                    commandConfigs: TruncateModel.getDefaults()
                },
                {
                    className: 'advanced-search',
                    label: _('Search...').t(),
                    description: _('Advanced').t(),
                    commandConfigs: SearchModel.getDefaults(),
                    prepareOptions: function(commandConfigs) {
                        var options,
                            currentCommand = this.model.table.getCurrentCommandModel(),
                            selectionType = this.model.table.entry.content.get('dataset.display.selectionType'),
                            selectionValue,
                            isText = false;

                        if (selectionType === BaseCommandModel.SELECTION.TEXT) {
                            selectionValue = this.model.table.entry.content.get('dataset.display.selectedText');
                            isText = true;
                        } else if (selectionType === BaseCommandModel.SELECTION.CELL) {
                            selectionValue = this.model.table.entry.content.get('dataset.display.selectedColumnValue');
                        }

                        options = {
                            selectionValue: selectionValue,
                            isText: isText,
                            columnName: currentCommand.getFieldNameFromGuid(this.model.table.selectedColumns.first())
                        };

                        return options;
                    }
                },
                // Not in Alpha V1 Release
                // {
                //     className: 'advanced-where',
                //     label: _('Where...').t(),
                //     description: _('Advanced').t(),
                //     commandConfigs: {
                //         type: 'where'
                //     },
                //     blacklist: []
                // },
                {
                    className: 'advanced-match-with-regex',
                    label: _('Match Regular Expression...').t(),
                    description: _('Advanced').t(),
                    commandConfigs: FilterRegexModel.getDefaults()
                }
            ],

            initialize: function() {
                BaseMenu.prototype.initialize.apply(this, arguments);
            },

            shouldDisableMenuItem: function(menuItem) {
                var selectedColumnGuids = this.model.table.selectedColumns.pluck('id'),
                    selectedColumnModels = this.model.table.getCurrentCommandModel().columns.filter(function(col) {
                            return selectedColumnGuids.indexOf(col.get('id')) > -1;
                        }, this),
                    selectedColumnTypes = _.map(selectedColumnModels, function(selectedColumnModel) {
                            return selectedColumnModel.get('type');
                        }),
                    shouldRestrict = _.any(selectedColumnTypes, function(type) {
                            return type === ColumnModel.TYPES.NUMBER || type === ColumnModel.TYPES.BOOLEAN;
                        }, this);

                if (this.model.table.entry.content.get('dataset.display.isSelectionError') && shouldRestrict) {
                    // We do a different type of comparison for booleans & numbers that don't work when you
                    // try to compare disparate types (e.g. numerical comparison of != "bad_val" isn't valid SPL).
                    // We'll disable the filter menus in that case.
                    if (menuItem.className === 'filter-values' || menuItem.className === 'filter-equals-value' ||
                            menuItem.className === 'filter-not-equals-value') {
                        return true;
                    }
                }

                return BaseMenu.prototype.shouldDisableMenuItem.apply(this, arguments);
            }
        });
    }
);
