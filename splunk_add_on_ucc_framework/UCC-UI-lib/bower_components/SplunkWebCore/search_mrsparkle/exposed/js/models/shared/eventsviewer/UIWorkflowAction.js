define(
    [
        'underscore',
        'models/Base'
    ],
    function(_, BaseModel) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },

            sync: function(method, model, options) {
                throw 'unsupported method:' + method;
            }
        });
    }
);
