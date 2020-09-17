/**
 * @author jszeto
 * @date 12/31/13
 *
 * Subclass for adding or editing an Object's field
 *
 *  *  inputs:
 *      model
 *          dataModel {models/services/datamodel/DataModel} - The data model that owns the object model
 */
define([
    'jquery',
    'underscore',
    'views/data_model_editor/form_views/DataModelAddEditForm',
    'views/shared/controls/ControlGroup',
    'views/data_model_editor/form_components/SelectFieldFlags',
    'views/data_model_editor/form_components/SelectFieldType',
    'helpers/FlashMessagesHelper',
    'util/splunkd_utils',
    'util/datamodel/form_utils',
    'module'
],
    function(
        $,
        _,
        DataModelAddEditForm,
        ControlGroup,
        SelectFieldFlags,
        SelectFieldType,
        FlashMessagesHelper,
        splunkDUtils,
        dataModelFormUtils,
        module
        )
    {
        return DataModelAddEditForm.extend({
            className: 'view-add-edit-field',
            moduleId: module.id,

            /**
             * @constructor
             * @param options {Object}
             *            type {String} [child|event] Whether the object inherits from BaseEvent (event) or another Object (child)
             */

            initialize: function(options) {
                DataModelAddEditForm.prototype.initialize.call(this, options);

                this.type = options.type;

                this.model.objectModel = this.model.dataModel.objectByName(this.parentObjectName);

                if (_(this.model.objectModel).isUndefined()) {
                    this.addObjectError(this.parentObjectName);
                    return;
                }

                this.model.field = this.model.objectModel.getField(options.fieldName);

                if (_(this.model.field).isUndefined()) {
                    this.addFieldError(options.fieldName);
                    return;
                }

                this.children.labelFieldName = new ControlGroup({label:_("Field Name:").t(),
                    controlType: "Label",
                    controlOptions: {modelAttribute:"fieldName",
                        model:this.model.field}});

                // Currently, only in the case of a timestamp field should the type and display name not be editable.
                var canEditNameAndType = this.model.field.get('type') !== 'timestamp';
                if(canEditNameAndType) {
                    this.children.textDisplayName = new ControlGroup({label: _("Display Name:").t(),
                        controlType: "Text",
                        controlOptions: {modelAttribute: "displayName",
                            model: this.model.field}});

                    this.children.selectFieldType = new ControlGroup({label: _("Type:").t(),
                        controls: new SelectFieldType({model: this.model.field,
                            popdownOptions: {
                                attachDialogTo: '.modal:visible',
                                scrollContainer: '.modal:visible .modal-body:visible'
                            }})});
                }
                this.children.selectFieldFlags= new ControlGroup({label: _("Flags:").t(),
                    controls: new SelectFieldFlags({model:this.model.field,
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }})});

                this.flashMessagesHelper.register(this.model.field);
            },

            /**
             * Called by both save and preview to perform validation on the models
             * @return {boolean}
             */
            performLocalValidation: function() {
                return this.model.field.set({}, {validate:true});
            },

            /**
             * Tells the view to provisionally save the inputs into the dataModel.
             */
            _handlePreview: function() {
                return $.Deferred().resolve(
                    this.model.objectModel.get("objectName"),
                    [],
                    undefined,
                    this.model.field
                );
            },

            renderEditor: function($container) {
                var html = _(this.editorTemplate).template({
                    type: this.type,
                    operation: this.operation
                });
                $container.html(html);

                this.$(".field-name-placeholder").append(this.children.labelFieldName.render().el);
                if(this.children.textDisplayName) {
                    this.$(".display-name-placeholder").append(this.children.textDisplayName.render().el);
                }
                if(this.children.selectFieldType) {
                    this.$(".field-type-placeholder").append(this.children.selectFieldType.render().el);
                }
                this.$(".field-flags-placeholder").append(this.children.selectFieldFlags.render().el);

                return this;
            },

            editorTemplate: '\
                <form class="add-edit-form">\
                    <div class="field-view-form">\
                        <div class="field-name-placeholder"></div>\
                        <div class="display-name-placeholder"></div>\
                        <div class="field-type-placeholder"></div>\
                        <div class="field-flags-placeholder"></div>\
                    </div>\
                </form>\
            '
        });

    });
