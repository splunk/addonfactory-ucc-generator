// Detail view for Scripted input
// @author: lbudchenko
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
        className: 'scripts-details',

        getTableColumns: function () {
            var columns = BaseDetailsView.prototype.getTableColumns.apply(this, arguments);
            columns.unshift({
                    label: this.strings.TBL_NAME,
                    key: 'entry.name',
                    type: 'link',
                    fires: 'editEntity',
                    sortable: true,
                    sortKey: 'name',
                    enabled: _(this.canEdit).bind(this)
            });
            columns.splice(2, 0, {
                    label: _('Interval').t(),
                    key: 'entry.content.interval',
                    type: 'dynamic'
            });
            return columns;
        }
    });
});
