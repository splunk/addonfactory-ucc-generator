define(
    [
        'jquery',
        'underscore',
        'backbone',
        'routers/ManagementconsoleBase',
        'models/managementconsole/DmcFetchData',
        'models/managementconsole/ChangesCollectionFetchData',
        'collections/managementconsole/Changes',
        'collections/managementconsole/topology/Instances',
        'views/managementconsole/server_classes/PageController',
        'helpers/managementconsole/url',
        'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseRouter,
        DmcFetchData,
        ChangesCollectionFetchData,
        ChangesCollection,
        InstancesCollection,
        PageController,
        urlHelper,
        splunk_util
    ) {
        return DmcBaseRouter.extend({
            initialize: function() {
                DmcBaseRouter.prototype.initialize.apply(this, arguments);

                var createDialogOpen = splunk_util.normalizeBoolean(urlHelper.getUrlParam('createDialogOpen'));

                this.setPageTitle(_('Server Classes').t());

                this.model.metadata = new DmcFetchData({
                    sortKey: 'name',
                    sortDirection: 'asc',
                    count: '20',
                    offset: 0,
                    type: 'custom',
                    nameFilter: ''
                });

                this.initializePendingChangesCollection();

                this.model.state = new Backbone.Model({
                    createDialogOpen: createDialogOpen
                });

                this.collection.deployStatusInstances = new InstancesCollection();
                this.collection.deployStatusInstances.fetchData.set({
                    count: 10,
                    offset: 0
                }, {silent: true});
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

            page: function(locale, app, page) {
                DmcBaseRouter.prototype.page.apply(this, arguments);

                if (this.model.state.get('createDialogOpen')) {
                    urlHelper.removeUrlParam('createDialogOpen');
                }

                $.when(this.deferreds.pageViewRendered).done(_(function() {
                    $('.preload').replaceWith(this.pageView.el);
                    this.pageController = new PageController({
                        model: this.model,
                        collection: this.collection
                    });

                    this.pageView.$('.main-section-body').append(this.pageController.render().el);
                }).bind(this));
            }
        });
    }
);