define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'backbone', 
        'views/deploymentserver/editApp/EditApp',
        'collections/services/deploymentserver/DeploymentServerClasses',
        'collections/services/deploymentserver/DeploymentServerClients',
        'models/services/deploymentserver/DeploymentApplication',
        'models/classicurl',
        'bootstrap.tab'
    ],
    function(
        $,
        _,
        BaseRouter,
        Backbone, 
        EditAppView,
        DeploymentServerClassesCollection, 
        DeploymentClientsCollection, 
        DeploymentAppModel,
        classicurlModel,
        bootstrapTab
    ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Edit App').t());
                this.enableAppBar = false;
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                //collections
                var selectedClients =  new DeploymentClientsCollection();  
                var filteredClients =  new DeploymentClientsCollection();  
                var serverClasses =  new DeploymentServerClassesCollection();  
                var selectedServerClasses =  new Backbone.Collection(); 
                var previousSelectedServerClasses =  new Backbone.Collection(); 
                serverClasses.fetch({data:{count: -1, offset: 0}}); 

                this.deferreds.classicurlModel = classicurlModel.fetch(); 
                $.when(this.deferreds.classicurlModel, this.deferreds.pageViewRendered ).then(function() {
                        var appModel = new DeploymentAppModel(); 
                        appModel.set("id", classicurlModel.get('id')); 
                        this.editAppView = new EditAppView({
                            model: {
                               app:  appModel
                            },
                            collection: { 
                                selectedClients: selectedClients,  
                                filteredClients: filteredClients,  
                                serverClasses: serverClasses,  
                                selectedServerClasses: selectedServerClasses,  
                                previousSelectedServerClasses: previousSelectedServerClasses
                            },
                            application: this.model.application 
                        });  
                        $('.preload').replaceWith(this.pageView.el);
                        this.pageView.$('.main-section-body').append(this.editAppView.render().el);
                }.bind(this)); 

            }
        });
    });
