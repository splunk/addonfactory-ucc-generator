/**
 * @author sfishel
 *
 * A mock for the "collections/services/datamodel/DataModels" collection
 */

define(['mocks/collections/MockSplunkDs', 'mocks/models/datamodel/MockDataModel'], function(MockCollection, MockDataModel) {

    var MockDataModels = MockCollection.extend({

        model: MockDataModel

    });

    return MockDataModels;

});