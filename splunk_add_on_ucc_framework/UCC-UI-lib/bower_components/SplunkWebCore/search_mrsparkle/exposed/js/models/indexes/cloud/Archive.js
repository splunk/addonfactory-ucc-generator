/**
 * @author jszeto
 * @date 3/18/15
 *
 * Represents a specific Archive
 *
 * Cloud-specific endpoint that is only available if the Cloud Administration app has been installed
 * (https://github.com/SplunkStorm/cloud_apps)
 *
 *
 */
define(
    [
        'jquery',
        'underscore',
        'models/SplunkDBase'
        //'models/services/data/Indexes'
    ],
    function(
        $,
        _,
        SplunkDBase
        //BaseIndexesModel
    ) {
        var Archive = SplunkDBase.extend({
            url: 'cluster_blaster_archives/sh_providers_manager',
            initialize: function() {
                SplunkDBase.prototype.initialize.apply(this, arguments);
            }
        });

        return Archive;
    }
);
