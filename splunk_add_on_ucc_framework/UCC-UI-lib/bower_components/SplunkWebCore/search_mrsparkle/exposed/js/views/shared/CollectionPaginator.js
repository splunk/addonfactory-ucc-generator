define(
    [
        'jquery',
        'underscore',
        'contrib/text!views/shared/Paginator.html',
        'splunk.paginator',
        'module',
        'views/Base'
    ],
    function(
        $,
        _,
        template,
        splunkPaginator,
        module,
        BaseView
    ) {
    /**
     * Paginate twice it's a long way to the bay!
     *
     */
        return BaseView.extend({
            className: 'pagination',
            template: template,
            moduleId: module.id,
            /**
             * @param {Object} options {
             *      collection: <SplunkDsBaseV2>
             *      model: <Backbone.Model> (Optional), model with offset and count. If not passed the collections fetchData is used.
             *      countAttr: (Optional) model attr to use for the count. Defaults to count.
             *      offsetAttr: (Optional) model attr to use for the offset. Defaults to offset.
             * }
             */
            initialize: function(options) {
                options = options || {};
                var defaults = {
                    countAttr: 'count',
                    offsetAttr: 'offset'
                };
                _.defaults(options, defaults);

                BaseView.prototype.initialize.call(this, options);
                if(!this.model) {
                    this.model = this.collection.fetchData;
                }
                this.collection.on('add remove reset', function() {
                    // on removing an item from collection, if it was the last item on the page,
                    // decrease the current offset by the number of items per page(count)
                    var offset = this.model.get(this.options.offsetAttr),
                        count = parseInt(this.model.get(this.options.countAttr),10);
                    if (offset > 0 && !this.collection.length) {
                        this.model.set(this.options.offsetAttr, offset-count);
                        return;
                    }
                    this.debouncedRender(); 
                }, this);
                this.model.on('change:' + this.options.countAttr, function(){
                    this.model.set(this.options.offsetAttr, 0);
                }, this);
            },
            events: {
                'click li:not(.disabled) a': function(e) {
                    this.model.set(this.options.offsetAttr, parseInt($(e.currentTarget).closest('a').attr('data-offset'), 10));
                    e.preventDefault();
                }
            },
            render: function() {
                var length = 0;

                if(this.collection.models[0] && this.collection.models[0].paging){
                    length = this.collection.models[0].paging.get('total');
                } else if (this.collection.paging){
                    length = this.collection.paging.get('total');
                } else {
                    length = this.collection.length;
                }

                var options = {
                        max_items_page: this.model.get(this.options.countAttr) || 10,
                        max_pages: 10,
                        item_offset: this.model.get(this.options.offsetAttr) || 0
                    },
                    paginator = new splunkPaginator.Google(length || 0, options),
                    template = this.compiledTemplate({
                        paginator: paginator,
                        pageListMode: this.options.pageListMode,
                        _: _
                    });

                this.$el.html(template);

                if (this.options.pageListMode === 'compact') {
                    this.$el.addClass('pagination-compact');
                } else {
                    this.$el.addClass('pull-right');
                }

                return this;
            }
        });
    }
);
