define(
    [
        'underscore',
        "models/services/data/Inputs",
        "collections/SplunkDsBase"
    ],
    function(
        _,
        InputModel,
        SplunkDsBaseCollection
    ) {
        return SplunkDsBaseCollection.extend({
            model: InputModel,
            url: 'data/inputs',
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
