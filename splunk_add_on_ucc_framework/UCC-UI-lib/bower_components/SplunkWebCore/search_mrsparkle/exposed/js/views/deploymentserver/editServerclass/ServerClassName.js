define(
    ['module', 'views/Base'],
          function(module, BaseView) {

         return BaseView.extend({
            moduleId: module.id,
            tagName: 'span',
            className: 'serverClassName',
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
                 this.model.on('sync change', this.render, this);
            },
            render: function() {
		var html = this.compiledTemplate({serverclass: this.model});
		this.$el.html(html);
                return this;
            },
            template:' <%- serverclass ? serverclass.getDisplayName() : "N/A"  %>'
        });
});
