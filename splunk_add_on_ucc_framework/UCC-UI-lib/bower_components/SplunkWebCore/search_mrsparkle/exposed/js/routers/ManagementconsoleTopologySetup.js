/**
 * Created by lrong on 8/4/15.
 */
define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/ManagementconsoleBase',
        'models/Base',
        'models/services/server/ServerInfo',
        'models/classicurl',
        'models/managementconsole/topology/Instance',
        'models/managementconsole/topology/Filter',
        'models/managementconsole/Task',
        'models/managementconsole/Group',
        'models/managementconsole/DmcUser',
        'models/managementconsole/topology/ForwarderSetup',
        'models/managementconsole/ChangesCollectionFetchData',
        'collections/managementconsole/topology/Instances',
        'collections/managementconsole/Groups',
        'collections/managementconsole/topology/Topologies',
        'collections/managementconsole/Changes',
        'views/managementconsole/topology/instances/Master',
        'helpers/managementconsole/Filters',
        'helpers/managementconsole/url',
        'splunk.util'
    ],
    function(
        _,
        $,
        Backbone,
        DmcBaseRouter,
        BaseModel,
        ServerInfoModel,
        classicurl,
        InstanceModel,
        FilterModel,
        TaskModel,
        GroupModel,
        DmcUserModel,
        ForwarderSetupModel,
        ChangesCollectionFetchData,
        InstancesCollection,
        GroupsCollection,
        TopologiesCollection,
        ChangesCollection,
        MasterView,
        FilterHelpers,
        urlHelper,
        splunk_util
    ) {
        return DmcBaseRouter.extend({
            initialize: function(options) {
                options || (options={});
                options.model || (options.model={});
                options.model.serverInfo = options.model.serverInfo || new ServerInfoModel();
                options.model.user = options.model.user || new DmcUserModel({}, {serverInfoModel: options.model.serverInfo});

                DmcBaseRouter.prototype.initialize.call(this, options);
                this.setPageTitle(_('Forwarder Management').t());
                this.enableFooter = false;
                this.fetchUser = true;
                this.collection = this.collection || {};
                this.model = this.model || {};
                this.deferreds = this.deferreds || {};

                /*
                 *  Collections
                 */
                this.initializeInstanceCollection();
                this.initializeServerClassesCollection();
                this.initializeServerRolesCollection();
                this.initializeTopologiesCollection();
                this.initializePendingChangesCollection();

                /*
                 *  Models
                 */
                this.model.classicurl = classicurl;
                this.initializeFwdRemoveTaskModel();
                this.initializeFwdGroupModel();
                this.initializeFwdSetupModel();
                this.initializeFwdAuthTaskModel();
                this.initializeFilterModel();
                this.model.state = new Backbone.Model({
                    fwdSetupDialogOpen: splunk_util.normalizeBoolean(urlHelper.getUrlParam('fwdSetupDialogOpen'))
                });
            },

            initializeInstanceCollection: function() {
                this.collection.instances = new InstancesCollection();
                this._instancesDefaultQuery = InstancesCollection.getDefaultInstancesQuery();

                this.collection.instances.fetchData.set(
                    {
                        count: '25',
                        offset: '0',
                        sortKey: 'hostname',
                        sortDirection: 'asc',
                        query: JSON.stringify(this._instancesDefaultQuery),
                        deployStatusQuery: JSON.stringify({})
                    },
                    {
                        silent: true
                    }
                );
                this.deferreds.instances = this.collection.instances.fetch();
                this.deferreds.instances.always(function() {
                    this.collection.instances.startPolling({delay: 30000});  // Poll every 30 seconds
                }.bind(this));

                this.collection.instances.fetchData.on('change', _.debounce(function(){
                    this._updateUrlFetchData();
                }.bind(this)));
            },

            initializeServerClassesCollection: function() {
                this.collection.serverClasses = new GroupsCollection();
                this.collection.serverClasses.fetchData.set(
                    {
                        type: 'custom',
                        names_only: true
                    },
                    {
                        silent: true
                    }
                );
                this.deferreds.serverClasses = this.collection.serverClasses.fetch();
            },

            // Initializing a groups collection for server roles, no initial fetching. Collection is only used and fetched
            // for Holistic Management mode
            initializeServerRolesCollection: function() {
                this.collection.builtinGroups = new GroupsCollection();
                this.collection.builtinGroups.fetchData.set(
                    {
                        type: 'builtin',
                        query: JSON.stringify({ name: { '$ne': '_all' } })
                    },
                    {
                        silent: true
                    }
                );
            },

            // Fetch topology collection for forwarder authentication settings
            initializeTopologiesCollection: function() {
                this.collection.topologies = new TopologiesCollection();
                this.collection.topologies.fetchData.set(
                    {
                        count: '25',
                        offset: '0',
                        sortDirection: 'asc'
                    },
                    {
                        silent: true
                    }
                );
                this.deferreds.topologies = this.collection.topologies.fetch();
            },

            // Initialize a Pending Changes collection, no initial fetching
            initializePendingChangesCollection: function() {
                var fetchData = new ChangesCollectionFetchData({
                    count: 25,
                    offset: 0,
                    sortKey: 'name',
                    sortDirection: 'desc',
                    query: '{}',
                    state: 'pending'
                });

                this.collection.pendingChanges = new ChangesCollection(null, {
                    fetchData: fetchData
                });
            },

            // Task model for Forwarder Remove action
            initializeFwdRemoveTaskModel: function() {
                this.model.fwdRemoveTask = new TaskModel();
                this.listenTo(this.model.fwdRemoveTask.entry, 'change:name',
                    _.debounce(this.model.fwdRemoveTask.beginPolling.bind(this.model.fwdRemoveTask)));
                this.listenTo(this.model.fwdRemoveTask.entry.content, 'change:state', function() {
                    var state = this.model.fwdRemoveTask.entry.content.get('state');
                    if (state === 'completed' || state === 'failed') {
                        this.model.fwdRemoveTask.stopPolling();
                        this.collection.instances.fetch();
                    }
                }.bind(this));
            },

            // Forwarder Group: For Forwarder Management Only
            initializeFwdGroupModel: function() {
                this.model.forwarderGroup = new GroupModel();
                this.model.forwarderGroup.entry.set('name', '_forwarders');
                this.deferreds.forwarderGroup = this.model.forwarderGroup.fetch();
            },

            // Forwarder Setup Helper
            initializeFwdSetupModel: function() {
                this.model.forwarderSetup = new ForwarderSetupModel();
            },

            // Task model for Forwarder authentication update action
            initializeFwdAuthTaskModel: function() {
                this.model.fwdAuthTask = new TaskModel();
                this.listenTo(this.model.fwdAuthTask.entry, 'change:name',
                    _.debounce(this.model.fwdAuthTask.beginPolling.bind(this.model.fwdAuthTask)));
                this.listenTo(this.model.fwdAuthTask.entry.content, 'change:state', function() {
                    var state = this.model.fwdAuthTask.entry.content.get('state');
                    if (state === 'completed' || state === 'failed') {
                        this.model.fwdAuthTask.stopPolling();
                        this.model.forwarderSetup.fetch();
                    }
                }.bind(this));
            },

            // Filter Model is used to power the filter components in the filterBox section
            initializeFilterModel: function() {
                this.model.filter = new FilterModel();
                this.model.filter.on('change', _.debounce(function(){
                    var query = FilterHelpers.getFilterQuery(this.model.filter, this.model.classicurl),
                        deployStatusQuery = FilterHelpers.getDeployStatusFilter(this.model.filter, this.model.classicurl),
                        mergerQuery = $.extend(true, {}, this._instancesDefaultQuery, query);
                    this.collection.instances.fetchData.set({
                        query: JSON.stringify(mergerQuery),
                        deployStatusQuery: JSON.stringify(deployStatusQuery),
                        offset: 0
                    });
                }.bind(this)));
            },

            /*
             * This method is called whenever a attribute in this.collection.instance.fetchData is changed.
             * It will add these fetchData attributes and their values to the url
             */
            _updateUrlFetchData: function() {
                this.model.classicurl.save(this.collection.instances.fetchData.pick('count', 'offset', 'sortKey', 'sortDirection'));
            },

            /*
             * Process the url attributes, set up the filter
             */
            _processUrlParams: function() {
                //This array consists of objects with details on url parameters that needs to be added
                //to the filter or instances.fetchData. Each object consists of a 'name' which is the filter property name and
                //an optional condition which needs to be met for the URL parameter to be added to the filter.
                var urlParams = [
                        {
                            name: 'count'
                        },
                        {
                            name: 'offset'
                        },
                        {
                            name: 'sortKey'
                        },
                        {
                            name: 'sortDirection'
                        }
                    ].concat(_.map(FilterModel.getAllAttrs().concat(FilterModel.getDeployStatusAttrs()), function(attr) { return { name: attr }; })),

                    fetchDataAttrs = this.collection.instances.fetchData.keys(),
                    completeQuery = {'$and': []},
                    deployStatusQuery = {};

                _.each(urlParams, function(param) {
                    var attrName = param['name'],
                        attrValue = this.model.classicurl.get(attrName),
                        attrArrValue = [];

                    if (attrValue) {
                        if (_.contains(fetchDataAttrs, attrName)) {
                            this.collection.instances.fetchData.set(attrName, attrValue);
                        }
                        if (_.contains(FilterModel.getAllAttrs(), attrName)) {
                            attrArrValue = attrValue.split(',');
                            attrValue = _.contains(FilterModel.getArrayValAttrs(), attrName) ? attrArrValue : attrValue;
                            this.model.filter.set(attrName, attrValue, {
                                silent: true
                            });
                            completeQuery['$and'].push({'$or': FilterHelpers.processSingleFilterQuery(attrName, attrArrValue)});
                        }
                        if (_.contains(FilterModel.getDeployStatusAttrs(), attrName)) {
                            this.model.filter.set(attrName, attrValue, {
                                silent: true
                            });
                            deployStatusQuery = FilterHelpers.getDeployStatusFilter(this.model.filter);
                        }
                    }
                }, this);

                // Processing the filter criteria to fetchData.query
                if (completeQuery['$and'].length === 0) {
                    completeQuery = {};
                }

                var mergerQuery = $.extend(true, {}, this._instancesDefaultQuery, completeQuery);
                this.collection.instances.fetchData.set({
                    query: JSON.stringify(mergerQuery),
                    deployStatusQuery: JSON.stringify(deployStatusQuery)
                });
            },

            page: function(locale, app, page) {
                DmcBaseRouter.prototype.page.apply(this, arguments);

                //Fetch the classicurl model to get the URL params ,
                this.deferreds.classicurl = this.model.classicurl.fetch();

                // Processing the URL parameters
                this._processUrlParams();

                $.when.apply($, this._generateDeferredList()).done(_(function() {
                    $('.preload').replaceWith(this.pageView.el);

                    // Forwarder Managment Mode - only show forwarder instances
                    this.model.filter.setTopology(this.model.user.isForwarderOnly());

                    // Saving fetchData to url parameters
                    this._updateUrlFetchData();

                    // Removing fwdSetupDialogOpen url param attribute
                    urlHelper.removeUrlParam('fwdSetupDialogOpen');

                    if (this.masterView) {
                        this.masterView.detach();
                    }

                    this.masterView = new MasterView({
                        deferreds: this.deferreds,
                        model: {
                            classicurl: this.model.classicurl,
                            user: this.model.user,
                            filter: this.model.filter,
                            forwarderGroup: this.model.forwarderGroup,
                            group: this.model.group,
                            forwarderSetup: this.model.forwarderSetup,
                            fwdRemoveTask: this.model.fwdRemoveTask,
                            fwdAuthTask: this.model.fwdAuthTask,
                            state: this.model.state
                        },
                        collection: {
                            instances: this.collection.instances,
                            serverClasses: this.collection.serverClasses,
                            builtinGroups: this.collection.builtinGroups,
                            topologies: this.collection.topologies,
                            pendingChanges: this.collection.pendingChanges
                        }
                    });

                    this.pageView.$('.main-section-body').append(this.masterView.render().el);
                }).bind(this));
            },

            _generateDeferredList: function() {
                this.deferreds.dfdList = $.Deferred();
                var dfdList = [
                    this.deferreds.pageViewRendered,
                    this.deferreds.classicurl,
                    this.deferreds.instances,
                    this.deferreds.topologies,
                    this.deferreds.user,
                    this.deferreds.forwarderGroup,
                    this.deferreds.dfdList
                ];

                this.deferreds.user.done(function() {
                    if (this.model.user.isFullAccess()) {
                        dfdList.push(this.collection.builtinGroups.fetch());
                    }

                    if (this.model.user.canShowForwarderSetup() || this.model.user.canEditForwarderSetup()) {
                        dfdList.push(this.model.forwarderSetup.fetch());
                    }
                    this.deferreds.dfdList.resolve();
                }.bind(this));

                return dfdList;
            }
        });
    }
);