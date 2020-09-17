define(
    ['module', 
     'backbone', 
     'views/Base', 
     'views/deploymentserver/editServerclass/addApps/UnselectedAppsList', 
     'views/deploymentserver/editServerclass/addApps/UnselectedAppSummary', 
     'views/deploymentserver/Search', 
     'contrib/text!views/deploymentserver/editServerclass/addApps/UnselectedApps.html',
     'util/console'
    ], 
    function(
        module, 
        Backbone, 
        BaseView, 
        AppsList, 
        UnselectedAppsSummaryView, 
        Search, 
        unselectedAppsTemplate,
        console) {
 
        return BaseView.extend({
            moduleId: module.id,
            template: unselectedAppsTemplate, 
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
           
                //Search filter
                var searchModel = new Backbone.Model(); 
                this.model.search = searchModel; 
                this.children.search = new Search({
                    model: searchModel
                }); 
      
                //Summary: Number of unselected apps
                this.children.unselectedAppsSummary = new UnselectedAppsSummaryView({
                    model: this.model.selectedAppsDict, 
                    collection: this.collection.allApps
                }); 
                this.children.unselectedAppsSummary.on("appUnselected", this.handleAppUnselected, this); 

                //List of unselected apps
                this.children.unselectedAppsList = new AppsList({
                    model: this.model,
                    collection: this.collection.unselectedApps
                }); 
            },
            render: function() {
		var html = this.compiledTemplate(); 
                this.$el.html(html); 
                this.$('#totalUnselectedApps').append(this.children.unselectedAppsSummary.render().el); 
                this.$('#unselectedAppsSearch').append(this.children.search.render().el); 
                this.$('#unselectedAppsList').html(this.children.unselectedAppsList.render().el); 
                return this; 
            }, 
            handleAppUnselected: function(numUnselected){
                if (numUnselected > 0){
                    //this.$('#noAppsMessage').hide(); 
                    this.$('#unselectedAppsSearch').show(); 
                } else { 
                    //this.$('#noAppsMessage').show(); 
                    this.$('#unselectedAppsSearch').hide(); 
                }
                
            }
        }); 

});





