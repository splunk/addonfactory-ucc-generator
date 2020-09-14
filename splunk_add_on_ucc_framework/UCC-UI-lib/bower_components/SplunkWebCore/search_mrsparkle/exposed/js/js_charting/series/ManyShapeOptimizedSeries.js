define([
            'jquery',
            'underscore',
            'highcharts',
            './Series',
            '../util/lang_utils',
            '../util/color_utils'
        ], 
        function(
            $,
            _,
            Highcharts,
            Series,
            langUtils,
            colorUtils
        ) {

    var ManyShapeOptimizedSeries = function(properties) {
        Series.call(this, properties);
        
    };
    langUtils.inherit(ManyShapeOptimizedSeries, Series);

    $.extend(ManyShapeOptimizedSeries.prototype, {

        CHARTING_PROPERTY_WHITELIST: _.union(['seriesSpacing'], Series.prototype.CHARTING_PROPERTY_WHITELIST),

        DEFAULT_COLUMN_SPACING: 0.01,
        DEFAULT_COLUMN_GROUP_SPACING: 0.05,
        DEFAULT_BAR_SPACING: 0.02,
        DEFAULT_BAR_GROUP_SPACING: 0.05,

        getConfig: function() {
            var config = Series.prototype.getConfig.apply(this, arguments);
            config.drawGraphOverride = _(this.drawGraphOverride).bind(this);
            config.drawTrackerOverride = _(this.drawTrackerOverride).bind(this);
            config.drawPointsOverride = _(this.drawPointsOverride).bind(this);
            config.getGraphPathOverride = _(this.getGraphPathOverride).bind(this);
            return config;
        },

        // the columns will be drawn as a single <path> element using the area series drawGraph/drawTracker routine
        // and the override of getGrapthPath below
        drawGraphOverride: function(series) {
            Highcharts.seriesTypes.area.prototype.drawGraph.call(series);
        },

        drawTrackerOverride: function(series) {
            Highcharts.seriesTypes.area.prototype.drawTracker.call(series);
        },

        // no-op, since points are rendered as one single <path>
        drawPointsOverride: function() { },

        destroy: function() {
            this.unSelectPoint();
            Series.prototype.destroy.call(this);
        },

        getGraphPathOverride: function(series) {
            _(series.points).each(function(point) {
                var shapeArgs = point.shapeArgs,
                    x = shapeArgs.x || 0,
                    y = shapeArgs.y || 0,
                    width = shapeArgs.width || 0,
                    height = shapeArgs.height || 0;

                series.areaPath.push(
                    'M', x, y,
                    'L', x + width, y,
                    'L', x + width, y + height,
                    'L', x, y + height,
                    'Z'
                );
            });
            series.singlePoints = [];
            return [];
        },

        handlePointMouseOver: function(point) {
            Series.prototype.handlePointMouseOver.call(this, point);
            this.unHighlight();
            this.selectPoint(point);
        },

        handlePointMouseOut: function(point) {
            Series.prototype.handlePointMouseOut.call(this, point);
            this.highlight();
            this.unSelectPoint();
        },

        highlight: function() {
            Series.prototype.highlight.call(this);
            if(!this.hcSeries || !this.hcSeries.area) {
                return;
            }
            var seriesColor = this.getColor();
            this.hcSeries.area.attr({ fill: seriesColor, 'stroke-width': 0 });
        },

        unHighlight: function() {
            Series.prototype.unHighlight.call(this);
            this.unSelectPoint();
            if(!this.hcSeries.area) {
                return;
            }
            this.hcSeries.area.attr({
                fill: this.UNHIGHLIGHTED_COLOR,
                stroke: this.UNHIGHLIGHTED_BORDER_COLOR,
                'stroke-width': 1
            });
        },

        selectPoint: function(point) {
            var matchingPoint = this.hcSeries.data[point.index],
                shapeArgs = matchingPoint.shapeArgs,
                renderer = this.hcSeries.chart.renderer,
                seriesGroup = this.hcSeries.group;

            this.selectedPointGraphic = renderer.rect(shapeArgs.x, shapeArgs.y, shapeArgs.width, shapeArgs.height)
                .attr({ fill: this.getColor(), zIndex: 1 })
                .add(seriesGroup);
        },

        unSelectPoint: function() {
            if(this.selectedPointGraphic) {
                this.selectedPointGraphic.destroy();
                this.selectedPointGraphic = null;
            }
        },

        computeColumnSpacing: function(str) {
            var value = parseFloat(str);
            if(_(value).isNaN()) {
                return this.DEFAULT_COLUMN_SPACING;
            }
            return value * this.DEFAULT_COLUMN_SPACING;
        },

        computeColumnGroupSpacing: function(str) {
            var value = parseFloat(str);
            if(_(value).isNaN()) {
                return this.DEFAULT_COLUMN_GROUP_SPACING;
            }
            return this.DEFAULT_COLUMN_GROUP_SPACING * (1 + value);
        },

        computeBarSpacing: function(str) {
            var value = parseFloat(str);
            if(_(value).isNaN()) {
                return this.DEFAULT_BAR_SPACING;
            }
            return value * this.DEFAULT_BAR_SPACING;
        },

        computeBarGroupSpacing: function(str) {
            var value = parseFloat(str);
            if(_(value).isNaN()) {
                return this.DEFAULT_BAR_GROUP_SPACING;
            }
            return this.DEFAULT_BAR_GROUP_SPACING * (1 + value);
        }

    });

    return ManyShapeOptimizedSeries;
    
});