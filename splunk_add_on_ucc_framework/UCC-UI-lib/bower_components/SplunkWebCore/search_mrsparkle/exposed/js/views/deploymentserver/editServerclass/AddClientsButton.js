define(
    [
     'underscore',
     'jquery',
     'module',
     'views/Base',
     'uri/route'
    ],
          function(_, $, module, BaseView, route) {

         return BaseView.extend({
            moduleId: module.id,
            tagName: 'button',
            className: 'btn btn-primary',
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                this.$el.html(_("Add Clients").t());
                this.$el.prepend('<i class="icon-data icon-large"></i>');
                return this;
            },
            events: {
                'click': function(e) {
                     if (this.options.isReadOnly) {
                        //Read-only mode: disable click logic
                        return; 
                     }
                     window.location.href = route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'), 'deploymentserver_add_clients', {data: {id: this.model.id}});
                     return false;
                }
            }
        });
});






