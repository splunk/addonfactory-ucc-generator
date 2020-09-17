define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var SplunkUtil = require("splunk.util");
    var UserModel = require("models/services/authentication/User");
    var BaseView = require("views/Base");
    var FlashMessages = require("views/shared/FlashMessages");
    var SyntheticRadioControl = require("views/shared/controls/SyntheticRadioControl");
    var TextControl = require("views/shared/controls/TextControl");
    var TimeZoneControl = require("views/shared/controls/TimeZone");
    var TextDialog = require("views/shared/dialogs/TextDialog");

    var template = require("contrib/text!views/authentication_users/tiles/UserForm.html");

    return BaseView.extend({

        moduleId: module.id,
        template: template,

        events: {
            "click .detail-save": function(e) {
                if (this.model.userEdit) {
                    this.saveUser();
                } else {
                    this.createUser();
                }
            },
            "click .detail-delete": function(e) {
                this.deleteUser();
            },
            "click .detail-cancel": function(e) {
                this.cancel();
            }
        },

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            if (this.model.userEdit) {
                var roles = this.model.userEdit.entry.content.get("roles");
                this._workingModel = new Backbone.Model({
                    "role": ((_.indexOf(roles, "admin") >= 0) || (_.indexOf(roles, "sc_admin") >= 0)) ? "admin" : "user",
                    "can_delete": (_.indexOf(roles, "can_delete") >= 0),
                    "email": this.model.userEdit.entry.content.get("email"),
                    "realname": this.model.userEdit.entry.content.get("realname"),
                    "tz": this.model.userEdit.entry.content.get("tz")
                });
            } else {
                this._workingModel = new Backbone.Model({
                    "role": "user",
                    "can_delete": false
                });
            }

            this.children.rolesInput = new SyntheticRadioControl({
                model: this._workingModel,
                modelAttribute: "role",
                items: [
                    { label: _("Admin").t(), value: "admin" },
                    { label: _("User").t(), value: "user" }
                ]
            });

            if (!this.model.userEdit) {
                this.children.usernameInput = new TextControl({
                    model: this._workingModel,
                    modelAttribute: "name"
                });
            }

            this.children.canDeleteInput = new SyntheticRadioControl({
                model: this._workingModel,
                modelAttribute: "can_delete",
                items: [
                    { label: _("Yes").t(), value: true },
                    { label: _("No").t(), value: false }
                ]
            });

            this.children.emailInput = new TextControl({
                model: this._workingModel,
                modelAttribute: "email",
                placeholder: !this.model.userEdit ? _("name@example.com").t() : ""
            });

            this.children.passwordInput = new TextControl({
                model: this._workingModel,
                modelAttribute: "password",
                placeholder: this.model.userEdit ? _("Change password").t() : "",
                password: true,
                updateOnKeyUp: true
            });
            this.children.passwordInput.on("change", this._toggleConfirmPassword, this);

            this.children.confirmPasswordInput = new TextControl({
                model: this._workingModel,
                modelAttribute: "confirmPassword",
                password: true
            });

            this.children.fullnameInput = new TextControl({
                model: this._workingModel,
                modelAttribute: "realname"
            });

            this.children.timezoneInput = new TimeZoneControl({
                model: this._workingModel,
                modelAttribute: "tz",
                showDefaultLabel: false
            });
        },

        render: function() {
            if (!this.el.innerHTML) {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    username: this.model.userEdit ? this.model.userEdit.entry.get("name") : "",
                    canEditUsers: this.model.user.canEditUsers(),
                    isSplunkAuth: this.model.userEdit ? (this.model.userEdit.entry.content.get("type") === "Splunk") : false,
                    isSelf: this.model.userEdit ? (this.model.user.entry.get("name") === this.model.userEdit.entry.get("name")) : false,
                    isNew: (this.model.userEdit == null)
                }));
            }

            this.children.rolesInput.render().appendTo(this.$("tr.detail-pair-roles td.detail-value"));
            if (this.children.usernameInput) {
                this.children.usernameInput.render().appendTo(this.$("tr.detail-pair-username td.detail-value"));
            }
            this.children.canDeleteInput.render().appendTo(this.$("tr.detail-pair-candelete td.detail-value"));
            this.children.emailInput.render().appendTo(this.$("tr.detail-pair-email td.detail-value"));
            this.children.passwordInput.render().appendTo(this.$("tr.detail-pair-password td.detail-value"));
            this.children.confirmPasswordInput.render().appendTo(this.$("tr.detail-pair-confirmpassword td.detail-value"));
            this.children.fullnameInput.render().appendTo(this.$("tr.detail-pair-fullname td.detail-value"));
            this.children.timezoneInput.render().appendTo(this.$("tr.detail-pair-timezone td.detail-value"));

            // disable rolesInput if not admin or editing self and making label rather than switch
            if (!this.model.user.canEditUsers() || (this.model.userEdit && (this.model.user.entry.get("name") === this.model.userEdit.entry.get("name")))) {
                var role = this._workingModel.get('role') || 'N/A';
                this.$("tr.detail-pair-roles td.detail-value").html(role.charAt(0).toUpperCase() + role.substring(1));
            }

            // disable canDeleteInput if not admin
            if (!this.model.user.isAdmin() && !this.model.user.isCloudAdmin()) {
                this.children.canDeleteInput.disable();
            }

            // disable inputs and hide password, if not using "Splunk" authentication
            if (this.model.userEdit && (this.model.userEdit.entry.content.get("type") !== "Splunk")) {
                this.children.rolesInput.disable();
                this.children.canDeleteInput.disable();
                this.children.emailInput.disable();
                this.children.passwordInput.disable();
                this.children.confirmPasswordInput.disable();
                this.children.fullnameInput.disable();
                this.$("tr.detail-pair-password").hide();
            }

            this._toggleConfirmPassword();

            return this;
        },

        saveUser: function() {
            // ignore if not editing user
            if (!this.model.userEdit) {
                return;
            }

            var self = this;
            var attributes = _(this._workingModel.attributes).clone();
            var password = attributes["password"];
            var confirmPassword = attributes["confirmPassword"];

            // merge role and can_delete into roles list
            var roles = attributes["roles"] = [];
            roles.push(attributes["role"]);
            if (attributes["can_delete"]) {
                roles.push("can_delete");
            }
            delete attributes["role"];
            delete attributes["can_delete"];

            // delete empty password
            if (!password) {
                delete attributes["password"];
            }

            // delete confirmPassword (not part of remote storage, just for local validation)
            delete attributes["confirmPassword"];

            // validate confirm password
            if (password && (password !== confirmPassword)) {
                this.model.userEdit.error.set("messages", [{ type: "error", message: _("Passwords don't match").t() }]);
                this._showError(this.model.userEdit);
                return;
            }

            // save attributes to userEdit model
            this.model.userEdit.save(attributes, {
                patch: true,
                wait: true,
                success: function(model, response, options) {
                    self.trigger("saved");
                },
                error: function(model, response, options) {
                    self._showError(model);
                }
            });
        },

        createUser: function() {
            // ignore if editing user
            if (this.model.userEdit) {
                return;
            }

            var self = this;
            var attributes = _(this._workingModel.attributes).clone();
            var username = attributes["name"];
            var password = attributes["password"];
            var confirmPassword = attributes["confirmPassword"];

            // merge role and can_delete into roles list
            var roles = attributes["roles"] = [];
            roles.push(attributes["role"]);
            if (attributes["can_delete"]) {
                roles.push("can_delete");
            }
            delete attributes["role"];
            delete attributes["can_delete"];

            // delete empty password
            if (!password) {
                delete attributes["password"];
            }

            // delete confirmPassword (not part of remote storage, just for local validation)
            delete attributes["confirmPassword"];

            // create newUser model with above attributes
            var newUser = new UserModel();
            newUser.entry.content.set(attributes);

            // validate username
            if (!username) {
                newUser.error.set("messages", [{ type: "error", message: _("Username required").t() }]);
                this._showError(newUser);
                return;
            }

            // validate password
            if (!password) {
                newUser.error.set("messages", [{ type: "error", message: _("Password required").t() }]);
                this._showError(newUser);
                return;
            }

            // validate confirm password
            if (password !== confirmPassword) {
                newUser.error.set("messages", [{ type: "error", message: _("Passwords don't match").t() }]);
                this._showError(newUser);
                return;
            }

            // save newUser model in users collection
            this.collection.users.create(newUser, {
                wait: true,
                success: function(model, response, options) {
                    self.trigger("saved");
                },
                error: function(model, response, options) {
                    self._showError(model);
                }
            });
        },

        deleteUser: function() {
            // ignore if not editing user
            if (!this.model.userEdit) {
                return;
            }

            var self = this;
            var deleteDialog = new TextDialog({ id: "modal_delete" });
            deleteDialog.settings.set("primaryButtonLabel", _("Delete").t());
            deleteDialog.settings.set("cancelButtonLabel", _("Cancel").t());
            deleteDialog.settings.set("titleLabel", _("Delete User").t());
            deleteDialog.setText(SplunkUtil.sprintf(_("Are you sure you want to delete user %s?").t(),
                "<em>" + _.escape(this.model.userEdit.entry.get("name")) + "</em>"));
            deleteDialog.on("click:primaryButton", function() {
                self.model.userEdit.destroy({
                    wait: true,
                    success: function(model, response, options) {
                        deleteDialog.hide();
                        self.trigger("deleted");
                    },
                    error: function(model, response, options) {
                        deleteDialog.hide();
                        self._showError(model);
                    }
                });
            }, this);
            deleteDialog.on("hidden", function() {
                deleteDialog.remove();
            }, this);
            deleteDialog.render().appendTo($("body"));
            deleteDialog.show();
        },

        cancel: function() {
            this.trigger("cancelled");
        },

        _toggleConfirmPassword: function() {
            var password = this.children.passwordInput.getValue();
            if (!password && this.model.userEdit) {
                // hide confirm password row
                // using visibility:hidden instead of display:none so table doesn't resize when row is toggled
                // appending to end of table to create the illusion that the row is actually collapsed
                this.$("tr.detail-pair-confirmpassword")
                    .css({ visibility: "hidden" })
                    .appendTo(this.$("table.detail-table tbody"));
                // clear input value
                this.children.confirmPasswordInput.setValue("");
            } else {
                // show confirm password row
                // clearing visibility:hidden and restoring position in table to after password row
                this.$("tr.detail-pair-confirmpassword")
                    .css({ visibility: "" })
                    .insertAfter(this.$("tr.detail-pair-password"));
            }
        },

        _showError: function(model) {
            if (this.children.flashMessages) {
                this.children.flashMessages.remove();
            }
            this.children.flashMessages = new FlashMessages({ model: model });
            this.children.flashMessages.render().appendTo(this.$(".detail-messages"));
        }

    });

});
