define(
    [
        "models/services/data/inputs/WinEventLogsAll",
        "collections/SplunkDsBase"
    ],
    function(EventLogsAllModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "admin/win-alleventlogs",
            model: EventLogsAllModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);