/**
 * Created by lrong on 10/8/15.
 */
define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'models/managementconsole/Task',
    'models/managementconsole/topology/Instance',
    'views/managementconsole/shared/TaskProgressDialog',
    'views/managementconsole/shared/PendingChangesDialog',
    'helpers/managementconsole/url',
    'contrib/text!./TableRow.html'
], function(
    $,
    _,
    module,
    BaseView,
    TaskModel,
    InstanceModel,
    TaskProgressDialog,
    PendingChangesDialog,
    urlHelper,
    Template
) {
    var STRINGS = {
            EDIT: _('Edit').t(),
            CONFIGURE: _('Edit Configuration').t(),
            REMOVE: _('Remove').t(),
            SHOW_DEPLOY_STATUS: _('Deploy Status').t()
        },
        TABLE_COLUMN_NANES = [
            'SELECT_ALL',
            'HOST_NAME',
            'EDIT_ACTIONS',
            'DNS_NAME',
            'CLIENT_NAME',
            'IP_ADDRESS',
            'MACHINE_TYPE',
            'PHONE_HOME',
            'VERSION',
            'SERVER_ROLE',
            'REGISTRATION_STATUS',
            'DEPLOY_STATUS',
            'ACTIONS'
        ];

    return BaseView.extend({
        moduleId: module.id,
        tagName: 'tr',


        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.$el.attr('data-name', this.model.instance.entry.get('name'));

            if (this.model.classicurl) {
                this.listenTo(this.model.classicurl, 'change sync', this._updateReturnUrl);
            }
        },

        events: {
            'click a.view-task-progress': '_onTaskProgressLinkClicked',
            'click a.pending-link': '_onPendingLinkClicked'
        },

        _onTaskProgressLinkClicked: function(e) {
            e.preventDefault();

            if(!this.collection.tasks) {
                return;
            }

            var taskObj = this.model.instance.entry.content.get('task');
            if (taskObj) {
                var model = this.collection.tasks.createTask(taskObj.taskId);

                var dialog = new TaskProgressDialog({
                    taskId: taskObj.taskId,
                    stopPollingOnClose: false,
                    model: {
                        task: model
                    },
                    onHiddenRemove: true
                });
                $('body').append(dialog.render().el);
                dialog.show();
            }
        },

        _onPendingLinkClicked: function(e) {
            e.preventDefault();

            this.collection.pendingChanges.fetchData.set({
                type: ['stanza'],
                bundleType: 'node',
                bundleId: this.model.instance.entry.content.get('instanceId')
            });

            this.collection.pendingChanges.safeFetch();

            var dialog = new PendingChangesDialog({
                onHiddenRemove: true,
                mode: 'node-context',
                collection: {
                    pendingChanges: this.collection.pendingChanges
                }
            });

            $('body').append(dialog.render().el);
            dialog.show();
        },

        render: function() {
            var task = this.model.instance.entry.content.get('task'),
                clientName = this.model.instance.entry.content.get('clientName') || this.model.instance.getNullValueDisplay(),
                hostname = this.model.instance.entry.content.get('hostname') || this.model.instance.getNullValueDisplay(),
                ip = this.model.instance.entry.content.get('ip') || this.model.instance.getNullValueDisplay(),
                dns = this.model.instance.entry.content.get('dns') || this.model.instance.getNullValueDisplay(),
                splunkVersion = this.model.instance.getSplunkVersion(),
                showRemoveLink = this.model.instance.entry.content.get('topology') === InstanceModel.valForwarder();

            this.$el.html(this.compiledTemplate({
                instanceId: this.model.instance.entry.content.get('instanceId'),
                topologyUpdate: this.model.instance.isInstanceMarkedForUpdate(),
                hostname: hostname,
                dns: dns,
                clientName: clientName,
                ip: ip,
                splunkPlatform: this.model.instance.entry.content.get('splunkPlatform'),
                phoneHome: this.model.instance.getRelativeLastPhoneHomeTime(),
                splunkVersion: splunkVersion,
                splunkRole: this.model.instance.getSplunkRoleLabel(),
                task: task,
                taskModel: TaskModel,
                isPending: this.model.instance.isPending(),
                pendingText: this.model.instance.getPendingText(),
                configureUrl: this.model.instance.getConfigureUrl(),
                canConfigure: this.model.instance.canListStanzas(),
                hiddenColumnNames: this.options.hiddenColumnNames,
                deployStatus: this.model.instance.getDeployStatusLabel(),
                allColumnNames: TABLE_COLUMN_NANES,
                showRemoveLink: showRemoveLink,
                strings: STRINGS
            }));
            return this;
        },

        _updateReturnUrl: function() {
            this.$(".configure-action").attr("href", this.model.instance.getConfigureUrl());
        },

        template: Template
    });
});