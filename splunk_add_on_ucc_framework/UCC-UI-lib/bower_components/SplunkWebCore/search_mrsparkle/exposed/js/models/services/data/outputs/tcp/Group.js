define(
    [
        'underscore',
        'models/SplunkDBase'
    ],
    function(
        _,
        SplunkDBaseModel
        ) {
        return SplunkDBaseModel.extend({
            url: 'data/outputs/tcp/group',
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
