/**
 * @author usaha
 * @date 11/5/13
 *
 * Dialog that allows the user to create a new Data Model
 *
 * events:
 *      action:uploadedDataModel (fileName) - Dispatched when the user has pressed the Save button
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'splunk.util',
        'views/shared/dialogs/UploadDataModelDialogBase',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticCheckboxControl',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/TextControl',
        'views/data_models/FileUploadControl',
        'models/datamodel/UploadDataModel',
        'models/services/datamodel/DataModel',
        'views/shared/FlashMessages',
        'views/shared/delegates/PairedTextControls',
        'util/datamodel/form_utils',
        'module'
    ],
    function(
        $,
        _,
        Backbone,
        splunkUtil,
        DialogBase,
        ControlGroup,
        SyntheticCheckboxControl,
        SyntheticSelectControl, 
        TextControl,
        FileUploadControl,
        UploadDataModel,
        DataModel,
        FlashMessagesView,
        PairedTextControls,
        dataModelFormUtils,
        module
        )
    {
        return DialogBase.extend({
                moduleId: module.id,
                className: "modal fade modal-narrow create-data-model-dialog form form-horizontal",
                events: {
                    'change #uploadedFile': function(e) {
                        this.handleFileSelect(e); 
                        //this.children.dataModelController.trigger("action:createDataModel");
                    } 
                }, 
                modelToControlGroupMap: {
                    displayName: "fileContents"
                },

                initialize: function(options) {
                    DialogBase.prototype.initialize.call(this, options);

                    this.settings.set("primaryButtonLabel", _("Upload").t());
                    this.settings.set("cancelButtonLabel", _("Cancel").t());
                    this.settings.set("titleLabel", _("Upload New Data Model").t());

                    var applicationApp = this.model.application.get("app");
                    var useApplicationApp = false;

                    var appItems = [];
                    this.collection.apps.each(function(model){
                        if (model.entry.acl.get("can_write")) {
                            appItems.push({
                                label: model.entry.content.get('label'),
                                value: model.entry.get('name')
                            });
                            if (model.entry.get('name') == applicationApp)
                                useApplicationApp = true;
                        }
                    }, this);

                    if (!useApplicationApp) {
                        if (appItems.length > 0)
                            applicationApp = appItems[0].value;
                        else
                            applicationApp = undefined;
                    }

                    this.model.uploadDataModel = new UploadDataModel({fileContents:"", app: applicationApp});

                    this.fileNameControl = new FileUploadControl({modelAttribute: 'fileContents',
                        model: this.model.uploadDataModel});

                    this.textModelNameControl = new TextControl({modelAttribute: 'modelName',
                        model: this.model.uploadDataModel});

                    this.children.fileName = new ControlGroup({
                        label:_("File").t(),
                        controls: this.fileNameControl,
                        controlClass: 'controls-block', 
                        controlOptions: {
                            modelAttribute:"uploadedFile",
                            model:this.model.uploadDataModel
                        } 
                    });

                    this.model.uploadDataModel.on('change:fileContents', this.handleFileUploaded, this);  

                    this.children.textModelName = new ControlGroup({
                        label:_("ID").t(),
                        tooltip: _('The ID is used as the filename on disk and used in the data model search command. Cannot be changed later.').t(),
                        help: _('Can only contain letters, numbers and underscores.').t(),
                        controls: this.textModelNameControl,
                        controlClass: 'controls-block'
                    });

                    this.children.selectApp = new ControlGroup({
                        label:_("App").t(),
                        controlType: "SyntheticSelect",
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute:"app",
                            model:this.model.uploadDataModel,
                            toggleClassName: 'btn',
                            items: appItems,
                            popdownOptions: {
                                attachDialogTo: '.modal:visible',
                                scrollContainer: '.modal:visible .modal-body:visible'
                            }
                        }
                    });

                    var sharedLabel = (this.model.user.canUseApps()) ? _('Shared in App').t() : _('Shared').t();
                    this.children.dashPerm = new ControlGroup({
                        label: _("Permissions").t(),
                        controlType:'SyntheticRadio',
                        controlClass: 'controls-halfblock',
                        controlOptions: {
                            className: "btn-group btn-group-2",
                            items: [
                                {value:"private", label:_("Private").t()},
                                {value:"shared", label:sharedLabel}
                            ],
                            model: this.model.uploadDataModel,
                            modelAttribute: 'dashPerm'
                        }
                    });

                    this.model.newDataModel = new DataModel();
                    this.children.flashMessagesView = new FlashMessagesView({model: [this.model.uploadDataModel, this.model.newDataModel]});
                    this.model.uploadDataModel.set('dashPerm', 'private'); 
                    this.model.uploadDataModel.on("change:dashPerm", this.permsChangeHandler, this);

                    var items = [
                        {label: _("1 Day").t(), value: "-1d"},
                        {label: _("7 Days").t(), value: "-1w"},
                        {label: _("1 Month").t(), value: "-1mon"},
                        {label: _("3 Months").t(), value: "-3mon"},
                        {label: _("1 Year").t(), value: "-1y"},
                        {label: _("All Time").t(), value: "0"}
                    ];

                    this.enabledCheckBox = new SyntheticCheckboxControl({modelAttribute: 'enabled',
                        model: this.model.newDataModel.entry.content.acceleration, updateModel:false});
                        this.children.enabledGroup = new ControlGroup({label: _("Accelerate").t(),
                        controls: [this.enabledCheckBox],
                        help:_("Acceleration may increase storage and processing costs.").t()
                    });
                    this.enabledCheckBox.on("change", this.acceleratedChangeHandler, this);

                    // TODO [JCS] Maybe Control.js should use the defaultValue if the model attribute is undefined.
                    // But too risky of a change to make right now. Instead, will add a hack that we should revisit later
                    var accelerationModel = this.model.newDataModel.entry.content.acceleration;
                    if (_.isUndefined(accelerationModel.get("earliest_time")) || _.isEmpty(accelerationModel.get("earliest_time"))) {
                        accelerationModel.set("earliest_time", "-1d");
                    }
                    this.earliestTimeSelect = new SyntheticSelectControl({modelAttribute: 'earliest_time',
                                                                model: accelerationModel,
                                                                toggleClassName: 'btn',
                                                                menuWidth: 'narrow',
                                                                items: items,
                                                                updateModel:false,
                                                                popdownOptions: {
                                                                    attachDialogTo: '.modal:visible',
                                                                    scrollContainer: '.modal:visible .modal-body:visible'
                                                                }});
                    this.children.earliestTimeGroup = new ControlGroup({label: _("Summary Range").t(),
                                                                controls: [this.earliestTimeSelect],
                                tooltip: _("Sets the range of time (relative to now) for which data is accelerated. " +
                                    "Example: 1 Month accelerates the last 30 days of data in your pivots.").t()});
                },
                /**
                 * When the enabled checkbox value is changed, toggle the visibility of the Summary Range control
                 */
                acceleratedChangeHandler: function(model, value, options) {
                    this.updateView();
                },
                permsChangeHandler: function() {
                    this.updateView(); 
                }, 
                updateView: function() {
                    var dashPerm = this.model.uploadDataModel.get('dashPerm'); 
                    if (dashPerm == "private") {
                        this.children.enabledGroup.$el.hide(); 
                        this.enabledCheckBox.setValue(false); 
                    } else {
                        this.children.enabledGroup.$el.show(); 
                    } 
                    this.enabledCheckBox.getValue() ? this.children.earliestTimeGroup.$el.show() :
                                                  this.children.earliestTimeGroup.$el.hide();
                },

                handleFileUploaded: function() {
                    var stringifiedJSON = this.model.uploadDataModel.get('fileContents'); 
                    var json; 
                    try {
                        json = JSON.parse(stringifiedJSON); 
                        json.description = stringifiedJSON;  
                        var wrappedContents = {}; 
                        wrappedContents.entry = []; 
                        wrappedContents.entry.push({content: json}); 
                        this.model.newDataModel.parseFile(wrappedContents); 
                        var modelID = dataModelFormUtils.normalizeForID(this.model.newDataModel.entry.content.get('displayName')); 
                        this.model.uploadDataModel.set('modelName', modelID); 
                        
                    } catch (e) {
                        this.model.uploadDataModel.trigger('error', this.model.uploadDataModel, 'File contains invalid json'); 
                        return; 
                    }

                }, 

                primaryButtonClicked: function() {
                    DialogBase.prototype.primaryButtonClicked.apply(this, arguments);

                    if (this.model.uploadDataModel.set({}, {validate:true}))
                    {

                        var dashPerm = this.model.uploadDataModel.get("dashPerm"); 
                        var data = this.model.application.getPermissions(dashPerm);
                        data.app = this.model.uploadDataModel.get("app"); 
                        this.model.newDataModel.entry.content.set('name', this.model.uploadDataModel.get('modelName'));  

                        this.enabledCheckBox.updateModel(); 
                        this.earliestTimeSelect.updateModel();

                        this.model.newDataModel.entry.content.isCreating = true; 

                        var resultXHR = this.model.newDataModel.save({}, {data: data});  
                        if (resultXHR) {
                            resultXHR.done(_(function() {
                                this.hide();
                                this.model.newDataModel.entry.content.isCreating = false; 
                                this.trigger("action:uploadedDataModel", this.model.newDataModel);
                            }).bind(this));
                        }

                    }
                },

                renderBody : function($el) {
                    var html = _(this.bodyTemplate).template({});
                    $el.html(html);
                    $el.find(".flash-messages-view-placeholder").append(this.children.flashMessagesView.render().el);
                    $el.find(".data-model-file-name-placeholder").append(this.children.fileName.render().el);
                    $el.find(".data-model-model-name-placeholder").append(this.children.textModelName.render().el);
                    $el.find(".data-model-app-placeholder").append(this.children.selectApp.render().el);
                    $el.find(".data-model-perms-placeholder").append(this.children.dashPerm.render().el);
                    $el.find(".accelerate-checkbox-placeholder").replaceWith(this.children.enabledGroup.render().el);
                    $el.find(".summary-range-dropdown-placeholder").append(this.children.earliestTimeGroup.render().el);
                    this.updateView();
                },


                bodyTemplate: '\
                    <div class="flash-messages-view-placeholder"></div>\
                    <div class="data-model-file-name-placeholder"></div>\
                    <div class="data-model-model-name-placeholder"></div>\
                    <div class="data-model-app-placeholder"></div>\
                    <div class="data-model-perms-placeholder"></div>\
                    <div class="accelerate-checkbox-placeholder"></div>\
                    <div class="summary-range-dropdown-placeholder"></div>\
                '
            }
        );}
);
