define(
    [
        'underscore',
        "models/services/data/Indexes",
        "collections/SplunkDsBase"
    ],
    function(
        _,
        IndexModel,
        SplunkDsBaseCollection
    ) {
        return SplunkDsBaseCollection.extend({
            model: IndexModel,
            url: 'data/indexes',
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
