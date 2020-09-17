define([
    'module', 
    'views/Base', 
    'backbone', 
    'util/time',  
    'underscore', 
    'contrib/text!views/deploymentserver/editServerclass/addClients/ClientsTabGrid.html'
    ], 
	function(
            module, 
            BaseView, 
            Backbone, 
            time_utils, 
            _, 
            template) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 

                this.model.search.on('change:filter', this.performSearch, this);
                this.collection.on('reset', this.render, this);  
            },
            render: function() {
                     var html = this.compiledTemplate({_:_, collection: this.collection, areAllClientsSelected: this.options.areAllClientsSelected, convertToRelativeTime: time_utils.convertToRelativeTime}); 
                     this.$el.html(html); 
                return this; 
            },
            performSearch: function() {
                var data = this.model.paginator.get('data') || {}; 
               // data.search = this.model.search.get('filter'); 
                data.search = this.model.search.get('filter') ? 'clientName="*' + this.model.search.get('filter') + '*" OR ' + 
                        'hostname="*' + this.model.search.get('filter') + '*" OR ' + 
                        'ip="*' + this.model.search.get('filter') + '*" OR ' + 
                        'utsname="*' + this.model.search.get('filter') + '*" '  
                          : '';  // If user typed in a search

                this.model.paginator.set('data', data); 
                this.model.paginator.trigger('change:data'); 
            }, 
            events: {
                "click .switchTabPrompt" : function(e) {
                     //this.model.set('visibleTab', 'SelectedClients');                      
                     return false; 
                 }        
            } 
 
        });
});
