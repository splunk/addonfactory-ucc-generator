define(
	['module', 
         'underscore', 
         'views/Base', 
         'backbone', 
         'util/general_utils', 
         'views/deploymentserver/Search', 
         'views/deploymentserver/shared/DSPaginator', 
         'views/deploymentserver/editServerclass/addClients/ClientsGrid' 
        ], 
	function(
            module, 
            _, 
            BaseView, 
            Backbone, 
            general_utils, 
            Search, 
            Paginator,  
            ClientsTabGrid
         ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                
                // Paginator for selected clients table 
                this.children.paginator = new Paginator(
                    {
                        model: this.model.paginator, 
                        collection: this.collection
                    }
                );

                var _ClientsTabGrid = this._getClientsTabGrid();
             
                // Clients table
                this.children.clientsTabGrid = new _ClientsTabGrid({
                    model: {
                       'search': this.model.search,
                       //'clientFilters' : this.model.clientFilters, 
                       'paginator' : this.model.paginator
                    }, 
                    collection: this.collection, 
                    areAllClientsSelected: true 
                });                  
                this.collection.on('reset', this.showEmptyMessage, this);  
            }, 
             showEmptyMessage: function() {
                if (this.collection.length == 0 && !this.model.search.get('filter')){
                    // Show the "No Clients Selected" message unless the user is typing in a search
                    this.$('#selectedClients_paginator').hide(); 
                    this.$('#selectedClientsGridContainer').hide(); 
                    this.$('#selected_empty_message').show(); 
                } else {
                    this.$('#selected_empty_message').hide(); 
                    this.$('#selectedClients_paginator').show(); 
                    this.$('#selectedClientsGridContainer').show(); 
                }
            },
            render: function() {
                var html = this.compiledTemplate(); 
                this.$el.html(html); 
                this.$('#selectedClients_paginator').html(this.children.paginator.render().el); 
                this.$('#selectedClientsGridContainer').append(this.children.clientsTabGrid.render().el); 
                this.$('#selected_empty_message').html('<div class="message-single">  <div class="alert alert-error"> <i class="icon-alert"></i>' + _('No clients selected.').t() + '</div> </div>');  
                this.showEmptyMessage(); 
                return this; 
            },
            _getClientsTabGrid: function() {
                return ClientsTabGrid;
            },
            template: '\
                <div id="selected_empty_message"></div>\
                <div id="selectedClients_paginator"></div>\
                <div id="selectedClientsGridContainer"></div>\
               ' 
  

     });
});
