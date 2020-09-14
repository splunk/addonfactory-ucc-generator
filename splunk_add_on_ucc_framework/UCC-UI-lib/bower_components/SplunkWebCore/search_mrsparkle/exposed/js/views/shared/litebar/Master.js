define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/appbar/Master',
    'views/shared/litebar/Logo',
    'views/shared/litebar/UserMenu',
    'views/shared/litebar/HelpMenu',
    'views/shared/litebar/ProductMenu',
    'views/shared/litebar/SideNav',
    './apps/Master',
    'views/shared/Icon',
    'models/services/AppLocal',
    'models/services/data/UserPrefGeneral',
    'models/services/configs/Web',
    'collections/services/AppLocals',
    'collections/services/Messages',
    'contrib/text!views/shared/litebar/Master.html',
    './Master.pcssm',
    'helpers/Session',
    'util/splunkd_utils',
    'splunk.util',
    'util/keyboard',
    'uri/route'
],
function(
    $,
    _,
    Backbone,
    module,
    AppBarView,
    Logo,
    UserMenu,
    HelpMenu,
    ProductMenu,
    SideNav,
    AppDropdown,
    IconView,
    AppModel,
    UserPref,
    WebConfModel,
    AppsCollection,
    MessagesCollection,
    templateMaster,
    css,
    Session,
    splunkDUtils,
    splunkUtil,
    keyboardUtil,
    route
) {
    var APP_LOGO_BLACKLIST = ['splunk_monitoring_console', 'splunk_management_console', 'splunk_instrumentation', 'system', 'dmc'];
    var View = AppBarView.extend({
        moduleId: module.id,
        css: css,
        template: templateMaster,
        initialize: function(options) {
            AppBarView.prototype.initialize.apply(this, arguments);
            this.webConfDfd = $.Deferred();

            this.children.hamburger = new IconView({icon: 'menu'});

            this.deferreds = {};
            this.deferreds.hamburger = $.Deferred();
            this.deferreds.logo = $.Deferred();
            this.deferreds.appNav = $.Deferred();
            this.deferreds.helpMenu = $.Deferred();
            this.deferreds.userMenu = $.Deferred();

            this.collection.filteredApps = {};

            this.children.sideNav = new SideNav({
                model: {
                    user: this.model.user,
                    serverInfo: this.model.serverInfo,
                    application: this.model.application,
                    userPref: this.options.model.userPref,
                    appLocal: this.model.appLocal,
                    webConf: this.model.webConf,
                    updateChecker: this.model.updateChecker
                },
                collection: this.collection
            });

            this.children.helpMenu = new HelpMenu({
                model: this.model,
                collection: this.collection
            });

            this.children.userMenu = new UserMenu({
                collection: {
                    currentContext: this.model.currentContext //this represents the current logged in user
                },
                model: {
                    user: this.model.user,
                    application: this.model.application,
                    webConf: this.model.webConf,
                    config: this.model.config,
                    serverInfo: this.model.serverInfo
                },
                showIcon: true
            });

            if (this.model && this.model.webConf){
                if (this.model.webConf.entry && this.model.webConf.entry.content &&
                    this.model.webConf.entry.content.has('showProductMenu')){
                    this.webConfDfd.resolve();
                } else {
                    this.model.webConf.on('sync ready', function() {
                        this.webConfDfd.resolve();
                    }, this);
                }
            }

            Session.on('restart timeout', function() {
                this.collection.messages.stopPolling();
            }, this);
            Session.on('start', function() {
                this.collection.messages.startPolling();
            }, this);

            this.collection.messages.on('sync update', function() {
                var messages = this.collection.messages.length,
                    messageSelector = this.$('.message-notification'),
                    licenseWillExpireMessage = this.collection.messages.find(function(message) {
                        return message.entry.get('name') == 'LM_LICENSE_EXPIRATION_STATUS';
                    });

                if (licenseWillExpireMessage && !this.model.serverInfo.isLicenseStateExpired()) {
                    messages--;
                }

                messageSelector.text(messages);
                if (messages > 0) {
                    messageSelector.show();
                } else {
                    messageSelector.hide();
                }
            }, this);

            this.model.userPref.on('change', this.updateNotification, this);
            this.collection.messages.on('change reset remove', this.updateNotification, this);
            this.model.appNav.on('rendered', this.collapseAppNav, this);

            this.navOpen = false;

            var resizing = _.debounce(this.collapseAppNav.bind(this), 300);
            $(window).resize(function() {
                resizing();
                this.$('[data-role=right-nav]').attr('data-action', 'resizing-nav-right');
            }.bind(this));

            this.children.appNav.on('addedToDocument', function() {
               this.deferreds.appNav.resolve();
            }, this);

            this.children.helpMenu.on('addedToDocument', function() {
               this.deferreds.helpMenu.resolve();
            }, this);

            this.children.userMenu.on('addedToDocument', function() {
               this.deferreds.userMenu.resolve();
            }, this);

            this.children.hamburger.on('addedToDocument', function() {
               this.deferreds.hamburger.resolve();
            }, this);
        },

        events: {
            'click [data-role=sidenav-toggle]': function(e) {
                e.preventDefault();
                this.openNav();
            },
            'click [data-role=sidenav-screen]': function(e) {
                e.preventDefault();
                this.closeNav();
            },
            'click [data-role=sidenav-toggle-active]': function(e) {
                e.preventDefault();
                this.closeNav();
            }
        },

        openNav: function() {
            this.children.sideNav.$el.css('left', 0);
            $('body').attr('data-sidenav-state', 'open');
            $('[data-role=sidenav-toggle]').attr('data-role', 'sidenav-toggle-active');
            this.$('[data-role=sidenav-screen]').fadeIn(500);
            this.children.sideNav.$('a:visible').attr('tabindex', '').first().focus();
            this.$('[data-role="message-notification"]').fadeOut(500);
            $(window).on('keydown', this.keyDown.bind(this));
            this.navOpen = true;
        },

        closeNav: function() {
            this.children.sideNav.$el.css('left', -300);
            $('body').removeAttr('data-sidenav-state');
            $('[data-role=sidenav-toggle-active]').attr('data-role', 'sidenav-toggle');
            this.$('[data-role=sidenav-screen]').fadeOut(500);
            this.children.sideNav.$('a:visible').attr('tabindex', '-1');
            $('[data-role=sidenav-toggle]').focus();
            $(window).off('keydown');
            if (this.$('[data-role="message-notification"]').text() !== '0') {
                this.$('[data-role="message-notification"]').fadeIn(500);
            }
            this.navOpen = false;
        },

        keyDown: function(e) {
            if (e.which === keyboardUtil.KEYS.ESCAPE) {
                e.preventDefault();
                this.closeNav();
            } else if (e.which === keyboardUtil.KEYS.TAB) {
                e.preventDefault();
                keyboardUtil.handleCircularTabbing(this.children.sideNav.$('[data-role=sidenav-body]'), e);
            }
        },

        updateNotification: function() {
            var messagesCount = this.collection.messages.length || 0,
                $messageSelector = this.$('[data-role="message-notification"]'),
                splunkMessageCount = this.children.sideNav.children.messages.numSplunkMessages || 0;

            messagesCount = messagesCount + splunkMessageCount;
            $messageSelector.text(messagesCount);
            if (messagesCount > 0 && !this.navOpen) {
                $messageSelector.show();
            } else {
                $messageSelector.hide();
            }
        },

        renderLogo: function() {
            this._getFilteredApps();
            var appId = this._getAppId(),
                appName = this._getAppName(appId),
                appNameShort = (appName) ? appName.replace('Splunk Add-on for', '').replace('Splunk App for', '').trim() : '',
                useLogo = this.collection.filteredApps.length <= 1;

            this.children.logo = new Logo({
                model: {
                    application: this.model.application
                },
                appId: appId,
                appName: appNameShort,
                useLink: useLogo
            });

            if (!useLogo) {
                // Match local apps with app whitelist
                this.children.appDropdown = new AppDropdown({
                    apps: this.collection.filteredApps,
                    model: {
                        application: this.model.application
                    },
                    label: this.children.logo,
                    title: splunkUtil.sprintf('Splunk > %s', (appId == 'search') ? 'Light' : appNameShort)
                });

                this.children.appDropdown.on('addedToDocument', function() {
                   this.deferreds.logo.resolve();
                }, this);

                this.children.appDropdown.render().replaceAll(this.$('[data-role=logo]'));
            } else {
                this.children.logo.on('addedToDocument', function() {
                   this.deferreds.logo.resolve();
                }, this);

                this.children.logo.render().replaceAll(this.$('[data-role=logo]'));
            }
        },

        _getNavWidthDiff: function(mainWidth) {
            var halfMain = mainWidth/2;

            return mainWidth - this._getNavWidths() || halfMain;
        },

        _getNavWidths: function() {
            var hamburgerWidth = this.$('[data-role=sidenav-toggle]').outerWidth(),
                brandWidth = this.$('[data-role=logo]').outerWidth(),
                appMenuWidth = this.$('[data-role=app-menu]').outerWidth(),
                rightNavWidth = this.$('[data-role=right-nav]').outerWidth() + 100; //compensates for more menu and app dropdown

            return hamburgerWidth + brandWidth + appMenuWidth + rightNavWidth;
        },

        _getAppId: function() {
            var appId = this.model.application.get('app') || 'search';
            appId = (APP_LOGO_BLACKLIST.indexOf(appId) > -1) ? 'search' : appId;
            return appId;
        },

        _getAppName: function(appId) {
            var currentAppModel = this.collection.apps.find(function(app) {
                    return app.entry.get('name') == appId;
                }),
                appName = (currentAppModel &&
                                currentAppModel.entry.content.get('label'))
                                ? currentAppModel.entry.content.get('label') : appId;
            return appName;
        },

        _getFilteredApps: function() {
            var appWhitelist = this.model.userPref.entry.content.get('app_list');

            appWhitelist = (appWhitelist) ? appWhitelist.split(',') : ['search'];

            this.collection.filteredApps = this.collection.apps.filter(function(app) {
                var appName = app.entry.get('name');
                return appWhitelist.indexOf(appName) > -1;
            }.bind(this)).map(function(model, key, list) {
                var app = {
                    href: splunkUtil.make_url('/app/' + model.entry.get('name')),
                    label: model.entry.content.get('label'),
                    name: model.entry.get('name')
                };
                return app;
            });
        },

        render: function() {
            var html = this.compiledTemplate({
                css: this.css
            });

            this.$el.html(html);

            this.renderLogo();

            this.children.hamburger.render().prependTo(this.$('[data-role=sidenav-toggle]'));
            this.children.appNav.render().prependTo(this.$('[data-role=app-nav]'));
            this.children.helpMenu.render().replaceAll(this.$('[data-role=help-menu]'));
            this.children.userMenu.render().replaceAll(this.$('[data-role=user-menu]'));

            this.$el.after(this.children.sideNav.render().el);
            this.$el.append('<div class="' + this.css.sidenavScreen + '" data-role="sidenav-screen"></div>');

            $.when(this.webConfDfd).done(function() {
                var isCloud = this.model.serverInfo.isCloud(),
                    showProductMenu = splunkUtil.normalizeBoolean(this.model.webConf.entry.content.get('showProductMenu'));

                if (isCloud && showProductMenu) {
                    this.children.productMenu = new ProductMenu({
                        model: this.model,
                        collection: this.collection
                    });
                    this.$('[data-role=product-menu]').replaceWith(this.children.productMenu.render().el);
                } else {
                    this.$('[data-role=product-menu]').remove();
                }
            }.bind(this));

            // Setting tabindex to -1 on all links while side nav is closed
            this.children.sideNav.$('a:visible').attr('tabindex', '-1');

            $.when(this.deferreds.hamburger, this.deferreds.logo, this.deferreds.appNav, this.deferreds.helpMenu, this.deferreds.userMenu).then(function() {
                this.collapseAppNav();
            }.bind(this));

            return this;
        }
    },
    {
        _getApp: function(options) {
            var appName = options.model.application.get('app') || 'search';
            return (APP_LOGO_BLACKLIST.indexOf(appName) > -1) ? 'search' : appName;
        },

        create: function(options) {
            options = options || {};
            options.collection = options.collection || {};
            options.model = options.model || {};
            if (options.useSessionStorageCache === true) {
                this._createFromCache(options);
            } else {
                this._createDefault(options);
            }

            if (!options.model.userPref) {
                options.model.userPref = new UserPref();
                var userPrefDfd = options.model.userPref.fetch({data: {app:'user-prefs', owner: options.model.application.get('owner'), count:-1}});
                $.when(userPrefDfd).then(function() {
                    options.model.userPref.entry.content.trigger('ready');
                });
            }

            var applicationDfd = $.Deferred();
            if(!options.model.appLocal) {
                options.model.appLocal = new AppModel();
                applicationDfd.done(function() {
                    if (this._getApp(options) !== 'system') {
                        options.model.appLocal.fetch({
                            url: splunkDUtils.fullpath(options.model.appLocal.url + "/" + encodeURIComponent('search')),
                            data: {
                                app: 'search',
                                owner: options.model.application.get("owner")
                            }
                        });
                    }
                });
            }

            if (!options.collection.apps) {
                options.collection.apps = new AppsCollection();
                options.collection.apps.fetch({
                    data: {
                        sort_key: 'name',
                        sort_dir: 'desc',
                        app: '-' ,
                        owner: options.model.application.get('owner'),
                        search: 'visible=true AND disabled=0 AND name!=launcher',
                        count:-1
                    }
                });
            }

            if (!options.collection.messages) {
                options.collection.messages = new MessagesCollection();
                options.collection.messages.fetchData.set({
                    "sort_key" : "timeCreated_epochSecs",
                    "sort_dir" : "desc"
                });
            }

            if (!options.model.webConf) {
                options.model.webConf = new WebConfModel({id: 'settings'});
                options.model.webConf.fetch({
                    success: function() {
                        options.model.webConf.trigger('ready');
                    }
                });
            } else {
                options.model.webConf.trigger('ready');
            }

            return new View(options);
        }
    });
    return View;
});
