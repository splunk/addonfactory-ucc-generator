define(
    [
        'underscore',
        'jquery',
        'routers/BaseListings',
        'collections/shared/Dashboards',
        'views/shared/Page',
        'views/dashboards/Master',
        'util/pdf_utils'
    ],
    function(
        _,
        $,
        BaseListingsRouter,
        DashboardsCollection,
        PageView,
        DashboardsView,
        pdfUtils
    ){
        return BaseListingsRouter.extend({
            initialize: function() {
                BaseListingsRouter.prototype.initialize.apply(this, arguments);
                this.fetchUserPref = true; 
                this.setPageTitle(_('Dashboards').t());
                this.loadingMessage = _('Loading...').t();
                if (window.location.pathname.indexOf('system/dashboards') != -1) {
                    this.enableAppBar = false;
                }
                //state model
                var stateModel = this.stateModel;
                this.stateModel.set({
                    sortKey: 'label',
                    sortDirection: 'asc',
                    pdf_available: true,
                    count: 100,
                    offset: 0
                });

                pdfUtils.isPdfServiceAvailable().always(function(available, which){
                    stateModel.set('pdf_available', available);
                    stateModel.set('pdfgen_type', which);
                });

                this.stateModel.set('fetching', true);

                //collections
                this.dashboardsCollection = new DashboardsCollection();

                this.dashboardsCollection.on('dashboard-created', this.fetchDashboards, this);
                this.stateModel.on('change:search change:sortDirection change:sortKey change:pdf_availabled change:offset',
                    _.debounce(function() {
                        this.fetchListCollection();
                    }.bind(this), 50),
                    this
                );

                this.dashboardsCollection.on('destroy', function() {
                    this.fetchListCollection();
                }.bind(this), this);
            },
            initializeAndRenderViews: function() {
                this.dashboardsView = new DashboardsView({
                    model: {
                        state: this.stateModel,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        uiPrefs: this.uiPrefsModel,
                        userPref: this.model.userPref,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        rawSearch: this.rawSearch
                    },
                    collection: {
                        dashboards: this.dashboardsCollection,
                        roles: this.rolesCollection,
                        appLocalsUnfiltered: this.collection.appLocalsUnfiltered,
                        appLocalsUnfilteredAll: this.collection.appLocalsUnfilteredAll
                    },
                    hideCreateLink: this.model.application.get('app') === 'system' ? true : false
                });
                this.pageView.$('.main-section-body').html(this.dashboardsView.render().el);

                this.uiPrefsModel.entry.content.on('change', function() {
                    this.populateUIPrefs();
                }, this);

                this.uiPrefsModel.entry.content.on('change:display.prefs.aclFilter', function() {
                    this.fetchListCollection();
                }, this);
            },
            fetchListCollection: function() {
                this.stateModel.set('fetching', true);
                this.model.classicurl.fetch();
                if (this.model.classicurl.get('search')) {
                    this.stateModel.set('search', this.model.classicurl.get('search'), {silent: true});
                    this.model.classicurl.unset('search');
                    this.model.classicurl.save({}, {replaceState: true});
                }
                if (this.model.classicurl.get('rawSearch')) {
                    this.rawSearch.set('rawSearch', this.model.classicurl.get('rawSearch'), {silent: true});
                    this.model.classicurl.unset('rawSearch');
                    this.model.classicurl.save({}, {replaceState: true});
                }
                var dashboards = this.dashboardsCollection,
                    search = this.stateModel.get('search') || '',
                    buttonFilterSearch = this.getButtonFilterSearch();
                    if (search) {
                        search += ' AND ';
                    }
                if (buttonFilterSearch) {
                    search += buttonFilterSearch + ' AND ';
                }
                search += DashboardsCollection.availableWithUserWildCardSearchString(this.model.application.get('owner'));

                var app = this.model.application.get('app') === 'system' ? '-' : this.model.application.get('app');
                return dashboards.fetch({
                    data : {
                        app: app,
                        owner: '-',
                        search: search,
                        sort_dir: this.stateModel.get('sortDirection'),
                        sort_key: this.stateModel.get('sortKey').split(','),
                        sort_mode: ['alpha', 'alpha'],
                        count: this.stateModel.get('count'),
                        offset: this.stateModel.get('offset')
                    },
                    success: function() {
                        this.stateModel.set('fetching', false);
                    }.bind(this)
                });
            }
        });
    }
);
