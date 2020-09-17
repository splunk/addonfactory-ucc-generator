define(
    [
        'models/SplunkDBase'
    ],
    function(
        BaseModel
    ) {
        return BaseModel.extend({
            url: 'admin/alerts',
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            }
        });
    }
);