define(
    ['module', 
     'backbone', 
     'views/Base', 
     'views/deploymentserver/editServerclass/DefaultAddAppsPrompt',
     'views/deploymentserver/editServerclass/SelectedAppsView'
    ], 
    function(
        module, 
        Backbone, 
        BaseView, 
        DefaultAddAppsView,  
        SelectedAppsView 
    ) { 
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 

                this.children.defaultAddAppsView = new DefaultAddAppsView({
                    model: this.model,
                    collection: this.collection.allApps,
                    isReadOnly: this.options.isReadOnly, 
                    application: this.options.application
                }); 
 
	        this.children.selectedAppsView = new SelectedAppsView({
                    model: this.model,  
                    collection: this.collection,  
                    isReadOnly: this.options.isReadOnly, 
                    application: this.options.application
                });  
            },
            render: function() {
		        var html = this.compiledTemplate(); 
                this.$el.html(html);   
                    if (this.collection.apps.length > 0) {
                        this.$('#selectedAppsView').html(this.children.selectedAppsView.render().el); 
                    } else {
                        this.$('#defaultAppsView').html(this.children.defaultAddAppsView.render().el); 
                    } 
                return this; 
            },  
            template: '\
                <div id="defaultAppsView"></div>\
                <div id="selectedAppsView"></div>\
            ' 
            
        }); 

});


