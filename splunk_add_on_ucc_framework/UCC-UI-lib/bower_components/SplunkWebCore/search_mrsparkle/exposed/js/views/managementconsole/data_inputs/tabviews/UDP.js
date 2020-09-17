// Detail view for UDP input
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
        className: 'udp-details',

        getTableColumns: function () {
            var columns = BaseDetailsView.prototype.getTableColumns.apply(this, arguments);
            columns.unshift({
                label: _('UDP Port').t(),
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
