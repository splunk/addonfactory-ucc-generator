/**
 * @author jszeto
 * @date 11/19/12
 *
 * A subview to add or edit a Lookup Calculation
 *
 * inputs:
 *      model
 *          calculation {models/services/datamodel/private/LookupCalculation} - The lookup calculation to edit
 *          objectModel {models/services/datamodel/private/Objects} - The object model that owns the calculation model
 *          dataModel {models/services/datamodel/DataModel} - The data model that owns the object model
 *      collection
 *          transformsLookups {collections/services/data/TransformsLookups} - The lookups available in the system
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/datamodel/SelectableLookupOutputField',
    'models/services/datamodel/private/LookupInput',
    'views/data_model_editor/form_views/DataModelAddEditForm',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticSelectControl',
    'views/data_model_editor/form_components/LookupInputFieldsView',
    'views/data_model_editor/form_components/LookupOutputFieldsView',
    'module',
    'splunk.util',
    'util/console',
    'util/splunkd_utils',
    'uri/route'
],
    function(
        $,
        _,
        Backbone,
        SelectableLookupOutputField,
        LookupInput,
        DataModelAddEditForm,
        ControlGroup,
        SyntheticSelectControl,
        LookupInputFieldsView,
        LookupOutputFieldsView,
        module,
        splunkUtils,
        console,
        splunkDUtils,
        route
        )
    {
        return DataModelAddEditForm.extend({
            moduleId: module.id,
            className: 'add-edit-lookup-view',
            MISSING_OUTPUTFIELD_ID: "MISSING_OUTPUTFIELD_ID",
            MISSING_LOOKUPINPUT_ID: "MISSING_LOOKUPINPUT_ID",
            DUPLICATE_LOOKUPINPUT_ID: "DUPLICATE_LOOKUPINPUT_ID",

            /**
             * Handle a request from LookupInputFieldsView to add a new field
             */
            addInputFieldHandler: function() {
//                this.collection.lookupInputs.add({inputField: undefined, lookupField:undefined});
                this.addLookupInput();
            },

            /**
             * Handle a request from LookupInputFieldsView to remove a specific field
             *
             * @param cid - cid of the field to remove
             */
            removeInputFieldHandler: function(cid) {
                // Remove inputField/lookupField pair from calculation lookupInputs
                this.collection.lookupInputs.remove(cid);
            },

            /**
             * If lookupName changes, rebuild the view
             */
            lookupNameChangeHandler: function() {
                this.buildInputAndOutputViews(true);
            },

            addLookupInput: function() {
                // The list of input fields for the calculation
                var inputFields = this.model.objectModel.getAllowedInputFields();
                var selectedLookup = this.selectLookupName.findItem();
                var selectedLookupModel = this.collection.transformsLookups.get(selectedLookup.id);
                if (selectedLookupModel) {
                    // Get the fields_list of the lookup table
                    var lookupFieldsList = selectedLookupModel.getFieldsList();

                    if (lookupFieldsList.length > 0 && inputFields.length > 0)
                    {
                        this.collection.lookupInputs.add({lookupField:lookupFieldsList[0],inputField:inputFields[0].fieldName});
                    }
                }
            },

            /**
             * Generates the inputs and outputs form fields based on the lookup table's fields_list. When the user changes
             * the lookup table, then we clear out any of the form changes
             * @param clearInputsAndOutputs {boolean} if true, clears the calculation's lookupInputs and outputFields
             */
            buildInputAndOutputViews: function(clearInputsAndOutputs) {

                var selectableFields = [];
                var selectableInputs = [];
                var lookupFields = [];

                // Find the full lookup name from the SyntheticSelectControl
                var selectedLookup = this.selectLookupName && this.selectLookupName.findItem();
                if (selectedLookup)
                {
                    // Get the lookup table from the collection of lookups
                    var selectedLookupModel = this.collection.transformsLookups.get(selectedLookup.id);

                    if (selectedLookupModel) {
                        // Get the fields_list of the lookup table
                        var lookupFieldsList = selectedLookupModel.getFieldsList();

                        _(lookupFieldsList).each(function(field) {
                            // Is the field already set as an outputField?
                            var outputField = this.model.calculation.getFieldByLookup(field);
                            // Is the field a lookupInput?
                            var lookupInput = this.model.calculation.getLookupInput(field);
                            var isInputField = lookupInput ? true : false;

                            var selectableField;
                            var lookupInputField = isInputField ? lookupInput.get("inputField") : undefined;

                            if (outputField) {
                                var attrs = $.extend(outputField.attributes, {selected: true, isInputField: isInputField});
                                selectableField = new SelectableLookupOutputField(attrs);
                            } else {
                                selectableField = new SelectableLookupOutputField({lookupOutputFieldName: field,
                                    fieldName: field, selected: false, isInputField: isInputField});
                            }

                            if (isInputField)
                                selectableInputs.push(new Backbone.Model({lookupField:field, inputField: lookupInputField}));

                            selectableFields.push(selectableField);
                            lookupFields.push({id:field});
                        }, this);

                        // Reset the selectable output fields collection
                        this.collection.selectableLookupOutputFields.reset(selectableFields);
                        this.collection.lookupFields.reset(lookupFields);
                        this.collection.lookupInputs.reset(selectableInputs);

                        if (clearInputsAndOutputs) {
                            // Remove all output fields from the calculation
                            this.model.calculation.removeAllFields();
                            this.model.calculation.removeAllLookupInputs();
                        }

                        // If we don't have any lookupInputs and we have lookup table fields and input fields, add a new
                        // lookupInput which defaults to the first inputField and lookup table field
                        if (this.collection.lookupInputs.length == 0)
                            this.addLookupInput();

                        this.showInputsAndOutputs = true;
                    } else {
                        this.showInputsAndOutputs = false;
                    }
                } else {
                    this.showInputsAndOutputs = false;
                }

                this.toggleInputOutputVisibility();
            },

            /**
             * If we change a lookupInput's lookupField, then we need to update the isInputField value of each outputField.
             * This will cause each output field to be enabled or disabled
             */
            lookupInputsChangeHandler: function() {

                this.collection.selectableLookupOutputFields.each(function(selectableOutputField) {
                    var isInputField = !_(this.collection.lookupInputs.findWhere({lookupField:selectableOutputField.get("lookupOutputFieldName")})
                                       ).isUndefined();
                    selectableOutputField.set("isInputField", isInputField);
                    // If we are an inputField, unselect the outputField
                    if (isInputField)
                        selectableOutputField.set("selected", false);
                }, this);
            },

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

                // Map the lookup tables into objects we can pass into a SyntheticSelect
                var lookupNames = this.collection.transformsLookups.map(
                                        function(transformsLookup) {
                                            var lookupName = transformsLookup.entry.get("name");
                                            return {label:lookupName, value:lookupName, id:transformsLookup.get("id")};
                                        });

                // TODO [JCS] Figure out how we want the fields sorted
                var fieldNames = _(this.model.objectModel.getAllowedInputFields()).map(function(field) {
                                            return {label: field.displayName, value:field.fieldName};
                                        }
                );

                this.collection.selectableLookupOutputFields = new Backbone.Collection(undefined, {model:SelectableLookupOutputField});
                this.collection.lookupInputs = new Backbone.Collection();
                this.collection.lookupFields = new Backbone.Collection();

                // TODO [JCS] If lookupNames or fieldNames is empty, don't allow any adding and show an error message

                if (this.operation == "add")
                {
                    var calcAttributes = {calculationType: "Lookup",
                                          //lookupName: lookupNames[0].value,
                                          calculationID: ""};
                    // Create a new Calculation model
                    this.model.calculation = this.model.objectModel.createCalculation(calcAttributes);
//                    this.addInputFieldHandler(); // Add a lookup input
                }
                else
                {
                    this.model.calculation = this.model.objectModel.getCalculation(this.calculationID);

                    if (_(this.model.calculation).isUndefined()) {
                        this.addCalculationError(this.calculationID);
                        return;
                    }
                }

                this.collection.lookupInputs.on("add remove reset change", this.lookupInputsChangeHandler, this);

                // TODO [JCS] Figure a way to divorce label from error message decorator
                if(lookupNames.length > 0) {
                    this.selectLookupName = new SyntheticSelectControl({model: this.model.calculation,
                        modelAttribute: "lookupName",
                        items: lookupNames,
                        prompt: _("Select...").t(),
                        toggleClassName: 'btn'});

                    this.selectLookupName.on("change", this.lookupNameChangeHandler, this);

                    this.children.selectLookupName = new ControlGroup({label: "", controls: this.selectLookupName});
                }

                this.children.inputFields = new LookupInputFieldsView({collection: {
                                                                           lookupFields: this.collection.lookupFields,
                                                                           lookupInputs: this.collection.lookupInputs},
                                                                       fieldNames: fieldNames,
                                                                       flashMessagesHelper:options.flashMessagesHelper});
                this.children.inputFields.on("action:addInputField", this.addInputFieldHandler, this);
                this.children.inputFields.on("action:removeInputField", this.removeInputFieldHandler, this);

                this.children.outputFields = new LookupOutputFieldsView({collection:this.collection.selectableLookupOutputFields});

                this.buildInputAndOutputViews(false);
                this.flashMessagesHelper.register(this.model.calculation);
            },

            /**
             * Called by both save and preview to perform validation on the models
             * @return {boolean}
             */
            performLocalValidation: function() {
                var isValid = this.model.calculation.set({}, {validate:true});
                var isFieldValid = true;
                var newLookupInputs = [];

                // Clear the lookupInputs
                this.model.calculation.lookupInputs.reset([], {silent:true});

                // Clear all duplicate lookup errors
                this.flashMessagesHelper.removeGeneralMessage(this.DUPLICATE_LOOKUPINPUT_ID);

                this.collection.lookupInputs.each(function(lookupInput) {
                    var lookupField = lookupInput.get("lookupField");

                    // Check if input already exists in the calculation. If so, then throw an error
                    var existingLookupInput = this.model.calculation.getLookupInput(lookupField);

                    if (existingLookupInput) {
                        this.flashMessagesHelper.addGeneralMessage(this.DUPLICATE_LOOKUPINPUT_ID,
                            {type: splunkDUtils.ERROR,
                                html: splunkUtils.sprintf(_('The Input "%s" can not be used for multiple input rows.').t(), lookupField)});
                        isValid = false;
                    } else {
                        this.model.calculation.addLookupInput({lookupField:lookupField, inputField:lookupInput.get("inputField")});
                    }
                }, this);
                
                // Validate there is at least one lookup input
                if (this.model.calculation.lookupInputs.length == 0) {
                    this.flashMessagesHelper.addGeneralMessage(this.MISSING_LOOKUPINPUT_ID,
                        {type: splunkDUtils.ERROR,
                            html: _("Specify at least one Input Field.").t()});
                    isValid = false;
                } else {
                    this.flashMessagesHelper.removeGeneralMessage(this.MISSING_LOOKUPINPUT_ID);
                }

                // Validate each lookupInput
                this.model.calculation.withEachLookupInput(function(lookupInput) {
                    isValid = lookupInput.set({}, {validate:true}) && isValid;
                }, this);

                // Validate the selectable output fields
                this.collection.selectableLookupOutputFields.each(function(field) {
                    // Find out if we have an existing output field. If so, then edit it. Otherwise, add a new one
                    var outputField = this.model.calculation.getFieldByLookup(field.get("lookupOutputFieldName"));
                    field.clearErrors();
                    this.flashMessagesHelper.unregister(field);

                    if (field.get("selected")) {

                        this.flashMessagesHelper.register(field);
                        isFieldValid = field.set({}, {validate:true});
                        isValid = isFieldValid && isValid;

                        if (isFieldValid) {
                            if (outputField) {
                                outputField.set({fieldName: field.get("fieldName"),
                                    displayName: field.get("displayName"),
                                    type: field.get("type"),
                                    hidden: field.get("hidden"),
                                    required: field.get("required"),
                                    lookupOutputFieldName: field.get("lookupOutputFieldName")});
                            } else {
                                this.model.calculation.addField({fieldName: field.get("fieldName"),
                                                                 displayName: field.get("displayName"),
                                                                 type: field.get("type"),
                                                                 hidden: field.get("hidden"),
                                                                 required: field.get("required"),
                                                                 lookupOutputFieldName: field.get("lookupOutputFieldName")});
                            }
                        } else {
                            this.model.calculation.removeFieldByLookup(field.get("lookupOutputFieldName"));
                        }
                    } else {
                        this.model.calculation.removeFieldByLookup(field.get("lookupOutputFieldName"));
                    }
                }, this);

                // Validate we have at least one output field
                if (this.model.calculation.outputFields.length == 0) {
                    this.flashMessagesHelper.addGeneralMessage(this.MISSING_OUTPUTFIELD_ID,
                                                               {type: splunkDUtils.ERROR,
                                                                html: _("Specify at least one Output Field.").t()});
                    isValid = false;
                } else {
                    this.flashMessagesHelper.removeGeneralMessage(this.MISSING_OUTPUTFIELD_ID);
                }

                // Validate each output field
                this.model.calculation.withEachField(function(field) {
                    isValid = field.set({}, {validate:true}) && isValid;
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

            toggleInputOutputVisibility: function() {
                if (this.showInputsAndOutputs) {
                    this.$(".input-container").show();
                    this.$(".output-container").show();
                } else {
                    this.$(".input-container").hide();
                    this.$(".output-container").hide();
                }
            },

            renderEditor: function($container) {
                var html = _(this.editorTemplate).template({
                    type: this.type,
                    operation: this.operation
                });
                $container.html(html);

                // lame hack to add classnames :(
                // $(this.children.selectLookupName.render().el).addClass('pull-left');

                var $lookupPlaceholder = this.$(".selectLookupName-placeholder");
                if(this.children.selectLookupName) {
                    $lookupPlaceholder.replaceWith(this.children.selectLookupName.render().el);
                }
                else {
                    $lookupPlaceholder.replaceWith(_(this.noLookupsTemplate).template({
                        manageLookupsHref: route.manager(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            this.model.application.get('app'),
                            'lookups'
                        )
                    }));
                }
//                this.$(".selectInputField-placeholder").replaceWith(this.children.selectInputField.render().el);
//                this.$(".inputLookupField-placeholder").replaceWith(this.children.inputLookupField.render().el);
                this.$(".input-fields-placeholder").replaceWith(this.children.inputFields.render().el);
                this.$(".output-fields-placeholder").replaceWith(this.children.outputFields.render().el);

                this.toggleInputOutputVisibility();
                return this;
            },
            editorTemplate: '\
                <div>\
                    <label class="control-label"><%- _("Lookup Table").t() %></label>\
                    <span class="selectLookupName-placeholder"/>\
                    <div class="input-container">\
                        <label class="control-label"><%- _("Input").t() %></label>\
                        <div class="lookup-controls">\
                            <span class="input-fields-placeholder"/>\
                        </div>\
                    </div>\
                </div>\
                <div class="output-container">\
                    <label class="control-label"><%- _("Output").t() %></label>\
                    <span class="output-fields-placeholder"/>\
                </div>\
            ',
            noLookupsTemplate: '\
                <div>\
                    <%- _("No compatible lookups found.").t() %>\
                    <a href="<%- manageLookupsHref %>"><%- _("Manage Lookups").t() %></a>\
                </div>\
            '
        });
    });
