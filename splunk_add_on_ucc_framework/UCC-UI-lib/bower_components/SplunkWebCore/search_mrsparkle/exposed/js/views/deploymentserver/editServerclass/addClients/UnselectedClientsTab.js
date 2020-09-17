define(
	['module', 
         'views/Base', 
         'underscore', 
         'backbone', 
         'util/general_utils', 
         'views/deploymentserver/Search', 
         'views/deploymentserver/shared/DSPaginator', 
         'views/deploymentserver/editServerclass/addClients/ClientsGrid' 
        ], 
	function(
            module, 
            BaseView, 
            _, 
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
                    areAllClientsSelected: false 
                });                  
                this.collection.on('reset', this.showEmptyMessage, this);  
            },
            render: function() {
                var html = this.compiledTemplate(); 
                this.$el.html(html); 
                this.$('#unselectedClients_paginator').html(this.children.paginator.render().el); 
                this.$('#unselectedClientsGridContainer').append(this.children.clientsTabGrid.render().el); 
                this.$('#unselected_empty_message').html('<div class="message-single">  <div class="alert alert-error"> <i class="icon-alert"></i>' + _('No clients unselected.').t() + '</div> </div>');  
                this.showEmptyMessage(); 
                return this; 
            }, 
            showEmptyMessage: function() {
                if (this.collection.length == 0 && !this.model.search.get('filter')){
                    // Show the "No Clients Selected" message unless the user is typing in a search
                    this.$('#unselectedClients_paginator').hide(); 
                    this.$('#unselectedClientsGridContainer').hide(); 
                    this.$('#unselected_empty_message').show(); 
                } else {
                    this.$('#unselected_empty_message').hide(); 
                    this.$('#unselectedClients_paginator').show(); 
                    this.$('#unselectedClientsGridContainer').show(); 
                }
            }, 
            _getClientsTabGrid: function() {
                return ClientsTabGrid;
            },
            template: '\
                <div id="unselected_empty_message"></div>\
                <div id="unselectedClients_paginator"></div>\
                <div id="unselectedClientsGridContainer"></div>\
               ' 
  

     });
});

