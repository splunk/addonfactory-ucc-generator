/**
 * @author jszeto
 * @date 12/18/12
 *
 * Inputs:
 *     options {
 *         parent {View} the view that created this dialog,
 *         model {
 *             objectModel {models/services/datamodel/private/Object} the Object being edited
 *             dataModel {models/services/datamodel/DataModel}
 *             application {models/Application}
 *         }
 *     }
 *
 * @fires AddExtractedFieldsDialog#action:saveModel
 */
define(
[
    'jquery',
    'underscore',
    'backbone',
    'views/shared/dialogs/DialogBase',
    'views/shared/controls/ControlGroup',
    'views/shared/dataenrichment/preview/components/SelectSampleSize',
    'views/data_model_editor/form_components/FieldTable',
    'views/shared/jobstatus/Spinner',
    'views/shared/jobstatus/Count',
    'views/shared/FlashMessages',
    'models/datamodel/ExtractedField',
    'models/search/Job',
    'models/services/search/jobs/ResultSummary',
    'models/services/datamodel/DataModel',
    'util/splunkd_utils',
    'module',
    'util/splunkd_utils',
    'util/console',
    'bootstrap.tooltip'
],
    function(
        $,
        _,
        Backbone,
        DialogBase,
        ControlGroup,
        SelectSampleSize,
        FieldTable,
        Spinner,
        Count,
        FlashMessagesView,
        ExtractedField,
        Job,
        ResultSummary,
        DataModel,
        splunkdUtils,
        module,
        splunkDUtils,
        console
        /* bootstrap tooltip */
        )
{
    return DialogBase.extend({
        moduleId: module.id,
        events: {
            'click .addFieldsBtn' : function() {
                // Create a working model to represent the extracted field
                var extractedField = new ExtractedField({fieldName: '',
                        displayName: '',
                        type: "string",
                        isNumeric: false
                });
                this.collection.manualFields.add(extractedField);
            }
        },
        className: "modal fade modal-wide",
        validSearch: true,
        initialize: function(options) {
            DialogBase.prototype.initialize.call(this, options);

            this.bodyClassName = "modal-body-scrolling";
            this.errorMsgIds = []; 

            this.selectSampleSize = new SelectSampleSize({});
            this.selectSampleSize.on("change", this.selectSampleSizeChangeHandler, this);

            this.children.selectSampleSizeGroup = new ControlGroup({controls: [this.selectSampleSize]});

            this.children.flashMessagesView = new FlashMessagesView();

            this.collection = {}; 
            this.collection.manualFields = new Backbone.Collection([], {model:ExtractedField});
            this.collection.addedFields = new Backbone.Collection([], {model:ExtractedField}); 

            this.startNewSearch();

            this.settings.set("primaryButtonLabel", _("Save").t());
            this.settings.set("cancelButtonLabel", _("Cancel").t());
            this.settings.set("titleLabel", _("Add Auto-Extracted Field").t());

        },

        selectSampleSizeChangeHandler: function(newValue, oldValue) {
            // Send a new search request
            // Put up the loading page
            this.startNewSearch();
            this.debouncedRender();
        },

        summaryChangeHandler: function() {
            this.parseSummary();
        },

        /**
         * Starts a new search job to retrieve the extracted fields for the Object
         */
        startNewSearch: function() {
            var value = this.selectSampleSize.getValue();
            var searchString;
            var rootParent = this.model.objectModel.get("rootParent");

            if (rootParent == DataModel.BASE_SEARCH)
                searchString = this.model.objectModel.get("baseSearch");
            else
                searchString = this.model.objectModel.get("autoextractSearch");

            this.validSearch = searchString != "";

            // Destroy old models and remove views
            this.destroySearchJob();
            if (this.children.fieldTable)
                this.children.fieldTable.remove();

            if (this.children.spinner)
                this.children.spinner.remove();

            if (this.children.count)
                this.children.count.remove();

            this.collection.extractedFields = new Backbone.Collection([], {model:ExtractedField});
            this.children.fieldTable = new FieldTable({collection: {
                    extractedFields: this.collection.extractedFields, 
                    manualFields: this.collection.manualFields
                }
            });

            // Create new Job and ResultSummary
            this.model.searchJob = new Job({}, { delay: 1000, processKeepAlive: true });
            this.model.summary = new ResultSummary();

            var fatalErrorWarning = [splunkdUtils.FATAL, splunkdUtils.ERROR, splunkdUtils.WARNING];
            this.children.flashMessagesView.flashMsgHelper.register(this.model.searchJob, fatalErrorWarning);
            this.children.flashMessagesView.flashMsgHelper.register(this.model.summary, fatalErrorWarning);
            this.children.flashMessagesView.flashMsgHelper.register(this.model.objectModel, fatalErrorWarning);
            this.children.flashMessagesView.flashMsgHelper.register(this.model.dataModel, fatalErrorWarning);

            // If the searchJob links change, then update the summary ID
            this.model.searchJob.entry.links.on('change', function() {
                this.model.summary.set("id", this.model.searchJob.entry.links.get('results_preview'));
            },this);

            // As the searchJob progresses, get the latest summary info
            this.model.searchJob.on("jobProgress", function() {
                this.model.summary.safeFetch();
            }, this);

            // need to debounce the listener and put it in two places in case summary the fetch gets an empty response
            var debouncedSummaryChangeHandler = _(this.summaryChangeHandler).debounce(0);
            this.model.summary.results.on("add remove reset", debouncedSummaryChangeHandler, this);
            this.model.summary.on('sync', debouncedSummaryChangeHandler, this);

            var searchJobAttrs = {
                search: searchString || '',
                earliest_time: value.earliest || null,
                latest_time: value.latest || null,
                auto_cancel: 100,
                status_buckets: 0,
                timeFormat: '%s.%Q',
                ui_dispatch_app: this.model.application.get("app"), // TODO [JCS]
                rf: '*',
                preview: true,
                adhoc_search_level: "verbose",
                app: this.model.application.get("app"),
                owner: this.model.application.get("owner"),
                provenance: "UI:DataModel"
            };

            // if an event count limit was specified, chase the search with a 'head'
            // TODO this is pretty naive, are there edge cases where we need to be smarter?
            if(value.head) {
                searchJobAttrs.search += (' | head ' + value.head);
            }

            // Pipe to field summary command
            searchJobAttrs.search += " | fieldSummary";

            // Kick off the search job
            this.model.searchJob.save({}, { data: searchJobAttrs }).done(function() {
                this.model.searchJob.startPolling();
            }.bind(this));

            this.children.spinner = new Spinner({model: this.model.searchJob});
            this.children.count = new Count({model: this.model.searchJob});
        },

        /**
         * Cleanup the search job
         */
        destroySearchJob: function() {
            if (this.model.searchJob) {

                this.children.flashMessagesView.flashMsgHelper.unregister(this.model.searchJob);
                this.model.searchJob.destroy();
                delete this.model.searchJob;
            }
            if (this.model.summary) {
                this.children.flashMessagesView.flashMsgHelper.unregister(this.model.summary);
            }
        },

        /**
         * Called when the summary has changed
         */
        parseSummary: function() {
            //console.log("AddExtractedFieldsDialog.parseSummary summary",this.model.summary);

            if (!this.model.summary) {
                return;
            }

            if(this.model.searchJob.isDone() && this.model.summary.results.length === 0) {
                this.renderNoFieldsMessage();
                return;
            }


            this.model.summary.results.each(function(field) {
                var fieldName = field.get("field");
                // Filter out any fields already in the Object model
                // Any duplication in the extractedFieldsCollection will be ignored because fieldName is its 'id' attribute
                if (!this.model.objectModel.getField(fieldName))
                {
                    // TODO [JCS] Use the Field model's new isNumeric function instead
                    var isNumeric = field.get('numeric_count') > field.get('count') / 2;
                    var fieldValues = field.get("values");

                    // Only display a maximum of 10 sample values
                    if (!_(fieldValues).isUndefined()) {
                        fieldValues = fieldValues.slice(0,10);
                    }

                    // Create a working model to represent the extracted field
                    var extractedField = new ExtractedField({fieldName: fieldName,
                        displayName: fieldName,
                        type: isNumeric ? "number" : "string",
                        isNumeric: isNumeric,
                        distinctValues: fieldValues
                    });
                    this.collection.extractedFields.add(extractedField);
                }
            }, this);

            // Also add _time as an extracted field if it does not already exist in the object.
            // Wait until some fields have shown up to ensure that if there is no summary information
            // (which would mean _time is not an extractable field) that _time is not shown.
            if (this.model.summary.results.length > 0 && !this.model.objectModel.getField('_time')) {
                var indexTimeField = new ExtractedField({fieldName: '_time',
                    displayName: '_time',
                    type: 'timestamp',
                    required: true
                });
                this.collection.extractedFields.add(indexTimeField, { at: 0 });
            }
        },

        clearErrorMessages: function() {
            for (var i = 0; i < this.errorMsgIds.length; i++){
                var msgId = this.errorMsgIds[i]; 
                this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(msgId); 
            }
            this.errorMsgIds = []; 
        },

        /**
         * Takes the relevant attributes from the extractedField and adds a new field to the Object
         *
         * @param extractedField
         * @return {models/services/datamodel/private/Field} the newly added field if successful
         */
        createFieldFromExtracted: function(extractedField) {
            var fieldAttributes = {
                fieldName: extractedField.get("fieldName"),
                displayName: extractedField.get("displayName"),
                type: extractedField.get("type"),
                hidden: extractedField.get("hidden"),
                required: extractedField.get("required")
            };
            return this.model.objectModel.addField(fieldAttributes);
        },
        /**
         * Handles validated event on an ExtractedField model
         * The ExtractedFields have a temporary lifecycle.  So instead of registering the ExtractedField with the
         * flashMessagesView, we fire a general error.
         *
         * @param isValid
         * @param model
         * @param payload
         */
        extractedField_ValidatedHandler: function(isValid, model, payload) {
            if (!isValid){
                _.each(payload, function(value, key) {
                    var msgId = model.get("fieldName") + "_" + key + "_validationError";
                    this.errorMsgIds.push(msgId);
                    this.children.flashMessagesView.flashMsgHelper.addGeneralMessage(msgId,
                        {type: splunkDUtils.ERROR,
                            html: _(value).t()});
                }.bind(this));
            }
            // Unregister this event handler
            model.off('validated', null, this);
        },


        /**
         * Called when the save button is pressed
         */
        primaryButtonClicked: function() {
            DialogBase.prototype.primaryButtonClicked.apply(this, arguments);

            this.clearErrorMessages(); 

            var doErrorsExist = false;

            // Save the results into our object. Iterate over each extracted field and add
            // the selected ones to the Object model
            this.collection.extractedFields.each(function(extractedField) {

                if (extractedField.get("selected")) {
                    extractedField.on('validated', this.extractedField_ValidatedHandler, this);

                    // Validate first
                    if (!extractedField.set({}, {validate:true})) {
                        doErrorsExist = true;
                    } else {
                        if (this.createFieldFromExtracted(extractedField)) {
                            this.collection.addedFields.add(extractedField);
                        }
                    }
                }
            }, this);

            if (doErrorsExist) {
                this.revertModel();
                return;
            }

            // Validate all of the manually added fields.
            this.collection.manualFields.each(function(extractedField) {
                extractedField.on('validated', this.extractedField_ValidatedHandler, this);
                if (!extractedField.set({}, {validate:true})) {
                    doErrorsExist = true;
                } else {
                    // Check if field already exists
                    if (this.model.objectModel.getField(extractedField.get("fieldName"))) {
                        var msgId = extractedField.get("fieldName") + "_duplicateError";
                        this.errorMsgIds.push(msgId);
                        this.children.flashMessagesView.flashMsgHelper.addGeneralMessage(msgId,
                                    {type: splunkDUtils.ERROR,
                                    html: _("Field with name '" + extractedField.get("fieldName") + "' already exists in data model").t()});
                        doErrorsExist = true; 
                    }
                }
            }, this);

            // If any of the manually entered fields are invalid, then we revert all changes and don't save the datamodel 
            if (doErrorsExist) {
                this.revertModel();  
                return; 
            }

            // All manually entered fields are valid.  Save to the backend 
            this.collection.manualFields.each(function(extractedField) {
                if (this.createFieldFromExtracted(extractedField)) {
                    this.collection.addedFields.add(extractedField); 
                }
            }, this);
            this.saveModel(); 
        },
        /*
         * This function is called if there are any validation errors on the newly added fields. Revert the model by removing all of the newly added fields
         */
        revertModel: function() {
            this.collection.addedFields.each(function(extractedField) {
                this.model.objectModel.removeField({'fieldName': extractedField.get("fieldName")}); 
            }.bind(this)); 
            this.collection.addedFields.reset(); 
        }, 
        saveModel: function() {
            var resultXHR = this.model.dataModel.save({}, {
                error: function(model, response) {
                    this.revertModel(); 
                }.bind(this), 
                success: function(model, response) {
                    this.trigger('action:fetchDataModel'); 
                    this.hide(); 
                }.bind(this)
            });
        }, 
        renderBody : function($el) {
            //console.log("AddExtractedFieldsDialog.renderBody fieldTable",this.children.fieldTable);
            var html = _(this.bodyTemplate).template({_:_, validSearch: this.validSearch});
            $el.html(html);

            this.children.spinner.render().appendTo($el.find(".job-status-placeholder"));
            this.children.count.render().appendTo($el.find(".job-status-placeholder"));
            $el.find(".flash-messages-placeholder").append(this.children.flashMessagesView.render().el);
            $el.find(".select-sample-size-placeholder").append(this.children.selectSampleSizeGroup.render().el);
            $el.find(".field-table-placeholder").append(this.children.fieldTable.render().el);
        },

        renderFooter: function($el) {
            // TODO [JCS] Hide Save and Cancel when in loading state?
            DialogBase.prototype.renderFooter.call(this, $el);
        },

        renderNoFieldsMessage: function() {
            this.$(".field-table-placeholder").append(_(this.noFieldsMessageTemplate).template({}));
        },

        // Display the loading progress from the search job
/*            renderLoadingScreen: function($el) {
            var percentDone = this.searchJobModel.entry.content.get("doneProgress");
            var fieldCount = this.collection.extractedFields.length;

            if (_.isNaN(percentDone) || _.isUndefined(percentDone))
                percentDone = 0;
            else
                percentDone = Math.round(percentDone * 100);

            var html = _(this.loadingScreenTemplate).template({percentDone: percentDone, fieldCount: fieldCount});

            $el.html(html);
        },

        // Toggle the visibility of the loading screen and field table
        updateLoadingState: function() {

            var loadingScreen = this.$el.find(".loading-screen-placeholder");
            var fieldTable = this.$el.find(".field-table-placeholder");

            this.renderLoadingScreen(loadingScreen);

            if (this.isJobDone())
            {
                loadingScreen.hide();
                fieldTable.show();
            }
            else
            {
                loadingScreen.show();
                fieldTable.hide();
            }
        },

        isJobDone: function() {
            return this.searchJobModel.isDone();
        },*/

        // Clean up the search job
        remove: function() {
            DialogBase.prototype.remove.call(this);

            this.destroySearchJob();
        },
        bodyTemplate: '\
            <div class="flash-messages-placeholder"></div>\
            <div class="select-sample-size-placeholder"></div>\
            <div class="job-status-placeholder"></div>\
            <div class="add-fields-placeholder pull-right">\
                <div><%-_("Missing field?").t()%> <a href="#" class="addFieldsBtn"><%-_("Add by Name").t()%></a></div>\
            </div>\
            <% if (validSearch) { %>\
                <div class="field-table-placeholder"></div>\
            <% } else { %>\
                <div class="alert alert-error message-single"><i class="icon-alert"></i> \
                <%- _("You must specify a constraint on either this Dataset or its ancestor Datasets").t() %></div>\
            <% } %>\
        ',

        noFieldsMessageTemplate: '\
            <div class="alert alert-error no-fields-message">\
                <i class="icon-alert"></i>\
                <%- _("No field summary information is available. This can mean that your search did not return any events, or that you are using a search command that does not provide summary information (i.e. inputcsv).").t() %>\
            </div>\
        '

    });

});
