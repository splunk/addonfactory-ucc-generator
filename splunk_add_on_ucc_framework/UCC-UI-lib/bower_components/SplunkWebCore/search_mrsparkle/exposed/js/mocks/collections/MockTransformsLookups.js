/**
 * @author jszeto
 * @date 12/14/12
 *
 * A mock for the "collections/services/TransformsLookups" collection
 */

define(['mocks/collections/MockCollection', 'mocks/models/MockModel'], function(MockCollection, MockModel) {

    var MockTransformsLookups = MockCollection.extend({

        model: MockModel,

        getNames: function() {
            return ["dnslookup", "guid_lookup", "sid_lookup"];
        }

    });

    return MockTransformsLookups;

});