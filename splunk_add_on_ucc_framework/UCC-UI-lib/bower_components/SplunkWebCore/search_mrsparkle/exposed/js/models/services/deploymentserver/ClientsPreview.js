define(
    [
        'models/SplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: "deployment/server/clients/preview", 
                initialize: function() {
                    SplunkDBaseModel.prototype.initialize.apply(this, arguments);
                }
        });
    }
);
