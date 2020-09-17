define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");
    var TitleView = require("views/authentication_users/tiles/Title");
    var UserFormView = require("views/authentication_users/tiles/UserForm");
    var UserTileListView = require("views/authentication_users/tiles/UserTileList");

    return BaseView.extend({

        moduleId: module.id,

        events: {
            "click .authenticationusers-tiles-usertile": function(e) {
                e.preventDefault();

                var username = $(e.currentTarget).attr("data-username");
                if (username === this.currentSelectedUser) {
                    return;
                }

                if (username) {
                    this.showUserForm(username);
                }
            },
            "click .authenticationusers-tiles-emptytile": function(e) {
                e.preventDefault();

                this.showUserForm();
            },
            "click .authenticationusers-tiles-title .add-new": function(e) {
                e.preventDefault();

                this.showUserForm();
            }
        },

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.title = new TitleView({
                model: {
                    user: this.model.user,
                    serverInfo: this.model.serverInfo
                },
                collection: {
                    users: this.collection.users
                }
            });

            this.children.userTileList = new UserTileListView({
                model: {
                    user: this.model.user,
                    serverInfo: this.model.serverInfo
                },
                collection: {
                    users: this.collection.users
                }
            });

            this.activate();
        },

        startListening: function() {
            this.listenTo(this.collection.users, "reset add remove", this.debouncedRender);
        },

        render: function() {
            this.children.title.render().appendTo(this.$el);
            this.children.userTileList.render().appendTo(this.$el);

            if (!this._userFormFirstShow) {
                var username = this.model.user.entry.get("name");
                if (username) {
                    this.showUserForm(username);
                }
            } else if (this.children.userForm) {
                this.children.userForm.render().appendTo(this.$el);
            }

            return this;
        },

        showUserForm: function(username) {
            // TODO: implement confirmation to save if form has changed

            // only admins can create new users
            if (!username && !this.model.user.canEditUsers()) {
                return;
            }

            this.hideUserForm();

            var userEdit = null;
            if (username) {
                userEdit = this.collection.users.find(function(user) {
                    return (user.entry.get("name") === username);
                });
                if (!userEdit) {
                    return;
                }

                this.currentSelectedUser = username;
                $('.tile-list-container div').not('.highlighter')
                    .filter('[data-username="'+ username +'"]')
                    .addClass('active');
            }

            this._userFormFirstShow = true;

            this.children.userForm = new UserFormView({
                model: {
                    user: this.model.user,
                    userEdit: userEdit
                },
                collection: {
                    users: this.collection.users
                }
            });
            this.children.userForm.on("saved deleted cancelled", this.hideUserForm, this);
            this.children.userForm.render().appendTo(this.$el);

            this.children.userTileList.highlightUser(username);
        },

        hideUserForm: function() {
            if (this.children.userForm) {
                this.children.userTileList.unhighlightUser();
                this.children.userForm.remove();
                this.children.userForm = null;
                this.currentSelectedUser = null;
                $('.tile-list-container div').not('.highlighter').removeClass('active');
            }
        }

    });

});
