define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'splunk.util',
        'util/svg',
        'util/general_utils',
        'util/math_utils'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        splunkUtil,
        svgUtil,
        generalUtil,
        mathUtil
    ) {

        return BaseView.extend({
            moduleId: module.id,
            className: "single-value-sparkline",
            el: function() {
                return svgUtil.createElement('g').attr('class', 'single-value-sparkline');
            },
            SPARKLINE_WIDTH: 150,
            SPARKLINE_HEIGHT: 14,
            SPARKLINE_Y: 77,
            DEFAULT_SPARKLINE_COLOR: '#000000',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);

                this.sparklineColor = this.model.presentation.get('sparklineColor');
                this.activate();
            },
            drawSparkline: function() {
                var opacity = this.model.presentation.get('sparklineOpacity') || 1,
                    counter = 1, // X-axis values do not matter as long as they are uniform in distance from one another
                    rawData = this.model.results.get('sparklineData'),
                    deltaBacktrack = this.model.results.get('deltaBacktrack');

                // clear previous render
                this.$el.empty();

                // bail if no data or less than two data points
                if (!rawData || (rawData.length < 2)) {
                    return;
                }

                // convert data to points and compute x/y ranges
                var points = [];
                var minX = Infinity;
                var maxX = -Infinity;
                var minY = Infinity;
                var maxY = -Infinity;
                _.each(rawData, function(d) {
                    var x = counter++;
                    var y = parseFloat(d) || 0;
                    minX = Math.min(x, minX);
                    maxX = Math.max(x, maxX);
                    minY = Math.min(y, minY);
                    maxY = Math.max(y, maxY);
                    points.push({ x: x, y: y });
                });

                // scale points to width/height
                var width = this.SPARKLINE_WIDTH;
                var height = this.SPARKLINE_HEIGHT;
                _.each(points, function(d, i) {
                    d.x = (width * ((d.x - minX) / Math.max(maxX - minX, 1)));
                    d.y = (height * (1 - (d.y - minY) / Math.max(maxY - minY, 1)));
                });

                // draw sparkline with delta range
                if ((deltaBacktrack > 0) && this.displayDeltaRange()) {
                    var endIndex = points.length - 1;
                    var startIndex = Math.max(endIndex - deltaBacktrack, 0);

                    // draw thin path segment
                    svgUtil.createElement('path')
                        .attr('class', 'sparkline')
                        .attr('d', this.pointsToPath(points.slice(0, startIndex + 1)))
                        .attr('fill', 'none')
                        .attr('stroke', this.sparklineColor)
                        .attr('opacity', opacity * 0.6)
                        .attr('stroke-width', '1px')
                        .attr('stroke-linecap', 'round')
                        .attr('stroke-linejoin', 'round')
                        .appendTo(this.$el);

                    // draw thick path segment
                    svgUtil.createElement('path')
                        .attr('class', 'sparkline-delta')
                        .attr('d', this.pointsToPath(points.slice(startIndex, endIndex + 1)))
                        .attr('fill', 'none')
                        .attr('stroke', this.sparklineColor)
                        .attr('opacity', opacity)
                        .attr('stroke-width', '1.5px')
                        .attr('stroke-linecap', 'round')
                        .attr('stroke-linejoin', 'round')
                        .appendTo(this.$el);

                    // draw start point
                    var startPoint = points[startIndex];
                    svgUtil.createElement('circle')
                        .attr('class', 'sparkline-point')
                        .attr('cx', startPoint.x)
                        .attr('cy', startPoint.y)
                        .attr('r', 2)
                        .attr('fill', this.sparklineColor)
                        .attr('stroke', 'none')
                        .attr('opacity', opacity)
                        .appendTo(this.$el);

                // draw normal sparkline
                } else {
                    svgUtil.createElement('path')
                        .attr('class', 'sparkline')
                        .attr('d', this.pointsToPath(points))
                        .attr('fill', 'none')
                        .attr('stroke', this.sparklineColor)
                        .attr('opacity', opacity)
                        .attr('stroke-width', '1.5px')
                        .attr('stroke-linecap', 'round')
                        .attr('stroke-linejoin', 'round')
                        .appendTo(this.$el);
                }

                // draw end point
                var endPoint = points[points.length - 1];
                svgUtil.createElement('circle')
                    .attr('class', 'sparkline-point')
                    .attr('cx', endPoint.x)
                    .attr('cy', endPoint.y)
                    .attr('r', 2)
                    .attr('fill', this.sparklineColor)
                    .attr('stroke', 'none')
                    .attr('opacity', opacity)
                    .appendTo(this.$el);
            },
            positionAndScaleSparkline: function() {
                // Position sparkline in middle of SVG container
                var shiftWidth = mathUtil.roundToDecimal(((this.svgWidth / 2 - this.sparklineWidth / 2) / this.scaleRatio), -2),
                    shiftHeight = this.SPARKLINE_Y,
                    edgePadding = this.model.presentation.get('edgePadding'),
                    availableWidth = this.svgWidth - (edgePadding * 2),
                    originalHeight,
                    maxHeight,
                    maxWidthRatio,
                    maxShiftWidth,
                    maxShiftHeight;
                if (this.sparklineWidth < availableWidth) {
                    // Only scale up sparkline if there is horizontal space to do so
                    if (generalUtil.valuesAreNumericAndFinite([this.scaleRatio, shiftWidth, shiftHeight])) {
                        this.$el.attr({
                            transform: "scale(" + this.scaleRatio + ")translate(" + shiftWidth + "," + shiftHeight + ")"
                        });
                    }
                } else {
                    maxWidthRatio = mathUtil.roundToDecimal((availableWidth / this.SPARKLINE_WIDTH), -2);
                    maxShiftWidth = mathUtil.roundToDecimal((edgePadding / maxWidthRatio), -2);
                    originalHeight = mathUtil.roundToDecimal((this.svgHeight / this.scaleRatio), -2);
                    // Due to width constraint, Sparkline cannot scale beyond this max height
                    maxHeight = originalHeight * maxWidthRatio;
                    // Because Sparkline is scaled only by the constant maxWidthRatio and not by the actual viz height's scaleRatio,
                    // the Sparkline vertical translate amount must be increased by the viz height increase in addition to the usual shiftHeight
                    maxShiftHeight = mathUtil.roundToDecimal(shiftHeight + ((this.svgHeight - maxHeight) / maxWidthRatio), -2);
                    if (generalUtil.valuesAreNumericAndFinite([maxWidthRatio, maxShiftWidth, maxShiftHeight])) {
                        this.$el.attr({
                            transform: "scale(" + maxWidthRatio + ")translate(" + maxShiftWidth + "," + maxShiftHeight + ")"
                        });
                    }
                }
            },
            pointsToPath: function(points) {
                var path = "";
                var point;
                for (var i = 0, l = points.length; i < l; i++) {
                    point = points[i];
                    path += (i === 0) ? "M" : "L";
                    path += point.x + "," + point.y;
                }
                return path;
            },
            displayDeltaRange: function() {
                var showDeltaValue = splunkUtil.normalizeBoolean(this.model.state.get('display.visualizations.singlevalue.showTrendIndicator')),
                deltaValue = this.model.results.get('deltaValue');
                return (showDeltaValue !== false) && (deltaValue != null);
            },
            reflow: function() {
                this.updateContainerDimensions();
                this.positionAndScaleSparkline();
            },
            updateContainerDimensions: function() {
                this.svgWidth = this.model.presentation.get('svgWidth');
                this.svgHeight = this.model.presentation.get('svgHeight');
                this.scaleRatio = this.model.presentation.get('scaleRatio');

                // Scale sparkline dimensions to fill new available SVG height
                this.sparklineWidth = this.SPARKLINE_WIDTH * this.scaleRatio;
            },
            render: function() {
                this.drawSparkline();
                return this;
            }
        });
    }
);
