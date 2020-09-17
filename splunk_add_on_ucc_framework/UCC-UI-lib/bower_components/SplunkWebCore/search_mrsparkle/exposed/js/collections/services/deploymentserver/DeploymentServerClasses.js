define(
    [
        'models/services/deploymentserver/DeploymentServerClass',
        'collections/SplunkDsBase'
    ],
    function(DeploymentServerClass, Collection) {
        return Collection.extend({
             url: 'deployment/server/serverclasses',
            model: DeploymentServerClass
        });
    }
);

