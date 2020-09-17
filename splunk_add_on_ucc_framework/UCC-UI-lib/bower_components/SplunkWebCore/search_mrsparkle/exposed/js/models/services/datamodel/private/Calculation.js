/**
 * A model representing a single calculation operation.
 *
 * To be used only as a model inside the "collections/services/datamodel/private/Calculations" collection
 *
 * For a description of available attributes, see http://eswiki.splunk.com/Data_Model_JSON_Specification#Calculation
 */

define([
            'jquery',
            'underscore',
            'collections/services/datamodel/private/Fields',
            'models/Base',
            'util/model_utils'
        ],
        function(
            $,
            _,
            Fields,
            BaseModel,
            modelUtils
        ) {

    return BaseModel.extend({

        idAttribute: 'calculationID',
        outputFieldsClass: Fields,

        initialize: function(attrs, options) {
            BaseModel.prototype.initialize.call(this, attrs, options);
            this.initializeAssociated();
        },

        getBasicDescription: function() {
            return ({
                calculationID: this.get('calculationID'),
                calculationType: this.get('calculationType'),
                expandedType: this.getExpandedType(),
                outputFields: this.getFieldList(),
                expression: this.get('expression'),
                owner: this.get('owner'),
                editable: this.get('editable')
            });
        },

        getFieldAt: function(index) {
            return this.outputFields.at(index);
        },

        getFieldByName: function(name) {
            return this.outputFields.get(name);
        },

        removeField: function(cid) {
            var outputFields = this.outputFields,
                toRemove = outputFields.get(cid);

            return outputFields.remove(toRemove);
        },

        removeFieldByName: function(fieldName, options) {
            var outputFields = this.outputFields,
                toRemove = outputFields.get(fieldName);

            outputFields.remove(toRemove, options);
        },

        removeAllFields: function(options) {
            var outputFields = this.outputFields;
            outputFields.reset([], options);
        },

        addField: function(attributes, options) {
            attributes = attributes || {};
            $.extend(attributes, {
                owner: this.get('owner')
            });

            var beforeLength = this.outputFields.length;

            this.outputFields.add(attributes, options);

            return this.outputFields.at(beforeLength);
        },

        withEachField: function(callback, context) {
            context = context || null;
            this.outputFields.each(callback, context);
        },

        getFieldNames: function() {
            return this.outputFields.map(function(outputField) {
                return outputField.get("fieldName");
            }, this);
        },

        // ----- sync behavior ----- //


        initializeAssociated: function() {
            this.associated = this.associated || {};

            if (!this.outputFields) {
                this.outputFields = this.associated.outputFields = new this.outputFieldsClass();
                this.outputFields.on("change associatedChange add remove update reset",
                function(model, options) {
                    this.trigger("associatedChange", model, options);
                }, this);
            }
        },

        clone: function(options) {
            var clone = BaseModel.prototype.clone.apply(this, arguments);
            clone.outputFields.set(this.outputFields.toJSON(options));
            return clone;
        },

        parse: function(response, options) {
            response = $.extend(true, {}, response);
            return this.parseAssociated(response, options);
        },

        parseAssociated: function(response, options) {
            this.initializeAssociated();
            if(response.outputFields) {
                this.outputFields.set(response.outputFields, $.extend({ parse: true }, options));
                delete response.outputFields;
            }
            return response;
        },

        toJSON: function(options) {
            var json = BaseModel.prototype.toJSON.apply(this, arguments);
            json.outputFields = this.outputFields.toJSON(options);
            // TODO [sff] look into these comments from the original toJSON function
            // work-around for SPL-56828, the read endpoint response is different from what the update endpoint expects
            // removing customData from the json spec...fix for SPL-57405
            return json;
        },


        // ----- private methods ----- //


        getFieldList: function() {
            return this.outputFields.map(function(field) {
                return field.getBasicDescription();
            });
        },

        getExpandedType: function() {
            var type = this.get("calculationType");

            var returnType = type;

            switch(type) {
                case "Eval":
                    returnType = _("Eval Expression").t();
                    break;
                case "GeoIP":
                    returnType = _("Geo IP").t();
                    break;
                case "Rex":
                    returnType = _("Regular Expression").t();
                    break;
                case "Lookup":
                    returnType = _("Lookup").t();
                    break;
            }

            return returnType;
        },

        toString: function() {
            return "Calculation " + this.get("calculationType") + "[" + this.get("calculationID") + "]";
        }

    });

});
