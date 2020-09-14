define(
    ['module', 
     'views/Base', 
     'backbone', 
     'underscore', 
     'uri/route',
     'views/deploymentserver/editApp/ServerClassList', 
     'views/deploymentserver/editApp/DeployButton',
     'views/deploymentserver/editServerclass/addApps/CancelButton',
     'views/deploymentserver/editApp/AppName',
     'views/deploymentserver/editApp/ClientsGridContainer',
     'views/shared/FlashMessages',
     'views/shared/controls/ControlGroup',
     'views/shared/controls/SyntheticCheckboxControl',
     'util/splunkd_utils', 
     'contrib/text!views/deploymentserver/editApp/EditApp.html',
     './EditApp.pcss',
     '../shared.pcss'
    ], 
    function(
        module, 
        BaseView, 
        Backbone, 
        _, 
        route, 
        ServerClassList,
        SaveButton, 
        CancelButton, 
        AppName,
        ClientsGridContainer,
        FlashMessagesView,
        ControlGroup,
        SyntheticCheckboxControl,
        splunkDUtils, 
        editAppTemplate,
        css,
        cssShared) { 
 
        return BaseView.extend({
            moduleId: module.id,
            template: editAppTemplate, 
            MISSING_SERVERCLASSES_ID: "MISSING_SERVERCLASSES_ID",
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.appName = new AppName({model: this.model.app}); 
                this.children.serverclassesList = new ServerClassList({
                    model: {
                        'app': this.model.app
                    }, 
                    collection: { 
                        allServerclasses: this.collection.serverClasses, 
                        selectedServerclasses: this.collection.selectedServerClasses
                    }, 
                    application: this.options.application
                }); 

                var that = this; 
                this.model.app.fetch({
                    'success': function(model, response){
                        that.extractSelectedServerclasses();
                        that.renderServerclassesList(); 
                     }
                });

                this.checkboxEnable = new SyntheticCheckboxControl({label:_("Enable App").t()});

                this.children.checkboxEnableGroup = new ControlGroup({
                    controls : [this.checkboxEnable]
                });

                this.model.app.entry.content.on("change:stateOnClient", function(value) {
                    this.checkboxEnable.setValue(value.get("stateOnClient") == "enabled");
                }, this);

                this.children.checkboxRestartGroup = new ControlGroup({
                    controlType : "SyntheticCheckbox",
                    controlOptions : {model : this.model.app.entry.content,
                                      modelAttribute: "restartSplunkd",
                                      label: _("Restart Splunkd").t()}
                });

                this.children.saveButton = new SaveButton(); 
                this.children.saveButton.on("deployClicked", this.handleDeployClicked, this); 
                this.children.cancelButton = new CancelButton(); 
                this.children.cancelButton.on("cancelClicked", this.redirectToDeploymentServer, this);
                this.children.clientsGridContainer = new ClientsGridContainer({
                    model: this.model, 
                    collection: {
                        selectedServerClasses: this.collection.selectedServerClasses, 
                        allSelectedClients: this.collection.selectedClients,
                        filteredClients: this.collection.filteredClients
                    }, 
                    application: this.options.application
                });

                this.children.flashMessagesView = new FlashMessagesView({model: this.model,
                    collection: this.collection});
            },
            extractSelectedServerclasses: function() {
                var serverclasses = this.model.app.entry.content.get('serverclasses');
                for (var i = 0; i < serverclasses.length; i++){
                    var sc = serverclasses[i]; 
                    var scModel = new Backbone.Model();
                    scModel.set('name', sc); 
                    this.collection.selectedServerClasses.add(scModel); 
                }
                this.collection.previousSelectedServerClasses = this.collection.selectedServerClasses.clone(); 

            },
            renderServerclassesList: function() {
                this.$("#serverclass-list-container").html(this.children.serverclassesList.render().el);
            }, 
            render: function() {

                var docUrl = route.docHelp(
                    this.options.application.get("root"),
                    this.options.application.get("locale"),
                    'manager.deployment.fm.app'
                );

                var html = this.compiledTemplate({docUrl: docUrl, _:_, app: this.model.app}); 
                this.$el.html(html); 
                this.$('.appName').append(this.children.appName.render().el);
                this.$('.checkbox-enable-placeholder').append(this.children.checkboxEnableGroup.render().el);
                this.$('.checkbox-restart-placeholder').append(this.children.checkboxRestartGroup.render().el);
                //this.$("#serverclass-list-container").html(this.children.serverclassesList.render().el);
                this.$('#page-actions').append(this.children.cancelButton.render().el); 
                this.$('#page-actions').append(this.children.saveButton.render().el); 
                this.$('#selected-clients').append(this.children.clientsGridContainer.render().el);

                this.$(".flash-messages-placeholder").append(this.children.flashMessagesView.render().el);
                return this; 
            }, 
            handleDeployClicked: function() {

                var stateOnClient = this.checkboxEnable.getValue() ? 'enabled' : 'disabled';
                this.model.app.entry.content.set('stateOnClient', stateOnClient);

                //Iterate over all items in serverclasses
                //    if (sc is in selectedApps)
                //         save app+serverclass combination
                //    else if (sc is in previousSelectedApps AND sc is NOT in selectedApps)
                //         remove app+serverclass combination

                this.serverClassChanges = [];


                 
                
                this.collection.serverClasses.each(function(sc) {
                    // Is app selected?
                    var isSelected = !_.isUndefined(this.collection.selectedServerClasses.find(function(selectedSC){
                        return selectedSC.get('name') == sc.entry.get('name'); 
                    }, this));

                    // Was app previously selected?
                    var wasSelected = !_.isUndefined(this.collection.previousSelectedServerClasses.find(function(previousSelectedSC){
                        return previousSelectedSC.get('name') == sc.entry.get('name'); 
                    }, this));

                    // We need to apply the Enable App and Restart splunkd values to each server class, even if the list
                    // hasn't changed.
                    if (isSelected) {
                        this.serverClassChanges.push({serverClass: sc, add: true});
                    } else if (!isSelected && wasSelected) {
                        this.serverClassChanges.push({serverClass: sc, add: false});
                    }
                }, this);


                if (this.collection.selectedServerClasses.length == 0) {
                    this.children.flashMessagesView.flashMsgHelper.addGeneralMessage(this.MISSING_SERVERCLASSES_ID,
                                                               {type: splunkDUtils.ERROR,
                                                                html: _("Add at least one server class.").t()});
                    return; 
                } else {
                    this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(this.MISSING_SERVERCLASSES_ID);
                    this.processServerClassChanges();
                }
            },

            processServerClassChanges: function() {
                this.clearAppModel();
                if (this.serverClassChanges.length > 0) {
                    this.saveServerClassChanges();
                } else {
                    // We don't have any additional serverclass changes, redirect to deployment server page 
                    this.redirectToDeploymentServer();
                }
            },
            clearAppModel: function() {
                this.model.app.entry.content.unset("serverclass");
                this.model.app.entry.content.unset("map");
                this.model.app.entry.content.unset("unmap");
            },

            // Iterative function that saves the serverClass changes from the serverClassChanges array serially.
            // It pops a serverClass off this array, and saves it. If no error occurred, we call this function again.
            // Otherwise, if we have an error, we stop.
            saveServerClassChanges: function() {
                if (this.serverClassChanges.length > 0) {
                    var serverClassObj = this.serverClassChanges.pop();
                    
                    this.model.app.entry.content.set("serverclass", serverClassObj.serverClass.entry.get("name"));

                    if (serverClassObj.add)
                        this.model.app.entry.content.set("map", true);
                    else
                        this.model.app.entry.content.set("unmap", true);

                    var resultXHR = this.model.app.save({});
                    if (resultXHR) {
                        resultXHR.done(_(function() {
                            this.processServerClassChanges();
                        }).bind(this));
                        resultXHR.fail(_(function() {
                            // Stop iterating over the changes. Error message should appear in flash messages. Clear the array
                            this.serverClassChanges = [];
                            this.clearAppModel();
                        }).bind(this));
                    } else {
                        this.processServerClassChanges();
                    }
                }
            },

            redirectToDeploymentServer: function() {
                window.location.href = route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'),  'deploymentserver',  {data: {t: 0}});
            }
        });
});


