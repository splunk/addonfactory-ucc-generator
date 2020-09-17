define([
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'views/dashboard/header/DashboardHeader',
        'splunk.util'
    ], function(module,
                $,
                _,
                BaseDashboardView,
                HeaderView,
                SplunkUtil) {

        return BaseDashboardView.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.message = options.message;
            },
            createHeader: function() {
                if (this.children.headerView) {
                    this.children.headerView.remove();
                }
                var label = this.model.view.entry.content. get('label') || this.model.view.entry.get('name') || _('Unnamed dashboard').t();
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
                this.$el.html(this.compiledTemplate({
                    message: this.message || _("Dashboard cannot display due to XML error").t(),
                    editLink: SplunkUtil.sprintf(_('Go to "%s" to fix.').t(),
                        SplunkUtil.sprintf('<a class="action-edit-source" href="#">%s</a>', _('Edit Source').t())),
                    showEditSource: (!this.isEditMode())
                }));
                if (!this.model.page.get('hideTitle')) {
                    this.createHeader().render().$el.prependTo(this.$el);
                }
                return this;
            },
            events: {
                'click a.action-edit-source': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger('mode:editxml');
                }
            },
            template: '<div class="alert alert-error"><i class="icon-alert"></i> ' +
            '<span class="parser-message"><%- message %>.</span> ' +
            '<span class="edit-source-link"><%= editLink %></span>'
        });
    }
);
