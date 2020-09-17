define([
    'underscore',
    'jquery',
    'module',
    'backbone',
    'views/Base',
    'helpers/grid/RowIterator',
    'views/shared/delegates/RowExpandCollapse',
    'views/shared/delegates/ColumnSort',
    'contrib/text!views/clustering/master/SearchheadsGrid.html',
    'contrib/text!views/clustering/master/SearchheadGridExpandedRow.html',
    'util/general_utils'
],
function(
    _,
    $,
    module,
    Backbone,
    BaseView,
    RowIterator,
    RowExpandCollapse,
    ColumnSort,
    template,
    ExpandedRowTemplate,
    general_utils
){
    return BaseView.extend({
        moduleId: module.id,
        template: template,
        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);
            this.expandedIds = [];
            this.isLocalMouseSelection = false;

            this.children.columnSort = new ColumnSort({
                el: this.el,
                model: this.collection.fetchData,
                autoUpdate: false
            });
            this.children.rowExpandCollapse = new RowExpandCollapse({
                el: this.el,
                autoUpdate: false
            });            
            this.children.rowExpandCollapse.on(RowExpandCollapse.ROW_EXPAND, this.rowExpand, this);
            this.children.rowExpandCollapse.on(RowExpandCollapse.ROW_COLLAPSE, this.rowCollapse, this);

            this.collection.on('change reset', function(){
                this.render();
            }, this);
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
            tr.addClass(RowExpandCollapse.EXPANDED_ROW_CLASS);
            td.html(RowExpandCollapse.EXPANDED_CELL_MARKUP);
            var model = this.collection.get('/services/cluster/master/searchheads/'+id);

            // show expanded row information
            var newRow = _.template(ExpandedRowTemplate)({
                model: model,
                toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS
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

            var rowIterator = new RowIterator({ });

            var html = this.compiledTemplate({
                _:_,
                collection: this.collection,
                eachRow: rowIterator.eachRow,
                sortKeyAttribute: ColumnSort.SORT_KEY_ATTR,
                toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS,
                headerCellClass: RowExpandCollapse.HEADER_CELL_CLASS,
                headerCellContent: RowExpandCollapse.HEADER_CELL_MARKUP,
                rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR,
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
            
            return this;
        }
    });
});