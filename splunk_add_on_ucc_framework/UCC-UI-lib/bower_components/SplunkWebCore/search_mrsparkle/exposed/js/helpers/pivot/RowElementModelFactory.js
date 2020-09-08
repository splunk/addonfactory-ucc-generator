/**
 * @author sfishel
 *
 * A model factory for models representing the row-split elements of a pivot report.
 *
 * Dynamically instantiates a model based on the "type" property of the attributes hash.  Intended to be used as the "model"
 * property of a collection.
 */

define([
            'jquery',
            'models/pivot/elements/BaseElement',
            'models/pivot/elements/rows/StringRow',
            'models/pivot/elements/rows/NumberRow',
            'models/pivot/elements/rows/BooleanRow',
            'models/pivot/elements/rows/TimestampRow'
        ],
        function(
            $,
            BaseElement,
            StringRow,
            NumberRow,
            BooleanRow,
            TimestampRow
        ) {

    var RowElementModelFactory = function(attributes, options) {

        switch(attributes.type) {
            case 'string':
            case 'ipv4':
                return new StringRow(attributes, options);
            case 'number':
                return new NumberRow(attributes, options);
            case 'boolean':
                return new BooleanRow(attributes, options);
            case 'timestamp':
                return new TimestampRow(attributes, options);
            default:
                throw 'Model type ' + attributes.type + ' not supported for Row Elements';
        }

    };

    // make sure the function's prototype has the correct idAttribute
    $.extend(RowElementModelFactory.prototype, {
        idAttribute: BaseElement.prototype.idAttribute
    });

    return RowElementModelFactory;

});