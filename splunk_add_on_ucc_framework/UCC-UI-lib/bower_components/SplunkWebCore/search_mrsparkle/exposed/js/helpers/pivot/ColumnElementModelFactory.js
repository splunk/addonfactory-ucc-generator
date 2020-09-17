/**
 * @author sfishel
 *
 * A model factory for models representing the column-split elements of a pivot report.
 *
 * Dynamically instantiates a model based on the "type" property of the attributes hash.  Intended to be used as the "model"
 * property of a collection.
 */

define([
            'jquery',
            'models/pivot/elements/BaseElement',
            'models/pivot/elements/columns/StringColumn',
            'models/pivot/elements/columns/NumberColumn',
            'models/pivot/elements/columns/BooleanColumn',
            'models/pivot/elements/columns/TimestampColumn'
        ],
        function(
            $,
            BaseElement,
            StringColumn,
            NumberColumn,
            BooleanColumn,
            TimestampColumn
        ) {

    var ColumnElementModelFactory = function(attributes, options) {

        switch(attributes.type) {
            case 'string':
            case 'ipv4':
                return new StringColumn(attributes, options);
            case 'number':
                return new NumberColumn(attributes, options);
            case 'boolean':
                return new BooleanColumn(attributes, options);
            case 'timestamp':
                return new TimestampColumn(attributes, options);
            default:
                throw 'Model type ' + attributes.type + ' not supported for Column Elements';
        }

    };

    // make sure the function's prototype has the correct idAttribute
    $.extend(ColumnElementModelFactory.prototype, {
        idAttribute: BaseElement.prototype.idAttribute
    });

    return ColumnElementModelFactory;

});