/**
 * This column type displays text and an icon
 * Upon mouseover on the icon, a tooltip is displayed
 */
define([
    'jquery',
    'underscore',
    './Util'
], function (
    $,
    _,

    Util
) {
    var tdTPL = _.template('' +
        '<td class="type-tooltip <%- key %>">' +
        '<%- value %>' +
        '<% if (_.isString(tooltipText) && tooltipText.length > 0) { %>' +
            '<a href="#" class="bundle-groups-icon icon-info-circle" data-toggle="tooltip" title="<%- tooltipText %>"></a>' +
        '<% } %>' +
        '</td>');
    return {
        rowTypes: {
            tooltip: function (column, model, count, totalCount) {
                var text = Util.getValueUsingComplexKey(model, column.key);
                var tooltipText = '';
                if (_.isString(column.tooltip)) {
                    tooltipText = Util.getValueUsingComplexKey(model, column.tooltip);
                } else if (_.isFunction(column.tooltip)) {
                    tooltipText = column.tooltip.call(this, column, model, count, totalCount);
                }
                var key = column.key.replace(/[.]/g, '_');

                var $el = $(
                    tdTPL({
                        value: text,
                        key: key,
                        tooltipText: tooltipText
                    })
                );
                $el.find('[data-toggle="tooltip"]').tooltip();

                return $el;
            }
        }
    };
});
