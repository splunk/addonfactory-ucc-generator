define(
[
    'jquery',
    'underscore',
    'module',
    'models/shared/SessionStore',
    'views/shared/splunkbar/messages/MenuContents',
    'views/shared/litebar/Message',
    'contrib/text!views/shared/litebar/Messages.html',
    './Messages.pcssm',
    'util/general_utils'
],
function(
    $,
    _,
    module,
    SessionStore,
    MessagesView,
    MessageView,
    template,
    css,
    general_utils
){
    return MessagesView.extend({
        moduleId: module.id,
        template: template,
        css: css,
        MessageView: MessageView,
        showHideMessages: function() {
            var totalSystemMessages = this.collection.messages.length + this.numLegacyMessages,
                totalMessages = totalSystemMessages + this.numSplunkMessages;
            this.$('[data-role=message-notification]').text(totalMessages);

            if (totalMessages > 0) {
                this.$('[data-role=message-notification]').show();
                this.$("[data-action=delete-all]").show();
                this.$('[data-role=no-messages]').hide();
            } else {
                this.$('[data-role=message-notification]').hide();
                this.$("[data-action=delete-all]").hide();
                this.$('[data-role=no-messages]').show();
            }

            if (totalSystemMessages == 0 || this.numSplunkMessages == 0) {
                this.$('[data-role=messages-list-divider]').hide();
            } else {
                this.$('[data-role=messages-list-divider]').show();
            }
            this.checkForLicenseExpirationMessage();
        },

        checkForLicenseExpirationMessage: function() {
            this.collection.messages.each(function(model, key){
                if (model.entry.get('name') == 'LM_LICENSE_EXPIRATION_STATUS') {
                    if (!this.model.serverInfo.isLicenseStateExpired()) {
                        var sessionStorage = SessionStore.getInstance();
                        sessionStorage.fetch();

                        if (!sessionStorage.has('licenseWillExpireMessageVisible')) {
                            sessionStorage.set({'licenseWillExpireMessageVisible': true});
                            sessionStorage.save();
                        }
                        
                        if (general_utils.normalizeBoolean(sessionStorage.get('licenseWillExpireMessageVisible'))) {
                            model.trigger('licenseWillExpire', model.entry.content.get('message'));
                        }
                    }
                }
            }, this);
        },

        getSplunkMessages: function() {
           MessagesView.prototype.getSplunkMessages.apply(this, arguments);
           this.checkAppUpdates();
        },

        checkAppUpdates: function() {
            if (this.collection.apps) {
                _.each(this.collection.apps.models, function(app) {
                    var appId = app.entry.get('name'),
                        appName = app.entry.content.get('label'),
                        appVersionId = 'app_version_' + appId,
                        newAppVersion = this.model.userPref.entry.content.get(appVersionId);

                    // Check if app specific message is available
                    if (newAppVersion) {
                        this.renderSplunkMessage(appVersionId, 'info', {appName: appName, appId: appId});
                        this.showHideMessages();
                        return true;
                    }

                    // Check if new version is available
                    var updateVersion = app.entry.content.get('update.version'),
                        checkedVersion = this.model.userPref.entry.content.get('checked_' + appVersionId);

                    if (updateVersion && (updateVersion !== checkedVersion)) {
                        this.renderSplunkMessage(appVersionId, 'info', {appName: appName, appId: appId});
                        this.saveSplunkMessage(appVersionId, updateVersion);
                        this.showHideMessages();
                    }
                }, this);
            }
        }
    });
});
