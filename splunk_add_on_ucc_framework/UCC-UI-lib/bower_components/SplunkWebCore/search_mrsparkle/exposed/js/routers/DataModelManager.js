/**
 * @author jszeto
 * @date 1/24/13
 *
 * Router and controller for the Data Model Manager page. This router file handles the routes, and the url arguments.
 * It fetches a list of Data Models based on the sorting/filtering/pagination arguments.
 *
 * Subviews:
 *     views/data_model_manager/DataModelManager
 *
 * URL Arguments:
 *     app {string} - only return objects for this app. Set to "" to return objects for all apps
 *     owner {string} - only return objects for this owner. Set to "*" to return objects for all owners
 *     visible {boolean} - if true, return the visible objects
 *     nameFilter {string} - search string to match against the object's name. Can contain wildcards
 *     count {number} - number of objects to return
 *     offset {number} - index of first object to return
 *     sortDirection {enum} - (asc/desc) return objects in ascending or descending order of the sortKey
 *     sortKey {string} - table column to use for sorting
 *
 */
define(
    [
        'jquery',
        'backbone',
        'underscore',
        'models/classicurl',
        'models/Base',
        'models/services/AppLocal',
        'models/shared/User',
        'models/shared/EAIFilterFetchData',
        'collections/services/datamodel/DataModels',
        'collections/services/data/vix/Indexes',
        'collections/services/data/vix/Archives',
        'collections/services/AppLocals',
        'collections/services/authentication/Users',
        'views/shared/FlashMessages',
        'views/data_model_manager/DataModelManager',
        'routers/Base',
        'splunk.util',
        'util/splunkd_utils'
    ],
    function(
        $,
        Backbone,
        _,
        classicUrl,
        BaseModel,
        AppLocal,
        User,
        EAIFilterFetchData,
        DataModelCollection,
        VixIndexCollection,
        ArchivesCollection,
        AppsCollection,
        UsersCollection,
        FlashMessagesView,
        DataModelManager,
        BaseRouter,
        splunkUtils,
        splunkDUtils
        ) {
        return BaseRouter.extend({

            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Data Models').t());

                // The metadataModel is passed down to some of the subview UI elements. These UI elements
                // manipulate selected attributes of this model. This model controls sorting, pagination and filtering.
                // This model is kept in sync with the url arguments.
                this.metadataModel = new EAIFilterFetchData();
                this.metadataModel.set({
                    sortKey: 'displayName',
                    sortDirection: 'asc',
                    count:'20',
                    offset:0,
                    ownerSearch:"*",
                    visible:true
                });

                // Create the internal models
                this.dataModelsCollection = new DataModelCollection();
                this.vixCollection = new VixIndexCollection();
                this.archivesCollection = new ArchivesCollection();
                this.classicUrl = classicUrl;

                this.appLocal = new AppLocal();
                this.appsCollection = new AppsCollection();
                this.user = new User({}, { serverInfoModel: this.model.serverInfo, appLocalsCollection: this.appsCollection });
                this.usersCollection = new UsersCollection();
                this.settingsModel = new Backbone.Model();
                this.pageFirstTime = true;
                this.enableAppBar = false;
            },

            page: function(locale, app, page) {

                // Redirect to search app if we come in from a system page
                // TODO [JCS] We probably shouldn't hard code this to the search app. Instead, we should look for the
                // search app in the apps collection. If not found, default to the first app
                if (app == "system") {
                    splunkUtils.redirect_to('app/' + "search/" + page);
                }

                BaseRouter.prototype.page.apply(this, arguments);

                var appOwner = {app: this.model.application.get("app"), owner: this.model.application.get("owner")};

                // fetch the list of apps.
                var appsFetch = this.appsCollection.fetch({
                    data: {
                        sort_key: 'name',
                        sort_dir: 'desc',
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        search: 'visible=true AND disabled=0',
                        count: -1
                    }
                });

                var usersFetch = this.usersCollection.fetch({
                    data:{
                        count: 250,
                        search: 'roles=*'
                    }
                });

                var appLocalFetch = this.appLocal.fetch({
                    url: splunkDUtils.fullpath(this.appLocal.url + "/" + encodeURIComponent(this.model.application.get("app"))),
                    data: appOwner
                });

                this.vixCollection.fetchData.set({'count': 0}, {silent:true});
                var vixFetch = this.vixCollection.fetch();

                this.archivesCollection.fetchData.set({'count': 0}, {silent:true});
                var archiveFetch = this.archivesCollection.fetch();

                $.when(appsFetch).done(_(function() {
                    var userFetch = this.user.fetch({
                        url: splunkDUtils.fullpath(this.user.url + '/' + encodeURIComponent(this.model.application.get('owner'))),
                        data: appOwner
                    });

                    $.when(usersFetch, appLocalFetch, userFetch, vixFetch, archiveFetch, this.deferreds.pageViewRendered).done(_(function() {
                        // Grab the query strings from the URL
                        this.classicUrl.fetch({silentClear: true}).done(_(function() {

                            // Turn off the change handler so we can sync the the classicUrl and metadataModels without
                            // getting into an infinite loop
                            this.metadataModel.off("change", this.updateClassicUrlFromParams, this);

                            // Sync classicUrl and metadataModel models
                            this.updateParamsFromClassicUrl();
                            this.classicUrl.save(this.metadataModel.attributes, {replaceState: this.pageFirstTime});

                            // Turn on the change handler now that we've finished syncing.
                            this.metadataModel.on("change", this.updateClassicUrlFromParams, this);

                            // Check if we can write to at least one app
                            var canCreateDataModel = this.appsCollection.some(function(model){
                                return model.entry.acl.get("can_write");
                            }, this);
                            this.settingsModel.set("canCreateDataModel", canCreateDataModel);

                            // Create the main DataModelManager view
                            var dataModelManagerView = new DataModelManager({
                                collection: {
                                    dataModels: this.dataModelsCollection,
                                    apps: this.appsCollection,
                                    users: this.usersCollection,
                                    vix: this.vixCollection,
                                    archives: this.archivesCollection
                                },
                                model: {
                                    application: this.model.application,
                                    appLocal: this.appLocal,
                                    metadata: this.metadataModel,
                                    settings: this.settingsModel,
                                    user: this.user
                                }
                            });

                            dataModelManagerView.on("action:fetchDataModels", _.debounce(this.fetchDataModels), this);

                            if (this.flashMessagesView) {
                                this.flashMessagesView.remove();
                            }

                            this.flashMessagesView = new FlashMessagesView({collection:this.dataModelsCollection});

                            if (this.shouldRender) {
                                this.pageView.$(".main-section-body").append(this.flashMessagesView.render().el);
                                this.pageView.$('.main-section-body').append($('<div class="data-model-manager-placeholder"></div>'));

                                this.flashMessagesView.$el.show();
                            }

                            //perform your replace
                            if (this.dataModelManagerView) {
                                this.dataModelManagerView.remove({detach: true});
                            }
                            this.dataModelManagerView = dataModelManagerView;
                            $('.preload').replaceWith(this.pageView.el);

                            this.pageFirstTime = false;
                            this.fetchDataModels();

                            //set url options (dialog = create) to open with Create Dialog
                            if (canCreateDataModel && classicUrl.get('dialog') === 'create') {
                                this.showCreateDataModelDialog();
                            }
                        }).bind(this));
                    }).bind(this));
                }).bind(this));
            },

            /**
             * Fetch the data models based on the metadataModel. Sorting, filtering and pagination are handled
             * on the server side, so we pass these values to the backend.
             */
            fetchDataModels: function() {
                // This should probably be grabbing from the app attribute instead of appSearch,
                // but that the app filter currently only saves to appSearch when it should be saving to both appSearch and app
                this.dataModelsCollection.fetch({data: {app: this.metadataModel.get("appSearch"),
                    owner:"-",
                    sort_dir: this.metadataModel.get('sortDirection'),
                    sort_key: this.metadataModel.get('sortKey').split(','),
                    sort_mode: ['auto', 'auto'],
                    search: this.metadataModel.getCalculatedSearch(),
                    count: this.metadataModel.get("count"),
                    offset: this.metadataModel.get("offset"),
                    concise: true } }).then(
                    _(function() {
                        $('.data-model-manager-placeholder').append(this.dataModelManagerView.render().el);
                        this.flashMessagesView.$el.hide();
                    }).bind(this)
                );
            },

            /**
             * Displays data model dialog directly from router
             */
             showCreateDataModelDialog: function() {
                this.dataModelManagerView.showCreateDataModelDialog(); 
                classicUrl.save({ dialog: undefined }, { replaceState: true });
            },

            /**
             * Copy classicUrl attributes to the metadataModel model
             */
            updateParamsFromClassicUrl: function() {
                var cUrl = this.classicUrl;
                var attrs = _(cUrl.attributes).defaults(this.metadataModel.attributes, {appSearch: this.model.application.get("app")});
                this.metadataModel.set(attrs);
            },

            /**
             * Copy metadataModel attributes to the classicUrl model
             */
            updateClassicUrlFromParams: function() {
                _.debounce(function() {
                        this.classicUrl.save(this.metadataModel.attributes, {trigger:true});
                    }.bind(this), 0)();
            }
        });
    }
);
