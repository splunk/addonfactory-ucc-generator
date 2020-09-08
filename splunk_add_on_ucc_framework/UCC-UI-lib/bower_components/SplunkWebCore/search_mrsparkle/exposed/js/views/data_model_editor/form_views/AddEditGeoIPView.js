/**
 * @author jszeto
 * @date 11/27/12
 *
 *  *  inputs:
 *      model
 *          calculation {models/services/datamodel/private/GeoIPCalculation} - The geoip calculation to edit
 *          objectModel {models/services/datamodel/private/Objects} - The object model that owns the calculation model
 *          dataModel {models/services/datamodel/DataModel} - The data model that owns the object model
 *
 * A subview to add or edit a GeoIP Calculation.
 */

define([
    'jquery',
    'underscore',
    'views/data_model_editor/form_views/DataModelAddEditForm',
    'views/shared/controls/ControlGroup',
    'views/data_model_editor/form_components/GeoIPOutputFieldView',
    'util/splunkd_utils',
    'module'

],
    function(
        $,
        _,
        DataModelAddEditForm,
        ControlGroup,
        GeoIPOutputFieldView,
        splunkDUtils,
        module
        )
    {
        return DataModelAddEditForm.extend({
            moduleId: module.id,
            className: 'geoip-form-wrapper',

            /**
             * @constructor
             * @param options {Object} {
                 }
             */
            initialize: function(options) {
                DataModelAddEditForm.prototype.initialize.call(this, options);

                this.model.objectModel = this.model.dataModel.objectByName(this.parentObjectName);

                if (_(this.model.objectModel).isUndefined()) {
                    this.addObjectError(this.parentObjectName);
                    return;
                }

                var ip4vFields;
                if (this.operation == "add") {
                    ip4vFields = this.model.objectModel.getAvailableIPV4Fields();
                } else {
                    ip4vFields = this.model.objectModel.getIPV4Fields();
                }
                // Get a filtered list of IP4V fields
                this.fieldNames = _(ip4vFields).map(function(field) {
                        return {label: field.displayName, value:field.fieldName};
                    }
                );

                // TODO [JCS] If fieldNames is empty, don't allow any adding and show an error message

                if (this.fieldNames.length > 0) {
                    if (this.operation == "add")
                    {
                        // Default inputField to the first IP4V field
                        var calcAttributes = {calculationType: "GeoIP",
                                              inputField: this.fieldNames[0].value,
                                              calculationID: ""};
                        // Create a new Calculation model and prepopulate the output fields
                        this.model.calculation = this.model.objectModel.createCalculation(calcAttributes);
                    }
                    else
                    {
                        this.model.calculation = this.model.objectModel.getCalculation(this.calculationID);
                        if (_(this.model.calculation).isUndefined()) {
                            this.addCalculationError(this.calculationID);
                            return;
                        }
                    }

                    this.children.selectField = new ControlGroup({label: _("IP").t(),
                                                                  controlType: "SyntheticSelect",
                                                                  controlOptions:
                                                                        {model:this.model.calculation,
                                                                         modelAttribute:"inputField",
                                                                         items:this.fieldNames,
                                                                         toggleClassName: 'btn'}});

                    this.flashMessagesHelper.register(this.model.calculation);
                }

            },

            /**
             * Called by both save and preview to perform validation on the models
             * @return {boolean}
             */
            performLocalValidation: function() {

                var isValid = this.model.calculation.set({}, {validate:true});

                this.model.calculation.withEachField(function(field) {
                    if (!field.get("hidden")) {
                        isValid = field.set({}, {validate:true}) && isValid;
                    }
                }, this);

                return isValid;
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
                if (this.fieldNames.length > 0) {
                    this.children.selectField.detach();
                    this.outputFields = [];

                    var html = _(this.editorTemplate).template({});
                    $container.html(html);

                    this.$(".selectField-placeholder").append(this.children.selectField.render().el);

                    this.model.calculation.withEachField(function(field, i) {
                        var fieldView = new GeoIPOutputFieldView({
                            model: field,
                            flashMessagesHelper: this.flashMessagesHelper
                        });
                        this.$(".table-output-fields tbody").append(fieldView.render().el);
                        this.outputFields.push(fieldView);
                    }, this);
                }
                else {
                    this.model.buttonSettings.set({save:"hide",preview:"hide"});
                    $container.html(_(this.errorTemplate).template({}));
                }

                return this;
            },

            editorTemplate: '\
                    <div class="col-1">\
                        <div class="selectField-placeholder"/></div>\
                    </div>\
                    <div class="col-2">\
                        <label class="control-label"><%- _("Field(s)").t() %></label>\
                        <table class="table table-output-fields">\
                            <tbody>\
                                <tr>\
                                    <td><%- _("Include:").t() %></td>\
                                    <td><%- _("Field in GeoIP:").t() %></td>\
                                    <td><%- _("Display Name:").t() %></td>\
                                </tr>\
                            </tbody>\
                        </table>\
                    </div>\
            ',

            errorTemplate: '\
                    <div><%- _("There are no IPv4 fields available in this dataset. Each IPv4 field can be associated with one GeoIP lookup.").t() %></div>\
            '
        });

    });

