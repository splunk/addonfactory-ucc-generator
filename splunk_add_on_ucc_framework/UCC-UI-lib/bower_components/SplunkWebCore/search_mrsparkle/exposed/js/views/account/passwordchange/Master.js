define(
    [
        'module',
        'contrib/text!views/account/passwordchange/Master.html',
        'underscore',
        'splunk.util',
        'uri/route',
        'models/account/PasswordChange',
        'views/Base',
        'views/shared/controls/TextControl',
        'views/shared/FlashMessages',
        'views/account/passwordchange/Skip'
    ],
    function(module, template, _, splunkutil, route, PasswordChangeModel, BaseView, TextControlView, FlashMessagesView, SkipView) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.model.passwordChange = new PasswordChangeModel({}, {loginModel: this.model.login});
                this.children.newpassword = new TextControlView({
                    model: this.model.passwordChange,
                    modelAttribute: 'newpassword',
                    elementId: 'newpassword',
                    placeholder: _('New password').t(),
                    password: true
                });
                this.children.confirmpassword = new TextControlView({
                    model: this.model.passwordChange,
                    modelAttribute: 'confirmpassword',
                    elementId: 'confirmpassword',
                    placeholder: _('Confirm new password').t(),
                    password: true
                });
                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        login: this.model.login,
                        user: this.model.user,
                        passwordChange: this.model.passwordChange
                    },
                    template: '\
                        <% flashMessages.each(function(flashMessage){ %>\
                            <p class="error"><%= flashMessage.get("html") %></p>\
                        <% }); %>\
                    '
                });
                this.children.skip = new SkipView({
                    model: {
                        application: this.model.application,
                        login: this.model.login
                    }
                });
            },
            events: {
                'submit form': function(e) {
                    e.preventDefault();
                    if (!this.model.passwordChange.isValid(true)) {
                        e.preventDefault();
                        return;
                    }
                    //optional first time run password change for authenticated user
                    if (!this.model.user.isNew()) {
                        this.model.user.entry.content.set('password', this.model.passwordChange.get('newpassword'));
                        this.model.user.save({}, {
                            headers: {
                                'X-Splunk-Form-Key': splunkutil.getFormKey()
                            }
                        });
                    //force password on unauthenticated user (operate on /account/login resource)
                    } else {
                        this.model.login.save({
                            cval: this.model.session.entry.content.get('cval'),
                            return_to: this.model.application.get('return_to'),
                            username: this.model.login.get('username'),
                            new_password: this.model.passwordChange.get('newpassword'),
                            set_has_logged_in: !this.model.session.entry.content.get('hasLoggedIn')
                        });
                    }
                }
            },
            visibility: function() {
                if (!this.model.login.isPasswordChangeRequired() && !this.model.session.entry.content.get('hasLoggedIn')) {
                    this.children.skip.render().$el.show();
                } else {
                    this.children.skip.render().$el.hide();
                }
            },
            show: function() {
                this.visibility();
                this.$el.show();
                this.children.newpassword.focus();
            },
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    model: {
                        application: this.model.application,
                        session: this.model.session,
                        login: this.model.login,
                        user: this.model.user,
                        passwordChange: this.model.passwordChange
                    },
                    route: route
                });
                this.$el.html(html);
                this.visibility();
                this.children.newpassword.render().insertBefore(this.$('input[type=submit]'));
                this.children.confirmpassword.render().insertBefore(this.$('input[type=submit]'));
                this.children.skip.render().appendTo(this.$el);
                this.children.flashMessages.render().appendTo(this.$el);
                return this;
            }
        });
    }
);
