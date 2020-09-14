define([
    'jquery',
    'underscore',
    './Util'
], function (
    $,
    _,
    util
) {
    var tdTPL = _.template('<td><%= link %></td>');
    return {
        events: {
            'click .link-type': function (e) {
                e.preventDefault();
                var $e = $(e.currentTarget);
                this.radio.trigger('link:' + $e.data('fires') + ':click', {no: $e.data('no')});
            }
        },
        rowTypes: {
            link: function (column, model, count, totalCounter) {
                return tdTPL({
                        link: util.getLink(column, model, count, totalCounter, {
                                className: 'link-type',
                                label: util.getValueUsingComplexKey(model, column.key)
                              }, true)
                    });
            }
        }
    };
});
