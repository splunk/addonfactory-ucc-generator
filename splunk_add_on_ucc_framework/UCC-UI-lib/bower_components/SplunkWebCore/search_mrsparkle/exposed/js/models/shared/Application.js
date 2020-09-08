define(
    [
        'models/Base'
    ],
    function(BaseModel) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            getPermissions: function(permission){
                return {
                    app: this.get("app"),
                    owner: ((permission === 'private') ? this.get("owner") : 'nobody')
                };
            }
        });
    }
);