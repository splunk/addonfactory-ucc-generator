/**
 * Created by ykou on 5/16/14.
 */
define([
    'jquery',
    'underscore',
    'module',
    'util/splunkd_utils',
    'backbone',
    'views/Base',
    'views/shared/CollectionPaginator',
    'views/shared/delegates/ColumnSort',
    'views/shared/TableHead',
    'views/clustering/master/bucketdetails/components/TableRow',
    'views/clustering/master/bucketdetails/components/ConfirmDialog',
    'mixins/ViewPane',
    'contrib/text!views/clustering/master/bucketdetails/ExcessBuckets.html'
],
    function(
        $,
        _,
        module,
        SplunkdUtils,
        Backbone,
        BaseView,
        Paginator,
        ColumnSort,
        TableHead,
        TableRow,
        ConfirmDialog,
        ViewPaneMixin,
        Template
        ){
        var REMOVE_EXCESS_BUCKETS_URL = '/services/cluster/master/control/control/prune_index?output_mode=json';

        var ExcessBucketsView = BaseView.extend({
            /**
             * this.collection:
             * - source: /cluster/master/indexes
             */
            moduleId: module.id,
            template: Template,
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.viewPaneInitialize(options);

                this._initializeRender();

                this.listenTo(this.collection, 'change reset', this.render);

                // this._confirmdialogModel is only used for trigger the 'confirmed' event.
                this._confirmDialogModel = new Backbone.Model();
                this.listenTo(this._confirmDialogModel, 'confirmed', function($target, indexName) {
                    this.children.confirmDialog.hide();
                    this.removeExcessBuckets($target, indexName);
                });
            },

            events: {
                'click .remove-all-excess-buckets-button': function(e) {
                    this._showConfirmDialog($(e.target));
                },
                'click .remove-excess-buckets-by-index': function(e) {
                    var indexName = $(e.target).data('index-name');
                    this._showConfirmDialog($(e.target), indexName);
                }
            },

            _flattenAttributes: function(element) {
                var attributes = [];
                if (!(element.entry && element.entry.content)) { return attributes; }
                attributes.push(element.entry.get('name'));
                attributes.push(element.entry.content.get('buckets_with_excess_copies'));
                attributes.push(element.entry.content.get('buckets_with_excess_searchable_copies'));
                attributes.push(element.entry.content.get('total_excess_bucket_copies'));
                attributes.push(element.entry.content.get('total_excess_searchable_copies'));

                var $div = $('<div>')
                    .append(
                        $('<a>').html(_('Remove').t())
                        .addClass('btn btn-mini remove-excess-buckets-by-index')
                        .attr('data-index-name', element.entry.get('name'))
                    ).append(
                        $('<span>').addClass('message')
                    );
                attributes.push($div);

                return attributes;
            },

            _showConfirmDialog: function($target, indexName) {
                this.children.confirmDialog = new ConfirmDialog({
                    model: this._confirmDialogModel,
                    $target: $target,
                    indexName: indexName
                });
                this.$el.append(this.children.confirmDialog.render().$el);
                this.children.confirmDialog.show();
            },

            removeExcessBuckets: function($button, indexName) {
                // if 'indexName' is provided, then only remove excess buckets of that index;
                // otherwise remove excess buckets of all indexes.
                var url = REMOVE_EXCESS_BUCKETS_URL;
                if (indexName) {
                    url += '&index=' + indexName;
                }
                $.post(SplunkdUtils.fullpath(url));
            },

            _initializeRender: function() {
                // initialize template and got all this.$... variables.
                // these things won't change when this.render() is called
                this.$el.html(this.compiledTemplate());
                this.$table = this.$el.find('.table-excess-buckets');
                this.$tbody = this.$el.find('tbody');
                this.$controlSection = this.$el.find('.section-controls');

                this.children.paginator = new Paginator({
                    collection: this.collection
                });
                // TODO; double check if the paginator is re-rendered when collection changes
                this.children.paginator.render().$el.appendTo(this.$controlSection);

                this.children.thead = new TableHead({
                    model: this.collection.fetchData,
                    columns: [
                        { label: _('Index Name').t(), sortKey: 'name'},
                        { label: _('Buckets with Excess Copies').t(), sortKey:'buckets_with_excess_copies', className: 'col-buckets_with_excess_copies'},
                        { label: _('Buckets with Excess Searchable Copies').t(), sortKey: 'buckets_with_excess_searchable_copies', className: 'col-buckets_with_excess_searchable_copies'},
                        { label: _('Total Excess Copies').t(), sortKey: 'total_excess_bucket_copies', className: 'col-total_excess_bucket_copies'},
                        { label: _('Total Excess Searchable Copies').t(), sortKey: 'total_excess_searchable_copies', className: 'col-total_excess_searchable_copies'},
                        { label: _('Action').t(), className: 'col-remove-button'}
                    ]
                });
                this.children.thead.render().$el.prependTo(this.$table);
            },

            updateTabCount: function($el) {
                var count = 0;
                this.collection.forEach(function(element) {
                    var rowData = this._flattenAttributes(element);
                    if ((rowData[1] > 0) || (rowData[2] > 0) || (rowData[3] > 0) || (rowData[4] > 0)) {
                        count += 1;
                    }
                }, this);

                // update count number in this tab text
                var $thisTab = $el ? $el.find('.excess-buckets-tab') : $('.excess-buckets-tab');
                var htmlText = $thisTab.html();
                if (htmlText) {
                    htmlText = htmlText.replace(/\(\d+\)/, '(' + count + ')');
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
        _.extend(ExcessBucketsView.prototype, ViewPaneMixin);

        return ExcessBucketsView;
    });
