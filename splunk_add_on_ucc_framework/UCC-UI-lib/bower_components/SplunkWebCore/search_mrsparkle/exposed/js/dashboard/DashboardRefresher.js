define(['underscore', 'backbone'], function(_, Backbone) {
    var DashboardRefresher = function () {
        this.refreshInterval = null;
        this.managers = [];
        this.autoRefresh = null;
    };

    _.extend(DashboardRefresher.prototype, Backbone.Events, {
        setup: function(refreshInterval, managers) {
            this.refreshInterval = refreshInterval;
            this.managers = managers;
            this.refresh();
        },
        refresh: function() {
            this.autoRefresh = setInterval(function() {
                _(this.managers).chain()
                    .filter(function(mgr) {
                        return _.isFunction(mgr['startSearch']);
                    })
                    .invoke('startSearch', {refresh: true});
            }.bind(this), this.refreshInterval * 1000);
        },
        teardown: function() {
            this.autoRefresh && clearInterval(this.autoRefresh);
            //set the refresher id to null
            this.autoRefresh = null;
        }
    });

    return new DashboardRefresher();
});
