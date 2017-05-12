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
            this.defaultValue = _(options.defaultValue || '').t();
            this.setValue(this.defaultValue, false);
        },

        render: function () {
            this.$el.html(
                `<div style="margin-top: 5px;">${this.defaultValue}</div>`
            );
            return this;
        }
    });
});
