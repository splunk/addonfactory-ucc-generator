define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseView = require("views/Base");
    var TableView = require("views/authentication_users/table/Master");
    var TilesView = require("views/authentication_users/tiles/Master");
    var css = require('./Master.pcss');

    return BaseView.extend({

        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            if (!this.children.main) {
                if (this.model.serverInfo.isLite()) {
                    this.children.main = new TilesView({
                        model: this.model,
                        collection: this.collection
                    });
                } else {
                    this.children.main = new TableView({
                        model: this.model,
                        collection: this.collection
                    });
                }
                this.children.main.render().appendTo(this.$el);
            }
            return this;
        }

    });

});
