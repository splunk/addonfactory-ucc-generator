define(
    [
     'jquery',
     'module', 
     'views/deploymentserver/appDetail/UninstallDialog', 
     'underscore', 
     'views/Base'
    ],
    function(
        $,
        module,
        UninstallDialog,
        _, 
        BaseView
    ) { 
 
         return BaseView.extend({
            moduleId: module.id,
            tagName: 'a',
            className: 'btn',
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
            }, 
            attributes: { 
                "href": "#" 
            },
            render: function() {
                this.$el.html(_("Uninstall").t());
                return this; 
            },
            events: {
                'click' : function(e) {
                    if (this.options.isReadOnly) {
                        //Read-only mode: disable click logic
                        return; 
                    }
                    this.renderUninstallDialog(); 
                    return false; 
                }
            },  
            renderUninstallDialog: function() {
                this.children.uninstallDialog = new UninstallDialog({id: "modal_delete", parent: this, flashModel: this.model});
                this.children.uninstallDialog.preventDefault();
                $("body").append(this.children.uninstallDialog.render().el);
                this.children.uninstallDialog.show();
                this.children.uninstallDialog.on('click:primaryButton', function() {
                    this.model.entry.content.set('deinstall', true);
                    var that = this;
                    this.model.save(null, {
                        success: function(model, response) {
                            that.children.uninstallDialog.hide();
                        }
                    });
                }, this);
            }
        });
});





