define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");
    var DashboardTile = require("views/dashboards/tiles/DashboardTile");
    var EmptyTile = require("views/dashboards/tiles/EmptyTile");

    return BaseView.extend({

        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.tiles = [];

            this.activate();
        },

        startListening: function() {
            this.listenTo(this.collection.dashboards, "reset add remove", this.debouncedRender);
        },

        render: function() {
            // destroy old tiles
            _(this.children.tiles).each(function(tile) {
                tile.remove();
            }, this);

            // create tiles for each dashboard
            this.children.tiles = this.collection.dashboards.map(function(dashboard) {
                return new DashboardTile({
                    model: {
                        state: this.model.state,
                        application: this.model.application,
                        uiPrefs: this.model.uiPrefs,
                        userPref: this.model.userPref,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo,
                        dashboard: dashboard,
                        infoDeliveryUIControl: this.model.infoDeliveryUIControl
                    },
                    collection: {
                        dashboards: this.collection.dashboards,
                        roles: this.collection.roles,
                        appLocalsUnfiltered: this.collection.appLocalsUnfiltered
                    }
                });
            }, this);

            // create empty tile for adding new dashboard
            this.children.tiles.push(new EmptyTile({}));

            // render tiles
            _(this.children.tiles).each(function(tile) {
                tile.render().appendTo(this.$el);
            }, this);

            return this;
        }

    });

});