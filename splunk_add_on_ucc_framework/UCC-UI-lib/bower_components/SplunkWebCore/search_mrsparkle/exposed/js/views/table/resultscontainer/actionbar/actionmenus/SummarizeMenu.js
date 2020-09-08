define(
    [
        'underscore',
        'module',
        'views/table/resultscontainer/actionbar/actionmenus/BaseMenu',
        'models/datasets/commands/Stats',
        'models/datasets/commands/Base',
        'models/datasets/Column'
    ],
    function(
        _,
        module,
        BaseMenu,
        StatsModel,
        BaseCommandModel,
        ColumnModel
    ) {
        return BaseMenu.extend({
            moduleId: module.id,
            commandMenuItems: [
                {
                    className: 'summarize-stats',
                    label: _('Stats...').t(),
                    commandConfigs: StatsModel.getDefaults(),
                    prepareOptions: function(commandConfigs) {
                        var options,
                            selectionType = this.model.table.entry.content.get('dataset.display.selectionType'),
                            selectedColumns = JSON.parse(this.model.table.entry.content.get('dataset.display.selectedColumns')),
                            currentSelectedColumn,
                            currentSelectedColumnType,
                            aggregateGuids = [],
                            splitByGuids = [],
                            addRowCount = false;

                        if (selectionType === BaseCommandModel.SELECTION.COLUMN || selectionType === BaseCommandModel.SELECTION.MULTICOLUMN) {
                            _.each(selectedColumns, function(selectedColumn) {
                                currentSelectedColumn = this.model.table.getCurrentCommandModel().columns.get(selectedColumn.id);
                                currentSelectedColumnType = currentSelectedColumn.get('type');

                                // Numeric columns become aggregates
                                if (currentSelectedColumnType === ColumnModel.TYPES.NUMBER) {
                                    aggregateGuids.push(currentSelectedColumn.id);
                                // Everything else become split by fields
                                } else {
                                    splitByGuids.push(currentSelectedColumn.id);
                                }
                            }, this);
                        } else if (selectionType === BaseCommandModel.SELECTION.TABLE) {
                            addRowCount = true;
                        }


                        options = {
                            aggregateGuids: aggregateGuids,
                            splitByGuids: splitByGuids,
                            addRowCount: addRowCount
                        };

                        return options;
                    }
                }
            ],

            initialize: function() {
                BaseMenu.prototype.initialize.apply(this, arguments);
            }
        });
    });
