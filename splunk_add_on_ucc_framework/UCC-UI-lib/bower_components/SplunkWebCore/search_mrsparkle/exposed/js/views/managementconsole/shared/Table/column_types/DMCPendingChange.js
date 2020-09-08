// Adds the pending change column
// Requires the model to implement 'isPending' function
// Fires 'link:pendingchange:click'
// @author: nmistry
//
define([
    'jquery',
    'underscore',
    './Util'
], function (
    $,
    _,
    util
) {
    var PENDING_TEXT = _('See Details').t();
    var notPendingTPL = _.template('<td></td>');
    var pendingTPL = _.template('<td><a href="#" class="pending-change-link" data-no="<%- no %>" data-fires="<%- fires %>"><%- value %></a></td>');
    return {
        events: {
            'click .pending-change-link': function (e) {
                e.preventDefault();
                var $e = $(e.currentTarget);
                this.radio.trigger('link:' + $e.data('fires') + ':click', {no: $e.data('no')});
            }
        },
        rowTypes: {
            dmcPendingChange: function (column, model, count, totalCounter) {
                var template = _.isFunction(model.isPending) && model.isPending() ? pendingTPL : notPendingTPL;
                return template({
                    no: count,
                    fires: 'pendingchange',
                    value: PENDING_TEXT
                });
            }
        }
    };
});
