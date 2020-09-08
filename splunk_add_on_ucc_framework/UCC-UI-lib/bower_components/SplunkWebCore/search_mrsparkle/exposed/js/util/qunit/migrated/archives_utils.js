/* globals assert */
/**
 * @author jszeto
 * @date 6/8/15
 *
 * Setup and helper functions for archives qunit tests.
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
        'collections/services/AppLocals',
        'collections/indexes/cloud/Archives',
        'models/shared/Application',
        'models/services/server/ServerInfo',
        'views/archives/shared/ArchivesController',
        'views/archives/shared/ArchivesGrid',
        'views/archives/shared/ArchivesGridRow',
        'views/archives/shared/ArchivesView'
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
        AppCollection,
        ArchivesCollection,
        Application,
        ServerInfo,
        ArchivesController,
        ArchivesGrid,
        ArchivesGridRow,
        ArchivesView
    ) {

        return {

            /**
             * Create an instance of the ArchivesController
             * @returns {ArchivesController}
             */
            createController: function() {
                var model = {application: this.createTestApplicationModel()};
                var collection = {};
                return new ArchivesController({model:model,
                    collection: collection});
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
             * Creates an archives collection for testing.
             */
            createTestArchivesCollection: function(){
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

                this.appsCollection = new AppCollection();
                this.appsCollection.parse({
                    data: appLocalData.APP_LOCAL
                });

                // Clear the requests
                this.requests = [];
            },

            /**
             * Initial setup for testing.
             */
            initialSetupTestArchives: function(){
                this.$container = $('<div class="container"></div>').appendTo('body');
                this.clock = sinon.useFakeTimers();
                this.xhr = sinon.useFakeXMLHttpRequest();
                this.testController = this.createController();
                this.requests = [];
                this.requestsIndex = 0;

                this.xhr.onCreate = _(function (xhr) {
                    this.requests.push(xhr);
                }).bind(this);

                this.controllerModel = new MockModel();
                this.userModel = new MockUser();
                this.applicationModel = new MockModel();
            },

            /**
             * Initial setup for testing archivesGrid.
             * @param product - Name of product (core, cloud).
             * @returns {*} A new archivesGrid for testing.
             */
            setupTestArchivesGrid: function(product){
                this.initialSetupTestArchives(product);
                this.createTestArchivesCollection();

                this.view = new ArchivesGrid({
                    model: {
                        controller: this.controllerModel,
                        application: this.applicationModel
                    },
                    collection: {
                        archives: this.archivesCollection
                    }
                });
                this.view.render().appendTo(this.$container);
                return this.view;
            },

            /**
             * Initial setup for testing archivesGridRow.
             * @param product - Name of product (core, cloud).
             * @returns {*} A new archivesGridRow for testing.
             */
            setupTestArchivesGridRow: function(product){
                this.initialSetupTestArchives(product);

                this.archiveModel = new MockSplunkD();
                this.archiveModel.parse({entry:[archivesData.FULL_ARCHIVES_LIST.entry[0]]});

                this.view = new ArchivesGridRow({
                    model: {
                        controller: this.controllerModel,
                        archive: this.archiveModel,
                        user: this.userModel
                    },
                    index: 2,
                    isExpanded: false,
                    rowNumber: 2
                });
                this.view.render().appendTo(this.$container);
                return this.view;
            },

            /**
             * Initial setup for testing archivesView.
             * @param product - Name of product (core, cloud).
             * @returns {*} A new archivesView for testing.
             */
            setupTestArchivesView: function(product){
                this.initialSetupTestArchives();
                this.createTestArchivesCollection();
                this.createTestApplicationModel();

                this.view = new ArchivesView({
                    model: {
                        application: this.createTestApplicationModel(),
                        controller: this.controllerModel,
                        serverInfo: new ServerInfo(),
                        user: this.userModel
                    },
                    collection: {
                        archives: this.archivesCollection,
                        apps: this.appsCollection
                    }
                });

                this.view.render().appendTo(this.$container);
                return this.view;
            },

            /**
             * Initial setup for testing archivesView.
             * @param product - Name of product (core, cloud).
             * @returns {*} A new archivesView for testing.
             */
            setupTestArchivesAddEdit: function(product, isNew){
                this.initialSetupTestArchives(product);
                this.createTestArchivesCollection();
                this.createTestApplicationModel();

                this.archiveModel = new MockSplunkD();
                this.archiveModel.parse({entry:[archivesData.FULL_INDEXES_LIST.entry[0]]});

                var dialogOptions = {
                    isNew: isNew,
                    model: {
                        application: this.createTestApplicationModel(),
                        archive: this.archiveModel,
                        user: this.userModel
                    },
                    collection: {
                        archives: this.archivesCollection,
                        apps: this.appsCollection
                    },
                    archiveModelClass: MockSplunkD
                };
                this.view = new this.testController.options.addEditDialogClass(dialogOptions);

                this.view.render().appendTo(this.$container);
                this.view.show();
                return this.view;
            },

            /**
             * Tests sorting on archivesGrid.
             * @param sortLink - ClassName of the sorting header link on the grid table.
             * @param sortKey - Data key in archivesFetchData model to sort on.
             * @param archivesFetchData - The model to sort on.
             * @param isHidden - Set true is column is suppose to be hidden.
             */
            testSortColumn: function(sortLink, sortKey, archivesFetchData, isHidden) {
                //debugger
                if (!archivesFetchData){
                    archivesFetchData = this.archivesFetchData;
                }
                var sortKeyValue = "";
                archivesFetchData.on("change:sortKey", function(model, value) {
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
             * Tests clicking action links in archives table.
             * @param linkClass - ClassName of the link to click on.
             * @param linkEvent - Event emitted when link is clicked for controllerModel model to listen to.
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
             * Creates a new archive.
             * @param controllerModel - The model used to create the new archive.
             */
            testCreateNewArchive: function(controllerModel){
                if (controllerModel){
                    controllerModel = this.controllerModel;
                }
                var createArchiveClicked = false;

                controllerModel.on("createArchive", function() {
                    createArchiveClicked = true;
                });
                qunitUtils.generateClickEvent($(".new-archive-button"));
                this.clock.tick(1);

                assert.equal(createArchiveClicked, true, "New Archive Button clicked");
            },

            /**
             * Filters the archives table.
             * @param searchString - The filter string.
             * @param view - The view that contains the filter text box.
             * @param archivesFetchData - The model to sort on.
             */
            testNameFilter: function(searchString, view, archivesFetchData){
                if (!view){
                    view = this.view;
                }
                if (!archivesFetchData){
                    archivesFetchData = this.archivesFetchData;
                }
                var nameFilterValue = "";
                archivesFetchData.on("change:nameFilter", function(model, value) {
                    nameFilterValue = value;
                }, this);
                view.children.textNameFilter.setValue(searchString);
                assert.equal(nameFilterValue, searchString, "Name Filter value updated");
            },

            /**
             * Fill out dialog to create new archive.
             * @param archiveName - Name of the archive to create.
             * @param values - {} Object of values for the new archive.
             * @param view - The addEditArchiveDialog.
             * @param model - The model to create the archive on.
             */
            testCreateArchive: function(archiveName, values, view, model){
                if (!view){
                    view = this.view;
                }
                if (!model){
                    model = view.addEditArchiveModel;
                }

                var name = null;
                if (archiveName){
                    model.on("change:name", function(archiveModel, value) {
                        name = value;
                        assert.ok(value, "name set to " + value);
                    }, this);
                    view.children.inputName.children.child0.setValue(archiveName);
                    if (this.product === 'core'){

                        model.on("change:app", function(archiveModel, value) {
                            assert.ok(value, "app set to " + value);
                        }, this);
                        view.children.selectApp.children.child0.setValue(values.app);
                    }
                    else if (this.product === 'cloud'){
                        model.on("change:maxTotalDataSizeGB", function(archiveModel, value) {
                            assert.ok(value, "maxTotalDataSizeGB set to " + value);
                        }, this);
                        model.on("change:frozenTimePeriodInDays", function(archiveModel, value) {
                            assert.ok(value, "frozenTimePeriodInDays set to " + value);
                        }, this);
                        view.children.inputMaxSize.children.child0.setValue(values.maxTotalDataSizeGB);
                        view.children.inputRetention.children.child0.setValue(values.frozenTimePeriodInDays);
                    }
                }
                // Validate values
                if (model.set({}, {validate:true})) {
                    assert.equal(name, archiveName, "New archive (" + archiveName + ") created.");
                }
                else {
                    assert.ok(!name, "New archive not created. Name is required.");
                }
            },

            /**
             * Removes dom when finish testing.
             * @param testArchivesObject The dom to remove (default this.view).
             */
            teardownTestArchivesObject: function(testArchivesObject){
                if (testArchivesObject){
                    testArchivesObject = this.view;
                }
                testArchivesObject.remove();
                this.clock.restore();
            }
        };
    });