define(
    [
        'underscore',
        'views/Base'
    ],
    function(
        _,
        BaseView
    ){
        return BaseView.extend({
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            }
        });
    }
);