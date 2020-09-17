define([
    'jquery',
    'underscore',
    'module',
    'views/dashboard/Base',
    'uri/route',
    './DashboardMessage',
    './DashboardMessages.pcss'
], function($, _, module, BaseDashboardView, route, DashboardMessage) {

    return BaseDashboardView.extend({
        moduleId: module.id,
        className: 'dashboard-messages',
        initialize: function() {
            BaseDashboardView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.state, 'change', this.render);
            this.listenTo(this.collection.dashboardMessages, 'add reset remove change', this.render);
        },
        buildMessage: function(message) {
            return new DashboardMessage({
                model: {
                    message: message,
                    application: this.model.application
                }
            });
        },
        render: function() {
            this.$el.empty();
            var curMode = this.model.state.get('mode');
            var messages = this.collection.dashboardMessages.filter(function(message) {
                return message.has('mode') && message.get('mode') != curMode ? false
                    : !message.get('dismissed');

            });
            var $messages = _(messages).chain()
                .map(this.buildMessage, this)
                .invoke('render')
                .pluck('el')
                .value();
            this.$el.append($messages)[messages.length ? 'show' : 'hide']();
            return this;
        }
    });

});