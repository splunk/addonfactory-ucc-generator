define([
    "module",
    "underscore",
    "jquery",
    "backbone",
    "views/Base",
    "../header/DashboardMessage",
    "uri/route"
], function(module,
            _,
            $,
            Backbone,
            BaseView,
            DashboardMessage,
            route) {

    return BaseView.extend({
        moduleId: module.id,
        className: 'xml-editor-message',
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            if (this.collection.dashboardMessages) {
                this.listenTo(this.collection.dashboardMessages, 'add reset change', this.render);
            }
            this.listenTo(this.model.message, 'change', this.render);
        },
        getActiveMessage: function() {
            // Select the single message we want to render
            var message = this.model.message;
            if (this.collection.dashboardMessages) {
                var globalMessage = this.collection.dashboardMessages.find(function(msg) {
                    return msg.get('level') == 'error' && !msg.get('dismissed');
                });
                if (globalMessage) {
                    message = globalMessage;
                }
            }
            return message;
        },
        render: function() {
            var message = this.getActiveMessage();
            if (this.children.message) {
                this.children.message.remove();
            }

            if (message && message.get('text')) {
                this.children.message = new DashboardMessage({
                    model: {
                        message: message,
                        application: this.model.application
                    }
                });
                this.children.message.render().appendTo(this.el);
            }
            return this;
        }
    });

});