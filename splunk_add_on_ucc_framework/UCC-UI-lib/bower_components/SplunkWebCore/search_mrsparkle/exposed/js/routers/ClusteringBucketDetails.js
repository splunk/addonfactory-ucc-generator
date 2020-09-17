define(
    [
        'jquery',
        'underscore',
        'backbone',
        'routers/Base',
        'models/Base',
        'models/classicurl',
        'models/services/cluster/Config',
        'collections/services/cluster/master/Fixups',
        'collections/services/cluster/master/Indexes',
        'collections/services/cluster/master/Buckets',
        'views/clustering/EnableClustering',
        'views/clustering/master/bucketdetails/Master'
    ],
    function(
        $,
        _,
        Backbone,
        BaseRouter,
        BaseModel,
        classicurl,
        ClusterConfig,
        FixupCollection,
        IndexCollection,
        BucketCollection,
        EnableClusteringView,
        BucketDetailsMaster
    ) {
        var DEFAULT_POLL_DELAY = 5000;

        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
                this.setPageTitle(_('Bucket Status').t());
                this.clusterConfig = new ClusterConfig();

                var searchFactorFetchData = new BaseModel();
                var replicationFactorFetchData = new BaseModel();
                var generationFactorFetchData = new BaseModel();

                var indexCollectionForMainDropdown = new IndexCollection();
                var indexCollection = new IndexCollection();
                var bucketCollection = new BucketCollection();
                var fixupSearchFactorCollection = new FixupCollection(null, {
                    fetchData: searchFactorFetchData
                });
                var fixupReplicationFactorCollection = new FixupCollection(null, {
                    fetchData: replicationFactorFetchData
                });
                var fixupGenerationCollection = new FixupCollection(null, {
                    fetchData: generationFactorFetchData
                });

                var fetchArray = [indexCollection, bucketCollection,
                    fixupSearchFactorCollection, fixupReplicationFactorCollection, fixupGenerationCollection];

                this.classicurlDfd = $.Deferred();
                this.tabDfd = $.Deferred();
                this.clusterConfigDfd = $.Deferred();

                this.clusterConfig.fetch().done(function() {
                    this.clusterConfigDfd.resolve();
                }.bind(this));

                indexCollectionForMainDropdown.fetchData.set('count', -1);
                indexCollection.fetchData.set('count', 20);
                bucketCollection.fetchData.set({
                    'count': 20,
                    'filter': {search_state: 'PendingSearchable'}
                });
                fixupSearchFactorCollection.fetchData.set({
                    'level': 'search_factor',
                    'count': 20
                });
                fixupReplicationFactorCollection.fetchData.set({
                    'level': 'replication_factor',
                    'count': 20
                });
                fixupGenerationCollection.fetchData.set({
                    'level': 'generation',
                    'count': 20
                });

                this.bucketDetailsMaster = new BucketDetailsMaster({
                    classicurlDfd: this.classicurlDfd,
                    tabDfd: this.tabDfd,
                    model: {
                        application: this.model.application
                    },
                    // TODO: change this from collections to collection, so that we don't need to use this.options.collections
                    collection: {
                        indexCollectionForMainDropdown: indexCollectionForMainDropdown,
                        indexCollection: indexCollection,
                        bucketCollection: bucketCollection,
                        fixupSearchFactorCollection: fixupSearchFactorCollection,
                        fixupReplicationFactorCollection: fixupReplicationFactorCollection,
                        fixupGenerationCollection: fixupGenerationCollection
                    }
                });

                // REASON: make sure this event listener is registered before classicurl.fetch() is called.
                this.bucketDetailsMaster.listenTo(classicurl, 'change', this.bucketDetailsMaster.updateParamsFromClassicUrl);
//                this.fetchLooper(fetchArray);
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                // 1: page function is an event handler of 'route' event in base router.
                // 2: 'route' event is triggered when backbone history started (some url changes).
                // 3: classicurl depends on backbone history.
                // based on the above three reasons, calling classicurl.fetch() in page() guarantees that we can get content of classicurl.
                // side note: get all data in router is good practice.
                classicurl.fetch().done(function() {
                    this.classicurlDfd.resolve();
                }.bind(this));

                $.when(this.clusterConfigDfd, this.deferreds.pageViewRendered).done(function(){

                    var mode = this.clusterConfig.entry.content.get('mode');
                    if (mode == 'disabled') {
                        this.mainView = new EnableClusteringView({
                            model: {
                                clusterConfig: this.clusterConfig,
                                application: this.model.application
                            }
                        });
                        this.pageView.$('.main-section-body').append(this.mainView.render().el);
                    }
                    else if (mode == 'master') {
                        $('.preload').replaceWith(this.pageView.el);
                        $('.main-section-body').append(this.bucketDetailsMaster.render().$el);
                    }
                    else {
                        $('.main-section-body').text(_('This view is only available on Cluster Master.').t());
                    }
                    this.tabDfd.resolve();
                }.bind(this));
            },

            fetchLooper: function(toFetch){
                var self = this;
                for(var i= 0, len = toFetch.length;i<len;i++){
                    toFetch[i].safeFetch();
                }
                window.setTimeout(function(){self.fetchLooper(toFetch);}, DEFAULT_POLL_DELAY);
            }
        });
    }
);