define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");
    var AddDashboardDialog = require("views/dashboards/AddDashboard");
    var DashboardTileList = require("views/dashboards/tiles/DashboardTileList");

    return BaseView.extend({

        moduleId: module.id,

        events: {
            "click .dashboards-tiles-emptytile": function(e) {
                e.preventDefault();

                new AddDashboardDialog({
                    model: {
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection.dashboards,
                    onHiddenRemove: true
                }).render().show();
            }
        },

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.dashboardTileList = new DashboardTileList({
                model: {
                    state: this.model.state,
                    application: this.model.application,
                    uiPrefs: this.model.uiPrefs,
                    userPref: this.model.userPref,
                    user: this.model.user,
                    appLocal: this.model.appLocal,
                    serverInfo: this.model.serverInfo,
                    infoDeliveryUIControl: this.model.infoDeliveryUIControl
                },
                collection: {
                    dashboards: this.collection.dashboards,
                    roles: this.collection.roles,
                    appLocalsUnfiltered: this.collection.appLocalsUnfiltered
                }
            });

            this.activate();
        },

        render: function() {
            this.children.dashboardTileList.render().appendTo(this.$el);
            return this;
        }

    });

});