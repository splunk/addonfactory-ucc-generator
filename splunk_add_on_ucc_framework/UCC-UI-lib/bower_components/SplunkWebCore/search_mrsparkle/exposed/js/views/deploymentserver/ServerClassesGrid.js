define(
    [
       'jquery',
       'module', 
       'views/Base', 
       'backbone', 
       'underscore', 
       'uri/route', 
       'util/time', 
       'views/deploymentserver/EditServerClassesLink', 
       'collections/services/deploymentserver/DeploymentServerClients',
       'collections/services/deploymentserver/DeploymentApplications',
       'contrib/text!views/deploymentserver/ServerClassesGrid.html'
    ], 
    function(
        $,
        module, 
        BaseView, 
        Backbone, 
        _, 
        route, 
        time_utils, 
        EditLink, 
        ClientsCollection, 
        DeploymentAppsCollection, 
        appsTemplate
    ) { 
              return  BaseView.extend({
                    moduleId: module.id,
                    template: appsTemplate, 
                    initialize: function() {
                        BaseView.prototype.initialize.apply(this, arguments); 

                        this.render(); 
                        this.renderNumClientsColumn(); 
                        this.renderNumAppsColumn(); 

                        this.collection.serverClasses.on('reset', function(){
                            this.render(); 
                            this.renderNumClientsColumn(); 
                            this.renderNumAppsColumn(); 
                        }, this);  
                    },
                    render: function() {
                        var html = this.compiledTemplate({_:_, collection: this.collection, route: route, application: this.options.application, convertToRelativeTime: time_utils.convertToRelativeTime});
                        this.$el.html(html);

                        // Set the edit link of each row of the Server classes table
                        var that = this; 
                        this.collection.serverClasses.each(function(serverclass){ 
                            var edit_link_id = '#edit_' + serverclass.getNameWithoutSpecialCharacters(); 
                            var editLinkView = new EditLink({
                                model: {
                                     serverclass: serverclass, 
                                     paginator: that.model.paginator
                                },
                                collection: {deploymentApps: this.collection.deploymentApps},
                                isReadOnly: that.options.isReadOnly, 
                                application: that.options.application
                            });  
                            that.$(edit_link_id).html(editLinkView.render().el); 
                        }, this);

                        return this;
                    },
                    renderNumClientsColumn: function() {
                        var that = this; 
                        this.collection.serverClasses.each(function(serverclass){
                            var clientsWithServerclassWithErrors = new ClientsCollection(); 
                            var clientsWithServerclassWithoutErrors = new ClientsCollection(); 

                            //  In the following code, we are making a distinction between a client with errors vs. a client with RELEVANT errors.  Here a relevant error means that the error was caused by an app in the current serverclass as opposed to errors caused by other apps from other serverclasses. 
                            //
                            //  We compute two values: 
                            //     1) numErrors = Number of clients belonging to this serverclass which have RELEVANT errors (errors originated from apps in the serverclass) 
                            //     2) numSucesses = Number of clients belonging to this serverclass without relevant errors 
                            //
                            //  We are making two seperate REST calls here to compute the above values: 
                            //     1) We fetch the number clients in the serverclass with errors.  Then we iterate through each error to filter out the irrelevant errors 
                            //        Suppose we have 100 clients in an error state.  Out of those 99 errors originate from an app in this serverclass and one client has an error that does not originate from an app in this serverclass.  Then we have numErrors = 99 and numSuccesses = 1
                            //     2) Next we fetch the number of clients in the serverclass without errors.  Continuing the above example, suppose we find that 1000 clients do not have errors.  Then we have 
                            //        numErrors = 99 and numSuccesses = 1001 
                            that.deferred = {}; 

                            //Fetch #1: Number of clients in serverclass with errors
                            that.deferred.clientsWithServerclassWithErrors = clientsWithServerclassWithErrors.fetch({
                                data:{
                                    serverclasses: serverclass.entry.get('name'), 
                                    hasDeploymentError: true,
                                    count: -1  //NOTE: this is an unbounded search, but the REST api does not provide a convenient way to grab the clients in a serverclass which have a relevant error 
                                }
                            });  
                            
                            //Fetch #2: Number of clients in serverclass without errors
                            that.deferred.clientsWithServerclassWithoutErrors = clientsWithServerclassWithoutErrors.fetch({
                                data:{
                                    serverclasses: serverclass.entry.get('name'), 
                                    hasDeploymentError: false,
                                    count: 1 
                                }
                            });  

                            $.when(                    
                                that.deferred.clientsWithServerclassWithErrors, 
                                that.deferred.clientsWithServerclassWithoutErrors 
                            ).then(function(){
                               var sc_name = serverclass.getNameWithoutSpecialCharacters(); 
                                    
                                    //Parse results from fetch #1 (clients in serverclass with errors)  Determine which errors orginated from an app within the serverclass 
                                    var numSuccessfulDownloads = 0; 
                                    var numErrors = 0; 
                                    var deployed_ratio_id = '#sc_deployed_ratio_' + sc_name; 
                                    clientsWithServerclassWithErrors.each(function(client){
                                            var applications = client.entry.content.get("applications"); 
                                            var isSuccessful = true; 
                                            for (var appname in applications) {
                                                if (applications.hasOwnProperty(appname)) {
                                                    var app = applications[appname];  
                                                    var serverclasses = app.serverclasses; 
                                                    for (var i = 0; i < serverclasses.length; i++) {
                                                        var sc = serverclasses[i]; 
                                                        if (sc == serverclass.entry.get("name")){
                                                            var appStatus = app["result"]; 
                                                            if (appStatus != "Ok"){
                                                                isSuccessful = false; 
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                            if (isSuccessful) { 
                                                numSuccessfulDownloads++; 
                                            } else {
                                                numErrors++; 
                                            }
                                    });       


                                    //Parse results from fetch #2 (clients in serverclass with out any errors)
                                    if (clientsWithServerclassWithoutErrors.length > 0) {
                                        numSuccessfulDownloads +=  clientsWithServerclassWithoutErrors.first().paging.get('total');
                                    }


                                    // Display errors/successes in the html
                                    var deployed_ratio = numSuccessfulDownloads +  _(" deployed").t(); 
                                    that.$(deployed_ratio_id).html(deployed_ratio); 

                                    var icon_id = '#sc_deployed_ratio_icon_' + sc_name; 
                                    var num_errors_id = '#sc_errors_' + sc_name; 
                                    that.$(num_errors_id).html(numErrors); 
                                    if (numErrors > 0) {
                                        that.$(icon_id).show(); 
                                        that.$(num_errors_id).show(); 
                                    } else {
                                        that.$(icon_id).hide(); 
                                        that.$(num_errors_id).hide(); 
                                    }
 
                            });
                        }); 
                    },
                    renderNumAppsColumn: function() {
                        var that = this; 
                        this.collection.serverClasses.each(function(serverclass){
                            var sc_name = serverclass.getNameWithoutSpecialCharacters(); 
                            var appsWithServerclass = new DeploymentAppsCollection(); 
                            appsWithServerclass.fetch({
                                data:{
                                    search: 'serverclasses="'+serverclass.entry.get('name')+'"', 
                                    count: -1 
                                }, 
                                success: function(apps, response){
                                    var numapps_id = '#numapps_' + sc_name;  
                                    that.$(numapps_id).html(apps.length); 
                                }
                            }); 
                        }); 
                    }
                });
              
});






