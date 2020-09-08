define(
    [
        "models/services/data/ui/ModAlert",
        "collections/SplunkDsBase"
    ],
    function(ModAlertModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "data/ui/alerts",
            model: ModAlertModel
        });
    }
);