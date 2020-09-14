/**
 * @author jszeto
 * @date 6/6/13
 *
 * Controller class shared by Data Model Editor and Data Model Manager. It contains logic for editing the title,
 * permissions or acceleration of a Data Model. It also handles deleting or cloning a Data Model.
 *
 * Inputs:
 *
 *     model: {
 *         application {models/Application}
 *         user {models/services/authentication/User}
 *     }
 *
 *     collection: {
 *         apps {collections/services/AppLocals} collection of apps
 *     }
 * }
 *
 * @fires DataModelActionController#action:createdDataModel
 * @fires DataModelActionController#action:deletedDataModel
 * @fires DataModelActionController#action:clonedDataModel
 * @fires DataModelActionController#action:dataModelPermissionsChange
 * @fires DataModelActionController#action:editPermissions
 * @fires DataModelActionController#action:fetchDataModel
 * @fires DataModelActionController#action:updateDataModel
 *
 */

define(
    [
        'jquery',
        'underscore',
        'controllers/Base',
        'views/data_models/CreateDataModelDialog',
        'views/data_models/UploadDataModelDialog',
        'views/data_model_manager/components/AccelerationDialog',
        'views/data_model_manager/components/CloneDialog',
        'views/data_model_manager/components/TitleDescriptionDialog',
        'views/data_model_manager/components/PermissionsDialog',
        'views/shared/dialogs/TextDialog',
        'models/services/datamodel/DataModel',
        'models/ACLReadOnly',
        'models/shared/fetchdata/EAIFetchData',
        'collections/services/authorization/Roles',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
        $,
        _,
        BaseController,
        CreateDataModelDialog,
        UploadDataModelDialog, 
        AccelerationDialog,
        CloneDialog,
        TitleDescriptionDialog,
        PermissionsDialog,
        TextDialog,
        DataModel,
        ACLReadOnlyModel, 
        EAIFetchData,
        RolesCollection,
        splunkDUtils, 
        splunkUtils
        ){
        return BaseController.extend({
            initialize: function(options) {
                BaseController.prototype.initialize.apply(this, arguments);

                // Setup event listeners to the view we are controlling
                this.on("action:createDataModel", this.showCreateDataModelDialog, this);
                this.on("action:uploadDataModel", this.showUploadDataModelDialog, this);
                this.on("action:cloneDataModel", this.openCloneDialogHandler, this);
                this.on("action:deleteDataModel", this.deleteDataModelHandler, this);
                this.on("action:editDataModelTitle", this.editDataModelTitleHandler, this);
                this.on("action:editPermissions", this.openEditPermissionsDialogHandler, this);
                this.on("action:editAcceleration", this.openAccelerateDialogHandler, this);
                this.on("action:rebuildAcceleration", this.rebuildAccelerationHandler, this);
            },

            /////////////////////////////////////////////////////////////
            //  Create New Data Model Functions
            /////////////////////////////////////////////////////////////
            /**
             * Open a dialog to create a new Data Model
             */
            showCreateDataModelDialog: function() {
                this.children.createDataModelDialog = new CreateDataModelDialog({model: {application: this.model.application},
                                                                                 collection: {apps: this.collection.apps}});
                this.children.createDataModelDialog.on("hidden", this.destroyCreateDataModelDialog, this);
                this.children.createDataModelDialog.on("action:createdDataModel", function(dataModel) {
                    /**
                     * Created a new Data Model
                     *
                     * @event DataModelActionController#action:createdDataModel
                     * @param {models/services/datamodel/DataModel} - the new data model
                     */
                    this.trigger("action:createdDataModel", dataModel);
                }, this);
                this.children.createDataModelDialog.show();
            },

            destroyCreateDataModelDialog: function() {
                this.children.createDataModelDialog.remove();
                delete this.children.createDataModelDialog;
            },

            /////////////////////////////////////////////////////////////
            //  Upload New Data Model Functions
            /////////////////////////////////////////////////////////////
            /**
             * Open a dialog to upload a new Data Model
             */
            showUploadDataModelDialog: function() {
                this.children.uploadDataModelDialog = new UploadDataModelDialog({
                    model: {
                        application: this.model.application,
                        user: this.model.user
                    },
                    collection: {
                        apps: this.collection.apps
                    }
                });
                this.children.uploadDataModelDialog.on("hidden", this.destroyUploadDataModelDialog, this);
                this.children.uploadDataModelDialog.on("action:uploadedDataModel", function(dataModel) {
                    /**
                     * Upload a new Data Model
                     *
                     * @event DataModelActionController#action:uploadedDataModel
                     */
                    this.trigger("action:uploadedDataModel", dataModel);
                }, this);
                this.children.uploadDataModelDialog.show();
            },

            destroyUploadDataModelDialog: function() {
                this.children.uploadDataModelDialog.remove();
                delete this.children.uploadDataModelDialog;
            },



            /////////////////////////////////////////////////////////////
            //  Delete Data Model Functions
            /////////////////////////////////////////////////////////////
            /**
             * Open a dialog to delete an existing Data Model
             * @param {models/services/datamodel/DataModel} dataModel
             */
            deleteDataModelHandler: function(dataModel) {
                this.children.deleteDialog = new TextDialog({id: "modal_delete"});
                this.children.deleteDialog.settings.set("primaryButtonLabel",_("Delete").t());
                this.children.deleteDialog.settings.set("cancelButtonLabel",_("Cancel").t());
                this.children.deleteDialog.on('click:primaryButton', function() {
                    this.deleteDialogDeleteHandler(dataModel);}, this);
                this.children.deleteDialog.on("hidden", this.destroyDeleteDialogHandler, this);
                this.children.deleteDialog.settings.set("titleLabel",_("Delete Data Model").t());
                this.children.deleteDialog.setText(splunkUtils.sprintf(
                    _("Are you sure you want to delete %s?").t(),
                      '<em>' + _(dataModel.entry.content.get("displayName")).escape() + '</em>'));
                $("body").append(this.children.deleteDialog.render().el);
                this.children.deleteDialog.show();
            },

            deleteDialogDeleteHandler: function(dataModel) {
                // TODO [JCS] Add error handling from server response?
                var modelName = dataModel.id;
                var resultXHR = dataModel.destroy();

                if (resultXHR) {
                    resultXHR.done(_(function() {
                        this.children.deleteDialog.hide();
                        /**
                         * Data Model has been deleted
                         *
                         * @event DataModelActionController#action:deletedDataModel
                         * @param {string} - the data model name
                         */
                        this.trigger("action:deletedDataModel", modelName);
                    }).bind(this));
                }

            },

            destroyDeleteDialogHandler: function() {
                this.children.deleteDialog.off("hidden", this.destroyDeleteDialogHandler);
                this.children.deleteDialog.remove();
            },

            /////////////////////////////////////////////////////////////
            //  Edit Data Model Title Functions
            /////////////////////////////////////////////////////////////
            /**
             * Open a dialog to edit the title and description of a Data Model
             *
             * @param {string} modelName
             */
            editDataModelTitleHandler: function(modelName) {
                this.fetchEditableDataModel(modelName).then(_.bind(function() {
                    this.children.editTitleDescDialog = new TitleDescriptionDialog({model:this.dataModelToEdit});
                    this.children.editTitleDescDialog.on("hidden", function(){
                        delete this.children.editTitleDescDialog;
                        delete this.dataModelToEdit;
                    }, this);
                    this.children.editTitleDescDialog.on("action:saveModel", this.saveDataModelHandler, this);
                    $("body").append(this.children.editTitleDescDialog.render().el);
                    this.children.editTitleDescDialog.show();
                }, this));
            },

            /////////////////////////////////////////////////////////////
            //  Clone Data Model Functions
            /////////////////////////////////////////////////////////////
            /**
             * Open a dialog to clone an existing Data Model
             * @param {string} modelName
             */
            openCloneDialogHandler: function(modelName) {
                this.fetchEditableDataModel(modelName).then(_.bind(function() {
                    // instantiate a cloneDialog, and pass the source
                    this.children.cloneDialog = new CloneDialog({model:{
                                                                    source:this.dataModelToEdit,
                                                                    application: this.model.application
                                                                 },
                                                                 collection: {apps: this.collection.apps}});

                    // upon hidden, delete everything
                    this.children.cloneDialog.on("hidden", function(){
                        delete this.cloneDialog;
                        delete this.dataModelToEdit;
                    }, this);

                    this.children.cloneDialog.on("action:clonedDataModel", function(clonedDataModel) {
                        /**
                         * Data Model has been cloned
                         *
                         * @event DataModelActionController#action:clonedDataModel
                         * @param {string} - the cloned data model name
                         */
                        this.trigger("action:clonedDataModel", clonedDataModel);
                    }, this);
                    // render clonedialog
                    $("body").append(this.children.cloneDialog.render().el);
                    this.children.cloneDialog.show();
                }, this));
            },

            /////////////////////////////////////////////////////////////
            //  Edit Permission Functions
            /////////////////////////////////////////////////////////////
            /**
             * Open a dialog to edit the permissions of a Data Model
             * @param {string} modelName
             */
            openEditPermissionsDialogHandler: function(modelName) {
                var fetchData = new EAIFetchData({count:0});
                var rolesCollection = new RolesCollection(undefined, {fetchData:fetchData});

                $.when(this.fetchEditableDataModel(modelName), rolesCollection.fetch()).then(function(){
                    // TODO [JCS] Why is this necessary?
                    this.dataModelToEdit['application'] = this.model.application;
                    this.dataModelToEdit.on("updateCollection", this.dataModelPermissionsChange, this);

                    this.children.permissionsDialog = new PermissionsDialog({
                        model: {document: this.dataModelToEdit, nameModel: this.dataModelToEdit.entry.content, user: this.model.user},
                        collection: rolesCollection,
                        onHiddenRemove: true,
                        nameKey: "displayName",
                        nameLabel: _("Data Model").t()
                    });

                    $("body").append(this.children.permissionsDialog.render().el);
                    this.children.permissionsDialog.show();
                }.bind(this));

            },

            dataModelPermissionsChange: function() {
                this.dataModelToEdit.off("updateCollection", this.dataModelPermissionsChange);
                /**
                 * Data Model permissions have changed
                 *
                 * @event DataModelActionController#action:dataModelPermissionsChange
                 * @param {string} - the data model name
                 */

                var inmem = new ACLReadOnlyModel($.extend(true, {}, this.dataModelToEdit.entry.acl.toJSON()));
                if (inmem.get("sharing") === splunkDUtils.USER ) {
                    // If we are changing permissions to private, then turn acceleration off
                    // Note: Right now, we fail silently if the acceleration changes fail to save, because by the time  
                    // we get here, the permissions dialog has already closed.  Ideally we should display an error message to the user
                    this.dataModelToEdit.entry.content.acceleration.set("enabled", 0); 
                    this.saveDataModelHandler(); 
                }
                this.trigger("action:dataModelPermissionsChange", this.dataModelToEdit.get("id"), this.dataModelToEdit);
            },

            /////////////////////////////////////////////////////////////
            //  Edit Acceleration Functions
            /////////////////////////////////////////////////////////////
            /**
             * Open a dialog to edit acceleration settings of a Data Model
             * @param {string} modelName
             */
            openAccelerateDialogHandler: function(modelName) {
                this.fetchEditableDataModel(modelName).then(_.bind(function() {

                    if (this.dataModelToEdit.isPrivate()) {
                        // If we can't accelerate a Data Model, display a warning dialog
                        this.children.warnPrivateDialog = new TextDialog({id: "modal_private"});
                        this.children.warnPrivateDialog.settings.set("primaryButtonLabel",_("Edit Permissions").t());
                        this.children.warnPrivateDialog.settings.set("cancelButtonLabel",_("Cancel").t());
                        this.children.warnPrivateDialog.on('click:primaryButton', function() {
                            this.warnPrivateSubmitHandler(modelName);}, this);
                        this.children.warnPrivateDialog.on("hidden", this.destroyWarnPrivateDialogHandler, this);
                        this.children.warnPrivateDialog.settings.set("titleLabel",_("Add Acceleration").t());
                        this.children.warnPrivateDialog.setText(
                            _("Private models cannot be accelerated. Edit the permissions before enabling acceleration.").t());
                        $("body").append(this.children.warnPrivateDialog.render().el);
                        this.children.warnPrivateDialog.show();
                    } else if (!this.dataModelToEdit.canAccelerate()) {
                        this.children.warnAccelerationDialog = new TextDialog({id: "modal_warn"});
                        this.children.warnAccelerationDialog.settings.set("primaryButtonLabel",undefined);
                        this.children.warnAccelerationDialog.settings.set("cancelButtonLabel",undefined);
                        this.children.warnAccelerationDialog.on("hidden", this.destroyWarnAccelerationDialogHandler, this);
                        this.children.warnAccelerationDialog.settings.set("titleLabel",_("Acceleration Warning").t());
                        this.children.warnAccelerationDialog.setText(
                            _("You can only accelerate data models that include at least one event-based dataset or " +
                                "one search-based dataset that does not include reporting commands.").t());
                        $("body").append(this.children.warnAccelerationDialog.render().el);
                        this.children.warnAccelerationDialog.show();
                    } else { // Show acceleration dialog
                        this.children.accelerationDialog = new AccelerationDialog({
                            model: {
                                dataModel: this.dataModelToEdit,
                                application: this.model.application
                            },
                            collection: {
                                vix: this.collection.vix,
                                archives: this.collection.archives
                            }
                        });
                        this.children.accelerationDialog.on("hidden", this.destroyAccelerationDialogHandler, this);
                        this.children.accelerationDialog.on("action:saveModel", this.saveDataModelHandler, this);
                        this.children.accelerationDialog.show();
                    }
                }, this));
            },

            destroyAccelerationDialogHandler: function(modelName) {
                this.children.accelerationDialog.remove();
                delete this.children.accelerationDialog;
            },

            warnPrivateSubmitHandler: function(modelName) {
                this.children.warnPrivateDialog.hide();
                /**
                 * Edit the permissions of a Data Model
                 *
                 * @event DataModelActionController#action:editPermissions
                 * @param {string} - the data model name
                 */
                this.trigger("action:editPermissions", modelName);
            },

            destroyWarnPrivateDialogHandler: function() {
                this.children.warnPrivateDialog.remove();
                delete this.children.warnPrivateDialog;
            },

            destroyWarnAccelerationDialogHandler: function() {
                this.children.warnAccelerationDialog.remove();
                delete this.children.warnAccelerationDialog;
            },

            // TODO [JCS] Remove. Not triggered anywhere
            /**
             * Rebuild the acceleration index
             * @param modelName
             */
            rebuildAccelerationHandler: function(modelName) {
                var accelerationWindow = "";

                this.fetchEditableDataModel(modelName).then(_.bind(function() {
                    this.dataModelToEdit.entry.content.set("accelerateModel", false);
                    accelerationWindow = this.dataModelToEdit.entry.content.get("accelerationWindow");

                    this.dataModelToEdit.save().done(_.bind(function() {
                        var savedAttrs = {accelerationWindow: accelerationWindow,
                            accelerateModel: true};
                        this.dataModelToEdit.entry.content.set(savedAttrs);
                        this.dataModelToEdit.save();
                    }, this));
                }, this));
            },

            /////////////////////////////////////////////////////////////
            //  Model Helper Functions
            /////////////////////////////////////////////////////////////

            /**
             * Call this when you need to edit a given Data Model. This creates a new DataModel referenced at
             * this.dataModelToEdit. It then attempts to fetch the Data Model
             *
             * @param {string} modelName - Name of the data model to get
             * @return {xhr} Returns the XHR object from the fetch operation.
             */
            fetchEditableDataModel: function(modelName) {
                this.dataModelToEdit = new DataModel({id: modelName});

                return this.dataModelToEdit.fetch({data: {app:this.model.application.get("app"),
                    owner: this.model.application.get("owner")}});
            },

            fetchConciseDataModel: function(modelName) {
                /**
                 * Request a fetch of the concise version of a data Model
                 *
                 * @event DataModelActionController#action:fetchDataModel
                 * @param {string} - the data model name
                 */
                this.trigger("action:fetchDataModel",modelName);
            },

            updateDataModel: function(modelName, accelerationChanges, contentChanges) {
                /**
                 * Update the Data Model in memory with the given changes
                 *
                 * @event DataModelActionController#action:updateDataModel
                 * @param {string} - the data model name
                 * @param {object} - attributes to set on the Data Model's associated acceleration model
                 * @param {object} - attributes to set on the Data Model's associated content model
                 */
                this.trigger("action:updateDataModel", modelName, accelerationChanges, contentChanges);
            },

            /**
             * Save changes to the currently edited model and update the concise version
             */
            saveDataModelHandler: function() {
                // TODO [JCS] Will need to add in validation and server request checks.
                if (this.dataModelToEdit) {
                    var id = this.dataModelToEdit.get("id");

                    // Trigger an update so the model reflects the changes immediately.
                    this.updateDataModel(id, {enabled: this.dataModelToEdit.entry.content.acceleration.get("enabled")},
                                             {displayName: this.dataModelToEdit.entry.content.get("displayName"),
                                              description: this.dataModelToEdit.entry.content.get("description")});
                    this.dataModelToEdit.save().done(_.bind(function() {
                        this.fetchConciseDataModel(id);
                        delete this.dataModelToEdit;
                    }, this));
                }
            }
        });
    }
);

