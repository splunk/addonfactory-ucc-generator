define(
    [
        "models/services/deploymentserver/DeploymentServer",
        "collections/SplunkDsBase"
    ],
    function(Model, Collection) {
        return Collection.extend({
            initialize: function() {
                Collection.prototype.initialize.apply(this, arguments);
            },
            url: 'deployment/server/config', 
            model: Model
        });
    }
);
