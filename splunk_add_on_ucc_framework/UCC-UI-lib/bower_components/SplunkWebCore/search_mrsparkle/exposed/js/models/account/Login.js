define(
[
    'jquery',
    'underscore',
    'backbone',
    'models/Base',
    'splunk.config',
    'util/splunkd_utils'
],
function(
    $,
    _,
    Backbone,
    BaseModel,
    splunkConfig,
    splunkdutils
) {
    return BaseModel.extend({
        initialize: function() {
            BaseModel.prototype.initialize.apply(this, arguments);
        },
        //localize splunkd known messages
        messages: [
            _('For security reasons, the admin on this account has requested that you change your password').t(),
            _('For security reasons, the new password must be at least 4 characters in length').t(),
            _('Empty passwords are not allowed.').t()
        ],
        url: '/account/login',
        sync: function(method, model, options) {
            if (method!=='create') {
                throw new Error('invalid method: ' + method);
            }
            options = options || {};
            var defaults = {
                    processData: true
                },
                url = '/' + splunkConfig.LOCALE + _.result(model, 'url');
            if (this.get('login_type') === "mfa") {
                defaults.data = {
                        return_to: model.get('return_to'),
                        accept_tos: model.get('accept_tos')
                };
            } else {
                defaults.data = {
                        cval: model.get('cval'),
                        username: model.get('username'),
                        password: model.get('password'),
                        new_password: model.get('new_password'),
                        return_to: model.get('return_to'),
                        accept_tos: model.get('accept_tos')
                };
            }
            if (this.isAdmin()) {//only admin should set .ui_login
                defaults.data.set_has_logged_in = model.get('set_has_logged_in');
            }
            if (splunkConfig.MRSPARKLE_ROOT_PATH) {
                url = splunkConfig.MRSPARKLE_ROOT_PATH + url;
            }
            defaults.url = url;
            $.extend(true, defaults, options);
            return Backbone.sync.call(this, method, model, defaults);
        },
        _onerror: function(model, response, options) {
            var responseData,
                status,
                text,
                message;
            if (response && response.hasOwnProperty('status') && response.status == 401) {
                try {
                    responseData = JSON.parse(response.responseText);
                } catch(e) { }
                if (responseData) {
                    status = responseData.status;
                    if (status==1) {
                        message = splunkdutils.createMessageObject('auth_fail', _('Invalid username or password.').t());
                    } else if (status==3) {
                        text = (responseData.message) ? gettext(responseData.message) : _('Your password must be changed.').t();
                        message = splunkdutils.createMessageObject('auth_force_change_pass', text);
                    } else if (status==4) {
                        text = _('You must accept terms of service.').t();
                        message = splunkdutils.createMessageObject('auth_accept_tos', text);
                    } else if (status==6) {
                        text = (responseData.message) ? gettext(responseData.message) : _('Multifactor authentication service is unavailable.').t();
                        message = splunkdutils.createMessageObject('mfa_unreachable', text);
                    }
                }
            }
            //custom messages via non-standard splunkd error response
            if (message) {
                this.trigger('serverValidated', false, this, [message]);
                model.error.set('messages', [message]);
            //classic error response parser
            } else {
                BaseModel.prototype._onerror.call(this, model, response, options);
            }
        },
        saveAsFree: function(cval, redirectTo) {
            return this.save({
                cval: cval,
                return_to: redirectTo,
                username: this.constructor.FREE_USERNAME,
                password: this.constructor.FREE_PASSWORD,
                set_has_logged_in: true
            });
        },
        hasErrorMessageType: function(type) {
            return splunkdutils.messagesContainsOneOfTypes(this.error.get('messages'), [type]);
        },
        isPasswordChangeRequired: function() {
            return this.hasErrorMessageType('auth_force_change_pass');
        },
        isTOSAcceptRequired: function() {
            return this.hasErrorMessageType('auth_accept_tos');
        },
        isAdmin: function() {
            return (this.get('username') || '').toLowerCase()==='admin';
        }
    },
    {
        FREE_USERNAME: 'admin',
        FREE_PASSWORD: 'freeneedsnopassword'    
    });
});
