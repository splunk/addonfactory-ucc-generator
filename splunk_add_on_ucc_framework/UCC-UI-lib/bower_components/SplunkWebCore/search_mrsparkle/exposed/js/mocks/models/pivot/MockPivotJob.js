define([
            'mocks/models/search/MockJob'
        ],
        function(
            MockJob
        ) {

    return MockJob.extend({

        getAccelerationType: function() {},
        getCollectId: function() {},
        resultCountSafe: function() {}

    });

});