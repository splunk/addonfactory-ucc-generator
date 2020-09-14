define(
    [
        'module',
        'jquery',
        'underscore',
        'backbone',
        'views/Base',
        'views/shared/documentcontrols/details/Permissions',
        'views/dashboard/layout/PanelRef',
        'controllers/dashboard/helpers/ModelHelper'
    ],
    function(module,
             $,
             _,
             Backbone,
             BaseView,
             PermissionView,
             PanelRef,
             ModelHelper) {

        var PrebuiltPanelView = BaseView.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.deferreds = options.deferreds;
                this.children.refPanel = new PanelRef({
                    model: ModelHelper.getViewOnlyModel(this.model),
                    deferreds: this.deferreds
                });
                this.children.permissionsView = new PermissionView({
                    model: {
                        report: this.model.panel,
                        user: this.model.user
                    }
                });
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    model: this.model,
                    canUseApps: this.model.user.canUseApps()
                }));
                this.children.permissionsView.render().$el.appendTo(this.$('dd.permissions'));
                this.children.refPanel.render().$el.appendTo(this.$el);
                return this;
            },
            template: '\
            <dl class="list-dotted">\
                <% if(model.panel.entry.content.get("panel.description")) { %>\
                    <dt class="description"><%- _("Description").t() %></dt>\
                    <dd class="description"><%- model.panel.entry.content.get("panel.description") %></dd>\
                <% } %>\
                <% if(canUseApps) { %>\
                    <dt class="app"><%- _("App").t() %></dt>\
                    <dd class="app"><%- model.panel.entry.acl.get("app") %></dd>\
                <% } %>\
                <dt class="permissions"><%- _("Permissions").t() %></dt>\
                    <dd class="permissions"></dd>\
            </dl>\
            '
        });

        return PrebuiltPanelView;
    });