/**
 * @author jszeto
 * @date 2/19/2013
 *
 * Subclass for adding or editing an Object Transaction
 *
 *  *  inputs:
 *      model
 *          objectModel {models/services/datamodel/private/Objects} - The object model being edited
 *          dataModel {models/services/datamodel/DataModel} - The data model that owns the object model
 *
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'views/data_model_editor/form_views/DataModelAddEditForm',
    'views/data_model_editor/form_components/SimpleTimePicker',
    'views/data_model_editor/form_components/SelectMultipleItems',
    'views/data_model_editor/form_components/SelectMultipleObjects',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/TextControl',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/delegates/PairedTextControls',
    'helpers/FlashMessagesHelper',
    'models/services/datamodel/DataModel',
    'collections/Base',
    'collections/services/datamodel/private/Fields',
    'util/datamodel/form_utils',
    'module'
],
    function(
        $,
        _,
        Backbone,
        DataModelAddEditForm,
        SimpleTimePicker,
        SelectMultipleItems,
        SelectMultipleObjects,
        ControlGroup,
        TextControl,
        SyntheticSelectControl,
        PairedTextControls,
        FlashMessagesHelper,
        DataModel,
        BaseCollection,
        FieldsCollection,
        dataModelFormUtils,
        module
        )
    {
        return DataModelAddEditForm.extend({
            className: 'view-add-edit-transaction',
            moduleId: module.id,

            /**
             * @constructor
             */
            initialize: function(options) {
                DataModelAddEditForm.prototype.initialize.call(this, options);

                this.type = options.type;

                if (this.operation == "add") {
                    // Create a new Object model with a temporary displayName.
                    var newObject = {objectName:"", displayName:"", parentName:"BaseTransaction"};
                    this.model.objectModel = this.model.dataModel.addObject(newObject);
                } else {
                    this.model.objectModel = this.model.dataModel.objectByName(this.objectName);
                }

                if (_(this.model.objectModel).isUndefined()) {
                    this.addObjectError(this.objectName);
                    return;
                }

                // Get the list of Objects that can be selected
                var flattenedHierarchy = this.model.dataModel.getFlattenedHierarchy();
                var parentOptions = _(flattenedHierarchy).map(function(object) {
                    var prefix = '';
                    _(object.depth).times(function() { prefix += '--'; });
                    return {
                        value: object.objectName,
                        label: prefix + object.displayName,
                        rootParent: object.rootParent
                    };
                });

                // Remove this Transaction from the parentOptions
                parentOptions = _(parentOptions).reject(function(object) {
                    return object.value == this.model.objectModel.get("objectName");
                }, this);

                // The Collections to pass to the selectTransactionFields view
                this.fieldCollection = {};
                this.fieldCollection.itemsCollection = new BaseCollection();
                // Maps to groupByFields
                this.fieldCollection.selectedItemsCollection = new BaseCollection();

                // The Collections to pass to the selectTransactionObjects view
                this.objectCollection = {};
                this.objectCollection.itemsCollection = new Backbone.Collection(parentOptions);
                // Maps to objectsToGroup
                this.objectCollection.selectedItemsCollection = new Backbone.Collection();
                this.objectCollection.selectedItemsCollection.on("add remove reset", this.updateFieldsCollections, this);

                // Initialize the collections
                this.updateFieldsCollections();

                if (this.operation == "edit") {
                    // Map objectsToGroup to objectCollection.selectedItemsCollection (value, label, rootParent)
                    var objectsToGroup = this.model.objectModel.get("objectsToGroup");
                    if (objectsToGroup.length > 0) {
                        var selectedObjects = _(this.model.objectModel.get("objectsToGroup")).map(function(objectName) {
                            // Get the Object model for the displayName and rootParent
                            var selectedObject = this.model.dataModel.objectByName(objectName);
                            return {value: objectName,
                                label: selectedObject.get("displayName"),
                                rootParent: selectedObject.get("rootParent")};
                        }, this);

                        this.objectCollection.selectedItemsCollection.reset(selectedObjects);

                        // Use the first objectsToGroup for the fields since the selectedFields are in the intersection
                        // of objectsToGroups' fields
                        var selectableFields = this.model.dataModel.objectByName(objectsToGroup[0]).getAllSearchFields();
                        var groupByFields = this.model.objectModel.get("groupByFields");

                        // Map groupByFields to this.fieldCollection.selectedItemsCollection
                        if (groupByFields.length > 0) {
                            var selectedFields = [];
                            _(groupByFields).each(function(fieldName) {
                                // Make sure the field is a selectable field
                                var result = _(selectableFields).find(function(field) {
                                    return field.fieldName == fieldName;
                                }, this);

                                if (result)
                                    selectedFields.push(result);
                            }, this);

                            this.fieldCollection.selectedItemsCollection.reset(selectedFields);
                        }
                    }
                }

                this.textDisplayNameControl = new TextControl({modelAttribute: 'displayName',
                    model: this.model.objectModel,
                    save: false});

                this.textObjectNameControl = new TextControl({modelAttribute: 'objectName',
                    model: this.model.objectModel,
                    save: false});

                // Delegate that copies the input from the source to the destination TextControl
                this.pairedTextControls = new PairedTextControls({sourceDelegate: this.textDisplayNameControl,
                    destDelegate: this.textObjectNameControl,
                    transformFunction: dataModelFormUtils.normalizeForID});

                this.children.textDisplayName = new ControlGroup({
                    controls : this.textDisplayNameControl,
                    label: _('Dataset Name').t()
                });

                this.children.textObjectName = new ControlGroup({
                    controls : this.textObjectNameControl,
                    label: _('Dataset ID').t(),
                    tooltip: _('The ID is used in the data model search command. Cannot be changed later.').t(),
                    help: _('Can only contain letters, numbers and underscores.').t()
                });

                // Multi-select control that maps to objectsToGroup
                this.children.selectTransactionObjects = new SelectMultipleObjects({collection: this.objectCollection,
                                                                                    className: "selectTransactionObjects"});
                // Multi-select control that maps to groupByFields
                this.children.selectTransactionFields = new SelectMultipleItems({collection:this.fieldCollection,
                                                                                 valueAttribute: "fieldName",
                                                                                 labelAttribute: "displayName",
                                                                                 allowSorting: true,
                                                                                 className: "selectTransactionFields"});
                this.children.selectMaxPause = new SimpleTimePicker({modelAttribute: "transactionMaxPause",
                                                                     model: this.model.objectModel,
                                                                     save: false});
                this.children.selectMaxSpan = new SimpleTimePicker({modelAttribute: "transactionMaxTimeSpan",
                                                                    model: this.model.objectModel,
                                                                    save: false});

                this.flashMessagesHelper.register(this.model.objectModel);
            },

            /**
             * Called when the objectCollection.selectedItemCollection has changed. It calculates the selectable
             * fields for the fieldsCollection.itemCollection. The selectable fields is the intersection of the fields
             * of each objectsToGroup Object
             */
            updateFieldsCollections: function() {
                var fieldNamesArray = [];
                var fieldsArray = [];

                var intersectingFields = [];
                var fields = [];

                // Starting with the fields, we pluck out just the fieldNames, use underscore's intersection function,
                // and then map the fieldNames back to the fields. Otherwise, we'd have to write our own intersection
                // function.
                this.objectCollection.selectedItemsCollection.each(function(objectSimplified) {
                    var baseObject = this.model.dataModel.objectByName(objectSimplified.get("value"));
                    var fields = baseObject.getAllSearchFields();
                    // Setup two arrays, one with all of the fields and one with just the key names
                    fieldsArray.push(fields);
                    fieldNamesArray.push(_(fields).pluck("fieldName"));
                }, this);

                if (fieldNamesArray.length > 1) {
                    // Get the intersection of field names for all of the selected objects
                    intersectingFields = _.intersection.apply(this, fieldNamesArray);

                    // Map the intersecting field names back to Field objects
                    fields = _(intersectingFields).map(function(fieldName) {
                        return _(fieldsArray[0]).find(function(field) {
                            return field.fieldName == fieldName;
                        }, this);
                    }, this);
                } else if (fieldNamesArray.length == 1) {
                    fields = fieldsArray[0];
                }

                // Whenever the selected objects change, clear the selected fields
                this.fieldCollection.selectedItemsCollection.reset();
                // Specify the selectable fields
                this.fieldCollection.itemsCollection.reset(fields);
            },

            /**
             * Called by both save and preview to perform validation on the models
             * @return {boolean}
             */
            performLocalValidation: function() {
                var attrs = {};

                attrs.objectsToGroup = this.objectCollection.selectedItemsCollection.pluck("value");
                var selectedFields = this.fieldCollection.selectedItemsCollection.pluck("fieldName");

                if (this.operation == "add") {
                    attrs.objectName =  this.model.objectModel.get("objectName");
                }

                if (selectedFields.length > 0) {
                    attrs.groupByFields = selectedFields;
                } else {
                    attrs.groupByFields = "";
                }

                attrs.displayName = this.model.objectModel.get("displayName");

                return this.model.objectModel.set(attrs, {validate:true});
            },

            /**
             * Tells the view to provisionally save the inputs into the dataModel.
             */
            _handlePreview: function() {
                return this.model.objectModel.get("objectName");
            },

            renderEditor: function($container) {
                var html = _(this.editorTemplate).template({});
                $container.html(html);

                this.$(".select-object-placeholder").replaceWith(this.children.selectTransactionObjects.render().el);
                this.$(".select-transaction-fields-placeholder").replaceWith(this.children.selectTransactionFields.render().el);

                if (this.operation == "add") {
                    this.$(".display-name-placeholder").replaceWith(this.children.textDisplayName.render().el);
                    this.$(".object-name-placeholder").replaceWith(this.children.textObjectName.render().el);
                }

                this.$(".max-pause-value-placeholder").replaceWith(this.children.selectMaxPause.render().el);
                this.$(".max-span-value-placeholder").replaceWith(this.children.selectMaxSpan.render().el);

                return this;
            },

            editorTemplate: '\
                <div class="steps-wrapper">\
                 <p>\
                    <%- _("You must specify at least one of the optional fields.").t() %>\
                </p>\
                    <form action="" method="get">\
                        <div class="object-wrapper pull-left">\
                            <div class="display-name-placeholder"></div>\
                            <div class="object-name-placeholder"></div>\
                        </div>\
                        <div class="group-wrapper pull-left">\
                            <label class="control-label"><%- _("Group Datasets").t() %></label>\
                            <div class="select-object-placeholder"></div>\
                            <label class="list-header"><%- _("Group by").t() %></label>\
                            <div class="select-transaction-fields-placeholder"></div>\
                        </div>\
                        <div class="durations-wrapper pull-left">\
                            <label class="control-label"><%- _("Duration").t() %></label>\
                            <div class="duration-option pull-left">\
                                <%- _("Max Pause:").t() %>\
                                <div class="max-pause-value-placeholder"></div>\
                            </div>\
                            <div class="duration-option pull-left">\
                                <%- _("Max Span:").t() %>\
                                <div class="max-span-value-placeholder"></div>\
                            </div>\
                         </div>\
                    </form>\
                </div>\
            '
        });

    });
