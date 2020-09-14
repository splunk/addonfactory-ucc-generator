define(
    [
        'jquery',
        'underscore',
        'models/SplunkDBase'
    ],
    function(
        $,
        _,
        SplunkDBaseModel
    ) {
        return SplunkDBaseModel.extend({
            url: 'data/inputs',
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
