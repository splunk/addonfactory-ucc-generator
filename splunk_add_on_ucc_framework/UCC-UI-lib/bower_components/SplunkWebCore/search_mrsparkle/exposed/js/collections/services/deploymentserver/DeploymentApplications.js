define(
    [
        "models/services/deploymentserver/DeploymentApplication",
        "collections/SplunkDsBase"
    ],
    function(Model, Collection) {
        return Collection.extend({
            url: 'deployment/server/applications', 
            model: Model,
            initialize: function() {
                Collection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
