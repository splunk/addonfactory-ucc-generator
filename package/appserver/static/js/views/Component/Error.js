/*global define*/
define([
    'underscore',
    'backbone',
    'app/templates/dialogs/Error.html'
], function (
    _,
    Backbone,
    Error
) {
    return Backbone.View.extend({
        template: _.template(Error),

        initialize: function (options) {
            this.msg = options.msg;
        },

        render: function () {
            this.$el.html(this.template({
                msg: this.msg
            }));

            var dlg = this;
            this.$("[role=dialog]").on('hidden.bs.modal', function () {
                dlg.undelegateEvents();
            });

            return this;
        },

        modal: function () {
            this.$("[role=dialog]").modal({backdrop: 'static', keyboard: false});
        }
    });
});
