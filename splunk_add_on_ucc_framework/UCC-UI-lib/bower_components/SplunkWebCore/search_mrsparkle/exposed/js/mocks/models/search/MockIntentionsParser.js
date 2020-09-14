define([
            'mocks/models/MockModel'
        ],
        function(
            MockModel
        ) {

    /*
     * It's a common pattern to create an IntentionsParser as a private variable.
     * To help testing, this mock copies all fetch calls to a class-level 'allFetches' attribute.
     */

    var MockIntentionsParser = MockModel.extend({

        fetch: function() {
            MockIntentionsParser.allFetches.apply(this, arguments);
            return MockModel.prototype.fetch.apply(this, arguments);
        }

    },
    {
        allFetches: sinon.spy()
    });

    return MockIntentionsParser;

});