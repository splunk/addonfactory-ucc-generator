define([
        'jquery',
        'underscore',
        'backbone',
        'models/shared/Application',
        'models/services/AppLocal',
        'models/config',
        'collections/services/configs/Visualizations',
        'models/services/server/ServerInfo',
        'models/services/data/ui/Nav',
        'models/services/data/UserPrefGeneral',
        'models/shared/User',
        'models/shared/ClassicURL',
        'models/services/data/ui/Tour',
        'models/services/configs/Visualization',
        'models/services/configs/Web',
        'models/shared/UpdateChecker',
        'collections/services/data/ui/Tours',
        'collections/services/AppLocals',
        'collections/services/data/ui/Managers',
        'views/shared/Page',
        'util/csrf_protection',
        'util/ajax_no_cache',
        'util/ajax_logging',
        'util/splunkd_utils',
        'splunk.util',
        'util/console',
        'splunk.error',
        'uri/route',
        'util/general_utils',
        'models/classicurl'
    ],
    function(
        $,
        _,
        Backbone,
        ApplicationModel,
        AppLocalModel,
        configModel,
        ExternalVisualizationsCollection,
        ServerInfoModel,
        AppNavModel,
        UserPrefModel,
        UserModel,
        ClassicURL,
        TourModel,
        ExternalVisualizationModel,
        WebConfModel,
        UpdateCheckerModel,
        ToursCollection,
        AppLocalsCollection,
        ManagersCollection,
        PageView,
        csrf_protection,
        ajaxNoCache,
        ajaxLogging,
        splunkd_utils,
        splunkUtils,
        console,
        splunkError,
        route,
        generalUtils,
        classicurl
    ) {
        /**
         * @namespace routers
         */
        /**
         * @constructor
         * @memberOf routers
         * @name Base
         * @extends {Backbone.Router}
         */
    return Backbone.Router.extend(/** @lends routers.Base.prototype */{
        routes: {
            ':locale/app/:app/:page': 'page',
            ':locale/app/:app/:page/': 'page',
            ':locale/app/:app/:page/*splat': 'page',
            ':locale/manager/:app/:page': 'page',
            ':locale/manager/:app/:page/': 'page',
            ':locale/manager/:app/:page/*splat': 'page',
            '*root/:locale/app/:app/:page': 'pageRooted',
            '*root/:locale/app/:app/:page/': 'pageRooted',
            '*root/:locale/app/:app/:page/*splat': 'pageRooted',
            '*root/:locale/manager/:app/:page': 'pageRooted',
            '*root/:locale/manager/:app/:page/': 'pageRooted',
            '*root/:locale/manager/:app/:page/*splat': 'pageRooted',
            '*splat': 'notFound'
        },
        initialize: function(options) {
            options = $.extend({model:{}, collection:{}, deferreds: {}}, options);
            //add __splunk__ to global namespace
            if (window.location.href.indexOf('debug=1')!=-1) {
                (function(exports) {
                    this.__splunk__ = exports;
                })(this);
            }
            //configuration
            this.enableSplunkBar = true;
            this.enableAppBar = true;
            this.enablePageView = true;
            this.enableFooter = true;
            this.showAppsList = true;

            this.fetchUser = true;
            this.fetchAppLocals = false;
            this.fetchAppLocal = true;
            this.fetchUserPref = false;
            this.fetchServerInfo = true;
            this.fetchManagers = true;
            // Pages that display a single visualization (report, embed) should set this flag.
            this.fetchExternalVisualization = false;
            // Pages that display multiple visualizations (search, dashboards) should set this flag.
            this.fetchExternalVisualizations = false;
            // Pages that need only the visualizations.conf info but not the formatter schema for each
            // external visualization (e.g. only labels and icons for save flows) should set this to false.
            this.fetchExternalVisualizationFormatters = true;
            // Allows pages to configure whether only "selectable" external visualizations (i.e. those that
            // should be available for user selection) should be fetched, or all enabled visualizations.
            this.requireSelectableExternalVisualizations = true;

            this.loadingMessage = '';

            // Tracks how many times the page function has been called
            this.pageViewCount = 0;

            //models
            this.model = {};
            // Some routers have used camelCase, while others have used lowercase
            // for this model, so aliasing both minimize impact of adding this to the base router.
            this.model.classicurl = this.model.classicUrl = classicurl;
            this.model.config = options.model.config || configModel;
            this.model.application = options.model.application || new ApplicationModel({owner: this.model.config.get('USERNAME')});
            this.model.appNav = options.model.appNav || new AppNavModel();
            this.model.appLocal = options.model.appLocal || new AppLocalModel();
            this.model.userPref = options.model.userPref || new UserPrefModel();
            this.model.serverInfo = options.model.serverInfo || new ServerInfoModel();
            this.model.tour = options.model.tour || new TourModel();
            this.model.web = options.model.web || new WebConfModel({id: 'settings'});
            this.model.updateChecker = options.model.updateChecker || new UpdateCheckerModel();

            //collections
            this.collection = {};
            this.collection.appLocals = options.collection.appLocals || new AppLocalsCollection();
            this.collection.appLocalsUnfiltered = options.collection.appLocalsUnfiltered || new AppLocalsCollection();
            this.collection.appLocalsUnfilteredAll = options.collection.appLocalsUnfilteredAll || new AppLocalsCollection();
            this.collection.managers = options.collection.managers || new ManagersCollection();
            this.collection.tours = new ToursCollection();
            this.collection.externalVisualizations = new ExternalVisualizationsCollection();
            
            // the user model is a special case that also needs the apps collection
            this.model.user = options.model.user || new UserModel({}, {
                serverInfoModel: this.model.serverInfo,
                appLocalsCollection: this.collection.appLocals
            });

            //views
            this.views = {};

            //deferreds
            this.deferreds = options.deferreds || {};
            this.deferreds.user = options.deferreds.user || $.Deferred();
            this.deferreds.appNav = options.deferreds.appNav || $.Deferred();
            this.deferreds.appLocal = options.deferreds.appLocal || $.Deferred();
            this.deferreds.appLocals = options.deferreds.appLocals || $.Deferred();
            this.deferreds.appLocalsUnfiltered = options.deferreds.appLocalsUnfiltered || $.Deferred();
            this.deferreds.appLocalsUnfilteredAll = options.deferreds.appLocalsUnfilteredAll || $.Deferred();
            this.deferreds.userPref = options.deferreds.userPref || $.Deferred();
            this.deferreds.serverInfo = options.deferreds.serverInfo || $.Deferred();
            this.deferreds.web = options.deferreds.web || $.Deferred();
            this.deferreds.pageViewRendered = options.deferreds.pageViewRendered || $.Deferred();
            this.deferreds.tour = options.deferreds.tour || $.Deferred();
            this.deferreds.managers = options.deferreds.managers || $.Deferred();
            this.deferreds.application = options.deferreds.application || $.Deferred();
            this.deferreds.externalVisualizations = options.deferreds.externalVisualizations || $.Deferred();
            this.deferreds.updateChecker = options.deferreds.updateChecker || $.Deferred();

            //history
            if(options.history){
                this.history = options.history;
            }else{
                this.history = {};
                _.each(this.routes, function(value) {
                    this.on('route:' + value, function() {
                        this.history[window.location.pathname] = true;
                    }, this);
                }, this);
            }

            this.externalVisualizationBootstrap = _.memoize(
                this.externalVisualizationBootstrap,
                this._externalVisualizationBootstrapMemoizer
            );

        },
        page: function(locale, app, page) {
            this.pageViewCount++;

            this.shouldRender = !this.history[window.location.pathname];
            this.model.application.set({
                locale: locale,
                app: app,
                page: page.split('?')[0]
            });
            this.deferreds.application.resolve();

            this.bootstrapAppNav();
            this.bootstrapAppLocal();
            this.bootstrapServerInfo();
            this.bootstrapWebConf();
            this.bootstrapTour();
            this.bootstrapUserPref();
            this.bootstrapManagers();
            this.bootstrapExternalVisualizations();
            this.applyPageUrlOptions();
            this.bootstrapUpdateChecker();

            if (this.enablePageView && !this.pageView) {
                this.$whenPageViewDependencies().then(function(){
                    this.pageView = new PageView({
                        splunkBar: this.enableSplunkBar,
                        showAppsList: this.showAppsList,
                        footer: this.enableFooter,
                        showAppNav: this.enableAppBar,
                        section: this.model.application.get('page'),
                        loadingMessage: this.loadingMessage,
                        model: {
                            application: this.model.application,
                            appNav: this.model.appNav,
                            appLocal: this.model.appLocal,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            config: this.model.config,
                            tour: this.model.tour,
                            userPref: this.model.userPref,
                            web: this.model.web,
                            updateChecker: this.model.updateChecker
                        },
                        collection: {
                            apps: this.collection.appLocals,
                            tours: this.collection.tours,
                            managers: this.collection.managers
                        },
                        deferreds: {
                            tour: this.deferreds.tour,
                            pageViewRendered: this.deferreds.pageViewRendered
                        }
                    });
                    this.pageView.render();
                    this.deferreds.pageViewRendered.resolve();
                }.bind(this));
            }
        },
        pageRooted: function(root, locale, app, page) {
            this.model.application.set({
                root: root
            }, {silent: true});
            this.page(locale, app, page);
        },
        notFound: function() {
            console.log('Page not found.');
        },
        $whenPageViewDependencies: function() {
            this.bootstrapUser();
            this.bootstrapAppLocals();
            return $.when(
                this.deferreds.user,
                this.deferreds.appLocals,
                this.deferreds.appLocal,
                this.deferreds.appNav,
                this.deferreds.serverInfo,
                this.deferreds.tour,
                this.deferreds.managers,
                this.deferreds.externalVisualizations,
                this.deferreds.web,
                this.deferreds.updateChecker
            );
        },
        bootstrapAppNav: function() {
            var appNavPartialData;
            if (this.deferreds.appNav.state() !== 'resolved') {
                if (this.enableAppBar) {
                    appNavPartialData = __splunkd_partials__['/appnav'];
                    if (appNavPartialData) {
                        this.model.appNav.setFromSplunkD(appNavPartialData);
                        this.deferreds.appNav.resolve();
                    } else {
                        this.model.appNav.fetch({
                            data: {
                                app: this.model.application.get("app"),
                                owner: this.model.application.get("owner")
                            },
                            success: function(model, response) {
                                this.deferreds.appNav.resolve();
                            }.bind(this),
                            error: function(model, response) {
                                this.deferreds.appNav.resolve();
                            }.bind(this)
                        });
                    }
                } else {
                    this.model.appNav = undefined;
                    this.deferreds.appNav.resolve();
                }
            }
        },
        bootstrapAppLocals: function() {
            if (this.deferreds.appLocals.state() !== 'resolved') {
                if (this.fetchAppLocals || this.fetchExternalVisualizations || this.fetchExternalVisualization) {
                    this.collection.appLocals.fetch({ //fetch all apps in one shot filtering out launcher on success
                        data: {
                            sort_key: 'name',
                            sort_dir: 'asc',
                            app: '-' ,
                            owner: this.model.application.get('owner'),
                            search: 'disabled=0',
                            count: -1
                        },
                        success: function(collection, response) {
                            //This collection includes visible and hidden apps
                            this.collection.appLocalsUnfilteredAll.set(collection.models);

                            //Filter out the invisible apps
                            var onlyVisibleAppsCollection = new AppLocalsCollection();
                            onlyVisibleAppsCollection.set(collection.filter(function(app) {
                                var visibleFlag = app.entry.content.get("visible"), res = true;
                                if(visibleFlag == false || (_.isString(visibleFlag) && visibleFlag.toLowerCase() === "false")){
                                    res = false;
                                }

                                return res;
                            }));

                            //Set the appLocals collection to only show visible apps and remove launcher app
                            collection.set(onlyVisibleAppsCollection.models);
                            collection.remove(this.collection.appLocals.get('/servicesNS/nobody/system/apps/local/launcher'));//remove launcher

                            //Set unfiltered so that it only shows visible apps
                            this.collection.appLocalsUnfiltered.set(onlyVisibleAppsCollection.models);

                            this.deferreds.appLocals.resolve();
                            this.deferreds.appLocalsUnfiltered.resolve();
                            this.deferreds.appLocalsUnfilteredAll.resolve();
                        }.bind(this),
                        error: function(collection, response) {
                            this.deferreds.appLocals.resolve();
                            this.deferreds.appLocalsUnfiltered.resolve();
                            this.deferreds.appLocalsUnfilteredAll.resolve();
                        }.bind(this)
                    });
                } else {
                    this.collection.appLocals = undefined;
                    this.collection.appLocalsUnfiltered = undefined;
                    this.deferreds.appLocals.resolve();
                    this.deferreds.appLocalsUnfiltered.resolve();
                    this.deferreds.appLocalsUnfilteredAll.resolve();
                }
            }
        },
        bootstrapTour: function() {
            if (this.model.tour && this.model.tour.id) {
                return;
            }

            var app = this.model.application.get('app'),
                owner = this.model.application.get('owner'),
                page = this.model.application.get('page'),
                queryProps = splunkUtils.queryStringToProp(window.location.search);

            this.tourName = undefined;

            if (queryProps.tour) {
                this.tourName = queryProps.tour;
                this.model.classicurl = new ClassicURL();
                this.model.classicurl.fetch({
                    success: function(model, response) {
                        this.deferreds.appLocal.resolve();
                        this.model.classicurl.unset('tour');
                        this.model.classicurl.save({}, {replaceState: true});
                    }.bind(this),
                    error: function(model, response) {
                        this.deferreds.appLocal.resolve();
                    }.bind(this)
                });
            } else {
                this.tourName = page + '-tour';
                this.firstTimeCheck = true;
            }

            if (this.deferreds.tour.state() !== 'resolved') {
                this.collection.tours.fetch({
                    data: {
                        app: app,
                        owner: owner,
                        count: -1
                    },
                    success: function(collection, response) {
                        this.setTourModel(this.tourName);
                    }.bind(this),
                    error: function(collection, response) {
                        this.model.tour = null;
                        this.deferreds.tour.resolve();
                    }.bind(this)
                });
            } else {
                this.model.tour = null;
                this.deferreds.tour.resolve();
            }
        },
        setTourModel: function(tourName) {
            if (!tourName) {
                this.model.tour = null;
                this.deferreds.tour.resolve();
                return false;
            }

            var app = this.model.application.get('app'),
                owner = this.model.application.get('owner'),
                productType = this.model.serverInfo.getProductType(),
                instanceType = this.model.serverInfo.getInstanceType(),
                isLite = this.model.serverInfo.isLite(),
                name, tourCheck;

            if (this.firstTimeCheck) {
                if (isLite) {
                    // make check if Splunk Light global tour has been viewed
                    var lightTour = this.collection.tours.getTourModel('light-product-tour');
                    if (app == 'search' && lightTour && !lightTour.viewed()) {
                        tourCheck = lightTour;
                    }
                }

                if (!tourCheck) {
                    var envTourName = tourName + ':' + productType + ((instanceType) ? ':' + instanceType : '');
                    tourCheck = this.collection.tours.getTourModel(envTourName);
                }
            } else {
                tourCheck = this.collection.tours.getTourModel(tourName);
            }

            if (tourCheck) {
                name = tourCheck.getName();
                app = tourCheck.getTourApp();
                this.model.tour.bootstrap(this.deferreds.tour, app, owner, name);
                if (this.model.tour) {
                    if (this.firstTimeCheck) {
                        this.model.tour.entry.content.set('firstTimeCheck', true);
                    }

                    this.model.tour.on('viewed', function() {
                        this.updateTour();
                    }, this);
                }
            } else {
                this.model.tour = null;
                this.deferreds.tour.resolve();
            }
        },
        updateTour: function() {
            var data = {};
            if (this.model.tour.isNew()) {
                data = {
                    app: this.model.tour.getTourApp(),
                    owner: this.model.application.get('owner')
                };
            }
            this.model.tour.save({}, {
                data: data
            });
        },
        bootstrapAppLocal: function() {
            var app, appLocalPartialData;
            if (this.deferreds.appLocal.state() !== 'resolved') {
                app = this.model.application.get('app');

                if (this.fetchAppLocal && (app !== 'system')) {
                    appLocalPartialData = __splunkd_partials__['/servicesNS/nobody/system/apps/local/' + encodeURIComponent(app)];
                    if (appLocalPartialData) {
                        this.model.appLocal.setFromSplunkD(appLocalPartialData);
                        this.deferreds.appLocal.resolve();
                    } else {
                        this.model.appLocal.fetch({
                            url: splunkd_utils.fullpath(this.model.appLocal.url + "/" + encodeURIComponent(app)),
                            data: {
                                app: app,
                                owner: this.model.application.get("owner")
                            },
                            success: function(model, response) {
                                this.deferreds.appLocal.resolve();
                            }.bind(this),
                            error: function(model, response) {
                                this.deferreds.appLocal.resolve();
                            }.bind(this)
                        });
                    }
                } else {
                    this.model.appLocal = undefined;
                    this.deferreds.appLocal.resolve();
                }
            }
        },
        bootstrapServerInfo: function() {
            var serverInfoPartialData,
                fromLogin = splunkUtils.loginCheck();

            if (this.deferreds.serverInfo.state() !== 'resolved') {
                if (this.fetchUser || this.fetchServerInfo) {
                    serverInfoPartialData = __splunkd_partials__['/services/server/info'];
                    if (serverInfoPartialData && !fromLogin) {
                        this.model.serverInfo.setFromSplunkD(serverInfoPartialData);
                        this.deferreds.serverInfo.resolve();
                    } else {
                        this.model.serverInfo.fetch({
                            success: function(model, response) {
                                this.deferreds.serverInfo.resolve();
                            }.bind(this),
                            error: function(model, response) {
                                this.deferreds.serverInfo.resolve();
                            }.bind(this)
                        });
                    }
                } else {
                    this.model.serverInfo = undefined;
                    this.deferreds.serverInfo.resolve();
                }
            }
        },
        bootstrapUserPref: function() {
            if (this.deferreds.userPref.state() !== 'resolved') {
                this.model.userPref.fetch({
                    success: function(model, response) {
                        this.deferreds.userPref.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        this.deferreds.userPref.resolve();
                    }.bind(this)
                });
            }
        },
        bootstrapWebConf: function() {
            if (this.deferreds.web.state() !== 'resolved') {
                this.model.web.fetch({
                    success: function(model, response) {
                        this.deferreds.web.resolve();
                    }.bind(this),
                    error: function(model, response) {
                        this.deferreds.web.resolve();
                    }.bind(this)
                });
            }
        },
        bootstrapUpdateChecker: function() {
            $.when(this.deferreds.web, this.deferreds.serverInfo, this.deferreds.userPref, this.deferreds.user).then(function() {
                var fromLogin = splunkUtils.loginCheck(),
                    canPhonehome = splunkUtils.normalizeBoolean(this.model.web.entry.content.get('updateCheckerBaseURL')),
                    canRenderSplunkMessages = canPhonehome && !this.model.serverInfo.isCloud();

                if (fromLogin) {
                    var uid = splunkUtils.getCookie('splunkweb_uid');
                    this.model.userPref.entry.content.set('render_version_messages', canRenderSplunkMessages);
                    this.model.userPref.save({});
                    splunkUtils.deleteCookie('login');
                    splunkUtils.deleteCookie('splunkweb_uid');

                    if (canPhonehome) {
                        this.model.updateChecker.set('useQuickdraw', true);
                        this.model.updateChecker.fetchHelper(
                            this.model.serverInfo,
                            this.model.web,
                            this.model.application,
                            this.model.user,
                            'login',
                            uid,
                            {timeout: 5000})
                            .error(function() {
                                // No internet connection or user changed
                                // the updateCheckerBaseURL to something funky.
                                this.model.updateChecker.set('useQuickdraw', false);
                                console.error('Update check endpoint is unreachable.');
                            }.bind(this));
                    } else {
                        // User has removed updateCheckerBaseURL
                        console.error('Update check url is empty. Aborting update check to quickdraw.');
                    }
                }
                this.deferreds.updateChecker.resolve();
            }.bind(this));
        },
        bootstrapUser: function() {
            if (this.deferreds.user.state() !== 'resolved') {
                if (this.fetchUser) {
                    this.model.user.fetch({
                        url: splunkd_utils.fullpath(this.model.user.url + "/" + encodeURIComponent(this.model.application.get("owner"))),
                        data: {
                            app: this.model.application.get("app"),
                            owner: this.model.application.get("owner")
                        },
                        success: function(model, response) {
                            $.when(this.deferreds.serverInfo).then(function() {
                                this.deferreds.user.resolve();
                            }.bind(this));
                        }.bind(this),
                        error: function(model, response) {
                            $.when(this.deferreds.serverInfo).then(function() {
                                this.deferreds.user.resolve();
                            }.bind(this));
                        }.bind(this)
                    });
                } else {
                    this.model.user = undefined;
                    this.deferreds.user.resolve();
                }
            }
        },
        bootstrapManagers: function() {
            if (this.deferreds.managers.state() !== 'resolved') {
                if (this.fetchManagers) {
                    this.collection.managers.fetch({
                        data: {
                            app: "-",
                            owner: this.model.application.get("owner"),
                            count: 0,
                            digest: 1
                        },
                        success: function(collection, response, options) {
                            this.deferreds.managers.resolve();
                        }.bind(this),
                        error: function(collection, response, options) {
                            this.deferreds.managers.resolve();
                        }.bind(this)
                    });
                } else {
                    this.collection.managers = undefined;
                    this.deferreds.managers.resolve();
                }
            }
        },
        bootstrapExternalVisualizations: function() {
            if (this.deferreds.externalVisualizations.state() !== 'resolved') {
                if (this.fetchExternalVisualizations) {
                    var filterSearch = this.requireSelectableExternalVisualizations ?
                            ExternalVisualizationModel.SELECTABLE_FILTER : ExternalVisualizationModel.ENABLED_FILTER;
                    $.when(this.deferreds.appLocals).done(function() {
                        this.collection.externalVisualizations.fetch({
                            includeFormatter: this.fetchExternalVisualizationFormatters,
                            appLocalsCollection: this.collection.appLocals,
                            data: _.extend(
                                {
                                    search: filterSearch,
                                    count: 0
                                },
                                this.model.application.pick('app', 'owner')
                            ),
                            success: function(collection, response, options) {
                                this.deferreds.externalVisualizations.resolve();
                            }.bind(this),
                            error: function(collection, response, options) {
                                this.deferreds.externalVisualizations.resolve();
                            }.bind(this)
                        });
                    }.bind(this))
                    .fail(function(){
                        this.deferreds.externalVisualizations.resolve();
                    });
                } else {
                    this.collection.externalVisualizations = undefined;
                    this.deferreds.externalVisualizations.resolve();
                }
            }
        },
        // Bootstraps the corresponding external visualization for the given report model (if any).
        //
        // Behaves differently than other bootstrapping methods in this file because loading the external
        // visualization depends on the properties of the report model.  This means we can't use an instance
        // variable to cache this computation and only perform it once.  Instead the contract is to pass in
        // the report model each time and a new deferred is returned.
        //
        // This method is wrapped in a _.memoize call in initialize, using the memoization function below.
        externalVisualizationBootstrap: function(reportModel) {
            var reportContent = reportModel.entry.content,
                vizType = reportContent.get('display.visualizations.type');

            // If the report is not using a custom external visualization, no work to do.
            if (vizType !== 'custom') {
                return $.Deferred().resolve();
            }
            var externalViz = ExternalVisualizationModel.createFromCustomTypeAndContext(
                reportContent.get('display.visualizations.custom.type'),
                this.model.application.pick('app', 'owner')
            );

            var externalVizFetchDfd = $.Deferred();

            $.when(this.deferreds.appLocals).done(function() {
                externalViz.fetch().then(
                    function() {
                        var isValidVisualization = this.requireSelectableExternalVisualizations ?
                                externalViz.isSelectable() : externalViz.isEnabled();
                        if (!isValidVisualization) {
                            console.warn(
                                'The following external visualization will not be displayed because it is disabled or hidden: '
                                + externalViz.entry.get('name')
                            );
                            return externalVizFetchDfd.resolve();
                        }

                        return externalViz.addToRegistry({
                            loadFormatterHtml: false,
                            appLocalsCollection: this.collection.appLocals
                        }).then(function(){
                            externalVizFetchDfd.resolve();
                        });
                    }.bind(this),
                    // If this fetch fails, log the error but resolve the deferred so that the page will
                    // continue to bootstrap and page-specific logic can render the error.
                    function(err) {
                        console.error('Error bootstrapping external visualization:');
                        console.error(err);
                        return externalVizFetchDfd.resolve();
                    }
                );
            }.bind(this))
            .fail(function(){
                externalVizFetchDfd.resolve();
            });

            return externalVizFetchDfd;
        },
        _externalVisualizationBootstrapMemoizer: function(reportModel) {
            var reportContent = reportModel.entry.content,
                vizType = reportContent.get('display.visualizations.type');

            if (vizType !== 'custom') {
                return '__NO_CUSTOM_VIZ__';
            }
            return reportContent.get('display.visualizations.custom.type');
        },
        // convenience method for subclasses to update the page <title>
        // as browser compatibility issues arise, they can be encapsulated here
        setPageTitle: function(title) {
            this.deferreds.serverInfo.done(function(){
                var version = this.model.serverInfo.getVersion() || _('N/A').t();
                var isLite = this.model.serverInfo.isLite();
                document.title = splunkUtils.sprintf(_('%s | Splunk %s %s').t(), title, isLite ? 'Light' : '', version);
            }.bind(this));
        },
        applyPageUrlOptions: function() {
            var that = this;
            // Note: classicUrl.fetch is always synchronous
            this.model.classicurl.fetch({
                success: function() {
                    var availablePageOptions = [
                        'hideSplunkBar',
                        'hideAppBar',
                        'hideFooter',
                        'hideAppsList',
                        'hideChrome'
                    ];
                    var pageOptions = that.model.classicurl.pick(availablePageOptions);
                    _.forEach(pageOptions, function(value, key) {
                        pageOptions[key] = generalUtils.normalizeBoolean(value, {
                            'default': true
                        });
                    });
                    if (pageOptions.hideSplunkBar) {
                        that.enableSplunkBar = false;
                    }
                    if (pageOptions.hideAppBar) {
                        that.enableAppBar = false;
                    }
                    if (pageOptions.hideFooter) {
                        that.enableFooter = false;
                    }
                    if (pageOptions.hideAppsList) {
                        that.showAppsList = false;
                    }
                    if (pageOptions.hideChrome) {
                        that.enableSplunkBar = false;
                        that.enableAppBar = false;
                        that.enableFooter = false;
                    }
                }
            });
        }
    });
});
