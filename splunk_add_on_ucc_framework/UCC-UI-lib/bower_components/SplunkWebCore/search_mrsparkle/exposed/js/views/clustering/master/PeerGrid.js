define([
    'underscore',
    'jquery',
    'module',
    'backbone',
    'views/Base',
    'views/shared/delegates/RowExpandCollapse',
    'views/clustering/master/components/MultiColumnSort',
    'helpers/grid/RowIterator',
    'util/time',
    'contrib/text!views/clustering/master/PeerGrid.html',
    'contrib/text!views/clustering/master/PeerGridExpandedRow.html',
    'util/general_utils',
    'bootstrap.tooltip'
],
function(
    _,
    $,
    module,
    Backbone,
    BaseView,
    RowExpandCollapse,
    MultiColumnSort,
    RowIterator,
    time_utils,
    gridTemplate,
    ExpandedRowTemplate,
    general_utils
){
    return BaseView.extend({
        moduleId: module.id,
        template: gridTemplate,
        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);

            this.children.columnSort = new MultiColumnSort({
                el: this.el,
                model: this.collection.peers.fetchData,
                autoUpdate: false
            });

            this.children.rowExpandCollapse = new RowExpandCollapse({
                el: this.el,
                autoUpdate: false
            });
            this.children.rowExpandCollapse.on(RowExpandCollapse.ROW_EXPAND, this.rowExpand, this);
            this.children.rowExpandCollapse.on(RowExpandCollapse.ROW_COLLAPSE, this.rowCollapse, this);
            this.collection.peers.on('change reset', function(collection, options){
                var forceRender = !_.isEqual(
                   collection.pluck('id'),
                   _(options.previousModels || []).pluck('id')
                );
                this.collection.peers.hasSynced = true;
                // In order to force a render in response to new models in the collection, set the isLocalMouseSelection
                // flag to false (SPL-82067).
                if(forceRender) {
                    this.isLocalMouseSelection = false;
                }
                this.render();
            }, this);
            this.expandedIds = [];
            this.isLocalMouseSelection = false;
        },
        events: {
            'mouseup .table-striped': function() {
                // this is to stop message refresh only when selection is LOCAL to .message-list
                this.isLocalMouseSelection = true;
            }
        },
        rowExpand: function(id, expandedIds, event){
            this.expandedIds = expandedIds;
            var target = $(event.target);
            var tr = target.closest('tr');
            var td = target.closest('td');
            td.html(RowExpandCollapse.EXPANDED_CELL_MARKUP);
            tr.addClass(RowExpandCollapse.EXPANDED_ROW_CLASS);
            var peerModel = this.collection.peers.get('/services/cluster/master/peers/'+id);

            // show expanded peer information
            var newRow = _.template(ExpandedRowTemplate)({
                _: _,
                model: peerModel,
                time_utils: time_utils
            });

            tr.after(newRow);
        },
        rowCollapse: function(id, expandedIds, event, tr){
            this.expandedIds = expandedIds;
            var td = tr.children('.expands');
            td.html(RowExpandCollapse.COLLAPSED_CELL_MARKUP);
            tr.removeClass(RowExpandCollapse.EXPANDED_ROW_CLASS);
            tr.next().remove();
        },
        getRowById: function(rowId){
            return this.$('tr[' + RowExpandCollapse.ROW_ID_ATTR + '="' + rowId + '"]');
        },
        render: function(forceUpdate){
            if (forceUpdate !== true &&
                this.isLocalMouseSelection &&
                general_utils.getMouseSelection() && general_utils.getMouseSelection().length>0) {
                return this;
            }
            this.isLocalMouseSelection = false;

            if(!this.collection.peers.hasSynced){
                return this;
            }

            var rowIterator = new RowIterator({});
            var html = this.compiledTemplate({
                _:_,
                collection: this.collection.peers,
                time_utils: time_utils,
                eachRow: rowIterator.eachRow,
                toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS,
                headerCellClass: RowExpandCollapse.HEADER_CELL_CLASS,
                headerCellContent: RowExpandCollapse.HEADER_CELL_MARKUP,
                rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR,
                sortKeyAttribute: MultiColumnSort.SORT_KEY_ATTR,
                // display 'Site' column in the table only if 'multisite' atrribute is true
                multisite: this.model.clusterConfig.entry.content.get('multisite')
            });

            var $html = $(html);
            this.children.columnSort.update($html);
            this.$el.html($html);

            // preserve state of opened rows
            _.each(this.expandedIds, function(id){
                var row = this.getRowById(id);
               if (row){
                   $('td', row).trigger('click');
               }
            }, this);

            this.$('.tooltip-link').tooltip({animation:false, container: 'body'}).on('hide', function(){
                // due to dynamic rerender of our tables, we need to manually clean up the tooltips
                $('.tooltip').remove();
            });

            return this;
        }
    });
});
