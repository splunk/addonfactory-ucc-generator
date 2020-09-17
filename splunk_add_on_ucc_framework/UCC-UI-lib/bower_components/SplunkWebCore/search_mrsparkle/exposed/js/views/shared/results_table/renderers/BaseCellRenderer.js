define(function(require, exports, module) {

    var _ = require("underscore");
    var Backbone = require("backbone");

    var BaseCellRenderer = function() {
        this.initialize.apply(this, arguments);
    };

    _.extend(BaseCellRenderer.prototype, Backbone.Events, {

        initialize: function() {
        },

        canRender: function(cellData) {
            throw new Error("Must implement method canRender.");
        },

        setup: function($td, cellData) {
        },

        teardown: function($td, cellData) {
        },

        render: function($td, cellData) {
        }

    });

    BaseCellRenderer.prototype.constructor = BaseCellRenderer;
    BaseCellRenderer.extend = Backbone.Model.extend;

    return BaseCellRenderer;

});
