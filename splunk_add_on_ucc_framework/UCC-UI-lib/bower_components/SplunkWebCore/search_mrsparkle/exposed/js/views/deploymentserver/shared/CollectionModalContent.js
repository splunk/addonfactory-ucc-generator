define(
    [
        'module', 
        'backbone', 
        'underscore', 
        'views/Base', 
        'views/deploymentserver/Search', 
         'views/deploymentserver/shared/CollectionModalGrid', 
         'views/deploymentserver/shared/DSPaginator', 
        'views/shared/controls/SyntheticSelectControl',
        'contrib/text!views/deploymentserver/shared/CollectionModalContent.html'
    ], 
    function(
        module, 
        Backbone, 
        _, 
        BaseView, 
        Search, 
        ApplicationsGrid, 
        Paginator, 
        SyntheticSelectControl, 
        appsTemplate
    ) { 
              return  BaseView.extend({
                    moduleId: module.id,
                    template: appsTemplate, 
		    initialize: function() {
                        BaseView.prototype.initialize.apply(this, arguments);
			//console.log(this.options); 
                
                        //Search filter
                        this.children.search = new Search({
                            model: this.model.filters
                        }); 

                        // Paginator for applicaitons table 
                        this.children.paginator = new Paginator(
                            {
                                model: this.model.paginator, 
                                collection: this.collection
                            }
                        );

                        // Applications table
                        this.children.applicationsGrid = new ApplicationsGrid({
                             model: {
                                paginator: this.model.paginator
                             }, 
                             collection: this.collection
                        });                  


                        // Stitching the search bar with the paginator
                        this.model.filters.on('change:filter', this.handleSearch, this);
                   },
                   handleSearch: function(){
                            var data = this.model.paginator.get('data') || {}; 
                            data.search = this.model.filters.get('filter') || '';  // If user typed in a search
                            this.model.paginator.set('data', data);  
                            this.model.paginator.trigger('change:data'); 
                   },
                   render: function() {
                           var html = this.compiledTemplate(); 
                           this.$el.html(html); 
                           this.$('#moreappsFilterContainer').append(this.children.search.render().el); 
                           this.$('#moreappsGridContainer').append(this.children.applicationsGrid.render().el); 
                           this.$('#moreapps_paginator').html(this.children.paginator.render().el); 
                       return this; 
                   }
		});
              
});


