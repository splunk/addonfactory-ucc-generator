/**
 * @author jszeto
 * @date 1/2/14
 *
 * Override the hidden and required attributes of an inherited field
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
    'module'
],
    function(
        $,
        _,
        DataModelAddEditForm,
        ControlGroup,
        SelectFieldFlags,
        module
        )
    {
        return DataModelAddEditForm.extend({
            className: 'view-override-field',
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

                this.model.field = this.model.objectModel.getAnyField(options.fieldName, this.calculationID);

                if (_(this.model.field).isUndefined()) {
                    this.addFieldError(options.fieldName);
                    return;
                }

                this.children.labelDisplayName = new ControlGroup({label:_("Display Name:").t(),
                    controlType: "Label",
                    controlOptions: {modelAttribute:"displayName",
                        model:this.model.field}});

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

                this.$(".display-name-placeholder").append(this.children.labelDisplayName.render().el);
                this.$(".field-flags-placeholder").append(this.children.selectFieldFlags.render().el);
            },

            editorTemplate: '\
                <form class="add-edit-form">\
                    <div class="field-view-form">\
                        <div class="display-name-placeholder"></div>\
                        <div class="field-flags-placeholder"></div>\
                    </div>\
                </form>\
            '
        });
    });
