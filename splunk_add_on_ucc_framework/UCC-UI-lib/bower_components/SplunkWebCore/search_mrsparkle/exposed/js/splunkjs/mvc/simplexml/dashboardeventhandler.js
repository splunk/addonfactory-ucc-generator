define(['underscore', './eventhandler'], function(_, EventHandler) {
    return EventHandler.extend({
        startListenToDashboard: function(dashboard, event) {
            this._dashboard = dashboard;
            this.listenTo(this._dashboard, "dashboard:" + event, this.handleEvent);
        },

        stopListenToDashboard: function() {
            if (this._dashboard) {
                this.stopListening(this._dashboard);
            }
        },

        onComponentChange: function(components, dashboard) {
            this.stopListenToDashboard();
            this.startListenToDashboard(dashboard, this.settings.get('event'));
        }
    });
});