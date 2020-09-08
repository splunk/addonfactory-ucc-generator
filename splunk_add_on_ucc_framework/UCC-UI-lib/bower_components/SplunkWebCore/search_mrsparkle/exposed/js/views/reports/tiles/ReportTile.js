define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var VizIcons = require("svg/VizIcons");
    var Route = require("uri/route");
    var BaseView = require("views/Base");
    var EditMenu = require("views/shared/reportcontrols/editmenu/Menu");

    var template = require("contrib/text!views/reports/tiles/ReportTile.html");

    return BaseView.extend({

        moduleId: module.id,
        template: template,

        events: {
            "mouseenter": function(e) {
                this._showActions = true;
                this._toggleActions();
            },
            "mouseleave": function(e) {
                this._showActions = false;
                this._toggleActions();
            },
            "mousedown .action-edit": function(e) {
                e.preventDefault();

                var $target = $(e.currentTarget);
                if (this.children.editmenu && this.children.editmenu.shown) {
                    this.children.editmenu.hide();
                    return;
                }

                this.children.editmenu = new EditMenu({
                    model: {
                        report: this.model.report,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection.roles,
                    showOpenActions: false,
                    onHiddenRemove: true
                });
                this.children.editmenu.on("hidden", this._toggleActions, this);
                this.children.editmenu.render().appendTo($("body"));
                this.children.editmenu.show($target);
            },
            "click .action-edit": function(e) {
                e.preventDefault();
            }
        },

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this._showActions = false;

            this.activate();
        },

        startListening: function() {
            this.listenTo(this.model.report, "change", this.debouncedRender);
            this.listenTo(this.model.report, "updateCollection", function() {
                this.model.state.trigger("change:search");
            });
        },

        render: function() {
            var application = this.model.application;
            var report = this.model.report;
            var user = this.model.user;
            var name = report.entry.get("name") || "";
            var icon = VizIcons.getReportIcon(report) || "";
            var app = (application.get("app") === "system") ? report.entry.acl.get("app") : application.get("app");
            var reportLink = Route.report(application.get("root"), application.get("locale"), app, { data: { s: report.id } });
            var searchLink = Route.search(application.get("root"), application.get("locale"), app, { data: { s: report.id } });

            var canWrite = report.canWrite(user.canScheduleSearch(), user.canRTSearch()),
            canClone = report.canClone(user.canScheduleSearch(), user.canRTSearch()),
            canEmbed = report.canEmbed(user.canScheduleSearch(), user.canEmbed()),
            canDelete = report.canDelete(),
            showGear = false;

            if (canWrite || canClone || canEmbed || canDelete) {
                showGear = true;
            }
        
            this.$el.html(this.compiledTemplate({
                name: name,
                icon: icon,
                showGear: showGear,
                reportLink: reportLink,
                searchLink: searchLink
            }));

            this._toggleActions();

            return this;
        },

        _toggleActions: function() {
            if (this._showActions || (this.children.editmenu && this.children.editmenu.shown)) {
                this.$(".tile-actions").show();
            } else {
                this.$(".tile-actions").hide();
            }
        }

    });

});
