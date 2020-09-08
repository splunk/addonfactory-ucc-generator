// Detail view for TCP input
// @author: nmistry
define([
    'underscore',
    'jquery',
    'module',
    'backbone',
    './BaseDetailsView'
], function (
    _,
    $,
    module,
    Backbone,
    BaseDetailsView
) {
    return BaseDetailsView.extend({
        moduleId: module.id,
        className: 'tcp-details',

        getTableColumns: function () {
            var columns = BaseDetailsView.prototype.getTableColumns.apply(this, arguments);
            columns.unshift({
                label: _('TCP Port').t(),
                key: 'entry.name',
                type: 'link',
                fires: 'editEntity',
                sortable: true,
                sortKey: 'name',
                enabled: _(this.canEdit).bind(this)
            });
            return columns;
        }
    });
});
