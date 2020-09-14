define(
    [
        'module', 
        'backbone', 
        'underscore', 
        'uri/route', 
        'views/Base', 
        'views/deploymentserver/Search', 
        'views/deploymentserver/ApplicationsGrid', 
         'views/deploymentserver/shared/DSPaginator', 
        'views/shared/controls/SyntheticSelectControl',
        'contrib/text!views/deploymentserver/Applications.html'
    ], 
    function(
        module, 
        Backbone, 
        _, 
        route, 
        BaseView, 
        Search, 
        ApplicationsGrid, 
        Paginator, 
        SyntheticSelectControl, 
        appsTemplate
    ) { 
              return  BaseView.extend({
                    moduleId: module.id,
                    template: appsTemplate, 
		    initialize: function() {
                        BaseView.prototype.initialize.apply(this, arguments);
                
                        //Search filter
                        this.children.search = new Search({
                            model: this.model.filters
                        }); 

                        // Paginator for applicaitons table 
                        this.children.paginator = new Paginator(
                            {
                                model: this.model.paginator, 
                                collection: this.collection.deploymentApps
                            }
                        );


                        // Filter by deployed status 
                        this.children.deployed_status_filter = new SyntheticSelectControl({
                            menuWidth: "medium",
                            className: "btn-group pull-left",
                            items: [
                              [ 
                                {'value': 'undeployed', 'label': _('Apps: Undeployed').t()}, 
                                {'value': 'deployed', 'label': _('Apps: Deployed').t()} 
                              ], 
                              [
                                {'value': 'all', 'label': _('Apps: All').t()} 
                              ]
                            ],
                         model: this.model.filters, 
                         toggleClassName: 'btn-pill', 
                         modelAttribute: 'deployed_status_filter'
                        });
                        
 
                        // Filter by deployed percentage
                        this.children.deployed_filter = new SyntheticSelectControl({
                             menuWidth: "medium",
                             className: "btn-group pull-left",
                             items: [
                                 {'value': 'Complete', 'label': _('Deployed Successfully').t()}, 
                                 {'value': 'Incomplete', 'label': _('Deployed Partially').t()}, 
                                 {'value': 'All', 'label': _('All Apps').t()}
                             ], 
                             model: this.model.filters, 
                             toggleClassName: 'btn-pill', 
                             modelAttribute: 'deploy_filter'
                        });
                        
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

                        this.model.filters.set('deploy_filter', 'All', {silent:true}); 

                        // Applications table
                        this.children.applicationsGrid = new ApplicationsGrid({
                             model: {
                                paginator: this.model.paginator
                             }, 
                             collection: this.collection, 
                             isReadOnly: this.options.isReadOnly, 
                             application: this.options.application
                        });                  


                        // Stitching the search bar with the paginator
                        this.model.filters.on('change:filter', this.performSearch, this);
                   },
                   performSearch: function(){
                            var data = this.model.paginator.get('data') || {}; 
                            data.search = this.model.filters.get('filter') ? 'name="*' + this.model.filters.get('filter') + '*"' : '';  // If user typed in a search
                            this.model.paginator.set('data', data);  
                            this.model.paginator.trigger('change:data'); 
                   },
                   handleSearch: function(){
                            var data = this.model.paginator.get('data') || {}; 
                            data.search = this.model.filters.get('filter') || '';  // If user typed in a search
                            this.model.paginator.set('data', data);  
                            this.model.paginator.trigger('change:data'); 
                   },
                   render: function() {
                       if (this.collection.deploymentApps.length == 0){
                           var docUrl = route.docHelp(
                               this.options.application.get("root"),
                               this.options.application.get("locale"),
                               'learnmore.deployment.apps'
                           );

                           this.$el.html(_.template(this.errorTemplate, {docUrl: docUrl}));
                       } else {
                           var html = this.compiledTemplate(); 
                           this.$el.html(html); 
                           this.$('#appsFilterContainer').append(this.children.search.render().el); 
                           this.$('#appsGridContainer').append(this.children.applicationsGrid.render().el); 
                           this.$('#apps_paginator').html(this.children.paginator.render().el); 
                           this.$('#apps_deployment_filter').html(this.children.deployed_filter.render().el); 
                           //this.$('#apps_deployment_status_filter').html(this.children.deployed_status_filter.render().el); 
                       }
                       return this; 
                   },

                   errorTemplate: '\
                       <div class="message-single">  \
                           <div class="alert alert-error"> \
                               <i class="icon-alert"></i>\
                               <%- _("No apps found in server repository.  ").t() %>\
                               <a href="<%-docUrl%>" target="_blank" class="external"><%- _("Learn more.").t() %></a>\
                           </div>\
                       </div>\
                   '
		});
              
});


