define(
	['module', 
         'underscore', 
         'views/Base', 
         'backbone', 
         'util/general_utils', 
         'views/deploymentserver/shared/DSPaginator', 
         'views/deploymentserver/editServerclass/addClients/ClientsGrid' 
        ], 
	function(
            module, 
            _, 
            BaseView, 
            Backbone, 
            general_utils, 
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
             showEmptyMessage: function() {
                if (this.collection.length == 0 && !this.model.search.get('filter')){
                    // Show the "No Clients Selected" message unless the user is typing in a search
                    this.$('#allclients_paginator').hide(); 
                    this.$('#allClientsGridContainer').hide(); 
                    this.$('#allclients_empty_message').show(); 
                } else {
                    this.$('#allclients_empty_message').hide(); 
                    this.$('#allclients_paginator').show(); 
                    this.$('#allClientsGridContainer').show(); 
                }
            },
            render: function() {
                var html = this.compiledTemplate(); 
                this.$el.html(html); 
                this.$('#allclients_paginator').html(this.children.paginator.render().el); 
                this.$('#allClientsGridContainer').append(this.children.clientsTabGrid.render().el); 
                this.$('#allclients_empty_message').html('<div class="message-single">  <div class="alert alert-error"> <i class="icon-alert"></i>' + _('No clients have phoned home.').t() + '</div> </div>');  
                this.showEmptyMessage(); 
                return this; 
            },
            _getClientsTabGrid: function() {
                return ClientsTabGrid;
            },
            template: '\
                <div id="allclients_empty_message"></div>\
                <div id="allclients_paginator"></div>\
                <div id="allClientsGridContainer"></div>\
               ' 
  

     });
});
