/**
 * @author jszeto
 * @date 12/7/12
 */
define(['jquery',
        'underscore',
        'backbone',
        'models/services/datamodel/private/Calculation',
        'collections/services/datamodel/private/LookupInputs',
        'collections/services/datamodel/private/LookupOutputFields'
       ],
    function(
        $,
        _,
        Backbone,
        Calculation,
        LookupInputs,
        LookupOutputFields
    ) {

    /**
     * Represents a Lookup Calculation.
     *
     */
    return Calculation.extend({

        outputFieldsClass: LookupOutputFields,

        defaults: {
            calculationType: "Lookup",
            lookupName: undefined,
            inputField: "",
            lookupField: "",
            editable: true
        },

        validation: {
            lookupName : {
                required : true,
                msg: _("Select a valid Lookup Table.").t()
            }/*,
            lookupField: {
                required : true,
                msg: _("Input Field in Lookup is a required field").t()
            },
            inputField : {
                required : true,
                msg: _("Select a valid Input Attribute.").t()
            }*/
        },

        initializeAssociated: function() {
            Calculation.prototype.initializeAssociated.apply(this, arguments);

            if (!this.lookupInputs) {
                this.lookupInputs = this.associated.lookupInputs = this.lookupInputs || new LookupInputs();
                this.lookupInputs.on("change associatedChange add remove update reset",
                    function(model, options) {
                        this.trigger("associatedChange", model, options);
                    }, this);
            }
        },

        parseAssociated: function(response, options) {
            Calculation.prototype.parseAssociated.call(this, response, options);
            if(response.lookupInputs) {
                this.lookupInputs.set(response.lookupInputs, $.extend({ parse: true }, options));
                delete response.lookupInputs;
            }
            return response;
        },

        toJSON: function(options) {
            var json = Calculation.prototype.toJSON.apply(this, arguments);
            json.lookupInputs = this.lookupInputs.toJSON(options);
            return json;
        },

        /**
         * Remove an output field by matching its lookupOutputFieldName
         * @param lookupOutputFieldName
         * @return {*}
         */
        removeFieldByLookup: function(lookupOutputFieldName) {
            var field = this.outputFields.findWhere({lookupOutputFieldName: lookupOutputFieldName});
            if (field)
                this.outputFields.remove(field);

            return field;
        },

        /**
         * Returns the output field with the given lookupOutputFieldName
         *
         * @param lookupOutputFieldName
         * @return {*}
         */
        getFieldByLookup: function(lookupOutputFieldName) {
            return this.outputFields.findWhere({lookupOutputFieldName: lookupOutputFieldName});
        },

        /**
         * Run a function on each LookupInput
         *
         * @param callback
         * @param context
         */
        withEachLookupInput: function(callback, context) {
            context = context || null;
            this.lookupInputs.each(callback, context);
        },

        /**
         * Add a new LookupInput to lookupInputs
         * @param attributes
         * @param options
         * @return {*}
         */
        addLookupInput: function(attributes, options) {
            var beforeLength = this.lookupInputs.length;
            this.lookupInputs.add(attributes, options);
            return this.lookupInputs.at(beforeLength);
        },

        /**
         * Remove a lookupInput
         * @param cid
         */
        removeLookupInput: function(cid) {
            var toRemove = this.lookupInputs.get(cid);
            this.lookupInputs.remove(toRemove);
        },

        /**
         * Remove all lookupInputs
         * @param options
         */
        removeAllLookupInputs: function(options) {
            this.lookupInputs.reset([], options);
        },

        /**
         * Return the lookup input associated with a given lookupField
         * @param lookupField
         * @return {*}
         */
        getLookupInput: function(lookupField) {
            return this.lookupInputs.find(function(lookupInput) {
                return lookupInput.get("lookupField") == lookupField;
            }, this);
        }

    });
});