define( ['module', 
         'views/Base', 
         'backbone', 
         'underscore', 
         'views/deploymentserver/Search', 
         'views/deploymentserver/ServerClassesGrid', 
         'views/deploymentserver/CreateNewServerClassButton', 
         'splunk.util',
         'views/deploymentserver/shared/DSPaginator', 
         'views/shared/controls/SyntheticSelectControl',
         'views/shared/dialogs/TextInputDialog',
         'models/services/deploymentserver/DeploymentServerClass', 
         'uri/route',
         'contrib/text!views/deploymentserver/ServerClasses.html'
        ], 
	function(
            module, 
            BaseView, 
            Backbone, 
            _, 
            Search, 
            ServerClassGrid,
            NewServerClassBtn,
            splunk_util, 
            Paginator, 
            SyntheticSelectControl,
            TextInputDialog, 
            DeploymentServerClassModel, 
            route, 
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

                // Filter by deployed percentage
                this.children.deployed_filter = new SyntheticSelectControl({
                    menuWidth: "medium",
                    className: "btn-group pull-left",
                     items: [
                         {'value': 'Complete', 'label': _('Deployed Successfully').t()}, 
                         {'value': 'Incomplete', 'label': _('Deployed Partially').t()}, 
                         {'value': 'All', 'label': _('All Server Classes').t()}
                     ], 
                     model: this.model.filters, 
                     toggleClassName: 'btn-pill', 
                     modelAttribute: 'deploy_filter'
                });
                this.model.filters.set('deploy_filter', 'All'); 

                // Paginator for serverclass table 
                this.children.paginator = new Paginator(
                    {
                        model: this.model.paginator, 
                        collection: this.collection.serverClasses
                    }
                );

                // Serverclass table
                this.children.serverclassGrid = new ServerClassGrid({
                    model: {
                        search: this.model.filters, 
                        paginator: this.model.paginator
                    }, 
                    collection: this.collection, 
                    isReadOnly: this.options.isReadOnly, 
                    application: this.options.application
                });                  

                // New Server Class button
                this.children.newServerClassBtn = new NewServerClassBtn({isReadOnly: this.options.isReadOnly, application: this.options.application}); 
            
                // Stitching the search bar with the paginator
                this.model.filters.on('change:filter', function(){
                    var data = this.model.paginator.get('data') || {}; 
                    data.search = this.model.filters.get('filter') ? 'name="*' + this.model.filters.get('filter') + '*"' : '';  // If user typed in a search
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


 
},
            handleCreateServerclass: function(serverclassName) {
                var serverclass = new DeploymentServerClassModel({name: serverclassName}); 
                serverclass.save(null, {
                    success: this.createServerclassSuccessHandler, 
                    error: this.createServerclassErrorHandler
                });  
            },
            createServerclassErrorHandler: function(model, response) {
                alert("Error creating server class"); 
            }, 
            createServerclassSuccessHandler: function(model, response) {
                //this.trigger("serverClassCreatedSuccess"); 
                //this.collection.serverClasses.trigger("createdSeverClass", newValue); 
            },

            showCreateServerclassDialog: function()  {
                    this.serverClassModel = new DeploymentServerClassModel();
                    this.children.createServerClassDialog = new TextInputDialog({id: "modal_rename",
                        parent: this,
                        model: this.serverClassModel.entry.content,
                        modelAttribute: "name",
                        label: _("Name").t()});
                    this.children.createServerClassDialog.settings.set("titleLabel",_("New Server Class").t());
                    this.children.createServerClassDialog.show();
                    var that = this; 
                    this.children.createServerClassDialog.on('click:primaryButton', function() {
                        this.serverClassModel.save(null, {
                            data: {app:'system'}, 
                            success: function(model, response) {
                                //pluck the value you need
                                //redirect the user
                                window.location.href = route.manager(that.options.application.get('root'), that.options.application.get('locale'), that.options.application.get('app'),  'deploymentserveredit', {data: {id: model.id}});
                            },
                            error: function(model, response) {
                                alert(response.responseText); 
                            }
                        });
                    }, this);

 
            }, 
            events: {
                'click #create_sc': function(e) {
                    if (this.options.isReadOnly) {
                        //Read-only mode: disable click logic
                        return; 
                    }
                    this.showCreateServerclassDialog();  
                    return false;
                }

            }, 
            render: function() {
                if (this.collection.serverClasses.length == 0){
                    var docUrl = route.docHelp(
                        this.options.application.get("root"),
                        this.options.application.get("locale"),
                        'learnmore.deployment.overview'
                    );
                    this.$el.html(_.template(this.errorTemplate, {docUrl: docUrl}));
                } else {
                    var html = this.compiledTemplate(); 
                    this.$el.html(html); 
                    this.$('#serverclassFilterContainer').append(this.children.search.render().el); 
                    this.$('.createNewServerClass').append(this.children.newServerClassBtn.render().el); 
                    this.$('#serverclassGridContainer').append(this.children.serverclassGrid.render().el); 
                    this.$('#serverclasses_paginator').html(this.children.paginator.render().el); 
                    this.$('#serverclasses_deployment_filter').html(this.children.deployed_filter.render().el); 
                }
                return this; 
            },

            errorTemplate: '\
                   <div class="message-single">  \
                       <div class="alert alert-error"> \
                           <i class="icon-alert"></i>\
                           <%- _("No server classes.  ").t() %>\
                           <a href="<%-docUrl%>" target="_blank" class="external"><%- _("Learn more.").t() %></a>\
                           or <a id="create_sc"> <%- _("create one").t() %></a>\
                       </div>\
                   </div>\
            '
        });
});

