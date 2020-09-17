define(
    [
        'jquery',
        'underscore',
        'backbone',
        'routers/ManagementconsoleBase',
        'models/services/server/ServerInfo',
        'models/managementconsole/DmcFetchData',
        'models/managementconsole/DmcUser',
        'models/managementconsole/ChangesCollectionFetchData',
        'models/managementconsole/Task',
        'models/managementconsole/Deploy',
        'collections/managementconsole/Groups',
        'collections/managementconsole/Changes',
        'collections/managementconsole/topology/Instances',
        'views/managementconsole/apps/app_listing/PageController'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseRouter,
        ServerInfoModel,
        DmcFetchData,
        DmcUserModel,
        ChangesCollectionFetchData,
        TaskModel,
        DeployModel,
        GroupsCollection,
        ChangesCollection,
        InstancesCollection,
        PageController
    ) {
        return DmcBaseRouter.extend({
            initialize: function(options) {
                options || (options = {});
                options.model || (options.model = {});
                options.model.serverInfo = options.model.serverInfo || new ServerInfoModel();
                options.model.user = options.model.user || new DmcUserModel({}, {serverInfoModel: options.model.serverInfo});

                DmcBaseRouter.prototype.initialize.call(this, options);
                this.setPageTitle(_('Apps').t());

                this.model.metadata = new DmcFetchData({
                    sortKey: 'name',
                    sortDirection: 'asc',
                    count: '20',
                    offset: 0,
                    nameFilter: '',
                    query: '{"staged": false}'
                });

                this.initializeDeployTaskModel();
                this.initializeDeployModel();
            },

            // Initialize deploy task model to keep track of the deploy action progress. No initial fetch
            initializeDeployTaskModel: function() {
                this.model.deployTask = new TaskModel();

                this.listenTo(this.model.deployTask.entry, 'change:name', function() {
                    this.model.deployTask.beginPolling();
                }.bind(this));

                // End polling when the state is completed or failed
                this.listenTo(this.model.deployTask.entry.content, 'change:state', function() {
                    var state = this.model.deployTask.entry.content.get('state');
                    if (state === 'completed' || state === 'failed') {
                        this.model.deployTask.stopPolling();
                    }
                }.bind(this));
            },

            // Initialize the deploy model - provide taskId for the last deployment
            initializeDeployModel: function() {
                this.model.deployModel = new DeployModel();
                this.deferreds.deployModel = this.model.deployModel.fetch();
                this.listenTo(this.model.deployModel, 'sync', function() {
                    this.model.deployTask.entry.set('name', this.model.deployModel.entry.content.get('taskId'));
                }.bind(this));

            },

            page: function(locale, app, page) {
                DmcBaseRouter.prototype.page.apply(this, arguments);

                $.when(
                    this.deferreds.pageViewRendered,
                    this.deferreds.user,
                    this.deferreds.deployModel
                ).done(_(function() {
                    $('.preload').replaceWith(this.pageView.el);
                    this.pageController = new PageController({
                        model: this.model
                    });

                    this.pageView.$('.main-section-body').append(this.pageController.render().el);
                }).bind(this));
            }
        });
    }
);