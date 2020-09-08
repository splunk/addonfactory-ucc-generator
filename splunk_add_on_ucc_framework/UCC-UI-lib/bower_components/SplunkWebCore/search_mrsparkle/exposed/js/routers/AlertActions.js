define(
    [
        'underscore',
        'jquery',
        'routers/BaseListings',
        'collections/shared/ModAlertActions',
        'views/alert_actions/Master',
        'collections/services/AppLocals',
        'util/general_utils'
    ],
    function(
        _,
        $,
        BaseListingsRouter,
        AlertActionsCollection,
        AlertActionsView,
        AppLocalsCollection,
        GeneralUtils
    ){
        return BaseListingsRouter.extend({
            initialize: function() {
                BaseListingsRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Manage alert actions').t());
                this.loadingMessage = _('Loading...').t();
                this.enableAppBar = false;
                this.stateModel.set({
                    sortKey: 'label',
                    sortDirection: 'asc',
                    pdf_available: true,
                    count: 25,
                    offset: 0
                });
                this.stateModel.set('fetching', true);
                //collections
                this.alertActionsCollection = new AlertActionsCollection();
                this.alertActionsCollection.on('alert-action-created', this.fetchListCollection, this);
                this.stateModel.on('change:search change:sortDirection change:sortKey change:offset change:count',
                    _.debounce(function() {
                        this.fetchListCollection();
                    }.bind(this), 50),
                    this
                );
                this.alertActionsCollection.on('destroy add', function() {
                    this.fetchListCollection();
                }.bind(this), this);
                this.collection.allLocalApps = new AppLocalsCollection();
            },
            bootstrapAppLocals: function() {
               if (this.deferreds.appLocals.state() !== 'resolved') {
                   this.collection.allLocalApps.fetch({
                       data: {
                           sort_key: 'name',
                           sort_dir: 'asc',
                           app: '-' ,
                           owner: this.model.application.get('owner'),
                           search: 'disabled=0',
                           count: -1
                       },
                       success: function(collection) {
                           var visibleApps = _(collection.models).filter(function(app){ 
                               return GeneralUtils.normalizeBoolean(app.entry.content.get('visible'));
                           });
                           this.collection.appLocalsUnfiltered.set(visibleApps);
                           this.collection.appLocals.set(_(visibleApps).filter(function(app){ return app.id !== '/servicesNS/nobody/system/apps/local/launcher'; }));
                           this.deferreds.appLocals.resolve();
                           this.deferreds.appLocalsUnfiltered.resolve();
                       }.bind(this),
                       error: function(){
                           this.deferreds.appLocals.resolve();
                           this.deferreds.appLocalsUnfiltered.resolve();
                       }.bind(this)
                   });
               } 
            },
            initializeAndRenderViews: function() {
                this.alertActionsView = new AlertActionsView({
                    model: {
                        state: this.stateModel,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        uiPrefs: this.uiPrefsModel,
                        serverInfo: this.model.serverInfo,
                        rawSearch: this.rawSearch
                    },
                    collection: {
                        alertActions: this.alertActionsCollection,
                        roles: this.rolesCollection,
                        apps: this.collection.allLocalApps
                    },
                    hideCreateLink: this.model.application.get('app') === 'system'
                });
                this.pageView.$('.main-section-body').html(this.alertActionsView.render().el);
                this.uiPrefsModel.entry.content.on('change', function() {
                    this.populateUIPrefs();
                }, this);
                this.uiPrefsModel.entry.content.on('change:display.prefs.appFilter', function() {
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
                var alertActions = this.alertActionsCollection;
                var search = this.stateModel.get('search') || '';
                if (search) {
                    search += ' AND ';
                }
                search += AlertActionsCollection.availableWithUserWildCardSearchString(this.model.application.get('owner'));
                var app = this.model.application.get('app') === 'system' ? '-' : this.model.application.get('app');
                return alertActions.fetch({
                    data : {
                        app: '-',
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
