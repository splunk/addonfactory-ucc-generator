define(
    [
        'jquery',
        'underscore',
        'routers/Base',
        'backbone',
        'views/deploymentserver/editServerclass/addClients/AddClients',
        'models/services/deploymentserver/DeploymentServerClass',
        'collections/services/deploymentserver/ClientMachineTypes',
        'models/classicurl',
        'collections/services/deploymentserver/ClientsPreview',
        'collections/services/deploymentserver/DeploymentServerClients',
        'bootstrap.tab'
    ],
    function(
        $,
        _,
        BaseRouter,
        Backbone, 
        AddClientsView,
        DeploymentServerClassModel,
        MachineTypesCollection, 
        classicurlModel,
        DeploymentServerClientsCollection,
        AllClientsCollection,
        bootstrapTab
    ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Edit Clients').t());
                this.enableAppBar = false;
                // Overridden by DMC
                this.addClientsViewClass = AddClientsView;
           },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                var _ServerClientsCollection = this.getClientsPreviewCollection();
                var _MachineTypesCollection = this.getMachineTypesCollection();

                //collections
                //var clientsCollection = new DeploymentServerClientsCollection();
                var selectedClientsCollection = new _ServerClientsCollection();
                
                var unselectedClientsCollection = new _ServerClientsCollection();
                var allClientsCollection = new _ServerClientsCollection();
                var machineTypes = new _MachineTypesCollection(); 
                var selectedMachineTypes = new Backbone.Collection(); 
                this.deferreds.machineTypes = machineTypes.fetch();
                //allClientsCollection.fetch({data:{count: 10, offset: 0}}); 


                var that = this; 
                classicurlModel.fetch({
                    success: function() {
                        var serverClassModel = that.getServerClassModel(classicurlModel);
                        var return_to = classicurlModel.get('return_to'); 

                        that.addClientsView = new that.addClientsViewClass({
                            collection: {
                                //allClients: clientsCollection, 
                                selectedClients: selectedClientsCollection, 
                                unselectedClients: unselectedClientsCollection, 
                                allClients: allClientsCollection, 
                                selectedMachineTypes: selectedMachineTypes, 
                                machineTypes: machineTypes 
                            },
                            model: { 
                                serverClass: serverClassModel
                            }, 
                            application: that.model.application,  
                            return_to: return_to
                        });  
                    }
                });

                $.when(                    
                    this.deferreds.pageViewRendered,
                    this.deferreds.machineTypes
                ).then(function(){
                    $('.preload').replaceWith(this.pageView.el);
                    this.pageView.$('.main-section-body').append(this.addClientsView.render().el);
                }.bind(this)); 
            },

            // This is overridden by DMC
            getServerClassModel: function(fetchedClassicurl) {
                var serverClassModel = new DeploymentServerClassModel();
                serverClassModel.set("id", classicurlModel.get('id'));
                return serverClassModel;
            },

            // This is overridden by DMC
            getClientsPreviewCollection: function() {
                return DeploymentServerClientsCollection;
            },

            // This is overridden by DMC
            getMachineTypesCollection: function() {
                return MachineTypesCollection;
            }
        });
    });
