define(
    [
        'jquery',
        'module',
        'contrib/text!./Master.html',
        'underscore',
        'splunk.util',
        'uri/route',
        'views/Base',
        'views/account/login/TextControl',
        'views/account/login/FirstTime',
        'views/account/login/Error'
    ],
    function($, module, template, _, splunkutil, route, BaseView, TextControlView, FirstTimeModalView, ErrorView) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.username = new TextControlView({
                    model: this.model.login,
                    modelAttribute: 'username',
                    elementId: 'username',
                    autocomplete: this.model.web.entry.content.get('enable_autocomplete_login'),
                    updateOnAutofill: true,
                    placeholder: _('Username').t(),
                    updateOnKeyUp: true,
                    disabled: this.model.serverInfo.isLicenseStatePreviouslyKeyed()
                });
                this.children.password = new TextControlView({
                    model: this.model.login,
                    modelAttribute: 'password',
                    elementId: 'password',
                    autocomplete: this.model.web.entry.content.get('enable_autocomplete_login'),
                    updateOnAutofill: true,
                    placeholder: _('Password').t(),
                    updateOnKeyUp: true,
                    password: true,
                    trimTrailingSpace: false,
                    disabled: this.model.serverInfo.isLicenseStatePreviouslyKeyed()
                });
                this.children.firstTimeModal = new FirstTimeModalView();
                this.children.error = new ErrorView({
                    model: {
                        login: this.model.login,
                        serverInfo: this.model.serverInfo,
                        application: this.model.application,
                        session: this.model.session,
                        mfaStatus: this.model.mfaStatus,
                        duo: this.model.duo
                    }
                });
                this.listenTo(this.model.login, 'error', function() {
                    this.shakeIt();
                    if (this.$el.is(':visible') && this.$('input[type=submit]').is(':focus')) {
                        this.children.username.focus();
                    }
                });
            },
            events: {
                'click a.hint': function(e) {
                    this.children.firstTimeModal.show();
                    e.preventDefault();
                },
                'submit form': function(e) {
                    this.model.login.save({
                        cval: this.model.session.entry.content.get('cval'),
                        return_to: this.model.application.get('return_to'),
                        set_has_logged_in: !this.model.session.entry.content.get('hasLoggedIn')
                    });
                    e.preventDefault();
                }
            },
            show: function() {
                this.$el.show();
                this.children.username.focus();
            },
            shakeIt: function() {
                var duration = 80;
                var offset = 10;

                this.$('.loginForm fieldset').animate({marginLeft:('-='+ offset)}, duration,function(){
                    $(this).animate({marginLeft:('+=' + offset*2)}, duration, function(){
                        $(this).animate({marginLeft:('-=' + offset*2)}, duration, function(){
                            $(this).animate({marginLeft:('+='+ offset)}, duration);
                        });
                    });
                });
            },
            render: function() {
                var html = this.compiledTemplate({
                    _: _,
                    model: {
                        application: this.model.application,
                        serverInfo: this.model.serverInfo,
                        session: this.model.session,
                        web: this.model.web,
                        login: this.model.login
                    },
                    route: route,
                    splunkutil: splunkutil
                });
                this.$el.html(html);
                this.children.username.render().insertBefore(this.$('input[type=submit]'));
                this.children.password.render().insertBefore(this.$('input[type=submit]'));
                this.children.firstTimeModal.render().insertBefore(this.$('fieldset'));
                if (this.$('.login-content').length) {
                    this.children.error.render().insertBefore(this.$('.login-content'));
                } else {
                    this.children.error.render().appendTo(this.el);
                }
                if (!this.model.session.entry.content.get('hasLoggedIn')
                        && this.model.application.get('page')==='login'
                        && !this.model.serverInfo.isCloud()) {
                    this.children.firstTimeModal.show();
                }
                return this;
            }
        });
    }
);
