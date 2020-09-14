define(
    [
        "models/services/deploymentserver/RecentDownloads",
        "collections/SplunkDsBase"
    ],
    function(Model, Collection) {
        return Collection.extend({
            initialize: function() {
                Collection.prototype.initialize.apply(this, arguments);
            },
            url: 'deployment/server/clients/countRecentDownloads', 
            model: Model
        });
    }
);
