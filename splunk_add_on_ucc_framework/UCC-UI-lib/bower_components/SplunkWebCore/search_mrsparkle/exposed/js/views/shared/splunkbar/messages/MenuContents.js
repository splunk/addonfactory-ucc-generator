define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'models/SplunkDBase',
        'models/shared/UpdateChecker',
        'views/shared/delegates/Popdown',
        'views/shared/delegates/StopScrollPropagation',
        'views/shared/splunkbar/messages/Message',
        'views/shared/splunkbar/messages/LegacyMessage',
        'views/shared/Button',
        'contrib/text!./MenuContents.html',
        './MenuContents.pcssm',
        'util/general_utils',
        'splunk.util'
    ],
    function($, _, module, BaseView, SplunkDBaseModel, UpdateCheckerModel, Popdown, StopScrollPropagation, MessageView, LegacyMessageView, ButtonView, template, css, general_utils, splunkUtil) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            css: css,
            MessageView: MessageView, // Aliasing so Lite can use Subclass
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.model = this.model || {};
                this.model.application = this.model.application || {};
                this.model.serverInfo = this.model.serverInfo || {};
                this.model.updateChecker = this.model.updateChecker || new UpdateCheckerModel();

                if (this.collection.messages) {
                    this.collection.messages.on('change reset remove', this.renderMessages, this);
                }
                if (this.collection.legacyMessages) {
                    this.collection.legacyMessages.on('reset remove', this.renderMessages, this);
                }
                this.isLocalMouseSelection = false;
                this.children.deleteAll = new ButtonView({label: _("Delete All").t(), action: 'delete-all' });
                this.numSplunkMessages = 0;
                this.numLegacyMessages = 0;
                this.splunkMessagesDfd = $.Deferred();
                this.updateCheckerDfd = $.Deferred();
            },

            events: {
                'click [data-action=delete]': 'deleteMessage',
                'click [data-action=delete-all]': 'deleteAllMessages',
                'click [data-action=delete-splunk-message]': 'deleteSplunkMessage',
                'mouseup .message-list': function() {
                    // this is to stop message refresh only when selection is LOCAL to .message-list
                    this.isLocalMouseSelection = true;
                }
            },

            render: function() {
                var html = this.compiledTemplate({
                        collection: {
                            messages: this.collection.messages,
                            legacyMessages: this.collection.legacyMessages
                        },
                        css: this.css
                    });
                
                this.$el.html(html);
                this.children.popdown = new Popdown({el:this.el, mode: 'dialog'});
                this.children.stopScrollPropagation = new StopScrollPropagation({el:this.$('#global-messages-menu ul'), mode: 'dialog'});
                this.children.deleteAll.render().appendTo(this.$('[data-role=footer]'));

                // Check for new Splunk messages
                if (this.model.user && this.model.user.isAdminLike()) {
                    this.getSplunkMessages();
                }

                return this;
            },

            renderMessages: function(forceUpdate) {
                if (forceUpdate !== true &&
                    this.isLocalMouseSelection &&
                    general_utils.getMouseSelection() && general_utils.getMouseSelection().length>0) {
                    return;
                }
                this.isLocalMouseSelection = false;

                // Remove existing message children
                _.each(this.children, function(view, key) {
                    if (key.substr(0, 7) == 'message') {
                        this.children[key].remove();
                        delete this.children[key];
                    }
                }, this);

                // Iterate through collection
                this.collection.messages.each(function(model, key) {
                    // Create view
                    var messageView = new this.MessageView({
                            model: {
                                application: this.model.application,
                                serverInfo: this.model.serverInfo,
                                message: model
                            }
                        });
                    this.children['message' + model.get("id")] = messageView;
                    this.$('[data-role=messages-list-divider]').before(messageView.render().$el);
                }, this);

                if (this.collection.legacyMessages) {
                    this.numLegacyMessages = this.collection.legacyMessages.length;
                    this.collection.legacyMessages.each(function(model) {
                        var messageView = new LegacyMessageView({
                            model: {
                                application: this.model.application,
                                serverInfo: this.model.serverInfo,
                                message: model
                            }
                        });
                        this.children['messageLegacy' + model.get("id")] = messageView;
                        this.$('[data-role=messages-list-divider]').before(messageView.render().$el);
                    }, this);
                }

                this.numMessages = this.collection.messages.length;
                if (this.collection.legacyMessages) {
                    this.numMessages = this.numMessages + this.numLegacyMessages;
                }
                this.showHideMessages();
            },

            showHideMessages: function() {
                var totalSystemMessages = this.collection.messages.length + this.numLegacyMessages,
                    totalMessages = totalSystemMessages + this.numSplunkMessages;

                if (totalMessages > 0) {
                    this.$("[data-role=footer]").show();
                    this.$("[data-role=no-messages]").hide();
                } else {
                    this.$("[data-role=footer]").hide();
                    this.$("[data-role=no-messages]").show();
                }

                if (totalSystemMessages == 0 || this.numSplunkMessages == 0) {
                    this.$('[data-role=messages-list-divider]').hide();
                } else {
                    this.$('[data-role=messages-list-divider]').show();
                }
            },

            deleteMessage: function(evt) {
                evt.preventDefault();
                var $li = $(evt.currentTarget).parent(),
                    id = $li.data('id'),
                    isLegacy = $li.data('islegacy'),
                    toRemove;

                if (this.collection.legacyMessages && isLegacy) {
                    toRemove = this.collection.legacyMessages.get(id);
                    if (toRemove) {
                        this.collection.legacyMessages.remove(toRemove);
                    }
                } else {
                    toRemove = this.collection.messages.get(id);
                    if (toRemove) {
                        toRemove.destroy();
                    }
                }

                if (this.collection.messages.length === 0 && (!this.collection.legacyMessages || this.collection.legacyMessages === 0)) {
                    this.children.popdown.hide();
                }

                this.renderMessages(true);
            },

            deleteSplunkMessage: function(e) {
                e.preventDefault();
                var $msg = $(e.currentTarget).parent(),
                    msgId = $msg.attr('data-id').replace(/\-/g, '_');

                $msg.remove();
                this.numSplunkMessages--;
                this.showHideMessages();
                this.model.userPref.entry.content.set(msgId, '');
                this.model.userPref.save({});
            },

            deleteAllMessages: function(evt) {
                evt.preventDefault();
                this.collection.messages.destroyAll();
                if (this.collection.legacyMessages) {
                    this.collection.legacyMessages.reset();
                }
                if (this.numSplunkMessages > 0) {
                    this.$('[data-action=delete-splunk-message]').click();
                }
                this.children.popdown.hide();
            },

            getSplunkMessages: function() {
                var canRenderSplunkMessages = splunkUtil.normalizeBoolean(this.model.userPref.entry.content.get('render_version_messages'));
                if (canRenderSplunkMessages) {
                    // Check if we need to use Quickdraw or User Prefs
                    if (this.model.updateChecker.get('useQuickdraw')) {
                        this.model.updateChecker.on('sync', function() {
                            this._getSplunkMessagesFromQuickdraw();
                        }, this);
                    } else {
                        this._getSplunkMessagesFromUserPref();
                    }
                    this.showHideMessages();
                }
            },

            _getSplunkMessagesFromQuickdraw: function() {
                var update = this.model.updateChecker,
                    userPref = this.model.userPref.entry.content;

                if (update) {
                    // Checking for new major version
                    var hasNewVersion = update.get('hasNewVersion');
                    if (hasNewVersion) {
                        var newVersion = update.get('newVersionLabel'),
                            savedNewVersion = general_utils.normalizeBoolean(userPref.get('new_version')) || true,
                            newVersionChecked = userPref.get('checked_new_version'),
                            showNewVersion = (newVersion !== newVersionChecked) ||
                                                ((newVersion === newVersionChecked) && savedNewVersion);

                        if (showNewVersion) {
                            this.renderSplunkMessage('new_version', 'greater');
                            this.saveSplunkMessage('new_version', newVersion);
                        }
                    }

                    // Checking for new maintenance version
                    var hasNewMaintenanceVersion = update.get('hasNewMaintenanceVersion');
                    if (hasNewMaintenanceVersion) {
                        var newMaintenanceVersion = update.get('latestMaintenanceVersionLabel'),
                            savedNewMaintenanceVersion = general_utils.normalizeBoolean(userPref.get('new_maintenance_version')) || true,
                            newMaintenanceVersionChecked = userPref.get('checked_new_maintenance_version'),
                            showNewMaintenanceVersion = (newMaintenanceVersion !== newMaintenanceVersionChecked) ||
                                                        ((newMaintenanceVersion === newMaintenanceVersionChecked) && savedNewMaintenanceVersion);

                        if (showNewMaintenanceVersion) {
                            this.renderSplunkMessage('new_maintenance_version', 'greater');
                            this.saveSplunkMessage('new_maintenance_version', newMaintenanceVersion);
                        }
                    }
                }
            },

            _getSplunkMessagesFromUserPref: function() {
                var newVersion = this.model.userPref.entry.content.get('new_version');
                if (newVersion) {
                    this.renderSplunkMessage('new_version', 'greater');
                }

                var newMaintenanceVersion = this.model.userPref.entry.content.get('new_maintenance_version');
                if (newMaintenanceVersion) {
                    this.renderSplunkMessage('new_maintenance_version', 'greater');
                }
            },

            renderSplunkMessage: function(messageId, icon, options) {
                var messageModel = new SplunkDBaseModel();

                if (options) {
                    messageModel.entry.content.set(options);
                }

                messageModel.entry.content.set('type', 'splunk');
                messageModel.entry.content.set('severity', icon);
                messageModel.entry.content.set('id', messageId);
                messageModel.entry.set('name', messageId);

                var messageView = new this.MessageView({
                     model: {
                        application: this.model.application,
                        serverInfo: this.model.serverInfo,
                        message: messageModel
                    }
                });

                this.children['splunk-message' + messageModel.cid] = messageView;
                this.$('[data-role=messages-list-divider]').after(messageView.render().$el);

                this.numSplunkMessages++;
                this.showHideMessages();
            },

            saveSplunkMessage: function(messageId, version) {
                this.model.userPref.entry.content.set(messageId, true);
                this.model.userPref.entry.content.set('checked_' + messageId, version);
                this.model.userPref.save({});
            }
        });
    }
);
