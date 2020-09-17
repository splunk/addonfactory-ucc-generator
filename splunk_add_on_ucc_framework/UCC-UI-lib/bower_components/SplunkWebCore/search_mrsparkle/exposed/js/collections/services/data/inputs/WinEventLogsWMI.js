define(
    [
        "models/services/data/inputs/WinEventLogsWMI",
        "collections/SplunkDsBase"
    ],
    function(EventLogsWMIModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "admin/win-wmi-enum-eventlogs",
            model: EventLogsWMIModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);