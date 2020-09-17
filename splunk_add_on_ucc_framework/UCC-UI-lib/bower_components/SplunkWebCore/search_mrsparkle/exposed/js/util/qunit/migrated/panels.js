/* globals assert */
/**
 * @author ahebert
 * @date 3/15/16
 *
 * Setup and helper functions for panels qunit tests.
 *
 */
define([
        'jquery',
        'underscore',
        'util/qunit_utils',
        'mocks/models/MockModel',
        'mocks/models/MockSplunkD',
        'mocks/models/MockServerInfo',
        'mocks/models/MockServerInfoLite',
        'mocks/models/MockUser',
        'mocks/collections/MockCollection',
        'mocks/data/appLocal',
        'mocks/data/panels',
        'collections/services/AppLocals',
        'collections/services/authentication/Users',
        'collections/services/data/ui/Panels',
        'models/shared/Application',
        'views/shared/basemanager/Grid',
        'views/panels/shared/GridRow',
        'views/panels/shared/PageController',
        'views/panels/shared/EditDialog',
        'views/panels/shared/ActionCell'
    ],
    function(
        $,
        _,
        qunitUtils,
        MockModel,
        MockSplunkD,
        MockServerInfo,
        MockServerInfoLite,
        MockUser,
        MockCollection,
        appLocalData,
        panelsData,
        AppCollection,
        UsersCollection,
        PanelsCollection,
        Application,
        PanelsGrid,
        PanelsGridRow,
        PageController,
        AddEditDialog,
        PanelActionCell
    ) {

        return {
            /**
             * Internal
             *
             * Creates a PanelsController.
             * @returns {*} A new Panel Controller.
             */
            createPanelsController: function(product){
                var ServerInfoClass = product === "lite" ? MockServerInfoLite: MockServerInfo;
                return new PageController({
                    model: {
                        application: this.createTestApplicationModel(),
                        controller: this.controllerModel,
                        user: new MockUser({isLite: product === "lite"}),
                        serverInfo: new ServerInfoClass()
                    },
                    collection: new MockCollection(),
                    grid: {
                        showAppFilter: false,
                        showOwnerFilter: false
                    },
                    customViews: {
                        ActionCell: PanelActionCell
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
             * Creates a panels collection for testing.
             */
            createTestPanelsCollection: function(){
                this.panelsFetchData = new MockModel();

                this.panelsCollection = new PanelsCollection(null, {
                    fetchData: this.panelsFetchData
                });
                this.panelsCollection.fetch();
                this.requests[this.requestsPanel++].respond(200, {}, JSON.stringify(panelsData.FULL_PANELS_LIST));

                this.clock.tick(1);
                this.deferreds.panels.resolve();

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
            initialSetupTestPanels: function(product){
                this.$container = $('<div class="main-section-body"></div>').appendTo('body');
                this.clock = sinon.useFakeTimers();
                this.xhr = sinon.useFakeXMLHttpRequest();
                this.testController = this.createPanelsController(product);
                this.requests = [];
                this.requestsPanel = 0;

                this.xhr.onCreate = _(function (xhr) {
                    this.requests.push(xhr);
                }).bind(this);

                this.controllerModel = new MockModel();
                this.userModel = new MockUser({isLite: product === "lite"});

                if (this.product === 'lite') {
                    this.controllerModel.set('mode', 'lite');
                } else if (this.product === 'core') {
                    this.controllerModel.set('mode', 'local');
                }

                this.deferreds = {};
                this.deferreds.panels = $.Deferred();
            },

            /**
             * Initial setup for testing panelsGrid.
             * @param product - Name of product (core, cloud).
             * @returns {*} A new panelsGrid for testing.
             */
            setupTestPanelsGrid: function(product){
                this.initialSetupTestPanels(product);
                this.createTestPanelsCollection();

                this.view = new PanelsGrid({
                    model: {
                        application: this.createTestApplicationModel(),
                        controller: this.controllerModel,
                        metadata: this.panelsFetchData,
                        user: this.userModel
                    },
                    collection: {
                        entities: this.panelsCollection
                    },
                    template: this.testController.options.templates.grid,
                    templates: this.testController.options.templates,
                    customViews: {
                        ActionCell: PanelActionCell,
                        GridRow: PanelsGridRow
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
             * Initial setup for testing panelsGridRow.
             * @param product - Name of product (core, lite).
             * @returns {*} A new panelsGridRow for testing.
             */
            setupTestPanelsGridRow: function(product){
                this.initialSetupTestPanels(product);
                this.createTestPanelsCollection(product);

                this.panelModel = new MockSplunkD();
                this.panelModel.parse({entry:[panelsData.FULL_PANELS_LIST.entry[0]]});

                this.view = new PanelsGridRow({
                    model: {
                        application: this.createTestApplicationModel(),
                        controller: this.controllerModel,
                        entity: this.panelModel,
                        user: this.userModel
                    },
                    collection: {
                        entities: this.panelsCollection
                    },
                    isExpanded: false,
                    template: this.testController.options.templates.gridRow,
                    customViews: {
                        ActionCell: PanelActionCell
                    },
                    grid : {
                        showStatusColumn: true
                    }
                });
                this.view.render().appendTo(this.$container);
                return this.view;
            },

            /**
             * Initial setup for testing panelsView.
             * @param product - Name of product (core, lite).
             * @returns {*} A new panelsView for testing.
             */
            setupTestPanelsView: function(product){
                this.initialSetupTestPanels(product);
                this.createTestPanelsCollection();
                this.createTestApplicationModel();

                var ServerInfoClass = product === "lite" ? MockServerInfoLite: MockServerInfo;
                this.view = new PageController({
                    model: {
                        application: this.createTestApplicationModel(),
                        controller: this.controllerModel,
                        metadata: this.panelsFetchData,
                        serverInfo: new ServerInfoClass(),
                        user: this.userModel
                    },
                    collection: {
                        entities: this.panelsCollection,
                        appLocals: this.appsCollection,
                        users: new UsersCollection(),
                        usersSearch: new UsersCollection()
                    },
                    template: this.testController.options.templates.mainView,
                    templates: this.testController.options.templates,
                    panelsCollectionClass: PanelsCollection,
                    panelModelClass: MockSplunkD,
                    customViews: {
                        ActionCell: PanelActionCell,
                        GridRow: PanelsGridRow
                    },
                    grid: {
                        showAppFilter: true,
                        showOwnerFilter: true
                    },
                    router: this.testController
                });

                this.view.render().appendTo(this.$container);
                return this.view;
            },

            /**
             * Initial setup for testing panelsView.
             * @param product - Name of product (core, cloud).
             * @returns {*} A new panelsView for testing.
             */
            setupTestPanelsAddEdit: function(product, isNew){
                this.initialSetupTestPanels(product);
                this.createTestPanelsCollection();
                this.createTestApplicationModel();

                this.panelModel = new MockSplunkD();
                this.panelModel.parse({entry:[panelsData.FULL_PANELS_LIST.entry[0]]});

                // Mock the deferreds
                this.deferreds.entity = $.Deferred();
                this.deferreds.appsLocals = $.Deferred();
                this.deferreds.entity.resolve();
                this.deferreds.appsLocals.resolve();

                var dialogOptions = {
                    isNew: isNew,
                    model: {
                        application: this.createTestApplicationModel(),
                        controller: this.controllerModel,
                        entity: this.panelModel,
                        user: this.userModel
                    },
                    collection: {
                        archives: this.archivesCollection,
                        entities: this.panelsCollection,
                        appLocals: this.appsCollection
                    },
                    customViews: {
                        ActionCell: PanelActionCell,
                        AddEditDialog: AddEditDialog
                    },
                    entityModelClass: MockSplunkD,
                    deferreds: this.deferreds
                };
                this.view = new AddEditDialog(dialogOptions);

                this.view.render().appendTo(this.$container);
                this.view.show();
                return this.view;
            },

            /**
             * Tests sorting on panelsGrid.
             * @param sortLink - ClassName of the sorting header link on the grid table.
             * @param sortKey - Data key in panelsFetchData model to sort on.
             * @param panelsFetchData - The model to sort on.
             * @param isHidden - Set true is column is suppose to be hidden.
             */
            testSortColumn: function(sortLink, sortKey, panelsFetchData, isHidden) {
                if (!panelsFetchData){
                    panelsFetchData = this.panelsFetchData;
                }
                var sortKeyValue = "";
                panelsFetchData.on("change:sortKey", function(model, value) {
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
             * Tests clicking action links in panels table.
             * @param linkClass - ClassName of the link to click on.
             * @param linkEvent - Event emitted when link is clicked for controllerModel model to lsiten to.
             * @param controllerModel - The model that listens to the click events.
             */
            testClickLink: function(linkClass, linkEvent, controllerModel) {
                var linkPressed = false;

                controllerModel.on(linkEvent, function(model) {
                    linkPressed = true;
                }, this);
                qunitUtils.generateClickEvent($(linkClass));
                this.clock.tick(1);

                assert.equal(linkPressed, true, linkClass + " Link clicked");
            },

            /**
             * Creates a new panel.
             * @param controllerModel - The model used to create the new panel.
             */
            testCreateNewPanel: function(controllerModel){
                var createPanelClicked = false;

                controllerModel.on("editEntity", function() {
                    createPanelClicked = true;
                });
                qunitUtils.generateClickEvent($(".new-entity-button"));
                this.clock.tick(3);

                assert.equal(createPanelClicked, true, "New panel button clicked");
            },

            /**
             * Filters the panels table.
             * @param searchString - The filter string.
             * @param view - The view that contains the filter text box.
             * @param panelsFetchData - The model to sort on.
             */
            testNameFilter: function(searchString, view, panelsFetchData){
                if (!view){
                    view = this.view;
                }
                if (!panelsFetchData){
                    panelsFetchData = this.panelsFetchData;
                }
                var nameFilterValue = "";
                panelsFetchData.on("change:nameFilter", function(model, value) {
                    nameFilterValue = value;
                }, this);
                view.children.masterView.children.textNameFilter.setValue(searchString);
                assert.equal(nameFilterValue, searchString, "Name filter value updated");
            },

            /**
             * Fill out dialog to create new panel.
             * @param panelName - Name of the panel to create.
             * @param values - {} Object of values for the new panel.
             * @param view - The addEditPanelDialog.
             */
            testCreatePanel: function(panelName, values, view){
                if (!view){
                    view = this.view;
                }

                var name = null;
                if (panelName){
                    this.panelModel.entry.on("change:name", function(panelModel, value) {
                        name = value;
                        assert.ok(value, "name set to " + value);
                    }, this);
                    view.children.entityName.children.child0.setValue(panelName);
                    if (this.product === 'core'){
                        this.panelModel.entry.acl.on("change:app", function(panelModel, value) {
                            assert.ok(value, "app set to " + value);
                        }, this);
                        view.children.appSelect.children.child0.setValue(values.app);
                    }
                }

                // Validate values
                if (this.panelModel.set({}, {validate:true})) {
                    assert.equal(name, panelName, "New panel (" + panelName + ") created.");
                }
                else {
                    assert.ok(!name, "New panel not created. Name is required.");
                }
            },

            /**
             * Removes dom when finish testing.
             * @param testPanelsObject The dom to remove (default this.view).
             */
            teardownTestPanelsObject: function(testPanelsObject){
                if (testPanelsObject){
                    testPanelsObject = this.view;
                }
                testPanelsObject.remove();
            }
        };
    });