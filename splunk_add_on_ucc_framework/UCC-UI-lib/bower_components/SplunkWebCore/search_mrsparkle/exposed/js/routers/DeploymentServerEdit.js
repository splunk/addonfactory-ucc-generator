define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'backbone', 
        'views/deploymentserver/editServerclass/EditServerClass',
        'collections/services/deploymentserver/DeploymentApplications',
        'collections/services/deploymentserver/DeploymentServerClients',
        'models/services/deploymentserver/DeploymentServerClass',
        'collections/services/deploymentserver/ConfigViolations',
        'models/classicurl',
        'bootstrap.tab'
    ],
    function(
        $,
        _,
        BaseRouter,
        Backbone, 
        EditServerClassView,
        DeploymentAppsCollection, 
        DeploymentClientsCollection, 
        DeploymentServerClassModel,
        ConfigViolationsCollection,
        classicurlModel,
        bootstrapTab
    ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Edit Server Class').t());
                this.enableAppBar = false;
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                //collections
                var deploymentAppsCollection = new DeploymentAppsCollection();  
                var allApps = new DeploymentAppsCollection();  
                var deploymentClientsCollection = new DeploymentClientsCollection();  
                var configViolations = new ConfigViolationsCollection();  

                this.deferreds.classicurlModel = classicurlModel.fetch(); 

                $.when(this.deferreds.classicurlModel).then(function() {
                    // First wait for classicUrlModel to load
                    var serverClassModel = new DeploymentServerClassModel(); 
                    serverClassModel.set("id", classicurlModel.get('id')); 
                    this.deferreds.serverclass = serverClassModel.fetch();  
                    $.when(this.deferreds.serverclass).then(function() {
                        // Second,  wait for the serverclass model to load
                        var searchStr = 'serverclasses="'+ serverClassModel.entry.get('name') + '"';
                        this.deferreds.deploymentAppsCollection = deploymentAppsCollection.fetch({data:{count: 10, offset: 0, search: searchStr}}); 
                        this.deferreds.allApps = allApps.fetch({data:{count: 10, offset: 0}}); 
                        this.deferreds.deploymentClientsCollection = deploymentClientsCollection.fetch({data:{count: 10, offset: 0, serverclasses: serverClassModel.entry.get('name')}}); 
                        this.deferreds.configViolations = configViolations.fetch(); 
                        $.when(                    
                             // Third, wait for the apps and clients collections to load
                             this.deferreds.deploymentAppsCollection, 
                             this.deferreds.deploymentClientsCollection, 
                             this.deferreds.configViolations, 
                             this.deferreds.pageViewRendered, 
                             this.deferreds.allApps 
                        ).then(function(){
                             $('.preload').replaceWith(this.pageView.el);
                             this.editServerClassView = new EditServerClassView({
                                 model: serverClassModel, 
                                 collection: { 
                                     apps: deploymentAppsCollection, 
                                     allApps: allApps, 
                                     clients: deploymentClientsCollection 
                                 }, 
                                 isReadOnly: configViolations.length > 0, 
                                 application: this.model.application 
                             });  
                             this.pageView.$('.main-section-body').append(this.editServerClassView.render().el);
                         }.bind(this));
                    }.bind(this)); 
                }.bind(this)); 
            }
        });
    });
