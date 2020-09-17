/**
 * @author jszeto
 *
 * Router for the DataModelEditor application. This also serves as the Controller for the application.
 *
 * This router file handles the routes, the url arguments and is the controller. It fetches the Data Model
 * being edited and related models.
 */
define([

    'jquery',
    'underscore',
    'backbone',
    'splunk.util',
    'models/Base',
    'models/classicurl',
    'models/services/AppLocal',
    'models/shared/User',
    'models/services/datamodel/DataModel',
    'collections/services/AppLocals',
    'collections/services/configs/SearchBNFs',
    'collections/services/data/vix/Indexes',
    'collections/services/data/vix/Archives',
    'collections/services/data/TransformsLookups',
    'views/shared/FlashMessages',
    'views/data_model_editor/DataModelEditor',
    'views/data_model_editor/AddEditContainerView',
    'uri/route',
    'splunk.util',
    'util/splunkd_utils',
    'routers/Base'
],
    function(
        $,
        _,
        Backbone,
        splunkUtil,
        BaseModel,
        classicUrl,
        AppLocal,
        User,
        DataModel,
        AppLocals,
        SearchBNFsCollection,
        VixIndexCollection,
        ArchivesCollection,
        TransformsLookups,
        FlashMessagesView,
        DataModelEditor,
        AddEditContainerView,
        route,
        splunkUtils,
        splunkDUtils,
        BaseRouter
        )
    {
        return BaseRouter.extend({

            /**
             * Internal model that stores application state.
             *  @type {models/Base}
             *  @property {boolean} canCreateDataModel - true if user can create a data model
             *  @property {string} selectedObject - name of the selected Object
             */
            appSetting: undefined,
            /**
             * @member {models/services/datamodel/DataModel} - The DataModel model
             */
            dataModel: undefined,
            /**
             * @member {models/services/datamodel/DataModel} - A clone of the DataModel model generated when we display an Add/Edit view
             */
            dataModelClone: undefined,
            /**
             * @member {models/services/authentication/User} - User model
             */
            user: undefined,
            /**
             * @member {collections/services/data/TransformsLookups} - Transforms Lookup model
             */
            transformsLookups: undefined,
            /**
             * @member {views/data_model_editor/DataModelEditor}
             */
            dataModelEditor: undefined,
            /**
             *  @member {views/data_model_editor/AddEditContainerView}
             */
            addEditContainerView: undefined,
            /**
             *  @member {string} - name of the current Data Model
             */
            currentDataModelName: "",
            /**
             * Called once when the Router is instantiated
             */
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);

                this.enableAppBar = false;

                // Create models and views
                this.classicUrl = classicUrl;
                this.transformsLookups = new TransformsLookups();
                this.searchBNFsCollection = new SearchBNFsCollection();
                this.searchBNFsCollectionFetched = false;
                this.vixCollection = new VixIndexCollection();
                this.archivesCollection = new ArchivesCollection();
                // Only fetch lookups that have a valid fields array to work with (SPL-81851).
                this.transformsLookups.fetchData.set({ search: 'fields_array=*' }, { silent: true });
                this.appLocal = new AppLocal();
                this.appLocals = new AppLocals();
                this.appSetting = new BaseModel({ id: 'dataModel' });
                this.user = new User({}, { serverInfoModel: this.model.serverInfo });

                this.flashMessagesView = new FlashMessagesView();
            },

            /**
             * Called every time the user navigates to a new "page" (url) in the application
             *
             * @param locale
             * @param app
             * @param page
             */
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                // RENDER ENTRY POINT
                // Backbone will sync then parse the DataModel model
                // Then will populate the dataModel variable

                var appOwner = {app: this.model.application.get("app"), owner: this.model.application.get("owner")};

                // Fetch all of the models
                var transformsLookupsFetch = this.transformsLookups.fetch({
                    data: {
                        count: 300,
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner')
                    }
                });

                // fetch the list of apps.
                var appLocalsFetch = this.appLocals.fetch({
                    data: {
                        sort_key: 'name',
                        sort_dir: 'desc',
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        search: 'visible=true AND disabled=0',
                        count: -1
                    }
                });

                var appLocalFetch = this.appLocal.fetch({
                    url: splunkDUtils.fullpath(this.appLocal.url + "/" + encodeURIComponent(this.model.application.get("app"))),
                    data: appOwner
                });

                var userFetch = this.user.fetch({
                    url: splunkDUtils.fullpath(this.user.url + '/' + encodeURIComponent(this.model.application.get('owner'))),
                    data: appOwner
                });

                this.vixCollection.fetchData.set({'count': 0}, {silent:true});
                var vixFetch = this.vixCollection.fetch();

                this.archivesCollection.fetchData.set({'count': 0}, {silent:true});
                var archivesFetch = this.archivesCollection.fetch();

                if (!this.searchBNFsCollectionFetched) {
                    var searchBNFsFetch = this.searchBNFsCollection.fetch({
                        data: {
                            count: 0,
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        },
                        parseSyntax: true
                    });
                    this.searchBNFsCollectionFetched = true;
                }

                // When all of the models have been fetched
                $.when(transformsLookupsFetch, appLocalsFetch, appLocalFetch, userFetch, vixFetch, archivesFetch, searchBNFsFetch, this.deferreds.pageViewRendered).done(_(function() {
                    // Grab the query strings from the URL
                    this.classicUrl.fetch({silentClear: true}).done(_(function() {
                        var modelName = this.classicUrl.get("model");
                        var pageRouter = route.getContextualPageRouter(this.model.application);
                        var dataModelManagerUrl = pageRouter.data_model_manager();

                        // If the url didn't contain a model, then redirect to the data model manager page
                        if (modelName == undefined || modelName == "") {
                            window.location = dataModelManagerUrl;
                        }

                        // If we are dealing with a different dataModel, fetch the new model and update the views
                        if (this.currentDataModelName != modelName) {
                            this.currentDataModelName = modelName;

                            this.dataModel = new DataModel({id: modelName});
                            // TODO [JCS] We need to unregister the previous dataModel
                            this.flashMessagesView.flashMsgHelper.register(this.dataModel);

                            // Listen to changes in data model and update selectedObject
                            this.dataModel.entry.content.objects.on('add remove update reset', this.updateSelectedObject, this);

                            this.dataModel.fetch().then(_(function() {

                                // If we can't write to the model, then redirect to the data model manager page
                                if (this.dataModel.canWrite() == false) {
                                    window.location = dataModelManagerUrl;
                                }
                                else {
                                    var modelDisplayName = this.dataModel.entry.content.get('displayName');
                                    this.setPageTitle(splunkUtils.sprintf(_('Edit Objects: %s').t(), modelDisplayName));
                                    this.createViews();
                                    this.setupViewListeners();
                                    this.renderViews();
                                    this.updateState();
                                }
                            }).bind(this));
                        }

                        else {
                            this.updateState();
                        }
                    }).bind(this));

                    if (this.shouldRender) {
                        $('.preload').replaceWith(this.pageView.el);
                        // Displays any router specific errors like fetching the DataModel from the endpoint
                        this.pageView.$(".main-section-body").append(this.flashMessagesView.render().el);
                    }
                }).bind(this));
            },

            //////////////////////////////////////////////////////////////////
            // INIT FUNCTIONS
            //////////////////////////////////////////////////////////////////

            /**
             * Called when the data model has been fetched. Creates the main subview and passes in the models
             */
            createViews: function() {
                // If we can write to at least one app, then we can create a data model
                var canCreateDataModel = this.appLocals.some(function(model){
                    return model.entry.acl.get("can_write");
                }, this);
                this.appSetting.set("canCreateDataModel", canCreateDataModel);

                this.dataModelEditor = new DataModelEditor({
                    model: {
                        dataModel: this.dataModel,
                        setting: this.appSetting,
                        application: this.model.application,
                        appLocal: this.appLocal,
                        user: this.user
                    },
                    collection: {
                        apps: this.appLocals,
                        vix: this.vixCollection,
                        archives: this.archivesCollection
                    }
                });
            },

            //////////////////////////////////////////////////////////////////
            // NAVIGATION FUNCTIONS
            //////////////////////////////////////////////////////////////////
            /**
             * Go to one of the AddEdit Pages. Helper to update the URL Query strings and forces a call to route() which
             * eventually calls page().
             *
             * Eventually createAddEditView will be called with these arguments.
             */
            navigateToAction: function(options) {
                this.classicUrl.save(options, {trigger:true});
            },

            /**
             * Update the URL to match the main Data Model Editor page, but don't force a route() call
             */
            navigateToEditor: function() {
                var modelName = this.classicUrl.get("model");

                this.classicUrl.clear();
                this.classicUrl.save({model:modelName});
            },

            /**
             * Updates the application state to match the state defined by the query strings.
             */
            updateState: function() {
                this.destroyAddEditContainerView();

                if (this.classicUrl.get("type")) {
                    var options = {};
                    options.type = this.classicUrl.get("type");
                    options.parentObjectName = this.classicUrl.get("parentObjectName");
                    options.objectName = this.classicUrl.get("objectName");
                    options.fieldName = this.classicUrl.get("fieldName");
                    options.calculationID = this.classicUrl.get("calculationID");
                    options.operation = this.classicUrl.get("operation");
                    this.createAddEditObjectView(options);
                }

                // Hide the FlashMessagesView since we didn't run into any errors
                this.flashMessagesView.$el.hide();
            },

            //////////////////////////////////////////////////////////////////
            // EVENT HANDLERS
            //////////////////////////////////////////////////////////////////
            /**
             * Updates the selectObject in response to user interactions
             */
            updateSelectedObject: function() {
                // Selected Object is the item on left hand side this is selected
                var selectedObject = this.appSetting.get('selectedObject');
                // If we don't have a selectedObject, then just select the first one
                if(!selectedObject || !this.dataModel.objectByName(selectedObject)) {
                    // Tree structure of objects flatted into a list with depth attribute
                    var hierarchy = this.dataModel.getFlattenedHierarchy();
                    if (hierarchy[0])
                        this.appSetting.set({ selectedObject: hierarchy[0].objectName });
                    else
                        this.appSetting.set({ selectedObject: undefined});
                }
            },

            //////////////////////////////////////////////////////////////////
            // CONTROLLER RULES
            //////////////////////////////////////////////////////////////////

            /**
             * Add listeners to view events. These are user initiated interactions.
             */
            setupViewListeners: function () {
                this.dataModelEditor.on('action:addObject action:addCalculation', function(type, parentObjectName) {
                    this.navigateToAction({type:type, parentObjectName:parentObjectName, operation:"add"});
                }, this);
                this.dataModelEditor.on('action:editObject', function(type, parentObjectName, objectName) {
                    this.navigateToAction({type:type, parentObjectName:parentObjectName, objectName:objectName, operation:"edit"});
                }, this);

                // TODO [JCS] When switching to this view, update the scroll position (maybe use a generic page transition function)
                this.dataModelEditor.on('action:overrideInherited', function(fieldName, parentObjectName, calculationID) {
                    this.navigateToAction({type:"field", parentObjectName:parentObjectName, fieldName:fieldName, calculationID:calculationID, operation:"override"});
                }, this);
                this.dataModelEditor.on('action:editCalculation', function(type, parentObjectName, calculationID) {
                    this.navigateToAction({type:type, parentObjectName:parentObjectName, calculationID:calculationID, operation:"edit"});
                }, this);
                this.dataModelEditor.on('action:editAttribute', function(type, parentObjectName, fieldName) {
                    this.navigateToAction({type:type, parentObjectName:parentObjectName, fieldName:fieldName, operation:"edit"});
                }, this);
                this.dataModelEditor.on('action:dataModelPermissionsChange', function(modelName) {
                    this.currentDataModelName = modelName;
                    this.classicUrl.save({ model: modelName }, { replaceState: true });
                }, this);
                this.dataModelEditor.on('action:saveModel', function() {
                    this.dataModel.save();
                }, this);
                this.dataModelEditor.on('action:removeObject', function(objectModel) {
                    this.dataModel.removeObjectAndChildren(objectModel);
                }, this);
                this.dataModelEditor.on('action:fetchModel', function() {
                    this.dataModel.fetch();
                }, this);
            },

            /**
             * Destroys the currently displayed addEditContainerView
             */
            destroyAddEditContainerView: function() {

                if (this.addEditContainerView) {
                    this.addEditContainerView.$el.detach();

                    //console.log("DMER.destroyAddEditContainerView delete dataModelClone DM.cid",this.dataModel.cid,"DM Clone.cid",this.dataModelClone.cid);
                    this.dataModelClone = null;
                    this.addEditContainerView.remove();

                    this.dataModelEditor.$el.show();
                    $(window).scrollLeft(0);
                    $(window).scrollTop(0);
                }
            },

            //////////////////////////////////////////////////////////////////
            // RENDER
            //////////////////////////////////////////////////////////////////

            /**
             * Create the Add/Edit Object View
             *
             * @param options {Object}
             *  type {String} - The type of Object or Attribute to add or edit [object|child|transaction|lookup|regex|eval|geoip|field]
             *  parentObjectName {String} - The name of the parent Object to either a child Object or a calculation (lookup|regex|eval|geoip)
             *  objectName {String} - The name of the object to edit
             *  calculationID {String} - ID for the calculation to edit
             *  fieldName {String} - The name of the field to edit
             *  operation {String} - Whether to add or edit. Possible values = [add|edit|override]
             */
            createAddEditObjectView: function(options) {
                this.dataModelEditor.$el.hide();

                // model to track the state of the AddObject subview
                var addEditSettingModel = new Backbone.Model(options);

                // Make a clone of the dataModel
                this.dataModelClone = this.dataModel.clone();
                //console.log("DMER.createAddEditObjectView DM.cid",this.dataModel.cid,"DM Clone.cid",this.dataModelClone.cid);

                this.addEditContainerView = new AddEditContainerView({
                    model: {
                        application: this.model.application,
                        appLocal: this.appLocal,
                        dataModel: this.dataModelClone,
                        setting: addEditSettingModel,
                        serverInfo: this.model.serverInfo,
                        user: this.user
                    },
                    collection: {
                        transformsLookups: this.transformsLookups,
                        searchBNFs: this.searchBNFsCollection
                    }
                });

                this.addEditContainerView.on('action:cancel', function() {
                    this.destroyAddEditContainerView();
                    this.navigateToEditor();
                }, this);

                this.addEditContainerView.on('action:save', function(objectName) {
                    this.destroyAddEditContainerView();
                    this.navigateToEditor();

                    // Fetch the dataModel since we saved the clone. Once we fetch, update the selectedObject
                    $.when(this.dataModel.fetch()).done(_(function() {
                        if (options.operation == "add") {
                            if (!_.isUndefined(objectName)) {
                                this.appSetting.set('selectedObject', objectName);
                            }
                        }
                    }).bind(this));
                }, this);

                this.pageView.$(".main-section-body").append(this.addEditContainerView.render().el);
                this.addEditContainerView.$el.show();
                $(window).scrollLeft(0);
                $(window).scrollTop(0);
            },

            // These will be rendered when the data model has been fetched
            renderViews: function () {
                this.pageView.$(".main-section-body").append(this.dataModelEditor.render().el);
                if(this.classicUrl.has('dialog')) {
                    this.dataModelEditor.triggerAction(this.classicUrl.get('dialog'));
                }
            }
        });
    });
