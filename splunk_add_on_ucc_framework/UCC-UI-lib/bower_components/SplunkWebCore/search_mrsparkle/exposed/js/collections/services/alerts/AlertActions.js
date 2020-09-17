define(
    [
        "models/services/alerts/AlertAction",
        "collections/SplunkDsBase"
    ],
    function(AlertActionModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: 'alerts/alert_actions',
            model: AlertActionModel
        });
    }
);