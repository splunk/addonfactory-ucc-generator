define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'bootstrap.tooltip'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseView,
        ControlGroup
        // bootstrap tooltip
    ) {
        var STRINGS = {
            insufficientPermissions: _('You do not have permission to modify this field.').t()
        };

        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                if (_.isUndefined(this.options.hideText)) {
                    this.options.hideText = false;
                }

                if (_.isUndefined(this.options.showAutoGenerateOption)) {
                    this.options.showAutoGenerateOption = false;
                }


                this.children.authenticationControl = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    label: _('Forwarder Authentication').t(),
                    controlOptions: {
                        model: this.model.authInput,
                        modelAttribute: 'requireAuthentication',
                        items: [
                            { label: _('Enabled').t(), value: true },
                            { label: _('Disabled').t(), value: false }
                        ]
                    },
                    enabled: this.options.canEnableDisableAuth
                });
                if (this.options.showAutoGenerateOption) {
                    this.children.autoGenerateControl = new ControlGroup({
                        controlType: 'SyntheticRadio',
                        label: _('Auto Generate Key').t(),
                        controlOptions: {
                            model: this.model.authInput,
                            modelAttribute: 'autoGenerate',
                            items: [
                                { label: _('Generate New Key').t(), value: true },
                                { label: _('Specify Your Own Key').t(), value: false }
                            ]
                        }
                    });

                    this.listenTo(this.model.authInput, 'change:autoGenerate', this._togglePasswordInput);
                }

                this.children.passwordInput = new ControlGroup({
                    controlType: 'Text',
                    label: _('Security Key').t(),
                    controlOptions: {
                        model: this.model.authInput,
                        modelAttribute: 'secret'
                    }
                });

                this.listenTo(this.model.authInput, 'change:requireAuthentication', this._renderPasswordInput);
            },

            render: function() {
                this.$el.html(this.compiledTemplate());

                this.children.authenticationControl.render().appendTo(this.$('.authentication-radio'));
                this.children.passwordInput.render().appendTo(this.$('.password-input'));
                if (this.children.autoGenerateControl) {
                    this.children.autoGenerateControl.render().appendTo(this.$('.auto-generate-radio'));
                }

                this._renderPasswordInput();

                if (this.options.hideText) {
                    this.$('.help-text').hide();
                }

                return this;
            },

            _renderPasswordInput: function() {
                this.model.authInput.get('requireAuthentication') ?
                    this.$('.extra-container').show() :
                    this.$('.extra-container').hide();
            },

            _togglePasswordInput: function() {
                this.model.authInput.get('autoGenerate') ?
                    this.children.passwordInput.disable() :
                    this.children.passwordInput.enable();
            },

            template: '\
                <div class="help-text"><%- _("Choose the authentication setting for your forwarders and click save.").t() %></div><br>\
                <div class="authentication-radio"></div>\
                <div class="extra-container">\
                    <div class="auto-generate-radio"></div>\
                    <div class="password-input"></div>\
                    <div class="alert alert-warning"><i class="icon-alert"></i><%- _("Note: When you enable Forwarder Authentication, you will have to supply the shared secret to all forwarders, even ones that are already connected to Forwarder Management. This means that any forwarder that is currently connected to Forwarder Management will get disconnected and you will have to add the shared secret").t() %></div>\
                </div>\
            '
        });
    }
);