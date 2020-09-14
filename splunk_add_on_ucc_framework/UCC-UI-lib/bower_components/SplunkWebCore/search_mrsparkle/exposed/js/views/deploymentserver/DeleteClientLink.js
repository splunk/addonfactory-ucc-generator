define(
    [
        'jquery',
        'module',
        'views/Base',
        'underscore',
        'views/shared/dialogs/TextDialog'
    ], 
    function(
        $,
        module, 
        BaseView, 
        _,
        TextDialog
    ) { 
        return  BaseView.extend({
            moduleId: module.id,
            tagName: 'a',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            attributes: { 
                "href": "#" 
            },
            events: {
                'click': function() {
                     this.deleteClient();
                     return false;
                }
            },
            render: function() {
                //this.$el.empty();
                //this.delegateEvents();
                this.$el.append(_('Delete Record').t());
                return this;
            },
            deleteClient: function() {
                this.children.deleteDialog = new TextDialog({id: "modal_delete", flashModel: this.model.client});
                this.children.deleteDialog.settings.set("primaryButtonLabel",_("Delete").t());
                this.children.deleteDialog.settings.set("cancelButtonLabel",_("Cancel").t());
                this.children.deleteDialog.on('click:primaryButton', this.deleteDialogDeleteHandler, this);
                this.children.deleteDialog.on("click:closeButton", this.deleteDialogCancelHandler, this);
                this.children.deleteDialog.on("click:cancelButton", this.deleteDialogCancelHandler, this);
                this.children.deleteDialog.on("hidden", function() {
                    delete this.children.deleteDialog;
                }, this);
                this.children.deleteDialog.settings.set("titleLabel",_("Delete Record").t());
                this.children.deleteDialog.setText(_("The record of the client will be removed. Next time it phones it will be listed again.").t());
                this.children.deleteDialog.preventDefault(); // Don't autoclose on primary button click

                $("body").append(this.children.deleteDialog.render().el);
                this.children.deleteDialog.show();
            },

            deleteDialogDeleteHandler: function() {
                var that = this;
                this.model.client.destroy({
                    success: function(client, response) {
                        //Triggering the 'itemDeleted' event will cause the paginator to re-fetch the collection
                        that.model.paginator.trigger('itemDeleted');
                        that.children.deleteDialog.hide();
                    }
                });
            }
    });
});







