define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/Modal',
    'views/shared/controls/TextControl',
    'views/shared/controls/SyntheticCheckboxControl',
    'views/shared/FlashMessages',
    'contrib/text!views/shared/apps_remote/dialog/Login.html',
    'uri/route'
],
    function(
        $,
        _,
        module,
        BaseView,
        Modal,
        TextControlView,
        SyntheticCheckboxControl,
        FlashMessagesView,
        template,
        route
        ) {
        return BaseView.extend({
            template: template,
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.loginBtnLabel = this.options.loginBtnLabel || _('Login and Install').t();
                this.children.flashMessages = new FlashMessagesView({
                    model: this.model.auth
                });

                this.children.username = new TextControlView({
                    model: this.model.auth,
                    modelAttribute: 'username',
                    elementId: 'username',
                    placeholder: _('Username').t(),
                    updateOnKeyUp: true,
                    updateOnAutofill: true
                });

                this.children.password = new TextControlView({
                    model: this.model.auth,
                    modelAttribute: 'password',
                    elementId: 'password',
                    placeholder: _('Password').t(),
                    updateOnKeyUp: true,
                    password: true,
                    updateOnAutofill: true
                });

                this.children.consent = new SyntheticCheckboxControl({
                    modelAttribute: 'consent',
                    model: this.model.auth,
                    label: _('I have read the terms and conditions of the license and agree to be bound by them. ' +
                             'I accept that Splunk will securely send my login credentials over the Internet to splunk.com').t()
                });

                this.model.auth.on('change:consent', function(){
                    if (this.model.auth.get('consent')) {
                        this.$('.modal-btn-primary').removeClass('disabled');
                    } else {
                        this.$('.modal-btn-primary').addClass('disabled');
                    }
                }, this);
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    e.preventDefault();
                    $(e.target).text(_('Processing...').t()).addClass('disabled');
                    this.doLogin(this.model.auth.get('username'), this.model.auth.get('password'), this.model.auth.get('consent'));
                },

                'click .forgot-password': function(e) {
                    e.preventDefault();
                    var url = 'http://www.splunk.com/page/lost_password';
                    route.redirectTo(url, true);
                },

                'click #software-license': function(e) {
                    e.preventDefault();
                    var url = 'http://www.splunk.com/view/SP-CAAAAFA';
                    route.redirectTo(url, true);
                },

                'click #terms-conditions': function(e) {
                    e.preventDefault();
                    var url = 'https://d38o4gzaohghws.cloudfront.net/static/misc/eula.html';
                    route.redirectTo(url, true);
                }
            }),

            doLogin: function(user, pass, consent) {
                this.model.auth.on("invalid", function(model, error) {
                    this.restoreButton();
                }.bind(this));
                this.model.auth.save({
                    username: user,
                    password: pass,
                    consent: consent
                } , {
                    error: function (model, response, options) {
                        this.restoreButton();
                    }.bind(this),
                    success: function (model, response, options) {
                        this.model.wizard.set('step', 1);
                    }.bind(this)
                });
            },

            restoreButton: function(){
                this.$(Modal.FOOTER_SELECTOR).find('.modal-btn-primary').text(this.loginBtnLabel).removeClass('disabled');
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Login").t());
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                var template = this.compiledTemplate({
                    _: _
                });
                this.$(Modal.BODY_FORM_SELECTOR).append(template);
                this.children.flashMessages.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_FORM_SELECTOR).find('.username-placeholder').html(this.children.username.render().el);
                this.$(Modal.BODY_FORM_SELECTOR).find('.password-placeholder').html(this.children.password.render().el);
                this.$(Modal.BODY_FORM_SELECTOR).find('.consent-placeholder').html(this.children.consent.render().el);

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);

                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + this.loginBtnLabel + '</a>');
                if (!this.model.auth.get('consent')) {
                    this.$(Modal.FOOTER_SELECTOR).find('.modal-btn-primary').addClass('disabled');
                }

                this.children.username.focus();

                return this;
            }
        });
    });
