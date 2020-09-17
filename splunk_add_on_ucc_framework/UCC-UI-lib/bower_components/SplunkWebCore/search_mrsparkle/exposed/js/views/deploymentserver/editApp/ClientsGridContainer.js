define(
    ['module', 
     'views/Base', 
     'backbone', 
     'views/deploymentserver/editServerclass/addClients/Filter', 
     'views/deploymentserver/editServerclass/addClients/SelectedClientsTab', 
     'uri/route',  
     'views/deploymentserver/editApp/Clients' 
    ], 
    function(
        module, 
        BaseView, 
        Backbone, 
        FilterView,
        SelectedClientsTab, 
        route, 
        ClientsView 
    ) { 
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
               
                this.model.paginator = new Backbone.Model(); 

                this.children.clientsView = new ClientsView({
                    model: {
                        filters: new Backbone.Model(), 
                        paginator: this.model.paginator 
                    }, 
                    collection: this.collection.filteredClients, 
                    application: this.options.application
                });  

                this.collection.selectedServerClasses.on('add remove reset', this.refreshSelectedClientsTable, this); 
              
                this.collection.allSelectedClients.on('reset', this.showOrHideGrid, this); 
 
            },
            refreshSelectedClientsTable: function() {
                    var data = this.model.paginator.get('data') || {}; 
 
                    //Collection 1: filtered list of clients used to populate the clients table 
                    var serverclasses = []; 
                    this.collection.selectedServerClasses.each(function(sc){
                        serverclasses.push(sc.get('name'));  
                    }); 
                    data.serverclasses = serverclasses.join(',');  
                    this.model.paginator.set('data', data); 
                    this.model.paginator.trigger('change:data'); 

                    // Collection 2: fetch the total list of selected clients without extraneous user-defined filteres (used to determine whether we show the table or not)
                    var unfilteredData = {}; 
                    unfilteredData.serverclasses = data.serverclasses; 
                    //unfilteredData.whitelist = 'foo';  
                    //unfilteredData.blacklist = '*';  
                    this.collection.allSelectedClients.fetch({data: unfilteredData}); 
            }, 
            showOrHideGrid: function() {
                if (this.collection.allSelectedClients.length == 0) {
                    this.$el.hide(); 
                } else {
                    this.$el.show(); 
                }
            }, 
            render: function() {
                this.$el.html(this.children.clientsView.render().el);   
                this.$el.hide(); 
                return this;
            }
        }); 
});




