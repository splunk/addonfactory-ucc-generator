// Router for Management Console Data Inputs page
// @author: nmisty
define([
    'underscore',
    'jquery',
    'backbone',
    'routers/ManagementconsoleBase',
    'models/classicurl',
    'models/managementconsole/DmcFetchData',
    'models/managementconsole/DMCContextualFetchData',
    'models/managementconsole/ChangesCollectionFetchData',
    'models/managementconsole/inputs/FileAndDirectory',
    'models/managementconsole/inputs/TCP',
    'models/managementconsole/inputs/UDP',
    'models/managementconsole/inputs/HTTP',
    'models/managementconsole/inputs/Script',
    'models/managementconsole/inputs/WinEventLog',
    'models/managementconsole/inputs/PerfMon',
    'collections/managementconsole/inputs/InputsMeta',
    'collections/managementconsole/Groups',
    'collections/managementconsole/Apps',
    'collections/managementconsole/Changes',
    'collections/managementconsole/topology/Instances',
    'collections/managementconsole/inputs/FilesAndDirectories',
    'collections/managementconsole/inputs/TCP',
    'collections/managementconsole/inputs/UDP',
    'collections/managementconsole/inputs/HTTP',
    'collections/managementconsole/inputs/Scripts',
    'collections/managementconsole/inputs/WinEventLogs',
    'collections/managementconsole/inputs/PerfMon',
    'views/managementconsole/data_inputs/tabviews/FilesAndDirectories',
    'views/managementconsole/data_inputs/wizards/monitor/Master',
    'views/managementconsole/data_inputs/tabviews/TCP',
    'views/managementconsole/data_inputs/wizards/tcp/Master',
    'views/managementconsole/data_inputs/tabviews/UDP',
    'views/managementconsole/data_inputs/tabviews/Scripts',
    'views/managementconsole/data_inputs/wizards/scripts/Master',
    'views/managementconsole/data_inputs/tabviews/HTTP',
    'views/managementconsole/data_inputs/wizards/http/Master',
    'views/managementconsole/data_inputs/tabviews/WinEventLog',
    'views/managementconsole/data_inputs/wizards/wineventlog/Master',
    'views/managementconsole/data_inputs/tabviews/PerfMon',
    'views/managementconsole/data_inputs/wizards/perfmon/Master',
    'views/managementconsole/data_inputs/Master'
], function (
    _,
    $,
    Backbone,
    DmcBaseRouter,
    classicurl,
    FetchData,
    ContextualFetchData,
    ChangesFetchData,
    FileAndDirectoryModel,
    TCPModel,
    UDPModel,
    HTTPModel,
    ScriptModel,
    WinEventLogModel,
    PerfMonModel,
    // Information required for left column
    InputsMetaCollection,
    // Information required for the context
    ServerClassesCollection,
    AppsCollection,
    // required for listing changes
    ChangesCollection,
    InstancesCollection,
    FilesAndDirectoriesCollection,
    TCPCollection,
    UDPCollection,
    HTTPCollection,
    ScriptsCollection,
    WinEventLogsCollection,
    WinPerfMonsCollection,
    FilesAndDirectoriesView,
    FileAndDirectoryWizard,
    TCPView,
    TCPWizard,
    UDPView,
    ScriptView,
    ScriptWizard,
    HTTPView,
    HTTPWizard,
    WinEventLogView,
    WinEventLogWizard,
    PerfMonView,
    PerfMonWizard,
    MasterViewController
) {
    var strings = {
        TITLE: _('Inputs').t()
    };
    // please make sure the id matches with ids
    // in views/data_inputs/Master.js
    var INPUTS_REGISTRY = {
        monitor: {
            CollectionKlass: FilesAndDirectoriesCollection,
            ViewKlass: FilesAndDirectoriesView,
            ModelKlass: FileAndDirectoryModel,
            WizardKlass: FileAndDirectoryWizard
        },
        tcp: {
            CollectionKlass: TCPCollection,
            ViewKlass: TCPView,
            ModelKlass: TCPModel,
            WizardKlass: TCPWizard
        },
        udp:  {
            CollectionKlass: UDPCollection,
            ViewKlass: UDPView,
            ModelKlass: UDPModel,
            WizardKlass: TCPWizard
        },
        http:  {
            CollectionKlass: HTTPCollection,
            ViewKlass: HTTPView,
            ModelKlass: HTTPModel,
            WizardKlass: HTTPWizard
        },
        script:  {
            CollectionKlass: ScriptsCollection,
            ViewKlass: ScriptView,
            ModelKlass: ScriptModel,
            WizardKlass: ScriptWizard
        },
        wineventlog:  {
            CollectionKlass: WinEventLogsCollection,
            ViewKlass: WinEventLogView,
            ModelKlass: WinEventLogModel,
            WizardKlass: WinEventLogWizard
        },
        perfmon:  {
            CollectionKlass: WinPerfMonsCollection,
            ViewKlass: PerfMonView,
            ModelKlass: PerfMonModel,
            WizardKlass: PerfMonWizard
        }
    };
    return DmcBaseRouter.extend({
        initialize: function () {
            DmcBaseRouter.prototype.initialize.apply(this, arguments);

            this.controller = this.controller || {};
            this.children = this.children || {};
            this.collection = this.collection || {};
            this.deferreds = this.deferreds || {};

            this.model.classicurl = classicurl;
            this.collection.relatedBundles = new InstancesCollection();

            this._initializeDMCContext();
            this._initializePendingChanges();
            this._initializeListingCollection();

            // views will use classicurl model for channelling filter information
            this.listenTo(this.model.classicurl, 'change', this.handleUrlUpdate);
        },

        _initializeDMCContext: function () {
            this.collection.serverclasses = new ServerClassesCollection();
            this.collection.serverclasses.fetchData.set({
                type: 'custom',
                names_only:'true'
            }, { silent: true });

            this.collection.apps = new AppsCollection();
            this.collection.apps.fetchData.set({
                names_only: 'true',
                count: 0
            }, { silent: true });

            this.collection.nodes = new InstancesCollection();
            this.collection.nodes.fetchData.set({
                names_only: 'true',
                query: JSON.stringify({ topology: "forwarder:member" })
            }, { silent: true });

            this.deferreds.serverclasses = this.collection.serverclasses.fetch();
            this.deferreds.apps = this.collection.apps.fetch();
            this.deferreds.nodes = this.collection.nodes.fetch();
        },

        _initializePendingChanges: function () {
            this.collection.changes = new ChangesCollection(null, {
                fetchData: new ChangesFetchData({
                    sortKey: 'name',
                    sortDirection: 'desc',
                    count: 25,
                    offset: 0,
                    query: '{}',
                    state: 'pending'
                })
            });

            this.deferreds.changes = this.collection.changes.fetch();
        },

        _initializeListingCollection: function () {
            var fetchDataOptions = {
                sortKey: 'name',
                sortDirection: 'asc',
                count: 10,
                offset: 0,
                nameFilter: '',
                bundle: this.model.classicurl.get('bundle')
            };

            _.each(INPUTS_REGISTRY, function (obj, key, registry) {
                var CollectionKlass = obj.CollectionKlass;
                var collectionName = 'listing_' + key;

                this.collection[collectionName] = new CollectionKlass(null, {
                    fetchData: new ContextualFetchData(_.clone(fetchDataOptions))
                });
            }, this);
        },

        handleUrlUpdate: function () {
            var bundle = this.model.classicurl.get('bundle');
            if (this.collection.tabs && !_.isUndefined(bundle)) {
                this.collection.tabs.fetchData.set('bundle', bundle);
            }
            this.model.classicurl.save({}, {replaceState: true});
        },

        page: function (locale, app, view) {
            DmcBaseRouter.prototype.page.apply(this, arguments);
            this.setPageTitle(strings.TITLE);

            // The view does not need to wait for
            // serverclasses and apps to load
            // may change once context is added
            $.when(
                this.deferreds.user,
                this.deferreds.pageViewRendered,
                this.model.classicurl.fetch())
                .done(_(function () {

                    this.collection.tabs = new InputsMetaCollection(null, {
                        fetchData: new ContextualFetchData({
                            count: 0,
                            bundle: this.model.classicurl.get('bundle')
                        })
                    });

                    $.when(
                        this.deferreds.apps,
                        this.deferreds.serverclasses,
                        this.collection.tabs.fetch())
                        .done(_(function renderPageView() {
                            $('.preload').replaceWith(this.pageView.el);

                            this.children.masterView = new MasterViewController({
                                model: this.model,
                                collection: this.collection,
                                deferreds: this.deferreds,
                                registry: INPUTS_REGISTRY
                            });

                            this.pageView.$('.main-section-body').append(
                                this.children.masterView.render().$el);
                        }).bind(this))
                        .fail(_(function renderErrorView() {
                            //NMTODO: MAJOR add error view when tabs endpoint fails.
                        }).bind(this));

                }).bind(this));
        }
    });
});
