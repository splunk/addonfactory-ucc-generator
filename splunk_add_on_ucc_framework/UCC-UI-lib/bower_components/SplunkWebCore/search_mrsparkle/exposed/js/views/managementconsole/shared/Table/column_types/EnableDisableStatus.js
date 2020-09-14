define([
    'jquery',
    'underscore',
    'views/shared/basemanager/StatusCell',
    './Util'
], function (
    $,
    _,
    StatusCellView,
    util
) {
    return {
        rowTypes: {
            enableDisableStatus: function (column, model, count, totalCounter) {
                var status = new StatusCellView({model: {entity: model}});
                var html = $('<td></td>');
                status.render().appendTo(html);
                return html;
            }
        }
    };
});
