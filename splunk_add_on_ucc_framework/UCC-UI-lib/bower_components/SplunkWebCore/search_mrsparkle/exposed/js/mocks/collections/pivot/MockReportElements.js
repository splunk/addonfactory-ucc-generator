/**
 * @author sfishel
 *
 * A mock for the "collections/pivot/elements/ElementsBase" collection
 */

define([
            'mocks/collections/MockCollection',
            'mocks/models/pivot/MockReportElement'
        ],
        function(
            MockCollection,
            MockReportElement
        ) {

    return MockCollection.extend({

        model: MockReportElement,

        toReportJSON: function() {
            return this.toJSON();
        }

    });

});