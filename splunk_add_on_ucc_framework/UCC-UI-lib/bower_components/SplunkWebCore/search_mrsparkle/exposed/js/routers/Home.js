define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/Base',
        'collections/services/data/ui/Navs',
        'collections/services/data/ui/Tours',
        'models/services/data/ui/Manager',
        'models/search/Dashboard',
        'models/services/data/ui/Pref',
        'models/managementconsole/DmcSettings',
        'views/home/Master',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
        _,
        $,
        Backbone,
        BaseRouter,
        NavsCollection,
        ToursCollection,
        ManagerModel,
        DashboardModel,
        UIPrefModel,
        DmcSettings,
        HomeView,
        splunkdUtils,
        splunkUtil
    ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                var owner = this.model.application.get('owner');

                this.enableAppBar = false;
                this.enableFooter = false;
                this.showAppsList = false;
                this.fetchAppLocals = true;
                this.fetchUser = true;
                this.fetchUserPref = true;
                this.model.dashboard = new DashboardModel();
                this.model.uiPref = new UIPrefModel();
                this.collection.navs = new NavsCollection();
                this.collection.tours = new ToursCollection();
                this.deferreds.appsSorted = $.Deferred();
                this.deferreds.uiPref = $.Deferred();
                this.deferreds.dashboard =  $.Deferred();
                this.deferreds.classicUrl = $.Deferred();
                this.setPageTitle(_('Home').t());
                this.canManageRemoteAppsDfd = $.Deferred();

                this.model.dmcSettings = new DmcSettings();
                this.deferreds.dmcSettings = this.model.dmcSettings.fetch();

                this.deferreds.navsCollection = this.collection.navs.fetch({
                     data: {
                        app: '-',
                        owner: owner,
                        count: -1
                    }
                });
                this.deferreds.tours = this.collection.tours.fetch({
                     data: {
                        app: 'search',
                        owner: owner,
                        count: -1
                    }
                });

                $.when(
                    this.deferreds.appLocals,
                    this.deferreds.userPref,
                    this.deferreds.navsCollection,
                    this.deferreds.uiPref,
                    this.deferreds.user,
                    this.deferreds.dashboard,
                    this.deferreds.managers,
                    this.deferreds.classicUrl,
                    this.deferreds.tours,
                    this.deferreds.dmcSettings
                ).then(function() {
                    this.collection.appLocals.sortWithString(this.model.userPref.entry.content.get('appOrder'));
                    if (this.model.user.canManageRemoteApps()) {
                        this.canManageRemoteAppsDfd.resolve();
                    } else {
                        this.canManageRemoteAppsDfd.reject();
                    }
                    this.views.home = new HomeView({
                        collection: {
                            apps: this.collection.appLocals,
                            appNavs: this.collection.navs,
                            managers: this.collection.managers,
                            tours: this.collection.tours
                        },
                        model: {
                            userPref: this.model.userPref,
                            uiPref: this.model.uiPref,
                            application: this.model.application,
                            user: this.model.user,
                            dashboard: this.model.dashboard,
                            optIn: this.model.optIn,
                            eligibility: this.model.eligibility,
                            dmcSettings: this.model.dmcSettings
                        },
                        canManageRemoteAppsDfd: this.canManageRemoteAppsDfd
                    });
                    this.deferreds.appsSorted.resolve();
                }.bind(this));

                this.model.userPref.on('sync', function(){ //TODO: move within .then in constructor
                    this.collection.appLocals.sortWithString(this.model.userPref.entry.content.get('appOrder'));
                    this.collection.appLocals.trigger('ready'); // TODO check if this 'ready' trigger is still needed.
                }, this);

                $.when(this.deferreds.userPref).then(function() {
                    var dashboardID = this.model.userPref.entry.content.get('display.page.home.dashboardId');
                    if (dashboardID) {
                        this.model.dashboard.set('id', dashboardID);
                        this.model.dashboard.fetch({
                            success: function() {
                                this.deferreds.dashboard.resolve();
                            }.bind(this),
                            error: function() {
                                this.deferreds.dashboard.resolve();
                            }.bind(this)
                        });
                    } else {
                        this.deferreds.dashboard.resolve();
                    }
                }.bind(this));
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                this.model.uiPref.bootstrap(this.deferreds.uiPref, this.model.application.get('page'), this.model.application.get('app'), this.model.application.get('owner'));
                $.when(this.deferreds.pageViewRendered, this.deferreds.appsSorted).then(function() {
                    $('.preload').replaceWith(this.pageView.el);
                    this.pageView.$('.main-section-body').append(this.views.home.render().el);
                }.bind(this));

                // IB: Classic url fetch doesn't work inside initialize for some reason, but works in page()
				this.model.classicUrl.fetch().done(function() {
					this.deferreds.classicUrl.resolve();
				}.bind(this));
            }
        });
    }
);
