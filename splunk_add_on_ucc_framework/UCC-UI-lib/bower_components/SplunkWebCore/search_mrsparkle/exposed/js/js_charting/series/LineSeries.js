define([
            'jquery',
            'underscore',
            './SingleShapeSeries',
            '../util/lang_utils',
            '../util/parsing_utils'
        ],
        function(
            $,
            _,
            SingleShapeSeries,
            langUtils,
            parsingUtils
        ) {

    var LineSeries = function(properties) {
        SingleShapeSeries.call(this, properties);
    };
    langUtils.inherit(LineSeries, SingleShapeSeries);

    $.extend(LineSeries.prototype, {

        CHARTING_PROPERTY_WHITELIST:_.union(['showMarkers'], SingleShapeSeries.prototype.CHARTING_PROPERTY_WHITELIST),

        type: 'line',

        highlight: function() {
            SingleShapeSeries.prototype.highlight.call(this);
            if(this.hcSeries.graph) {
                var seriesColor = this.getColor();
                this.hcSeries.graph.attr({
                    'stroke': seriesColor,
                    'stroke-opacity': this.HIGHLIGHTED_OPACITY
                });
            }
            _(this.hcSeries.data).each(this.highlightPoint, this);
        },

        unHighlight: function() {
            SingleShapeSeries.prototype.unHighlight.call(this);
            if(this.hcSeries.graph) {
                this.hcSeries.graph.attr('stroke', this.UNHIGHLIGHTED_COLOR);
            }
            _(this.hcSeries.data).each(this.unHighlightPoint, this);
        },

        highlightPoint: function(hcPoint) {
            var seriesColor = this.getColor();
            if(hcPoint.graphic) {
                hcPoint.graphic.attr('fill', seriesColor);
            }
        },

        unHighlightPoint: function(hcPoint) {
            if(hcPoint.graphic) {
                hcPoint.graphic.attr('fill', this.UNHIGHLIGHTED_COLOR);
            }
        },

        translatePostHook: function() {
            if(this.hcSeries){
                var chart = this.hcSeries.chart,
                    xAxis = this.hcSeries.xAxis, 
                    points = this.hcSeries.points;
                // If the series is an overlay on a column chart and there is only 1 point displayed
                // then we override the x-coordinates of the neightboring points so that the 1-point overlay is rendered correctly  
                if(Math.round(xAxis.min) === Math.round(xAxis.max) && this.hcSeries.options.type === 'line'){
                    var isOverlay = false, 
                        allSeries = chart.series;
                    for(var i = 0; i < chart.series.length; i++){
                        if(chart.series[i].options.type === 'column'){
                            isOverlay = true;
                        }
                    }
                    if(isOverlay){
                        var zoomedPointIndex = Math.round(xAxis.min);
                        if(points[zoomedPointIndex - 1]){
                            points[zoomedPointIndex - 1].plotX = points[zoomedPointIndex].plotX - xAxis.width;
                        }
                        if(points[zoomedPointIndex + 1]){
                            points[zoomedPointIndex + 1].plotX = points[zoomedPointIndex].plotX + xAxis.width;
                        }
                    }
                }    
            } 
        },

        getConfig: function() {
            var config = SingleShapeSeries.prototype.getConfig.call(this);
            config.connectNulls = (this.properties['nullValueMode'] === 'connect');
            $.extend(config,{
                marker: {},
                stacking: this.STACK_MODE_MAP['default'],
                // line series has a higher z-index for chart overlay
                zIndex: 2,
                translatePostHook: _(this.translatePostHook).bind(this), 
                dashStyle: this.properties['dashStyle']
            });

            config.marker.enabled = parsingUtils.normalizeBoolean(this.properties['showMarkers'], false);

            return config;
        }

    });

    return LineSeries;

});