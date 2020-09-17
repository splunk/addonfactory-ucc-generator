define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var Route = require("uri/route");
    var BaseView = require("views/Base");
    var EditMenu = require("views/dashboards/table/controls/EditMenu");
    var ScheduledView = require("models/services/ScheduledView");

    var template = require("contrib/text!views/dashboards/tiles/DashboardTile.html");

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

                var scheduledView = new ScheduledView();
                this.children.editmenu = new EditMenu({
                    model: {
                        state: this.model.state,
                        application: this.model.application,
                        uiPrefs: this.model.uiPrefs,
                        userPref: this.model.userPref,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo,
                        dashboard: this.model.dashboard,
                        scheduledView: scheduledView,
                        infoDeliveryUIControl: this.model.infoDeliveryUIControl
                    },
                    collection: {
                        dashboards: this.collection.dashboards,
                        roles: this.collection.roles,
                        appLocalsUnfiltered: this.collection.appLocalsUnfiltered
                    },
                    mode: "menu"
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
            this.listenTo(this.model.dashboard, "change", this.debouncedRender);
            this.listenTo(this.model.dashboard, "updateCollection", function() {
                this.model.state.trigger("change:search");
            });
        },

        render: function() {
            var application = this.model.application;
            var dashboard = this.model.dashboard;
            var name = dashboard.entry.content.get("label") || dashboard.entry.get("name") || "";
            var link = Route.page(application.get("root"), application.get("locale"), dashboard.entry.acl.get("app"), dashboard.entry.get("name"));

            this.$el.html(this.compiledTemplate({
                name: name,
                link: link
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