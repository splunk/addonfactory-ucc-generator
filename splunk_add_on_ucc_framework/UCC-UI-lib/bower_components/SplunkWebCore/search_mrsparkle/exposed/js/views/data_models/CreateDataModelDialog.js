/**
 * @author jszeto
 * @date 1/2/13
 *
 * TODO [JCS] Move this to views/data_model_manager/components
 *
 * Dialog that allows the user to create a new Data Model
 *
 * Inputs:
 *
 *     model: {
 *         application {models/Application}
 *     }
 *     collection: {
 *         apps {collections/services/AppLocals}
 *     }
 *
 * @fires CreateDataModelDialog#action:createdDataModel
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'splunk.util',
        'views/shared/dialogs/DialogBase',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/TextControl',
        'models/datamodel/CreateDataModel',
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
        TextControl,
        CreateDataModel,
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

                modelToControlGroupMap: {
                    displayName: "textDisplayName"
                },

                initialize: function(options) {
                    DialogBase.prototype.initialize.call(this, options);

                    this.settings.set("primaryButtonLabel", _("Create").t());
                    this.settings.set("cancelButtonLabel", _("Cancel").t());
                    this.settings.set("titleLabel", _("New Data Model").t());

                    var applicationApp = this.model.application.get("app");
                    var useApplicationApp = false;

                    // Filter out the app list to hold apps the user can write to
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

                    // Use the current app unless user can't write to it
                    if (!useApplicationApp) {
                        if (appItems.length > 0)
                            applicationApp = appItems[0].value;
                        else
                            applicationApp = undefined;
                    }

                    this.model.createDataModel = new CreateDataModel({displayName:"", description:"", app: applicationApp});

                    this.textDisplayNameControl = new TextControl({modelAttribute: 'displayName',
                        model: this.model.createDataModel});

                    this.textModelNameControl = new TextControl({modelAttribute: 'modelName',
                        model: this.model.createDataModel});

                    this.children.textDisplayName = new ControlGroup({
                        label:_("Title").t(),
                        controls: this.textDisplayNameControl,
                        controlClass: 'controls-block'
                    });

                    this.children.textModelName = new ControlGroup({
                        label:_("ID").t(),
                        tooltip: _('The ID is used as the filename on disk and used in the data model search command. Cannot be changed later.').t(),
                        help: _('Can only contain letters, numbers and underscores.').t(),
                        controls: this.textModelNameControl,
                        controlClass: 'controls-block'
                    });

                    this.pairedTextControls = new PairedTextControls({sourceDelegate: this.textDisplayNameControl,
                                                                      destDelegate: this.textModelNameControl,
                                                                      transformFunction: dataModelFormUtils.normalizeForID});

                    this.children.selectApp = new ControlGroup({
                        label:_("App").t(),
                        controlType: "SyntheticSelect",
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute:"app",
                            model:this.model.createDataModel,
                            toggleClassName: 'btn',
                            items: appItems,
                            popdownOptions: {
                                attachDialogTo: '.modal:visible',
                                scrollContainer: '.modal:visible .modal-body:visible'
                            }
                        }
                    });

                    this.children.textAreaDescription = new ControlGroup({
                        label:_("Description").t(),
                        controlType: "Textarea",
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute:"description",
                            model:this.model.createDataModel,
                            placeholder: _('optional').t()
                        }
                    });

                    this.model.newDataModel = new DataModel();
                    this.children.flashMessagesView = new FlashMessagesView({model: [this.model.createDataModel, this.model.newDataModel]});
                },

                primaryButtonClicked: function() {
                    DialogBase.prototype.primaryButtonClicked.apply(this, arguments);

                    // Validate the working model
                    if (this.model.createDataModel.set({}, {validate:true}))
                    {
                        this.model.newDataModel.entry.content.set({name: this.model.createDataModel.get("modelName"),
                                                             displayName: this.model.createDataModel.get("displayName"),
                                                             description: this.model.createDataModel.get("description")});

                        var resultXHR = this.model.newDataModel.save({}, {data: { app: this.model.createDataModel.get("app"),
                                                                    owner: this.model.application.get("owner") }});
                        if (resultXHR) {
                            resultXHR.done(_(function() {
                                this.hide();
                                /**
                                 * Created a new Data Model
                                 *
                                 * @event CreateDataModelDialog#action:createdDataModel
                                 * @param {models/services/datamodel/DataModel} - the new data model
                                 */
                                this.trigger("action:createdDataModel", this.model.newDataModel);
                            }).bind(this));
                        }
                    }
                },

                renderBody : function($el) {
                    var html = _(this.bodyTemplate).template({});
                    $el.html(html);
                    $el.find(".flash-messages-view-placeholder").append(this.children.flashMessagesView.render().el);
                    $el.find(".data-model-display-name-placeholder").append(this.children.textDisplayName.render().el);
                    $el.find(".data-model-model-name-placeholder").append(this.children.textModelName.render().el);
                    $el.find(".data-model-app-placeholder").append(this.children.selectApp.render().el);
                    $el.find(".data-model-description-placeholder").append(this.children.textAreaDescription.render().el);
                },


                bodyTemplate: '\
                    <div class="flash-messages-view-placeholder"></div>\
                    <div class="data-model-display-name-placeholder"></div>\
                    <div class="data-model-model-name-placeholder"></div>\
                    <div class="data-model-app-placeholder"></div>\
                    <div class="data-model-description-placeholder"></div>\
                '
            }
        );}
);
