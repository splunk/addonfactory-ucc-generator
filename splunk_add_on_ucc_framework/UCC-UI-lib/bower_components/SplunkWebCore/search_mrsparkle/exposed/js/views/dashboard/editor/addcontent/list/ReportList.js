define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/editor/addcontent/list/BaseList',
        'views/dashboard/editor/addcontent/list/items/ReportItem'
    ],
    function(module,
             $,
             _,
             BaseList,
             ReportItem) {

        return BaseList.extend({
            moduleId: module.id,
            className: 'report-list',
            initialize: function(options) {
                BaseList.prototype.initialize.apply(this, arguments);
            },
            _createEntryView: function(entryModel) {
                return new ReportItem({
                    model: {
                        sidebarState: this.model.sidebarState,
                        report: entryModel
                    }
                });
            }
        });
    });