define(
    [
        'models/StaticIdSplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: 'data/user-prefs',
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            }
        },
        {
            id: 'data/user-prefs/general_default'
        });
    }
);
