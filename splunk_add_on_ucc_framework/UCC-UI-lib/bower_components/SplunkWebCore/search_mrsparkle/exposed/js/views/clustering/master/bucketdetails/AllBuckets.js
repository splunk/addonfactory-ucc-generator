/**
 * Created by ykou on 5/19/14.
 */
define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/CollectionPaginator',
    'views/shared/delegates/ColumnSort',
    'views/shared/TableHead',
    'views/clustering/master/bucketdetails/components/TableRow',
    'mixins/ViewPane',
    'contrib/text!views/clustering/master/bucketdetails/AllBuckets.html'
],
    function(
        $,
        _,
        module,
        BaseView,
        Paginator,
        ColumnSort,
        TableHead,
        TableRow,
        ViewPaneMixin,
        Template
        ){
        var AllBucketsView = BaseView.extend({
            moduleId: module.id,
            template: Template,
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.viewPaneInitialize(options);

                this._initializeRender();

                this.listenTo(this.collection, 'change reset', this.render);
            },

            _initializeRender: function() {
                // initialize template and got all this.$... variables.
                // these things won't change when this.render() is called
                this.$el.html(this.compiledTemplate());
                this.$table = this.$el.find('table');
                this.$tbody = this.$el.find('tbody');
                this.$controlSection = this.$el.find('.section-controls');

                this.children.paginator = new Paginator({
                    collection: this.collection
                });
                // TODO; double check if the paginator is re-rendered when collection changes
                this.children.paginator.render().$el.appendTo(this.$controlSection);

                /* TableHead will take care of sorting, so that we don't need ColumnSort
                this.children.columnSort = new ColumnSort({
                    $el: this.$table,
                    model: this.collection.fetchData,
                    autoUpdate: true
                }); // since autoUpdate is true, we don't need to care how it works
                */

                this.children.thead = new TableHead({
                    model: this.collection.fetchData,
                    columns: [
                        { label: _('Bucket Name').t(), sortKey: 'name'},
                        { label: _('Index Name').t(), sortKey:'index'},
                        { label: _('Peers').t()} //,
//                        { label: _('rep_count_by_site').t()},
//                        { label: _('search_count_by_site').t()}
                    ]
                });
                this.children.thead.render().$el.prependTo(this.$table);
            },

            _flattenAttributes: function(element) {
                var attributes = [];
                if (!(element.entry && element.entry.content)) { return attributes; }
                var name = element.entry.get('name');
                var index = element.entry.content.get('index');
                var peersCollection = _(element.entry.content.get('peers')).pairs();
                var peerNames = $('<div>');
                peersCollection.forEach(function(peer) {
                    var $peer = $('<div>').html(peer[1]['server_name']);
                    peerNames.append($peer);
                }, this);
//                var rep_count_by_site = element.entry.content.get('rep_count_by_site')['default'];
//                var search_count_by_site = element.entry.content.get('search_count_by_site')['default'];

                attributes.push(name);
                attributes.push(index);
                attributes.push(peerNames);
//                attributes.push(rep_count_by_site);
//                attributes.push(search_count_by_site);

                return attributes;
            },

            updateTabCount: function($el) {
                // update count number in this tab text
                var $thisTab = $el ? $el.find('.all-buckets-tab') : $('.all-buckets-tab');
                var htmlText = $thisTab.html();
                var bucketsCount = this.collection.length > 0 ? this.collection.models[0].paging.get('total') : 0;
                if (htmlText) {
                    htmlText = htmlText.replace(/\(\d+\)/, '(' + bucketsCount + ')');
                    $thisTab.html(htmlText);
                }
            },

            render: function() {
                // only tbody needs render
                this.$tbody.empty();
                this.collection.forEach(function(element) {
                    var rowData = this._flattenAttributes(element);
                    var row = new TableRow({rowData: rowData});
                    row.render().$el.appendTo(this.$tbody);
                }, this);

                this.updateTabCount();

                return this;
            }
        });
        _.extend(AllBucketsView.prototype, ViewPaneMixin);

        return AllBucketsView;
    });
