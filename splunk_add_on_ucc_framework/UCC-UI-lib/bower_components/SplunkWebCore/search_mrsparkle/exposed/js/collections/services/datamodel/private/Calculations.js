/**
 * A collection of calculations contained in each data model object.
 *
 * To be used only as an internal member of the "models/services/datamodel/private/Object" module
 */

define([
            'jquery',
            'collections/Base',
            'models/services/datamodel/private/Calculation',
            'models/services/datamodel/private/EvalCalculation',
            'models/services/datamodel/private/GeoIPCalculation',
            'models/services/datamodel/private/LookupCalculation',
            'models/services/datamodel/private/RexCalculation'
       ],
       function(
            $,
            Base,
            Calculation,
            EvalCalculation,
            GeoIPCalculation,
            LookupCalculation,
            RexCalculation
           ) {

    // Create a specific Calculation class based on the calculationType
    var ModelFactory = function(attributes, options) {

        switch(attributes.calculationType) {
            case 'Eval':
                return new EvalCalculation(attributes, options);
            case 'GeoIP':
                return new GeoIPCalculation(attributes, options);
            case 'Lookup':
                return new LookupCalculation(attributes, options);
            case 'Rex':
                return new RexCalculation(attributes, options);
            default:
                return new Calculation(attributes, options);
        }
    };

    // make sure the model factory prototype has the correct idAttribute
    $.extend(ModelFactory.prototype, {
        idAttribute: Calculation.prototype.idAttribute
    });

    return Base.extend({

        model: ModelFactory,

        toString: function() {

            var children = "";
            this.each(function(calculation) {
                if (children != "")
                    children += ", ";
                children += calculation.toString();
            }, this);

            return "Calculations [" + children + "]";
        }
    });

});