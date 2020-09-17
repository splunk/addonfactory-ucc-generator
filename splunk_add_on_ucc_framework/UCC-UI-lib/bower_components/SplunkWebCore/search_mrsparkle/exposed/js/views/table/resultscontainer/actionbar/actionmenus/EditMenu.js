define(
    [
        'underscore',
        'jquery',
        'module',
        'views/table/resultscontainer/actionbar/actionmenus/BaseMenu',
        'collections/datasets/Columns',
        'models/datasets/Column',
        'models/datasets/commands/RemoveFields',
        'models/datasets/commands/Rename'
    ],
    function(
        _,
        $,
        module,
        BaseMenu,
        ColumnsCollection,
        ColumnModel,
        RemoveFieldsCommandModel,
        RenameCommandModel
    ) {
        var TYPE = 'type',
            typesBlacklist = [
                { selection: BaseMenu.SELECTION.TABLE },
                { selection: BaseMenu.SELECTION.CELL },
                { selection: BaseMenu.SELECTION.COLUMN, types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES._TIME ] },
                { selection: BaseMenu.SELECTION.MULTICOLUMN, types: [ ColumnModel.TYPES._RAW, ColumnModel.TYPES._TIME ] },
                { selection: BaseMenu.SELECTION.TEXT }
            ];

        return BaseMenu.extend({
            moduleId: module.id,
            commandMenuItems: [
                {
                    className: 'fields-cut-and-move',
                    label: _('Move').t(),
                    insertDividerAfter: true,
                    blacklist: [
                        { selection: BaseMenu.SELECTION.CELL },
                        { selection: BaseMenu.SELECTION.TABLE },
                        { selection: BaseMenu.SELECTION.TEXT }
                    ]
                },
                {
                    className: 'fields-delete',
                    label: _('Delete').t(),
                    commandConfigs: RemoveFieldsCommandModel.getDefaults(),
                    validateSubsequentCommands: true
                },
                {
                    className: 'fields-rename',
                    label: _('Rename...').t(),
                    insertDividerAfter: true,
                    commandConfigs: RenameCommandModel.getDefaults(),
                    prepareOptions: function(commandConfigs) {
                        var currentCommand = this.model.table.getCurrentCommandModel();

                        return {
                            columnName: currentCommand.getFieldNameFromGuid(this.model.table.selectedColumns.first())
                        };
                    }
                },
                // FIELD TYPES
                {
                    className: 'type-string',
                    label: _('Type String').t(),
                    actionType: TYPE,
                    type: ColumnModel.TYPES.STRING,
                    blacklist: typesBlacklist
                },
                {
                    className: 'type-number',
                    label: _('Type Number').t(),
                    actionType: TYPE,
                    type: ColumnModel.TYPES.NUMBER,
                    blacklist: typesBlacklist
                },
                {
                    className: 'type-boolean',
                    label: _('Type Boolean').t(),
                    actionType: TYPE,
                    type: ColumnModel.TYPES.BOOLEAN,
                    blacklist: typesBlacklist
                },
                {
                    className: 'type-ipv4',
                    label: _('Type IPv4').t(),
                    actionType: TYPE,
                    type: ColumnModel.TYPES.IPV4,
                    blacklist: typesBlacklist
                },
                {
                    className: 'type-epoch-time',
                    label: _('Type Epoch Time').t(),
                    actionType: TYPE,
                    type: ColumnModel.TYPES.EPOCH_TIME,
                    blacklist: typesBlacklist
                }
            ],

            initialize: function() {
                BaseMenu.prototype.initialize.apply(this, arguments);
            },

            handleActionClicked: function(item) {
                if (item.className === 'fields-cut-and-move') {
                    this.model.state.set('activeActionBar', 'cutAndMove');
                } else if (item.actionType === TYPE) {
                    this.setType(item);
                }

                BaseMenu.prototype.handleActionClicked.apply(this, arguments);
            },

            setType: function(item) {
                var selectedColumnGuids = this.model.table.selectedColumns.pluck('id'),
                    currentCommandModel = this.model.table.getCurrentCommandModel();

                _.each(selectedColumnGuids, function(selectedColumnGuid) {
                    currentCommandModel.columns.get(selectedColumnGuid).set('type', item.type);
                }, this);

                this.model.table.trigger('applyAction', currentCommandModel, this.model.table.commands);
            },

            shouldDisableMenuItem: function(menuItem) {
                var baseDisable = BaseMenu.prototype.shouldDisableMenuItem.apply(this, arguments);

                if (baseDisable) {
                    return baseDisable;
                }

                if (menuItem.className === 'fields-cut-and-move') {
                    return !this.model.table.selectedColumns.length;
                }
            }
        });
    });
