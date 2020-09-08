/**
 * @author jszeto
 * @date 11/20/2012
 *
 * A view for editing the output field of a Lookup calculation.
 *
 * Input:
 *      model {models/services/datamodel/private/Field} - The output field to edit
 *      flashMessagesHelper {helpers/FlashMessagesHelper} - Used to register validating models
 *
 * @fires LookupOutputFieldView#action:removeOutputField
 */
define(
    [
        'underscore',
        'views/ValidatingView',
        'views/shared/controls/ControlGroup',
        'views/data_model_editor/form_components/SelectFieldType',
        'views/data_model_editor/form_components/SelectFieldFlags',
        'module'
    ],
    function(
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
            className: 'lookup-attribute-controls',
            tagName: 'tr',

            events: {
                'click .remove-button': function(e) {
                    e.preventDefault();
                    /**
                     * Remove the output field
                     *
                     * @event LookupOutputFieldView#action:removeOutputField
                     * @param {string} - ID of the output field
                     */
                    this.trigger("action:removeOutputField", this.model.cid);
                }
            },

            // TODO [JCS] Remove
            modelToControlGroupMap: {
                fieldName: "textFieldName",
                displayName: "textDisplayName"
            },

            isInputFieldChangeHandler: function() {
                if (this.model.get("isInputField"))
                {
                    this.children.checkboxSelected.disable();
                    this.children.textFieldName.disable();
                    this.children.textDisplayName.disable();
                    this.children.selectFieldType.disable();
                    this.children.selectFieldFlags.disable();
                }
                else
                {
                    this.children.checkboxSelected.enable();
                    this.children.textFieldName.enable();
                    this.children.textDisplayName.enable();
                    this.children.selectFieldType.enable();
                    this.children.selectFieldFlags.enable();
                }
            },

            initialize: function(options) {
                ValidatingView.prototype.initialize.call(this, options);
                options = options || {};
                this.$el.addClass(options.className);

                this.model.on("change:isInputField", this.isInputFieldChangeHandler, this);

                this.children.checkboxSelected = new ControlGroup({controlType: "SyntheticCheckbox",
                                                                   controlOptions:
                                                                                    {model:this.model,
                                                                                     modelAttribute:"selected",
                                                                                     label: this.model.get("lookupOutputFieldName")}});
                this.children.textFieldName = new ControlGroup({controlType: "Text",
                                                                controlOptions:
                                                                    {model:this.model,
                                                                     modelAttribute:"fieldName"}});
                this.children.textDisplayName = new ControlGroup({controlType: "Text",
                                                                  controlOptions:
                                                                  {model:this.model,
                                                                   modelAttribute:"displayName"}});

                this.children.selectFieldType = new ControlGroup({controls: new SelectFieldType({model:this.model})});
                this.children.selectFieldFlags= new ControlGroup({controls: new SelectFieldFlags({model:this.model})});
            },

            render: function() {
                var html = _(this.template).template({ });
                this.$el.html(html);

                this.$(".selected-placeholder").append(this.children.checkboxSelected.render().el);
                this.$(".field-name-placeholder").append(this.children.textFieldName.render().el);
                this.$(".display-name-placeholder").append(this.children.textDisplayName.render().el);
                this.$(".field-type-placeholder").append(this.children.selectFieldType.render().el);
                this.$(".field-flags-placeholder").append(this.children.selectFieldFlags.render().el);

                this.isInputFieldChangeHandler();

                return this;
            },

            template: '\
                <td class="selected-placeholder"></td>\
                <td class="field-name-placeholder"></td>\
                <td class="display-name-placeholder"></td>\
                <td class="field-type-placeholder"></td>\
                <td class="field-flags-placeholder"></td>\
            '

        });

    });
