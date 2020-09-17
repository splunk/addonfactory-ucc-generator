define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/alertcontrols/dialogs/EnableDisableDialog',
        'views/shared/alertcontrols/dialogs/edit/Master',
        'views/shared/alertcontrols/details/Type',
        'views/shared/alertcontrols/details/Trigger',
        'views/shared/alertcontrols/details/Actions',
        'views/shared/documentcontrols/details/App',
        'views/shared/documentcontrols/details/Permissions',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        EnableDisableDialog,
        EditDialog,
        TypeTextView,
        TriggerTextView,
        ActionsTextView,
        AppText,
        PermissionsTextView,
        PermissionsDialog
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         savedAlert: <models.Report>,
             *         application: <models.Application>,
             *         user: <models.services.admin.User>
             *     },
             *     collection: {
             *         roles: <collections.services.authorization.Roles>,
             *         alertActions: <collections.shared.ModAlertActions>
             *     },
             *     twoColumn: {Boolean} Whether definitions are shown in two columns otherwise one column. Default if false.
             *     displayApp: {Boolean} Whether to display App. Defalut is false
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.triggerTextView = new TriggerTextView({model: this.model.savedAlert});
                this.children.typeTextView = new TypeTextView({model: this.model.savedAlert});
                this.children.actionsTextView = new ActionsTextView({
                    model: {
                        alert: this.model.savedAlert,
                        application: this.model.application
                    },
                    collection: {
                        alertActions: this.collection.alertActions
                    }
                });
                this.children.appText = new AppText({model: this.model.savedAlert});
                this.children.permissionsTextView = new PermissionsTextView({model: {report: this.model.savedAlert, user: this.model.user}});

                this.model.savedAlert.entry.content.on('change:disabled', this.render, this);
            },
            events: {
                'click a.edit-permissions': function(e) {
                    this.children.permissionsDialog = new PermissionsDialog({
                        model: {
                            document: this.model.savedAlert,
                            nameModel: this.model.savedAlert.entry,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: this.collection.roles,
                        onHiddenRemove: true,
                        nameLabel: _('Alert').t()
                    });

                    this.children.permissionsDialog.render().appendTo($("body"));
                    this.children.permissionsDialog.show();

                    e.preventDefault();
                },
                'click a.edit-alert-type': function(e) {
                    this.openEditAlertDialog("type");
                    e.preventDefault();
                },
                'click a.edit-alert-trigger': function(e) {
                    this.openEditAlertDialog("trigger");
                    e.preventDefault();
                },
                'click a.edit-alert-actions': function(e) {
                    this.openEditAlertDialog("actions");
                    e.preventDefault();
                },
                'click a.enable-disable': function(e) {
                    this.children.enableDisableDialog = new EnableDisableDialog({
                        model: this.model.savedAlert,
                        onHiddenRemove: true
                    });

                    this.children.enableDisableDialog.render().appendTo($("body"));
                    this.children.enableDisableDialog.show();

                    e.preventDefault();
                }
            },
            openEditAlertDialog : function(position) {
                this.children.editAlertDialog = new EditDialog({
                    model:  {
                        alert: this.model.savedAlert,
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        alertActions: this.collection.alertActions
                    },
                    onHiddenRemove: true
                });

                this.listenTo(this.children.editAlertDialog, 'shown', function(){
                    this.children.editAlertDialog.scrollTo(position);
                });

                this.children.editAlertDialog.render().appendTo($("body"));
                this.children.editAlertDialog.show();
            },
            render: function() {
                var isDisabled = this.model.savedAlert.entry.content.get('disabled');

                this.$el.html(_.template(this.options.twoColumn ? this.template2Col : this.template, {
                    _: _,
                    enableDisable: isDisabled ? _('Enable').t() : _('Disable').t(),
                    enableDisableText: isDisabled ? _('No. ').t(): _('Yes. ').t(),
                    displayApp: this.options.displayApp && this.model.user.canUseApps()
                }));

                this.children.typeTextView.render().prependTo(this.$('dd.alert-type'));
                this.children.triggerTextView.render().prependTo(this.$('dd.alert-trigger'));
                this.children.actionsTextView.render().prependTo(this.$('dd.alert-actions'));
                this.children.appText.render().prependTo(this.$('dd.app'));
                this.children.permissionsTextView.render().prependTo(this.$('dd.permissions'));

                if (!this.model.savedAlert.canWrite(this.model.user.canScheduleSearch(), this.model.user.canRTSearch())) {
                    this.$('a.edit-link').remove();
                } else {
                    if (!this.model.savedAlert.entry.acl.get("can_change_perms")) {
                        this.$('a.edit-permissions').remove();
                    }
                }

                return this;
            },
            template: '\
                <dl class="list-dotted">\
                <dt><%- _("Enabled").t() %>:</dt>\
                <dd><%= enableDisableText %><a href="#" class="enable-disable edit-link"><%= enableDisable %></a></dd>\
                <% if(displayApp) { %>\
                    <dt><%- _("App").t() %>:</dt>\
                    <dd class="app"></dd>\
                <% } %>\
                <dt><%- _("Permissions").t() %>:</dt>\
                <dd class="permissions"><a href="#" class="edit-permissions edit-link"><%- _("Edit").t() %></a></dd>\
                <dt><%- _("Alert Type").t() %>:</dt>\
                <dd class="alert-type"> <a href="#" class="edit-alert-type edit-link"><%- _("Edit").t() %></a></dd>\
                <dt><%- _("Trigger Condition").t() %>:</dt>\
                <dd class="alert-trigger"> <a href="#" class="edit-alert-trigger edit-link"><%- _("Edit").t() %></a></dd>\
                <dt><%- _("Actions").t() %>:</dt>\
                <dd class="alert-actions"> <a href="#" class="edit-alert-actions edit-link"><%- _("Edit").t() %></a></dd>\
                </dl>\
                </td>\
            ',
            template2Col: '\
                <dl class="list-dotted">\
                    <dt><%- _("Enabled").t() %>:</dt>\
                    <dd><%= enableDisableText %><a href="#" class="enable-disable edit-link"><%= enableDisable %></a></dd>\
                    <% if(displayApp) { %>\
                        <dt><%- _("App").t() %>:</dt>\
                        <dd class="app"></dd>\
                    <% } %>\
                    <dt><%- _("Permissions").t() %>:</dt>\
                    <dd class="permissions"><a href="#" class="edit-permissions edit-link"><%- _("Edit").t() %></a></dd>\
                    <dt><%- _("Alert Type").t() %>:</dt>\
                    <dd class="alert-type"> <a href="#" class="edit-alert-type edit-link"><%- _("Edit").t() %></a></dd>\
                </dl>\
                <dl class="list-dotted">\
                    <dt><%- _("Trigger Condition").t() %>:</dt>\
                    <dd class="alert-trigger"> <a href="#" class="edit-alert-trigger edit-link"><%- _("Edit").t() %></a></dd>\
                    <dt><%- _("Actions").t() %>:</dt>\
                    <dd class="alert-actions"> <a href="#" class="edit-alert-actions edit-link"><%- _("Edit").t() %></a></dd>\
                </dl>\
            '
        });
    }
);
