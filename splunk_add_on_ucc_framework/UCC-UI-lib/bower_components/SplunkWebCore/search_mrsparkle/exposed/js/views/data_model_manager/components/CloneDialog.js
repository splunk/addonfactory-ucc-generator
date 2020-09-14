/**
 * @author nmistry
 * @author jszeto
 *
 * Dialog to edit the clone an existing Data Model.
 *
 * Inputs:
 *
 *     model: {
 *         source {models/services/datamodel/DataModel} The data model to clone
 *         application {models/Application}
 *     }
 *     collection: {
 *         apps: {collections/services/AppLocals}
 *     }
 *
 * @fires CloneDialog#action:clonedDataModel
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/datamodel/CreateDataModel',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/TextControl',
    'views/shared/delegates/PairedTextControls',
    'views/shared/FlashMessages',
    'util/datamodel/form_utils'
],
function (
    $,
    _,
    Backbone,
    module,
    CreateDataModel,
    Modal,
    ControlGroup,
    TextControl,
    PairedTextControls,
    FlashMessages,
    dataModelFormUtils){

    return Modal.extend({
        moduleId: module.id,

        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                this.primaryButtonClicked(e);
            }
        }),

        initialize: function (options) {
            Modal.prototype.initialize.apply(this, arguments);

            // Working model for the new data model
            this.model.createDataModel = new CreateDataModel({
                displayName: this.model.source.entry.content.get('displayName'),
                modelName: this.model.source.entry.content.get('modelName'),
                description: this.model.source.entry.content.get('description'),
                app: this.model.source.entry.acl.get("app"),
                clonePermissions: false
            });

            this.children.flashMessages = new FlashMessages({model: this.model.createDataModel});

            this.children.nameLabel = new ControlGroup({
                controlType: 'Label',
                controlOptions: {
                    modelAttribute: "displayName",
                    model: this.model.source.entry.content
                },
                controlClass: 'controls-block',
                label: _("Data Model").t()
            });

            this.textDisplayNameControl = new TextControl({modelAttribute: 'displayName',
                model: this.model.createDataModel});

            this.textModelNameControl = new TextControl({modelAttribute: 'modelName',
                model: this.model.createDataModel});

            this.children.titleField = new ControlGroup({
                controls: this.textDisplayNameControl,
                controlClass: 'controls-block',
                label: _('New Title').t()
            });

            this.children.idField = new ControlGroup({
                controls: this.textModelNameControl,
                controlClass: 'controls-block',
                label: _('New ID').t(),
                tooltip: _('The ID is used as the filename on disk and used in the data model search command. Cannot be changed later.').t(),
                help: _('Can only contain letters, numbers and underscores.').t()
            });

            // Delegate that copies the input from the source to the destination TextControl
            this.pairedTextControls = new PairedTextControls({sourceDelegate: this.textDisplayNameControl,
                destDelegate: this.textModelNameControl,
                transformFunction: dataModelFormUtils.normalizeForID});

            var applicationApp = this.model.createDataModel.get("app");
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

            // Use the source's app unless user can't write to it
            if (!useApplicationApp) {
                if (appItems.length > 0)
                    applicationApp = appItems[0].value;
                else
                    applicationApp = undefined;
            }

            this.model.createDataModel.set("app", applicationApp);

            this.children.selectApp = new ControlGroup({label:_("App").t(),
                controlType: "SyntheticSelect",
                controlClass: 'controls-block',
                controlOptions: {modelAttribute:"app",
                    model:this.model.createDataModel,
                    toggleClassName: 'btn',
                    items: appItems,
                    popdownOptions: {
                        attachDialogTo: '.modal:visible',
                        scrollContainer: '.modal:visible .modal-body:visible'
                    }}});

            this.children.descriptionField = new ControlGroup({
                controlType: 'Textarea',
                controlOptions: {
                    modelAttribute: 'description',
                    model: this.model.createDataModel
                },
                controlClass: 'controls-block',
                label: _('New Description').t()
            });

            this.children.clonePermissionsControl = new ControlGroup({
                controlType: 'SyntheticRadio',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'clonePermissions',
                    model: this.model.createDataModel,
                    items: [
                        {
                            label: _('Private').t(),
                            value: false
                        },
                        {
                            label: _('Clone').t(),
                            value: true
                        }
                    ],
                    save: false,
                    toggleClassName: 'btn',
                    labelPosition: 'outside',
                    elastic: true
                },
                label: _('Permissions').t()
            });
        },

        primaryButtonClicked: function(e) {
            if (this.clonedDataModel)
                this.children.flashMessages.unregister(this.clonedDataModel);

            // Validate the createDataModel
            if(this.model.createDataModel.set({},{validate:true})){

                // Clone the source and then update the clone with the attributes from createDataModel
                this.clonedDataModel = this.model.source.clone();
                var clonePermissions = this.model.createDataModel.get('clonePermissions');

                var cloneModelName = this.clonedDataModel.id;
                // unset id
                this.clonedDataModel.unset("id");

                // Don't copy over acceleration settings
                this.clonedDataModel.entry.content.acceleration.clear({silent:true});

                // set displayName, modelName, description
                this.clonedDataModel.entry.content.set({
                    name:           this.model.createDataModel.get('modelName'),
                    displayName:    this.model.createDataModel.get('displayName'),
                    description:    this.model.createDataModel.get('description')
                });

                this.children.flashMessages.register(this.clonedDataModel);

                // save
                this.clonedDataModel.save({},{
                    data: {
                        app: this.model.createDataModel.get("app"),
                        owner: this.model.application.get("owner")
                    },
                    success: function(model, response){
                        // Now clone the permissions which hits a different endpoint
                        if (clonePermissions) {
                            var dataModel = model;
                            this.clonedDataModel.acl.save({}, {
                                data: this.model.source.entry.acl.toDataPayload(),
                                success: function(model, response){
                                    this.saveSuccess(dataModel);
                                }.bind(this)
                            });
                        }else{
                            // this is in else loop
                            // because we want to make sure not to hide + delete objects
                            // when cloning permission is in process
                            this.saveSuccess(model);
                        }
                    }.bind(this)
                }, this);
            }
        },

        saveSuccess: function(model) {
            this.hide();
            /**
             * Data Model has been cloned
             *
             * @event CloneDialog#action:clonedDataModel
             * @param {string} data model name
             */
            this.trigger("action:clonedDataModel", model.id);
        },

        render : function() {
            this.$el.html(Modal.TEMPLATE);

            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Clone Data Model").t());

            this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessages.render().el);

            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);

            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.nameLabel.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.titleField.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.idField.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.selectApp.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.descriptionField.render().el);

            if (this.model.source.canChangePermissions()) {
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.clonePermissionsControl.render().el);
            }

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' +
                                                  _("Clone").t() + '</a>');

            return this;
        }

/* end of return */
});

/*end of annonymous function */
});
