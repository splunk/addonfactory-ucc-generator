define(
    [
        'underscore',
        "models/services/data/ModularInput",
        "collections/SplunkDsBase"
    ],
    function(
        _,
        ModularInputModel,
        SplunkDsBaseCollection
    ) {
        return SplunkDsBaseCollection.extend({
            model: ModularInputModel,
            url: 'data/modular-inputs',
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
