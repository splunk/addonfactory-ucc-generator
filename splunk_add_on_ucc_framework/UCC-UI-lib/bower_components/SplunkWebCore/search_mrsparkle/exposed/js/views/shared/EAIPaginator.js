define(['jquery', 'module', 'views/shared/Paginator'], function($, module, PaginatorView) {
    /**
     * Paginate twice it's a long way to the bay!
     */
    return PaginatorView.extend({
        moduleId: module.id,
        /**
         * @param {Object} options {
         *      model: <models.Base>,
         *      collection: <collections.SplunkDsBaseV2>
         * }
         */ 
        initialize: function(options) {
            PaginatorView.prototype.initialize.call(this, options);
            this.collection.on('reset', function() {
                // Find the *real* length of the collection by looking at the first model, and extracting the paging attributes
                if (this.collection.length > 0) {
                    this.model.set('length', this.collection.first().paging.get('total')); 
                } else {
                    this.model.set('length', 0);  
                }
            }, this);
        },
        events: {
            'click li:not(.disabled) a': function(e) {
                this.model.set('offset', parseInt($(e.target).attr('data-offset'), 10));
                this.performFetch();  
                e.preventDefault();
            }
        },
        performFetch: function() {
            this.collection.fetch({
                data: {
                    count: this.model.get('count') || 10, 
                    offset: this.model.get('offset') || 0
                }
            });  
        }
    });
});
