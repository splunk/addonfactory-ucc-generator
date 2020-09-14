/**
 * @author jszeto
 * @date 12/7/12
 */
define(['backbone',
        'underscore',
        'models/services/datamodel/private/Calculation',
        'collections/services/datamodel/private/LookupOutputFields'
       ],
    function(
        Backbone,
        _,
        Calculation,
        LookupOutputFields) {

    /**
     * Represents an GeoIP Calculation.
     *
     */
    return Calculation.extend({

        defaults: {
            calculationType: "GeoIP",
            inputField: "",
            editable: true
        },

        initialize: function(attrs, options) {
            Calculation.prototype.initialize.call(this, attrs, options);

            this.on("change:inputField", this.inputFieldChanged, this);
        },

        inputFieldChanged: function(model, value, options) {
            if (value !== "") {
                this.withEachField(function(field) {
                    field.set("fieldName", value + "_" + field.get("lookupOutputFieldName"));
                }, this);
            }
        },

        getVisibleOutputFieldsLength: function() {
            var visibleCount = 0;
            this.outputFields.each(function(field) {
                if (!field.get("hidden"))
                    visibleCount++;
            }, this);

            return visibleCount;
        },

        validation: {
            inputField : {
                required : true,
                msg : _("A Geo IP Calculation must contain an input field.").t()
            },
            calculationType : {
                oneOf : ["GeoIP"],
                fn : function(value, attr, computedState) {
                    var outputFields = this.outputFields;
                    var visibleCount = 0;
                    if (outputFields instanceof Backbone.Collection) {
                        var length = outputFields.length;

                        for (var i = 0; i < length; i++) {
                            var field = outputFields.at(i);
                            if (!field.get("hidden"))
                                visibleCount++;
                            if (!_.isUndefined(field.get("displayName")) && field.get("displayName").indexOf('"') != -1)
                                return _('A Geo IP Attribute Display Name cannot contain a quotation mark.').t();
                        }

                        if (visibleCount == 0) {
                            return _("Select at least one Geo IP Attribute.").t();
                        }
                    } else {
                        return _("Internal Error: The Geo IP outputFields are invalid.").t();
                    }
                }
            }
        },


        /**
         * Create the initial outputFields for a GeoIP Calculation
         *
         * @param options
         */
        addGeoIPFields: function(options) {
            this.addGeoIPField("lon", "number", options);
            this.addGeoIPField("lat", "number", options);
            this.addGeoIPField("City", "string", options);
            this.addGeoIPField("Region", "string", options);
            this.addGeoIPField("Country", "string", options);
        },

        addGeoIPField: function(fieldName, type, options) {
            var attributes = {required:true,
                hidden:false,
                type:type,
                lookupOutputFieldName: fieldName,
                fieldName: this.get("inputField") + "_" + fieldName};

            this.addField(attributes, options);
        },

        initializeAssociated: function() {
            this.associated = this.associated || {};
            this.outputFields = this.associated.outputFields = this.outputFields || new LookupOutputFields();
            this.outputFields.on("change associatedChange add remove update reset",
                function(model, options) {
                    this.trigger("associatedChange", model, options);
                }, this);
        }

    });
});