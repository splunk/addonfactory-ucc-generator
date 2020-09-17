// This file's sole purpose is to allow a proxy to the DS clients endpoints from DMC.
define(
    [
    	'collections/services/deploymentserver/ClientsPreview'
    ],
    function(
    	BaseClientsPreviewCollection
    ) {
        return BaseClientsPreviewCollection.extend({
            url: 'dmc/_splunkd/deployment/server/clients/preview'
        });
    }
);
