define(
    [
        'underscore',
        'jquery',
        'routers/BaseListings',
        'collections/search/Alerts',
        'collections/shared/ModAlertActions',
        'models/services/AppLocal',
        'views/shared/Paywall',
        'views/alerts/Master',
        'splunk.util'
    ],
    function(
        _,
        $,
        BaseListingsRouter,
        SavedAlertsCollection,
        ModAlertActionsCollection,
        AppLocalModel,
        PaywallView,
        AlertsView,
        splunkUtil
    ){
        return BaseListingsRouter.extend({
            initialize: function() {
                BaseListingsRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Alerts').t());
                this.loadingMessage = _('Loading...').t();
                if (window.location.pathname.indexOf('system/alerts') != -1) {
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
                this.savedAlertsCollection = new SavedAlertsCollection();
                this.namespaceTestModel = new AppLocalModel();
                this.alertActionsCollection = new ModAlertActionsCollection();

                // TODO: Add fetch data options - currently doing and unbouded fetch
                this.deferredAlertActionCollection = this.alertActionsCollection.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        search: 'disabled!=1'
                    },
                    addListInTriggeredAlerts: true
                });

                //events
                this.stateModel.on('change:sortDirection change:sortKey change:search change:offset', _.debounce(function(){
                    this.fetchListCollection();
                }.bind(this), 0), this);

                this.savedAlertsCollection.on('destroy', function() {
                    this.fetchListCollection();
                }.bind(this), this);
            },
            initializeAndRenderViews: function() {
                if (this.model.user.canUseAlerts()) {
                    $.when(this.deferredAlertActionCollection, this.deferreds.namespaceAppDeferred).then(function() {
                        this.alertsView = new AlertsView({
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
                                savedAlerts: this.savedAlertsCollection,
                                roles: this.rolesCollection,
                                apps: this.collection.appLocals,
                                alertActions: this.alertActionsCollection
                            }
                        });
                        this.pageView.$('.main-section-body').html(this.alertsView.render().el);

                        this.uiPrefsModel.entry.content.on('change', function() {
                            this.populateUIPrefs();
                        }, this);

                        this.uiPrefsModel.entry.content.on('change:display.prefs.aclFilter', function() {
                            this.fetchListCollection();
                        }, this);
                    }.bind(this));
                } else {
                    // Display the paywall if we are running on a free license. Alerts are not available in the free version
                    this.paywallView = new PaywallView({
                        title: _('Alerts').t(),
                        model: {
                            application: this.model.application,
                            serverInfo: this.model.serverInfo
                    }});

                    this.pageView.$('.main-section-body').html(this.paywallView.render().el);
                }
            },
            bootstrapServerInfo: function() {
                if (this.deferreds.serverInfo.state() !== 'resolved') {
                    this.model.serverInfo.fetch({
                        success: function(model, response) {
                            this.deferreds.serverInfo.resolve();
                        }.bind(this),
                        error: function(model, response) {
                            this.deferreds.serverInfo.resolve();
                        }.bind(this)
                    });
                }
            },
            fetchListCollection: function() {
                // Fetch data for potential namespace filtering:
                // only for Splunk Light users (!canUseApps)
                // If success, apply namespace filtering
                // Otherwise, show all alerts
                var namespaceCandidate = this.model.classicurl.decode(window.location.search).ns;
                if (!this.model.user.canUseApps() && namespaceCandidate) {
                    this.namespaceTestModel.set({id: this.namespaceTestModel.url + '/' + namespaceCandidate});
                    this.namespaceTestModel.fetch({
                        success: function(model, response) {
                            this.setPageTitle(splunkUtil.sprintf(_("Alerts for %s").t(), namespaceCandidate));
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
                    if (this.model.user.canUseAlerts()) {
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

                        search += SavedAlertsCollection.availableWithUserWildCardSearchString(this.model.application.get('owner')) + ' AND is_visible=1';

                        if (namespaceCandidate) {
                            search += " AND eai:acl.app = "+namespaceCandidate;
                        }
                        this.stateModel.set('fetching', true);

                        return this.savedAlertsCollection.fetch({
                            data:{
                                app: this.model.application.get('app') === 'system' ? '-' : this.model.application.get('app'),
                                owner: '-',
                                sort_dir: this.stateModel.get('sortDirection'),
                                sort_key: this.stateModel.get('sortKey').split(','),
                                sort_mode: ['natural', 'natural'],
                                search: search,
                                count: this.stateModel.get('count'),
                                listDefaultActionArgs: true,
                                offset: this.stateModel.get('offset')
                            },
                            success: function() {
                                this.stateModel.set('fetching', false);
                            }.bind(this)
                        });
                    } else {
                        this.stateModel.set("fetching", false);
                    }
                }).bind(this));
            }
        });
    }
);
