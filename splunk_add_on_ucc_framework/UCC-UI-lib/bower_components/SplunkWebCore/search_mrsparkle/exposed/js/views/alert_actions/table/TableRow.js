define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/reportcontrols/editmenu/Master',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'uri/route',
        'util/splunkd_utils',
        'splunk.util',
        'collections/shared/ModAlertActions'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        EditDropDown,
        PermissionsDialog,
        route,
        splunkd_utils,
        splunk_util,
        ModAlertActionsCollection
    ) {
        var LOG_SEARCH = 'index=_internal sourcetype=splunkd component=sendmodalert action=%s';
        var USAGE_SEARCH = 'index=_internal sourcetype=splunkd component=sendmodalert action=%s "Invoking modular alert action" | timechart count';
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'expand',
            /**
             * @param {Object} options {
             *     model: {
             *          alertAction: <models.alertAction>,
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
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el.addClass((this.options.index % 2) ? 'even' : 'odd');
                this.editdropdown = new EditDropDown({
                    model: {
                        application: this.model.application,
                        alertAction: this.model.alertAction,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection.roles,
                    button: false,
                    showOpenActions: false
                });
                this.activate();
            },
            events: {
                'click a.enable': function(e) {
                    e.preventDefault();
                    this.model.alertAction.entry.content.set('disabled', false);
                    this.model.alertAction.save();
                    this.updateEnabled();
                },
                'click a.disable': function(e) {
                    e.preventDefault();
                    this.model.alertAction.entry.content.set('disabled', true);
                    this.model.alertAction.save();
                    this.updateEnabled();
                },
                'click a.permission': function(e) {
                    e.preventDefault();
                    this.openPermissionsDialog();
                }
            },
            startListening: function() {
                this.listenTo(this.model.alertAction, 'updateCollection', function() {
                    this.model.state.trigger('change:search');
                });
                this.listenTo(this.model.alertAction.entry.acl, 'change:sharing', this.updateSharing);
                this.listenTo(this.model.alertAction.entry.content, 'change:disabled', this.updateEnabled);
            },
            updateSharing: function () {
                var sharing = this.model.alertAction.entry.acl.get('sharing');
                var sharingLabel = splunkd_utils.getSharingLabel(sharing);
                this.$('td.sharing').html(sharingLabel + ' | <a href="#" class="permission">' + _.escape(_("Permissions").t()) + '</a>');
            },
            updateEnabled: function() {
                var tpl = _.template('<%- status %> | <a href="#" class="<%- actionClass %>"><%- action %></a>');
                if (this.model.alertAction.entry.content.get('disabled')) {
                    this.$('td.enabled').html(tpl({ status: _('Disabled').t(), actionClass: 'enable', action: _("Enable").t() }));
                } else {
                    this.$('td.enabled').html(tpl({ status: _('Enabled').t(), actionClass: 'disable', action: _("Disable").t() }));
                }
            },
            openPermissionsDialog: function() {
                this.children.permissionsDialog = new PermissionsDialog({
                    model: {
                        document: this.model.alertAction,
                        nameModel: this.model.alertAction.entry,
                        user: this.model.user, 
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection.roles,
                    nameLabel:  _("Alert action").t(),
                    nameKey: 'name',
                    onHiddenRemove: true
                });

                $("body").append(this.children.permissionsDialog.render().el);
                this.children.permissionsDialog.show();                                                                                                 
            },
            searchUrl: function(searchTpl) {
                var search = splunk_util.sprintf(searchTpl, JSON.stringify(this.model.alertAction.entry.get('name')));
                return route.search(
                        this.model.application.get('root'), 
                        this.model.application.get('locale'), 
                        'search',
                        {data: {'q': search} });
            },
            render: function() {
                var appName = this.model.alertAction.entry.acl.get('app');
                var alertActionName = this.model.alertAction.entry.content.get('label') || this.model.alertAction.entry.get('name');
                var description = this.model.alertAction.entry.content.get('description') || '';
                var alertActionApp = _.find(this.collection.apps.models, function(app) {return app.entry.get('name') === appName;});
                var app = alertActionApp && alertActionApp.entry.content.get("visible") ? appName : this.options.alternateApp;
                var setupUrl, setupLabel;
                if (alertActionApp && alertActionApp.entry.links.get('setup')) {
                    setupUrl = route.appSetupLink(this.model.application.get('root'), this.model.application.get('locale'), appName);
                    setupLabel = splunk_util.sprintf(_('Setup %s').t(), alertActionApp.entry.content.get('label') || appName);
                }
                this.$el.html(this.compiledTemplate({
                    iconPath: route.alertActionIconFile(this.model.application.get('root'), this.model.application.get('locale'), appName, {file: this.model.alertAction.entry.content.get('icon_path')}),
                    alertActionName: _(alertActionName).t(),
                    description: _(description).t(),
                    app: appName,
                    index: this.options.index,
                    showLogLinks: !ModAlertActionsCollection.isBuiltinAction(this.model.alertAction.entry.get('name')),
                    logUrl: this.searchUrl(LOG_SEARCH),
                    usageUrl: this.searchUrl(USAGE_SEARCH),
                    setupUrl: setupUrl,
                    setupLabel: setupLabel,
                    isLite: this.model.serverInfo.isLite(),
                    canUseApps: this.model.user.canUseApps()
                }));
                this.updateSharing();
                this.updateEnabled();
                return this;
            },
            template: '\
                <td class="title">\
                    <div class="action-label">\
                    <% if (iconPath) { %>\
                        <img src="<%= iconPath %>" /> \
                    <%}%>\
                        <span class="action-name"><%- alertActionName %></span>\
                    </div>\
                    <p class="action-description"><%- description %> </p>\
                </td>\
                <% if (canUseApps) { %>\
                    <td class="app"><%- app %></td>\
                <% } %>\
                <td class="sharing"></td>\
                <td class="enabled"></td>\
                <% if (!isLite) { %>\
                <td class="usage">\
                    <% if(showLogLinks){ %>\
                        <a href="<%- usageUrl %>" class="usage"><%- _("Usage statistics").t() %></a>\
                    <% } %>\
                </td>\
                <% } %>\
                <td class="log">\
                    <% if(showLogLinks){ %>\
                        <a href="<%- logUrl %>" class="log"><%- _("View log events").t() %></a>\
                    <% } %>\
                </td>\
                <td class="setup">\
                    <% if(setupUrl){ %>\
                        <a href="<%- setupUrl %>" class="setup"><%- setupLabel %></a>\
                    <% } %>\
                </td>\
                '
        });
    }
);

