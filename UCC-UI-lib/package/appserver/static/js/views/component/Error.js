import {getFormattedMessage} from 'app/util/messageUtil';

define([
    'lodash',
    'backbone',
    'app/views/component/Error.html'
], function (
    _,
    Backbone,
    Error
) {
    return Backbone.View.extend({
        initialize: function (options) {
            this.msg = options.msg;
        },

        render: function () {
            this.$el.html(_.template(Error)({
                title: getFormattedMessage(104),
                msg: _.unescape(this.msg)
            }));

            var dlg = this;
            this.$("[role=dialog]").on('hidden.bs.modal', function () {
                dlg.undelegateEvents();
            });

            return this;
        },

        modal: function () {
            if (this.$("[role=dialog]").modal) {
                this.$("[role=dialog]").modal({backdrop: 'static', keyboard: false});
            }
        }
    });
});
