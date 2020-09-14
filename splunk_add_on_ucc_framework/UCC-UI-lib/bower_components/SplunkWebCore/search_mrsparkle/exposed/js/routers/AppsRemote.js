define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'routers/Base',
        'models/url',
        'models/apps_remote/Login',
        'views/shared/apps_remote/Master',
        'collections/services/appsbrowser/v1/Apps',
        'collections/services/Messages',
        'collections/services/appsbrowser/v1/app/Options',
        'util/general_utils',
        'jquery.cookie'
    ],
    function(
        $,
        _,
        BaseModel,
        BaseRouter,
        urlModel,
        loginModel,
        MasterView,
        AppsBrowserCollection,
        MessagesCollection,
        OptionsCollection,
        GeneralUtils
        ){
        var DEFAULT_FETCH_PARAMS = {offset: 0, count: 20, order: 'latest'};
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Splunk Apps Browser').t());
                this.enableAppBar = false;
                this.fetchAppLocals = true;
                this.model.auth = new loginModel();
                this.model.metadata = urlModel;
                this.collection.appsRemote = new AppsBrowserCollection();
                this.collection.messages = new MessagesCollection();
                this.collection.options = new OptionsCollection();
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                this.deferreds.metadata = this.model.metadata.fetch();
                this.model.metadata.save(_.defaults(this.model.metadata.toJSON(), DEFAULT_FETCH_PARAMS),{replaceState: true, silent: true});
                this.$whenMasterViewDependencies().done(function() {
                    this.model.metadata.on('change', function(model, category) {
                        if(!('offset' in model.changed)) {
                            this.model.metadata.set({offset: 0}, {silent: true});
                        }
                        if ('support' in model.changed) {
                            // SPL-131712 this field doesn't support multivalue
                            var support = this.model.metadata.get('support');
                            if (_.isArray(support) && support[1]) {
                                this.model.metadata.set({'support': [support[1]]});
                            }
                        }
                        this.model.metadata.save({}, {silent: true});
                        this.fetchAppsRemote();
                    }, this);
                    $('.preload').replaceWith(this.pageView.el);
                    this.masterView = this.createMasterView();
                    this.masterView.render().replaceContentsOf(this.pageView.$('.main-section-body'));
                    this.collection.options.fetch();
                    this.fetchAppsRemote();
                }.bind(this));
            },

            createMasterView: function() {
                return new MasterView({
                    model: {
                        application: this.model.application,
                        auth: this.model.auth,
                        metadata: this.model.metadata,
                        serverInfo: this.model.serverInfo,
                        user: this.model.user
                    },
                    collection: {
                        appsRemote: this.collection.appsRemote,
                        appLocals: this.collection.appLocals,
                        messages: this.collection.messages,
                        options: this.collection.options
                    },
                    hideDock: false
                });
            },

            $whenMasterViewDependencies: function() {
                return $.when(
                    this.deferreds.pageViewRendered,
                    this.deferreds.metadata,
                    this.deferreds.appLocals
                );
            },

            fetchAppsRemote: function() {
                var data = {
                    offset: this.model.metadata.get('offset') || 0,
                    limit: this.model.metadata.get('count') || 20,
                    order: this.model.metadata.get('order') || 'latest',
                    include: 'release,categories,created_by,icon,download_count'
                };

                var keys = ['query', 'created_by'];

                this.collection.options.each(function(model) {
                    keys.push(model.get('key'));
                }, this);

                keys.map( function(key) {
                    if( this.model.metadata.get(key) ) {
                        data[key] = this.model.metadata.get(key);
                    }
                }, this);

                if (data.category && data.category.length === 0) {
                    delete data.category;
                }

                this.collection.appsRemote.safeFetch({
                    cache: true,
                    reset: true,
                    data: data
                });
            },

            // apps that are not 'visible' are always filtered out
            getVisibleApps: function(collection, includeNotVisibleApps) {
                return _(collection.models).filter(function(app) {
                    return GeneralUtils.normalizeBoolean(app.entry.content.get('visible'));
                });
            },

            bootstrapAppLocals: function() {
                if (this.deferreds.appLocals.state() !== 'resolved') {
                    if (this.fetchAppLocals) {
                        this.collection.appLocals.fetch({ //fetch all apps in one shot filtering out launcher on success
                            data: {
                                sort_key: 'name',
                                sort_dir: 'asc',
                                app: '-' ,
                                owner: this.model.application.get('owner'),
                                count: -1
                            },
                            success: function(collection, response) {
                               this.collection.appLocalsUnfiltered.set(this.getVisibleApps(collection, true));
                               this.collection.appLocals.set(_(this.getVisibleApps(collection, false)).filter(function(app){ return (app.id !== '/servicesNS/nobody/system/apps/local/launcher' && app.id !== '/servicesNS/nobody/system/apps/local/gettingstarted'); }));
                               this.deferreds.appLocals.resolve();
                               this.deferreds.appLocalsUnfiltered.resolve();
                            }.bind(this),
                            error: function(collection, response) {
                                this.deferreds.appLocals.resolve();
                                this.deferreds.appLocalsUnfiltered.resolve();
                            }.bind(this)
                        });
                    } else {
                        this.collection.appLocals = undefined;
                        this.collection.appLocalsUnfiltered = undefined;
                        this.deferreds.appLocals.resolve();
                        this.deferreds.appLocalsUnfiltered.resolve();
                    }
                }
            }
        });
    }
);
