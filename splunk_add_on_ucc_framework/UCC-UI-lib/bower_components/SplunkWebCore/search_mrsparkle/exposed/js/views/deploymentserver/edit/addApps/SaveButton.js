define(
    ['module', 'views/Base', 'underscore'],
          function(module, BaseView, _) {

         return BaseView.extend({
            moduleId: module.id,
            tagName: 'a',
            className: 'btn btn-primary',
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
            },
            attributes: { 
                "href": "#" 
            }, 
            render: function() {
                this.$el.html(_("Save and reload").t());
                return this;
            },
            events: {
                'click' : function(e) {
                    this.trigger("saveClicked");
                    return false;
                }
            }
        });
});





