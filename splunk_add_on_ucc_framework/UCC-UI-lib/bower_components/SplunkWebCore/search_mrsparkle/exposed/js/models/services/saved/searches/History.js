define(['models/SplunkDBase'], function(BaseModel) {
    return BaseModel.extend({
        initialize: function() {
            BaseModel.prototype.initialize.apply(this, arguments);
        },
        sync : function(method, model, options) {
            throw new Error('invalid method: ' + method);
        }
    });
});
