define(
    [
        "models/services/deploymentserver/ConfigViolation",
        "collections/SplunkDsBase"
    ],
    function(Model, Collection) {
        return Collection.extend({
            initialize: function() {
                Collection.prototype.initialize.apply(this, arguments);
            },
            url: 'deployment/server/config/attributesUnsupportedInUI', 
            model: Model
        });
    }
);
