define(
    [
    'module',
    'views/Base',
    'underscore', 
    'collections/services/deploymentserver/DeploymentServerClients',
    'collections/services/deploymentserver/RecentDownloads',
    'contrib/text!views/deploymentserver/ClientsSummary.html',
    'splunk.util',
    'splunk.i18n'
    ],
        function(
            module,
            BaseView,
            _, 
            ClientsCollection,
            RecentDownloadsCollection, 
            clientsSummaryTemplate,
            splunkUtil, 
            i18n
            ) {
          return  BaseView.extend({
            moduleId: module.id,
            template: clientsSummaryTemplate,
            render: function() {
                //Get number of clients which phoned home in the last 24 hours
                var numSecondsIn24Hours = 24 * 60 * 60;
                if( !Date.now) {
                    Date.now = function() {return new Date().getTime();};
                }
                var epoch_time = parseInt(Date.now()/1000, 10) - numSecondsIn24Hours;
                var phonedHomeClients = new ClientsCollection();
                var that = this;
                phonedHomeClients.fetch({
                                data:{
                                    minLatestPhonehomeTime: epoch_time,
                                    count: 1
                                },
                                success: function(clients, response){
                                    var numClients = 0; 
                                    if (clients.length > 0) {
                                        numClients =  clients.first().paging.get('total');
                                    }


                                    that.$('#numPhonedHomeClients').html(numClients);
                                    that.$('#phonedHomeLabel').html(i18n.ungettext("Client", "Clients", numClients));
                                }
                });


                //Get number of clients which have deployment errors
                var clientsWithDeploymentErrors = new ClientsCollection();
                clientsWithDeploymentErrors.fetch({
                                data:{
                                    hasDeploymentError: true,
                                    count: 1
                                },
                                success: function(clients, response){

                                    var numClients = 0; 
                                    if (clients.length > 0) {
                                        numClients =  clients.first().paging.get('total');
                                    }

                                    that.$('#numClientsWithDeploymentErrors').html(numClients);
                                    if (numClients > 0){ 
                                         that.$('#error_alert_symbol').show(); 
                                    } else {
                                         that.$('#error_alert_symbol').hide(); 
                                    }
                                    that.$('#errorClientsLabel').html(i18n.ungettext("Client", "Clients", numClients));
                                }
                });

                //Get number of downloads in the last hour 
                var recentDownloads = new RecentDownloadsCollection();
                var numSecondsInOneHour = 3600;
                recentDownloads.fetch({
                                data:{
                                    count: 1,
                                    maxAgeSecs: numSecondsInOneHour
                                },
                                success: function(recentDownloads, response){
                                    var numDownloads = "N/A"; 

                                    if (recentDownloads.length > 0){
                                        numDownloads = recentDownloads.first().entry.content.get('count'); 
                                        that.$('#downloadsLabel').html(i18n.ungettext("Total download", "Total downloads", numDownloads));
                                    }
                                    that.$('#numDownloadsInLastHour').html(numDownloads);
                                }
                });

                var html = this.compiledTemplate({_:_});
                this.$el.html(html);
                // this.children.singleValue.render().appendTo(this.$el);
                return this;
            }
        });
});
