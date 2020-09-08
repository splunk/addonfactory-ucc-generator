// splunk bar
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'splunk.util',
    'helpers/Session',
    'views/Base',
    'views/shared/Icon',
    'views/shared/splunkbar/MenuButton',
    'views/shared/delegates/Popdown',
    'views/shared/splunkbar/system/Master',
    'views/shared/splunkbar/user/Master',
    'views/shared/splunkbar/messages/Master',
    'views/shared/splunkbar/activity/Master',
    'views/shared/splunkbar/help/Master',
    'views/shared/splunkbar/find/Master',
    'views/shared/splunkbar/noconnection/Master',
    'views/shared/splunkbar/product/Master',
    'views/shared/splunkbar/apps/Master',
    'models/services/AppLocal',
    'models/shared/User',
    'models/services/server/ServerInfo',
    'models/services/configs/Web',
    'models/shared/Application',
    'models/services/data/UserPrefGeneral',
    'collections/services/authentication/CurrentContexts',
    'collections/services/AppLocals',
    'collections/services/Messages',
    'collections/services/data/ui/Managers',
    'collections/shared/splunkbar/SystemMenuSections',
    'contrib/text!views/shared/splunkbar/Master.html',
    './Master.pcssm',
    'uri/route',
    'util/splunkd_utils',
    'util/csrf_protection',
    'util/ajax_no_cache'
],
function(
    $,
     _,
     Backbone,
     module,
     splunkUtil,
     Session,
     BaseView,
     IconView,
     ButtonView,
     Popdown,
     SystemMenu,
     UserMenu,
     MessagesView,
     ActivityMenu,
     HelpMenu,
     FindBar,
     NoConnectionView,
     ProductMenu,
     AppMenuView,
     AppLocalModel,
     UserModel,
     ServerInfoModel,
     WebConfModel,
     ApplicationModel,
     UserPrefModel,
     CurrentContextsCollection,
     AppsCollection,
     MessagesCollection,
     ManagersCollection,
     SystemMenuSectionsCollection,
     template,
     css,
     route,
     splunkDUtils
){
    var View = BaseView.extend({
        moduleId: module.id,
        css: css,
        defaults: {
            showAppsList: true
        },
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.helpTemp = new ButtonView({label: _("Help").t()});
            this.children.activityTemp = new ButtonView({label: _("Activity").t()});
            this.children.systemTemp = new ButtonView({label: _("System").t()});
            this.children.messagesTemp = new ButtonView({label: _("Messages").t()});
            this.children.splunk = new IconView({icon: 'splunk'});
            this.children.prompt = new IconView({icon: 'greaterRegistered'});

            this.options = _.extend({},this.defaults, this.options);
            this.MAX_RETRIES_BEFORE_FAIL = 3;
            this.MESSAGES_POLLING_DELAY_STANDARD = 60000;
            this.MESSAGES_POLLING_DELAY_HI_FREQ = 1000;
            this.isFreeDfd = $.Deferred();
            this.userDfd = $.Deferred();
            this.appsDfd =  $.Deferred();
            this.serverInfoDfd = $.Deferred();
            this.webConfDfd = $.Deferred();
            this.cntRetries = 0;
            if (this.model && this.model.user && this.model.user.entry.content.has('realname')){
                this.userDfd.resolve();
            } else {
                this.model.user.on('sync', function() {
                    this.userDfd.resolve();
                }, this);
            }
            if (this.collection && this.collection.apps && this.collection.apps.length){
                this.appsDfd.resolve();
            } else {
                this.collection.apps.on('sync', function() {
                    this.appsDfd.resolve();
                }, this);
            }
            if (this.model && this.model.serverInfo) {
                if (this.model.serverInfo.hasAttr('isFree')) {
                    if (this.model.serverInfo.isFreeLicense()) {
                        this.isFreeDfd.resolve();
                    } else {
                        this.isFreeDfd.reject();
                    }
                } else {
                    this.model.serverInfo.on('change reset', function () {
                        if (this.model.serverInfo.isFreeLicense()) {
                            this.isFreeDfd.resolve();
                        } else {
                            this.isFreeDfd.reject();
                        }
                    }.bind(this));
                }
                if (this.model.serverInfo.hasAttr('product_type')){
                    this.serverInfoDfd.resolve();
                } else {
                    this.model.serverInfo.on('sync', function () {
                        this.serverInfoDfd.resolve();
                    }, this);
                }
            }
            this.collection.sections.on('reset', this.sectionsMunger, this);
            Session.on('restart timeout', function() {
                this.collection.messages.stopPolling();
            }, this);
            Session.on('start', function() {
                this.collection.messages.startPolling();
            }, this);

            if (this.model && this.model.webConf){
                if (this.model.webConf.entry && this.model.webConf.entry.content &&
                    this.model.webConf.entry.content.has('showProductMenu')){
                    this.webConfDfd.resolve();
                } else {
                    this.model.webConf.on('sync', function() {
                        this.webConfDfd.resolve();
                    }, this);
                }
            }
        },
        remove: function() {
            BaseView.prototype.remove.apply(this, arguments);
            Session.off('restart timeout start', null, this);
            return this;
        },
        render: function() {
            $.when(this.serverInfoDfd).then(function() {
                var isCloud = this.model.serverInfo.isCloud();

                var homeLink = route.home(
                    this.model.application.get('root'),
                    this.model.application.get('locale'));

                var html = this.compileTemplate(template)({
                    makeUrl: splunkUtil.make_url,
                    options: this.options,
                    homeLink: homeLink,
                    css: css,
                    cloud: isCloud
                });
                this.$el.html(html);

                //insert Placeholders
                this.children.helpTemp.render().appendTo(this.$('[data-role=right-nav]'));
                this.children.activityTemp.render().prependTo(this.$(isCloud ? '[data-role=left-nav]' : '[data-role=right-nav]'));
                this.children.systemTemp.render().prependTo(this.$(isCloud ? '[data-role=left-nav]' : '[data-role=right-nav]'));
                this.children.messagesTemp.render().prependTo(this.$( isCloud ? '[data-role=left-nav]' : '[data-role=right-nav]'));
                this.children.splunk.render().prependTo(this.$('[data-action=home]'));
                this.children.prompt.render().prependTo(this.$('[data-role=gt]'));
                if (this.model.serverInfo.hasAttr('activeLicenseSubgroup')) {
                    var subgroup_id = this.model.serverInfo.entry.content.get('activeLicenseSubgroup');
                    if (subgroup_id !== 'Production' && subgroup_id !== 'UNKNOWN_LICENSE_SUBGROUP' && subgroup_id !== '') {
                        var wrapper = document.createElement("div");
                        var devTest = $("<span>", {
                            "class": css.devTest,
                            title: _("For non-production use only").t(),
                            text: _(subgroup_id).t()
                        });
                        devTest.appendTo(wrapper);
                        this.$('[data-role=left-nav]').append(wrapper);
                    }
                }

                var activeMenu = this.getActiveMenu();

                $.when(this.userDfd, this.appsDfd).then(function() {
                    if (this.model.user.canUseApps() && this.options.showAppsList){
                        this.children.apps = new AppMenuView({
                            collection: this.collection,
                            model: this.model,
                            activeMenu: activeMenu
                        });

                        this.children.apps.prependTo(this.$('[data-role=left-nav]'));
                    }
                    this.children.systemMenu = new SystemMenu({
                        collection: {
                            sections: this.collection.sections,
                            managers: this.collection.managers,
                            apps: this.collection.apps
                        },
                        model: {
                            application: this.model.application,
                            user: this.model.user
                        }
                    });
                    this.children.systemTemp.$el.replaceWith(this.children.systemMenu.render().el);

                    this.children.findbar = new FindBar({
                        model: {
                            user: this.model.user,
                            application: this.model.application,
                            serverInfo: this.model.serverInfo
                        },
                        collection: {
                            apps: this.collection.apps
                        }
                    });

                    this.children.findbar.render().appendTo(this.$(isCloud ? '[data-role=left-nav]' : '[data-role=right-nav]'));

                    this.webConfDfd.done(function(){
                        this.isFreeDfd.fail(function() {

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
                                }
                            });
                            this.children.userMenu.render().prependTo(this.$('[data-role=right-nav]'));
                        }.bind(this));

                        this.children.messages = new MessagesView({
                            collection: {
                                messages: this.collection.messages,
                                legacyMessages: this.collection.legacyMessages
                            },
                            model: {
                                serverInfo: this.model.serverInfo,
                                updateChecker: this.model.updateChecker,
                                userPref: this.model.userPref,
                                webConf: this.model.webConf,
                                application: this.model.application,
                                user: this.model.user
                            }
                        });
                        this.children.messagesTemp.$el.replaceWith(this.children.messages.render().el);
                        this.restartMessagePolling(this.MESSAGES_POLLING_DELAY_STANDARD);

                    }.bind(this));
                }.bind(this));

                this.children.noConnectionModal = new NoConnectionView({});
                $('body').append(this.children.noConnectionModal.render().el);

                this.collection.messages.on('serverValidated', function(success, context, messages) {
                    if (success && this.cntRetries > 0) {
                        this.restartMessagePolling(this.MESSAGES_POLLING_DELAY_STANDARD);
                        this.children.noConnectionModal.hide();
                        this.cntRetries = 0;
                        return;
                    }
                    var netErrorMsg = _.find(messages, function(msg) {
                        return msg.type == splunkDUtils.NETWORK_ERROR || 'network_error';
                    });
                    if (netErrorMsg) {
                        if (this.cntRetries == 0) {
                            this.restartMessagePolling(this.MESSAGES_POLLING_DELAY_HI_FREQ);
                        }
                        if (this.cntRetries >= this.MAX_RETRIES_BEFORE_FAIL) {
                            this.children.noConnectionModal.show();
                        }
                        this.cntRetries += 1;
                    }
                }, this);

                $.when(this.userDfd, this.appsDfd).then(function() {
                    this.children.activityMenu = new ActivityMenu({
                        model: {
                            user: this.model.user,
                            application: this.model.application
                        }
                    });
                    this.children.activityTemp.$el.replaceWith(this.children.activityMenu.render().el);

                    this.children.helpMenu = new HelpMenu({
                        model: this.model,
                        collection: {
                            apps: this.collection.apps
                        }
                    });
                    this.children.helpTemp.$el.replaceWith(this.children.helpMenu.render().el);

                    // highlight the active menu
                    if (activeMenu){
                        this.$(activeMenu.selector).attr("data-active", "true");
                    }
                }.bind(this));

                //product menu
                $.when(this.webConfDfd, this.userDfd).done(function(){
                    var isCloud = this.model.serverInfo.isCloud(),
                        showProductMenu = splunkUtil.normalizeBoolean(this.model.webConf.entry.content.get('showProductMenu'));
                    if (isCloud && showProductMenu){
                        this.children.productMenu = new ProductMenu({
                            model: this.model,
                            collection: this.collection
                        });

                        var afterView = this.children.helpMenu || this.children.helpTemp;
                        this.children.productMenu.render().insertBefore(afterView.$el);
                    }

                }.bind(this));

                return this;
            }.bind(this));
        },
        restartMessagePolling: function(interval) {
            this.collection.messages.stopPolling();
            this.collection.messages.startPolling({delay: interval, uiInactivity: true, stopOnError: false, data: {count: 1000}});
        },
        getActiveMenu: function() {
            // the active menu is based on the current page
            // get path
            var path = Backbone.history.location.pathname;
            var pathComponents = path.split("/"),
                pathComponentsLen = pathComponents.length;
            var appAndPageComponents = [pathComponents[pathComponentsLen-2], pathComponents[pathComponentsLen-1]];
            var appAndPage = appAndPageComponents.join("/");
            var locale = this.model.application.get('locale');
            var app = this.model.application.get('app');

            var activityPages = ["search/status_index",
                                 "search/search_status", "search/search_detail_activity", "search/search_activity_by_user",
                                 "search/splunkweb_status", "search/internal_messages",
                                 "search/scheduler_status", "search/scheduler_user_app", "search/scheduler_savedsearch", "search/scheduler_status_errors", "search/pdf_activity"];
            var changePasswordPage = "authentication/changepassword";
            var jobManagerPage = app + '/job_manager';
            var triggeredAlertsPage = locale + '/alerts';
            var homePage = "launcher/home";
            var managerPage = locale + "/manager";

            var activeMenuSelector = null;
            var activeMenuName = '';
            if (activityPages.indexOf(appAndPage) > -1 ||
                path.indexOf(jobManagerPage) > -1 ||
                path.indexOf(triggeredAlertsPage) > -1) {
                activeMenuSelector = '.activity';
                activeMenuName = "activity";
            } else if (path.indexOf(changePasswordPage) > -1) {
                activeMenuSelector = '.user';
                activeMenuName = "user";
            } else if (path.indexOf(managerPage) > -1) {
                activeMenuSelector = 'menu-system';
                activeMenuName = "manager";
            } else if (path.indexOf(homePage) > -1) {
                activeMenuSelector = '.brand';
                activeMenuName = "home";
            } else {
                activeMenuSelector = '.menu-apps';
                activeMenuName = "app";
            }

            return {
                selector: activeMenuSelector,
                name: activeMenuName
            };
        },
        sectionsMunger: function() {
            this.collection.sections.add({
                id: 'knowledge_configurations',
                label: _('Knowledge').t(),
                icon: 'bookmark',
                order: 1
            });
            this.collection.sections.add({
                id: 'auth_configurations',
                label: _('Users and authentication').t(),
                icon: 'user',
                order: 6
            });
            this.collection.sections.add({
                id: 'deployment_configurations',
                label: _('Distributed environment').t(),
                icon: 'distributed-environment',
                order: 5
            });
            this.collection.sections.add({
                id: 'system_configurations',
                label: _('System').t(),
                icon: 'settings',
                order: 2
            });
            this.collection.sections.add({
                id: 'data_configurations',
                label: _('Data').t(),
                icon: 'data',
                order: 4
            });

            this.collection.managers.each(function(manager){
                var menuUrl = manager.entry.content.get('menu.url') || '',
                    sectionName = manager.entry.content.get('menu.name'),
                    disabledByLicense = splunkUtil.normalizeBoolean(manager.entry.content.get('disabled_by_license') || false),
                    order = manager.entry.content.get('menu.order') || 1000,
                    pageStart = route.encodeRoot(this.model.application.get('root'), this.model.application.get('locale')),
                    url = pageStart + splunkUtil.sprintf(menuUrl, {namespace: this.model.application.get('app') || 'NOTHING'});

                if(!disabledByLicense && sectionName){
                    var section = this.collection.sections.get(sectionName);
                    if(section){
                        var sectionItems = section.get('items');
                        if(sectionItems){
                            sectionItems.push(manager);
                        }
                    }
                }

                manager.set({
                    url: url,
                    order: order
                });
            }.bind(this));

            this.collection.sections.trigger('ready');
        }
    },
    {
        create: function(options){
            options = options || {};
            options.collection = options.collection || {};
            options.model = options.model || {};

            //the APPLICATION model is REQUIRED argument from the consumer. If its not passed, make up an empty one, to keep things rendering, and assure continuance
            //TODO should log this
            var applicationDfd = $.Deferred();
            if(!options.model.application){
                options.model.application = new ApplicationModel();
            }
            // handle both when the application model is already filled and when it has yet to complete fetching
            if (options.model.application.get('app')) {
                applicationDfd.resolve();
            } else {
                options.model.application.on('change', applicationDfd.resolve);
            }

            if(!options.model.appLocal) {
                options.model.appLocal = new AppLocalModel();
                applicationDfd.done(function() {
                    if (options.model.application.get("app") !== 'system') {
                        options.model.appLocal.fetch({
                            url: splunkDUtils.fullpath(options.model.appLocal.url + "/" + encodeURIComponent(options.model.application.get("app"))),
                            data: {
                                app: options.model.application.get("app"),
                                owner: options.model.application.get("owner")
                            }
                        });
                    }
                });
            }

            var currentUserIdDfd = $.Deferred();
            currentUserIdDfd.resolve(options.model.application.get('owner'));

            var appsDfd = $.Deferred();

            var appsCollection;
            if(!options.collection.apps){
                appsCollection = options.collection.apps = new AppsCollection();
                $.when(currentUserIdDfd).done(function(){
                    appsCollection.fetch({
                        data: {
                            sort_key: 'name',
                            sort_dir: 'asc',
                            app: '-' ,
                            owner: options.model.application.get('owner'),
                            search: 'visible=true AND disabled=0 AND name!=launcher',
                            count: -1
                        }
                    });
                    appsCollection.on('reset sort', appsDfd.resolve);
                });
            } else {
                appsDfd.resolve();
            }

            if (!options.model.userPref){
                options.model.userPref = new UserPrefModel();
                options.model.userPref.fetch({data: {app:'user-prefs', owner: options.model.application.get('owner'), count:-1}});
                appsCollection = options.collection.apps;
                options.model.userPref.on('change', function(){
                    appsDfd.done(function(){
                        appsCollection.sortWithString(options.model.userPref.entry.content.get('appOrder'));
                        appsCollection.trigger('ready');
                    });
                });
            }
            else {
                options.collection.apps.sortWithString(options.model.userPref.entry.content.get('appOrder'));
            }

            var serverInfoDfd = $.Deferred();
            if (!options.model.serverInfo) {
                options.model.serverInfo = new ServerInfoModel();
                options.model.serverInfo.fetch({
                    success: function() {
                        serverInfoDfd.resolve();
                    }
                });
            } else {
                serverInfoDfd.resolve();
            }


            if(!options.model.user){
                options.model.user = new UserModel({}, {serverInfoModel: options.model.serverInfo});
                $.when(currentUserIdDfd, serverInfoDfd).done(function(currentUserId){
                    options.model.user.set('id', encodeURIComponent(currentUserId));
                    options.model.user.fetch();
                });
            }

            if (!options.collection.messages) {
                options.collection.messages = new MessagesCollection();
                //SPL-48272 - fetch messages by time created in descending order
                options.collection.messages.fetchData.set({
                    "sort_key" : "timeCreated_epochSecs",
                    "sort_dir" : "desc"
                });
            }

            var managersDfd = $.Deferred();
            if (!options.collection.managers){
                options.collection.managers = new ManagersCollection();
                $.when(currentUserIdDfd).done(function(currentUsername){
                    options.collection.managers.fetch({
                        data: {
                            app: '-',
                            owner: currentUsername,
                            count: 0,
                            digest: 1
                        },
                        success: function() {
                            managersDfd.resolve();
                        }
                    });
                });
            } else {
                managersDfd.resolve();
            }

            options.collection.sections = new SystemMenuSectionsCollection();
            options.model.webConf = new WebConfModel({id: 'settings'});
            options.model.webConf.fetch();

            var view = new View(options);

            $.when(managersDfd).done(function() {
                view.sectionsMunger();
            });

            return view;
        }
    });
    return View;
});
