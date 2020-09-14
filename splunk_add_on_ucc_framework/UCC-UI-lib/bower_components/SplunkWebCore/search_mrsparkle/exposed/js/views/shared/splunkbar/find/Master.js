define([
    'jquery',
    'underscore',
    'module',
    'models/Base',
    'views/shared/splunkbar/find/results/Master',
    'views/shared/splunkbar/find/FindProgress',
    'views/shared/splunkbar/find/Input',
    'collections/shared/Dashboards',
    'collections/search/Reports',
    'collections/search/Alerts',
    'collections/datasets/Datasets',
    'collections/services/datamodel/DataModels',
    'views/Base',
    './Master.pcssm',
    'util/splunkd_utils'
],
function(
    $,
    _,
    module,
    BaseModel,
    FindBarResults,
    FindProgress,
    InputView,
    DashboardsCollection,
    ReportsCollection,
    AlertsCollection,
    DatasetsCollection,
    DataModelsCollection,
    BaseView,
    css,
    splunkdUtils
) {
    return BaseView.extend({
        moduleId: module.id,
        css: css,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            //models
            this.stateModel = new BaseModel();
            this.rawSearch = new BaseModel();
            //collections
            this.initializeCollections();
            //deferreds
            this.initializeDeferreds();

            this.children.findProgress = new FindProgress({
                model: {
                    application: this.model.application,
                    state: this.stateModel,
                    rawSearch: this.rawSearch
                },
                mode: 'menu',
                onHiddenRemove: true
            });

            this.stateModel.on('change:search',
                _.debounce(function() {
                    var rawSearch = this.rawSearch.get('rawSearch'),
                        $target =  this.$el,
                        $focus = this.$('input');
                    if (!rawSearch || rawSearch === '') {
                        if (this.children.findbarResults) {
                            this.children.findbarResults.hide();
                        }
                        this.resetCollections();
                        return;
                    }

                    // Show find progress while waiting for results to return.
                    if (this.children.findbarResults) {
                        this.children.findbarResults.hide();
                    }

                    $($target).append(this.children.findProgress.render().el);
                    this.children.findProgress.show($target, {$onOpenFocus: $focus});

                    this.initializeDeferreds();
                    this.resolveDeferredsOnSync();
                    this.fetchReportBasedCollection(this.collection.reports, {
                        excludeAlerts: true,
                        excludeDatasets: true
                    });
                    this.fetchReportBasedCollection(this.collection.alerts);
                    this.fetchDatasetCollection();
                    this.fetchDashboardCollection();
                    this.fetchDataModelCollection();

                    $.when(
                        this.deferreds.dashboardDeferred,
                        this.deferreds.reportDeferred,
                        this.deferreds.alertDeferred,
                        this.deferreds.datasetDeferred,
                        this.deferreds.datamodelDeferred
                    ).then(function() {
                            this.showFindBarResults($target);
                        }.bind(this));
                }.bind(this), 250),
                this
            );
        },
        events: {
            'click': function(e){
                var rawSearch = this.rawSearch.get('rawSearch');
                if (rawSearch && rawSearch !== '') {
                    var $target = $(e.currentTarget);
                    this.showFindBarResults($target);
                }
            }
        },
        initializeCollections: function() {
            this.collection = _.extend({}, this.collection || {}, {
                dashboards: new DashboardsCollection(),
                reports: new ReportsCollection(),
                alerts: new AlertsCollection(),
                datasets: new DatasetsCollection(),
                datamodels: new DataModelsCollection()
            });
        },
        resetCollections: function() {
            this.collection.dashboards.reset();
            this.collection.reports.reset();
            this.collection.alerts.reset();
            this.collection.datasets.reset();
            this.collection.datamodels.reset();
        },
        initializeDeferreds: function() {
            this.deferreds = {
                dashboardDeferred: $.Deferred(),
                reportDeferred: $.Deferred(),
                alertDeferred: $.Deferred(),
                datasetDeferred: $.Deferred(),
                datamodelDeferred: $.Deferred()
            };
        },
        resolveDeferredsOnSync: function() {
            this.collection.dashboards.on('sync', function() {
                this.deferreds.dashboardDeferred.resolve();
            }.bind(this));

            this.collection.reports.on('sync', function() {
                this.deferreds.reportDeferred.resolve();
            }.bind(this));

            this.collection.alerts.on('sync', function() {
                this.deferreds.alertDeferred.resolve();
            }.bind(this));

            this.collection.datasets.on('sync', function() {
                this.deferreds.datasetDeferred.resolve();
            }.bind(this));

            this.collection.datamodels.on('sync', function() {
                this.deferreds.datamodelDeferred.resolve();
            }.bind(this));
        },
        showFindBarResults: function($target) {
            var $focus = this.$('input');
            this.children.findProgress.hide();
            //return;
            if (this.children.findbarResults && this.children.findbarResults.shown) {
                this.children.findbarResults.render();
                return;
            }
            this.children.findbarResults = new FindBarResults({
                collection: {
                    dashboards: this.collection.dashboards,
                    reports: this.collection.reports,
                    alerts: this.collection.alerts,
                    datasets: this.collection.datasets,
                    datamodels: this.collection.datamodels,
                    apps: this.collection.apps
                },
                model: {
                    application: this.model.application,
                    state: this.stateModel,
                    rawSearch: this.rawSearch
                },
                mode: 'menu',
                onHiddenRemove: true
            });
            $($target).append(this.children.findbarResults.render().el);
            this.children.findbarResults.show($target, {$onOpenFocus: $focus});
        },
        fetchReportBasedCollection: function(collection, options) {
            options = options || {};
            var search = this.stateModel.get('search') || '';
            if (search) {
                search += ' AND ';
            }
            search += ReportsCollection.availableWithUserWildCardSearchString(this.model.application.get('owner')) +
                ' AND is_visible=1';

            var fetchOptions = _.extend({}, {
                data: {
                    app: '-',
                    owner: '-',
                    search: search,
                    count: 3,
                    offset: 0
                }
            }, options);
            collection.safeFetch(fetchOptions);
        },
        fetchDashboardCollection: function() {
            var dashboards = this.collection.dashboards,
                search = '';
            if (this.rawSearch.get('rawSearch')) {
                search = splunkdUtils.createSearchFilterString(this.rawSearch.get('rawSearch'), ['label','eai:data']);

            }
            if (search) {
                search += ' AND ';
            }
            search += DashboardsCollection.availableWithUserWildCardSearchString(this.model.application.get('owner'));

            dashboards.safeFetch({
                data : {
                    app: '-',
                    owner: '-',
                    search: search,
                    count: 3,
                    offset: 0
                }
            });
        },
        fetchDataModelCollection: function() {
            if (!this.model.serverInfo.isLite()) {
                var datamodels = this.collection.datamodels,
                    search = this.rawSearch.get('rawSearch') || '';
                if (search) {
                    search += ' AND ';
                }
                search += '(eai:acl.owner="*")';

                datamodels.safeFetch({
                    data : {
                        app: '-',
                        owner: '-',
                        sort_mode: ['auto', 'auto'],
                        search: search,
                        count: 3,
                        offset: 0,
                        concise: true
                    },
                    success: function(response) {
                    }.bind(this)
                });
            } else {
                this.deferreds.datamodelDeferred.resolve();
            }
        },
        fetchDatasetCollection: function() {
            if (!this.model.serverInfo.isLite()) {
                var datasets = this.collection.datasets,
                    search = this.rawSearch.get('rawSearch') || '';
                if (search) {
                    search += ' AND ';
                }
                search += '(eai:acl.owner="*")';

                datasets.safeFetch({
                    data : {
                        app: '-',
                        owner: '-',
                        sort_mode: ['auto', 'auto'],
                        search: search,
                        count: 3,
                        offset: 0
                    }
                });
            } else {
                this.deferreds.datasetDeferred.resolve();
            }
        },
        render: function() {
            this.$el.html('');
            this.children.findbar = new InputView({
                model: this.stateModel,
                rawSearch: this.rawSearch,
                placeholder: _("Find").t(),
                canClear: true
            });
            this.children.findbar.render().appendTo(this.$el);
        }
    });
});
