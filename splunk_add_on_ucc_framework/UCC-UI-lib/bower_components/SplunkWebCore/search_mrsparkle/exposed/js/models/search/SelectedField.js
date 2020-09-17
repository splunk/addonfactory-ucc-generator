define(
    [
        'models/Base'
    ],
    function(BaseModel) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            sync: function() {
                throw 'Method disabled';
            }
        });
    }
);
