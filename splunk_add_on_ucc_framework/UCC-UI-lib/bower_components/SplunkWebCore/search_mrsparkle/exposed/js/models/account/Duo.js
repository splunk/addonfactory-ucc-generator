define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'uri/route',
        'splunk.config',
        'util/splunkd_utils'

    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        route,
        splunkConfig,
        splunkdutils
        ) {
        return BaseModel.extend({

            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },

            getCustomUrl: function(method){
                switch(method) {
                    case 'read':
                        return splunkConfig.MRSPARKLE_ROOT_PATH ? '/' + splunkConfig.MRSPARKLE_ROOT_PATH + '/' + splunkConfig.LOCALE + '/account/mfa/login': '/' + splunkConfig.LOCALE + '/account/mfa/login';
                    case 'create':
                        if (this.get('postUrl')) {
                            return this.get('postUrl');
                        }
                        return splunkConfig.MRSPARKLE_ROOT_PATH ? '/' + splunkConfig.MRSPARKLE_ROOT_PATH + '/' + splunkConfig.LOCALE + '/account/mfa/duologin' : '/' + splunkConfig.LOCALE + '/account/mfa/duologin';
                }
                return '';
            },

            sync: function(method, model, options) {
                if (method!=='read' &&  method!=='create') {
                    throw new Error('invalid method: ' + method);
                }
                var defaults = {};
                options = options || {};
                options.url = this.getCustomUrl(method);

                if(method == 'create'){
                    defaults.processData = true;
                    defaults.data = {
                        'sig_response': model.get('sig_response')
                    };
                }
                $.extend(true, defaults, options);
                return Backbone.sync.call(this, method, model, defaults);
            },

            _onerror: function(model, response, options){
                var status, text, message;

                if (response && response.hasOwnProperty('status')
                    && response.status == 401
                    && response.hasOwnProperty('responseJSON')
                    && typeof response.responseJSON == 'object'
                ){
                    status = response.responseJSON.status;
                    switch (status) {
                        case 4:
                            text = _('You must accept terms of service.').t();
                            message = splunkdutils.createMessageObject('auth_accept_tos', text);
                            break;
                        case 6:
                            text = response.responseJSON.message;
                            message = splunkdutils.createMessageObject('mfa_error', text);
                            break;
                        default:
                            message = splunkdutils.createMessageObject('mfa_unknown_error', _('Unknown error occured while processing Duo Multifactor Authentication.').t());
                    }
                }

                if (message) {
                    this.trigger('serverValidated', false, this, [message]);
                    model.error.set('message', message);
                } else {
                    BaseModel.prototype._onerror.call(this, model, response, options);
                }
            },
            hasError: function(){
                return !!this.error.get('message');
            },
            getErrorMessage: function(){
                return this.hasError() ? this.error.get('message').message: '';
            }
        });
    }
);
