define(
    ['module', 
     'views/Base', 
     'backbone', 
     'underscore', 
     'views/deploymentserver/appDetail/Clients', 
     'views/deploymentserver/appDetail/AppName', 
     'views/deploymentserver/appDetail/EditButton', 
     'views/deploymentserver/appDetail/DeleteButton', 
     'views/deploymentserver/appDetail/Summary', 
     'views/deploymentserver/shared/ReadOnlyMessage',
     'uri/route', 
     'contrib/text!views/deploymentserver/appDetail/AppDetail.html',
     './AppDetail.pcss',
     '../shared.pcss'
    ], 
    function(
        module, 
        BaseView, 
        Backbone, 
        _, 
        ClientsView, 
        AppName,
        EditButton, 
        DeleteButton, 
        SummaryView,
        ReadOnlyMessage, 
        route, 
        appDetailTemplate,
        css,
        cssShared) { 
 
        return BaseView.extend({
            moduleId: module.id,
            template: appDetailTemplate, 
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.appName = new AppName({model: this.model.app}); 
                this.children.editBtn = new EditButton({
                    model: this.model.app, 
                    isReadOnly: this.options.isReadOnly, 
                    application: this.options.application
                }); 
                this.children.deleteBtn = new DeleteButton({
                    model: this.model.app, 
                    isReadOnly: this.options.isReadOnly
                }); 

                this.model.clientsTablePaginator = new Backbone.Model(); 

                this.children.clientsView = new ClientsView({
                    model: {
                        filters: new Backbone.Model(), 
                        paginator: this.model.clientsTablePaginator,  
                        app: this.model.app
                    }, 
                    collection: this.collection.filteredClients, 
                    application: this.options.application 
                }); 
                this.children.summaryView = new SummaryView({model: this.model.app, collection: this.collection}); 


                this.children.readOnlyMsg = new ReadOnlyMessage({model: {application: this.options.application}}); 
                //this.collection.clients.on('reset', this.findClientsWithApp, this); 
            },
            render: function() {
 
                var docUrl = route.docHelp(
                    this.options.application.get("root"),
                    this.options.application.get("locale"),
                    'manager.deployment.fm.app'
                );

                var html = this.compiledTemplate({
                    _:_, 
                    app: this.model.app, 
                    docUrl: docUrl, 
                    redirect_url: route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'), 'deploymentserver', {'data':{'t':0}})
                }); 
                this.$el.html(html); 

                 if (this.options.isReadOnly) {
                     //Read-only mode 
                     this.$el.addClass('read-only'); 
                 }

                this.renderClientsTable(); 
                this.renderSummaryBar(); 

                this.$('#appName').append(this.children.appName.render().el); 
                this.$('#app-btn-controls').prepend(this.children.deleteBtn.render().el); 
                this.$('#app-btn-controls').prepend(this.children.editBtn.render().el); 
                this.$('#read-only-msg-container').append(this.children.readOnlyMsg.render().el); 
                return this; 
            }, 
            renderSummaryBar: function() {
                this.$('#appSummary').append(this.children.summaryView.render().el); 
            }, 
            renderClientsTable: function() {
                var data = this.model.clientsTablePaginator.get('data') || {}; 
                data.application = this.model.app.entry.get('name'); 
                this.model.clientsTablePaginator.set('data', data); 
                var that = this; 
                this.collection.filteredClients.fetch({
                    data:data, 
                    success: function() {
                        that.$('#client_section').append(that.children.clientsView.render().el); 
                    }
                }); 
            }
        }); 
});






