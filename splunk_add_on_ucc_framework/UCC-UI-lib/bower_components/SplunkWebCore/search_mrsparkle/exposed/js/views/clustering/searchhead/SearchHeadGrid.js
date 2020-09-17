define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/delegates/RowExpandCollapse',
    'views/shared/delegates/ColumnSort',
    'helpers/grid/RowIterator',
    'contrib/text!views/clustering/searchhead/SearchHeadGrid.html',
    'contrib/text!views/clustering/searchhead/SearchHeadGridExpandedRow.html',
    'util/general_utils'
],
function(
    $,
    _,
    module,
    Base,
    RowExpandCollapse,
    ColumnSort,
    RowIterator,
    SearchHeadGridTemplate,
    ExpandedRowTemplate,
    general_utils
){
    return Base.extend({

        moduleId: module.id,
        template: SearchHeadGridTemplate,
        initialize: function(options) {
            Base.prototype.initialize.call(this, options);
            this.expandedIds = [];

            this.collection.searchheadConfigs.on('sync', function() {
                this.debouncedRender();
            }, this);

            this.collection.searchheadGenerations.on('sync', function() {
                this.debouncedRender();
            }, this);

            this.children.rowExpandCollapse = new RowExpandCollapse({
                el: this.el,
                autoUpdate: false
            });

            this.children.columnSort = new ColumnSort({
                el: this.el,
                model: this.collection.searchheadConfigs.fetchData,
                autoUpdate: true
            });

            this.children.rowExpandCollapse.on(RowExpandCollapse.ROW_EXPAND, this.rowExpand, this);
            this.children.rowExpandCollapse.on(RowExpandCollapse.ROW_COLLAPSE, this.rowCollapse, this);
            this.isLocalMouseSelection = false;
        },
        events: {
            'mouseup .table-striped': function() {
                // this is to stop message refresh only when selection is LOCAL to .message-list
                this.isLocalMouseSelection = true;
            }
        },
        rowExpand: function(id, expandedIds, event) {
            this.expandedIds = expandedIds;

            var target = $(event.target);
            var tr = target.closest('tr');
            var td = target.closest('td');
            tr.addClass(RowExpandCollapse.EXPANDED_ROW_CLASS);
            td.html(RowExpandCollapse.EXPANDED_CELL_MARKUP);

            var generationModel = this.collection.searchheadGenerations.get('/services/cluster/searchhead/generation/'+id);
            var numPeers = 0;
            if(generationModel.entry && generationModel.entry.content){
                var genPeers = generationModel.entry.content.get('generation_peers');
                for(var i in genPeers){
                    numPeers++;
                }
            }

            var newRow = _.template(ExpandedRowTemplate)({
                generationModel: generationModel,
                numPeers: numPeers
            });
            tr.after(newRow);
        },
        rowCollapse: function(id, expandedIds, event, tr) {
            this.expandedIds = expandedIds;
            var td = tr.children('.expands');
            td.html(RowExpandCollapse.COLLAPSED_CELL_MARKUP);
            tr.removeClass(RowExpandCollapse.EXPANDED_ROW_CLASS);
            tr.next().remove();
        },
        getRowById: function(rowId){
            return this.$('tr[' + RowExpandCollapse.ROW_ID_ATTR + '="' + rowId + '"]');
        },
        render: function(forceUpdate) {
            // Prevent render while user has selected some text
            if (forceUpdate !== true &&
                this.isLocalMouseSelection &&
                general_utils.getMouseSelection() && general_utils.getMouseSelection().length>0) {
                return this;
            }
            this.isLocalMouseSelection = false;

            var rowIterator = new RowIterator({ });
            var html = this.compiledTemplate({
                collection: this.collection,
                eachRow: rowIterator.eachRow,
                toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS,
                headerCellClass: RowExpandCollapse.HEADER_CELL_CLASS,
                rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR,
                sortKeyAttribute: ColumnSort.SORT_KEY_ATTR
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

            return this;
        }

    });

});
