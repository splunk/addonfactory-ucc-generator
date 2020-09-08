/**
 * @author jszeto
 * @date 12/11/12
 *
 * Displays the controls to edit the outputField of an EvalCalculation
 *
 * Inputs:
 *
 *     model {models/services/datamodel/private/Field} - The output field of the EvalCalculation
 *
 */
define([
    'jquery',
    'underscore',
    'views/ValidatingView',
    'views/shared/controls/ControlGroup',
    'views/data_model_editor/form_components/SelectFieldType',
    'views/data_model_editor/form_components/SelectFieldFlags',
    'module'
],
    function(
        $,
        _,
        ValidatingView,
        ControlGroup,
        SelectFieldType,
        SelectFieldFlags,
        module
        )
    {
        return ValidatingView.extend({
            moduleId: module.id,
            className: 'eval-output-view',

            // TODO [JCS] Remove
            modelToControlGroupMap: {
                fieldName: "textFieldName",
                type: "selectFieldType",
                flags: "selectFieldFlags"
            },

            /**
             * @constructor
             * @param options {Object} {
                 }
             */
            initialize: function(options) {
                ValidatingView.prototype.initialize.call(this, options);

                this.children.textFieldName = new ControlGroup({label: _("Field Name:").t(),
                    controlType: "Text",
                    controlOptions: {model:this.model,
                        modelAttribute:"fieldName"}
                });

                this.children.textDisplayName = new ControlGroup({label: _("Display Name:").t(),
                    controlType: "Text",
                    controlOptions: {model:this.model,
                        modelAttribute:"displayName"}
                });

                this.children.selectFieldType = new ControlGroup({label: _("Type:").t(),
                    controls: new SelectFieldType({model:this.model})
                });
                this.children.selectFieldFlags= new ControlGroup({label: _("Flags:").t(),
                    controls: new SelectFieldFlags({model:this.model})});

            },

            render: function()
            {
                var html = _(this.template).template({
                    type: this.type,
                    operation: this.operation
                });
                this.$el.html(html);

                this.$(".field-name-placeholder").replaceWith(this.children.textFieldName.render().el);
                this.$(".display-name-placeholder").replaceWith(this.children.textDisplayName.render().el);
                this.$(".field-type-placeholder").replaceWith(this.children.selectFieldType.render().el);
                this.$(".field-flags-placeholder").replaceWith(this.children.selectFieldFlags.render().el);

                return this;
            },

            template: '\
                <label><%- _("Field").t() %></label>\
                <div class="field-name-placeholder"></div>\
                <div class="display-name-placeholder"></div>\
                <div class="field-type-placeholder"></div>\
                <div class="field-flags-placeholder"></div>\
            '
        });
    }
);
