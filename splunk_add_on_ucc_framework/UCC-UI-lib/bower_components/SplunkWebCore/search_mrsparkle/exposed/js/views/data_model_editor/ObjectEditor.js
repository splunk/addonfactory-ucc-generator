/**
 * @author sfishel
 * @author jszeto
 *
 * View for editing the attributes of a data model object.
 *
 * Display a list of constraints, fields (inherited/own), and calculations.  With calls to action for editing.
 *
 * The HTML template is stored in views/data_model_editor/ObjectEditor.html
 *
 * Child Views:
 *
 *  addAttributeButton - DropDownMenu control used to select an attribute to add to the object
 *
 *  renameDialog - Shared dialog that renames an object, attribute or calculation field
 *
 *  viewValuesDialog - Shared dialog that shows some search results for an attribute
 *
 *  addExtractedFieldsDialog - Dialog that displays the possible auto-extracted fields
 *
 * Inputs:
 * options {Object} {
 *     model: {
 *         dataModel {models/services/datamodel/DataModel}
 *         application {models/Application}
 *         objectModel {models/services/datamodel/private/Object} - optional Object model. Can be set using this.setModel
 *     }
 *     collection: {
 *         apps {collections/services/AppLocals}
 *     }
 *  }
 *
 *  @fires ObjectEditor#action:editObject
 *  @fires ObjectEditor#action:editCalculation
 *  @fires ObjectEditor#action:addCalculation
 *  @fires ObjectEditor#action:removeObject
 *  @fires ObjectEditor#action:saveModel
 *
 */

define([
            'jquery',
            'underscore',
            'backbone',
            'views/Base',
            'views/shared/DropDownMenu',
            'views/shared/controls/SyntheticCheckboxControl',
            'views/shared/controls/LabelControl',
            'views/shared/dialogs/TextInputDialog',
            'views/shared/dialogs/TextDialog',
            'views/shared/datamodel/dialogs/ViewValuesDialog',
            'views/data_model_editor/form_components/FieldsHash',
            'views/data_model_editor/form_views/AddExtractedFieldsDialog',
            'util/datamodel/field_icon_utils',
            'models/services/datamodel/DataModel',
            'models/services/datamodel/private/Object',
            'jquery.ui.sortable',
            'contrib/text!views/data_model_editor/ObjectEditor.html',
            'uri/route',
            'module',
            'util/console',
            'splunk.util',
            './ObjectEditor.pcss'

       ],
        function(
            $,
            _,
            Backbone,
            BaseView,
            DropDownMenu,
            SyntheticCheckboxControl,
            LabelControl,
            TextInputDialog,
            TextDialog,
            ViewValuesDialog,
            FieldsHash,
            AddExtractedFieldsDialog,
            fieldIconUtils,
            DataModel,
            ObjectModel,
            JQSortable,
            ObjectEditorTemplate,
            route,
            module,
            console,
            splunkUtils,
            css
        )
{
    return BaseView.extend({

        className: 'data-model-object-editor',
        moduleId: module.id,
        template: ObjectEditorTemplate,

        events: {
            ///////////////////////
            //  Object Actions
            ///////////////////////
            'click .rename-object-button': function(e) {
                e.preventDefault();
                this.showRenameDialog("object",this.model.objectModel.get("displayName"));
            },
            'click .delete-object-button': function(e) {
                e.preventDefault();
                this.showDeleteDialog(this.model.objectModel.get("displayName"));
            },
            ///////////////////////
            //  Constraint Actions
            ///////////////////////
            'click .edit-constraint-button': function(e) {
                e.preventDefault();

                var parentName = this.model.objectModel.get("parentName");
                var type = "child";

                if (parentName == DataModel.BASE_TRANSACTION)
                    type = "transaction";
                else if (parentName == DataModel.BASE_SEARCH)
                    type = "search";
                else if (parentName == DataModel.BASE_EVENT)
                    type = "event";

                /**
                 * Edit an existing object
                 *
                 * @event ObjectEditor#action:editObject
                 * @param {string} - object type (event/child/transaction/search)
                 * @param {string} - parent object's name
                 * @param {string} - object's name
                 */
                this.trigger("action:editObject", type, parentName, this.model.objectModel.get("objectName"));
           },


            ///////////////////////
            //  Inherited Actions
            ///////////////////////
            'click .override-attribute-button': function(e) {
                e.preventDefault();
                /**
                 * Edit the hidden/required overrides for an inherited attribute
                 *
                 * @event ObjectEditor#action:overrideInherited
                 * @param {string} - name of the inherited attribute
                 */
                this.trigger('action:overrideInherited', this.resolveAttributeName(e.currentTarget),this.resolveCalculationId(e.currentTarget));
            },

            ///////////////////////
            //  Attribute Actions
            ///////////////////////
            'click .edit-attribute-button': function(e) {
                e.preventDefault();
                /**
                 * Edit an existing calculation
                 *
                 * @event ObjectEditor#action:editCalculation
                 * @param {string} - ID of the calculation
                 */
                this.trigger('action:editAttribute', this.resolveAttributeName(e.currentTarget));
            },
            ///////////////////////
            //  Calculation Actions
            ///////////////////////
            'click .edit-calculation-button': function(e) {
                //console.log("Edit Calculation button clicked");
                e.preventDefault();
                /**
                 * Edit an existing calculation
                 *
                 * @event ObjectEditor#action:editCalculation
                 * @param {string} - ID of the calculation
                 */
                this.trigger('action:editCalculation', this.resolveCalculationId(e.currentTarget));
            }
        },

        ////////////////////////////////////////
        // Event Handlers
        ////////////////////////////////////////

        /**
         * Listen for a itemClicked event from the Add Field dropdown menu
         *
         * @param itemData {Object} value of the clicked item
         */
        addAttributeButtonClickHandler: function(itemData) {
            if (itemData == "autoExtract") {
                var parentName = this.model.objectModel.get("parentName");
                if (parentName == DataModel.BASE_EVENT ||
                    parentName == DataModel.BASE_SEARCH) {
                    this.showAddExtractedFieldsDialog();
                }
            } else {
                /**
                 * Add a new calculation
                 *
                 * @event ObjectEditor#action:addCalculation
                 * @param {string} - calculation type (Eval/GeoIP/Rex/Lookup)
                 * @param {string} - display name TODO [JCS] Can we remove this?
                 */
                this.trigger('action:addCalculation', itemData, this.model.objectModel.get('displayName'));
            }
        },

        bulkEditButtonClickHandler: function(item) {
            // Handle bulk edit menu
            switch (item) {
                case "optional":
                    this.bulkEdit("required",false);
                    break;
                case "required":
                    this.bulkEdit("required",true);
                    break;
                case "hidden":
                    this.bulkEdit("hidden",true);
                    break;
                case "shown":
                    this.bulkEdit("hidden",false);
                    break;
                default:
                    this.bulkEdit("type",item);
                    break;
            }
        },

        /**
         * Edit all of the selectedFields
         *
         * @param propertyName {string} The name of the property to edit
         * @param value {object} The value of the property
         */
        bulkEdit: function(propertyName, value) {
            // Iterate over the selectedFields, find the associated Field model and set the propertyName to the value
            var isValid = true;
            if (this._registeredFields) {
                _(this._registeredFields).each(function(field) {
                    this.options.flashMessagesView.unregister(field);
                }, this);
            }

            this._registeredFields = [];

            this.selectedFields.eachField(function(field) {
                this.options.flashMessagesView.register(field);
                this._registeredFields.push(field);
                isValid = field.set(propertyName, value, {validate:true}) && isValid;
            }, this);

            if (isValid) {
                this.saveModel();
            }
        },

        /**
         * Show a delete dialog given a type and the name of that type
         *
         * @param {string} name - name of the object
         */
        showDeleteDialog: function(name) {
            this.children.deleteDialog = new TextDialog({id: "modal_delete"});

            this.children.deleteDialog.settings.set("primaryButtonLabel",_("Delete").t());
            this.children.deleteDialog.settings.set("cancelButtonLabel",_("Cancel").t());
            this.children.deleteDialog.on('click:primaryButton', this.deleteDialogDeleteHandler, this);
            this.children.deleteDialog.settings.set("titleLabel",_(_("Delete Dataset").t()).escape());

            var text = splunkUtils.sprintf(_("Are you sure you want to delete the dataset <em>%s</em> and all of its descendants?").t(), _(name).escape());
            this.children.deleteDialog.setText(text);
            $("body").append(this.children.deleteDialog.render().el);
            this.children.deleteDialog.show();
        },
        /**
         * Handles when the user presses the Delete button in the delete dialog. Updates the model based on the
         * type of delete operation (object, attribute, of calculation).
         *
         * @param dialog
         */
        deleteDialogDeleteHandler: function(dialog) {
            /**
             * Remove an Object
             *
             * @event ObjectEditor#action:removeObject
             * @param {models/services/datamodel/private/Object} - object to delete
             */
            this.trigger("action:removeObject", this.model.objectModel);
            this.saveModel();
        },

        /**
         * Show a rename dialog given a type and the name of that type
         * TODO [JCS] Remove unused parameters
         */
        showRenameDialog: function(type, name, fieldName) {
            this.children.renameDialog = new TextInputDialog({id: "modal_rename",
                                                              parent: this,
                                                              model: this.model.objectModel,
                                                              modelAttribute: "displayName",
                                                              label:_("Name").t()});
            this.children.renameDialog.settings.set("titleLabel",_("Rename Dataset").t());
            this.children.renameDialog.on("click:cancelButton", this.renameDialogCancelHandler, this);
            this.children.renameDialog.on("click:closeButton", this.renameDialogCancelHandler, this);
            this.children.renameDialog.on("click:primaryButton", this.renameDialogChangeHandler, this);
            $("body").append(this.children.renameDialog.render().el);
            this.children.renameDialog.show();
        },
        /**
         * Called when the rename dialog cancel button is pressed
         * @param dialog
         */
        renameDialogCancelHandler: function(dialog) {
            this.children.renameDialog.remove();
        },
        /**
         * Called when the renameDialog sends us a change:textInputValue event
         *
         * @param {string} newValue - the new value from the text input dialog
         */
        renameDialogChangeHandler: function(newValue) {
            this.saveModel();
        },

        /**
         * Show the addExtractedFieldsDialog, set the model to the currently selected Object and kick off a new
         * search to get the field summary info
         */
        showAddExtractedFieldsDialog: function() {
            // Create a shared auto-extract dialog
            var dataModelClone = this.model.dataModel.clone();
            //var id = this.model.objectModel.id;
            var objectModelOfClone = dataModelClone.objectByName(this.model.objectModel.get("objectName"));

            this.children.addExtractedFieldsDialog =
                new AddExtractedFieldsDialog({id: "modal_addExtractedFields",
                    parent: this,
                    model: {objectModel: objectModelOfClone,
                            dataModel: dataModelClone,
                            application: this.model.application}});
            this.children.addExtractedFieldsDialog.on("action:fetchDataModel", function() {
                this.trigger('action:fetchDataModel');
            }, this);
            this.children.addExtractedFieldsDialog.on("hidden", this.destroyAddExtractFieldsDialog, this);

            this.children.addExtractedFieldsDialog.show();
        },

        /**
         * Destroy the editExtractedFieldDialog whenever it has been hidden.
         */
        destroyAddExtractFieldsDialog: function() {
            this.children.addExtractedFieldsDialog.remove();
            delete this.children.addExtractedFieldsDialog;
        },

        /**
         * Handler for changes to any of the field checkboxes.
         *
         * @param value {boolean} new value of the checkbox
         * @param oldValue {boolean} old value of the checkbox
         * @param checkbox - the checkbox itself
         */
        checkboxChangeHandler: function(value, oldValue, checkbox) {
            var attrName = this.resolveAttributeName(checkbox.el);
            var calcID = this.resolveCalculationId(checkbox.el);
            if (value) {
                this.selectedFields.addField(attrName, calcID);
            } else {
                this.selectedFields.removeField(attrName, calcID);
            }
        },

        /**
         * If the selectionType has changed, then we need to update the bulk edit dropdown
         */
        selectedFieldsChangeHandler: function() {
            this.children.bulkEditButton.setItems(this.getBulkEditItems());
        },

        ////////////////////////////////////////
        // Backbone.View Functions
        ////////////////////////////////////////

        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);

            options = options || {};

            // Backbone Views automatically assign the options.model to this.model. However, we need to add bindings,
            // so we pass this through our setModel function.
            if (options.model.objectModel)
            {
                this.setModel(options.model.objectModel);
            }

            // Create a property to listen for Checkbox change events
            this._checkboxListener = {};
            _.extend(this._checkboxListener, Backbone.Events);
        },

        render: function() {
            // If there is no objectModel, display a message
            if(!this.model.objectModel) {
                this.$el.html(_(this.emptyTemplate).template({}));
                return this;
            }

            if (this.children.addAttributeButton) {
                this.children.addAttributeButton.off();
                this.children.addAttributeButton.$el.detach();
            }

            var html = this.compiledTemplate({
                object: this.model.objectModel,
                getIcon: fieldIconUtils.fieldIconByType,
                getFieldFlags: this.getFieldFlags,
                getFieldHiddenIcon: fieldIconUtils.fieldHiddenIcon,
                getFieldRequiredIcon: fieldIconUtils.fieldRequiredIcon,
                getTimelineURL :_(this.getTimelineURL).bind(this),
                isEditable : !this.model.dataModel.isAccelerated()
            });
            this.$el.html(html);

            // Only non-accelerated Data Models can be edited.
            if (!this.model.dataModel.isAccelerated()) {
                // Create a subview to select an attribute to add
                var allowAutoExtracted = !(this.model.objectModel.isChildObject() ||
                    this.model.objectModel.get("parentName") == DataModel.BASE_TRANSACTION);

                this.children.addAttributeButton = new DropDownMenu({
                    className: '',
                    label:_("Add Field").t(),
                    items:[{label:_("Auto-Extracted").t(), value:"autoExtract", enabled:allowAutoExtracted},
                        {label:_("Eval Expression").t(), value:"Eval"},
                        {label:_("Lookup").t(), value:"Lookup"},
                        {label:_("Regular Expression").t(), value:"Rex"},
                        {label:_("Geo IP").t(), value:"GeoIP"}],
                    dropdownClassName: 'dropdown-menu-narrow'});

                this.children.addAttributeButton.on("itemClicked", this.addAttributeButtonClickHandler, this);
                this.$('.add-attribute-button-holder').append(this.children.addAttributeButton.render().el);

                if (typeof this.children.bulkEditButton !== 'undefined') {
                    this.children.bulkEditButton.off();
                    this.children.bulkEditButton.remove();
                }

                this.children.bulkEditButton = new DropDownMenu({
                className: '',
                label:_("Bulk Edit").t(),
                items: this.getBulkEditItems(),
                dropdownClassName: 'dropdown-menu-narrow'});

                this.children.bulkEditButton.on("itemClicked", this.bulkEditButtonClickHandler, this);
                this.$('.bulk-edit-button-holder').append(this.children.bulkEditButton.render().el);

            }

            this._checkboxListener.stopListening();
            this.$(".field-checkbox").each(_(function(index, element) {
                // Look up the fieldName and see if it is in the selectedFields array.
                // If so, then set the checkbox to true
                var fieldName = this.resolveAttributeName(element);
                var calcID = this.resolveCalculationId(element);
                var field = this.model.objectModel.getAnyField(fieldName, calcID);
                var displayName = field.get("displayName");
                var selected = this.selectedFields.hasField(fieldName, calcID);
                if ($(element).hasClass('uneditable')) {
                    var label = new LabelControl({ defaultValue: displayName });
                    $(element).append(label.render().el);
                } else {
                    var checkbox = new SyntheticCheckboxControl({ defaultValue: selected, label: displayName });
                    $(element).append(checkbox.render().el);
                    this._checkboxListener.listenTo(checkbox, "change", _.bind(this.checkboxChangeHandler, this));
                }
            }).bind(this));

            this.configureSortable();

            return this;
        },

        /**
         * Takes an Object model. Removes bindings from the old model and assigns them to the new one.
         *
         * @param {models/services/datamodel/private/Object} model - the Object model to edit
         */
        setModel: function(model) {

            // Remove binding from the previous model
            if (this.model.objectModel) {
                this.model.objectModel.off(null, null, this);
                this.model.objectModel.associatedOff(null, null, this);
            }

            if (model && !(model instanceof ObjectModel))
            {
                throw new Error("ObjectEditor model must be an Object model");
            }

            this.model.objectModel = model;

            if (this.selectedFields) {
                this.selectedFields.clear();
            } else {
                this.selectedFields = new FieldsHash();
                this.selectedFields.on("change:selectionType", this.selectedFieldsChangeHandler, this);
            }
            this.selectedFields.setModel(model);

            if (this.model.objectModel)
            {
                this.model.objectModel.on('change', this.changeHandler, this);
                this.model.objectModel.on('associatedChange', this.associatedChangeHandler, this);
                this.model.objectModel.on('reset', this.resetHandler, this);
            }
            this.debouncedRender();
        },

        // TODO [JCS] We can collapse the change/associatedChange/reset handlers into one. This was split for debugging
        changeHandler: function(model, options) {
            this.debouncedRender();
        },

        associatedChangeHandler: function(model, options) {
            this.debouncedRender();
        },

        resetHandler: function(model, options) {
            this.debouncedRender();
        },

        ////////////////////////////////////////
        // Helper Functions
        ////////////////////////////////////////

        saveModel: function() {
            /**
             * Save the Data Model
             *
             * @event ObjectEditor#action:saveModel
             */
            this.trigger("action:saveModel", this.model.objectModel);
        },

        /**
         * Sets up the configuration options for the jQuery UI sortable plugin used to manage the drag-and-drop resorting
         * of the objects calculations.
         *
         * For documentation, see:  http://jqueryui.com/sortable/ or http://api.jqueryui.com/sortable/
         */
        configureSortable: function() {
            var that = this;
            this.$('.calculations').sortable({
                items: '.calculation',
                placeholder: 'ui-sortabale-placeholder',
                forcePlaceholderSize: true,
                opacity: 0.7,
                tolerance: 'pointer',
                stop: function(event, ui) {
                    that.onSortStop();
                }
            });
        },

        /**
         * Called when the user has dropped the target calculation. Updates the Object model with the calculation order
         * in the UI. Then saves the model.
         */
        onSortStop: function() {
            var newOrder = _(this.$('.calculation')).map(function(elem) {
                return this.resolveCalculationId(elem);
            }, this);
            this.model.objectModel.reOrderCalculations(newOrder);
            this.saveModel();
        },

        /**
         * Helper function to get the Field name of a DOM element
         * @param {DOM element} elem
         * @return {string} the Field.fieldName associated with the DOM element
         */
        resolveAttributeName: function(elem) {
            return $(elem).closest('.attribute').attr('data-attribute-name');
        },
        /**
         * Helper function to get the Calculation ID of a DOM element. Used for an Object's own calculations.
         * @param {DOM element} elem
         * @return {string} the Calculation.calculationID associated with the DOM element
         */
        resolveCalculationId: function(elem) {
            return $(elem).closest('.calculation,.inheritedAttribute').attr('data-calc-id');
        },
        /**
         * Helper function called in the HTML template to generate the URL link for the View Events button
         * @param {string} lineage - The Object's objectName or lineage
         * @param {string} type - Either (search|transaction) which determines the type of search string to use
         * @return {string} URL for viewing events for the given lineage
         */
        getTimelineURL: function(lineage, type) {
            if (this.model) {
                var objectModel = this.model.dataModel.objectByLineage(lineage);

                if (objectModel) {
                    var searchString = type == "search" ? objectModel.get("baseSearch") : objectModel.get("previewSearch");

                    return route.search(this.model.application.get("root"),
                                          this.model.application.get("locale"),
                                          this.model.application.get("app"),
                                          { data: {q: searchString + " | head 1000"}});
                }
            }

            return "#";
        },

        /**
         * Helper function called in the HTML template to
         * @param field
         * @return {String}
         */
        getFieldFlags: function(field) {
            if (field.hidden && field.required)
                return "(required, hidden)";
            else if (field.required)
                return "(required)";
            else if (field.hidden)
                return "(hidden)";

            return "";
        },

        /**
         * Returns the array used to populate the Bulk Edit dropdown menu
         */
        getBulkEditItems: function() {
            // If we have any inherited fields, then we can't change type. If we have no selected fields, disable all items
            var menuItems;

            if (this.selectedFields.selectionType == FieldsHash.NONE)  {
                menuItems =
                    [[
                        {label:_("Optional").t(), value:"optional", enabled:false},
                        {label:_("Required").t(), value:"required", enabled:false}
                    ],
                    [
                        {label:_("Hidden").t(), value:"hidden", enabled:false},
                        {label: _("Shown").t(), value:"shown", enabled:false}
                    ],
                    [
                        {label:_("Boolean").t(), value:"boolean", enabled:false},
                        {label:_("IPv4").t(), value:"ipv4", enabled:false},
                        {label:_("Number").t(), value:"number", enabled:false},
                        {label:_("String").t(), value:"string", enabled:false}
                    ]];
            } else if (this.selectedFields.selectionType == FieldsHash.ONLY_NON_INHERITED) {
                menuItems =
                    [[
                        {label:_("Optional").t(), value:"optional"},
                        {label:_("Required").t(), value:"required"}
                    ],
                    [
                        {label:_("Hidden").t(), value:"hidden"},
                        {label: _("Shown").t(), value:"shown"}
                    ],
                    [
                        {label:_("Boolean").t(), value:"boolean"},
                        {label:_("IPv4").t(), value:"ipv4"},
                        {label:_("Number").t(), value:"number"},
                        {label:_("String").t(), value:"string"}
                    ]];
            } else {
                menuItems =
                    [[
                        {label:_("Optional").t(), value:"optional"},
                        {label:_("Required").t(), value:"required"}
                    ],
                    [
                        {label:_("Hidden").t(), value:"hidden"},
                        {label: _("Shown").t(), value:"shown"}
                    ],
                    [
                        {label:_("Boolean").t(), value:"boolean", enabled:false},
                        {label:_("IPv4").t(), value:"ipv4", enabled:false},
                        {label:_("Number").t(), value:"number", enabled:false},
                        {label:_("String").t(), value:"string", enabled:false}
                    ]];
            }
            return menuItems;
        },


        emptyTemplate: '<div class="alert alert-info">\
                            <i class="icon-alert"></i>\
                            <%- _("To get started, add a dataset using the menu to the left.").t() %>\
                        </div>'
    });

});
