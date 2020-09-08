// This file's sole purpose is to allow a proxy to the DS clients endpoints from DMC.
define(
    [
        'collections/services/deploymentserver/ClientMachineTypes'
    ],
    function(
        BaseMachineTypesCollection
    ) {
        return BaseMachineTypesCollection.extend({
            url: 'dmc/_splunkd/deployment/server/clients/countClients_by_machineType'
        });
    }
);
