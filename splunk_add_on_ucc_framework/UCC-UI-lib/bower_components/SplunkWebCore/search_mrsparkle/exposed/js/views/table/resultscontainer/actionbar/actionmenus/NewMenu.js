define(
    [
        'underscore',
        'module',
        'models/datasets/Column',
        'models/datasets/commands/Base',
        'models/datasets/commands/Rex',
        'models/datasets/commands/ExtractDateTime',
        'models/datasets/commands/Join',
        'models/datasets/commands/Duplicate',
        'models/datasets/commands/Coalesce',
        'models/datasets/commands/Concatenate',
        'models/datasets/commands/Rangemap',
        'models/datasets/commands/Eval',
        'models/datasets/commands/AdvancedRex',
        'models/datasets/commands/Split',
        'models/datasets/commands/CalculateField',
        'views/table/resultscontainer/actionbar/actionmenus/BaseMenu'
    ],
    function(
        _,
        module,
        ColumnModel,
        BaseCommand,
        RexCommand,
        ExtractDateTimeCommand,
        JoinCommand,
        DuplicateCommand,
        CoalesceCommand,
        ConcatenateCommand,
        RangemapCommand,
        EvalCommand,
        AdvancedRexCommand,
        SplitCommand,
        CalculateFieldCommand,
        BaseMenu
    ) {
        return BaseMenu.extend({
            moduleId: module.id,
            commandMenuItems: [
                {
                    className: 'enrich-calculated-field',
                    label: _('Calculate Field...').t(),
                    commandConfigs: CalculateFieldCommand.getDefaults()
                },
                {
                    className: 'enrich-extract-text',
                    label: _('Extract Selected Text...').t(),
                    commandConfigs: RexCommand.getDefaults(),
                    prepareOptions: function(commandConfigs) {
                        return {
                            startPosition: this.model.table.entry.content.get('dataset.display.selectedStart'),
                            endPosition: this.model.table.entry.content.get('dataset.display.selectedEnd'),
                            fullText: this.model.table.entry.content.get('dataset.display.selectedColumnValue'),
                            selectedText: this.model.table.entry.content.get('dataset.display.selectedText')
                        };
                    }
                },
                // Not in Alpha V1 Release
                // {
                //     className: 'enrich-extract-value-at-index',
                //     label: _('Get Value at Index...').t(),
                //     commandConfigs: {
                //         type: 'extractValue'
                //     },
                //     blacklist: [
                //         { selection: BaseMenu.SELECTION.MULTICOLUMN },
                //         { selection: BaseMenu.SELECTION.TABLE },
                //         { selection: BaseMenu.SELECTION.TEXT }
                //     ]
                // },
                // {
                //     className: 'enrich-extract-epoch-time',
                //     label: _('Parse String to Epoch Time...').t(),
                //     commandConfigs: {
                //         type: 'extractEpochTime'
                //     },
                //     blacklist: [
                //         { selection: BaseMenu.SELECTION.CELL },
                //         {
                //             selection: BaseMenu.SELECTION.COLUMN,
                //             types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES.NUMBER, ColumnModel.TYPES.BOOLEAN,
                //                 ColumnModel.TYPES.IPV4, ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._TIME  ]
                //         },
                //         { selection: BaseMenu.SELECTION.MULTICOLUMN },
                //         { selection: BaseMenu.SELECTION.TABLE },
                //         { selection: BaseMenu.SELECTION.TEXT }
                //     ]
                // },
                {
                    className: 'enrich-extract-date-time',
                    label: _('Format Timestamp...').t(),
                    insertDividerAfter: true,
                    commandConfigs: ExtractDateTimeCommand.getDefaults()
                },
                {
                    className: 'enrich-join',
                    label: _('Join from Lookup...').t(),
                    insertDividerAfter: true,
                    commandConfigs: JoinCommand.getDefaults()
                },
                {
                    className: 'fields-duplicate',
                    label: _('Duplicate Field...').t(),
                    commandConfigs: DuplicateCommand.getDefaults(),
                    prepareOptions: function(commandConfigs) {
                        var currentCommand = this.model.table.getCurrentCommandModel();

                        return {
                            columnName: currentCommand.getFieldNameFromGuid(this.model.table.selectedColumns.first())
                        };
                    }
                },
                {
                    className: 'fields-coalesce',
                    label: _('Coalesce Fields...').t(),
                    commandConfigs: CoalesceCommand.getDefaults()
                },
                {
                    className: 'fields-concatenate',
                    label: _('Concatenate Fields or Text...').t(),
                    commandConfigs: ConcatenateCommand.getDefaults()
                },
                {
                    className: 'enrich-map-ranges',
                    label: _('Map Ranges...').t(),
                    insertDividerAfter: true,
                    commandConfigs: RangemapCommand.getDefaults(),
                    prepareOptions: function(commandConfigs) {
                        if (this.model.table.entry.content.get('dataset.display.selectionType') === BaseCommand.SELECTION.CELL) {
                            return {
                                selectionValue: this.model.table.entry.content.get('dataset.display.selectedColumnValue')
                            };
                        }
                    }
                },
                {
                    className: 'fields-split',
                    label: _('Split Fields...').t(),
                    commandConfigs: SplitCommand.getDefaults()
                },
                {
                    className: 'advanced-eval',
                    label: _('Eval Expression...').t(),
                    description: _('Advanced').t(),
                    commandConfigs: EvalCommand.getDefaults()
                },
                {
                    className: 'advanced-extract-with-regex',
                    label: _('Extract with Regular Expression...').t(),
                    description: _('Advanced').t(),
                    commandConfigs: AdvancedRexCommand.getDefaults()
                }
            ],

            initialize: function() {
                BaseMenu.prototype.initialize.apply(this, arguments);
            }
        });
    });
