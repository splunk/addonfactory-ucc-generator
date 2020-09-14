define(
    [
       'jquery',
       'module',
       'views/Base',
       'underscore', 
       'uri/route',
     'views/deploymentserver/appDetail/UninstallDialog',
       'views/deploymentserver/shared/DropDownMenuWithReadOnlyMode'
    ],
    function(
        $,
        module,
        BaseView,
        _, 
        route,
        UninstallDialog,
        DropDownMenu
    ) {
              return  BaseView.extend({
                    moduleId: module.id,
                    tagName: 'div',
            initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            // TODO [JCS] This should be changed to two links instead of a dropdown.
            this.children.createDropDown = new DropDownMenu({
                label: _('Edit').t(),
                className: 'btn-combo create-drop-down',
                anchorClassName: ' ',
                items: [
                    { label: _('Edit').t(), value: 'edit' },
                    { label: _('Uninstall').t(), value: 'uninstall' }
                ], 
                isReadOnly: this.options.isReadOnly
            });

                        this.children.createDropDown.on('itemClicked', function(type) {
                            if(type === 'edit') {
                                window.location.href =  route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'), 'deploymentserver_edit_app', {data: {id: this.model.app.id}});
                            } else if(type === 'uninstall') {
                                this.renderUninstallDialog();
                            }

                       }, this);
            },
            render: function() {
                this.$el.empty();
                this.children.createDropDown.delegateEvents();
                this.$el.append(this.children.createDropDown.render().el);
                return this;
            },
            renderUninstallDialog: function() {
                this.children.uninstallDialog = new UninstallDialog({id: "modal_delete", parent: this, flashModel: this.model.app});
                this.children.uninstallDialog.preventDefault();
                //this.children.uninstallDialog.settings.set("titleLabel","Delete Server Class");
                $("body").append(this.children.uninstallDialog.render().el);
                this.children.uninstallDialog.show();

                this.children.uninstallDialog.on('click:primaryButton', function() {
                    this.model.app.entry.content.set('deinstall', true);
                    var that = this;
                    this.model.app.save(null, {
                        success: function(model, response) {
                            that.model.paginator.trigger('itemDeleted');
                            that.children.uninstallDialog.hide();
                        }
                    });
                }, this);


           }
        });

});







