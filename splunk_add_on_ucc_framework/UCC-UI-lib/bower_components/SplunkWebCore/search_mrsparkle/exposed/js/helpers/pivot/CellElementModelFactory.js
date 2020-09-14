/**
 * @author sfishel
 *
 * A model factory for models representing the cell-value elements of a pivot report.
 *
 * Dynamically instantiates a model based on the "type" property of the attributes hash.  Intended to be used as the "model"
 * property of a collection.
 */

define([
            'jquery',
            'models/pivot/elements/BaseElement',
            'models/pivot/elements/cells/StringCell',
            'models/pivot/elements/cells/NumberCell',
            'models/pivot/elements/cells/TimestampCell',
            'models/pivot/elements/cells/ObjectCountCell',
            'models/pivot/elements/cells/ChildCountCell'
        ],
        function(
            $,
            BaseElement,
            StringCell,
            NumberCell,
            TimestampCell,
            ObjectCountCell,
            ChildCountCell
        ) {

    var CellElementModelFactory = function(attributes, options) {

        switch(attributes.type) {
            case 'string':
            case 'ipv4':
                return new StringCell(attributes, options);
            case 'number':
                return new NumberCell(attributes, options);
            case 'timestamp':
                return new TimestampCell(attributes, options);
            case 'objectCount':
                return new ObjectCountCell(attributes, options);
            case 'childCount':
                return new ChildCountCell(attributes, options);
            default:
                throw 'Model type ' + attributes.type + ' not supported for Cell Elements';
        }

    };

    // make sure the function's prototype has the correct idAttribute
    $.extend(CellElementModelFactory.prototype, {
        idAttribute: BaseElement.prototype.idAttribute
    });

    return CellElementModelFactory;

});