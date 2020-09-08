define(
    [
        "models/services/deploymentserver/ClientsPreview",
        "collections/SplunkDsBase"
    ],
    function(Model, Collection) {
        return Collection.extend({
            initialize: function() {
                Collection.prototype.initialize.apply(this, arguments);
            },
            url: 'deployment/server/clients/preview', 
            model: Model
        });
    }
);
