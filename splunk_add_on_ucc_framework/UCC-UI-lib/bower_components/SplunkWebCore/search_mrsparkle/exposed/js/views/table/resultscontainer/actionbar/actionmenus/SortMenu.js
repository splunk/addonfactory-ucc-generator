define(
    [
        'underscore',
        'module',
        'views/table/resultscontainer/actionbar/actionmenus/BaseMenu',
        'models/datasets/commands/Sort'
    ],
    function(
        _,
        module,
        BaseMenu,
        SortCommand
        ) {
        return BaseMenu.extend({
            moduleId: module.id,
            commandMenuItems: [
                {
                    className: 'sort-ascending',
                    label: _('Sort Ascending').t(),
                    commandConfigs: SortCommand.getDefaults(),
                    prepareOptions: function(commandConfigs) {
                        return { order: 'ascending' };
                    }
                },
                {
                    className: 'sort-descending',
                    label: _('Sort Descending').t(),
                    commandConfigs: SortCommand.getDefaults(),
                    prepareOptions: function(commandConfigs) {
                        return { order: 'descending' };
                    }
                }
            ],

            initialize: function() {
                BaseMenu.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
