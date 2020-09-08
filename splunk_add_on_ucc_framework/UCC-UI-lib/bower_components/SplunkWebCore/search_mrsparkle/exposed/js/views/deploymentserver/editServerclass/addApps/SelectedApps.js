define(
    ['module', 
     'backbone', 
     'views/Base', 
     'views/deploymentserver/editServerclass/addApps/SelectedAppsList', 
     'views/deploymentserver/editServerclass/addApps/SelectedAppSummary', 
     'views/deploymentserver/Search', 
     'contrib/text!views/deploymentserver/editServerclass/addApps/SelectedApps.html'
    ], 
    function(
        module, 
        Backbone, 
        BaseView, 
        AppsList, 
        SelectedAppsSummaryView, 
        Search, 
        selectedAppsTemplate) { 
 
        return BaseView.extend({
            moduleId: module.id,
            template: selectedAppsTemplate, 
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                
                //Search filter
                var searchModel = new Backbone.Model(); 
                this.model.search = searchModel; 
                this.children.search = new Search({
                    model: searchModel
                }); 
             
                //Summary: Number of selected apps
                this.children.selectedAppsSummary = new SelectedAppsSummaryView({
                    model: this.model.selectedAppsDict, 
                    collection: this.collection.allApps
                }); 
                this.children.selectedAppsSummary.on("appSelected", this.handleAppSelected, this); 
             
                //List of selected apps
                this.children.selectedAppsList = new AppsList({
                    model: this.model,
                    collection: this.collection.selectedApps
                });                  

            },
            render: function() {
		var html = this.compiledTemplate(); 
                this.$el.html(html); 
                this.$('#selectedAppsSearch').html(this.children.search.render().el); 
                this.$('#totalSelectedApps').append(this.children.selectedAppsSummary.render().el); 
                this.$('#selectedAppsList').html(this.children.selectedAppsList.render().el); 
                return this; 
            }, 
            handleAppSelected: function(numSelected){
                if (numSelected > 0){
                    this.$('#noAppsMessage').hide(); 
                    this.$('#selectedAppsSearch').show(); 
                } else { 
                    this.$('#noAppsMessage').show(); 
                    this.$('#selectedAppsSearch').hide(); 
                }
                
            }
        }); 

});




