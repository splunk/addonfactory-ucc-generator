define([
    'module',
    'underscore',
    'views/Base',
    'models/search/Dashboard', 
    'uri/route' 
],
function (
    module,
    _,
    BaseView,
    DashboardModel, 
    route 
) {
    return BaseView.extend({
        moduleId: module.id,
        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.homeDashboard = new DashboardModel();
            this.listenTo(this.model.dashboard, 'change:id', this.render);
        }, 
        events: {
            'click .select': function(e) {
                this.trigger('showDashboardSelector'); 
                e.preventDefault();
            } 
        },
        render: function () {
            this.$el.html(this.compiledTemplate({
                _: _,
                route: route,
                application: this.model.application,
                dashboard: this.model.dashboard
            }));
            return this;
        },
        template: '\
           <% if (dashboard.isSimpleXML()) { %>\
               <h3>\
                   <span class="dashboard-title"><%- dashboard.meta.get("label") %></span><a class="btn-pill open-dashboard" target="_blank" href="<%- route.dashboardFromID(this.model.application.get("root"), this.model.application.get("locale"), dashboard.get("id")) %>" title="<%- _("Open Dashboard").t() %>"><i class="icon-external"></i></a><a href="#" class="select btn-pill" title="<%- _("Change Dashboard").t() %>"><i class="icon-gear"></i></a>\
               </h3>\
               <% if (dashboard.meta.get("description")) { %>\
                   <p><%- dashboard.meta.get("description") %></p>\
               <% } %>\
           <% } %>\
        '
    });
});
