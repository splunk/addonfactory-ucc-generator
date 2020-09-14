define(
    [
        "models/services/data/inputs/WinPerfmonFind",
        "collections/SplunkDsBase"
    ],
    function(PerfmonFind, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            url: "admin/win-perfmon-find-collection",
            model: PerfmonFind,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);