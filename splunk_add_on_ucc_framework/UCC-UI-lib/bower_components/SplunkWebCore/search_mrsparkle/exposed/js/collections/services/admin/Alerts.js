define(
    [
        "models/services/admin/Alert",
        "collections/SplunkDsBase"
    ],
    function(AlertModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            url: 'admin/alerts',
            model: AlertModel
        });
    }
);