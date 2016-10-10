/*global define*/
define([
    "underscore",
    "backbone",
    "app/templates/Dialogs/Warning.html"
], function (
    _,
    Backbone,
    Warning
) {
    return Backbone.View.extend({
        template: _.template(Warning),

        initialize: function (options) {
            this.msg = options.msg;
            this.detail = options.detail;
            this.cancelButton = options.cancelButtonConfig || null;
            this.continueButton = options.continueButtonConfig || null;
        },

        render: function () {
            this.$el.html(this.template({
                msg: this.msg,
                detail: this.detail,
                cancelButton: this.cancelButton,
                continueButton: this.continueButton
            }));

            if (this.detail) {
                this.$(".msg-detail-text").html(this.detail);
            }

            return this;
        },
        events: {
            "click .continue": function (event) {
                if (_.isFunction(this.continueButton.onclick)) {
                    this.continueButton.onclick.call(this, event);
                }
            },
            "click .cancel": function (event) {
                if (_.isFunction(this.cancelButton.onclick)) {
                    this.cancelButton.onclick.call(this, event);
                }
            }
        },

        modal: function () {
            this.$("[role=dialog]").modal({
                backdrop: 'static',
                keyboard: false
            });
        }
    });
});
