define(
    ['module', 'views/Base', 'underscore'],
          function(module, BaseView, _) { 
 
         return BaseView.extend({
            moduleId: module.id,
            tagName: 'div',
            className: 'warning-msg alert-warning', 
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
                       }, 
            render: function() {
                this.$el.html("<i class='icon-alert'></i>" + _("One or more apps are still being downloaded.  Please refresh later to see up-to-date status of those apps.").t()); 
                return this; 
            }
        }); 
});





