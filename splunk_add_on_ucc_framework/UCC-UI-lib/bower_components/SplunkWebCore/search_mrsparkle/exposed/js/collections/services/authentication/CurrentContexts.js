define(
    [
        "models/services/authentication/CurrentContext",
        "collections/SplunkDsBase"
    ],
    function(CurrentContextModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            model: CurrentContextModel,
            url: "authentication/current-context",
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);