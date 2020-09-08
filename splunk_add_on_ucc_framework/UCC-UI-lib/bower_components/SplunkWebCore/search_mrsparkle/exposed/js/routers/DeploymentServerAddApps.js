define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'backbone',
        'views/deploymentserver/editServerclass/addApps/AddApps',
        'models/services/deploymentserver/DeploymentServerClass',
        'models/classicurl',
        'bootstrap.tab'
    ],
    function(
        $,
        _,
        BaseRouter,
        Backbone, 
        AddAppsView,
        DeploymentServerClassModel,
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

                var that = this; 
                classicurlModel.fetch({
                    success: function() {
                        var serverClassModel = new DeploymentServerClassModel(); 
                        serverClassModel.set("id", classicurlModel.get('id')); 
                        var return_to = classicurlModel.get('return_to'); 

                        that.addAppsView = new AddAppsView({
                            model: { 
                                serverClass: serverClassModel
                            }, 
                            application: that.model.application,  
                            return_to: return_to
                        });  
                    }
                });

                $.when(                    
                    this.deferreds.pageViewRendered
                ).then(function(){
                    $('.preload').replaceWith(this.pageView.el);
                    this.pageView.$('.main-section-body').append(this.addAppsView.render().el);
                }.bind(this)); 
            }
        });
    });
