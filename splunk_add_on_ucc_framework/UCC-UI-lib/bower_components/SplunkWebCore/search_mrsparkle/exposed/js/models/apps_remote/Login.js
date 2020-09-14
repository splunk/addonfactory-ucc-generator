define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'uri/route',
        'splunk.config'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        route,
        splunkConfig
        ) {
        return BaseModel.extend({
            initialize: function() {
                this.on('invalid', this._onerror, this);
                BaseModel.prototype.initialize.apply(this, arguments);
            },

            url: splunkConfig.SPLUNKD_PATH + '/apps/remote/login',

            sync: function(method, model, options) {
                if (method!=='create') {
                    throw new Error('invalid method: ' + method);
                }
                options = options || {};
                var defaults = {
                    data: {
                        password: model.get('password'),
                        username: model.get('username')
                    },
                    dataType: 'xml',
                    type: 'POST',
                    url: _.isFunction(model.url) ? model.url() : model.url || model.id,
                    processData: true
                };
                $.extend(true, defaults, options);
                return Backbone.sync.call(this, method, model, defaults);
            },

            validate: function(attributes, options) {
                if( !attributes.consent ) {
                    return 'You must agree to the Terms of Service';
                }
                return false;
            },

            parse: function(response, options) {
                var sessionKeyNode = response.getElementsByTagName('sessionKey')[0];
                return {sbsessionid: sessionKeyNode ? sessionKeyNode.textContent : ''};
            }
        });
    }
);
