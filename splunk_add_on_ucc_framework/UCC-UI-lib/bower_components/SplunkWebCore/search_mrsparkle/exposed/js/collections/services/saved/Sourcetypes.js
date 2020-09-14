define(
    [
        "models/services/saved/Sourcetype",
        "collections/SplunkDsBase"
    ],
    function(Model, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "saved/sourcetypes",
            model: Model,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);