define(
    [
        'module', 
        'views/Base', 
        'underscore', 
        'uri/route', 
        'contrib/text!views/deploymentserver/shared/CollectionModalGrid.html'
    ], 
    function(
        module, 
        BaseView, 
        _, 
        route, 
        appsTemplate
    ) { 
              return  BaseView.extend({
                    moduleId: module.id,
                    template: appsTemplate, 
		    initialize: function() {
                        BaseView.prototype.initialize.apply(this, arguments);
                        this.collection.on('reset', function(){
                            this.render(); 
                        }, this);  
		    },
		    render: function() {
			var html = this.compiledTemplate({_:_, collection: this.collection}); 
			this.$el.html(html); 

			return this; 
		    }
		});
              
});








