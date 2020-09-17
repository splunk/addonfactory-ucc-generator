define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/alertcontrols/EditMenu',
        'uri/route',
        'util/splunkd_utils'
    ],
    function(
        _,
        module,
        BaseView,
        EditMenuView,
        route,
        splunkd_utils
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'expand',
            /**
             * @param {Object} options {
             *     model: {
             *          savedAlert: <models.services.SavedSearch>,
             *          application: <models.Application>,
             *          state: <Backbone.Model>,
             *          appLocal: <models.services.AppLocal>
             *          user: <models.services.admin.User>
             *     },
             *     collections: {
             *          roles: <collections.services.authorization.Roles>,
             *          apps: <collections.services.AppLocals>,
             *          alertActions: <collections.shared.ModAlertActions>
             *      }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el.addClass((this.options.index % 2) ? 'even' : 'odd');

                this.children.editmenu = new EditMenuView({
                    model: {
                        savedAlert: this.model.savedAlert,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        roles: this.collection.roles,
                        alertActions: this.collection.alertActions
                    },
                    button: false,
                    showOpenActions: false
                });


                this.activate();
            },
            startListening: function () {
                this.listenTo(this.model.savedAlert.entry.acl, 'change:sharing', this.updateSharing);
                this.listenTo(this.model.savedAlert, 'updateCollection', function() {
                    this.model.state.trigger('change:search');
                });
            },
            updateSharing: function () {
                var sharing = this.model.savedAlert.entry.acl.get('sharing');
                var sharingLabel = splunkd_utils.getSharingLabel(sharing);
                this.$('td.sharing').text(sharingLabel);
            },
            render: function() {
                var alertName   = this.model.savedAlert.entry.get('name'),
                    appName = this.model.savedAlert.entry.acl.get('app'),
                    alertApp = _.find(this.collection.apps.models, function(app) {return app.entry.get('name') === appName;}),
                    app = alertApp && alertApp.entry.content.get("visible") ? appName : this.options.alternateApp,
                    openInApp = this.model.application.get("app");
                    if (openInApp === "system") {
                        openInApp = app;
                    }
                    var alertLink   = route.alert(
                                    this.model.application.get("root"),
                                    this.model.application.get("locale"),
                                    openInApp,
                                    { data: { s: this.model.savedAlert.id}}),
                    openInSearch = route.search(
                                    this.model.application.get("root"),
                                    this.model.application.get("locale"),
                                    openInApp,
                                    { data: { s: this.model.savedAlert.id }});

                this.$el.html(this.compiledTemplate({
                    _: _,
                    alertName: alertName,
                    alertLink: alertLink,
                    searchLink: openInSearch,
                    app: this.model.savedAlert.entry.acl.get('app'),
                    owner: this.model.savedAlert.entry.acl.get('owner'),
                    index: this.options.index,
                    canUseApps: this.model.user.canUseApps(),
                    isLite: this.model.serverInfo.isLite()
                }));
                this.updateSharing();
                this.children.editmenu.render().appendTo(this.$('.actions'));

                return this;
            },
            template: '\
                <td class="expands">\
                    <a href="#"><i class="icon-triangle-right-small"></i></a>\
                </td>\
                <td class="title">\
                    <a href="<%= alertLink %>" title="<%- alertName %>"><%- alertName %></a>\
                </td>\
                <td class="actions">\
                    <a class="openInLink" href="<%= searchLink %>"><%- _("Open in Search").t() %></a>\
                </td>\
                <td class="owner"><%- owner %></td>\
                <% if(canUseApps) { %>\
                    <td class="app"><%- app %></td>\
                <% } %>\
                <td class="sharing"></td>\
            '
        });
    }
);

