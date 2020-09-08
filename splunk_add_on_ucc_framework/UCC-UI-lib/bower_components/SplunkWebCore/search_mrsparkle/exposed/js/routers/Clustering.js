define(
[
    'underscore',
    'jquery',
    'backbone',
    'routers/Base',

    'models/services/server/ServerInfo',
    'models/services/cluster/Config',
    'models/services/cluster/master/Generation',
    'models/services/cluster/master/Info',
    'models/services/cluster/slave/Info',
    'models/services/cluster/searchhead/Generation',

    'collections/services/cluster/master/Fixups',
    'collections/services/cluster/master/Indexes',
    'collections/services/cluster/master/Searchheads',
    'collections/services/cluster/master/Peers',
    'collections/services/cluster/searchhead/Generations',
    'collections/services/cluster/searchhead/SearchheadConfigs',

    'views/shared/Paywall',
    'views/clustering/EnableClustering',
    'views/clustering/master/MasterNode',
    'views/clustering/peer/PeerNode',
    'views/clustering/searchhead/SearchHeadNode',

    'splunk.util',
    'bootstrap.tab'
],
function(
    _,
    $,
    Backbone,
    BaseRouter,

    ServerInfoModel,
    ClusterConfig,
    MasterGeneration,
    MasterInfo,
    PeerInfoModel,
    GenerationModel,

    MasterFixupsCollection,
    MasterIndexesCollection,
    MasterSearchheads,
    PeersCollection,
    SearchheadGenerationsCollection,
    SearchheadConfigsCollection,

    PaywallView,
    EnableClusteringView,
    MasterNodeView,
    PeerNodeView,
    SearchHeadNodeView,

    splunk_util
){
    return BaseRouter.extend({
        //todo should extend routes from base. also need to work on better URI. editMaster should be child of searchHead
        initialize: function() {
            BaseRouter.prototype.initialize.apply(this, arguments);
            this.enableAppBar = false;
            this.setPageTitle(_('Indexer Clustering').t());
            this.DEFAULT_PAGE_COUNT = 10;
            this.DEFAULT_POLL_DELAY = 5000;

            //views
            this.clusterConfig = new ClusterConfig();
            this.deferreds.clusterConfig = this.clusterConfig.fetch();

            this.model.wizard = new Backbone.Model();

            $.when(this.deferreds.serverInfo, this.deferreds.clusterConfig).then(function() {
                var mode = this.clusterConfig.entry.content.get('mode');
                if (mode == 'disabled') {

                    this.mainView = new EnableClusteringView({
                        model: {
                            clusterConfig: this.clusterConfig,
                            application: this.model.application,
                            serverInfo: this.model.serverInfo,
                            wizard: this.model.wizard
                        }
                    });

                    this.deferreds.pageViewRendered.done(function() {
                        this.pageView.$('.main-section-body').append(this.mainView.render().el);
                    }.bind(this));

                } else if (mode == 'master') {

                    this.mainView = new MasterNodeView(this.prepareMaster());
                    this.deferreds.pageViewRendered.done(function() {
                        this.pageView.$('.main-section-body').append(this.mainView.el);
                    }.bind(this));

                } else if (mode == 'slave') {

                    this.mainView = new PeerNodeView(this.preparePeer());
                    this.deferreds.pageViewRendered.done(function() {
                        this.pageView.$('.main-section-body').append(this.mainView.render().el);
                    }.bind(this));

                } else if (mode == 'searchhead') {

                    this.mainView = new SearchHeadNodeView(this.prepareSearchHead());
                    this.deferreds.pageViewRendered.done(function() {
                        this.pageView.$('.main-section-body').append(this.mainView.render().el);
                    }.bind(this));
                }

            }.bind(this))
            .fail(function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 402) {
                    this.mainView = new PaywallView({
                        title: _('Indexer Clustering').t(),
                        model: {
                            application: this.model.application
                        }
                    });
                    this.deferreds.pageViewRendered.done(function() {
                        this.pageView.$('.main-section-body').append(this.mainView.render().el);
                    }.bind(this));
                }
            }.bind(this));
        },
        prepareSearchHead: function(){
            var generationsCollection = new SearchheadGenerationsCollection();
            // generationsCollection.fetch();

            var clusterConfigModel = this.clusterConfig; //prepareSearchHead is called inside this.clusterConfig.fetch().done, so we can assume this.clusterConfig is set and ready.

            var searchheadConfigsCollection = new SearchheadConfigsCollection();
            searchheadConfigsCollection.fetch();

            // SPL-74022 - by ykou
            // make the searchhead management page keep refreshing.
            this.fetchLooper([generationsCollection]);

            return {
                model: {
                    clusterConfig: clusterConfigModel,
                    serverInfo: this.model.serverInfo,
                    application: this.model.application,
                    wizard: this.model.wizard
                },
                collection: {
                    searchheadGenerations: generationsCollection,
                    searchheadConfigs: searchheadConfigsCollection
                }
            };
        },
        preparePeer: function(){
            var peerStatusModel = new Backbone.Model();

            var peerInfo = new PeerInfoModel();
            var peerInfoFetch = peerInfo.fetch();

            var clusterConfig = this.clusterConfig; //preparePeer is called inside this.clusterConfig.fetch().done, so we can assume this.clusterConfig is set and ready.

            //TODO should probably dig these attributs out lower level, and pass models/collections straight back
            $.when(peerInfoFetch).done(function(){
                peerStatusModel.set({
                    status: peerInfo.entry.content.get('status'),
                    generation: peerInfo.entry.content.get('base_generation_id'),
                    is_registered: peerInfo.entry.content.get('is_registered'),
                    master_uri: clusterConfig.entry.content.get('master_uri'),
                    replication_port: clusterConfig.entry.content.get('replication_port'),
                    label: this.model.serverInfo.getServerName()
                });
            }.bind(this));

            return {
                model: {
                    clusterConfig: this.clusterConfig,
                    peerStatus: peerStatusModel,
                    peerInfo: peerInfo,
                    application: this.model.application,
                    serverInfo: this.model.serverInfo,
                    wizard: this.model.wizard
                }
            };
        },
        prepareMaster: function() {
            var masterGeneration = new MasterGeneration();
            var masterInfo = new MasterInfo();
//            var masterFixups = new MasterFixupsCollection();
            var masterPeers = new PeersCollection();
            masterPeers.fetchData.set('count', this.DEFAULT_PAGE_COUNT);
            var masterIndexesCollection = new MasterIndexesCollection();
            masterIndexesCollection.fetchData.set('count', this.DEFAULT_PAGE_COUNT);
            var masterSearchheads = new MasterSearchheads();
            masterSearchheads.fetchData.set('count', this.DEFAULT_PAGE_COUNT);
            var masterSearchheadsTotal = new MasterSearchheads();
            masterSearchheadsTotal.fetchData.set('count', -1);

            var fetchArray = [masterGeneration,
                masterInfo,
                masterPeers,
                masterIndexesCollection,
//                masterFixups,
                masterSearchheads,
                masterSearchheadsTotal
            ];

            var indexesStatusSummaryModel = this.indexesStatusSummaryModel(fetchArray);
            var peersStatusSummaryModel = this.peersStatusSummaryModel(masterGeneration, fetchArray);

            this.fetchLooper(fetchArray);

            return {
                collection: {
                    peers: masterPeers,
                    masterSearchheads: masterSearchheads,
                    masterSearchheadsTotal: masterSearchheadsTotal,
//                    masterFixups: masterFixups,
                    masterIndexes: masterIndexesCollection
                },
                model: {
                    clusterConfig: this.clusterConfig,
                    masterInfo: masterInfo,
                    indexesStatusSummary: indexesStatusSummaryModel,
                    peersStatusSummary: peersStatusSummaryModel,
                    masterGeneration: masterGeneration,
                    application: this.model.application,
                    serverInfo: this.model.serverInfo,
                    wizard: this.model.wizard
                }
            };
        },
        peersStatusSummaryModel: function(masterGeneration, fetchArray){
            var model = new Backbone.Model();
            var masterPeers = new PeersCollection();
            masterPeers.fetchData.set('count', -1);
            masterPeers.fetchData.set('f', 'is_searchable');
            fetchArray.push(masterPeers);

            var go = function(){
                if(!masterPeers.hasSynced || !masterGeneration.hasSynced){
                    return;
                }

                var numSearchable = 0,
                    numUnsearchable = 0;
                masterPeers.each(function(peer, i){
                    if (splunk_util.normalizeBoolean(peer.entry.content.get('is_searchable'))){
                        numSearchable += 1;
                    } else{
                        numUnsearchable += 1;
                    }
                });

                model.set({
                    numSearchable: numSearchable,
                    numNotSearchable: numUnsearchable,
                    totalCount: masterPeers.length
                });
            };

            masterPeers.on('sync', function(){
                masterPeers.hasSynced = true;
                go();
            }, this);

            masterGeneration.on('sync', function(){
                masterGeneration.hasSynced = true;
                go();
            }, this);

            return model;
        },
        indexesStatusSummaryModel: function(fetchArray){
            var model = new Backbone.Model();
            var indexes = new MasterIndexesCollection();
            indexes.fetchData.set('count', -1);
            indexes.fetchData.set('f', 'is_searchable');
            fetchArray.push(indexes);

            indexes.on('change reset', function(){
                var numSearchable = 0,
                    numUnsearchable = 0;

                indexes.each(function(index, i){
                    if(splunk_util.normalizeBoolean(index.entry.content.get('is_searchable'))){
                        numSearchable += 1;
                    }else{
                        numUnsearchable += 1;
                    }
                });

                model.set({
                    numSearchable: numSearchable,
                    numNotSearchable: numUnsearchable,
                    totalCount: indexes.length
                });
            }, this);
            return model;
        },
        /* kinda strange */
        fetchLooper: function(toFetch){
            var self = this;
            for(var i= 0, len = toFetch.length;i<len;i++){
                toFetch[i].safeFetch();
            }
            window.setTimeout(function(){self.fetchLooper(toFetch);}, this.DEFAULT_POLL_DELAY);
        },
        page: function(locale, app, page) {

            BaseRouter.prototype.page.apply(this, arguments);
            this.deferreds.pageViewRendered.done(function() {
                $('.preload').replaceWith(this.pageView.el);
            }.bind(this));
        }
    });
});
