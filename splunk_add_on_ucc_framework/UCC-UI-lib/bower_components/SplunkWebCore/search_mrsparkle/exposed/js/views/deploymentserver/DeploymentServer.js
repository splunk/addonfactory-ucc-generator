define(
    ['module', 
     'views/Base', 
      'underscore',
      'uri/route', 
      'backbone', 
     'views/deploymentserver/Clients',
     'views/deploymentserver/ServerClasses',
     'views/deploymentserver/ClientsSummary',
     'views/deploymentserver/Applications',
     'views/deploymentserver/CollectionCounterDisplay',
     'views/deploymentserver/Repository',
     'views/deploymentserver/shared/ReadOnlyMessage',
     'views/deploymentserver/UnknownStateMessage',
     'views/deploymentserver/gettingStarted/GettingStarted',
     'contrib/text!views/deploymentserver/DeploymentServer.html',
     './DeploymentServer.pcss',
     './shared.pcss'
    ], 
    function(
        module, 
        BaseView, 
        _, 
        route, 
        Backbone, 
        ClientsView,
        ServerClassesView,
        ClientsSummaryView,
        AppsView, 
        CollectionCounterDisplay, 
        RepositoryView, 
        ReadOnlyMessage, 
        UnknownStateMessage, 
        GettingStartedView, 
        deploymentServerTemplate,
        css,
        cssShared) { 
 
        return BaseView.extend({
            moduleId: module.id,
            template: deploymentServerTemplate, 

            events: {
               'click .appsTab': function() {
                   this.setActiveTab(0);  
               }, 
               'click .serverclassesTab': function() {
                  this.setActiveTab(1);  
               }, 
               'click .clientsTab': function() {
                  this.setActiveTab(2);  
               }
            }, 

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.repositoryLocation = new RepositoryView({collection: this.collection.deploymentServers});
                this.children.clientsView = new ClientsView({
                    model: {
                        filters: new Backbone.Model(), 
                        paginator: new Backbone.Model()  
                    }, 
                    collection: this.collection.serverClients, 
                    application: this.options.application
                });  
                this.children.clientsCounter = new CollectionCounterDisplay({collection: this.collection.serverClients});
                this.children.appsCounter = new CollectionCounterDisplay({collection: this.collection.deploymentApps});
                this.children.serverclassesCounter = new CollectionCounterDisplay({collection: this.collection.serverClasses});
                this.children.serverClassesView = new ServerClassesView({
                    model: {
                        filters: new Backbone.Model(), 
                        paginator: new Backbone.Model()
                    }, 
                    collection: { 
                        serverClasses: this.collection.serverClasses, 
                        serverClients: this.collection.serverClients, 
                        deploymentApps: this.collection.deploymentApps 
                    }, 
                    isReadOnly: this.options.isReadOnly,  
                    application: this.options.application

                }); 
 
                this.children.appsView = new AppsView({
                    model: {
                        filters: new Backbone.Model(), 
                        paginator: new Backbone.Model()
                    }, 
                    collection: { 
                        deploymentApps: this.collection.deploymentApps, 
                        serverClients: this.collection.serverClients 
                    }, 
                    isReadOnly: this.options.isReadOnly,  
                    application: this.options.application
                });  

                this.children.clientsSummary = new ClientsSummaryView({
                    collection: {
                        serverClients: this.collection.serverClients, 
                        deploymentServers: this.collection.deploymentServers
                    }}); 

                this.children.readOnlyMsg = new ReadOnlyMessage({model: {application: this.options.application}}); 
            },
            render: function() {
                // If there are no clients, serverclasses, or apps, then show a blank slate view
                if (this.collection.serverClients.length == 0 && this.collection.serverClasses.length == 0 && this.collection.deploymentApps.length == 0) {
                    var gettingStartedView = new GettingStartedView({
                        model: {
                            application: this.options.application 
                        } 
                    }); 
                    this.$el.html(gettingStartedView.render().el); 
                    return this; 
                }
 
                var docUrl = route.docHelp(
                    this.options.application.get("root"),
                    this.options.application.get("locale"),
                    'manager.deployment.fm.serverclass'
                );


                var html = this.compiledTemplate({docUrl: docUrl, _:_});
                this.$el.html(html); 

                 if (this.options.isReadOnly) {
                     //Read-only mode 
                     this.$el.addClass('read-only'); 
                 }

                this.$('#repositoryLocation').append(this.children.repositoryLocation.render().el); 
                this.$('#clientsSummary').append(this.children.clientsSummary.render().el); 
                this.$('#deployment_server_clients').append(this.children.clientsView.render().el); 
                this.$('#clients_count').append(this.children.clientsCounter.render().el); 
                this.$('#apps_count').append(this.children.appsCounter.render().el); 
                this.$('#serverclasses_count').append(this.children.serverclassesCounter.render().el); 
                this.$('#deployment_server_classes').html(this.children.serverClassesView.render().el); 
                this.$('#deployment_apps').append(this.children.appsView.render().el); 
                this.$('#read-only-msg-container').append(this.children.readOnlyMsg.render().el); 

                if (this.collection.clientsWithUnknownStatus.length > 0) {
                     this.children.unknownStateMsg = new UnknownStateMessage(); 
                     this.$('#unknown-state-msg-container').append(this.children.unknownStateMsg.render().el); 
                }

                var selectedTabIndex = this.model.classicUrlModel.get('t') || 2;  //If selectedTab is not set, default to '2' or the clientsTab 
                this.setActiveTab(selectedTabIndex); 
                return this; 
            }, 

            
            /*
             * Sets the selected tab and adjusts url accordingly 
             * @param selectedTabIndex Allowable values are {0,1,2} corresponding to the appsTab, serverclassesTab, and clientsTab, respectively
             */
            setActiveTab: function(selectedTabIndex) {
               var numTabs = 3; 
               var tabHeaders = ['.appsTab', '.serverclassesTab', '.clientsTab']; 
               var tabBodies = ['#deployment_apps', '#deployment_server_classes', '#deployment_server_clients']; 
               this.model.classicUrlModel.replaceState('t=' + selectedTabIndex); 
               
               for (var i = 0; i < numTabs; i++) {
                   var tabHeader = tabHeaders[i]; 
                   var tabBody = tabBodies[i]; 
                   if (i == selectedTabIndex) {
                       this.$(tabHeader).addClass('active'); 
                       this.$(tabBody).addClass('active'); 
                   } else {
                       this.$(tabHeader).removeClass('active'); 
                       this.$(tabBody).removeClass('active'); 
                   }
               }
            }
        }); 

});

