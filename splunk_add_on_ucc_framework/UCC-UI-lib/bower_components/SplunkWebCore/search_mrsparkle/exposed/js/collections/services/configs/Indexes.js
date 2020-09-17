define(
    [
        "models/services/configs/Indexes",
        "collections/SplunkDsBase"
    ],
    function(Model, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "configs/conf-indexes",
            model: Model,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);