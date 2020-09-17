define(['underscore', 'backbone'], function(_, Backbone) {

    function ElementAutoRefresh() {
        this.initialize.apply(this, arguments);
    }

    _.extend(ElementAutoRefresh.prototype, Backbone.Events, {
        initialize: function(settings, manager) {
            this.settings = settings;
            this.manager = manager;
            this.listenTo(settings, 'change:refresh.auto.interval', this.refreshAfterTimeout);
            this.listenTo(manager, 'search:done');
            this.refreshAfterTimeout();
        },
        clearTimer: function() {
            clearTimeout(this.timer);
        },
        refreshAfterTimeout: function() {
            this.clearTimer();
            var interval = parseInt(this.settings.get('refresh.auto.interval'), 10);
            if (_.isNumber(interval) && !_.isNaN(interval) && interval > 0) {
                this.timer = setTimeout(this.refresh.bind(this), interval * 1000);
            }
        },
        refresh: function() {
            this.manager.startSearch('refresh');
            this.refreshAfterTimeout();
        },
        dispose: function() {
            this.stopListening();
            this.clearTimer();
        }
    });

    return ElementAutoRefresh;
});