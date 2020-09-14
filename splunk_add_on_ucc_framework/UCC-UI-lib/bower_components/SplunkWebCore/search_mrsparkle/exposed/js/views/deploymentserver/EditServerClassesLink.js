define(
    [
       'jquery',
       'module',
       'views/Base',
       'underscore', 
       'uri/route',
       'models/services/deploymentserver/RenameServerClass',
       'views/shared/dialogs/TextDialog',
       'views/shared/dialogs/TextInputDialog',
       'collections/services/deploymentserver/DeploymentServerClasses',
       'views/deploymentserver/shared/DropDownMenuWithReadOnlyMode'
    ],
    function(
        $,
        module,
        BaseView,
        _, 
        route,
        RenameServerClass,
        TextDialog,
        TextInputDialog,
        ServerClassesCollection,
        DropDownMenu
    ) {
      return  BaseView.extend({
            moduleId: module.id,
            tagName: 'div',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                var items = [];
                if (this.collection.deploymentApps.length > 0) {
                    items = [{ label: _('Edit Clients').t(), value: 'edit_clients' },
                             { label: _('Edit Apps').t(), value: 'edit_apps' },
                             { label: _('Rename').t(), value: 'rename' },
                             { label: _('Delete').t(), value: 'delete' }];
                } else {
                    items = [{ label: _('Edit Clients').t(), value: 'edit_clients' },
                             { label: _('Rename').t(), value: 'rename' },
                             { label: _('Delete').t(), value: 'delete' }];
                }

                this.children.createDropDown = new DropDownMenu({
                    label: _('Edit').t(),
                    className: 'btn-combo create-drop-down',
                    anchorClassName: ' ',
                    items: items,
                    isReadOnly: this.options.isReadOnly

                });

                this.children.createDropDown.on('itemClicked', function(type) {
                    var return_to = window.location.href.split('/').slice(-1); 
                    if(type === 'edit_clients') {
                        window.location.href =  route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'),'deploymentserver_add_clients', {data: {id: this.model.serverclass.id, return_to: return_to}});
                    } else if(type === 'edit_apps') {
                        window.location.href =  route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'),'deploymentserver_add_apps', {data: {id: this.model.serverclass.id, return_to: return_to}});
                    } else if(type === 'rename') {
                        this.renderRenameServerClassDialog();
                    } else if(type === 'delete') {
                        this.renderDeleteServerClassDialog();
                    }

               }, this);
            },
            render: function() {
                this.$el.append(this.children.createDropDown.render().el);
                return this;
            },
            renderDeleteServerClassDialog: function() {
                this.children.deleteServerClassDialog = new TextDialog({id: "modal_delete", parent: this, flashModel: this.model.serverclass});
                this.children.deleteServerClassDialog.settings.set("titleLabel",_("Delete Server Class").t());
                this.children.deleteServerClassDialog.settings.set("primaryButtonLabel",_("Delete").t());
                this.children.deleteServerClassDialog.settings.set("cancelButtonLabel",_("Cancel").t());
                this.children.deleteServerClassDialog.setText(_("Are you sure you wish to delete this server class?").t());
                this.children.deleteServerClassDialog.preventDefault();
                $("body").append(this.children.deleteServerClassDialog.render().el);
                this.children.deleteServerClassDialog.show();
                this.children.deleteServerClassDialog.on('click:primaryButton', function() {
                    var that = this;
                    this.model.serverclass.destroy({
                        success: function(serverclass, response) {
                            //Triggering the 'itemDeleted' event will cause the paginator to re-fetch the collection
                            that.model.paginator.trigger('itemDeleted');
                            that.children.deleteServerClassDialog.hide();
                        }
                   });
                }, this);
            },
            renderRenameServerClassDialog: function() {

                var originalName = this.model.serverclass.entry.get("name");
                var renameModel = new RenameServerClass({oldName: originalName, newName: originalName});

                this.children.renameServerClassDialog = new TextInputDialog({id: "modal_rename",
                    parent: this,
                    model: renameModel,
                    modelAttribute: "newName",
                    label: _("Name").t()});
                this.children.renameServerClassDialog.settings.set("titleLabel",_("Rename Server Class").t());
                this.children.renameServerClassDialog.show();
                this.children.renameServerClassDialog.on('click:primaryButton', function() {
                    var that = this;
                    renameModel.save({}, {
                        success: function(model, response, options){
                            // We get the updated server class as a response. We use a backdoor to update the model
                            // since the ID is now different.
                            that.model.serverclass.setFromSplunkD(response);
                            that.model.paginator.trigger('change:data');
                        }
                    });
                }, this);
                return false;
            }
        });

});







