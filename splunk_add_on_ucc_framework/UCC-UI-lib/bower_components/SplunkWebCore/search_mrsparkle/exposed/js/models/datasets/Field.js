define(
    [
        'models/Base'
    ],
    function(BaseModel) {
        return BaseModel.extend({
            idAttribute: 'name',
            
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            
            sync: function(method, model, options) {
                throw new Error('sync not allowed for the Field model');
            }
        });
    }
);
