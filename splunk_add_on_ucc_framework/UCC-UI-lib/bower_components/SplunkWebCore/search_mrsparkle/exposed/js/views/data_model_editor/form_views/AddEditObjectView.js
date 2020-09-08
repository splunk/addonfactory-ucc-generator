/**
 * @author jszeto
 * @date 11/9/12
 *
 * Subclass for adding or editing an Object
 *
 *  *  inputs:
 *      model
 *          objectModel {models/services/datamodel/private/Objects} - The object model being edited
 *          dataModel {models/services/datamodel/DataModel} - The data model that owns the object model
 */
define([
    'jquery',
    'underscore',
    'views/data_model_editor/form_views/DataModelAddEditForm',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/TextControl',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/delegates/PairedTextControls',
    'helpers/FlashMessagesHelper',
    'splunk.util',
    'util/splunkd_utils',
    'util/datamodel/form_utils',
    'module'
],
    function(
        $,
        _,
        DataModelAddEditForm,
        ControlGroup,
        TextControl,
        SyntheticSelectControl,
        PairedTextControls,
        FlashMessagesHelper,
        splunkUtils,
        splunkDUtils,
        dataModelFormUtils,
        module
        )
    {
        return DataModelAddEditForm.extend({
            className: 'view-add-edit-object',
            moduleId: module.id,

            /**
             * @constructor
             * @param options {Object}
             *            type {String} [child|event] Whether the object inherits from BaseEvent (event) or another Object (child)
             */

            initialize: function(options) {
                DataModelAddEditForm.prototype.initialize.call(this, options);

                this.type = options.type;


                if (this.type == "child" && this.model.dataModel.entry.content.objects.length == 0) {
                    this.flashMessagesHelper.addGeneralMessage(this.cid + "_missingObject",
                        { type: splunkDUtils.ERROR,
                            html: _(this.errorTemplate).template({})});
                    this.disableSave();
                    return;
                }

                if (this.operation == "add")
                {
                    // Create a new Object model with a temporary displayName.
                    var newObject = {objectName:"", displayName:""};
                    if (this.parentObjectName != "")
                        newObject.parentName = this.parentObjectName;
                    this.model.objectModel = this.model.dataModel.addObject(newObject);

                    if (_.isUndefined(this.model.objectModel))
                        throw "AddEditObjectView failed to create a new Object";
                }
                else
                {
                    this.model.objectModel = this.model.dataModel.objectByName(this.objectName);
                }

                if (_(this.model.objectModel).isUndefined()) {
                    this.addObjectError(this.objectName);
                    return;
                }

                // Explicitly don't save the control values to the model. We will put these values
                // into the model in applyControlsToModel
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

                // TextInput Control for object name
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

                // Generate a SyntheticSelect to select the parent Object
                if (this.type == "child") {
                    var flattenedHierarchy = this.model.dataModel.getFlattenedHierarchy();
                    var parentOptions = [];
                    _(flattenedHierarchy).each(function(object) {
                        var prefix = '';
                        if (this.model.objectModel.get("objectName") != object.objectName) {
                            _(object.depth).times(function() { prefix += '--'; });
                            parentOptions.push({value: object.objectName,
                                label: prefix + object.displayName});
                        }
                    }, this);

                    // TODO [JCS] Should we set save=false since we are grabbing the value in applyControlsToModel?
                    this.selectParentObjectControl = new SyntheticSelectControl({model:this.model.objectModel,
                        modelAttribute:"parentName",
                        toggleClassName: 'btn',
                        items: parentOptions});

                    this.children.selectParentObject = new ControlGroup({label: _("Inherit From").t(),
                                                                         controls: this.selectParentObjectControl});
                }

                this.flashMessagesHelper.register(this.model.objectModel);
            },

            /**
             * Called by both save and preview to perform validation on the models
             * @return {boolean}
             */
            performLocalValidation: function() {
                var constraintsValue = splunkUtils.trim(this.$('textarea[name="object-constraints"]').val());
                var objectName = this.model.objectModel.get("objectName");
                var attrs = {};

                if (this.operation == "add") {
                    attrs = {objectName: objectName};
                }

                attrs.constraints = [{search:constraintsValue, owner: objectName}];
                attrs.displayName = this.model.objectModel.get("displayName");

                if (this.type == "child") {
                    attrs.parentName = this.selectParentObjectControl.getValue();
                }

                return this.model.objectModel.set(attrs, {validate:true});
            },

            transformFunction: function(input) {
                var results = input.replace(/\s/g, "_");
                results = results.replace(/\W/g, "");
                return results;
            },

            /**
             * Tells the view to provisionally save the inputs into the dataModel.
             */
            _handlePreview: function() {
                return this.model.objectModel.get("objectName");
            },

            renderEditor: function($container) {
                var html = _(this.editorTemplate).template({
                    type: this.type,
                    operation: this.operation
                });
                $container.html(html);

                if (this.type == "child") {
                    this.$(".parent-name-placeholder").append(this.children.selectParentObject.render().el);
                }

                if (this.operation == "edit") {
                    var constraintSearch = "";
                    var constraint = this.model.objectModel.getOwnConstraint();
                    if (constraint)
                        constraintSearch = constraint.search;
                    this.$('textArea[name="object-constraints"]').val(constraintSearch);
                }
                else if (this.operation == "add") {
                    this.$(".display-name-placeholder").append(this.children.textDisplayName.render().el);
                    this.$(".object-name-placeholder").append(this.children.textObjectName.render().el);
                }
            },

            editorTemplate: '\
                <div class="steps-wrapper">\
                    <form>\
                        <div class="object-wrapper">\
                            <div class="display-name-placeholder"></div>\
                            <div class="object-name-placeholder"></div>\
                            <div class="parent-name-placeholder"></div>\
                        </div>\
                        <div class="constraints-wrapper">\
                            <label><%- (type == "child") ? _("Additional Constraints").t() : _("Constraints").t() %></label>\
                            <textarea name="object-constraints" class="object-constraints"></textarea>\
                            <span class="help-block"><%- _("Examples:").t() %><br/>\
                                <span class="example-text mono-space">\
                                    uri="*.php*" OR uri="*.py*" <br>\
                                    NOT (referer=null OR referer="-")\
                                </span>\
                            </span>\
                        </div>\
                    </form>\
                </div>\
            ',

            errorTemplate: '\
                    <div><%- _("To add a Child Dataset, the Data Model must have at least one Dataset.").t() %></div>\
            '
        });

    });
