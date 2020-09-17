define(
    [
        'models/services/saved/Search',
        'collections/SplunkDsBase'
    ],
    function(Model, Collection) {
        return Collection.extend({
            initialize: function() {
                Collection.prototype.initialize.apply(this, arguments);
            },
            url: 'saved/searches',
            model: Model
        },
        {
            ALERT_SEARCH_STRING: '(is_scheduled=1 AND (alert_type!=always OR alert.track=1 OR (dispatch.earliest_time="rt*" AND dispatch.latest_time="rt*" AND actions="*" AND actions!="")))'
        });
    }
);
