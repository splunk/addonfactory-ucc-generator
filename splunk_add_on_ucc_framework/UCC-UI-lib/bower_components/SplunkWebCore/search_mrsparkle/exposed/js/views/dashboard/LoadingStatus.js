define([
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'views/dashboard/header/DashboardHeader'
    ], function(module,
                $,
                _,
                BaseDashboardView,
                HeaderView) {

        return BaseDashboardView.extend({
            moduleId: module.id,
            createHeader: function() {
                if (this.children.headerView) {
                    this.children.headerView.remove();
                }
                var label = this.model.view.entry.content.get('label') || this.model.view.entry.get('name') || _('Unnamed dashboard').t();
                this.children.headerView = new HeaderView({
                    label: label,
                    hideMenu: true,
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.options.deferreds
                });
                return this.children.headerView;
            },
            render: function() {
                this.$el.html(this.compiledTemplate({}));
                if (!this.model.page.get('hideTitle')) {
                    this.createHeader().render().$el.prependTo(this.$el);
                }
                return this;
            },
            template: '<div class="dashboard-loading"><div class="loading-message"><%- _("Loading...").t() %></div></div>'
        });
    }
);
