define(
    ['module', 'views/Base', 'underscore'],
          function(module, BaseView, _) { 
         return BaseView.extend({
            moduleId: module.id,
            deploymentServerCollection: undefined, 
            tagName: 'div',
            className: 'repositoryLocation', 
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
                 this.collection.on('reset', this.render, this);  
                 this.collection.fetch({data:{app:'system', owner:'nobody'}}); 
            }, 
            render: function() {
		var html = this.compiledTemplate({serverConfig: this.collection.first(), _:_}); 
		this.$el.html(html); 
                return this; 
            }, 
            template:' \
               <strong><%-_("Repository Location:").t()%> </strong><%- serverConfig ? serverConfig.entry.content.get("repositoryLocation") : "N/A"  %>\
            '
        }); 
});






