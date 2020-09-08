define(
    [
        'models/SplunkDBase'
    ],
    function(
        BaseModel
    ) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            }
        });
    }
);