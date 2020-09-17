define([
    'jquery',
    'underscore',
    'module',
    'models/classicurl',
    'models/shared/EAIFilterFetchData',
    'views/Base',
    'views/clustering/EditMenu',
    'views/clustering/master/StatusSummary',
    'views/clustering/master/PeersTab',
    'views/clustering/master/IndexesTab',
    'views/clustering/master/SearchheadsTab',
    'views/clustering/master/MasterNodeInfo',
    'uri/route',
    'contrib/text!views/clustering/master/MasterNode.html'
],
function(
    $,
    _,
    module,
    classicurlModel,
    EAIFilterFetchData,
    BaseView,
    EditMenu,
    StatusSummaryView,
    PeersTabView,
    IndexesTabView,
    SearchheadsTabView,
    MasterNodeInfoView,
    route,
    MasterNodeTemplate
){
    return BaseView.extend({
        moduleId: module.id,
        template: MasterNodeTemplate,
        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);

            this.lastPeerCount = -1;

            // please contact ykou if you have any question
            // Here we use metadataModel as a mediation.
            // The metadataModel is passed down to some of the subview UI elements. These UI elements
            // manipulate selected attributes of this model. This model controls tab and rows per page.
            // This model is kept in sync with the url arguments (the classicurlModel).
            this.model.metadataModel = new EAIFilterFetchData();
            this.classicUrl = classicurlModel;

            this.children.statusSummary = new StatusSummaryView({
                model: this.model,
                collection: this.collection
            });

            this.children.editMenu = new EditMenu({
                model: this.model,
                collection: this.collection
            });

            this.children.peersTabView = new PeersTabView({
                collection: this.collection,
                model: this.model
            });

            this.children.indexesTabView = new IndexesTabView({
                collection: this.collection,
                model: this.model
            });

            this.children.searchheadsTabView = new SearchheadsTabView({
                collection: this.collection,
                model: this.model
            });

            this.children.masterNodeInfo = new MasterNodeInfoView({
                collection: this.collection,
                model: this.model
            });

            this.model.peersStatusSummary.on('change reset', function(){
                this.checkNoPeers();
                this.updatePeersCount(this.$el);
            }, this);

            this.model.indexesStatusSummary.on('change reset', function(){
                this.updateIndexesCount(this.$el);
            }, this);

            this.collection.masterSearchheadsTotal.on('change reset', function(){
                this.updateSearchheadsCount(this.$el);
            }, this);

            // Grab the query strings from the URL
            this.urlDone = this.classicUrl.fetch({silentClear: true}).done(_(function() {

                // Turn off the change handler so we can sync the the classicUrl and metadataModels without
                // getting into an infinite loop
                this.model.metadataModel.off("change", this.updateClassicUrlFromParams, this);

                // Sync classicUrl and metadataModel models
                this.updateParamsFromClassicUrl();
                this.classicUrl.save(this.model.metadataModel.attributes);

                // Turn on the change handler now that we've finished syncing.
                this.model.metadataModel.on("change", this.updateClassicUrlFromParams, this);
            }).bind(this));
        },
        checkNoPeers: function(){
            var count = this.model.peersStatusSummary.get('totalCount');
            // re-render when last peer goes down or first one appears
            if (this.lastPeerCount == -1 || (count > 0 && this.lastPeerCount == 0) || (count == 0 && this.lastPeerCount > 0)){
                this.lastPeerCount = count;
                this.render();
            }
            return count == 0;
        },
        updatePeersCount: function($html){
            var el = $html.find('.peers_count'),
                count = this.model.peersStatusSummary.get('totalCount');
            if (el) {
                el.text(count || '');
            }
        },
        updateIndexesCount: function($html){
            var el = $html.find('.indexes_count'),
                count = this.model.indexesStatusSummary.get('totalCount');
            if (el) {
                el.text(count);
            }
        },
        updateSearchheadsCount: function($html){
            var el = $html.find('.searchheads_count');
            if (el) {
                el.text(this.collection.masterSearchheadsTotal.length);
            }
        },

        /**
         * Copy metadataModel attributes to the classicUrl model
         */
        updateClassicUrlFromParams: function() {
            _.debounce(function() {
                this.classicUrl.save(this.model.metadataModel.attributes, {trigger:true});
            }.bind(this), 0)();
        },

        /**
         * Copy classicUrl attributes to the metadataModel model
         */
        updateParamsFromClassicUrl: function() {
            var cUrl = this.classicUrl;
//            var attrs = _(cUrl.attributes).defaults(this.metadataModel.attributes, {app: this.model.application.get("app")});
            var attrs = _(cUrl.attributes).defaults(this.model.metadataModel.attributes);
            this.model.metadataModel.set(attrs);
        },

        events: {
            'click #tab-peers a': function() {
                this.model.metadataModel.set({tab: 'peers'});
            },
            'click #tab-indexes a': function() {
                this.model.metadataModel.set({tab: 'indexes'});
            },
            'click #tab-searchheads a': function() {
                this.model.metadataModel.set({tab: 'searchheads'});
            }
        },

        render: function(){
            var link = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'manager.clustering.dashboard'
                ),
                peersCount = this.model.peersStatusSummary.get('totalCount'),
                html = this.compiledTemplate({
                    peers_count: peersCount,
                    indexes_count: this.collection.masterIndexes.length,
                    searchheads_count: this.collection.masterSearchheads.length,
                    clusterStatus: this.model.clusterStatus,
                    model: this.model,
                    docLink: link
                }),
                $html = $(html);
            var learnMoreLink = route.docHelp(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                'manager.clustering.configureClustering'
            );
            this.updatePeersCount($html);
            if (peersCount){
                this.updateIndexesCount($html);
                this.updateSearchheadsCount($html);
            }

            if (peersCount){
                $html.filter('.statusSummary').html(this.children.statusSummary.render().el);
            } else {
                $html.filter('.statusSummary').html(_.template(this.noPeersTemplate)({link: learnMoreLink}));
            }

            // the 'menuContent' is the 'Edit', 'More Info', 'Documentation' button group
            // on  top right of the master status page
            var menuContent = this.$('.section-header .btn-group').detach();
            if (menuContent.length){
                $html.find('.btn-group').replaceWith(menuContent);
            } else {
                $html.find('.editMenu').replaceWith(this.children.editMenu.render().el);
                $html.find('.info').replaceWith(this.children.masterNodeInfo.render().el);
            }

            // open tab requested by the url
            $.when(this.urlDone).done(function() {

                var tab = this.model.metadataModel.get('tab');

                var currentTab = $html.find('#clustering_'+tab).length ? tab : 'peers';
                if (peersCount) {
                    $html.find('#clustering_peers').append(this.children.peersTabView.el);
                    $html.find('#clustering_indexes').append(this.children.indexesTabView.el);
                }
                $html.find('#clustering_searchheads').append(this.children.searchheadsTabView.el);

                if (!peersCount){
                    $html.find('.nav-tabs a[href="#clustering_searchheads"]').tab('show');
                    $html.find('#tab-searchheads').addClass('active');
                } else {
                    $html.filter('.nav-tabs').find('a[href="#clustering_'+currentTab+'"]').tab('show');
                    $html.find('#clustering_'+currentTab).addClass('active');
                }

            }.bind(this));

            this.$el.html($html);

            return this;
        },
        noPeersTemplate: '\
            <div class="searchable-summary no-peers">\
                <div class="single-value">\
                    <h3 class="single-result"><%= _("No Peers Configured").t() %></h3>\
                    <p class=""><%= _("To learn how to configure peer nodes, refer to the documentation.").t() %> \
                    <a href="<%= link %>" class="external" target="_blank"><%= _("Learn More").t() %></a></p>\
                </div>\
            </div>'
    });
});
