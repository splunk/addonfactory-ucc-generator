/**
 * @author claral
 * @date 3/30/16
 * Page controller for Sourcetype manager page.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'controllers/BaseManagerPageControllerFiltered',
        'collections/search/Reports',
        'collections/services/authentication/Users',
        'collections/services/authorization/Roles',
        'collections/services/configs/SearchBNFs',
        'collections/shared/ModAlertActions',
        'models/classicurl',
        'models/savedsearches/SavedSearchesFetchData',
        'models/search/Report',
        'models/search/Alert',
        'models/search/Job',
        'models/services/AppLocal',
        './Filters',
        './GridRow',
        './NewButtons',
        'views/shared/alertcontrols/dialogs/saveas/Master',
        'views/shared/reportcontrols/dialogs/createreport/Master',
        'views/savedsearches/PageController.pcss',
        'views/shared/pcss/basemanager.pcss',
        'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseController,
        ReportsCollection,
        UsersCollection,
        RolesCollection,
        SearchBNFsCollection,
        ModAlertActionsCollection,
        classicurl,
        EAIFilterFetchData,
        ReportModel,
        AlertModel,
        SearchJob,
        AppLocalModel,
        Filters,
        GridRow,
        NewButtons,
        NewAlertDialog,
        NewReportDialog,
        css,
        cssShared,
        splunkUtils
    ) {

        return BaseController.extend({
            moduleId: module.id,

            initialize: function(options) {
                this.collection = this.collection || {};
                this.model = this.model || {};
                this.deferreds = this.deferreds || {};

                //MODELS
                this.model.controller = new Backbone.Model();

                this.model.metadata = new EAIFilterFetchData(this.getFetchData());

                // default report/alert, to be cloned when new report/alert button is clicked.
                this.deferreds.defaultReport = this.fetchDefaultReport();

                //COLLECTIONS
                this.deferreds.users = this.fetchUsersCollection();
                this.deferreds.alertActions = this.fetchAlertActionsCollection();
                this.deferreds.searchBNFs = this.fetchSearchBNFsCollection();

                this.collection.rolesCollection = new RolesCollection();
                this.deferreds.roles = this.collection.rolesCollection.fetch();

                // Fetching will happen when a user enters a search in the owner filter.
                this.collection.usersSearch = new UsersCollection();

                options.entitiesPlural = _('Searches, Reports, and Alerts').t();
                options.entitySingular = _('Saved Search').t();
                options.header = {
                    pageTitle: _('Searches, Reports, and Alerts').t(),
                    pageDesc: _('Searches, reports, and alerts are saved searches created from pivot or the search page.').t(),
                    learnMoreLink: 'learnmore.saved.searches'
                };

                options.model = this.model;
                options.collection = this.collection;
                options.entitiesCollectionClass = ReportsCollection;
                options.entityModelClass = ReportModel;
                options.customViews = {
                    Filters: Filters,
                    GridRow: GridRow,
                    NewButtons: NewButtons
                };
                options.grid = {
                    showSharingColumn: false,
                    showStatusColumn: false,
                    showAllApps: true
                };


                this.listenTo(this.model.metadata, 'change', this.saveToUrl);
                this.listenTo(this.model.controller, "newReport", this.onNewReport);
                this.listenTo(this.model.controller, "newAlert", this.onNewAlert);

                BaseController.prototype.initialize.call(this, options);
            },

            saveToUrl: function (model, options) {
                var params = {};
                params.app = model.get('appSearch');
                params.count = model.get('count');
                params.offset = model.get('offset');
                params.sortKey = model.get('sortKey');
                params.sortDir = model.get('sortDir');
                params.itemType = model.get('itemType');

                params.owner = model.get('ownerSearch');
                params.search = model.get('nameFilter');

                this.model.classicurl.save(params, {replaceState: true});
            },

            /**
             * Override of method from superclass.
             * 'app' always defaults to '-' to have SplunkDBase fetching with namespace:
             * /en-US/splunkd/__raw/servicesNS/<owner>/<app>/saved/searches
             * @returns the fetch data option object.
             */
            getFetchData: function () {
                var defaults = {
                    sort_mode: 'natural',
                    sortKey: undefined,
                    sortDirection: undefined,
                    app: '-',
                    appSearch: undefined,
                    owner: '-',
                    ownerSearch: undefined,
                    itemType: '',
                    count: 20,
                    offset: 0,
                    listDefaultActionArgs: true,
                    show_all_embedded_tokens: '1'
                };
                var urlOwner = this.model.classicurl.get('owner');
                var appSearch = this.model.classicurl.get('app');
                var classicurlData = {
                    sortKey: this.model.classicurl.get('sortKey'),
                    sortDirection: this.model.classicurl.get('sortDir'),
                    count: this.model.classicurl.get('count'),
                    offset: this.model.classicurl.get('offset'),
                    appSearch: appSearch === '-' ? undefined : appSearch,
                    ownerSearch: urlOwner === '-' ? undefined : urlOwner,
                    nameFilter: this.model.classicurl.get('search'),
                    itemType: this.model.classicurl.get('itemType')
                };
                if (this.options.namespaceFilterCandidate) {
                    classicurlData['appSearch'] = this.options.namespaceFilterCandidate;
                }
                return $.extend(true, {}, defaults, classicurlData);
            },

            fetchDefaultReport: function() {
                this.defaultReport = new ReportModel();
                return this.defaultReport.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner")
                    }
                });
            },

            fetchUsersCollection: function() {
                this.collection.users = new UsersCollection();
                return this.collection.users.fetch();
            },

            fetchAlertActionsCollection: function() {
                this.collection.alertActions = new ModAlertActionsCollection();

                return this.collection.alertActions.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        search: 'disabled!=1'
                    },
                    addListInTriggeredAlerts: true
                });
            },

            fetchSearchBNFsCollection: function() {
                this.collection.searchBNFs = new SearchBNFsCollection();

                return this.collection.searchBNFs.fetch({
                    data: {
                        app: this.model.application.get("app"),
                        owner: this.model.application.get("owner"),
                        count: 0
                    },
                    parseSyntax: true
                });
            },

            onNewReport: function(entityModel) {
                this.model.report = new ReportModel({}, {splunkDPayload: this.defaultReport.toSplunkD()});
                this.model.searchJob = new SearchJob();
                this.children.saveAsDialog = new NewReportDialog({
                    model:  {
                        report: this.model.report,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        searchBNFs: this.collection.searchBNFs,
                        appLocals: this.collection.appLocalsUnfilteredAll
                    },
                    chooseVisualizationType: false,
                    showSearchField: true,
                    showSuccessModal: false,
                    setDispatchUIArgs: false,
                    onHiddenRemove: true
                });
                this.children.saveAsDialog.render().appendTo($('body')).show();
                this.listenTo(this.children.saveAsDialog, 'reportSaved', this.fetchEntitiesCollection);
            },

            onNewAlert: function(entityModel) {
                this.model.alert = new AlertModel({}, {splunkDPayload: this.defaultReport.toSplunkD()});

                this.children.alertDialog = new NewAlertDialog({
                    model:  {
                        report: this.model.alert,
                        reportPristine: this.model.alert,  // Is correct value for reportPristine?
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        times: null,
                        searchBNFs: this.collection.searchBNFs,
                        appLocals: this.collection.appLocalsUnfilteredAll
                    },
                    showSearchField: true,
                    showSuccessModal: false,
                    setDispatchUIArgs: false,
                    onHiddenRemove: true
                });
                this.children.alertDialog.render().appendTo($('body')).show();
                this.listenTo(this.children.alertDialog, 'alertSaved', this.fetchEntitiesCollection);
            },

            entityDeleteConfirmation: function(entityToDelete) {
                return splunkUtils.sprintf(
                    _("Deleting a saved search will result in users no longer being able to use that search. Dashboards that used that search will no longer work.<br><br>Are you sure you want to delete saved search %s?").t(), '<em>' + _.escape(entityToDelete.entry.get('name')) + '</em>');
            }

        });
    });