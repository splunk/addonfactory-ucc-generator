define(
[
    'jquery',
    'underscore',
    'module',
    'views/shared/splunkbar/messages/Message',
    'views/shared/ModalConfirmation/Master',
    'views/shared/Restart',
    './Message.pcssm',
    'splunk.util'
],
function(
    $,
    _,
    module,
    MessageView,
    ConfirmDialog,
    RestartDialog,
    css,
    splunk_util
){
    return MessageView.extend({
        moduleId: module.id,
        css: css,
        messageMap: {
            'restart_required': _('Restart for changes to take effect. [[/manager/search/control|Click here to restart]].').t(),
            'orphaned_scheduled_searches': _('Click to view the [[/app/search/orphaned_scheduled_searches?form.scheduled_only=is_scheduled%3D1|orphaned scheduled searches]].  Reassign them to a valid user to re-enable or alternatively disable the searches.').t(),
            'LM_LICENSE_ALERTS_STATUS': _('Daily indexing volume limit exceeded today. See [[/manager/system/licensing|License Manager]] for details.').t()
        },
        contactStr: 'To manage your license or to learn how to renew your license go the licensing management page.',

        initialize: function() {
            MessageView.prototype.initialize.apply(this, arguments);
            //listen for restart events
            $(document).on('restart_failed', function() {
                this.hideRestartModal();
            }.bind(this));

            this.children.confirmDialog = new ConfirmDialog({
                text: _("Are you sure you want to restart Splunk Light?").t()
            });
            this.children.confirmDialog.on('success', function() {
                this.showRestartModal();
                splunk_util.restart_server();
            }.bind(this));
        },

        events: {
            'click [data-role="content"] a' : 'checkRestart'
        },

        checkRestart: function(e) {
            if (this.restart) {
                e.preventDefault();
                this.children.confirmDialog.render().el;
                this.children.confirmDialog.show();
            }
        },

        showRestartModal: function() {
            this.children.restartDialog = new RestartDialog({
                model: {
                    serverInfo: this.model.serverInfo
                }
            });
            // Necessary for modal to render correctly in manager.
            $("body").append('<div class="splunk-components restartModal"></div>');
            $(".restartModal").append(this.children.restartDialog.render().el);
            this.children.restartDialog.show();
        },

        hideRestartModal: function() {
            if (this.children.restartDialog) {
                this.children.restartDialog.hide();
            }
        },

        render: function() {
            if (this.model.message.entry.get('name') == 'restart_required') {
                this.restart = true;
            }
            MessageView.prototype.render.apply(this, arguments);
        }
    });
});
