define(
	['module', 
         'views/Base', 
         'backbone'
        ], 
	function(
            module, 
            BaseView, 
            Backbone
         ) {
        return BaseView.extend({
            tagName: 'span',
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                this.collection.on('reset', this.render, this);  
            },
            render: function() {
                var length = 0; 
                if (this.collection.length > 0) {
                    length = this.collection.first().paging.get('total'); 
                }
                this.$el.html(length); 
                return this; 
            }
        });
});
