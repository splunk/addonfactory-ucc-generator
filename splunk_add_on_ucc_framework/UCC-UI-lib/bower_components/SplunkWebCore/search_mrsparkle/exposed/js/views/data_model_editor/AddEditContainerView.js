/**
 * @author jszeto
 * @date 11/9/12
 *
 * Main view for the Add/Edit views. It holds the header, the Save/Preview/Cancel buttons and the Preview view.
 * It creates a subview that shows the controls for adding or editing a particular Object or Attribute.
 * Each of these subviews subclasses views/data_model_editor/form_views/DataModelAddEditForm.js.
 *
 * Child Views
 *
 *  deleteDialog - Shared dialog that deletes the object, an attribute or a calculation
 *
 * Inputs:
 *
 * model: {
 *          application {models/Application}
 *          serverInfo {models/services/server/ServerInfo}
 *          appLocal {models/services/AppLocal}
 *          dataModel {models/services/datamodel/DataModel} the data model currently being edited
 *          setting <Model> {
 *              Required:
 *              operation {String} - Whether to add or edit. Possible values = [add|edit]
 *              type {String} - The type of Object or Attribute to add or edit [object|child|transaction|Lookup|Rex|Eval|GeoIP]
 *              dataModel {DataModel} - clone of the DataModel being edited
 *
 *              Optional:
 *              objectName {String} - The name of the object to edit
 *              parentObjectName {String} - The name of the parent Object to either a child Object or a calculation (Lookup|Rex|Eval|GeoIP)
 *              calculationID {String} - The id of the calculation to edit. Only used for calculations
 *              lookupModel {TransformsLookups} - Model that contains the possible lookups. Used when type = lookup
 *         }
 *     }
 *     collection: {
 *         transformsLookups {collections/services/data/TransformsLookups} - Collection of lookups to use
 *              when add/edit a Lookup calculation
 *     }
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'views/Base',
    'views/data_model_editor/form_views/AddEditObjectView',
    'views/data_model_editor/form_views/AddEditTransactionView',
    'views/data_model_editor/form_views/AddEditSearchObjectView',
    'views/data_model_editor/form_views/AddEditEvalView',
    'views/data_model_editor/form_views/AddEditFieldView',
    'views/data_model_editor/form_views/AddEditLookupView',
    'views/data_model_editor/form_views/AddEditGeoIPView',
    'views/data_model_editor/form_views/OverrideFieldView',
    'views/data_model_editor/form_views/AddEditRexView',
    'views/data_model_editor/form_components/preview/DataModelPreviewView',
    'views/data_model_editor/form_components/preview/DataModelPreviewViewStack',
    'views/shared/dataenrichment/preview/PreviewJobController',
    'views/shared/dialogs/TextDialog',
    'views/shared/FlashMessages',
    'models/Base',
    'models/search/Job',
    'uri/route',
    'module',
    'splunk.util',
    './AddEditContainerView.pcss'
],
    function(
        $,
        _,
        Backbone,
        BaseView,
        AddEditObjectView,
        AddEditTransactionView,
        AddEditSearchObjectView,
        AddEditEvalView,
        AddEditFieldView,
        AddEditLookupView,
        AddEditGeoIPView,
        OverrideFieldView,
        AddEditRexView,
        PreviewView,
        PreviewViewStack,
        PreviewJobController,
        TextDialog,
        FlashMessagesView,
        BaseModel,
        Job,
        route,
        module,
        splunkUtils,
        css
        )
    {
        return BaseView.extend({
            className: "view-add-edit-container",
            moduleId: module.id,
            // Title to display at the top of the View
            ADHOC_SEARCH_LEVEL: "verbose",
            headerTitle:"",
            isCalculation: false,
            showPreview: true,

            /**
             * Show a delete dialog given a type and the name of that type
             *
             * @param {string} type - [object|attribute|calculation]
             * @param {string} id - name of the object, attribute or calculation
             * @param {Model} model - model of the object, attribute or calculation
             */
            showDeleteDialog: function() {

                var name;
                var id;
                var model;
                var type;

                // Normalize the type
                var settingType = this.model.setting.get("type");
                if (settingType == "field") {
                    type = settingType;
                } else if (this.isCalculation) {
                    type = "calculation";
                } else {
                    type = "object";
                }

                var objectName = type == "object" ? this.model.setting.get("objectName") : this.model.setting.get("parentObjectName");

                var objectModel = this.model.dataModel.objectByName(objectName);

                if (type == "calculation") {
                    id = name = this.model.setting.get("calculationID");
                    model = objectModel.getCalculation(name);
                } else if (type == "field") {
                    id =  this.model.setting.get("fieldName");
                    model = objectModel.getField(id);
                    name = model.get("displayName");
                } else if (type == "object") {
                    model = objectModel;
                    name = objectModel.get("displayName");
                    id = objectName;
                }

                var attrCount = 1;

                var text;
                var typeToDisplay = type == "object" ? "object" : "attribute";
                var title = type == "object" ? _("Delete Dataset").t() : _("Delete Field").t();

                if (type == "calculation") {
                    attrCount = model.get("calculationType") == "GeoIP" ?
                        model.getVisibleOutputFieldsLength() :
                        model.outputFields.length;

                    if (attrCount == 1) {
                        // Get the displayName of the only outputField
                        name = model.outputFields.at(0).get("displayName");
                    }
                }

                if (attrCount > 1) {
                    text = splunkUtils.sprintf(_("Are you sure you want to delete this %s and its %s fields").t(),
                        model.get("calculationType"), attrCount);
                } else if (typeToDisplay == "object") {
                    text = splunkUtils.sprintf(_("Are you sure you want to delete the %s <em>%s</em> and all of its descendants").t(),
                        typeToDisplay, _(name).escape());
                } else {
                    text = splunkUtils.sprintf(_("Are you sure you want to delete the %s <em>%s</em>").t(),
                        typeToDisplay, _(name).escape());
                }

                text += "?";

                // Store state for the delete dialog
                this._deleteDialogType = type;
                this._deleteDialogID = id;

                this.children.deleteDialog = new TextDialog({id: "modal_delete"});
                this.children.deleteDialog.settings.set("primaryButtonLabel",_("Delete").t());
                this.children.deleteDialog.settings.set("cancelButtonLabel",_("Cancel").t());
                this.listenTo(this.children.deleteDialog, 'click:primaryButton', this.deleteDialogDeleteHandler);

                this.listenTo(this.children.deleteDialog, "hidden", function(){
                    this.clearDeleteDialogState();
                });

                this.children.deleteDialog.settings.set("titleLabel",_(title).escape());
                this.children.deleteDialog.setText(text);
                $("body").append(this.children.deleteDialog.render().el);
                this.children.deleteDialog.show();
            },
            /**
             * Handles when the user presses the Delete button in the delete dialog. Updates the model based on the
             * type of delete operation (object, attribute, of calculation).
             *
             * @param dialog
             */
            deleteDialogDeleteHandler: function(dialog) {
                var type = this._deleteDialogType;
                var name = this._deleteDialogID;

                var objectName = type == "object" ? this.model.setting.get("objectName") : this.model.setting.get("parentObjectName");
                var objectModel = this.model.dataModel.objectByName(objectName);

                if (type == "object") {
                    this.model.dataModel.removeObjectAndChildren(objectModel);
                } else if (type == "field") {
                    objectModel.removeField({ fieldName: name });
                } else if (type == "calculation") {
                    objectModel.removeCalculation(name);
                }

                if (this.model.dataModel.save()) {
                    this.listenTo(this.children.deleteDialog, "hidden", function() {
                        this.formView_saveHandler(objectName);
                    });
                }
            },

            clearDeleteDialogState: function() {
                this._deleteDialogID = "";
                this._deleteDialogType = "";

                delete this.children.deleteDialog;
            },

            /**
             *  Passing along the action:save event from the form view to the application controller
             */
            formView_saveHandler: function(objectName) {
                /**
                 * Save the Data Model
                 *
                 * @event ObjectEditor#action:saveModel
                 * @param {string} Name of the object to save
                 */
                this.trigger('action:save', objectName);
            },

            /**
             * Called when user presses the Preview button. Posts the changes to the backend with the provisional flag.
             * Then retrieves the search string and kicks off a search job
             *
             * @param {string} objectName
             * @param {array} calculationFieldNames - array of strings of the fields to preview
             * @param {models/services/datamodel/private/Calculation} calculationModel
             * @param {models/services/datamodel/private/Field} fieldModel
             */
            formView_previewHandler: function(objectName, calculationFieldNames, calculation, field) {
                //return this.children.previewView.preview(objectName, calculationFieldNames, additionalSubSearches);
                this.children.previewView.setModels(this.model.dataModel.objectByName(objectName), calculation, field);

                return this.children.formView.fetchPreviewSearchString(objectName, calculationFieldNames)
                    .then(_(function(searchString) {
                        this.children.previewJobController.preview(searchString, {data:{provenance:"UI:DataModel"}});
                    }).bind(this));
            },

            /**
             * Used to preview Search Objects
             *
             * @param {string} searchString - the search string to use for the preview
             */
            formView_startSearchByStringHandler: function(searchString) {
                return this.children.previewJobController.preview(searchString, {data:{provenance:"UI:DataModel"}});
            },

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                var type = this.model.setting.get("type");
                var operation = this.model.setting.get("operation");
                var buttonSettingsAttrs;
                // Initialize the sub view based on the settings
                var calculationID = this.model.setting.get("calculationID");
                var fieldName = this.model.setting.get("fieldName");
                var objectName = this.model.setting.get("objectName");
                var parentObjectName = this.model.setting.get("parentObjectName");
                // Setup the Flash Messages
                this.children.flashMessagesView = new FlashMessagesView({model:[this.model.dataModel]});

                if (type == "event" || type == "child" || type == "transaction" || type == "search") {
                    buttonSettingsAttrs = {save: "show", cancel: "show", preview: "show", "delete": "hide"};
                }
                else {
                    buttonSettingsAttrs = {save: "show", cancel: "show", preview: "show", "delete": "show"};
                }
                if(operation === "add" || operation === "override") {
                    buttonSettingsAttrs["delete"] = "hide";
                }

                // Keeps track of which buttons are visible
                this.model.buttonSettings = new BaseModel(buttonSettingsAttrs);

                this.model.state = new BaseModel({sampleSize: {head: 1000}});
                // TODO [sff] This is bad encapsulation, find a way for the preview view to handle this internally.
                this.listenTo(this.model.state, "change:sampleSize", function() {
                    this.children.formView.preview();
                });

                this.model.searchJob = new Job({}, { delay: 1000, processKeepAlive: true });

                var subViewOptions = {
                    model:{dataModel:this.model.dataModel,
                        appLocal: this.model.appLocal,
                        application: this.model.application,
                        buttonSettings: this.model.buttonSettings,
                        serverInfo: this.model.serverInfo,
                        user: this.model.user},
                    objectName:objectName,
                    operation:operation,
                    flashMessagesHelper: this.children.flashMessagesView.flashMsgHelper
                };

                // Create the Subview based on the type and operation.
                if (type == "event")
                {
                    if (operation == "add")
                        this.headerTitle = _("Add Event Dataset").t();
                    else
                        this.headerTitle = _("Edit Constraints").t();
                    subViewOptions.type = type;
                    this.children.formView = new AddEditObjectView(subViewOptions);
                }
                else if (type == "child")
                {
                    if (operation == "add")
                        this.headerTitle = _("Add Child Dataset").t();
                    else
                        this.headerTitle = _("Edit Constraints").t();
                    subViewOptions.type = type;
                    subViewOptions.parentObjectName = parentObjectName;
                    this.children.formView = new AddEditObjectView(subViewOptions);
                }
                else if (type == "transaction")
                {
                    if (operation == "add")
                        this.headerTitle = _("Add Transaction Dataset").t();
                    else
                        this.headerTitle = _("Edit Transaction").t();

                    subViewOptions.type = type;
                    subViewOptions.parentObjectName = parentObjectName;
                    this.children.formView = new AddEditTransactionView(subViewOptions);
                }
                else if (type == "search")
                {
                    if (operation == "add")
                        this.headerTitle = _("Add Base Search").t();
                    else
                        this.headerTitle = _("Edit Base Search").t();

                    // Don't show the preview button
                    subViewOptions.model.buttonSettings.set({"preview":"hide"});
                    subViewOptions.type = type;
                    subViewOptions.parentObjectName = parentObjectName;
                    subViewOptions.collection = {};
                    subViewOptions.collection.searchBNFs = this.collection.searchBNFs;
                    this.children.formView = new AddEditSearchObjectView(subViewOptions);
                }
                else if (type == "Eval")
                {
                    if (operation == "add")
                        this.headerTitle = _("Add Fields with an Eval Expression").t();
                    else
                        this.headerTitle = _("Edit Fields with an Eval Expression").t();

                    this.isCalculation = true;
                    subViewOptions.calculationID = calculationID;
                    subViewOptions.parentObjectName = parentObjectName;
                    this.children.formView = new AddEditEvalView(subViewOptions);
                }
                else if (type == "Lookup")
                {
                    // Create the Lookup
                    //this.model.transformsLookups.fetch().then(function() {
                    if (operation == "add")
                        this.headerTitle = _("Add Fields with a Lookup").t();
                    else
                        this.headerTitle = _("Edit Fields with a Lookup").t();

                    this.isCalculation = true;
                    subViewOptions.calculationID = calculationID;
                    subViewOptions.parentObjectName = parentObjectName;
                    subViewOptions.collection = {};
                    subViewOptions.collection.transformsLookups = this.collection.transformsLookups;
                    this.children.formView = new AddEditLookupView(subViewOptions);
                }
                else if (type == "Rex")
                {
                    if (operation == "add")
                        this.headerTitle = _("Add Fields with a Regular Expression").t();
                    else
                        this.headerTitle = _("Edit Fields with a Regular Expression").t();

                    this.isCalculation = true;
                    subViewOptions.calculationID = calculationID;
                    subViewOptions.parentObjectName = parentObjectName;

                    this.children.formView = new AddEditRexView(subViewOptions);
                    // the Rex editor view handles its own previewing internally
                    this.showPreview = false;
                }
                else if (type == "GeoIP")
                {
                    if (operation == "add")
                        this.headerTitle = _("Add Geo Fields with an IP Lookup").t();
                    else
                        this.headerTitle = _("Edit Geo Fields with an IP Lookup").t();

                    this.isCalculation = true;
                    subViewOptions.calculationID = calculationID;
                    subViewOptions.parentObjectName = parentObjectName;
                    subViewOptions.collection = {};
                    subViewOptions.collection.transformsLookups = this.collection.transformsLookups;

                    this.children.formView = new AddEditGeoIPView(subViewOptions);
                }
                else if (type == "field") {
                    if (operation == "override") {
                        this.headerTitle = _("Override Field").t();
                        subViewOptions.fieldName = fieldName;
                        subViewOptions.parentObjectName = parentObjectName;
                        subViewOptions.calculationID = calculationID;
                        this.children.formView = new OverrideFieldView(subViewOptions);
                    }
                    else if (operation == "edit") {

                        this.headerTitle = _("Edit Field").t();
                        subViewOptions.fieldName = fieldName;
                        subViewOptions.parentObjectName = parentObjectName;
                        this.children.formView = new AddEditFieldView(subViewOptions);
                    }
                }
                else
                {
                    throw new Error("Unknown Calculation Type",type);
                }

                // Listen to events from the subview
                this.listenTo(this.children.formView, "action:save", this.formView_saveHandler);
                if(this.showPreview) {
                    this.listenTo(this.children.formView, "action:preview", function() {
                        if(this.model.setting.get("type") === 'search') {
                            this.formView_startSearchByStringHandler.apply(this, arguments);
                        }
                        else {
                            this.formView_previewHandler.apply(this, arguments);
                        }
                    });
                }
                this.listenTo(this.children.formView, "action:delete", this.showDeleteDialog);
                this.listenTo(this.children.formView, "action:cancel", function() {
                    /**
                     * Cancels any edits and closes the Add / Edit view, returning the user back to the Data Model Editor
                     *
                     * @event AddEditContainerView#action:cancel
                     */
                    this.trigger('action:cancel');
                });

                if(this.showPreview) {
                    this.children.previewJobController = new PreviewJobController({model: {
                        dataModel: this.model.dataModel,
                        application: this.model.application,
                        state: this.model.state,
                        searchJob: this.model.searchJob}});
                    var previewOptions = {
                        model: {application: this.model.application,
                            dataModel: this.model.dataModel,
                            searchJob: this.model.searchJob,
                            sampleSize: this.model.state},
                        flashMessagesView: this.children.flashMessagesView,
                        isCalculation: this.isCalculation};

                    if(this.isCalculation || type == "field") {
                        previewOptions.className = "preview-view-stack";
                        this.children.previewView = new PreviewViewStack(previewOptions);
                    }
                    else {
                        this.children.previewView = new PreviewView(previewOptions);
                    }
                }

            },

            render: function() {
                // Generate the breadcrumb
                var breadcrumb = "";
                var parentObjectName = this.model.setting.get("parentObjectName");

                if (this.isCalculation) {

                    var parentObject = this.model.dataModel.objectByName(parentObjectName);
                    if (!_(parentObject).isUndefined()) {
                        var ancestors = this.model.dataModel.getAncestorsForObject(parentObjectName);

                        _(ancestors.reverse()).each(function(object) {
                            breadcrumb += object.get("displayName") + " > ";
                        }, this);

                        breadcrumb += parentObject.get("displayName");
                    }
                } else if (this.model.setting.get("type") == "field") {
                    var fieldParentObject = this.model.dataModel.objectByName(parentObjectName);
                    if (fieldParentObject)
                        breadcrumb = fieldParentObject.get("displayName");
                    else
                        breadcrumb = "";
                } else if (this.model.setting.get("operation") == "edit") {
                    var objectName = this.model.setting.get("objectName");
                    var objectModel = this.model.dataModel.objectByName(objectName);
                    if (objectModel)
                        breadcrumb = objectModel.get("displayName");
                    else
                        breadcrumb = "";
                }

                // Get the documentation URL
                var docUrl = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.datamodel.addobject'
                );

                var html = _(this.template).template({
                    dataModel: this.model.dataModel,
                    docUrl: docUrl,
                    headerTitle: this.headerTitle,
                    objectBreadcrumb: breadcrumb
                });
                this.$el.html(html);

                this.$(".flash-messages-placeholder").replaceWith(this.children.flashMessagesView.render().el);
                this.$(".form-view-placeholder").replaceWith(this.children.formView.render().el);
                // Be careful here because the formView might render its preview UI internally into a div.preview-container.
                if(this.showPreview) {
                    this.$el.children('.preview-container').append(this.children.previewView.render().el);
                }
                else {
                    this.$el.children('.preview-container').remove();
                }

                return this;
            },

            template: '\
                <div class="section-padded section-header">\
                    <div class="header-button-holder pull-right">\
                        <a href="<%- docUrl %>" target="_blank" class="btn external"><%- _("Documentation").t() %></a>\
                    </div>\
                    <h2 class="section-title"><%- headerTitle %></h2>\
                    <p class="section-description"><strong><%- _("Data Model:").t() %></strong> <span class="value"><%- dataModel.entry.content.get("displayName") %></span>   \
                    <% if (objectBreadcrumb != "") {%>\
                        <strong><%- _("Dataset:").t() %></strong> <span class="value"><%- objectBreadcrumb %></span>\
                     <% } %>\
                     </p>\
                </div>\
                <div class="divider"></div>\
                <div class="section-wrapper">\
                    <div class="flash-messages-placeholder"></div>\
                    <div class="form-view-placeholder"></div>\
                </div>\
                <div class="preview-container"></div>\
            '
        });

    });
