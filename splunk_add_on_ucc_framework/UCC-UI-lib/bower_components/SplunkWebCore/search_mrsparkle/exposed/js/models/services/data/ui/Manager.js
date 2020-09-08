define(
    [
        'models/SplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: "data/ui/manager",
            urlRoot: "data/ui/manager",
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            }
        });
    }
);