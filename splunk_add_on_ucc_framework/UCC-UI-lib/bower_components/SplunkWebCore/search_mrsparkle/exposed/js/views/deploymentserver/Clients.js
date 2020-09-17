define(
	['module', 
         'views/Base', 
         'backbone', 
         'underscore', 
         'splunk.i18n',
         'uri/route',
         'util/general_utils', 
         'views/deploymentserver/Search', 
         'views/deploymentserver/ClientsGrid', 
         'collections/services/deploymentserver/DeploymentServerClients', 
         'views/deploymentserver/shared/DSPaginator', 
         'views/shared/controls/SyntheticSelectControl',
         'contrib/text!views/deploymentserver/Clients.html'
        ], 
	function(
            module, 
            BaseView, 
            Backbone, 
            _, 
            i18n,
            route,
            general_utils, 
            Search, 
            ClientsGrid,
            DeploymentServerClientsCollection,
            Paginator, 
            SyntheticSelectControl, 
            template
         ) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                
                //Search filter
                this.children.search = new Search({
                    model: this.model.filters
                }); 

                // Filter by phone home status 
                this.children.phonehome_filter2 = new SyntheticSelectControl({
                     menuWidth: "medium",
                     className: "btn-group pull-left",
                     items: [
                         {'value': 'hour', 'label': _('Phone Home: In Last Hour').t()}, 
                         {'value': 'day', 'label': _('Phone Home: In Last 24 Hours').t()}, 
                         {'value': 'withinExpected', 'label': _('Phone Home: Within Expected').t()}, 
                         {'value': 'laterThanExpected', 'label': _('Phone Home: Later than Expected').t()}, 
                         {'value': 'All', 'label': _('Phone Home: All').t()} 
                     ], 
                     model: this.model.filters, 
                     toggleClassName: 'btn-pill', 
                     modelAttribute: 'phonehome_filter'
                });
                this.model.filters.set('phonehome_filter', 'All'); 
 
                // Filter by phone home status 
                this.children.phonehome_filter = new SyntheticSelectControl({
                     menuWidth: "medium",
                     className: "btn-group pull-left",
                     items: [
                        [ 
                            {'value': 'hour', 'label': _('Phone Home: In Last Hour').t()},
                            {'value': 'day', 'label': _('Phone Home: In Last 24 Hours').t()}
                        ],
                        [
                            {'value': 'withinExpected', 'label': _('Phone Home: Within Expected').t()},
                            {'value': 'laterThanExpected', 'label': _('Phone Home: Later than Expected').t()}
                        ],
                        [
                            {'value': 'All', 'label': _('Phone Home: All').t()}
                        ]
                     ], 
                     model: this.model.filters, 
                     toggleClassName: 'btn-pill', 
                     modelAttribute: 'phonehome_filter'
                });
                this.model.filters.set('phonehome_filter', 'All'); 
 

                // Filter by deployed percentage
                this.children.deployed_filter = new SyntheticSelectControl({
                     menuWidth: "medium",
                     className: "btn-group pull-left",
                     items: [
                         {'value': 'Complete', 'label': _('Deployed Successfully').t()}, 
                         {'value': 'Incomplete', 'label': _('Deployed Partially').t()}, 
                         {'value': 'All', 'label': _('All Clients').t()}
                     ], 
                     model: this.model.filters, 
                     toggleClassName: 'btn-pill', 
                     modelAttribute: 'deploy_filter'
                });
                this.model.filters.set('deploy_filter', 'All'); 

                // Paginator for clients table 
                this.children.paginator = new Paginator(
                    {
                        model: this.model.paginator, 
                        collection: this.collection
                    }
                );

             
                // Clients table
                this.children.clientsGrid = new ClientsGrid({
                    model: {
                        paginator: this.model.paginator
                    }, 
                    collection: this.collection, 
                    application: this.options.application
                });                  

                // Stitching the search bar with the paginator
                this.model.filters.on('change:filter', function(){
                    var data = this.model.paginator.get('data') || {}; 
                    data.search = this.model.filters.get('filter') ? 'clientName="*' + this.model.filters.get('filter') + '*" OR ' + 
                        'hostname="*' + this.model.filters.get('filter') + '*" OR ' + 
                        'ip="*' + this.model.filters.get('filter') + '*" OR ' + 
                        'utsname="*' + this.model.filters.get('filter') + '*" '  
                          : '';  // If user typed in a search

                    this.model.paginator.set('data', data);  
                    this.model.paginator.trigger('change:data'); 
                }, this);
 
                //Stitching the deployment filter with the paginator
                this.model.filters.on('change:deploy_filter', function(){
                    var data = this.model.paginator.get('data') || {}; 
                    if (this.model.filters.get('deploy_filter') == 'All'){
                        delete data.hasDeploymentError; 
                    } else if (this.model.filters.get('deploy_filter') == 'Complete'){
                        data.hasDeploymentError = false; 
                    } else if (this.model.filters.get('deploy_filter') == 'Incomplete'){
                        data.hasDeploymentError = true; 
                    }
                    this.model.paginator.set('data', data);  
                    this.model.paginator.trigger('change:data'); 
                }, this);
                
                //Stitching the phonehome filter with the paginator
                this.model.filters.on('change:phonehome_filter', function(){
                    var data = this.model.paginator.get('data') || {}; 
                    delete data.minLatestPhonehomeTime; 
                    delete data.minPhonehome_latency_to_avgInterval_ratio; 
                    delete data.maxPhonehome_latency_to_avgInterval_ratio; 

                    if (this.model.filters.get('phonehome_filter') == 'hour'){
                        var epoch_time = parseInt(Date.now()/1000, 10) - 60*60;
                        data.minLatestPhonehomeTime = epoch_time; 
                    } else if (this.model.filters.get('phonehome_filter') == 'day'){
                        epoch_time = parseInt(Date.now()/1000, 10) - 24*60*60;
                        data.minLatestPhonehomeTime = epoch_time; 
                    } else if (this.model.filters.get('phonehome_filter') == 'withinExpected'){
                        data.maxPhonehome_latency_to_avgInterval_ratio = 3; 
                    } else if (this.model.filters.get('phonehome_filter') == 'laterThanExpected'){
                        data.minPhonehome_latency_to_avgInterval_ratio = 3; 
                    }
                    this.model.paginator.set('data', data);  
                    this.model.paginator.trigger('change:data'); 
                }, this);


            },
            render: function() {
                if (this.collection.length == 0){
                    var docUrl = route.docHelp(
                        this.options.application.get("root"),
                        this.options.application.get("locale"),
                        'manager.deployment.overview'
                    );

                    this.$el.html(_.template(this.errorTemplate, {docUrl: docUrl}));
                } else {
                    var html = this.compiledTemplate(); 
                    this.$el.html(html); 
                    this.$('#clientFilterContainer').append(this.children.search.render().el); 
                    this.$('#clientsGridContainer').append(this.children.clientsGrid.render().el); 
                    this.$('#clients_paginator').html(this.children.paginator.render().el); 
                    this.$('#clients_deployment_filter').html(this.children.deployed_filter.render().el); 
                    this.$('#clients_phonehome_filter').html(this.children.phonehome_filter.render().el); 
                }
                return this; 
            },

            errorTemplate: '\
                <div class="message-single">  \
                    <div class="alert alert-error"> \
                        <i class="icon-alert"></i>\
                        <%- _("No clients phoned home.  ").t() %>\
                        <a href="<%-docUrl%>" target="_blank" class="external"><%- _("Learn more.").t() %></a>\
                    </div>\
                </div>\
            '
        });
});
