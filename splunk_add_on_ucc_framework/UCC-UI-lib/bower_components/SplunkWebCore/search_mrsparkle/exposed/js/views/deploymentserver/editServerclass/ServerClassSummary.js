define(
    ['module', 'views/Base', 'underscore', 'splunk.i18n', 'splunk.util', 'util/general_utils', 'collections/services/deploymentserver/DeploymentServerClients','contrib/text!views/deploymentserver/editServerclass/ServerClassSummary.html'], 
    
        function(module, BaseView, _, i18n, splunkUtil, general_utils, ClientsCollection, clientsSummaryTemplate) { 
          return  BaseView.extend({
            moduleId: module.id,
            template: clientsSummaryTemplate,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                this.collection.apps.on('reset', this.renderAppsInServerClass, this);  
                this.collection.clients.on('reset', function() {
                    this.renderClientsInServerClass(); 
                    this.renderPercentageDeployed(); 
                }, this);  
            },
            render: function() {
                var html = this.compiledTemplate({_:_});
                this.$el.html(html); 
                this.$el.hide(); 
                return this; 
            }, 
            renderAppsInServerClass: function() {
                var numApps = this.collection.apps.length > 0 ? this.collection.apps.first().paging.get('total') : 0; 
                var numAppsStr = numApps; 
                this.$('#numAppsInServerClass').html(numAppsStr); 
                this.$('#numAppsLabel').html(splunkUtil.sprintf(i18n.ungettext("App", "Apps", numApps), numApps)); 
                this.showOrHide(); 
            }, 
            renderClientsInServerClass: function() {
                //var numClients  = this.collection.clients.length; 
                var numClients = this.collection.clients.length > 0 ? this.collection.clients.first().paging.get('total') : 0; 
                var numClientsStr = numClients; 
                this.$('#numClientsInServerClass').html(numClientsStr); 
                this.$('#numClientsInSCLabel').html(splunkUtil.sprintf(i18n.ungettext("Client", "Clients", numClients), numClients)); 
                this.showOrHide(); 
            }, 
            renderPercentageDeployed: function() {
                var percentage = 'N/A'; 
                this.$('#percentageDeployed').html(percentage); 

                //Get number of clients in this serverclass which have deployment errors
                var that = this; 
                var successfulClients = new ClientsCollection();
                successfulClients.fetch({
                                data:{
                                    hasDeploymentError: false,
                                    count: 10,
                                    serverclasses: that.model.entry.get("name") 
                                },
                                success: function(successfulClients, response){
                                    var numSelectedClients = that.collection.clients.length > 0 ? that.collection.clients.first().paging.get('total') : 0; 
                                    var numSuccessfulClients = successfulClients.length > 0 ? successfulClients.first().paging.get('total') : 0; 
			            if (numSelectedClients) {
                                        percentage = i18n.format_percent((numSuccessfulClients/numSelectedClients).toFixed(0)); 
                                    } else {
                                        percentage = 'N/A'; 
                                    }
                                    that.$('#percentageDeployed').html(percentage); 
                                }
                });

            }, 
            showOrHide: function() {
                if (this.collection.apps.length == 0 || this.collection.clients.length == 0)
                    //this.$el.show(); 
                    this.$el.hide(); 
                else
                    this.$el.show(); 
            }
        }); 
});
