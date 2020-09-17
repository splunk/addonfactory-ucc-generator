define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");
    var AlertTileList = require("views/alerts/tiles/AlertTileList");

    return BaseView.extend({

        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.alertTileList = new AlertTileList({
                model: {
                    state: this.model.state,
                    application: this.model.application,
                    uiPrefs: this.model.uiPrefs,
                    userPref: this.model.userPref,
                    user: this.model.user,
                    appLocal: this.model.appLocal,
                    serverInfo: this.model.serverInfo
                },
                collection: {
                    savedAlerts: this.collection.savedAlerts,
                    roles: this.collection.roles,
                    alertActions: this.collection.alertActions
                }
            });

            this.activate();
        },

        render: function() {
            this.children.alertTileList.render().appendTo(this.$el);
            return this;
        }

    });

});
