define(
    ['module', 'views/Base', 'underscore'],
          function(module, BaseView, _) { 
 
         return BaseView.extend({
            moduleId: module.id,
            tagName: 'a',
            className: 'btn', 
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
            }, 
            attributes: { 
                "href": "#" 
            }, 
            render: function() {
                this.$el.html(_("Preview").t());
                return this; 
            },
            events: {
                'click' : function(e) {
                    this.trigger("previewClicked"); 
                    return false; 
                }
            } 
        }); 
});





