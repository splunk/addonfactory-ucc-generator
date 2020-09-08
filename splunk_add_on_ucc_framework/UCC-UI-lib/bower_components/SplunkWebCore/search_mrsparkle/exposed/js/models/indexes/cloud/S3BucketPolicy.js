/**
 * @author jszeto
 * @date 8/10/15
 *
 * Given an S3 bucket name, dynamically generates an S3 Policy JSON blob. The user copies this JSON into
 * their AWS console under the permissions section.
 *
 * Cloud-specific endpoint that is only available if the Cloud Administration app has been installed
 * (https://github.com/SplunkStorm/cloud_apps)
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
        var S3BucketPolicy = SplunkDBase.extend({
            url: 'cluster_blaster_archives/s3_bucket_policy',
            initialize: function() {
                SplunkDBase.prototype.initialize.apply(this, arguments);
            },
            isNew: function() {
                return false;
            },
            // Override error handling since the endpoint will return an error response wrapped in a messages array
            _onerror: function(model, response, options) {
                var messages = this.parseSplunkDMessages(response.responseJSON);
                // Didn't find any splunk messages, so just revert to base class error handling
                if (messages.length == 0) {
                    return SplunkDBase.prototype._onerror.apply(this, arguments);
                } else {
                    // This will parse the response again, but it is cleaner to just call this function instead
                    // of reimplementing its functionality here
                    return this._onsync(model, response.responseJSON, options);
                }
            },

            sync: function(method, model, options) {
                //console.log("S3BUcketPolicy.sync method",method,"model",model);
                if (method != "read")
                    throw new Error("S3BucketPolicy only supports read");

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
                defaults.type = 'GET';
                defaults.data = splunkDUtils.normalizeValuesForPOST(defaults.data);
                defaults.processData = true;

                return Backbone.sync.call(null, "read", model, defaults);
            },

            parse: function(response, options) {
                // TODO [JCS] For now, put the JSON into a string and assign it to a new attribute
                response.policyJSON = JSON.stringify(response);
                return response;
            }
        });

        return S3BucketPolicy;
    }
);

