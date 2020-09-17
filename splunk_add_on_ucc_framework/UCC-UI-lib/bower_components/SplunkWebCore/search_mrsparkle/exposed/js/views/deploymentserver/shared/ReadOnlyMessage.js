define(
    ['module', 'views/Base', 'underscore', 'uri/route'],
          function(module, BaseView, _, route) { 
 
         return BaseView.extend({
            moduleId: module.id,
            tagName: 'div',
            className: 'read-only-msg', 
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
                       }, 
            render: function() {
            
                var docUrl = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.deployment.compatibility'
                );
                var query = 'index=_internal sourcetype=splunkd DS_DC_Common "Attribute unsupported by UI" [search index=_internal sourcetype=splunkd DS_DC_Common "Attribute unsupported by UI" | head 1 | eval earliest = _time - 60 | fields earliest]'; 
                var searchUrl = route.page(this.model.application.get('root'), this.model.application.get('locale'), 'search', 'search', {data: {q: query}});
                this.$el.html("<i class='icon-alert'></i>" + _("The forwarder management interface does not support some ").t() + "<a href='" + searchUrl + "'>" + _("settings").t() + "</a>" + _(" in your serverclass.conf file. The interface is now read-only.").t() + " <a href='" + docUrl + "' target='_blank' class='external'>" + _("Learn More").t() + "</a>");
                return this; 
            }
        }); 
});





