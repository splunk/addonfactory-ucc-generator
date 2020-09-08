define(
	['module', 
         'views/Base', 
         'backbone', 
         'underscore', 
         'splunk.i18n', 
         'util/general_utils', 
         'views/deploymentserver/Search', 
         'views/deploymentserver/ClientsGrid', 
         'views/deploymentserver/Clients',
         'views/shared/controls/SyntheticSelectControl',
         'contrib/text!views/deploymentserver/Clients.html'
        ], 
	function(
            module, 
            BaseView, 
            Backbone, 
            _, 
            i18n, 
            general_utils, 
            Search, 
            ClientsGrid,
            ClientsView,
            SyntheticSelectControl, 
            template
         ) {
        return ClientsView.extend({
            moduleId: module.id,
            template: template,
            initialize: function() {
                ClientsView.prototype.initialize.apply(this, arguments); 
            },
            render: function() {
                    var html = this.compiledTemplate(); 
                    this.$el.html(html); 
                    this.$('#clientFilterContainer').append(this.children.search.render().el); 
                    this.$('#clientsGridContainer').append(this.children.clientsGrid.render().el); 
                    this.$('#clients_paginator').html(this.children.paginator.render().el); 
                    this.$('#clients_deployment_filter').html(this.children.deployed_filter.render().el); 
                    this.$('#clients_phonehome_filter').html(this.children.phonehome_filter.render().el); 
                return this; 
            }
        });
});
