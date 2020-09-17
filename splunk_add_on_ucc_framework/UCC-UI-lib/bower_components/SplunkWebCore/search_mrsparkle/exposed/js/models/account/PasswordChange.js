define(
[
    'underscore',
    'models/Base',
    'models/account/Login'
],
function(
    _,
    BaseModel,
    LoginModel
) {
    return BaseModel.extend({
        initialize: function(attributes, options) {
            BaseModel.prototype.initialize.apply(this, arguments);
            options || (options={});
            var loginModel = options.loginModel;
            if (!options.loginModel || !(loginModel instanceof LoginModel)) {
                throw 'The following constructor arguments are required ({}, {loginModel: <models/account/Login>}).';
            }
            this.associated.loginModel = loginModel;
            this.loginModel = loginModel;
        },
        validation: {
            newpassword: function(value) {
                if (!value) {
                    return _("New password is required.").t();
                }
                if (this.loginModel.isAdmin() && value==="changeme") {
                    return _("For security reasons, the new password must be different from the default one.").t();
                }
            },
            confirmpassword: {
                equalTo: 'newpassword',
                msg: _("Passwords didn't match, please try again.").t()
            }
        },
        sync: function() {
            throw 'No REST service defined for Password Change model.';
        }
    });
});
