define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/editor/addcontent/list/BaseList',
        'views/dashboard/editor/addcontent/list/items/DashboardItem',
        'util/keyboard'
    ],
    function(module,
             $,
             _,
             BaseList,
             DashboardItem,
             KeyboardUtil) {


        return BaseList.extend({
            className: 'dashboard-list',
            moduleId: module.id,
            initialize: function(options) {
                BaseList.prototype.initialize.apply(this, arguments);
            },
            _createEntryView: function(entryModel) {
                return new DashboardItem({
                    template: this.template,
                    model: {
                        sidebarState: this.model.sidebarState,
                        reportDefaults: this.model.reportDefaults,
                        dashboard: entryModel
                    },
                    deferreds: this.deferreds
                });
            }
        });
    });