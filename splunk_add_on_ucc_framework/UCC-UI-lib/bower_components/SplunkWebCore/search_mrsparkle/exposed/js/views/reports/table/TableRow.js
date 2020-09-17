define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/reportcontrols/editmenu/Master',
        'views/shared/delegates/TableRowToggle',
        'uri/route',
        'util/splunkd_utils',
        'util/general_utils'
    ],
    function(
        _,
        module,
        BaseView,
        EditDropDown,
        TableRowToggleView,
        route,
        splunkd_utils,
        Util
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'expand',
            /**
             * @param {Object} options {
             *     model: {
             *          report: <models.Report>,
             *          application: <models.Application>,
             *          state: <Backbone.Model>,
             *          appLocal: <models.services.AppLocal>,
             *          user: <models.service.admin.user>
             *     },
             *     collection: {
             *          roles: <collections.services.authorization.Roles>,
             *          apps: <collections.services.AppLocals>
             *     },
             *     index: <index_of_the_row>,
             *     alternateApp: <alternate_app_to_open>
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el.addClass((this.options.index % 2) ? 'even' : 'odd');
                this.editdropdown = new EditDropDown({
                    model: {
                        application: this.model.application,
                        report: this.model.report,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection,
                    button: false,
                    showOpenActions: false
                });
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.report, 'updateCollection', function() {
                    this.model.state.trigger('change:search');
                });
                this.listenTo(this.model.report.entry.acl, 'change:sharing', this.updateSharing);
            },
            updateSharing: function () {
                var sharing = this.model.report.entry.acl.get('sharing');
                var sharingLabel = splunkd_utils.getSharingLabel(sharing);
                this.$('td.sharing').text(sharingLabel);
            },
            render: function() {
                var openInView = this.model.report.openInView(this.model.user),
                    reportName   = this.model.report.entry.get('name'),
                    appName = this.model.report.entry.acl.get('app'),
                    reportApp = _.find(this.collection.apps.models, function(app) {return app.entry.get('name') === appName;}),
                    app = reportApp && reportApp.entry.content.get("visible") ? appName : this.options.alternateApp,
                    openInApp = this.model.application.get("app");
                    if (openInApp === "system") {
                        openInApp = app;
                    }
                    var reportLink   = route.report(
                                    this.model.application.get("root"),
                                    this.model.application.get("locale"),
                                    openInApp,
                                    { data: { s: this.model.report.id}}),
                    openLink = route[openInView](
                                    this.model.application.get("root"),
                                    this.model.application.get("locale"),
                                    openInApp,
                                    { data: { s: this.model.report.id }});

                this.$el.html(this.compiledTemplate({
                    reportName: reportName,
                    openInText: openInView === 'pivot' ? _('Open in Pivot').t() : _('Open in Search').t(),
                    reportLink: reportLink,
                    link: openLink,
                    app: this.model.report.entry.acl.get('app'),
                    owner: this.model.report.entry.acl.get('owner'),
                    index: this.options.index,
                    canUseApps: this.model.user.canUseApps(),
                    isLite: this.model.serverInfo.isLite()
                }));
                this.updateSharing();
                this.editdropdown.render().appendTo(this.$('.actions-edit'));
                return this;
            },
            template: '\
                <td class="expands">\
                    <a href="#"><i class="icon-triangle-right-small"></i></a>\
                </td>\
                <td class="title">\
                    <a href="<%= reportLink %>" title="<%- reportName %>"><%- reportName %></a>\
                </td>\
                <td class="actions">\
                    <a class="openInLink" href="<%= link %>"><%- openInText %></a>\
                </td>\
                <td class="actions actions-edit"></td>\
                <td class="owner"><%- owner %></td>\
                <% if(canUseApps) { %>\
                    <td class="app"><%- app %></td>\
                <% } %>\
                <td class="sharing">Global</td>\
            '
        });
    }
);

