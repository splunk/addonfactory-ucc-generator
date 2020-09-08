/**
 * @author jszeto
 * @date 11/21/12
 *
 *  *  inputs:
 *      model
 *          calculation {models/services/datamodel/private/RexCalculation} - The rex calculation to edit
 *          objectModel {models/services/datamodel/private/Objects} - The object model that owns the calculation model
 *          dataModel {models/services/datamodel/DataModel} - The data model that owns the object model
 *
 * A subview to add or edit a Rex Calculation.
 *
 */

define([
    'jquery',
    'underscore',
    'models/Base',
    'models/search/Job',
    'views/data_model_editor/form_views/DataModelAddEditForm',
    'views/shared/controls/ControlGroup',
    'views/data_model_editor/form_components/TrimmedTextareaControl',
    'views/data_model_editor/form_components/RexOutputFieldsView',
    'views/shared/dataenrichment/preview/RexPreviewViewStack',
    'views/shared/dataenrichment/preview/PreviewJobController',
    'uri/route',
    'util/splunkd_utils',
    'util/field_extractor_utils',
    'util/console',
    'splunk.util',
    'module'
],
    function(
        $,
        _,
        BaseModel,
        Job,
        DataModelAddEditForm,
        ControlGroup,
        TrimmedTextareaControl,
        RexOutputFieldsView,
        RexPreviewViewStack,
        PreviewJobController,
        route,
        splunkDUtils,
        fieldExtractorUtils,
        console,
        splunkUtils,
        module
        )
    {
        return DataModelAddEditForm.extend({
            moduleId: module.id,
            className: 'rex-form-view',
            MISSING_OUTPUTFIELD_ID: "MISSING_OUTPUTFIELD_ID",

            /**
             * @constructor
             * @param options {Object} {
                 }
             */
            initialize: function(options) {
                DataModelAddEditForm.prototype.initialize.call(this, options);

                this.model.objectModel = this.model.dataModel.objectByName(this.parentObjectName);
                if (_(this.model.objectModel).isUndefined()) {
                    this.addObjectError(this.parentObjectName); //// defined in DataModelAddEditForm -- parent
                    return;
                }

                // SyntheticSelect objects for input fields
                var fieldNames = _(this.model.objectModel.getAllowedInputFields()).map(function(field) {
                        return {label: field.displayName, value:field.fieldName};
                    }
                );

                // TODO [JCS] If fieldNames is empty, don't allow any adding and show an error message
                if (this.operation == "add")
                {
                    // Default inputField to the first field
                    var calcAttributes = {calculationType: "Rex",
                                          inputField: fieldNames[0].value,
                                          calculationID: "",
                                          expression:""};
                    // Create a new Calculation model
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

                // Select the input field
                this.children.selectField = new ControlGroup({label: _("Extract From").t(),
                                                              controlType: "SyntheticSelect",
                                                              controlOptions:
                                                                    {model:this.model.calculation,
                                                                     modelAttribute:"inputField",
                                                                     items:fieldNames,
                                                                     toggleClassName: 'btn'}});

                var textareaChild = new TrimmedTextareaControl({model:this.model.calculation,
                                                         modelAttribute:"expression"});
                this.children.textareaExpression = new ControlGroup({label: _("Regular Expression").t(),
                                                                     controlType: "Textarea",
                                                                     controls: textareaChild});
                // TODO [JCS] Listen on keyUp, not change (aka blur)
                textareaChild.on("change", this.textareaExpressionChangeHandler, this);

                this.children.outputFields = new RexOutputFieldsView({model: this.model.calculation});

                this.model.searchJob = new Job({}, { delay: 1000, processKeepAlive: true });
                this.model.state = new BaseModel({
                    sampleSize: { head: 1000 },
                    clustering: fieldExtractorUtils.CLUSTERING_NONE,
                    eventsView: fieldExtractorUtils.VIEW_ALL_EVENTS
                });
                this.children.previewJobController = new PreviewJobController({
                    model: {
                        application: this.model.application,
                        state: this.model.state,
                        searchJob: this.model.searchJob
                    }
                });
                this.children.previewView = new RexPreviewViewStack({
                    model: {
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        state: this.model.state
                    },
                    className: 'preview-view-stack'
                });

                this.listenTo(this.model.state, 'change:filter change:clustering change:eventsView change:sampleSize',
                    this.preview);

                this.flashMessagesHelper.register(this.model.calculation);
            },

            /**
             * Called whenever the Expression textarea value has changed
             * @param {string} new value for the textarea
             */
            textareaExpressionChangeHandler: function(value) {
                // Find all of the field names and update the calculation's outputFields
                // As a rendering optimization, we only update the model for the fields that have been added or removed.

                value = splunkUtils.trim(value);
                // Find all of the capture groups in the user's regular expression.
                // Capture groups map to outputField fieldNames.
                var captures = fieldExtractorUtils.getCaptureGroupNames(value);

                if (captures.length > 0)
                {
                    var fieldsToRemove = [];
                    // Delete any fieldNames that don't have a match
                    this.model.calculation.withEachField(function(field) {
                        var fieldName = field.get("fieldName");
                        if (!_.isUndefined(fieldName))
                        {
                            var matchedFieldName = _(captures).find(function(match) {
                                return fieldName == match;
                            });
                            if (_.isUndefined(matchedFieldName)) {
                                fieldsToRemove.push(fieldName);
                            }
                        }
                    }, this);

                    // Delete any fields marked for removal
                    _(fieldsToRemove).each(function(fieldToRemove) {
                        var fieldObject = this.model.calculation.getFieldByName(fieldToRemove);
                        this.flashMessagesHelper.unregister(fieldObject);
                        this.model.calculation.removeFieldByName(fieldToRemove);
                    }, this);

                    // See if a field is already in our outputFields. If not, add a new outputField
                    _(captures).each(function(fieldName) {
                        var field = this.model.calculation.getFieldByName(fieldName);
                        if (_.isUndefined(field)) {
                            this.flashMessagesHelper.register(this.model.calculation.addField({fieldName:fieldName}));
                        }
                    }, this);
                } else {
                    this.model.calculation.withEachField(function(field) {
                        this.flashMessagesHelper.unregister(field);
                    }, this);
                    this.model.calculation.removeAllFields();
                }
            },

            /**
             * Called by both save and preview to perform validation on the models
             * @return {boolean}
             */
            performLocalValidation: function(options) {
                var isErrorRexExp = false;
                var ignoreEmptyExpression = options.preview && !this.model.calculation.get('expression');
                var isValid;
                // This is a little wonky, but we want to allow an empty expression in preview mode, but still validate
                // all other calculation attributes.  So we set a fake expression just for the validation and remove it after.
                if(ignoreEmptyExpression) {
                    this.model.calculation.set({ expression: '__fake_expression__' }, { silent: true });
                    isValid = this.model.calculation.set({}, {validate: true});
                    this.model.calculation.set({ expression: '' }, { silent: true });
                } else {
                    isValid = this.model.calculation.set({}, {validate: true});
                }

                // Similar to above, allow empty outputFields if the expression is empty and we are previewing.
                if (this.model.calculation.outputFields.length == 0 && !ignoreEmptyExpression) {
                    this.flashMessagesHelper.addGeneralMessage(this.MISSING_OUTPUTFIELD_ID,
                        {type: splunkDUtils.ERROR,
                            html: _("No fields were extracted. Provide a working Regular Expression with capturing groups.").t()});
                    isValid = false;
                    isErrorRexExp = true;
                } else {
                    this.flashMessagesHelper.removeGeneralMessage(this.MISSING_OUTPUTFIELD_ID);
                }

                this.model.calculation.withEachField(function(field) {
                    isValid = isValid && field.set({}, {validate:true});
                    if (!isValid)
                        isErrorRexExp = true;
                }, this);

                // [JCS] For now we need to hack the textareaExpression error state since technically its model attribute
                // is not in an error state.
                if (isErrorRexExp) {
                    this.children.textareaExpression.error(true,_("Regular Expression is in a bad state").t());
                } else {
                    this.children.textareaExpression.error(false,"");
                }
                return isValid;
            },

            /**
             * Tells the view to provisionally save the inputs into the dataModel.
             */
            _handlePreview: function() {
                var fieldAliases = {};
                this.model.calculation.withEachField(function(field) {
                    fieldAliases[field.get('fieldName')] = field.get('displayName');
                });
                this.model.state.set({
                    inputField: this.model.calculation.get('inputField'),
                    regex: this.model.calculation.get('expression'),
                    fieldAliases: fieldAliases
                });
                var objectName = this.model.objectModel.get("objectName"),
                    calculationFieldNames = _.union(
                        [this.model.calculation.get("inputField")],
                        this.model.calculation.getFieldNames()
                    );

                this.fetchPreviewSearchString(objectName, calculationFieldNames).done(_(function(searchString) {
                    searchString = this._preprocessSearchString(searchString);
                    this.children.previewJobController.preview(searchString, {data:{provenance:"UI:DataModel"}});
                }).bind(this));
            },

            _preprocessSearchString: function(searchString) {
                // Pretty hacky, we should push this work to the back end somehow...
                // In order to add offset information to only the regex under edit, we have to find its rex operation
                // in the search string and add the "offset_field" argument.
                // It's not pretty but it should work as long the same object doesn't have multiple very similar rex operations.
                var pipeToRex = splunkUtils.sprintf(
                    '(\\| rex field=%s %s[^|]*)\\|',
                    splunkUtils.searchEscape(this.model.calculation.get("inputField")),
                    // Replace any unsafe characters with wildcards so we can still get a good match without blowing up.
                    splunkUtils.searchEscape(this.model.calculation.get("expression").replace(/[-[\]{}()*+?.,^$|#\s]/g, ".").replace(/\\/g, '..'), { forceQuotes: true })
                );
                try {
                    searchString = searchString.replace(
                        new RegExp(pipeToRex),
                        '$1 offset_field=' + fieldExtractorUtils.OFFSET_FIELD_NAME + ' | '
                    );
                }
                catch(e) {
                    console.warn("Unable to add offset information for expression:", this.model.calculation.get("expression"));
                }
                return searchString;
            },

            _performProvisionalSave: function(dataModel) {
                // Allow an empty regular expression, treat it as if the regular expression calculation is not there yet.
                // We accomplish this by cloning the data model and removing the incomplete calcuation before the
                // provisional save.
                if(!this.model.calculation.get('expression')) {
                    var clonedDataModel = dataModel.clone(),
                        clonedObject = clonedDataModel.objectByName(this.model.objectModel.id),
                        clonedCalculation = clonedObject.calculations.get(this.model.calculation.id);

                    clonedObject.calculations.remove(clonedCalculation);
                    return DataModelAddEditForm.prototype._performProvisionalSave.call(this, clonedDataModel);
                }
                return DataModelAddEditForm.prototype._performProvisionalSave.apply(this, arguments);
            },

            renderEditor: function($container) {
                this.children.selectField.detach();
                this.children.textareaExpression.detach();

                var docUrl = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.about.regex'
                );

                var html = _(this.editorTemplate).template({
                    type: this.type,
                    operation: this.operation,
                    docUrl: docUrl,
                    hasAttributes: this.model.calculation.outputFields.length
                });
                $container.html(html);

                this.$(".selectField-placeholder").replaceWith(this.children.selectField.render().el);
                this.$(".rex-expression-placeholder").replaceWith(this.children.textareaExpression.render().el);
                this.$(".output-fields-placeholder").append(this.children.outputFields.render().el);
            },

            renderPreview: function($container) {
                this.children.previewView.render().appendTo($container);
                this.listenTo(this.children.previewView, 'showDrillDownView', this.showDrillDownView);
                this.listenTo(this.children.previewView, 'hideDrillDownView', this.hideDrillDownView);
            },

            editorTemplate: '\
                <form>\
                    <div class="col-1">\
                        <div class="selectField-placeholder"></div>\
                    </div>\
                    <div class="col-2">\
                            <div class="rex-expression-placeholder"></div>\
                            <span class="help-block"><%- _("Example:").t() %><br>\
                                <span class="mono-space">From: (?&lt;from&gt;.*) To: (?&lt;to&gt;.*)</span>\
                            </span>\
                            <a href="<%- docUrl %>" target="_blank" class="help-link external"><%- _("Learn More").t() %></a>\
                    </div>\
                    <div class="col-3">\
                        <label><%- _("Field(s)").t() %></label>\
                        <div class="output-fields-placeholder"></div>\
                    </div>\
                </form>\
            '

        });

    });

