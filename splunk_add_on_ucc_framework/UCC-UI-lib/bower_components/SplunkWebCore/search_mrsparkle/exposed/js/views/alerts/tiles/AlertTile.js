define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var VizIcons = require("svg/VizIcons");
    var Route = require("uri/route");
    var BaseView = require("views/Base");
    var EditMenu = require("views/shared/alertcontrols/EditMenu");

    var template = require("contrib/text!views/alerts/tiles/AlertTile.html");

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
            }
        },

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this._showActions = false;

            this.children.editmenu = new EditMenu({
                model: {
                    savedAlert: this.model.savedAlert,
                    application: this.model.application,
                    appLocal: this.model.appLocal,
                    user: this.model.user,
                    serverInfo: this.model.serverInfo
                },
                collection: {
                    roles: this.collection.roles,
                    alertActions: this.collection.alertActions
                },
                button: false,
                gear: true,
                showOpenActions: false
            });

            this.activate();
        },

        startListening: function() {
            this.listenTo(this.model.savedAlert, "change", this.debouncedRender);
            this.listenTo(this.model.savedAlert, "updateCollection", function() {
                this.model.state.trigger("change:search");
            });
        },

        render: function() {
            var application = this.model.application;
            var savedAlert = this.model.savedAlert;
            var name = savedAlert.entry.get("name") || "";
            var icon = VizIcons.getReportIcon(savedAlert) || "";
            var app = (application.get("app") === "system") ? savedAlert.entry.acl.get("app") : application.get("app");
            var alertLink = Route.alert(application.get("root"), application.get("locale"), app, { data: { s: savedAlert.id } });
            var searchLink = Route.search(application.get("root"), application.get("locale"), app, { data: { s: savedAlert.id } });

            if (!this.el.innerHTML) {
                this.$el.html(this.compiledTemplate({
                    name: name,
                    icon: icon,
                    alertLink: alertLink,
                    searchLink: searchLink
                }));
            }

            this.children.editmenu.render().appendTo(this.$('.action-edit'));

            this._toggleActions();

            return this;
        },

        _toggleActions: function() {
            // hacky as hell since we don't have direct access to the menu state and events
            var isEditMenuShown = this.children.editmenu &&
                                  this.children.editmenu.children.popdown &&
                                  this.children.editmenu.children.popdown.children.delegate &&
                                  this.children.editmenu.children.popdown.children.delegate.isShown;
            if (isEditMenuShown) {
                // must try removing listener first, since backbone event system apparently doesn't handle dupes
                this.children.editmenu.children.popdown.off("hidden", this._toggleActions, this);
                this.children.editmenu.children.popdown.on("hidden", this._toggleActions, this);
            }

            if (this._showActions || isEditMenuShown) {
                this.$(".tile-actions").show();
            } else {
                this.$(".tile-actions").hide();
            }
        }

    });

});
