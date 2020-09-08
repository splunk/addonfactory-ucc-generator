/*
 * A custom cell renderer for abbreviating GeoJSON values, when rendering the full
 * GeoJSON is not desired.
 */

define(function(require, exports, module) {

    var _ = require("underscore");
    var BaseCellRenderer = require("./BaseCellRenderer");

    return BaseCellRenderer.extend({

        setup: function($td, cellData) {
            $td.addClass("abbreviated-geo-json");
        },

        teardown: function($td, cellData) {
            $td.removeClass("abbreviated-geo-json");
        },

        canRender: function(cellData) {
            if (cellData.field !== "geom") {
                return false;
            }
            // Just in case a user creates their own field called "geom", also do a quick check
            // that the value is "JSON-like" (i.e. starts and ends with curly braces).
            var cellValue = cellData.value;
            return (cellValue[0] === "{" && cellValue[cellValue.length - 1] === "}");
        },

        render: function($td, cellData) {
            $td.text(_("[geometry definition]").t());
        }

    });

});