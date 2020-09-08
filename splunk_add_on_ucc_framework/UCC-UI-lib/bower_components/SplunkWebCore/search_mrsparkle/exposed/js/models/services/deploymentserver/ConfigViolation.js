define(
    [
        'models/SplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
                url: 'deployment/server/config/attributesUnsupportedInUI', 
                initialize: function() {
                    SplunkDBaseModel.prototype.initialize.apply(this, arguments);
                }
        });
    }
);
