define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");
    var AlertTile = require("views/alerts/tiles/AlertTile");

    return BaseView.extend({

        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.tiles = [];

            this.activate();
        },

        startListening: function() {
            this.listenTo(this.collection.savedAlerts, "reset add remove", this.debouncedRender);
        },

        render: function() {
            // destroy old tiles
            _(this.children.tiles).each(function(tile) {
                tile.remove();
            }, this);

            // create tiles for each savedAlert
            this.children.tiles = this.collection.savedAlerts.map(function(savedAlert) {
                return new AlertTile({
                    model: {
                        state: this.model.state,
                        application: this.model.application,
                        uiPrefs: this.model.uiPrefs,
                        userPref: this.model.userPref,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo,
                        savedAlert: savedAlert
                    },
                    collection: {
                        savedAlerts: this.collection.savedAlerts,
                        roles: this.collection.roles,
                        alertActions: this.collection.alertActions
                    }
                });
            }, this);

            // render tiles
            _(this.children.tiles).each(function(tile) {
                tile.render().appendTo(this.$el);
            }, this);

            return this;
        }

    });

});
