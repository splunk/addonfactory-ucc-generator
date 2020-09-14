define(
    [
        'jquery',
        'underscore',
        'views/Base'
    ], function($, _, Base) {
    return Base.extend({
        initialize: function(options){
            Base.prototype.initialize.apply(this, arguments);
        },
        events: {
            'click a': function(e) {
                var elem = $(e.currentTarget),
                    type = elem.attr('data-type');
                   if(type =='TBD') { alert("TBD"); }
            }
        }
    });
});
