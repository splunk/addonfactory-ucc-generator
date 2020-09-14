define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/Modal',
    'views/shared/ModalLocalClassNames',
    'views/shared/apps_remote/dialog/Login',
    'views/shared/apps_remote/dialog/Install',
    'views/shared/apps_remote/dialog/Success',
    'views/shared/apps_remote/dialog/Error',
    'views/shared/RestartRequired',
    'views/shared/Restart',
    'views/shared/FlashMessages',
    'uri/route',
    'models/services/apps/remote/EntriesById',
    'util/splunkd_utils',
    'splunk.util'
],
    function(
        $,
        _,
        Backbone,
        module,
        Modal,
        ModalNew,
        LoginView,
        InstallView,
        SuccessView,
        ErrorView,
        RestartRequiredView,
        RestartView,
        FlashMessagesView,
        route,
        EntriesByIdModel,
        splunkDUtils,
        splunkUtils
    ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                this.model.wizard = this.model.wizard || new Backbone.Model();

                this.model.entryById = new EntriesByIdModel();

                var _LoginView = this.options.loginViewClass || LoginView;
                this.children.login = new _LoginView({
                    model: {
                        auth: this.model.auth,
                        application: this.model.application,
                        wizard: this.model.wizard,
                        appRemote: this.model.appRemote
                    },
                    template: options.loginTemplate
                });

                var _InstallView = this.options.installViewClass || InstallView;
                this.children.install = new _InstallView($.extend(true, {}, {
                    model: {
                        appRemote: this.model.appRemote,
                        entryById: this.model.entryById
                    },
                    template: options.installTemplate,
                    customHeader: options.customHeader
                }, this.options.installViewOptions));

                var _SuccessView = this.options.successViewClass || SuccessView;
                this.children.success = new _SuccessView($.extend(true, {}, {
                    model: {
                        application: this.model.application,
                        appRemote: this.model.appRemote,
                        user: this.model.user,
                        wizard: this.model.wizard,
                        serverInfo: this.model.serverInfo,
                        entryById: this.model.entryById
                    },
                    collection: {
                        messages: this.collection.messages
                    },
                    template: options.successTemplate,
                    footerTemplate: options.footerSuccessTemplate
                }, this.options.successViewOptions));

                var _ErrorView = this.options.errorViewClass || ErrorView;
                this.children.error = new _ErrorView({
                    model: {
                        appRemote: this.model.appRemote,
                        entryById: this.model.entryById,
                        wizard: this.model.wizard,
                        auth: this.model.auth
                    },
                    collection: {
                        appLocals: this.collection.appLocals,
                        appLocalsUnfiltered: this.collection.appLocalsUnfiltered
                    }
                });

                // Don't add successRestartRequired to the children array because it's a Modal
                // and instantiating a Modal from a Modal doesn't work that well especially when hiding/showing
                // a modal from a modal.
                this.successRestartRequired = new RestartRequiredView({
                    model: {
                        serverInfo: this.model.serverInfo
                    },
                    message: splunkUtils.sprintf(_("You must restart Splunk %s to complete installation of %s.").t(),
                        this.model.serverInfo.getProductName(), this.model.appRemote.get('title')),
                    return_to: this.returnToURL(),
                    restartCallback: function () {
                        this.successRestartRequired.hide();
                        this.restart.render();
                        this.restart.show();
                    }.bind(this)
                });
                this.successRestartRequired.on('hide', function(event) {
                    if (event && event.reason) {
                        if (this.options.installSuccessCallback) {
                            var appId = this.model.appRemote.get('appid');
                            this.options.installSuccessCallback(appId);
                        }
                        this.hide();
                    }
                }.bind(this));

                // Don't add restart to the children array because it's a Modal
                // and instantiating a Modal from a Modal doesn't work that well especially when hiding/showing
                // a modal from a modal.
                this.restart = new RestartView({
                    model: {
                        serverInfo: this.model.serverInfo
                    }
                });

                this.model.wizard.on('change:step', function() {
                    this.visibility();
                }, this);

                this.collection.messages.on('sync', function() {
                    this.model.wizard.set('step', 2);
                }, this);

                this.model.wizard.set('step', 0);
            },

            // Convenience method, overridden in apps_local/dialog/Master.js which subclasses this component.
            returnToURL: function() {
                return route.appsRemote(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get('app'));
            },

            installApp: function() {
                this.model.entryById.set('id', splunkDUtils.fullpath(this.model.entryById.url + '/' + encodeURIComponent(this.model.appRemote.get('appid'))));
                this.model.entryById.entry.content.set({action: 'install', auth: this.model.auth.get('sbsessionid')});
                this.model.entryById.save({}, {
                    success: function(model, response, options) {
                        this.collection.messages.fetch();
                        this.trigger('onInstallSuccess');
                    }.bind(this),
                    error: function(model, response, options) {
                        this.model.entryById.errorText = response.responseText;
                        this.model.wizard.set('step', -1);
                    }.bind(this)
                });
            },

            unbindHide: function() {
                this.on('hide', null);
            },

            hideDialogs: function() {
                this.children.error.$el.hide();
                this.children.login.$el.hide();
                this.children.install.$el.hide();
                this.children.success.$el.hide();
                this.successRestartRequired.hide();
                this.restart.hide();
            },

            visibility: function() {
                this.unbindHide();
                this.hideDialogs();

                var step = this.model.wizard.get('step');
                switch (step) {
                    case -1:
                        this.children.error.render();
                        this.children.error.$el.show();
                        break;
                    case 0:
                        this.children.login.$el.show();
                        break;
                    case 1:
                        this.installApp();
                        this.children.install.$el.show();
                        break;
                    case 2:
                        if (this.needsRestart()) {
                            this.hide();
                            this.successRestartRequired.render();
                            this.successRestartRequired.show();
                        } else {
                            this.children.success.render();
                            this.children.success.$el.show();
                            // Only register this event handler here so it triggers the installSuccess callback
                            // only when success view is hiding this modal.
                            this.on('hide', function(event){
                                if (this.options.installSuccessCallback) {
                                    var appId = this.model.appRemote.get('appid');
                                    this.options.installSuccessCallback(appId);
                                }
                            }.bind(this));
                        }
                        break;
                    default:
                        this.children.login.$el.show();
                        break;
                }
            },

            needsRestart: function() {
                if (this.collection.messages.length > 0) {
                    for (var i = 0; i < this.collection.messages.models.length; i++) {
                        if (this.collection.messages.models[i].entry.get('name') === 'restart_required') {
                            return true;
                        }
                    }
                }
                return false;
            },

            render: function() {
                this.$el.append(this.children.login.render().el);
                this.$el.append(this.children.install.render().el);
                this.$el.append(this.children.success.render().el);
                this.$el.append(this.children.error.render().el);
                this.$el.append(this.successRestartRequired.render().el);
                this.$el.append(this.restart.render().el);
                this.visibility();
                return this;
            }
        });
    });
