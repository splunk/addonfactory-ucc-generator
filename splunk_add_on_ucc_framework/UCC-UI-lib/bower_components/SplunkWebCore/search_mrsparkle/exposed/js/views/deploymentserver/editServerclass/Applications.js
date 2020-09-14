/*
 *  This View extends the Applications view to include a serverclass model.  All search queries are prepended with the serverclass name
 */

define(
    [
        'module', 
        'backbone', 
        'views/deploymentserver/Applications'
    ], 
    function(
        module, 
        Backbone, 
        ApplicationsView
    ) { 
              return  ApplicationsView.extend({
                    moduleId: module.id,
		    initialize: function() {
                        ApplicationsView.prototype.initialize.apply(this, arguments); 
                    }, 
                    performSearch: function(){
                            var data = this.model.paginator.get('data') || {}; 
                            data.search = 'serverclasses="'+this.model.serverclass.entry.get('name') + '" ';  
                            data.search += this.model.filters.get('filter') ? 'name="*' + this.model.filters.get('filter') + '*"' : '';  // If user typed in a search

                            this.model.paginator.set('data', data);  
                            this.model.paginator.trigger('change:data'); 
                   }
		});
              
});


