define(
    ['module', 'views/Base', 'underscore'],
          function(module, BaseView, _) {

         return BaseView.extend({
            moduleId: module.id,
            tagName: 'a',
            className: 'btn btn-primary',
            attributes: { 
                "href": "#" 
            },
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                this.$el.html(_("Save").t());
                return this;
            },
            events: {
                'click' : function(e) {
                    this.trigger("deployClicked");
                    return false;
                }
            }
        });
});





