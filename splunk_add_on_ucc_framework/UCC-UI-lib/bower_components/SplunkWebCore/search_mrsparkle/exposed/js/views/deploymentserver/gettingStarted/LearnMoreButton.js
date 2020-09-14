define(
    [
     'jquery',
     'module',
     'views/Base',
     'underscore', 
     'uri/route'
    ],
      function($, module, BaseView, _, route) {

         return BaseView.extend({
            moduleId: module.id,
            tagName: 'a',
            className: 'btn btn-primary',
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click': function() {
                    var docUrl = route.docHelp(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        'learnmore.deployment.overview'
                    );

                    window.open(docUrl);  
                }
            }, 
            render: function() {
                //this.$el.html("<i class='icon-alert'></i>" + _("The forwarder management interface does not support some settings in your serverclass.conf file. The interface is now read-only.").t() + " <a href='" + docUrl + "' target='_blank' class='external'>" + _("Learn More").t() + "</a>");
                
                this.$el.html(_("Learn more").t());
                return this;
            }
        });
});






