define([
    'underscore',
    'jquery',
    'module',
    'backbone',
    'views/Base',
    'helpers/grid/RowIterator',
    'views/shared/delegates/ColumnSort',
    'contrib/text!views/clustering/master/IndexesGrid.html',
    'util/general_utils',
    'splunk.util',
    'bootstrap.tooltip',
    'views/shared/pcss/bucket-bar.pcss'
],
function(
    _,
    $,
    module,
    Backbone,
    BaseView,
    RowIterator,
    ColumnSort,
    gridTemplate,
    general_utils,
    splunk_util,
    css
){
    return BaseView.extend({
        moduleId: module.id,
        template: gridTemplate,
        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);

            this.children.columnSort = new ColumnSort({
                el: this.el,
                model: this.collection.masterIndexes.fetchData,
                autoUpdate: false
            });

            this.collection.masterIndexes.on('change reset', function(){
                this.render();
            }, this);
        },
        convertToGygabytes: function(size){
            var g = (size / (1024 * 1024 * 1024)).toFixed(2);
            if (g < 0.01){
                return _('< 0.01 GB').t();
            }
            return general_utils.convertNumToString(g) + _(' GB').t();
        },
        render: function(){
            var rowIterator = new RowIterator({});

            var html = this.compiledTemplate({
                _:_,
//                fixups: this.collection.masterFixups,
                collection: this.collection.masterIndexes,
                model: this.model,
                convertToGygabytes: this.convertToGygabytes,
                eachRow: rowIterator.eachRow,
                sortKeyAttribute: ColumnSort.SORT_KEY_ATTR,
                splunkUtil: splunk_util
            });

            var $html = $(html);
            this.children.columnSort.update($html);
            this.$el.html($html);
            this.$('.tooltip-link').tooltip({animation:false, container: 'body'}).on('hide', function(){
                // due to dynamic rerender of our tables, we need to manually clean up the tooltips
                $('.tooltip').remove();
            });

            return this;
        }
    });
});
