define(
    ['module', 'views/Base'],
          function(module, BaseView) { 
 
         return BaseView.extend({
            moduleId: module.id,
            tagName: 'span',
            className: 'appName', 
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
                 this.model.on('change', this.render, this); 
            }, 
            render: function() {
		var html = this.compiledTemplate({app: this.model}); 
		this.$el.html(html); 
                return this; 
            }, 
            template:' \
               <%- app ? app.entry.get("name") : "N/A"  %>\
            '
        }); 
});






