define(
    [
        'jquery',
        'underscore',
        './BaseLayout'
    ],
    function($,
             _,
             BaseLayout) {

        return BaseLayout.extend({
            className: 'dashboard-body dashboard-layout-grid',
            initialize: function() {
                BaseLayout.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                //todo
            },
            addChild: function(element) {
                BaseLayout.prototype.addChild.apply(this, arguments);
            }
        });
    }
);
