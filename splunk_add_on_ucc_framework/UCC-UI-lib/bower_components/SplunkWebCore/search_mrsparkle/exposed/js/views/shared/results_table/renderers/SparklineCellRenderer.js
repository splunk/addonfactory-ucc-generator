define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var sparkline = require("jquery.sparkline");
    var BaseCellRenderer = require("./BaseCellRenderer");

    var DEFAULT_SPARKLINE_SETTINGS = { type: "line", lineColor: "#65A637", highlightSpotColor: null, minSpotColor: null, maxSpotColor: null, spotColor: null, fillColor: null };

    return BaseCellRenderer.extend({

        canRender: function(cellData) {
            return (_.isArray(cellData.value) && (cellData.value[0] === "##__SPARKLINE__##"));
        },

        setup: function($td, cellData) {
            $td.addClass("sparkline");
        },

        teardown: function($td, cellData) {
            $td.removeClass("sparkline");
        },

        render: function($td, cellData) {
            var sparklineSettings = _.extend({}, DEFAULT_SPARKLINE_SETTINGS, cellData.sparklineFormat);
            $td.sparkline(_.isArray(cellData.value) ? _.map(cellData.value.slice(1), function(v) {
                return (v && parseFloat(v)) || 0;
            }) : [], sparklineSettings);
        }

    });

});
