define(['module', 'underscore', 'views/Base', 'views/dashboards/AddDashboard'], function (module, _, BaseView, AddDashboardDialog) {

    /**
     * @param {Object} options {
     *     model: {
     *         application: <models.Application>
     *     },
     *     collection: <collections.Dashboards>,
     *     hideCreateLink: <boolean>
     * }
     */
    return BaseView.extend({
        moduleId: module.id,
        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
        },
        render: function () {
            this.$el.html(this.compiledTemplate({
                _: _,
                hideCreateLink: this.options.hideCreateLink,
                isLite: this.model.serverInfo.isLite()
            }));
            return this;
        },
        events: {
            'click .add-dashboard': function (e) {
                new AddDashboardDialog({
                    model: {
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection,
                    onHiddenRemove: true
                }).render().show();
                e.preventDefault();
            }
        },
        template: '\
            <% if (!hideCreateLink) { %>\
                <div class="add-dashboard-controls pull-right">\
                    <button class="btn btn-primary add-dashboard"><%- _("Create New Dashboard").t() %></button>\
                </div>\
            <% } %>\
            <h2 class="section-title"><i class="icon-dashboard"></i> <%- _("Dashboards").t() %></h2>\
            <p class="section-description">\
            <%- _("Dashboards include searches, visualizations, and input controls that capture and present available data.").t() %>\
            </p>\
        '
    });
});
