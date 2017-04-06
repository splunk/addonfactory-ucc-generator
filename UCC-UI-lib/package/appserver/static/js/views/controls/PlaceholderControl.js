define([
    'views/shared/controls/Control'
], function (
    Control
) {
    return Control.extend({
        initialize: function (options) {
            Control.prototype.initialize.apply(this, arguments);
            this.defaultValue = options.defaultValue || '';
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
