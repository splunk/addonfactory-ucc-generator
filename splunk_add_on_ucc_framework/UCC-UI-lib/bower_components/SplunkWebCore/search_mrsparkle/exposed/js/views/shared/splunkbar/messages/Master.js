define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/Menu',
        './MenuContents',
        '../MenuButton',
        'util/general_utils'
    ],
    function($, _, module, MenuView, MenuContentsView, MenuButtonView, general_utils) {
        return MenuView.extend({
            moduleId: module.id,
            initialize: function() {
                this.options.mode = 'dialog';
                this.options.contentView = new MenuContentsView({
                    collection: {
                        messages: this.collection.messages,
                        legacyMessages: this.collection.legacyMessages
                    },
                    model: {
                        serverInfo: this.model.serverInfo,
                        application: this.model.application,
                        user: this.model.user,
                        updateChecker: this.model.updateChecker,
                        userPref: this.model.userPref,
                        webConf: this.model.webConf
                    }
                });
                this.options.toggleView = new MenuButtonView({label: _("Messages").t()});

                MenuView.prototype.initialize.apply(this, arguments);

                this.collection.messages.on('change reset remove', this.updateNotification, this);
                this.model.userPref.on('change', this.updateNotification, this);

                if (this.collection.legacyMessages) {
                    this.collection.legacyMessages.on('reset remove', this.updateNotification, this);
                }
            },
            updateNotification: function() {
                var messagesCount = (this.collection.messages.length || 0) + (this.collection.numLegacyMessages || 0),
                    splunkMessageCount = this.options.contentView.numSplunkMessages || 0;

                messagesCount = messagesCount + splunkMessageCount;
                if(this.$('[data-popdown-role=dialog]').is(':visible')) {
                    this.children.popdown.adjustPosition();
                }
                this.children.toggle.set({badgeLabel: messagesCount || false });
            }
        });
    }
);
