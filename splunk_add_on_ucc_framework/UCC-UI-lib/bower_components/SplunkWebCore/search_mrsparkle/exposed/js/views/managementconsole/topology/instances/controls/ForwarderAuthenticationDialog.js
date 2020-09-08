define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/Base',
        'collections/shared/FlashMessages',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/managementconsole/topology/instances/controls/ForwarderAuthenticationControl',
        'views/managementconsole/shared/TopologyProgressControl',
        './ForwarderAuthenticationDialog.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseModel,
        FlashMessagesCollection,
        FlashMessagesView,
        Modal,
        ControlGroup,
        ForwarderAuthenticationControl,
        TopologyProgressControl,
        css
    ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,

            initialize: function(options) {
                options = _.defaults(options, {
                    keyboard: false,
                    backdrop: 'static'
                });
                Modal.prototype.initialize.call(this, options);

                this.canEnableDisableAuth = this.model.user.canEditForwarderAuth();
                this.initializeForwarderAuthenticationControl();
                this.initializeFlashMessages();

                this.children.progressControl = new TopologyProgressControl({
                    buttonHidden: true,
                    model: {
                        topologyTask: this.model.fwdAuthTask
                    }
                });
                this.listenTo(this.model.fwdAuthTask.entry, 'change:name', _.debounce(this._renderProgressControl.bind(this)));
                this.listenTo(this.model.fwdAuthTask, 'taskFinished', this.hide);
                this.listenTo(this.model.forwarderSetup, 'sync', this.debouncedRender);
            },

            // This method sets up temporary model for inputs from ForwarderAuthenticationControl
            initializeForwarderAuthenticationControl: function() {

                var AuthInputModel = BaseModel.extend({
                    validation: {
                        secret: {
                            fn: function(value, attr, obj) {
                                if (!value) {
                                    return _('Security Key cannot be empty').t();
                                } else if ( /^(\*)\1*$/.test(value) )  {
                                    return _('Security key cannot contain all * characters').t();
                                }
                                return false;
                            }
                        }
                    }
                });

                this.model.authInput = new AuthInputModel({
                    requireAuthentication: this.model.forwarderSetup.entry.content.get('requireAuthentication'),
                    secret: this.model.forwarderSetup.entry.content.get('dsClearPassword')
                });

                this.children.fwdauthenticationControl = new ForwarderAuthenticationControl({
                    model: {
                        authInput: this.model.authInput
                    },
                    canEnableDisableAuth: this.canEnableDisableAuth
                });
            },

            initializeFlashMessages: function() {
                this.children.flashMessages = new FlashMessagesView({
                    model: [this.model.authInput, this.collection.topologies.models[0]]
                });
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    e.preventDefault();

                    if (this.model.authInput.validate()) {
                        return;
                    }

                    // backend does not like us posting requireAuth
                    if (!this.canEnableDisableAuth) {
                        this.model.authInput.unset('requireAuthentication');
                    }

                    var data = {
                            deploymentServer: this.model.authInput
                        },
                        topologyModel = this.collection.topologies.models[0];

                    topologyModel.set({ data: data });
                    topologyModel.save().done(function(response) {
                        this.model.fwdAuthTask.entry.set('name', response.entry[0].content.task.taskId);
                    }.bind(this));
                }
            }),

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_.escape(_("Forwarder Authentication").t()));

                this.$(Modal.BODY_SELECTOR).append(this.children.flashMessages.render().el);
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this._renderContent();

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                return this;
            },

            _renderContent: function() {
                this.$(Modal.BODY_FORM_SELECTOR).html(this.compiledTemplate());

                this._renderProgressControl();

                this.children.fwdauthenticationControl.render().appendTo(this.$('.fwdAuth-control-placeholder'));
            },

            _renderProgressControl: function() {
                var taskId = this.model.fwdAuthTask.entry.get('name');
                if (taskId) {
                    this.children.progressControl.setTaskId(taskId);
                    this.$('.progress-text').show();
                } else {
                    this.$('.progress-text').hide();
                }
                this.children.progressControl.render().$el.appendTo(this.$('.fwdAuth-progress'));
            },

            template: '\
                <div class="fwdAuth-control-placeholder"></div>\
                <div class="fwdAuth-progress"><div class="progress-text pull-right"><%- _("Saving...").t() %></div></div>\
            '
        });
    }
);