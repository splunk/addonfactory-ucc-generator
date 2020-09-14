define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'contrib/text!views/shared/apps_remote/apps/app/Master.html',
        'uri/route',
        'views/shared/apps_remote/apps/app/AppDetails',
        'views/shared/apps_remote/dialog/Master'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        template,
        route,
        AppDetailsView,
        DialogView
        ){
        return BaseView.extend({
            template: template,
            moduleId: module.id,
            className: 'lite_app result-app-wrapper splClearfix',
            installMethodKey: 'install_method',
            initialize: function () {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.appDetails = new AppDetailsView({
                    model: {
                        metadata: this.model.metadata,
                        appRemote: this.model.appRemote
                    },
                    collection: {
                        options: this.collection.options
                    }
                });
            },

            events: {
                'click .app-more-description, .app-less-description': function(e) {
                    e.preventDefault();
                    this.$('.app-description-short, .app-description-full').toggle();
                },

                'click .install-button': function(e) {
                    e.preventDefault();

                    this.showDialog();
                },

                'click .disabled': function(e) {
                    e.preventDefault();
                }
            },

            showDialog: function() {
                var _DialogView = this.options.dialogViewClass || DialogView;
                this.children.dialogView = new _DialogView({
                    model: this.model,
                    collection: this.collection,
                    onHiddenRemove: true,
                    installSuccessCallback: function() {
                        this.installSuccessCallback();
                    }.bind(this)
                });

                $('body').append(this.children.dialogView.render().el);
                this.children.dialogView.show();
            },

            installSuccessCallback: function(appId){
                this.collection.appLocals.fetch({
                    data: {
                        count: -1
                    },
                    success: function(collection, response) {
                        this.render();
                    }.bind(this)
                });
            },

            render: function () {
                var appId = this.model.appRemote.get('appid'),
                    localApp = this.collection.appLocals.findByEntryName(appId),
                    appContent = {};
                if ( !this.collection.appLocals.links.get('create') ) { // user does not have permission
                    appContent['link'] = route.splunkbaseApp(this.model.appRemote.get('uid'));
                    appContent['buttonText'] = _('View on Splunkbase').t();
                    appContent['buttonClass'] = 'more-info';
                } else if ( localApp ) { // already installed
                    appContent = this.localRender(appId, localApp);
                } else if ( this.model.serverInfo.isCloud() ) {
                    appContent = this.cloudRender(this.model.appRemote.get(this.installMethodKey));
                } else if ( this.model.appRemote.isInstallable() ) {
                    appContent['buttonText'] = _('Install').t();
                    appContent['buttonClass'] = 'btn-primary install-button';
                    appContent['link'] = "#";
                } else {
                    appContent['link'] = route.splunkbaseApp(this.model.appRemote.get('uid'));
                    appContent['buttonText'] = _('View on Splunkbase').t();
                    appContent['buttonClass'] = 'more-info';
                }

                this.renderAppContent(appContent);
                return this;
            },

            renderAppContent: function(appContent) {
                var template = this.compiledTemplate({
                    model: this.model.appRemote,
                    description: this.model.appRemote.get('description'),
                    descriptionMaxLength: 380,
                    certified: this.model.appRemote.get('cert_status'),
                    application: this.model.application,
                    route: route,
                    collection: this.collection.appLocals,
                    appContent: appContent,
                    _: _
                });
                this.$el.html(template);
                this.children.appDetails.render().appendTo(this.$('.app'));
            },

            cloudRender: function(install_method) {
                var appId = this.model.appRemote.get('appid'),
                    localApp = this.collection.appLocals.findByEntryName(appId);

                if (localApp && localApp.entry.links.has('update')) {
                    return {
                        messageText: _('Please file a support case to upgrade this app.').t(),
                        buttonText: _('Request Upgrade').t(),
                        buttonClass: 'disabled'
                    };
                } else {
                    switch (install_method) {
                        case 'simple':
                            return {
                                buttonText: _('Install').t(),
                                buttonClass: 'btn-primary install-button'
                            };
                        case 'assisted':
                            return {
                                messageText: _('Please file a support case to install this app.').t(),
                                buttonText: _('Request Install').t(),
                                buttonClass: 'disabled'
                            };
                        case 'rejected':
                            return {
                                messageText: _('This app is not available for Splunk Cloud.').t(),
                                buttonText: _('Unavailable').t(),
                                buttonClass: 'disabled'
                            };
                        case 'unknown':
                            return {
                                messageText: _('This app is not yet certified for Splunk Cloud. Please file a support case to request this app.').t(),
                                buttonText: _('Not Yet Available').t(),
                                buttonClass: 'disabled'
                            };
                        default:
                            return {
                                buttonText: _('Unavailable').t(),
                                buttonClass: 'disabled'
                            };
                    }
                }
            },

            localRender: function(appId, localApp) {
                if ( localApp.entry.links.has('update') ) {
                    if ( this.model.serverInfo.isCloud() && this.model.appRemote.get('install_method') !== 'simple') {
                        return {
                            messageText: _('Please file a support case to upgrade this app.').t(),
                            buttonClass: 'disabled',
                            buttonText: _('Request Upgrade').t()
                        };
                    } else {
                        var link = route.manager(
                                this.model.application.get('root'),
                                this.model.application.get('locale'),
                                'appinstall',
                                appId,
                                {data: {return_to: window.location}});
                        return {
                            buttonText: _('Update').t(),
                            link: link
                        };
                    }
                } else {
                    var appLink = route.prebuiltAppLink(this.model.application.get('root'), this.model.application.get('locale'), appId, '');
                    return {
                        buttonText: _('Open App').t(),
                        link: appLink
                    };
                }
            }
        });
    });
