define(
    [
        'models/StaticIdSplunkDBase'
    ],
    function(BaseModel){
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            }
        },
        {
            id: 'cluster/master/generation/master'
        });
    }
);