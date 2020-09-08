define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");

    var template = require("contrib/text!views/dashboards/tiles/EmptyTile.html");

    return BaseView.extend({

        moduleId: module.id,
        template: template,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.html(this.compiledTemplate({}));
            return this;
        }

    });

});
