define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");
    var ReportTileList = require("views/reports/tiles/ReportTileList");

    return BaseView.extend({

        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.reportTileList = new ReportTileList({
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
                    reports: this.collection.reports,
                    roles: this.collection.roles
                }
            });

            this.activate();
        },

        render: function() {
            this.children.reportTileList.render().appendTo(this.$el);
            return this;
        }

    });

});
