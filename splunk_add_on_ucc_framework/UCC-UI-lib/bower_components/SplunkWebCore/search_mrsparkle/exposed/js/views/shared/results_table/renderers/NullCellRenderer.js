define(function(require, exports, module) {

    var _ = require("underscore");
    var BaseCellRenderer = require("./BaseCellRenderer");

    return BaseCellRenderer.extend({

        setup: function($td, cellData) {
            $td.addClass("null");
        },

        teardown: function($td, cellData) {
            $td.removeClass("null");
        },

        canRender: function(cellData) {
            return (_.isNull(cellData.value) || _.isEqual(cellData.value, []));
        },

        render: function($td, cellData) {
            $td.html("&nbsp;");
        }

    });

});
