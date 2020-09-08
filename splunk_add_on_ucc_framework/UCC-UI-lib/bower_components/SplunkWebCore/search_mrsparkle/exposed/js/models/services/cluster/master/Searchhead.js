define(
    [
        'models/SplunkDBase'
    ],
    function(BaseModel){
        return BaseModel.extend({
            //url: 'cluster/master/searchheads',
            urlRoot: "cluster/master/searchheads/",
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
