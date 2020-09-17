define(
    [
         'jquery',
         'underscore',
         'module',
         'views/Base',
         'uri/route'
     ],
     function($, _, module, BaseView, route) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    docLink: route.docHelp(this.model.application.get("root"), this.model.application.get("locale"), 'manager.shclustering.settings.menu')
                }));

                return this;
            },
            template: '<%- _("Because search head clustering is enabled, some sections of the settings menu are hidden. Do you wish to re-enable the full settings menu?").t() %>\
                <br><br>\
                <%- _("Note that system settings modified via re-enabled menus will not be replicated across your search head cluster.").t() %>\
                <br><br>\
                <a href="<%=docLink%>" class="external" target="_blank"><%- _("Learn more about configuration changes under search head clustering").t() %></a>\
            '
        });
    }
);
