define(
    [
        'underscore',
        'module',
        'views/table/resultscontainer/actionbar/actionmenus/BaseMenu',
        'models/datasets/Column',
        'models/datasets/commands/Base',
        'models/datasets/commands/ChangeCase',
        'models/datasets/commands/FillValues',
        'models/datasets/commands/Replace',
        'models/datasets/commands/RemoveNonNumericalValues',
        'models/datasets/commands/EvalExistingField',
        'models/datasets/commands/Round',
        'models/datasets/commands/Bucket'
    ],
    function(
        _,
        module,
        BaseMenu,
        ColumnModel,
        BaseCommandModel,
        ChangeCaseModel,
        FillValuesModel,
        ReplaceModel,
        RemoveNonNumericalValuesModel,
        EvalExistingFieldModel,
        RoundModel,
        BucketModel
    ) {
        return BaseMenu.extend({
            moduleId: module.id,
            commandMenuItems: [
                {
                    className: 'clean-changecase',
                    label: _('Change Case...').t(),
                    commandConfigs: ChangeCaseModel.getDefaults()
                },
                {
                    className: 'clean-fill-values',
                    label: _('Fill Null or Empty Values...').t(),
                    commandConfigs: FillValuesModel.getDefaults()
                },
                {
                    className: 'clean-replace-values',
                    label: _('Replace Values...').t(),
                    commandConfigs: ReplaceModel.getDefaults(),
                    prepareOptions: function(commandConfigs) {
                        var options,
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
                            isText: isText
                        };

                        return options;
                    }
                },
                {
                     className: 'clean-round',
                     label: _('Round Values').t(),
                     commandConfigs: RoundModel.getDefaults()
                },
                {
                    className: 'clean-remove-non-numerical-values',
                    label: _('Remove Non-Numerical Values').t(),
                    commandConfigs: RemoveNonNumericalValuesModel.getDefaults()
                },
                {
                     className: 'clean-bucket',
                     label: _('Bucket...').t(),
                     insertDividerAfter: true,
                     commandConfigs: BucketModel.getDefaults()
                },
                {
                    className: 'advanced-eval',
                    label: _('Eval Expression...').t(),
                    description: _('Advanced').t(),
                    commandConfigs: _.extend(EvalExistingFieldModel.getDefaults()),
                    prepareOptions: function(commandConfigs) {
                        var currentCommand = this.model.table.getCurrentCommandModel(),
                            options = {};

                        if (this.model.table.selectedColumns.length === 1) {
                            options.columnName = currentCommand.getFieldNameFromGuid(this.model.table.selectedColumns.first());
                        }

                        return options;
                    }
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
                    shouldAllow = _.any(selectedColumnTypes, function(type) {
                            return type === ColumnModel.TYPES.NUMBER;
                        }, this);

                if (this.model.table.entry.content.get('dataset.display.isSelectionError') && shouldAllow) {
                    // We will enable remove non numerical values if you click on a cell in error in a numerical column
                    if (menuItem.className === 'clean-remove-non-numerical-values') {
                        return false;
                    }
                }

                return BaseMenu.prototype.shouldDisableMenuItem.apply(this, arguments);
            }
        });
    });
