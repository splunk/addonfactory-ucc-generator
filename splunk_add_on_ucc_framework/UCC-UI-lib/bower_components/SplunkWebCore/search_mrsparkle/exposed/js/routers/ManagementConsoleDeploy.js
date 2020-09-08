define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/ManagementconsoleBase',
        'models/classicurl',
        'models/managementconsole/ChangesCollectionFetchData',
        'models/managementconsole/Task',
        'models/managementconsole/Deploy',
        'collections/managementconsole/Changes',
        'views/managementconsole/deploy/Master',
        'helpers/managementconsole/url'
    ],
    function(
        _,
        $,
        Backbone,
        DmcBaseRouter,
        classicurlModel,
        ChangesCollectionFetchData,
        TaskModel,
        DeployModel,
        ChangesCollection,
        DeployView,
        urlHelper
    ) {
        return DmcBaseRouter.extend({
            initialize: function() {
                DmcBaseRouter.prototype.initialize.apply(this, arguments);
                var tab = urlHelper.getUrlParam('tab'),
                    isExpanded = urlHelper.getUrlParam('isExpanded') || false;

                this.setPageTitle(_('Deploy').t());
                this.enableFooter = false;

                this.children = this.children || {};
                this.collection = this.collection || {};
                this.model = this.model || {};
                this.deferreds = this.deferreds || {};

                this.model.classicurl = classicurlModel;
                this.deferreds.classicurl = this.model.classicurl.fetch();
                if (tab) {
                    urlHelper.replaceState({ tab: tab });
                }

                this.model.state = new Backbone.Model({
                    isPendingExpanded: isExpanded,
                    isDeployedExpanded: isExpanded
                });


                // deploy model : provides the taksId for lastDeployed
                this.model.deployModel = new DeployModel();
                this.deferreds.deployModel = this.model.deployModel.fetch();

                /**
                 *  Create deploy task model to keep track of the deploy action progress
                 */
                this.model.deployTask = new TaskModel();
                this.listenTo(this.model.deployTask.entry, 'change:name',
                    _.debounce(this.model.deployTask.beginPolling.bind(this.model.deployTask)));
                // End polling when the state is completed or failed
                this.listenTo(this.model.deployTask.entry.content, 'change:state', function() {
                    var state = this.model.deployTask.entry.content.get('state');
                    if (state === 'completed' || state === 'failed') {
                        this.model.deployTask.stopPolling();
                        this.collection.pendingChanges.fetch();
                        this.collection.deployedChanges.fetch();
                        this.collection.pendingMeta.fetch();
                    }
                }.bind(this));

                this._initializeChangesCollection('pendingChanges', {
                    state: 'pending'
                });
                this._initializeChangesCollection('deployedChanges', {
                    state: 'deployed',
                    timeRange: ChangesCollection.TIME_RANGE.lastDay
                });

                // pendingMeta collection, use to keep track of the total pending changes
                this._initializeChangesCollection('pendingMeta', {
                    state: 'pending'
                });
            },

            page: function(locale, app, page) {
                DmcBaseRouter.prototype.page.apply(this, arguments);
                $.when(
                    this.deferreds.pageViewRendered, 
                    this.deferreds.pendingChanges,
                    this.deferreds.deployedChanges,
                    this.deferreds.deployModel,
                    this.deferreds.pendingMeta,
                    this.deferreds.classicurl
                ).done(function() {
                    $('.preload').replaceWith(this.pageView.el);

                    this.children.deploy = new DeployView({
                        model: {
                            deployTask: this.model.deployTask,
                            classicurl: this.model.classicurl,
                            state: this.model.state,
                            deployStatus: this.model.deployModel
                        },
                        collection: { 
                            pendingChanges: this.collection.pendingChanges,
                            deployedChanges: this.collection.deployedChanges,
                            pendingMeta: this.collection.pendingMeta
                        }
                    });
                    
                    this.pageView.$('.main-section-body').append(this.children.deploy.render().$el);
                }.bind(this));
            },

            _initializeChangesCollection: function(name, options) {
                var fetchData = new ChangesCollectionFetchData(
                    $.extend(
                        true,
                        {
                            count: 25,
                            offset: 0,
                            sortKey: 'name',
                            sortDirection: 'desc',
                            query: '{}'
                        },
                        options
                    )
                );

                this.collection[name] = new ChangesCollection(null, {
                    fetchData: fetchData
                });

                this.deferreds[name] = this.collection[name].fetch();
            }
        });
    }
);