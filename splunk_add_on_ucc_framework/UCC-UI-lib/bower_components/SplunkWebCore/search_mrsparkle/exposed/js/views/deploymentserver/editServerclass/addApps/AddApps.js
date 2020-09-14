define(
    ['module', 
     'views/Base', 
     'underscore', 
     'backbone', 
     'views/deploymentserver/editServerclass/ServerClassName', 
     'views/deploymentserver/editServerclass/addApps/UnselectedApps', 
     'views/deploymentserver/editServerclass/addApps/SelectedApps', 
     'views/deploymentserver/editServerclass/addApps/SaveButton', 
     'views/deploymentserver/editServerclass/addApps/CancelButton',
     'views/shared/FlashMessages',
     'collections/services/deploymentserver/DeploymentApplications',
     'uri/route', 
     'contrib/text!views/deploymentserver/editServerclass/addApps/AddApps.html',
     './AddApps.pcss',
     '../../shared.pcss'
    ], 
    function(
        module, 
        BaseView, 
        _, 
        Backbone, 
        ServerClassName,
        UnselectedAppsView, 
        SelectedAppsView, 
        SaveButtonView, 
        CancelButtonView,
        FlashMessagesView,
        DeploymentAppsCollection, 
        route, 
        addAppsTemplate,
        css,
        cssShared) { 
 
        return BaseView.extend({
            moduleId: module.id,
            template: addAppsTemplate, 
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                this.children.serverClassName = new ServerClassName({model: this.model.serverClass}); 


                this.collection = {
                    allApps : new DeploymentAppsCollection(), 
                    selectedApps : new DeploymentAppsCollection(), 
                    unselectedApps : new DeploymentAppsCollection()
                };  

                //Dictionary of all apps. The dictionary keys are the app names, the values are booleans, true if the app is selected, false if the app is not selected
                this.model.selectedAppsDict = new Backbone.Model(); 
                this.model.previousSelectedAppsDict = new Backbone.Model(); 

                this.model.serverClass.fetch(); 
                this.model.serverClass.on("change", this.setSelectedApps, this); 
                this.collection.allApps.fetch({data:{count: -1, offset: 0}}); 
                this.collection.allApps.on("reset", this.setSelectedApps, this); 

                this.collection.selectedApps.fetch({data:{count: -1, offset: 0}}); 
                this.collection.unselectedApps.fetch({data:{count: -1, offset: 0}}); 
                
                this.children.unselectedAppsView = new UnselectedAppsView({
                     model: {
                         selectedAppsDict: this.model.selectedAppsDict
                     }, 
                     collection: this.collection
                }); 

                this.children.selectedAppsView = new SelectedAppsView({
                     model: {
                         selectedAppsDict: this.model.selectedAppsDict
                     }, 
                     collection: this.collection
                }); 

                this.children.saveButtonView = new SaveButtonView(); 
                this.children.saveButtonView.on('saveClicked', this.handleSave, this); 
                this.children.cancelButtonView = new CancelButtonView(); 
                this.children.cancelButtonView.on('cancelClicked', this.handleCancel, this);

                this.children.flashMessagesView = new FlashMessagesView({model: this.model,
                    collection: this.collection});
            },
            render: function() {
 
                var docUrl = route.docHelp(
                    this.options.application.get("root"),
                    this.options.application.get("locale"),
                    'manager.deployment.fm.apps'
                );

		var html = this.compiledTemplate({_:_, docUrl: docUrl}); 
                this.$el.html(html); 
                this.$('#serverClassName').append(this.children.serverClassName.render().el); 
                this.$('#unselected-apps').append(this.children.unselectedAppsView.render().el); 
                this.$('#selected-apps').append(this.children.selectedAppsView.render().el); 
                this.$('.button-bar').append(this.children.cancelButtonView.render().el); 
                this.$('.button-bar').append(this.children.saveButtonView.render().el);

                this.$(".flash-messages-placeholder").append(this.children.flashMessagesView.render().el);

                return this; 
            }, 
            handleCancel: function() {
               window.location.href = this.options.return_to ? this.options.return_to : route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'), 'deploymentserveredit', {data: {id: this.model.serverClass.id}});  
            },

            // TODO [JCS] These save operations really should be done in serial, not parallel. Look at EditApp.js for an example
            handleSave: function() {
                var that = this; 
                var numAppsExamined = 0; 
                var numPendingSaves = 0; 
                this.collection.allApps.each(function(app){ 
                        numAppsExamined++;   
                        var isSelected = that.model.selectedAppsDict.get(app.entry.get('name')); 
                        var wasSelected = that.model.previousSelectedAppsDict.get(app.entry.get('name')); 
                        if (isSelected && !wasSelected){
                                //User selected a new app that was previously unselected
                                numPendingSaves++; 
                                app.entry.content.set('serverclass', that.model.serverClass.entry.get("name")); 
                                app.entry.content.set('map', true); 
                                app.save(null, {
					success: function(model, response) {
                                            numPendingSaves--; 
                                            that.redirectOnSaveComplete(numAppsExamined, numPendingSaves);  
					}, 
					error: function(model, response) {
                                            app.entry.content.set('serverclass', null); 
					}
			        });
                        } else if (!isSelected && wasSelected) {
                                // User unselected an app that was previously selected
                                numPendingSaves++; 
                                app.entry.content.set('serverclass', that.model.serverClass.entry.get("name")); 
                                app.entry.content.set('unmap', true); 
				app.save(null, {
					success: function(model, response) {
                                            numPendingSaves--; 
                                            that.redirectOnSaveComplete(numAppsExamined, numPendingSaves);  
					}, 
					error: function(model, response) {
                                            app.entry.content.set('serverclass', null); 
                                            app.entry.content.set('unmap', false); 
					}
			       });
                       } 
                }); 
 
                this.redirectOnSaveComplete(numAppsExamined, numPendingSaves);  
                
            }, 
            redirectOnSaveComplete: function(numAppsExamined, numPendingSaves) {
                if (numPendingSaves == 0 && numAppsExamined == this.collection.allApps.length) 
                    window.location.href = this.options.return_to ? this.options.return_to : route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'), 'deploymentserveredit', {data: {id: this.model.serverClass.id}});  
            }, 
            setSelectedApps: function() {
              var that = this; 
              this.collection.allApps.each(function(app) {
		     var isSelected = false; 
		     var appServerclasses = app.entry.content.get("serverclasses"); 
		     for (var i = 0; i < appServerclasses.length; i++){
			 if (appServerclasses[i] == that.model.serverClass.entry.get("name")){
			     isSelected = true; 
			     break; 
			 }
		     }
		     that.model.selectedAppsDict.set(app.entry.get("name"), isSelected);  
             }); 
             this.model.previousSelectedAppsDict = this.model.selectedAppsDict.clone(); 
          }
        }); 
});


