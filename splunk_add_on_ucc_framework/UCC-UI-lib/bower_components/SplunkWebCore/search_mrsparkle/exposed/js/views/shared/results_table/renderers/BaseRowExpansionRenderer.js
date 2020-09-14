define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");

    var BaseRowExpansionRenderer = function() {
        this.initialize.apply(this, arguments);
    };

    _.extend(BaseRowExpansionRenderer.prototype, Backbone.Events, {

        initialize: function() {
        },

        canRender: function(rowData) {
            throw new Error("Must implement method canRender.");
        },

        createContainer: function(rowData) {
            return $('<td colspan="' + rowData.colspan + '"></td>');
        },

        setup: function($container, rowData) {
        },

        teardown: function($container, rowData) {
        },

        render: function($container, rowData) {
        }

    });

    BaseRowExpansionRenderer.prototype.constructor = BaseRowExpansionRenderer;
    BaseRowExpansionRenderer.extend = Backbone.Model.extend;

    return BaseRowExpansionRenderer;

});
