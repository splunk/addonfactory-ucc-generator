/**
 * @author jszeto
 * @date 11/15/12
 *
 * A subview to add or edit an Eval Calculation
 *
 *  inputs:
 *
 */

define([
    'jquery',
    'underscore',
    'views/data_model_editor/form_views/DataModelAddEditForm',
    'views/shared/controls/ControlGroup',
    'views/data_model_editor/form_components/EvalOutputFieldView',
    'uri/route',
    'util/splunkd_utils',
    'module'
],
    function(
        $,
        _,
        DataModelAddEditForm,
        ControlGroup,
        EvalOutputFieldView,
        route,
        splunkDUtils,
        module
        )
    {
        return DataModelAddEditForm.extend({
            moduleId: module.id,
            className: 'add-edit-view',

            /**
             * @constructor
             * @param options {Object} {
             *     model
             *         calculation {models/services/datamodel/private/EvalCalculation} - The eval calculation to edit
             *         objectModel {models/services/datamodel/private/Objects} - The object model that owns the calculation model
             *         dataModel {models/services/datamodel/DataModel} - The data model that owns the object model
             *  }
             */
            initialize: function(options) {
                DataModelAddEditForm.prototype.initialize.call(this, options);

                // TODO [JCS] Need to create a working calculation model instead of having a pointer to the Object's
                // calculation. That pointer gets stale since we do a reset on the Object's associated models when
                // we trigger preview.

                this.model.objectModel = this.model.dataModel.objectByName(this.parentObjectName);

                if (_(this.model.objectModel).isUndefined()) {
                    this.addObjectError(this.parentObjectName);
                    return;
                }

                // Eval calculations should only have a single output field
                if (this.operation == "add") {
                    var calcAttributes = {calculationType: "Eval"};
                    // Create a new Calculation model
                    this.model.calculation = this.model.objectModel.createCalculation(calcAttributes);
                    // Create a new outputField model
                    this.model.calculation.addField();
                    this.model.outputField = this.model.calculation.getFieldAt(0);
                }
                else {
                    this.model.calculation = this.model.objectModel.getCalculation(this.calculationID);

                    if (_(this.model.calculation).isUndefined()) {
                        this.addCalculationError(this.calculationID);
                        return;
                    }
                    this.model.outputField = this.model.calculation.getFieldAt(0);
                }

                this.children.textareaExpression = new ControlGroup({label: _("Eval Expression").t(),
                                                                     controlType: "Textarea",
                                                                     controlOptions: {model:this.model.calculation,
                                                                                      modelAttribute:"expression"}
                                                                    });

                this.children.outputFieldView = new EvalOutputFieldView({model: this.model.outputField});

                this.flashMessagesHelper.register(this.model.calculation);
                this.flashMessagesHelper.register(this.model.outputField);
            },

            /**
             * Called by both save and preview to perform validation on the models
             * @return {boolean}
             */
            performLocalValidation: function() {
                var result = this.model.calculation.set({}, {validate:true});
                return this.model.outputField.set({}, {validate:true}) && result;
            },

            /**
             * Tells the view to provisionally save the inputs into the dataModel.
             */
            _handlePreview: function() {
                return $.Deferred().resolve(
                     this.model.objectModel.get("objectName"),
                     this.model.calculation.getFieldNames(),
                     this.model.calculation
                );
            },
            renderEditor: function($container) {
                var docUrl = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'search_app.assist.eval'
                );

                var html = _(this.editorTemplate).template({
                    type: this.type,
                    operation: this.operation,
                    docUrl: docUrl
                });
                $container.html(html);

                this.$(".eval-expression-placeholder").replaceWith(this.children.textareaExpression.render().el);
                this.$(".eval-output-field-placeholder").replaceWith(this.children.outputFieldView.render().el);
            },

            editorTemplate: '\
                        <form class="add-edit-form">\
                            <div class="eval-expression">\
                            <div class="eval-expression-placeholder"/>\
                                <span class="help-block"><%- _("Examples:").t() %><br/>\
                                <span class="mono-space">case(error == 404, "Not found", error == 500, "Internal Server Error") <br>\
                                   if(cidrmatch("192.0.0.0/16", clientip), "local", "other")</span><br/>\
                                </span>\
                                <a href="<%- docUrl %>" target="_blank" class="external"><%- _("Learn More").t() %></a>\
                            </div>\
                            <div class="eval-output-field-placeholder"></div>\
                        </form>\
            '
        });

    });

