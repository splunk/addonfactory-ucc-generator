define(
    [
        'models/SplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: 'messages',
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
