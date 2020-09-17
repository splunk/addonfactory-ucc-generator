/**
 * @author jszeto
 * @date 5/1/15
 *
 * Base model for POSTing to one of an EAI model's link actions. These endpoints are a little unusual. They often return
 * an EAI payload of the model you performed the action upon. But they don't receive an EAI payload when you POST to them. 
 * 
 * This particular base model won't parse the EAI payload it receives. It will handle an errors from the endpoint, though.
 *
 * Perhaps at some point we can add this model as a class attribute to the SplunkDBase model. When this link model performs
 * a sync, the SplunkDBase model can listen for that and parse the EAI payload from the link model's POST request. This
 * would work for actions that return a payload for that given model, like the enable or disable actions.
 */
define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        BaseModel,
        splunkd_utils
    ) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            sync: function(method, model, options) {
                var defaults = {data: {output_mode: 'json'},
                                processData: true,
                                type: 'POST'};

                switch(method){
                    case 'create':
                    case 'update':
                    {
                        var url = splunkd_utils.fullpath(model.id, {});
                        defaults.url = splunkd_utils.fullpath(url);
                        $.extend(true, defaults, options);
                        return BaseModel.prototype.sync(method, model, defaults);
                    }
                    default:
                        throw new Error('invalid method: ' + method);
                }
            }
        });
    }
);
