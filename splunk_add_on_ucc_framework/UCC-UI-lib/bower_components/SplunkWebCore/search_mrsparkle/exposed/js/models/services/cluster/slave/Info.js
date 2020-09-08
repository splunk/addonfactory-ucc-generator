define([
    'models/StaticIdSplunkDBase'
],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            }
        },
        {
            id: 'cluster/slave/info'
        });
    });