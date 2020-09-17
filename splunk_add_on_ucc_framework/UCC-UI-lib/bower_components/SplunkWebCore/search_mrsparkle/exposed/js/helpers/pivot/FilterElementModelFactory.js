/**
 * @author sfishel
 *
 * A model factory for models representing the filter elements of a pivot report.
 *
 * Dynamically instantiates a model based on the "type" property of the attributes hash.  Intended to be used as the "model"
 * property of a collection.
 */

define([
            'jquery',
            'models/pivot/elements/BaseElement',
            'models/pivot/elements/filters/StringFilter',
            'models/pivot/elements/filters/NumberFilter',
            'models/pivot/elements/filters/BooleanFilter',
            'models/pivot/elements/filters/TimestampFilter'
        ],
        function(
            $,
            BaseElement,
            StringFilter,
            NumberFilter,
            BooleanFilter,
            TimestampFilter
        ) {

    var FilterElementModelFactory = function(attributes, options) {

        switch(attributes.type) {
            case 'string':
            case 'ipv4':
                return new StringFilter(attributes, options);
            case 'number':
                return new NumberFilter(attributes, options);
            case 'boolean':
                return new BooleanFilter(attributes, options);
            case 'timestamp':
                return new TimestampFilter(attributes, options);
            default:
                throw 'Model type ' + attributes.type + ' not supported for Filter Elements';
        }

    };

    // make sure the function's prototype has the correct idAttribute
    $.extend(FilterElementModelFactory.prototype, {
        idAttribute: BaseElement.prototype.idAttribute
    });

    return FilterElementModelFactory;

});