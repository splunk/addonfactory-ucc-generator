define(function(require, exports, module) {

    var SVGUtils = require("svg/SVGUtils");

    var AREA = SVGUtils.strip(require("contrib/text!svg/viz_area.svg"));
    var BAR = SVGUtils.strip(require("contrib/text!svg/viz_bar.svg"));
    var BUBBLE = SVGUtils.strip(require("contrib/text!svg/viz_bubble.svg"));
    var COLUMN = SVGUtils.strip(require("contrib/text!svg/viz_column.svg"));
    var FILLER_GAUGE = SVGUtils.strip(require("contrib/text!svg/viz_filler_gauge.svg"));
    var LINE = SVGUtils.strip(require("contrib/text!svg/viz_line.svg"));
    var LIST = SVGUtils.strip(require("contrib/text!svg/viz_list.svg"));
    var MAP = SVGUtils.strip(require("contrib/text!svg/viz_map.svg"));
    var MARKER_GAUGE = SVGUtils.strip(require("contrib/text!svg/viz_marker_gauge.svg"));
    var PIE = SVGUtils.strip(require("contrib/text!svg/viz_pie.svg"));
    var RADIAL_GAUGE = SVGUtils.strip(require("contrib/text!svg/viz_radial_gauge.svg"));
    var SCATTER = SVGUtils.strip(require("contrib/text!svg/viz_scatter.svg"));
    var SINGLE_VALUE = SVGUtils.strip(require("contrib/text!svg/viz_single_value.svg"));
    var TABLE = SVGUtils.strip(require("contrib/text!svg/viz_table.svg"));

    var _REPORT_ICON_MAP = {
        "display.general.type": {
            "events": "@display.events.type",
            "visualizations": "@display.visualizations.type",
            "statistics": TABLE
        },
        "display.events.type": {
            "list": LIST,
            "table": TABLE
        },
        "display.visualizations.type": {
            "charting": "@display.visualizations.charting.chart",
            "mapping": MAP,
            "singlevalue": SINGLE_VALUE
        },
        "display.visualizations.charting.chart": {
            "area": AREA,
            "bar": BAR,
            "bubble": BUBBLE,
            "column": COLUMN,
            "fillerGauge": FILLER_GAUGE,
            "line": LINE,
            "markerGauge": MARKER_GAUGE,
            "pie": PIE,
            "radialGauge": RADIAL_GAUGE,
            "scatter": SCATTER
        }
    };

    var getReportIcon = function(report, attribute) {
        if (!attribute) {
            attribute = "display.general.type";
        }

        var options = _REPORT_ICON_MAP[attribute];
        if (!options) {
            return null;
        }

        var value = report.entry.content.get(attribute);
        if (!value) {
            return null;
        }

        var option = options[value];
        if (!option) {
            return null;
        }

        if (option.charAt(0) !== "@") {
            return option;
        }

        return getReportIcon(report, option.substring(1));
    };

    return {
        AREA: AREA,
        BAR: BAR,
        BUBBLE: BUBBLE,
        COLUMN: COLUMN,
        FILLER_GAUGE: FILLER_GAUGE,
        LINE: LINE,
        LIST: LIST,
        MAP: MAP,
        MARKER_GAUGE: MARKER_GAUGE,
        PIE: PIE,
        RADIAL_GAUGE: RADIAL_GAUGE,
        SCATTER: SCATTER,
        SINGLE_VALUE: SINGLE_VALUE,
        TABLE: TABLE,
        getReportIcon: getReportIcon
    };

});
