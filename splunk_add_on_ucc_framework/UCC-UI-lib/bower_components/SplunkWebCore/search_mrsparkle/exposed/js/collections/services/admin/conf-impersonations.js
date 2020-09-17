/**
 * Created by ykou on 2/26/14.
 */
define(
    [
        "models/services/admin/Impersonation",
        "collections/SplunkDsBase"
    ],
    function(impersonationModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },

            /**
             * http://eswiki.splunk.com/Hunk_User_Impersonation#REST_endpoints
             * NOTE: the provider name is always something like 'provider:myprovidername'
             */
            url: 'admin/conf-impersonation',

            model: impersonationModel
        });
    }
);