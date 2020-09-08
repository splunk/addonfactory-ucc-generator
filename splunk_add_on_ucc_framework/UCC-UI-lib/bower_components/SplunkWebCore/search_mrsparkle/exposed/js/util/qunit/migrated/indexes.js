/* globals assert */
/**
 * @author ecarillo
 * @date 4/23/15
 *
 * Setup and helper functions for indexes qunit tests.
 *
 */
define([
    'jquery',
    'underscore',
    'util/qunit_utils',
    'mocks/models/MockModel',
    'mocks/models/MockSplunkD',
    'mocks/models/MockUser',
    'mocks/collections/MockCollection',
    'mocks/data/appLocal',
    'mocks/data/archives',
    'mocks/data/indexes',
    'collections/indexes/cloud/Archives',
    'collections/services/AppLocals',
    'collections/services/data/Indexes',
    'models/shared/Application',
    'models/services/server/ServerInfo',
    'models/indexes/shared/IndexFetchData',
    'views/indexes/shared/Grid',
    'views/indexes/shared/GridRow',
    'views/indexes/shared/PageController',
    'routers/Indexes',
    'routers/IndexesCloud'
    ],
    function(
        $,
        _,
        qunitUtils,
        MockModel,
        MockSplunkD,
        MockUser,
        MockCollection,
        appLocalData,
        archivesData,
        indexesData,
        ArchivesCollection,
        AppCollection,
        IndexesCollection,
        Application,
        ServerInfo,
        IndexFetchData,
        IndexesGrid,
        IndexesGridRow,
        PageController,
        IndexesRouter,
        IndexesRouterCloud
    ) {

    return {
        /**
         * Creates an IndexesController of a given product.
         * @param product - Name of product (core, cloud).
         * @param model - (optional) Model to pass to controller.
         * @param collection (optional) Collection to pass to controller.
         * @returns {*} A new Index Controller.
         */
        createIndexesController: function(product, model, collection){
            this.product = product;
            var controller = null;
            switch(product){
                case 'cloud':
                    controller = new IndexesRouterCloud({isSingleInstanceCloud: false}).createController(model, collection);
                    break;
                default:
                    controller = new IndexesRouter().createController(model, collection);
            }
            return controller;
        },

        /**
         * Creates an IndexesController of a given product with test model and collection.
         * @param product - Name of product (core, cloud).
         * @returns {*} A new Index Controller for testing.
         */
        createTestIndexesController: function(product){
            return this.createIndexesController(product || 'core', {
                application: this.createTestApplicationModel(),
                user: new MockUser({isLite: product === "lite"})
            }, new MockCollection());
        },

        /**
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
         * Creates an indexes collection for testing.
         */
        createTestIndexesCollection: function(){
            this.indexesFetchData = new MockModel({
                count:5
            });

            this.indexesCollection = new IndexesCollection(null, {
                fetchData: this.indexesFetchData
            });
            this.indexesCollection.fetch();
            this.requests[this.requestsIndex++].respond(200, {}, JSON.stringify(indexesData.FULL_INDEXES_LIST));

            this.clock.tick(1);
            this.deferreds.indexes.resolve();

            this.archivesFetchData = new MockModel({
                count:"5"
            });

            this.archivesCollection = new ArchivesCollection(null, {
                fetchData: this.archivesFetchData
            });
            //this.requests[this.requestsIndex++].respond(200, {}, JSON.stringify(archivesData.FULL_INDEXES_LIST));
            //this.archivesCollection.fetch();
            this.archivesCollection.setFromSplunkD(archivesData.FULL_ARCHIVES_LIST);
            this.clock.tick(1);
            this.deferreds.archives.resolve();


            this.appsCollection = new AppCollection();
            this.appsCollection.parse({
                data: appLocalData.APP_LOCAL
            });

            // Clear the requests
            this.requests = [];
        },

        /**
         * Initial setup for testing.
         * @param product - Name of product (core, cloud).
         */
        initialSetupTestIndexes: function(product){
            this.$container = $('<div class="container"></div>').appendTo('body');
            this.clock = sinon.useFakeTimers();
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.testController = this.createIndexesController(product);
            this.requests = [];
            this.requestsIndex = 0;

            this.xhr.onCreate = _(function (xhr) {
                this.requests.push(xhr);
            }).bind(this);

            this.controllerModel = new MockModel();
            this.userModel = new MockUser({isLite: product === "lite"});

            if (this.product === 'cloud') {
                this.controllerModel.set('mode', 'cloud');
            } else if (this.product === 'core') {
                this.controllerModel.set('mode', 'local');
            }

            this.deferreds = {};
            this.deferreds.indexes = $.Deferred();
            this.deferreds.archives = $.Deferred();


        },

        /**
         * Initial setup for testing indexesGrid.
         * @param product - Name of product (core, cloud).
         * @returns {*} A new indexesGrid for testing.
         */
        setupTestIndexesGrid: function(product){
            this.initialSetupTestIndexes(product);
            this.createTestIndexesCollection();

            this.view = new IndexesGrid({
                model: {
                    application: this.createTestApplicationModel(),
                    controller: this.controllerModel,
                    metadata: this.indexesFetchData,
                    user: this.userModel
                },
                collection: {
                    entities: this.indexesCollection
                },
                template: this.testController.options.templates.grid,
                templates: this.testController.options.templates,
                customViews: {
                    GridRow: IndexesGridRow
                },
                grid: {}
            });
            this.view.render().appendTo(this.$container);
            return this.view;
        },

        /**
         * Initial setup for testing indexesGridRow.
         * @param product - Name of product (core, cloud).
         * @returns {*} A new indexesGridRow for testing.
         */
        setupTestIndexesGridRow: function(product){
            this.initialSetupTestIndexes(product);

            this.indexModel = new MockSplunkD();
            this.indexModel.parse({entry:[indexesData.FULL_INDEXES_LIST.entry[0]]});

            this.view = new IndexesGridRow({
                model: {
                    application: this.createTestApplicationModel(),
                    controller: this.controllerModel,
                    entity: this.indexModel,
                    user: this.userModel
                },
                index: 2,
                isExpanded: false,
                rowNumber: 2,
                template: this.testController.options.templates.gridRow
            });
            this.view.render().appendTo(this.$container);
            return this.view;
        },

        /**
         * Initial setup for testing indexesView.
         * @param product - Name of product (core, cloud).
         * @returns {*} A new indexesView for testing.
         */
        setupTestIndexesView: function(product){
            this.initialSetupTestIndexes(product);
            this.createTestIndexesCollection();
            this.createTestApplicationModel();

            this.view = new PageController({
                model: {
                    application: this.createTestApplicationModel(),
                    controller: this.controllerModel,
                    metadata: this.indexesFetchData,
                    serverInfo: new ServerInfo(),
                    user: this.userModel
                },
                collection: {
                    entities: this.indexesCollection,
                    appLocals: this.appsCollection
                },
                template: this.testController.options.templates.mainView,
                templates: this.testController.options.templates,
                indexesCollectionClass: IndexesCollection,
                indexModelClass: MockSplunkD,
                customViews: {
                    GridRow: IndexesGridRow
                },
                grid: {
                    showAppFilter: false
                },
                router: this.testController
            });

            this.view.render().appendTo(this.$container);
            return this.view;
        },

        /**
         * Initial setup for testing indexesView.
         * @param product - Name of product (core, cloud).
         * @returns {*} A new indexesView for testing.
         */
        setupTestIndexesAddEdit: function(product, isNew){
            this.initialSetupTestIndexes(product);
            this.createTestIndexesCollection();
            this.createTestApplicationModel();

            this.indexModel = new MockSplunkD();
            this.indexModel.parse({entry:[indexesData.FULL_INDEXES_LIST.entry[0]]});

            var dialogOptions = {
                isNew: isNew,
                model: {
                    application: this.createTestApplicationModel(),
                    controller: this.controllerModel,
                    entity: this.indexModel,
                    user: this.userModel
                },
                collection: {
                    archives: this.archivesCollection,
                    entities: this.indexesCollection,
                    appLocals: this.appsCollection
                },
                customViews: {
                    AddEditDialog: this.testController.options.addEditDialogClass
                },
                entityModelClass: MockSplunkD
            };
            this.view = new this.testController.options.addEditDialogClass(dialogOptions);

            this.view.render().appendTo(this.$container);
            this.view.show();
            return this.view;
        },

        /**
         * Tests sorting on indexesGrid.
         * @param sortLink - ClassName of the sorting header link on the grid table.
         * @param sortKey - Data key in indexesFetchData model to sort on.
         * @param indexesFetchData - The model to sort on.
         * @param isHidden - Set true is column is suppose to be hidden.
         */
        testSortColumn: function(sortLink, sortKey, indexesFetchData, isHidden) {
            if (!indexesFetchData){
                indexesFetchData = this.indexesFetchData;
            }
            var sortKeyValue = "";
            indexesFetchData.on("change:sortKey", function(model, value) {
                sortKeyValue = value;
            }, this);
            qunitUtils.generateClickEvent($(sortLink));
            this.clock.tick(1);

            if (!isHidden){
                assert.equal(sortKeyValue, sortKey, "Sort " + sortKey + " column");
            }
            else {
                assert.equal(sortKeyValue, "", "Did Not Sort " + sortKey + " column because column is hidden");
            }
        },

        /**
         * Tests clicking action links in indexes table.
         * @param linkClass - ClassName of the link to click on.
         * @param linkEvent - Event emitted when link is clicked for controllerModel model to lsiten to.
         * @param controllerModel - The model that listens to the click events.
         */
        testClickLink: function(linkClass, linkEvent, controllerModel) {
            if (controllerModel){
                controllerModel = this.controllerModel;
            }
            var linkPressed = false;
            controllerModel.on(linkEvent, function(model) {
                linkPressed = true;
            }, this);
            qunitUtils.generateClickEvent($(linkClass));
            this.clock.tick(1);
            assert.equal(linkPressed, true, linkClass + " Link clicked");
        },

        /**
         * Creates a new index.
         * @param controllerModel - The model used to create the new index.
         */
        testCreateNewIndex: function(controllerModel){
            if (controllerModel){
                controllerModel = this.controllerModel;
            }
            var createIndexClicked = false;

            controllerModel.on("editEntity", function() {
                createIndexClicked = true;
            });
            qunitUtils.generateClickEvent($(".new-entity-button"));
            this.clock.tick(3);

            assert.equal(createIndexClicked, true, "New Index Button clicked");
        },

        /**
         * Filters the indexes table.
         * @param searchString - The filter string.
         * @param view - The view that contains the filter text box.
         * @param indexesFetchData - The model to sort on.
         */
        testNameFilter: function(searchString, view, indexesFetchData){
            if (!view){
                view = this.view;
            }
            if (!indexesFetchData){
                indexesFetchData = this.indexesFetchData;
            }
            var nameFilterValue = "";
            indexesFetchData.on("change:nameFilter", function(model, value) {
                nameFilterValue = value;
            }, this);
            view.children.masterView.children.textNameFilter.setValue(searchString);
            assert.equal(nameFilterValue, searchString, "Name Filter value updated");
        },

        /**
         * Fill out dialog to create new index.
         * @param indexName - Name of the index to create.
         * @param values - {} Object of values for the new index.
         * @param view - The addEditIndexDialog.
         * @param model - The model to create the index on.
         */
        testCreateIndex: function(indexName, values, view, model){
            if (!view){
                view = this.view;
            }
            if (!model){
                model = view.addEditIndexModel;
            }

            var name = null;
            if (indexName){
                model.on("change:name", function(indexModel, value) {
                    name = value;
                    assert.ok(value, "name set to " + value);
                }, this);
                view.children.inputName.children.child0.setValue(indexName);
                if (this.product === 'core'){
                    model.on("change:maxIndexSize", function(indexModel, value) {
                        assert.ok(value, "maxIndexSize set to " + value);
                    }, this);
                    model.on("change:frozenPath", function(indexModel, value) {
                        assert.ok(value, "frozenPath set to " + value);
                    }, this);
                    model.on("change:app", function(indexModel, value) {
                        assert.ok(value, "app set to " + value);
                    }, this);
                    view.children.inputMaxIndexSize.children.child0.setValue(values.maxIndexSize);
                    view.children.inputFrozenPath.children.child0.setValue(values.frozenPath);
                    view.children.selectApp.children.child0.setValue(values.app);
                }
                else if (this.product === 'cloud'){
                    model.on("change:maxTotalDataSizeGB", function(indexModel, value) {
                        assert.ok(value, "maxTotalDataSizeGB set to " + value);
                    }, this);
                    model.on("change:frozenTimePeriodInDays", function(indexModel, value) {
                        assert.ok(value, "frozenTimePeriodInDays set to " + value);
                    }, this);
                    view.children.inputMaxSize.children.child0.setValue(values.maxTotalDataSizeGB);
                    view.children.inputRetention.children.child0.setValue(values.frozenTimePeriodInDays);
                }
            }

            // Validate values
            if (model.set({}, {validate:true})) {
                assert.equal(name, indexName, "New index (" + indexName + ") created.");
            }
            else {
                assert.ok(!name, "New index not created. Name is required.");
            }
        },

        /**
         * Removes dom when finish testing.
         * @param testIndexesObject The dom to remove (default this.view).
         */
        teardownTestIndexesObject: function(testIndexesObject){
            if (testIndexesObject){
                testIndexesObject = this.view;
            }
            testIndexesObject.remove();
        }
    };
});