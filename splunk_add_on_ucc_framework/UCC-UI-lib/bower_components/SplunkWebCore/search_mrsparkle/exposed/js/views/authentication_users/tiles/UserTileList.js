define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");
    var EmptyTile = require("views/authentication_users/tiles/EmptyTile");
    var ScrollButton = require("views/authentication_users/tiles/ScrollButton");
    var UserTile = require("views/authentication_users/tiles/UserTile");

    var template = require("contrib/text!views/authentication_users/tiles/UserTileList.html");

    return BaseView.extend({

        moduleId: module.id,
        template: template,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.scrollButtonLeft = new ScrollButton({ direction: "left" });
            this.children.scrollButtonLeft.on("scroll", this.scrollLeft, this);

            this.children.scrollButtonRight = new ScrollButton({ direction: "right" });
            this.children.scrollButtonRight.on("scroll", this.scrollRight, this);

            this.children.tiles = [];

            this.activate();
        },

        startListening: function() {
            this.listenTo(this.collection.users, "reset add remove", this.debouncedRender);
        },

        render: function() {
            if (!this.el.innerHTML) {
                this.$el.html(this.compiledTemplate({}));
                this.children.scrollButtonLeft.render().appendTo(this.$el);
                this.children.scrollButtonRight.render().appendTo(this.$el);
            }

            // destroy old tiles
            _(this.children.tiles).each(function(tile) {
                tile.remove();
            }, this);

            // create tiles for each user, count how many are using "Splunk" authentication
            var numUsers = 0;
            this.children.tiles = this.collection.users.map(function(user) {
                if (user.entry.content.get("type") === "Splunk") {
                    numUsers++;
                }
                return new UserTile({
                    model: {
                        user: user
                    }
                });
            }, this);

            // create empty tile if admin, using "Splunk" authentication, and less than maxUsers
            var maxUsers = this.model.serverInfo.entry.content.get("max_users");
            if (this.model.user.canEditUsers() && (this.model.user.entry.content.get("type") === "Splunk") && (numUsers < maxUsers)) {
                this.children.tiles.push(new EmptyTile({}));
            }

            // render tiles
            var container = this.$(".tile-list-container");
            _(this.children.tiles).each(function(tile) {
                tile.render().appendTo(container);
            }, this);

            // render highlighter if needed
            if (this._highlighter) {
                this.highlightUser(this._highlighterUsername);
            }

            this._updateScrollButtons();

            return this;
        },

        highlightUser: function(username) {
            this.unhighlightUser();

            var highlightIndex = -1;
            if (username) {
                this.collection.users.find(function(user, index) {
                    if (user.entry.get("name") === username) {
                        highlightIndex = index;
                        return true;
                    }
                });
            } else {
                highlightIndex = this.children.tiles.length - 1;
            }

            if (highlightIndex < 0) {
                return;
            }

            var tileWidth = 180;
            var tileLeft = tileWidth * highlightIndex;

            this._highlighterUsername = username;
            this._highlighter = $("<div></div>")
                .addClass("highlighter")
                .css({ left: tileLeft + "px" })
                .appendTo(this.$(".tile-list-container"));

            var container = this.$(".tile-list-container");
            container.scrollLeft(Math.max(Math.min(container.scrollLeft(), tileLeft), tileLeft + tileWidth - container.width()));
            this._updateScrollButtons();
        },

        unhighlightUser: function() {
            if (this._highlighter) {
                this._highlighter.remove();
                this._highlighter = null;
                this._highlighterUsername = null;
            }
        },

        scrollLeft: function() {
            var container = this.$(".tile-list-container");
            container.scrollLeft(container.scrollLeft() - 10);
            this._updateScrollButtons();
        },

        scrollRight: function() {
            var container = this.$(".tile-list-container");
            container.scrollLeft(container.scrollLeft() + 10);
            this._updateScrollButtons();
        },

        _updateScrollButtons: function() {
            var container = this.$(".tile-list-container");
            var scrollLeft = container.scrollLeft();
            var scrollMax = container[0].scrollWidth - container.width();

            if (scrollLeft > 0) {
                this.children.scrollButtonLeft.$el.show();
            } else {
                this.children.scrollButtonLeft.$el.hide();
            }

            if (scrollLeft < scrollMax) {
                this.children.scrollButtonRight.$el.show();
            } else {
                this.children.scrollButtonRight.$el.hide();
            }
        }

    });

});
