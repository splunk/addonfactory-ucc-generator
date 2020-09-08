/**
 * @author jszeto
 * @date 5/28/15
 *
 * Tests whether a given s3 bucket can be written to
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
        'backbone',
        'models/SplunkDBase',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        Backbone,
        SplunkDBase,
        splunkDUtils
    ) {
        var S3TestConnection = SplunkDBase.extend({
            url: 'cluster_blaster_archives/s3_bucket_test_access',
            initialize: function() {
                SplunkDBase.prototype.initialize.apply(this, arguments);
            },
            isNew: function() {
                return false;
            },
            sync: function(method, model, options) {

                if (method != "update")
                    throw new Error("S3TestConnection only supports update");

                var url, appOwner = {},
                    deferredResponse = $.Deferred(),
                    defaults = {
                        data: {
                            output_mode: 'json'
                        }
                    };

                url = _.isFunction(model.url) ? model.url() : model.url;
                //appOwner = extractAppOwner(options);
                $.extend(true, defaults, options);
                $.extend(true, defaults.data, model.toJSON());

                defaults.url = splunkDUtils.fullpath(url, appOwner);
                defaults.type = 'POST';
                defaults.data = splunkDUtils.normalizeValuesForPOST(defaults.data);
                defaults.processData = true;

                return Backbone.sync.call(null, "update", model, defaults);
            }


        });

        return S3TestConnection;
    }
);

