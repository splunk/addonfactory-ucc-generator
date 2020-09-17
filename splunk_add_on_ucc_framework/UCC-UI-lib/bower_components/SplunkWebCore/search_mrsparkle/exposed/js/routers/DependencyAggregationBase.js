define([
            'jquery',
            'underscore',
            'routers/Base',
            'helpers/ApiDependencyAggregator',
            'models/shared/Application',
            'models/config',
            'models/classicurl',
            'models/services/server/ServerInfo',
            'models/services/data/ui/Nav',
            'models/services/data/UserPrefGeneral',
            'models/shared/User',
            'models/shared/ClassicURL',
            'models/services/data/ui/Tour',
            'models/services/AppLocal',
            'collections/services/data/ui/Tours',
            'collections/services/AppLocals',
            'collections/services/data/ui/Managers'
        ],
        function(
            $,
            _,
            BaseRouter,
            ApiDependencyAggregator,
            Application,
            config,
            classicurl,
            ServerInfo,
            Nav,
            UserPrefGeneral,
            User,
            ClassicURL,
            Tour,
            AppLocal,
            Tours,
            AppLocals,
            Managers
        ) {

    return BaseRouter.extend({

        initialize: function() {
            BaseRouter.prototype.initialize.apply(this, arguments);
            this.aggregator = new ApiDependencyAggregator();
            this._addDependencyHandlers(this.aggregator);

            this.fetchUser = true;
            this.fetchAppLocals = true;
            this.fetchAppLocal = true;
            this.fetchUserPref = true;
            this.fetchServerInfo = true;
            this.fetchManagers = true;
        },

        page: function(locale, app, page) {
            this.shouldRender = !this.history[window.location.pathname];
            this.model.application.set({
                locale: locale,
                app: app,
                page: page.split('?')[0]
            });
            this.deferreds.application.resolve();

            // TODO: we should have a default implementation of creating the PageView...
        },

        _addDependencyHandlers: function(aggregator) {
            // Application Model
            aggregator.addHandler(Application, _.once(function() {
                return this.deferreds.application.then(function() {
                    return this.model.application;
                }.bind(this));
            }.bind(this)));
            // Config Model
            aggregator.addHandler(config.constructor, _.once(function() {
                return this.model.config;
            }.bind(this)));
            // Classic URL Model
            aggregator.addHandler(ClassicURL, _.once(function() {
                return classicurl.fetch().then(function() { return classicurl; });
            }.bind(this)));
            // App Nav Model
            aggregator.addHandler(Nav, _.once(function() {
                this.bootstrapAppNav();
                return this.deferreds.appNav.then(function() {
                    return this.model.appNav;
                }.bind(this));
            }.bind(this)));
            // Server Info Model
            aggregator.addHandler(ServerInfo, _.once(function() {
                this.bootstrapServerInfo();
                return this.deferreds.serverInfo.then(function() {
                    return this.model.serverInfo;
                }.bind(this));
            }.bind(this)));
            // User Pref Model
            aggregator.addHandler(UserPrefGeneral, _.once(function() {
                this.bootstrapUserPref();
                return this.deferreds.userPref.then(function() {
                    return this.model.userPref;
                }.bind(this));
            }.bind(this)));
            
            // Tour Model
            aggregator.addHandler(Tour, _.once(function(previous, aggregator) {
                return $.when(aggregator.waitFor(Tours), this.deferreds.tour).then(function() {
                    return this.model.tour;
                }.bind(this));
            }.bind(this)));
            // App Local Model
            aggregator.addHandler(AppLocal, _.once(function() {
                this.bootstrapAppLocal();
                return this.deferreds.appLocal.then(function() {
                    return this.model.appLocal;
                }.bind(this));
            }.bind(this)));

            // App Locals Collection
            aggregator.addHandler(AppLocals, _.once(function() {
                this.bootstrapAppLocals();
                return this.deferreds.appLocals.then(function() {
                    return this.collection.appLocals;
                }.bind(this));
            }.bind(this)));
            
            // User Model
            aggregator.addHandler(User, _.once(function(previous, aggregator) {
                this.bootstrapUser();
                return $.when(this.deferreds.user, aggregator.waitFor(ServerInfo), aggregator.waitFor(AppLocals)).then(function() {
                    return this.model.user;
                }.bind(this));
            }.bind(this)));
            
            // Managers Collection
            aggregator.addHandler(Managers, _.once(function() {
                this.bootstrapManagers();
                return this.deferreds.managers.then(function() {
                    return this.collection.managers;
                }.bind(this));
            }.bind(this)));
            // Tours Collection
            aggregator.addHandler(Tours, _.once(function() {
                this.bootstrapTour();
                return this.deferreds.tour.then(function() {
                    return this.collection.tours;
                }.bind(this));
            }.bind(this)));
        }

    });

});