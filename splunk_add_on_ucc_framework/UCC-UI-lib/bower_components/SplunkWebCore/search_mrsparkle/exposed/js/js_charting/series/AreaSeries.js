define([
            'jquery',
            'underscore',
            './SingleShapeSeries',
            '../util/lang_utils',
            '../util/color_utils',
            '../util/parsing_utils',
            '../util/math_utils'
        ], 
        function(
            $,
            _,
            SingleShapeSeries,
            langUtils,
            colorUtils,
            parsingUtils,
            mathUtils
        ) {

    var AreaSeries = function(properties) {
        SingleShapeSeries.call(this, properties);
        this.UNHIGHLIGHTED_LINE_COLOR =
            colorUtils.addAlphaToColor(this.UNHIGHLIGHTED_BASE_COLOR, this.UNHIGHLIGHTED_LINE_OPACITY);
    };
    langUtils.inherit(AreaSeries, SingleShapeSeries);

    $.extend(AreaSeries.prototype, {

        HIGHLIGHTED_OPACITY: 0.75,
        UNHIGHLIGHTED_LINE_OPACITY: 0.4,

        CHARTING_PROPERTY_WHITELIST:_.union(['showLines', 'areaFillOpacity'], SingleShapeSeries.prototype.CHARTING_PROPERTY_WHITELIST),

        type: 'area',

        processProperties: function() {
            var rawFillOpacity = mathUtils.parseFloat(this.properties.areaFillOpacity);
            this.fillOpacity = (rawFillOpacity <= 1 && rawFillOpacity >= 0) ? rawFillOpacity : this.HIGHLIGHTED_OPACITY;
        },

        getConfig: function() {
            var config = SingleShapeSeries.prototype.getConfig.call(this);
            config.fillOpacity = this.fillOpacity;
            config.connectNulls = (this.properties['nullValueMode'] === 'connect');
            config.lineWidth = parsingUtils.normalizeBoolean(this.properties['showLines'], true) ? 1 : 0;
            return config;
        },

        onChartLoadOrRedraw: function(chart) {
            SingleShapeSeries.prototype.onChartLoadOrRedraw.call(this, chart);
            this.hasLines = (this.hcSeries.options.lineWidth > 0);
            // FIXME: shouldn't have to do this here, try to make it work with highcharts settings
            this.hcSeries.area.attr('fill-opacity', this.fillOpacity);
        },

        highlight: function() {
            SingleShapeSeries.prototype.highlight.call(this);
            var seriesColor = this.getColor();
            this.hcSeries.area.attr({
                'fill': seriesColor,
                'fill-opacity': this.fillOpacity
            });
            if(this.hcSeries.graph && this.hasLines) {
                this.hcSeries.graph.attr({
                    'stroke': seriesColor,
                    'stroke-opacity': 1
                });
            }
        },

        unHighlight: function() {
            SingleShapeSeries.prototype.unHighlight.call(this);
            this.hcSeries.area.attr({
                'fill': this.UNHIGHLIGHTED_COLOR
            });
            if(this.hcSeries.graph && this.hasLines) {
                this.hcSeries.graph.attr('stroke', this.UNHIGHLIGHTED_LINE_COLOR);
            }
        }

    });

    return AreaSeries;

});