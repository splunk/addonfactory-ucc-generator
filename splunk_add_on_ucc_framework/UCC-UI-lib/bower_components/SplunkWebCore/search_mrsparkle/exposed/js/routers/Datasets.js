define(
    [
        'jquery',
        'underscore',
        'routers/BaseListings',
        'collections/datasets/Datasets',
        'models/Base',
        'models/services/appsbrowser/v1/App',
        'models/services/AppLocal',
        'models/shared/User',
        'views/datasets/Master',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        BaseListingsRouter,
        DatasetsCollection,
        BaseModel,
        AppModel,
        AppLocalModel,
        UserModel,
        DatasetsView,
        splunkDUtils
    ) {
        return BaseListingsRouter.extend({
            initialize: function() {
                BaseListingsRouter.prototype.initialize.apply(this, arguments);

                this.setPageTitle(_('Datasets').t());
                this.loadingMessage = _('Loading...').t();

                // Collections
                this.collection.datasets = new DatasetsCollection();

                // Models
                this.model.datasetsAddonLocal = new AppLocalModel();
                this.model.state = new BaseModel({
                    sortKey: 'displayName',
                    sortDirection: 'asc',
                    count: 100,
                    offset: 0,
                    fetching: true
                });
                this.model.datasetsAddonRemote = new AppModel({
                    id: 3245
                });

                // Deferreds
                this.deferreds.datasetsAddonLocal = $.Deferred();
                this.deferreds.datasetsAddonRemote = $.Deferred();

                this.bootstrapDatasetsAddonLocal();
                this.bootstrapDatasetsAddonRemote();

                this.model.state.on('change:sortDirection change:sortKey change:search change:offset', _.debounce(function(){
                    this.fetchListCollection();
                }.bind(this), 0), this);

                this.collection.datasets.on('destroy', function() {
                    this.fetchListCollection();
                }.bind(this), this);
            },

            $whenFetchInitializeDependencies: function() {
                return $.when(
                    this.rolesCollectionDeferred,
                    this.uiPrefsDeferred,
                    this.deferreds.pageViewRendered,
                    this.deferreds.userPref,
                    this.deferreds.datasetsAddonLocal,
                    this.deferreds.datasetsAddonRemote
                );
            },

            initializeAndRenderViews: function() {
                this.datasetsView = new DatasetsView({
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        datasetsAddonLocal: this.model.datasetsAddonLocal,
                        datasetsAddonRemote: this.model.datasetsAddonRemote,
                        rawSearch: this.rawSearch,
                        serverInfo: this.model.serverInfo,
                        state: this.model.state,
                        uiPrefs: this.uiPrefsModel,
                        user: this.model.user,
                        userPref: this.model.userPref
                    },
                    collection: {
                        apps: this.collection.appLocals,
                        datasets: this.collection.datasets,
                        roles: this.rolesCollection
                    }
                });
                
                this.pageView.$('.main-section-body').html(this.datasetsView.activate({ deep: true }).render().el);
                
                this.uiPrefsModel.entry.content.on('change', function() {
                    this.populateUIPrefs();
                }, this);

                this.uiPrefsModel.entry.content.on('change:display.prefs.aclFilter', function() {
                    this.fetchListCollection();
                }, this);
            },

            page: function(locale, app, page) {
                BaseListingsRouter.prototype.page.apply(this, arguments);
                this.model.classicUrl.fetch({
                    success: function(resp) {
                        this.rawSearch.set('rawSearch', resp.get('rawSearch'));
                        this.stateModel.set('search', resp.get('search'));
                    }.bind(this)
                });
            },

            bootstrapDatasetsAddonLocal: function() {
                if (this.deferreds.datasetsAddonLocal.state() !== 'resolved') {
                    this.model.datasetsAddonLocal.fetch({
                        url: splunkDUtils.fullpath(this.model.datasetsAddonLocal.url + '/' + encodeURIComponent(UserModel.CORE_JS_APP_NAMES.DATASETS_EXTENSIONS)),
                        data: {
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        },
                        success: function(model, response) {
                            this.deferreds.datasetsAddonLocal.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.datasetsAddonLocal.resolve();
                        }.bind(this)
                    });
                }
            },

            bootstrapDatasetsAddonRemote: function() {
                $.when(this.deferreds.appLocals, this.deferreds.user).then(function() {
                    // If the user already has access to the datasets add-on, or they cannot install
                    // apps at all, then we should not try to fetch the remote app because it is an
                    // expensive fetch.
                    
                    if (this.model.user.canAccessSplunkDatasetExtensions() || !this.collection.appLocals.links.get('create')) {
                        this.deferreds.datasetsAddonRemote.resolve();
                    }
                    
                    if (this.deferreds.datasetsAddonRemote.state() !== 'resolved') {
                        this.model.datasetsAddonRemote.fetch({
                            success: function(model, response) {
                                this.deferreds.datasetsAddonRemote.resolve();
                            }.bind(this),
                            error: function(model, response) {
                                this.deferreds.datasetsAddonRemote.resolve();
                            }.bind(this)
                        });
                    }
                }.bind(this));
            },

            fetchListCollection: function() {
                var app = this.model.application.get('app') === 'system' ? '-' : this.model.application.get('app'),
                    search = this.model.state.get('search') || '',
                    buttonFilterSearch = this.getButtonFilterSearch(),
                    sort_dir = this.model.state.get('sortDirection'),
                    sort_key = this.model.state.get('sortKey').split(','),
                    sort_mode = 'natural';
                
                if (buttonFilterSearch) {
                    search += buttonFilterSearch;
                }
                
                if (sort_key[0] === 'dataset.type') {
                    sort_dir = [sort_dir, sort_dir, sort_dir];
                    sort_mode = [sort_mode, sort_mode, sort_mode];
                }

                if ((sort_key[0] === 'eai:acl.owner') || (sort_key[0] === 'eai:acl.app') || (sort_key[0] === 'eai:acl.sharing')) {
                    sort_dir = [sort_dir, sort_dir];
                    sort_mode = [sort_mode, sort_mode];
                }
                
                this.model.state.set('fetching', true);
                
                return this.collection.datasets.fetch({
                    data: {
                        app: app,
                        owner: '-',
                        sort_dir: sort_dir,
                        sort_key: sort_key,
                        sort_mode: sort_mode,
                        search: search,
                        count: this.model.state.get('count'),
                        offset: this.model.state.get('offset')
                    },
                    success: function() {
                        this.model.state.set('fetching', false);
                    }.bind(this)
                });
            }
        });
    }
);
