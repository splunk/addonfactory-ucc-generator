define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");

    var template = require("contrib/text!views/authentication_users/tiles/UserTile.html");

    return BaseView.extend({

        moduleId: module.id,
        template: template,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.activate();
        },

        startListening: function() {
            this.listenTo(this.model.user, "change", this.debouncedRender);
        },

        render: function() {
            var user = this.model.user;
            var username = user.entry.get("name");
            var fullname = user.entry.content.get("realname") || username || "";
            var initials = this._extractInitials(fullname);

            this.$el.attr("data-username", username);

            this.$el.html(this.compiledTemplate({
                fullname: fullname,
                initials: initials
            }));

            return this;
        },

        _extractInitials: function(fullname) {
            var names = fullname.split(/\s/);
            var first = (names.length > 0) ? names[0].charAt(0) : "";
            var last = (names.length > 1) ? names[names.length - 1].charAt(0) : "";
            return first + last;
        }

    });

});
