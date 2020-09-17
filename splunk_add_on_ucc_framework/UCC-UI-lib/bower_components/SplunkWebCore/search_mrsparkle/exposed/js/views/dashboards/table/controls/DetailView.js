define(['jquery', 'underscore','module', 'util/splunkd_utils', 'views/Base', 'views/shared/delegates/Popdown', 'views/shared/documentcontrols/dialogs/permissions_dialog/Master', 'models/shared/Cron','views/dashboards/table/controls/SchedulePDF'],
        function ($, _, module, splunkDUtils, BaseView, PopdownView, PermissionsDialog, Cron, SchedulePDF) {
            return BaseView.extend({
                moduleId: module.id,
                className: 'list-dotted',
                tagName: 'dl',
                /**
                 * @param {Object} options {
                 *     model: {
                 *         state: <models.State>
                 *         scheduledView: <models.services.ScheduledView>
                 *         dashboard: <models.services.data.ui.View>,
                 *         application: <models.Application>,
                 *         user: <models.service.admin.user>
                 *     },
                 *     collection: <collections.services.authorization.Roles>
                 * }
                 */
                initialize: function () {
                    BaseView.prototype.initialize.apply(this, arguments);
                    this.listenTo(this.model.scheduledView, 'sync', this.render, this);
                    this.listenTo(this.model.dashboard.entry.acl, 'change', this.render, this);
                },
                events: {
                    'click .edit-schedule': function (e) {
                        e.preventDefault();

                        var schedulePDF = new SchedulePDF({
                            model: {
                                scheduledView: this.model.scheduledView,
                                dashboard: this.model.dashboard,
                                application: this.model.application,
                                appLocal: this.model.appLocal,
                                infoDeliveryAvailable: this.model.infoDeliveryAvailable
                            },
                            onHiddenRemove: true
                        });

                        $("body").append(schedulePDF.render().el);
                        schedulePDF.show();

                    },
                    'click a.edit-permissions': function(e) {
                        e.preventDefault();
                        this.children.permissionsDialog = new PermissionsDialog({
                            model: {
                                document: this.model.dashboard,
                                nameModel: this.model.dashboard.entry.content,
                                user: this.model.user,
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
                render: function () {
                    var isScheduled = this.model.scheduledView.entry.content.get('is_scheduled'), schedule = '-', recipients = [],
                        sharing = this.model.dashboard.entry.acl.get("sharing"),
                        owner = this.model.dashboard.entry.acl.get("owner"),
                        canUseApps = this.model.user.canUseApps();

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
                    
                    this.$el.html(this.compiledTemplate({
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
                        userCanScheduleSearch: this.model.user.canScheduleSearch(),
                        canUseApps: canUseApps,
                        isPdfServiceAvailable: this.model.state.get('pdf_available'),
                        appString: appString
                    }));
                    return this;
                },
                template: '\
                <% if (canUseApps) { %>\
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
                    <%- permissionString %>\
                    <% if(canChangePerms) { %>\
                        <a href="#" class="edit-permissions"><%- _("Edit").t() %></a>\
                    <% } %> \
            '
            });
        }
);

