/* globals assert */
/**
 * @author claral
 * @date 9/19/16
 *
 * Setup and helper functions for savedsearches qunit tests.
 *
 */
define([
        'jquery',
        'underscore',
        'util/qunit_utils',
        'mocks/models/MockClassicUrl',
        'mocks/models/MockModel',
        'mocks/models/MockSplunkD',
        'mocks/models/MockServerInfo',
        'mocks/models/MockServerInfoLite',
        'mocks/models/MockUser',
        'mocks/collections/MockCollection',
        'mocks/data/appLocal',
        'mocks/data/savedsearches',
        'collections/services/AppLocals',
        'collections/search/Reports',
        'collections/services/authentication/Users',
        'collections/services/authorization/Roles',
        'collections/shared/ModAlertActions',
        'models/shared/Application',
        'models/search/Report',
        'models/search/Alert',
        'views/shared/basemanager/Grid',
        'views/savedsearches/GridRow',
        'views/savedsearches/PageController',
        'views/savedsearches/NewButtons',
        'contrib/text!views/savedsearches/GridRow.html'
    ],
    function(
        $,
        _,
        qunitUtils,
        MockClassicUrl,
        MockModel,
        MockSplunkD,
        MockServerInfo,
        MockServerInfoLite,
        MockUser,
        MockCollection,
        appLocalData,
        savedsearchesData,
        AppCollection,
        ReportsCollection,
        UsersCollection,
        RolesCollection,
        ModAlertActionsCollection,
        Application,
        ReportModel,
        AlertModel,
        SavedsearchesGrid,
        SavedsearchesGridRow,
        PageController,
        SavedsearchesNewButtons,
        SavedsearchesGridRowTemplate
    ) {

        return {
            /**
             * Internal
             *
             * Creates a SavedsearchesController.
             * @returns {*} A new Savedsearch Controller.
             */
            createSavedsearchesController: function(product){
                var ServerInfoClass = product === "lite" ? MockServerInfoLite: MockServerInfo;
                return new PageController({
                    model: {
                        application: this.createTestApplicationModel(),
                        controller: this.controllerModel,
                        user: new MockUser({isLite: product === "lite"}),
                        serverInfo: new ServerInfoClass(),
                        classicurl: MockClassicUrl
                    },
                    grid: {
                        showSharingColumn: false,
                        showStatusColumn: false
                    },
                    templates: {
                        gridRow: SavedsearchesGridRowTemplate
                    },
                    customViews: {
                        GridRow: SavedsearchesGridRow,
                        NewButtons: SavedsearchesNewButtons
                    }
                });
            },

            /**
             * Internal
             *
             * @returns {*} An application model for testing.
             */
            createTestApplicationModel: function(){
                return new Application({
                    app: 'test-app',
                    owner: 'test-owner',
                    locale: 'en_US'
                });
            },

            /**
             * Internal
             *
             * Creates a savedsearches collection for testing.
             */
            createTestReportsCollection: function(){
                this.savedsearchesFetchData = new MockModel();

                this.reportsCollection = new ReportsCollection(null, {
                    fetchData: this.savedsearchesFetchData
                });
                this.reportsCollection.fetch();
                this.requests[this.requestsSavedsearch++].respond(200, {}, JSON.stringify(savedsearchesData.FULL_SEARCHES_LIST));

                this.clock.tick(1);
                this.deferreds.searches.resolve();

                this.appsCollection = new AppCollection();
                this.appsCollection.parse({
                    data: appLocalData.APP_LOCAL
                });

                // Clear the requests
                this.requests = [];
            },

            /**
             * Internal
             *
             * Initial setup for testing.
             * @param product - Name of product (core, lite).
             */
            initialSetupTestSavedsearches: function(product){
                this.$container = $('<div class="main-section-body"></div>').appendTo('body');
                this.clock = sinon.useFakeTimers();
                this.xhr = sinon.useFakeXMLHttpRequest();
                this.testController = this.createSavedsearchesController(product);
                this.requests = [];
                this.requestsSavedsearch = 0;

                this.xhr.onCreate = _(function (xhr) {
                    this.requests.push(xhr);
                }).bind(this);

                this.controllerModel = new MockModel();
                this.userModel = new MockUser({
                    isLite: product === "lite",
                    admin_all_objects: true
                });

                if (this.product === 'lite') {
                    this.controllerModel.set('mode', 'lite');
                } else if (this.product === 'core') {
                    this.controllerModel.set('mode', 'local');
                }

                this.deferreds = {};
                this.deferreds.searches = $.Deferred();
            },

            /**
             * Initial setup for testing savedsearchesGrid.
             * @param product - Name of product (core, cloud).
             * @returns {*} A new savedsearchesGrid for testing.
             */
            setupTestSavedsearchesGrid: function(product){
                this.initialSetupTestSavedsearches(product);
                this.createTestReportsCollection();

                var ServerInfoClass = product === "lite" ? MockServerInfoLite: MockServerInfo;
                this.view = new SavedsearchesGrid({
                    model: {
                        application: this.createTestApplicationModel(),
                        controller: this.controllerModel,
                        metadata: this.savedsearchesFetchData,
                        user: this.userModel,
                        serverInfo: new ServerInfoClass(),
                        classicurl: MockClassicUrl
                    },
                    collection: {
                        entities: this.reportsCollection,
                        users: new MockCollection(),
                        roles: new MockCollection(),
                        alertActions: new MockCollection(),
                        appLocals: this.appsCollection
                    },
                    template: this.testController.options.templates.grid,
                    templates: this.testController.options.templates,
                    customViews: {
                        NewButtons: SavedsearchesNewButtons,
                        GridRow: SavedsearchesGridRow
                    },
                    grid: {
                        showSharingColumn: true,
                        showStatusColumn: true
                    }
                });
                this.view.render().appendTo(this.$container);
                return this.view;
            },

            /**
             * Initial setup for testing savedsearchesGridRow.
             * @param product - Name of product (core, lite).
             * @returns {*} A new savedsearchesGridRow for testing.
             */
            setupTestSavedsearchesGridRow: function(product){
                this.initialSetupTestSavedsearches(product);
                this.createTestReportsCollection();

                this.savedsearchModel = new ReportModel();
                this.savedsearchModel.parse({entry:[savedsearchesData.FULL_SEARCHES_LIST.entry[0]]});

                var ServerInfoClass = product === "lite" ? MockServerInfoLite: MockServerInfo;
                this.view = new SavedsearchesGridRow({
                    model: {
                        application: this.createTestApplicationModel(),
                        controller: this.controllerModel,
                        entity: this.savedsearchModel,
                        user: this.userModel,
                        serverInfo: new ServerInfoClass(),
                        classicurl: MockClassicUrl
                    },
                    collection: {
                        searches: this.reportsCollection,
                        users: new MockCollection(),
                        roles:  new MockCollection(),
                        alertActions:  new MockCollection(),
                        appLocals: this.appsCollection
                    },
                    isExpanded: false,
                    template: this.testController.options.templates.gridRow,
                    customViews: {
                        NewButtons: SavedsearchesNewButtons
                    },
                    grid : {
                        showSharingColumn: false,
                        showStatusColumn: false
                    }
                });
                this.view.render().appendTo(this.$container);
                return this.view;
            },

            /**
             * Tests that collections, deferreds, and configs are correctly setup.
             * @param view - testSavedSearchesObject (default this.view)
             */
            testControllerSetup: function(view) {
                if (!view) {
                    view = this.view;
                }

                assert.equal(Object.keys(view.collection).length, 7, "There should be 6 items in the collection.");
                assert.equal(Object.keys(view.collection)[0], "users", "This item in the collection should be users.");
                assert.equal(Object.keys(view.collection)[1], "alertActions", "This item in the collection should be alertActions.");
                assert.equal(Object.keys(view.collection)[2], "searchBNFs", "This item in the collection should be searchBNFs.");
                assert.equal(Object.keys(view.collection)[3], "rolesCollection", "This item in the collection should be rolesCollection.");
                assert.equal(Object.keys(view.collection)[4], "usersSearch", "This item in the collection should be usersSearch.");
                assert.equal(Object.keys(view.collection)[5], "flashMessages", "This item in the collection should be flashMessages.");
                assert.equal(Object.keys(view.collection)[6], "entities", "This item in the collection should be entities.");

                assert.equal(Object.keys(view.deferreds).length, 6, "There should be 6 items in deferrds.");
                
                assert.equal(view.options.grid.showSharingColumn, false, "showSharingColumn should be false.");
                assert.equal(view.options.grid.showStatusColumn, false, "showStatusColumn should be false.");
            },

            /**
             * Tests sorting on savedsearchesGrid.
             * @param sortLink - ClassName of the sorting header link on the grid table.
             * @param sortKey - Data key in savedsearchesFetchData model to sort on.
             * @param savedsearchesFetchData - The model to sort on.
             * @param isHidden - Set true is column is suppose to be hidden.
             */
            testSortColumn: function(sortLink, sortKey, savedsearchesFetchData, isHidden) {
                if (!savedsearchesFetchData){
                    savedsearchesFetchData = this.savedsearchesFetchData;
                }
                var sortKeyValue = "";
                savedsearchesFetchData.on("change:sortKey", function(model, value) {
                    sortKeyValue = value;
                }, this);
                qunitUtils.generateClickEvent($(sortLink));
                this.clock.tick(1);

                if (!isHidden){
                    assert.equal(sortKeyValue, sortKey, "Sort " + sortKey + " column");
                }
                else {
                    assert.equal(sortKeyValue, "", "Did not sort " + sortKey + " column because column is hidden");
                }
            },

            /**
             * Removes dom when finish testing.
             * @param testSavedsearchesObject The dom to remove (default this.view).
             */
            teardownTestSavedsearchesObject: function(testSavedsearchesObject){
                if (!testSavedsearchesObject) {
                    testSavedsearchesObject = this.view;
                }
                testSavedsearchesObject.remove();
            }
        };
    });