define(
    [
        'underscore',
        "models/services/data/outputs/tcp/Group",
        "collections/SplunkDsBase"
    ],
    function(
        _,
        GroupModel,
        SplunkDsBaseCollection
        ) {
        return SplunkDsBaseCollection.extend({
            model: GroupModel,
            url: 'data/outputs/tcp/group',
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
