define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");
    var ReportTile = require("views/reports/tiles/ReportTile");

    return BaseView.extend({

        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.tiles = [];

            this.activate();
        },

        startListening: function() {
            this.listenTo(this.collection.reports, "reset add remove", this.debouncedRender);
        },

        render: function() {
            // destroy old tiles
            _(this.children.tiles).each(function(tile) {
                tile.remove();
            }, this);

            // create tiles for each report
            this.children.tiles = this.collection.reports.map(function(report) {
                return new ReportTile({
                    model: {
                        state: this.model.state,
                        application: this.model.application,
                        uiPrefs: this.model.uiPrefs,
                        userPref: this.model.userPref,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo,
                        report: report
                    },
                    collection: {
                        reports: this.collection.reports,
                        roles: this.collection.roles
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
