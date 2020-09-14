/**
 * @author jszeto
 * @date 2/20/15
 * 
 * Represents a specific Index
 * 
 * Cloud-specific endpoint that is only available if the Cloud Administration app has been installed
 * (https://github.com/SplunkStorm/cloud_apps)
 *
 * The response format should be a subset of the response from the services/data/indexes/INDEX_NAME endpoint
 *
 */
define(
    [
        'jquery',
        'underscore',
        'models/services/data/Indexes'
    ],
    function(
        $,
        _,
        BaseIndexesModel
    ) {
        var Index = BaseIndexesModel.extend({
            url: 'cluster_blaster_indexes/sh_indexes_manager',
            initialize: function() {
                BaseIndexesModel.prototype.initialize.apply(this, arguments);
            }
        });

        return Index;
    }
);
