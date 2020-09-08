define(
    [
    'module',
    'views/Base',
    'splunk.i18n', 
    'splunk.util', 
    'underscore', 
    'collections/services/deploymentserver/DeploymentServerClients',
    'contrib/text!views/deploymentserver/appDetail/Summary.html'
    ],
        function(
            module,
            BaseView,
            i18n, 
            splunkUtil,
            _,  
            ClientsCollection,
            summaryTemplate,
            SingleValue
            ) {
          return  BaseView.extend({
            moduleId: module.id,
            template: summaryTemplate,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                this.collection.clientsWithApp.on('reset', this.renderDeployedAppsRatio, this); 
            },
            renderClientsWithApp: function() {
                //Get number of clients which have the app 
                var that = this;
                this.collection.clientsWithApp.fetch({
                                data:{
                                    count: 10, 
                                    application: this.model.entry.get('name') 
                                },
                                success: function(clientsWithApp, response){
                                    var numClientsWithApp = clientsWithApp.length > 0 ? clientsWithApp.first().paging.get('total') : 0; 
                                    that.$('#numClientsWithAppLabel').html(i18n.ungettext("Client", "Clients", numClientsWithApp));
                                    that.$('#numClientsWithApp').html(numClientsWithApp);
                                    that.$('.clients-match-text').html(i18n.ungettext("Matches The App", "Match the App", numClientsWithApp));
                                }
                });
            }, 
            renderAppDataSize: function() {
                var appSize = this.model.entry.content.get("size"); 

                //SPL-82863 - sometimes the REST response will return an array of values for 'size'
                if (appSize instanceof Array) {
                    appSize = appSize[0]; 
                }

                appSize = (appSize/(1024*1024)).toFixed(1);  
                //appSize = i18n.format_decimal(appSize); 
                this.$('#appSize').html(appSize);
            }, 
            renderDeployedAppsRatio: function() {
                //Get Percentage of Clients which downloaded the app successfully 
                var percentage = 'N/A'; 
                this.$('#percentageDeployed').html(percentage);
                var that = this;
                this.collection.successfulClients.fetch({
                                data:{
                                    count: 10, 
                                    application: this.model.entry.get('name'), 
                                    hasDeploymentError: false
                                },
                                success: function(successfulClients, response){
                                    var numSuccessfulClients = successfulClients.length > 0 ? successfulClients.first().paging.get('total') : 0; 
                                    var numClientsWithApp = that.collection.clientsWithApp.length > 0 ? that.collection.clientsWithApp.first().paging.get('total') : 0; 

                                    if (numClientsWithApp) {
                                        percentage = i18n.format_percent((numSuccessfulClients/numClientsWithApp).toFixed(2)); 
                                    } else {
                                        percentage = 'N/A'; 
                                    }
                                    that.$('#percentageDeployed').html(percentage);
                                }
                });
            }, 
            render: function() {
                var html = this.compiledTemplate({_:_});
                this.$el.html(html);
                this.renderAppDataSize(); 
                this.renderClientsWithApp(); 
                this.renderDeployedAppsRatio(); 
                return this;
            }
        });
});
