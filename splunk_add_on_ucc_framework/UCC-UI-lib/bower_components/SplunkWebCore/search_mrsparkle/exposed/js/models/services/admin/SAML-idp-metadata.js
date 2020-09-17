define(
    [
        'underscore',
        'models/SplunkDBase',
        'util/splunkd_utils'
    ],
    function(
        _,
        BaseModel,
        splunkDUtils
        ) {
        return BaseModel.extend({
            url: 'admin/SAML-idp-metadata',
            urlRoot: 'admin/SAML-idp-metadata',

            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            isNew: function() {
                return false;
            },
            _onerror: function(collection, response, options) {
                // Remove 'In handler' prefix from server messages
                var messages = splunkDUtils.xhrErrorResponseParser(response, this.id);

                _.each(messages, function(msgObj) {
                    if (msgObj.message && msgObj.message.indexOf("In handler \'") > -1) {
                        msgObj.message = msgObj.message.substring( msgObj.message.indexOf("\': ")+3 );
                    }
                });

                this.trigger('serverValidated', false, this, messages);
            }
        });
    }
);