// splunk bar
define(
[
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/Icon',
    './Message.pcssm',
    'splunk.util',
    'uri/route',
    'util/time'
],
function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    IconView,
    css,
    splunk_util,
    route,
    time_utils
){
    /**
     * View Hierarchy:
     *
     * Messages
     */
    return BaseView.extend({
        moduleId: module.id,
        css: css,
        messageMap: {
            'restart_required': _('Splunk must be restarted for changes to take effect. [[/manager/search/control|Click here to restart from the Manager]].').t(),
            'orphaned_scheduled_searches': _('Click to view the [[/app/search/orphaned_scheduled_searches?form.scheduled_only=is_scheduled%3D1|orphaned scheduled searches]].  Reassign them to a valid user to re-enable or alternatively disable the searches.').t()
        },
        contactStr: '[http://www.splunk.com/r/getlicense Contact Splunk] (sales@splunk.com or +1.866.GET.SPLUNK) for details on how to renew.',

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            var icons = {
                info: 'infoCircle',
                warn: 'warning',
                error: 'error',
                important: 'error',
                greater: 'greater'
            };

            this.children.icon = new IconView({icon: icons[this.model.message.entry.content.get('severity')]});
            this.children.deleteIcon = new IconView({icon: 'x'});

            this.$el.attr('data-id', (this.model.message.entry.content.get("message") || ""));

            // Passing empty local b/c of how the wiki transforms urls. Also removing leading '/'.
            var appsLocalLink = route.appsLocal('', '', this.model.application.get('app')).slice(1);
            var newVersionMaps = {
                'new_version': splunk_util.sprintf('%s [!http://www.splunk.com/downloads %s]', _('New version available.').t(), _('Click here for details.').t()),
                'new_maintenance_version': splunk_util.sprintf('%s [!http://www.splunk.com/downloads %s]', _('New maintenance version available.').t(), _('Click here for details.').t()),
                'new_app_version': splunk_util.sprintf('%s [[%s|%s]]', _('A new version of ~#APPNAME#~ is available.').t(), appsLocalLink, _('Upgrade here.').t())
            };
            this.messageMap = $.extend(true, this.messageMap, newVersionMaps);
        },

        setAppIcon: function(appId) {
            var iconSrc = route.appIcon(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('owner'),
                    appId);
            this.$('[data-role=icon]').append('<img src="' + iconSrc + '" />');
        },

        render: function() {
            var msgFullId = (this.model.message.entry.content.get('id')) ? this.model.message.entry.content.get('id').replace(/\_/g, '-') : this.model.message.id,
                msgId = (this.model.message.entry.get('name') || ''),
                msgLevel = this.model.message.entry.content.get('severity') || 'warn',
                contactToken = '$CONTACT_SPLUNK_SALES_TEXT$',
                messageMap = this.messageMap,
                msg, msgHelp;

            if (msgId.indexOf('app_version') > -1) {
                msgId = 'new_app_version';
            }

            if (msgId && messageMap[msgId]) {
                if (msgId === "orphaned_scheduled_searches") {
                    msg = this.model.message.entry.content.get("message") || '';
                    msg += messageMap[msgId];
                } else if (msgId === 'new_app_version') {
                    msg = messageMap[msgId];
                    var appName = this.model.message.entry.content.get('appName') || '';
                    msg = msg.replace('~#APPNAME#~', appName);
                }
                else {
                    msg = messageMap[msgId];
                }
            } else {
                msg = this.model.message.entry.content.get("message") || '';
                if (this.model.message.entry.content.get('help') && this.model.application) {
                    msgHelp = route.docHelp(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.message.entry.content.get('help'));
                }
            }

            if (msg.indexOf(contactToken) != -1) {
                msg = msg.replace(contactToken, this.contactStr);
            }

            var msgTime = this.model.message.entry.content.get("timeCreated_iso");
            if(msgTime){
                var dateObj = time_utils.isoToDateObject(msgTime);
                msgTime = dateObj.toLocaleString();
            }

            var formattedMsg = splunk_util.getWikiTransform(msg),
                isSplunkMessage = this.model.message.entry.content.get("type") || false;

            var html = this.compiledTemplate({
                msg: formattedMsg,
                msgLevel: msgLevel,
                msgTime: msgTime || '',
                type: isSplunkMessage,
                msgHelp: msgHelp,
                css: this.css
            });

            this.$el.html(html);
            this.$el.attr('data-id', msgFullId);

            if (msgId == 'new_app_version') {
                this.setAppIcon(this.model.message.entry.content.get('appId'));
            } else {
                this.children.icon.render().appendTo(this.$('[data-role=icon]'));
            }
            if (isSplunkMessage) {
                this.children.deleteIcon.render().appendTo(this.$('[data-action=delete-splunk-message]'));
            } else {
                this.children.deleteIcon.render().appendTo(this.$('[data-action=delete]'));
            }

            return this;
        },

        template: '\
                <span class="<%- css[msgLevel] %>" data-role="icon"></span>\
                <span class="<%- css.content %>" data-role="content"><%= msg %>\
                <% if (msgHelp) { %>\
                    <a href="<%= msgHelp %>" class="message-help external" target="_blank"><%- _("Learn more.").t() %></a>\
                <% } %>\
                </span>\
                <span class="<%- css.time %>" data-role="time"><%- msgTime %></span>\
                <% if (type == "splunk") { %>\
                    <a href="#" class="<%-css.delete%>" data-action="delete-splunk-message"></a>\
                <% } else { %>\
                    <a href="#" class="<%-css.delete%>" data-action="delete"></a>\
                <% } %>\
        '
    });
});
