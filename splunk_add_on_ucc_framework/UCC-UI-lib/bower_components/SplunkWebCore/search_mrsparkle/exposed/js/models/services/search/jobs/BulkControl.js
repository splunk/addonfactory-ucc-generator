define(
    [
        'underscore',
        'jquery',
        'backbone',
        'models/StaticIdBase',
        'util/splunkd_utils',
        'splunk.util'
     ],
     function(
        _,
        $,
        Backbone,
        BaseModel,
        splunkDUtils,
        splunkUtil
    ) {
        return BaseModel.extend({
            url: splunkUtil.make_url('api/search/jobs/control'),
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
            },

            sync: function(method, model, options) {
                var defaults = {
                    data: {
                        output_mode: 'json'
                    }
                };
                switch(method) {
                    case 'update':
                        defaults.processData = true;
                        defaults.type = 'POST';
                        $.extend(true, defaults, options);
                        break;
                    default:
                        throw new Error('invalid method: ' + method);
                    }
                return Backbone.sync.call(this, method, model, defaults);
            },
            
            parseSplunkDMessages: function(response) {
                if (!response) {
                    return [];
                }

                var messages = response.messages;
                if (!messages) {
                    return [];
                }
                
                return _(messages).map(function(message) {
                    return splunkDUtils.createMessageObject(message.type, message.message);
                });
            },
            
            getNumOfNotFoundJobs: function() {
                return _.where(this.get('messages'), { status: 404 }).length;
            }
        },
        {
            id: 'api/search/jobs/control'
        });
    }
);