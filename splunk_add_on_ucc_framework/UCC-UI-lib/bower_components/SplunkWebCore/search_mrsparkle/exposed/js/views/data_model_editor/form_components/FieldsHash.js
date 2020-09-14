/**
 * @author jszeto
 * @date 1/8/14
 */


// addField (fieldName, calculationID) - calculationID optional. Will check if fieldName is inherited
// removeField (fieldName, calculationID)
// synchronize(ObjectModel) - given an ObjectModel, remove any fields that no longer exist
// isAnyFieldInherited - returns true if any of the fields are inherited
define([
    'jquery',
    'underscore',
    'backbone',
    'module'
],
    function (
        $,
        _,
        Backbone,
        module
        ) {

        var FieldsHash = function(model) {
            this.clear();
            this.setModel(model);
        };
        
        FieldsHash.NONE = "none";
        FieldsHash.MIXTURE = "mixture";
        FieldsHash.ONLY_NON_INHERITED = "onlyNonInherited";

        _.extend(FieldsHash.prototype, {

            /**
             * Associate an Object model with this hash
             * @param model {services/datamodel/private/Object}
             */
            setModel: function(model) {
                if (model !== this._objectModel) {
                    this._objectModel = model;
                    this.synchronize();
                }
            },

            /**
             * Mark a field as selected
             *
             * @param fieldName {string} - name of the Object field or Calculation Field (if calculationID is non-null)
             * @param calculationID {string} optional ID of the Object's calculation
             */
            addField : function(fieldName, calculationID) {
                if (!_(calculationID).isUndefined()) {
                    var calculation = this._calculations[calculationID];
                    if (_(calculation).isUndefined())
                        calculation = this._calculations[calculationID] = {};
                    calculation[fieldName] = true;
                } else {
                    if (this._objectModel.isOwnField(fieldName)) {
                        this._ownFields[fieldName] = true;
                    } else {
                        this._inheritedFields[fieldName] = true;
                    }
                }
                this.changeHandler();
            },

            /**
             * Mark a field as unselected
             *
             * @param fieldName {string} - name of the Object field or Calculation Field (if calculationID is non-null)
             * @param calculationID {string} optional ID of the Object's calculation
             */
            removeField: function(fieldName, calculationID) {
                if (!_(calculationID).isUndefined()) {
                    var calculation = this._calculations[calculationID];
                    if (calculation)
                        delete calculation[fieldName];
                } else {
                    if (this._objectModel.isOwnField(fieldName)) {
                        delete this._ownFields[fieldName];
                    } else {
                        delete this._inheritedFields[fieldName];
                    }
                }
                this.changeHandler();
            },

            /**
             * Returns true if a field is selected
             *
             * @param fieldName {string} - name of the Object field or Calculation Field (if calculationID is non-null)
             * @param calculationID {string} optional ID of the Object's calculation
             * @return {boolean}
             */
            hasField: function(fieldName, calculationID) {
                var field;
                if (!_(calculationID).isUndefined()) {
                    var calculation = this._calculations[calculationID] || {};
                    field = calculation[fieldName];
                } else {
                    if (this._objectModel.isOwnField(fieldName)) {
                        field = this._ownFields[fieldName];
                    } else {
                        field = this._inheritedFields[fieldName];
                    }
                }

                return field ? true : false;
            },

            /**
             * Check if the selectionType has changed due to a field being selected or unselected
             */
            changeHandler: function() {
                if (!this.containsAnyFields()) {
                    this.selectionType = FieldsHash.NONE;
                } else if (!this.containsInheritedField()) {
                    this.selectionType = FieldsHash.ONLY_NON_INHERITED;
                } else {
                    this.selectionType = FieldsHash.MIXTURE;
                }

                if (this.selectionType != this.previousSelectionType) {
                    this.trigger("change:selectionType", this.selectionType, this.previousSelectionType);
                    this.previousSelectionType = this.selectionType;
                }
            },


            synchronize: function() {

            },

            /**
             * Clear the internal state
             */
            clear: function() {
                this._ownFields = {};
                this._inheritedFields = {};
                this._calculations = {};
                this.selectionType = FieldsHash.NONE;
                this.previousSelectionType = FieldsHash.NONE;
                this.changeHandler();
            },

            /**
             * Returns true if any inherited field is selected
             * @return {boolean}
             */
            containsInheritedField: function() {
                return !_(this._inheritedFields).isEmpty();
            },

            /**
             * Returns true if any field is selected
             *
             * @return {boolean}
             */
            containsAnyFields: function() {
                return !_(this._inheritedFields).isEmpty() ||
                       !_(this._ownFields).isEmpty() ||
                       _(this._calculations).find(function(calculation) {
                           return !_(calculation).isEmpty();
                       }, this);
            },

            /**
             * Pass a callback and context to run for each selected field. Callback has the signature:
             * function(field) where field is a Field model in the Object
             *
             * @param callback
             * @param context
             */
            eachField: function(callback, context) {
                var fields = [];
                var field;

                context = context || null;
                _(this._inheritedFields).each(function(fieldValue, fieldName) {
                    field = this._objectModel.getField(fieldName);
                    if (field)
                        fields.push(field);
                }, this);
                _(this._ownFields).each(function(fieldValue, fieldName) {
                    field = this._objectModel.getField(fieldName);
                    if (field)
                        fields.push(field);
                }, this);
                _(this._calculations).each(function(calculation, calculationID) {

                    var calculationModel = this._objectModel.getCalculation(calculationID);
                    _(calculation).each(function(outputFieldValue, outputFieldName) {
                        field = calculationModel.getFieldByName(outputFieldName);
                        if (field)
                            fields.push(field);
                    }, this);
                }, this);

                _(fields).each(callback, context);
            }


       }, Backbone.Events); // Mixin the Events functionality so we can trigger changes ot the selectionType

    return FieldsHash;
});

