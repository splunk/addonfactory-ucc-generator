define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'backbone', 
        'views/deploymentserver/appDetail/AppDetail',
        'collections/services/deploymentserver/DeploymentServerClients',
        'models/services/deploymentserver/DeploymentApplication',
        'collections/services/deploymentserver/ConfigViolations',
        'models/classicurl',
        'bootstrap.tab'
    ],
    function(
        $,
        _,
        BaseRouter,
        Backbone, 
        AppDetailView,
        DeploymentClientsCollection, 
        DeploymentAppModel,
        ConfigViolationsCollection,
        classicurlModel,
        bootstrapTab
    ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Edit Apps').t());
                this.enableAppBar = false;
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                
                //collections
                var filteredClientsList =  new DeploymentClientsCollection();  
                var allClientsWithApp =  new DeploymentClientsCollection();  
                var successfulClients =  new DeploymentClientsCollection();  
                var configViolations = new ConfigViolationsCollection();  


                var that = this; 
                classicurlModel.fetch({
                    success: function() {
                        that.deferreds.configViolations = configViolations.fetch();  
                        var appModel = new DeploymentAppModel(); 
                        appModel.set("id", classicurlModel.get('id')); 
                        that.deferreds.appModel = appModel.fetch(); 

                        $.when(                    
                             that.deferreds.configViolations, 
                             that.deferreds.appModel,  
                             that.deferreds.pageViewRendered
                         ).then(function(){
                                $('.preload').replaceWith(this.pageView.el);
                                this.appDetailView = new AppDetailView({
                                    model: {
                                       app:  appModel
                                    },
                                    collection: { 
                                        filteredClients: filteredClientsList,  
                                        clientsWithApp: allClientsWithApp,  
                                        successfulClients: successfulClients 
	                            }, 
                                    deferreds: {
                                        app: this.deferreds.appModel
                                    }, 
                                    isReadOnly: configViolations.length > 0, 
                                    application: this.model.application 
                                });  
                                this.pageView.$('.main-section-body').append(this.appDetailView.render().el);
                         }.bind(that)); 
                    }
                });

                //this.pageView.$('.main-section-body').append(this.appDetailView.render().el);
            }
        });
    });
