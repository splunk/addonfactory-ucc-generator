define(
    [
        'module',
        'jquery',
        'underscore',
        'views/shared/PopTart',
        'views/shared/documentcontrols/dialogs/TitleDescriptionDialog',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'views/shared/documentcontrols/dialogs/DeleteDialog',
        'uri/route',
        'bootstrap.modal',
        'util/splunkd_utils',
        'views/dashboards/table/controls/SchedulePDF',
        'models/services/ScheduledView',
        'models/shared/Cron'
    ],
    function(
        module,
        $,
        _,
        PopTartView,
        TitleDescriptionDialog,
        PermissionsDialog,
        DeleteDialog,
        route,
        bootstrapModal,
        splunkDUtils,
        SchedulePDF,
        ScheduledViewModel,
        Cron
    )
    {
        return PopTartView.extend({
            moduleId: module.id,
            className: 'dropdown-menu more-info popdown-dialog',
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
                var defaults = {
                        button: true,
                        showOpenActions: true,
                        deleteRedirect: false
                    };

                _.defaults(this.options, defaults);
            },
            events: {
                'click .edit-schedule': function (e) {
                        e.preventDefault();
                        this.hide();
                        this.remove();
                        this.children.schedulePDF = new SchedulePDF({
                            model: {
                                scheduledView: this.model.scheduledView,
                                dashboard: this.model.dashboard,
                                application: this.model.application,
                                appLocal: this.model.state.appLocal
                            },
                            onHiddenRemove: true
                        });
                        $("body").append(this.children.schedulePDF.render().el);
                        this.children.schedulePDF.show();

                },
                'click a.edit-permissions': function(e) {
                    e.preventDefault();
                    this.hide();
                    this.remove();
                    this.children.permissionsDialog = new PermissionsDialog({
                        model: {
                            document: this.model.dashboard,
                            nameModel: this.model.dashboard.entry.content,
                            user: this.model.state.user,
                            serverInfo: this.model.serverInfo
                        },
                        collection: this.collection,
                        nameLabel:  "Dashboard",
                        nameKey: 'label',
                        onHiddenRemove: true
                    });

                    $("body").append(this.children.permissionsDialog.render().el);
                    this.children.permissionsDialog.show();
                }
            },
            render: function() {
                var isScheduled = this.model.scheduledView.entry.content.get('is_scheduled'), schedule = '-', recipients = [],
                    sharing = this.model.dashboard.entry.acl.get("sharing"),
                    owner = this.model.dashboard.entry.acl.get("owner"),
                    canUseApps = this.model.state.user.canUseApps();

                if ((sharing === 'app') && !canUseApps) {
                    sharing = 'system';
                }

                var permissionString = splunkDUtils.getPermissionLabel(sharing, owner),
                    appString = this.model.dashboard.entry.acl.get('app');

                if (isScheduled) {
                    var expr = this.model.scheduledView.entry.content.get('cron_schedule'), cron = expr ? Cron.createFromCronString(expr) : null;
                    if(cron) {
                        switch (cron.get('cronType')) {
                            case 'hourly':
                                schedule = _("Sent Hourly").t();
                                break;
                            case 'daily':
                                schedule = _("Sent Daily").t();
                                break;
                            case 'weekly':
                                schedule = _("Sent Weekly").t();
                                break;
                            case 'monthly':
                                schedule = _("Sent Monthly").t();
                                break;
                            case 'custom':
                                schedule = _("Sent on a custom schedule").t();
                                break;
                        }
                    }
                    recipients = (this.model.scheduledView.entry.content.get('action.email.to')||'').split(/\s*,\s*/);
                }

                var renderModel = {
                    _:_,
                    isScheduled: isScheduled,
                    schedule: schedule,
                    recipients: _(recipients).chain().filter(_.identity).map(function(recipient){
                        return ['<a href="mailto:',encodeURIComponent(recipient),'">',_.escape(recipient),'</a>'].join('');
                    }).value(),
                    shared: this.model.dashboard.entry.acl.get("perms"),
                    owner: owner,
                    permissionString: permissionString,
                    canChangePerms: this.model.dashboard.entry.acl.get('can_change_perms'),
                    canScheduleXML: !this.model.serverInfo.isLite() && this.model.dashboard.isDashboard(),
                    userCanScheduleSearch: this.model.state.user.canScheduleSearch(),
                    isPdfServiceAvailable: this.model.state.get('pdf_available'),
                    appString: appString,
                    canUseApps: this.model.state.user.canUseApps()
                };

                var html = this.compiledTemplate(renderModel);
                this.$el.html(PopTartView.prototype.template_menu);
                this.$el.append(html);

                return this;
            },
            template: '\
                <div class="popdown-dialog-body">\
                    <div>\
                        <dl class="list-dotted">\
                            <% if(canUseApps) { %>\
                                <dt class="app"><%- _("App").t() %></dt>\
                                <dd>\
                                    <%= appString %>\
                                </dd>\
                            <% } %>\
                            <% if(canScheduleXML) { %>\
                                <dt class="schedule"><%- _("Schedule").t() %></dt>\
                                <dd>\
                                    <% if(isScheduled) { %>\
                                        <%= schedule %> <%- _("to").t() %> \
                                        <%= recipients.join(", ") %>.\
                                    <% } else { %>\
                                        <%- _("Not scheduled").t() %>.\
                                    <% } %> \
                                    <% if(userCanScheduleSearch && isPdfServiceAvailable) { %>\
                                        <a href="#" class="edit-schedule"><%- _("Edit").t() %></a>\
                                    <% } %> \
                                </dd>\
                            <% } %> \
                            <dt class="permissions"><%- _("Permissions").t() %></dt>\
                            <dd class="edit-permissions">\
                                <%- _(permissionString).t() %>\
                                <% if(canChangePerms) { %>\
                                    <a href="#" class="edit-permissions"><%- _("Edit").t() %></a>\
                                <% } %> \
                        </dl>\
                    </div>\
                </div>\
            '
        });
    }
);
