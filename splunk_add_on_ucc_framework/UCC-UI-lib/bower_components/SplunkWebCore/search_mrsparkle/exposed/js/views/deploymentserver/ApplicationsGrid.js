define(
    [
        'jquery',
        'module', 
        'views/Base', 
        'underscore', 
        'views/deploymentserver/EditAppsLink', 
        'uri/route', 
         'collections/services/deploymentserver/DeploymentServerClients',
        'contrib/text!views/deploymentserver/ApplicationsGrid.html'
    ], 
    function(
        $,
        module, 
        BaseView, 
        _, 
        EditLink, 
        route, 
        ClientsCollection, 
        appsTemplate
    ) { 
              return  BaseView.extend({
                    moduleId: module.id,
                    template: appsTemplate, 
		    initialize: function() {
                        BaseView.prototype.initialize.apply(this, arguments);
                        this.collection.deploymentApps.on('reset', function(){
                            this.render(); 
                        }, this);  
		    },
		    render: function() {
                        var index = 0; 
                        this.collection.deploymentApps.each(function(app){ 
                            app.set('rowId', 'apptable_row_' + index);  
                            index++; 
                        }); 

			            var html = this.compiledTemplate({_:_, collection: this.collection, route: route, application: this.options.application}); 
			            this.$el.html(html); 

                        var that = this;  
                        this.collection.deploymentApps.each(function(app){ 
                            var edit_link_id = '#edit_' + app.get("rowId"); 
                            var editLinkView = new EditLink({
                                model: {
                                     app: app, 
                                     paginator: that.model.paginator
                                }, 
                                isReadOnly: that.options.isReadOnly, 
                                application: that.options.application
                            });  
                            that.$(edit_link_id).html(editLinkView.render().el); 
                        }); 
                        this.renderClientsInfoForAppAt(0); 
			            return this; 
		    }, 
                    showDefaultClientsInfoForApp: function(app) {
                        var edit_link_id = '#edit_' + app.get("rowId"); 
                        var deployHREF = route.manager(this.options.application.get('root'), this.options.application.get('locale'),this.options.application.get('app'), 'deploymentserver_edit_app', {data: {id: app.id}});
                        if (this.options.isReadOnly) {
                            this.$(edit_link_id).html('<span class="link">' + _('Edit').t() + '</span>');
                        } else {
                            this.$(edit_link_id).html('<a href="' + deployHREF + '">' + _('Edit').t() + '</a>');
                        }

                        var name_display_id = '#name_' + app.get("rowId"); 
                        this.$(name_display_id).html(app.entry.get('name')); 

                        var numclients_id = '#numclients_for_app_' + app.get("rowId"); 
                        this.$(numclients_id).html('0'); 
                        var deployed_ratio_id = '#deployed_apps_ratio_' + app.get("rowId"); 
                        this.$(deployed_ratio_id).html(_('0 deployed').t()); 
                    }, 
                    renderClientsInfoForAppAt: function(index) {
                        if (index >= this.collection.deploymentApps.length) return; 
                       
                        var app = this.collection.deploymentApps.at(index); 
                        var that = this;  
                        
                        if (app.entry.content.get('serverclasses').length == 0){
                                that.showDefaultClientsInfoForApp(app); 
                                that.renderClientsInfoForAppAt(index+1);  
                        } else {
                            //  In the following code, we are making a distinction between a client with errors vs. a client with RELEVANT errors.  Here a relevant error means that the error was caused by this specific app as opposed to errors caused by other apps. 
                            //
                            //  We compute two values: 
                            //     1) numErrors = Number of clients with this app  which have RELEVANT errors (errors originated from this specific app) 
                            //     2) numSucesses = Number of clients with this app which do not have any relevant errors 
                            //
                            //  We are making two seperate REST calls here to compute the above values: 
                            //     1) We fetch the number clients with this app with errors.  Then we iterate through each error to filter out the irrelevant errors 
                            //        Suppose we have 100 clients in an error state.  Out of those 99 errors originate from this specific app and  one client has an error that does not originate from this app.  Then we have numErrors = 99 and numSuccesses = 1
                            //     2) Next we fetch the number of clients with this app without errors.  Continuing the above example, suppose we find that 1000 clients with this app do not have errors.  Then we have 
                            //        numErrors = 99 and numSuccesses = 1001 
 
                                var clientsWithAppWithErrors = new ClientsCollection(); 
                                var clientsWithAppWithoutErrors = new ClientsCollection(); 

                                that.deferred = {}; 

                                //Fetch #1: Get clients with this app which have errors 
                                that.deferred.clientsWithAppWithErrors = clientsWithAppWithErrors.fetch({
                                    data:{
                                        application: app.entry.get('name'), 
                                        hasDeploymentError: true,
                                        count: -1
                                    },  
                                    error: function() {
                                        that.showDefaultClientsInfoForApp(app); 
                                        that.renderClientsInfoForAppAt(index+1); 
                                    }
                                }); 

                                //Fetch #2: Get clients with this app which do not have errors 
                                that.deferred.clientsWithAppWithoutErrors = clientsWithAppWithoutErrors.fetch({
                                    data:{
                                        hasDeploymentError: false,
                                        count: -1
                                    },  
                                    error: function() {
                                        that.showDefaultClientsInfoForApp(app); 
                                        that.renderClientsInfoForAppAt(index+1); 
                                    }
                                }); 


                                $.when(                    
                                    that.deferred.clientsWithAppWithErrors, 
                                    that.deferred.clientsWithAppWithoutErrors 
                                ).then(function(){
                                        var numSuccessfulDownloads = 0; 
                                        var numErrors = 0; 
                                        var deployed_ratio_id = '#deployed_apps_ratio_' + app.get("rowId"); 
                                        clientsWithAppWithErrors.each(function(client){
                                            var applications = client.entry.content.get("applications"); 
                                            var matchedApp = applications[app.entry.get("name")]; 
                                            if (matchedApp) {
                                                var appStatus = matchedApp["result"]; 
                                                if (appStatus == "Ok"){
                                                    numSuccessfulDownloads++; 
                                                } else {
                                                    numErrors++; 
                                                }
                                            }
                                        });       

                                        //Parse results from fetch #2 (clients with app with out any errors)
                                        if (clientsWithAppWithoutErrors.length > 0) {
                                             clientsWithAppWithoutErrors.each(function(client){
                                                var applications = client.entry.content.get("applications");
                                                if(applications && applications[app.entry.get("name")] && applications[app.entry.get("name")].result == 'Ok'){
                                                    numSuccessfulDownloads++;
                                                }
                                             });
                                        }

                                        that.$(deployed_ratio_id).html(numSuccessfulDownloads + _(' deployed').t()); 

                                        var icon_id = '#deployed_apps_ratio_alert_' + app.get("rowId"); 
                                        var num_errors_id = '#app_errors_' + app.get("rowId"); 
                                        that.$(num_errors_id).html(numErrors); 
                                        if (numErrors > 0) {
                                            that.$(icon_id).show(); 
                                            that.$(num_errors_id).show(); 
                                        } else {
                                            that.$(icon_id).hide(); 
                                            that.$(num_errors_id).hide(); 
                                        }
                                        that.renderClientsInfoForAppAt(index+1); 
 
                                }); 
                          }
                    }
		});
              
});








