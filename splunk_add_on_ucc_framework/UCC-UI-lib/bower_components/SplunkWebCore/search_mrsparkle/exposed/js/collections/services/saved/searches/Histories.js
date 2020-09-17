define(
    [
        'models/services/saved/searches/History',
        'collections/SplunkDsBase'
    ],
    function(Model, Collection) {
        return Collection.extend({
            initialize: function() {
                Collection.prototype.initialize.apply(this, arguments);
            },
            //url: saved/searches/$NAME$/history
            model: Model
        });
    }
);
