define(
    [
        'underscore',
        'jquery',
        'routers/BaseListings',
        'collections/search/Reports',
        'models/services/AppLocal',
        'views/reports/Master',
        'splunk.util'
    ],
    function(
        _,
        $,
        BaseListingsRouter,
        ReportsCollection,
        AppLocalModel,
        ReportsView,
        splunkUtil
    ){
        return BaseListingsRouter.extend({
            initialize: function() {
                BaseListingsRouter.prototype.initialize.apply(this, arguments);
                this.fetchExternalVisualizations = true;
                this.fetchExternalVisualizationFormatters = false;
                this.setPageTitle(_('Reports').t());
                this.loadingMessage = _('Loading...').t();
                if (window.location.pathname.indexOf('system/reports') != -1) {
                    this.enableAppBar = false;
                }
                //state model
                this.stateModel.set({
                    sortKey: 'name',
                    sortDirection: 'asc',
                    count: 100,
                    offset: 0
                });
                this.stateModel.set('fetching', true);
                this.deferreds.namespaceAppDeferred = $.Deferred();
                //collections
                this.reportsCollection = new ReportsCollection();
                this.namespaceTestModel = new AppLocalModel();

                //events
                this.stateModel.on('change:sortDirection change:sortKey change:search change:offset', _.debounce(function(){
                    this.fetchListCollection();
                }.bind(this), 0), this);

                this.reportsCollection.on('destroy', function() {
                    this.fetchListCollection();
                }.bind(this), this);
            },
            initializeAndRenderViews: function() {
                $.when(this.deferreds.namespaceAppDeferred).then(_(function() {
                    this.reportsView = new ReportsView({
                        model: {
                            state: this.stateModel,
                            application: this.model.application,
                            appLocal: this.model.appLocal,
                            classicurl: this.model.classicurl,
                            user: this.model.user,
                            uiPrefs: this.uiPrefsModel,
                            serverInfo: this.model.serverInfo,
                            rawSearch: this.rawSearch
                        },
                        collection: {
                            reports: this.reportsCollection,
                            roles: this.rolesCollection,
                            apps: this.collection.appLocals
                        }
                    });
                    this.pageView.$('.main-section-body').html(this.reportsView.render().el);

                    this.uiPrefsModel.entry.content.on('change', function() {
                        this.populateUIPrefs();
                    }, this);

                    this.uiPrefsModel.entry.content.on('change:display.prefs.aclFilter', function() {
                        this.fetchListCollection();
                    }, this);
                }).bind(this));
            },
            fetchListCollection: function() {
                // Fetch data for potential namespace filtering:
                // only for Splunk Light users (!canUseApps)
                // If success, apply namespace filtering
                // Otherwise, show all reports
                var namespaceCandidate = this.model.classicurl.decode(window.location.search).ns;
                if (!this.model.user.canUseApps() && namespaceCandidate) {
                    this.namespaceTestModel.set({id: this.namespaceTestModel.url + '/' + namespaceCandidate});
                    this.namespaceTestModel.fetch({
                        success: function(model, response) {
                            this.setPageTitle(splunkUtil.sprintf(_("Reports for %s").t(), namespaceCandidate));
                            this.stateModel.set('namespace', namespaceCandidate);
                            this.deferreds.namespaceAppDeferred.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            namespaceCandidate = undefined;
                            this.deferreds.namespaceAppDeferred.resolve();
                        }.bind(this)
                    });
                } else {
                    // In Splunk Enterprise and when there is no namespace, just proceed as usual
                    this.deferreds.namespaceAppDeferred.resolve();
                }
                
                $.when(this.deferreds.namespaceAppDeferred).then(_(function() {
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
                    var search = this.stateModel.get('search') || '',
                        buttonFilterSearch = this.getButtonFilterSearch();
                    if (search) {
                        search += ' AND ';
                    }
                    if (buttonFilterSearch) {
                        search += buttonFilterSearch + ' AND ';
                    }
                    search += ReportsCollection.availableWithUserWildCardSearchString(this.model.application.get('owner')) + ' AND is_visible=1';

                    if (namespaceCandidate) {
                        search += " AND eai:acl.app = "+namespaceCandidate;
                    }

                    this.stateModel.set('fetching', true);

                    this.reportsCollection.fetch({
                        data : {
                            app: this.model.application.get('app') === 'system' ? '-' : this.model.application.get('app'),
                            owner: '-',
                            sort_dir: this.stateModel.get('sortDirection'),
                            sort_key: this.stateModel.get('sortKey').split(','),
                            sort_mode: ['natural', 'natural'],
                            search: search,
                            count: this.stateModel.get('count'),
                            listDefaultActionArgs: true,
                            offset: this.stateModel.get('offset'),
                            show_all_embedded_tokens: '1'
                        },
                        excludeAlerts: true,
                        success: function() {
                            this.stateModel.set('fetching', false);
                        }.bind(this)
                    });
                }).bind(this));
            }
        });
    }
);
