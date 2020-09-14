/**
 * @author jszeto
 * @date 7/30/14
 *
 * // TODO [JCS] Should we subclass SplunkDBase or just Base? We don't really use any of the EAI endpoint attributes and they aren't all fleshed out
 *
 * Sample data snippet:
 *
    {
       "entry": [],
       "messages": [
          {
            "type": "INFO",
            "text": "HunkPreview_1406750082.20"
          }
       ]
    }
 *
 * Attributes:
 *
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'models/Base',
    'util/splunkd_utils'
],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        splunkDUtils
        ) {

        // Private sync CRUD methods
        var syncCreate = function(model, options) {
            var url, appOwner = {},
                deferredResponse = $.Deferred(),
                defaults = {
                    data: {
                        output_mode: 'json'
                    }
                };

            url = _.isFunction(model.url) ? model.url() : model.url;
//            appOwner = extractAppOwner(options);
            $.extend(true, defaults, options);

            defaults.url = splunkDUtils.fullpath(url);
//            defaults.type = 'POST';
            defaults.data = splunkDUtils.normalizeValuesForPOST(defaults.data);
            defaults.processData = true;

            var bbXHR = Backbone.sync.call(null, "create", model, defaults);
            bbXHR.done(function() {
                deferredResponse.resolve.apply(deferredResponse, arguments);
            });
            bbXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });

            // make first request to create new preview data job with specified source file
            /*var createDfd = new BaseModel().save({}, {
                url: defaults.url,
                processData: true,
                type: defaults.type,
                data: defaults.data,
                success: function(createModel, response, options) {
                    var messages = response && response.messages,
                        jobId = messages && messages[0] && messages[0].text;
                        console.log("PreparePreview jobID",jobId);
                    // once created set model id and fetch preview payload
//                    makeSecondPreviewRequest(model, jobId, appOwner, defaults, deferredResponse);

                },
                error: function(createModel, response, options) {
                    // call backbone wrapped error handler which in turn calls
                    // user-specified error callback (if any) with (model, response, options)
                    defaults.error(response);
                }
            });
            createDfd.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });*/

            return deferredResponse.promise();
        };

        return BaseModel.extend({

            defaults: {
                previewSID: undefined
            },

            initialize: function(attrs, options) {
                BaseModel.prototype.initialize.call(this, attrs, options);

            },

            sync: function(method, model, options) {
                switch(method){
                    case 'create':
                        return syncCreate.call(this, model, options);
                    default:
                        throw new Error('invalid method: ' + method);
                }
            }
        });

    });
