/**
 * @author jszeto
 * @date 11/9/12
 *
 * Base class for the form subviews for Adding or Editing Objects, Transactions or Calculations
 *
 * Inputs:
 *
 *     model: {
 *        dataModel {models/services/datamodel/DataModel} the data model currently being edited
 *        appLocal {models/services/AppLocal}
 *        application {models/Application}
 *        buttonSettings {base/Model}
 *    }
 *     collection { [optional]
 *        transformsLookups {collections/services/data/TransformsLookups} - Collection of lookups to use
 *              when add/edit a Lookup calculation
 *     objectName {string}
 *     operation {string} (add|edit)
 *     type {string} (event|child|transaction|search|Eval|Lookup|Rex|GeoIP)
 *     parentObjectName {string} [optional] The name of the parent Object to either a child Object or a calculation
 *     calculationID {string} [optional]
 */
define([
    'jquery',
    'underscore',
    'views/shared/dataenrichment/AddEditFormBase',
    'util/splunkd_utils',
    'splunk.util'
],
    function(
        $,
        _,
        AddEditFormBase,
        splunkDUtils,
        splunkUtils
        )
    {
        return AddEditFormBase.extend({

            /**
             * {DataModel} - Model for the data model being edited
             */
            dataModel: undefined,
            /**
             * {String} - The name of the object to edit
             */
            objectName: "",
            /**
             * {String} - The name of the parent Object to either a child Object or a calculation (lookup|regex|eval)
             */
            parentObjectName: "",
            /**
             * {String} - Whether to add or edit. Possible values = [add|edit]
             */
            operation: "add",
            /**
             * {String} - (Optional) ID of the Calculation
             */
            calculationID : "",

            initialize: function(options) {
                AddEditFormBase.prototype.initialize.call(this, options);
                options = options || {};
                this.objectName = options.objectName;
                this.parentObjectName = options.parentObjectName;
                this.operation = options.operation;
                this.calculationID = options.calculationID;
            },

            /**
             * Tells the view to save the inputs into the dataModel.
             */
            _handleSave: function() {
                return this.model.dataModel.save({}).then(_(function() {
                    return this.objectName;
                }).bind(this));
            },

            /**
             * Helper function to get the preview search string when adding or editing an Object.
             * We ask the backend to save a provisional copy of the dataModel and then ask it for the search string.
             *
             * @param {string} objectName - Name of the object that has been modified
             * @param {array} calculationFieldNames - Array of the fieldNames of the calculation's outputFields. If undefined,
             * then we just use previewSearch
             * @return {Deferred} - Returns a Deferred object that is done after the dataModel has been saved.
             */
            fetchPreviewSearchString: function(objectName, calculationFieldNames) {
                return this._performProvisionalSave(this.model.dataModel).then(_(function() {
                    var objectModel = this.model.dataModel.objectByName(objectName);
                    var searchString;

                    if (!_(calculationFieldNames).isUndefined()) {
                        searchString = objectModel.getCalculationPreviewSearch(calculationFieldNames, true, true);
                    } else {
                        searchString = objectModel.get("previewSearch");
                    }

                    return searchString;
                }).bind(this));
            },

            _performProvisionalSave: function(dataModel) {
                return dataModel.save({}, {data: {provisional: true}});
            },

            /**
             * Helper function to hide the Save button
             */
            disableSave: function() {
                this.model.buttonSettings.set({save:"hide",preview:"hide","delete":"hide"});
            },

            /**
             * Display an error about not finding the Object
             * @param objectName
             */
            addObjectError: function(objectName) {
                var msg = splunkUtils.sprintf(_("Could not find the Dataset <i>%s</i>").t(), objectName);

                this.flashMessagesHelper.addGeneralMessage(this.cid + "_missingObject",
                    { type: splunkDUtils.ERROR,
                        html: msg});

                this.disableSave();
            },

            /**
             * Display an error about not finding the Calculation
             * @param calculationID
             */
            addCalculationError: function(calculationID) {
                var msg = splunkUtils.sprintf(_("Could not find the Calculation <i>%s</i>").t(), calculationID);
                this.flashMessagesHelper.addGeneralMessage(this.cid + "_missingCalculation",
                    { type: splunkDUtils.ERROR,
                        html: msg});

                this.disableSave();
            },

            /**
             * Display an error about not finding the Field
             * @param fieldName
             */
            addFieldError: function(fieldName) {
                var msg = splunkUtils.sprintf(_("Could not find the Field <i>%s</i>").t(), fieldName);
                this.flashMessagesHelper.addGeneralMessage(this.cid + "_missingField",
                    { type: splunkDUtils.ERROR,
                        html: msg});

                this.disableSave();
            }
        });

    });