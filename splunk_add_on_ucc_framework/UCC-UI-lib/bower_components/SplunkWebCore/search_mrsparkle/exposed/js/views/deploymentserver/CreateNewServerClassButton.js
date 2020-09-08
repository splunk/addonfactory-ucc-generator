define(
    [
     'jquery',
     'module',
     'views/Base',
     'underscore', 
     'uri/route',
     'views/deploymentserver/shared/CreateServerClassDialog',
     'views/shared/dialogs/TextInputDialog',
     'models/services/deploymentserver/DeploymentServerClass'
    ],
      function($,
               module,
               BaseView,
               _,
               route,
               CreateServerClassDialog,
               TextInputDialog,
               DeploymentServerClassModel) {

         return BaseView.extend({
            moduleId: module.id,
            tagName: 'a',
            className: 'btn btn-primary',
            serverClassModel: undefined,
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
            },
            attributes: { 
                "href": "#" 
            },
            render: function() {
                this.$el.html(_("New Server Class").t());
                return this;
            },
            events: {
                'click': function(e) {
                    if (this.options.isReadOnly) {
                        //Read-only mode: disable click logic
                        return; 
                    }

                    this.children.createServerClassDialog = new CreateServerClassDialog({id: "modal_rename", parent: this});
                    this.children.createServerClassDialog.show();
                    this.children.createServerClassDialog.on("action:createdServerClass", function(serverClass) {
                        window.location.href = route.manager(this.options.application.get('root'),
                                                             this.options.application.get('locale'),
                                                             this.options.application.get('app'),
                                                             'deploymentserveredit',
                                                             {data: {id: serverClass.id}});
                    }, this);

                    return false;
                }
            }
        });
});






