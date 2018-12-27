import {getFormattedMessage} from 'app/util/messageUtil';
import {addErrorMsg} from 'app/util/promptMsgController';

define([
    'jquery',
    'lodash',
    'backbone',
    'app/util/Util',
    'app/views/component/DeleteDialog.html'
], function (
    $,
    _,
    Backbone,
    Util,
    DeleteDialog
) {
    return Backbone.View.extend({
        events: {
            "submit form": "delete",
            "click button.close": (e) => {
                if (e.target.hasAttribute('data-dismiss')) {
                    return;
                }
                $(e.target).closest('.msg').remove();
            }
        },

        initialize: function (options) {
            // collection, model, stateModel, dispatcher, inUse, deleteTag
            _.extend(this, options);
        },

        render: function () {
            this.$el.html(_.template(DeleteDialog)({
                title: getFormattedMessage(101),
                inUse: this.inUse,
                inUseMsg: _.unescape(getFormattedMessage(
                    102,
                    this.model.entry.attributes.name
                )),
                notinUseMsg: _.unescape(getFormattedMessage(
                    103,
                    this.model.entry.attributes.name,
                    this.deleteTag || ''
                 ))
            }));
            this.$("[role=dialog]").on('hidden.bs.modal', () => {
                this.undelegateEvents();
            });
            return this;
        },

        delete: function () {
            var url, collection, delete_url;
            collection = this.model.collection;
            if (!collection) {
                collection = this.collection;
            }
            url =  this.model._url ===
                   undefined ? collection._url : this.model._url;
            delete_url = [
                collection.proxyUrl,
                url,
                this.encodeUrl(this.model.entry.attributes.name)
            ].join("/") + '?output_mode=json';

            this._delete(delete_url);
        },

        modal: function () {
            this.$("[role=dialog]").modal(
                {backdrop: 'static', keyboard: false}
            );
        },

        encodeUrl: function (str) {
            return encodeURIComponent(str)
                    .replace(/'/g, "%27").replace(/"/g, "%22");
        },

        _delete: function (delete_url) {
            Util.disableElements(
                this.$("button[type=button]"),
                this.$("input[type=submit]")
            );
            $.ajax({
                url: delete_url,
                type: 'DELETE'
            }).done(() => {
                this.dispatcher.trigger('delete-input', this.model);
                this.$("[role=dialog]").modal('hide');
            }).fail((model) => {
                //Re-enable when failed
                Util.enableElements(
                    this.$("button[type=button]"),
                    this.$("input[type=submit]")
                );
                addErrorMsg('.modal-dialog', model, true);
            });
        }
    });
});
