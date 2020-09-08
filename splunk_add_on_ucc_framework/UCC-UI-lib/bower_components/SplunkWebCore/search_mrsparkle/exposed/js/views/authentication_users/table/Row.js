define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var SplunkUtil = require("splunk.util");
    var BaseView = require("views/Base");
    var TextDialog = require("views/shared/dialogs/TextDialog");

    var template = require("contrib/text!views/authentication_users/table/Row.html");

    return BaseView.extend({

        moduleId: module.id,
        tagName: "tr",
        template: template,

        events: {
            "click .btn-delete": function(e) {
                e.preventDefault();

                var deleteDialog = new TextDialog({ id: "modal_delete" });
                deleteDialog.settings.set("primaryButtonLabel", _("Delete").t());
                deleteDialog.settings.set("cancelButtonLabel", _("Cancel").t());
                deleteDialog.settings.set("titleLabel", _("Delete User").t());
                deleteDialog.setText(SplunkUtil.sprintf(_("Are you sure you want to delete user %s?").t(),
                    "<em>" + _.escape(this.model.rowModel.entry.get("name")) + "</em>"));
                deleteDialog.on("click:primaryButton", function() {
                    this.model.rowModel.destroy({
                        wait: true,
                        success: function(model, response, options) {
                            deleteDialog.hide();
                        },
                        error: function(model, response, options) {
                            deleteDialog.hide();
                            // TODO: display error
                        }
                    });
                }, this);
                deleteDialog.on("hidden", function() {
                    deleteDialog.remove();
                }, this);
                deleteDialog.render().appendTo($("body"));
                deleteDialog.show();
            }
        },

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            this.model.rowModel.entry.acl.on("change", this.debouncedRender, this);
            this.model.rowModel.entry.content.on("change", this.debouncedRender, this);
        },

        render: function() {
            var rowModel = this.model.rowModel;
            var entry = rowModel.entry;
            var content = entry.content;

            var id = rowModel.get("id");
            var username = entry.get("name");
            var auth = content.get("type") || "";
            var fullname = content.get("realname") || "";
            var email = content.get("email") || "";
            var timeZone = content.get("tz") || _("None").t();
            var defaultApp = content.get("defaultApp") || "";
            var inheritedApp = !content.get("defaultAppIsUserOverride") ? (content.get("defaultAppSourceRole") || "") : "";
            var roles = content.get("roles");
            roles = roles ? roles.join(", ") : "";

            var application = this.model.application;
            var app = application.get("app");
            var editURL = SplunkUtil.make_url("manager/" + app + "/authentication/users/" + username + "?uri=" + encodeURIComponent(id) + "&action=edit");
            var cloneURL = SplunkUtil.make_url("manager/" + app + "/authentication/users/_new?uri=" + encodeURIComponent(id) + "&action=edit");

            var showDelete = (username !== this.model.user.entry.get("name"));

            var html = this.compiledTemplate({
                _: _,
                username: username,
                auth: auth,
                fullname: fullname,
                email: email,
                timeZone: timeZone,
                defaultApp: defaultApp,
                inheritedApp: inheritedApp,
                roles: roles,
                editURL: editURL,
                cloneURL: cloneURL,
                showDelete: showDelete
            });

            this.$el.html(html);

            return this;
        }

    });

});
