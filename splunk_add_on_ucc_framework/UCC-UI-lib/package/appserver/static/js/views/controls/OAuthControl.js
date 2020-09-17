define([
    'lodash',
    'views/shared/controls/Control'
], function (
    _,
    Control
) {
    return Control.extend({
        initialize: function (options) {
            Control.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            this.$el.html(
                `<div style="margin-top: 5px;"></div>`
            );
            return this;
        }
    });
});
