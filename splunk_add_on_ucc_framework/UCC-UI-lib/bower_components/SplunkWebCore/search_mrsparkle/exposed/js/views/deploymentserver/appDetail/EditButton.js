define(
    ['module', 'uri/route', 'views/Base', 'underscore'],
          function(module, route, BaseView, _) { 
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
                this.$el.html(_("Edit").t());
                return this; 
            },
            events: {
                'click' : function(e) {
                    if (this.options.isReadOnly) {
                        //Read-only mode: disable click logic
                        return; 
                    }
                    window.location.href = route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'),  'deploymentserver_edit_app', {data: {id: this.model.id}});
                    return false; 
                }
            } 
        }); 
});





