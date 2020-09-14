/**
 * @author jszeto
 * @date 2/20/15
 *
 * Represents a list of Indexes
 *
 * Cloud-specific endpoint that is only available if the Cloud Administration app has been installed
 * (https://github.com/SplunkStorm/cloud_apps)
 * 
 * The response format should be a subset of the response from  the services/data/indexes endpoint
 */
define(
    [
        'underscore',
        "models/indexes/cloud/Index",
        "collections/services/data/Indexes"
    ],
    function(
        _,
        IndexModel,
        BaseIndexesCollection
    ) {
        return BaseIndexesCollection.extend({
            model: IndexModel,
            url: 'cluster_blaster_indexes/sh_indexes_manager',
            initialize: function() {
                BaseIndexesCollection.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
