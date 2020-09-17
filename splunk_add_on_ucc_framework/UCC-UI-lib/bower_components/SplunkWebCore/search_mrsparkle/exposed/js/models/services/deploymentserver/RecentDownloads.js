define(
    [
        'models/SplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: "deployment/server/clients/countRecentDownloads", 
                initialize: function() {
                    SplunkDBaseModel.prototype.initialize.apply(this, arguments);
                }
        });
    }
);
