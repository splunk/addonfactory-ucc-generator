define(
    [
        "models/services/deploymentserver/ClientMachineTypes",
        "collections/SplunkDsBase"
    ],
    function(Model, Collection) {
        return Collection.extend({
            initialize: function() {
                Collection.prototype.initialize.apply(this, arguments);
            },
            url: 'deployment/server/clients/countClients_by_machineType', 
            model: Model
        });
    }
);
