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
            this.link = this.options.link
            this.text = this.options.text
        },

        render: function () {
            if (this.link === undefined || this.text === undefined || this.link === "" || this.text === "")
            {
                this.$el.html(
                    `<div style="margin-top: 5px;"></div>`
                )
            }
            else
            {
                    this.$el.html(
                    `<div style="margin-top: 5px;"><a target=_blank href="${this.link}">${this.text}</a></div>`
                );
                return this;
            }
        }
    });
});
