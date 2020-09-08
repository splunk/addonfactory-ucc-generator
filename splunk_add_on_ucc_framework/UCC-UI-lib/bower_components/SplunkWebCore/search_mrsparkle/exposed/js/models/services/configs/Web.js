define(
    [
        'models/SplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: "configs/conf-web",
            urlRoot: "configs/conf-web",
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            }
        });
    }
);