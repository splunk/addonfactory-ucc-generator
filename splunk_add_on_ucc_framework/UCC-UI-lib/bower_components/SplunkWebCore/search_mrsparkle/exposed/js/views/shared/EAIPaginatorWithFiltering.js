define(['jquery', 'underscore', 'contrib/text!views/shared/Paginator.html', 'splunk.paginator', 'module', 'views/Base', 'util/console'], function($, _, template, splunkPaginator, module, BaseView, console) {
    /**
     * Paginate twice it's a long way to the bay!
     */
    return BaseView.extend({
        tagName: 'div',
        className: 'pagination pull-right',
        template: template,
        moduleId: module.id,
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            this.model.on('change:offset change:count change:length', this.debouncedRender, this);
            this.model.on('change:data change:count', this.performFiltering, this);  
            this.model.on('itemDeleted', this.performFetch, this);  


            if (this.collection.length > 0) {
                    this.model.set('length', this.collection.first().paging.get('total'));
            } else {    
                    this.model.set('length', 0);  
            }  

            this.collection.on('reset', function() {
                // Find the *real* length of the collection by looking at the first model, and extracting the paging attributes
                // Note: This is hacky.  Eventually we should put the paging attributes inside the collection
                if (this.collection.length > 0) {
                    this.model.set('length', this.collection.first().paging.get('total')); 
                } else {
                    this.model.set('length', 0);  
                }
            }, this); 

            //this.performFetch(); 
        },
        events: {
            'click li:not(.disabled) a': function(e) {
                this.model.set('offset', $(e.currentTarget).attr('data-offset'));
                this.performFetch();  
                e.preventDefault();
            }
        },
        performFiltering: function() {
            this.model.set('offset', 0); 
            this.performFetch(); 
        }, 
        performFetch: function() {
            var data = this.model.get('data') || {}; 
            data.count = this.model.get('count') || 10; 
            data.offset = this.model.get('offset') || 0; 
            this.collection.fetch({data: data, error: this.model.get('error') || null });  
        },
        render: function() {
            var length; 
            length = this.model.get('length') || 0; 
            var options = {
                    max_items_page: this.model.get('count') || 10,
                    max_pages: 10,
                    item_offset: this.model.get('offset') || 0
                },
                paginator = new splunkPaginator.Google(length || 0, options),
                template = this.compiledTemplate({
                    paginator: paginator,
                    _: _
                });
            this.$el.html(template);
            return this;
        }
    });
});

