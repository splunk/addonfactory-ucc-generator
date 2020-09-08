define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/editor/addcontent/list/BaseList',
        'views/dashboard/editor/addcontent/list/items/PrebuiltPanelItem'
    ],
    function(module,
             $,
             _,
             BaseList,
             PrebuiltPanelItem) {

        return BaseList.extend({
            className: 'prebuilt-panel-list',
            moduleId: module.id,
            initialize: function(options) {
                BaseList.prototype.initialize.apply(this, arguments);
            },
            _createEntryView: function(entryModel) {
                return new PrebuiltPanelItem({
                    model: {
                        sidebarState: this.model.sidebarState,
                        panel: entryModel
                    }
                });
            }
        });
    });