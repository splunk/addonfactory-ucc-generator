define([
    'underscore',
    'jquery',
    'backbone',
    'routers/Base',
    'models/search/Dashboard',
    'controllers/dashboard/MainDashboardController',
    'models/dashboard/DashboardDisplayProps',
    'models/url',
    'models/services/data/ui/View',
    'models/services/data/UserPrefGeneralDefault',
    'models/search/Report',
    'models/services/ScheduledView',
    'collections/services/authorization/Roles',
    'collections/services/data/ui/Times',
    'util/splunkd_utils',
    'splunkjs/mvc/sharedmodels',
    'splunkjs/mvc/simplexml/controller',
    'splunk.util',
    'util/general_utils'
], function(_,
            $,
            Backbone,
            BaseRouter,
            DashboardModel,
            DashboardController,
            DashboardDisplayProps,
            UrlModelSingleton,
            ViewModel,
            UserPrefGeneralDefaultModel,
            ReportModel,
            ScheduledViewModel,
            RolesCollection,
            TimesCollection,
            splunkd_utils,
            SharedModels,
            LegacyController,
            SplunkUtils,
            GeneralUtils) {

    return BaseRouter.extend({
        routes: {
            ':locale/app/:app/:page?*qs': 'view',
            ':locale/app/:app/:page': 'view',
            ':locale/app/:app/:page/?*qs': 'view',
            ':locale/app/:app/:page/': 'view',
            ':locale/app/:app/:page/:mode/?*qs': 'viewMode',
            ':locale/app/:app/:page/:mode/': 'viewMode',
            ':locale/app/:app/:page/:mode?*qs': 'viewMode',
            ':locale/app/:app/:page/:mode': 'viewMode',
            '*root/:locale/app/:app/:page?*qs': 'rootedView',
            '*root/:locale/app/:app/:page': 'rootedView',
            '*root/:locale/app/:app/:page/?*qs': 'rootedView',
            '*root/:locale/app/:app/:page/': 'rootedView',
            '*root/:locale/app/:app/:page/:mode/?*qs': 'rootedViewMode',
            '*root/:locale/app/:app/:page/:mode/': 'rootedViewMode',
            '*root/:locale/app/:app/:page/:mode?*qs': 'rootedViewMode',
            '*root/:locale/app/:app/:page/:mode': 'rootedViewMode'
        },
        initialize: function(options) {
            options = $.extend({
                model: {}, collection: {}, deferreds: {}
            }, options);
            BaseRouter.prototype.initialize.call(this, options);

            this.fetchExternalVisualizations = true;
            this.fetchUserPref = true;

            this.model.url = UrlModelSingleton;
            this.model.state = new Backbone.Model({
                mode: null
            });
            this.model.page = new DashboardDisplayProps({
                loading: true,
                showToolbar: false
            });
            // dashboard view model
            this.model.view = new DashboardModel();
            this.deferreds.view = options.deferreds.view || $.Deferred();

            this.model.userPrefGeneralDefault = new UserPrefGeneralDefaultModel();
            this.deferreds.userPrefGeneralDefault = options.deferreds.userPrefGeneralDefault || $.Deferred();

            this.model.reportDefaults = new ReportModel();
            this.deferreds.reportDefaults = $.Deferred();

            // schedule view model
            this.model.scheduledView = new ScheduledViewModel();
            this.deferreds.scheduledView = options.deferreds.scheduledView || $.Deferred();

            // roles collection
            this.collection.roles = new RolesCollection();
            this.deferreds.roles = options.deferreds.roles || $.Deferred();

            // Time range presets
            this.collection.times = new TimesCollection();
            this.deferreds.times = options.deferreds.times || $.Deferred();

            SharedModels._prepopulate({
                app: {
                    model: this.model.application,
                    dfd: this.deferreds.application
                },
                user: {
                    model: this.model.user,
                    dfd: this.deferreds.user
                },
                userPref: {
                    model: this.model.userPref,
                    dfd: this.deferreds.userPref
                },
                serverInfo: {
                    model: this.model.serverInfo,
                    dfd: this.deferreds.serverInfo
                },
                appLocal: {
                    model: this.model.appLocal,
                    dfd: this.deferreds.appLocal
                },
                appLocals: {
                    model: this.collection.appLocals,
                    dfd: this.deferreds.appLocals
                },
                appLocalsUnfiltered: {
                    model: this.collection.appLocalsUnfiltered,
                    dfd: this.deferreds.appLocalsUnfiltered
                },
                appLocalsUnfilteredAll: {
                    model: this.collection.appLocalsUnfilteredAll,
                    dfd: this.deferreds.appLocalsUnfilteredAll
                },
                tours: {
                    model: this.collection.tours,
                    dfd: this.deferreds.tours
                },
                times: {
                    model: this.collection.times,
                    dfd: this.deferreds.times
                },
                roles: {
                    model: this.collection.roles,
                    dfd: this.deferreds.roles
                }
            });

            LegacyController._populateSharedModels(SharedModels);

            // We'll use our own pageview
            this.enablePageView = false;
            this.fetchAppLocals = true;

            // We need to load all external visualizations, even those that are not available for user selection.
            this.fetchExternalVisualizations = true;
            this.requireSelectableExternalVisualizations = false;
            
            // We should only update the browser URL after this page's URL has been set
            this.readyForUrlUpdates = false;

            this.controller = new DashboardController({
                model: _.extend({}, this.model),
                collection: _.extend({}, this.collection),
                deferreds: _.extend({}, this.deferreds)
            });

            this.listenTo(this.model.state, 'change:mode', this.updateUrl);
            this.listenTo(this.model.page, 'change:hideFilters', this.updateUrl);

            this.listenTo(this.model.view.entry.content, 'change:label', this.updatePageTitle);
            this.listenTo(this.model.state, 'change:mode', this.updatePageTitle);

            this.listenTo(this.model.view.entry, 'change:name', function() {
                var newPage = this.model.view.entry.get('name');
                var curPage = this.model.application.get('page');
                if (newPage !== curPage) {
                    this.model.application.set('page', newPage);
                    this.updateUrl();
                }
            });

            window.onbeforeunload = function() {
                if (this.model.state.get('dirty')) {
                    return _('You have unsaved changes. Navigating away or closing the page will discard them.').t();
                }
            }.bind(this);
        },

        populatePageParamsFromUrl: function() {
            this.model.page.setFromURL(this.model.url.toJSON());    
            this.readyForUrlUpdates = true;        
        },

        updatePageTitle: function() {
            var MODE_PAGE_TITLE = {
                view: '%s',
                edit: _('Edit: %s').t(),
                editxml: _('Edit Source: %s').t(),
                source: _('Source: %s').t()
            };

            var title = this.model.view.entry.content.get('label') || this.model.view.entry.get('name') || _('Untitled Dashboard').t();
            this.setPageTitle(SplunkUtils.sprintf(MODE_PAGE_TITLE[this.model.state.get('mode')] || '%s', title));
        },
        view: function(locale, app, page, query) {
            this.page(locale, app, page, 'view', query); // set to view mode by default
        },
        viewMode: function(locale, app, page, mode, query) {
            this.page(locale, app, page, mode, query);
        },
        rootedView: function(root) {
            this.model.application.set({
                root: root
            }, {silent: true});
            this.view.apply(this, Array.prototype.slice.call(arguments, 1));
        },
        rootedViewMode: function(root) {
            this.model.application.set({
                root: root
            }, {silent: true});
            this.viewMode.apply(this, Array.prototype.slice.call(arguments, 1));
        },
        page: function(locale, app, page, mode) {
            var curPage = this.model.application.get('page');
            if (curPage && curPage !== page) {
                // Happens after the save-as flow, we did a URL update to the new dashboard and then the user
                // navigates back via browser history. Need to reload the browser in order to show the former dashboard
                window.location.reload();
            }
            BaseRouter.prototype.page.apply(this, arguments);
            this.model.url.fetch().then(function() {
                this.populatePageParamsFromUrl();
                this.$whenPageViewDependencies().then(function() {
                    // set the state and bootstrap the main dashboard router
                    var editable = this.model.view.entry.acl.canWrite();
                    var showSourceValue = this.model.url.get('showsource');
                    if (showSourceValue !== undefined && GeneralUtils.normalizeBoolean(showSourceValue, { 'default': true })) {
                        mode = "source";
                    }
                    this.model.state.set('mode', editable ? mode : 'view');
                }.bind(this));
            }.bind(this));
        },
        updateUrl: function() {
            var MODE_MAP = {
                view: '',
                edit: 'edit',
                editxml: 'editxml',
                source: 'source'
            };

            var app = this.model.application;
            var parts = [app.get('root') || '', app.get('locale'), 'app', app.get('app'), app.get('page')];
            var mode = MODE_MAP[this.model.state.get('mode')];
            if (mode) {
                parts.push(mode);
            }
            var url = parts.join('/');

            var runtimeState = this.model.page.getRuntimeState();
            if (this.readyForUrlUpdates && runtimeState.hasChanged('hideFilters')) {
                this.model.url.set('hideFilters', runtimeState.get('hideFilters'));
            }

            var params = this.model.url.encode();
            if (params.length) {
                var queryProps = SplunkUtils.queryStringToProp(params);
                if (mode == "source") {
                    delete queryProps["showsource"];
                }
                params = SplunkUtils.propToQueryString(queryProps);
                url += '?' + params;
            }
            this.navigate(url, {replace: false});
        },
        $whenPageViewDependencies: function() {
            this.deferreds.application.then(this.bootstrapTimesCollection.bind(this));
            this.deferreds.application.then(this.bootstrapViewModel.bind(this));
            this.deferreds.application.then(this.bootstrapUserPrefGeneralDefaultModel.bind(this));
            this.deferreds.view.then(this.bootstrapScheduleViewModel.bind(this));
            this.bootstrapReportDefaultsModel();
            this.bootstrapRolesModel();
            // we don't need to wait until the schedule model resolve
            return $.when(
                BaseRouter.prototype.$whenPageViewDependencies.apply(this, arguments),
                this.deferreds.view
            );
        },
        bootstrapViewModel: function() {
            if (this.deferreds.view.state() !== 'resolved') {
                var app = this.model.application.get('app');
                var owner = this.model.application.get('owner');
                var view = this.model.application.get('page');
                var viewPartialData = __splunkd_partials__['/servicesNS/' + encodeURIComponent(owner) + '/' + encodeURIComponent(app) + '/data/ui/views/' + encodeURIComponent(view)];
                //todo figure out why server returns incorrect acl information
                if (false) {
                    this.model.view.setFromSplunkD(viewPartialData);
                    this.model.view.entry.set('name', view);
                    this.deferreds.view.resolve();
                } else {
                    this.model.view.set(this.model.view.idAttribute, this.model.view.url + "/" + encodeURIComponent(view));
                    this.model.view.fetch({
                        data: {
                            app: app,
                            owner: owner
                        },
                        success: function(model, response) {
                            this.deferreds.view.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.view.resolve();
                        }.bind(this)
                    });
                }
            }
        },
        bootstrapUserPrefGeneralDefaultModel: function() {
            if (this.deferreds.userPrefGeneralDefault.state() === 'resolved') {
                return;
            }

            this.model.userPrefGeneralDefault.fetch({
                data: {
                    app: this.model.application.get("app"),
                    owner: this.model.application.get("owner")
                }
            }).done(
                _.bind(this.deferreds.userPrefGeneralDefault.resolve, this.deferreds.userPrefGeneralDefault)
            ).fail(
                _.bind(this.deferreds.userPrefGeneralDefault.reject, this.deferreds.userPrefGeneralDefault)
            );
        },
        bootstrapScheduleViewModel: function() {
            if (this.deferreds.scheduledView.state() !== 'resolved') {
                var dfd = this.model.scheduledView.findByName(
                    this.model.view.entry.get('name'),
                    this.model.application.get('app'),
                    this.model.application.get('owner'));
                dfd.done(_.bind(this.deferreds.scheduledView.resolve, this.deferreds.scheduledView));
                dfd.fail(_.bind(this.deferreds.scheduledView.reject, this.deferreds.scheduledView));
            }
        },
        bootstrapReportDefaultsModel: function() {
            if (this.deferreds.reportDefaults.state() !== 'resolved') {
                this.model.reportDefaults.fetch()
                    .done(_.bind(this.deferreds.reportDefaults.resolve, this.deferreds.reportDefaults))
                    .fail(_.bind(this.deferreds.reportDefaults.reject, this.deferreds.reportDefaults));
            }
        },
        bootstrapRolesModel: function() {
            if (this.deferreds.roles.state() !== 'resolved') {
                this.collection.roles.fetch({})
                    .done(_.bind(this.deferreds.roles.resolve, this.deferreds.roles))
                    .fail(_.bind(this.deferreds.roles.resolve, this.deferreds.roles));
            }
        },
        bootstrapTimesCollection: function() {
            if (this.deferreds.times.state() !== 'resolved') {
                this.collection.times.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        count: -1
                    }
                }).always(_.bind(this.deferreds.times.resolve, this.deferreds.times));
            }
        }
    });
});
