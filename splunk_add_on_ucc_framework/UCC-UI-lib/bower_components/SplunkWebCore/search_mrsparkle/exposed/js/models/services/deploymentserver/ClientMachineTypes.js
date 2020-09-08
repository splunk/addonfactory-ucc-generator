define(
    [
        'models/SplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: "deployment/server/clients/countClients_by_machineType", 
                initialize: function() {
                    SplunkDBaseModel.prototype.initialize.apply(this, arguments);
                }
        });
    }
);
