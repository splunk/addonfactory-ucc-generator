define([
            'jquery',
            'underscore',
            'highcharts',
            './ManyShapeOptimizedSeries',
            '../util/lang_utils'
        ],
        function(
            $,
            _,
            Highcharts,
            ManyShapeOptimizedSeries,
            langUtils
        ) {

    var ScatterSeries = function(properties) {
        ManyShapeOptimizedSeries.call(this, properties);
    };
    langUtils.inherit(ScatterSeries, ManyShapeOptimizedSeries);

    $.extend(ScatterSeries.prototype, {

        type: 'scatter',

        getConfig: function() {
            var config = ManyShapeOptimizedSeries.prototype.getConfig.apply(this, arguments);
            config.pointActionsPreHook = _(this.pointActionsPreHook).bind(this);
            config.renderPostHook = _(this.renderPostHook).bind(this);
            return config;
        },

        getGraphPathOverride: function(series) {
            var UNDEFINED,
                NORMAL_STATE = '',
                SELECT_STATE = 'select',
                chart = series.chart;

            _(series.points).each(function(point) {
                // BEGIN code borrowed from Highcharts Series#drawPoints
                var plotX = Math.floor(point.plotX), // #1843
                    plotY = point.plotY,
                    pointMarkerOptions = point.marker || {},
                    isInside = chart.isInsidePlot(Math.round(plotX), plotY, chart.inverted); // #1858

                // only draw the point if y is defined
                if(series.options.marker && plotY !== UNDEFINED && !isNaN(plotY) && point.y !== null) {

                    // shortcuts
                    var pointAttr = point.pointAttr[point.selected ? SELECT_STATE : NORMAL_STATE],
                        radius = pointAttr.r,
                        symbol = Highcharts.pick(pointMarkerOptions.symbol, series.symbol);

                    if(isInside && radius > 0) {
                        // END code from Series#drawPoints, the following is custom rendering code...
                        // TODO: this assumes the symbol can be rendered with a <path>, will break for circles or images
                        var symbolPath = chart.renderer.symbols[symbol](
                            plotX - radius,
                            plotY - radius,
                            2 * radius,
                            2 * radius
                        );
                        series.areaPath.push.apply(series.areaPath, symbolPath);
                    }
                }
            });
            series.singlePoints = [];
            return [];
        },

        renderPostHook: function(series) {
            // SPL-79730, the series group (which contains the mouse tracker) needs to be in front of the marker group
            // otherwise when a hover event happens the marker blocks the tracker and triggers a mouse out
            if(series.group) {
                series.group.toFront();
            }
        },

        pointActionsPreHook: function(series, e) {
            var i, l, hoverPoint,
                chart = series.chart,
                pointer = chart.pointer,
                eX = e.chartX - chart.plotLeft,
                eY = e.chartY - chart.plotTop,
                markerRadius = series.options.marker.radius,
                markerPadding = 5,
                pointEffectiveRadius = markerRadius + markerPadding,
                tooltipIndex = pointer.getIndex(e);

            // memoize sorting the series points by their chartX value
            if(!series._sortedPoints) {
                series._sortedPoints = _(series.points).sortBy('plotX');
            }

            // find the index of the first point in the sorted array that has an x value that overlaps the mouse event
            var point, pointX,
                pointsInXRange = [],
                xRangeStartIndex = _(series._sortedPoints).sortedIndex({ plotX: eX - pointEffectiveRadius }, 'plotX');

            // from that first point index, walk forward and find all points that overlap the mouse event
            for(i = xRangeStartIndex, l = series._sortedPoints.length; i < l; i++) {
                point = series._sortedPoints[i];
                pointX = point.plotX;
                if(pointX <= eX + pointEffectiveRadius) {
                    pointsInXRange.push(point);
                }
                else {
                    break;
                }
            }

            // if only one point matched, it is the hover point
            if(pointsInXRange.length === 1) {
                hoverPoint = pointsInXRange[0];
            }
            // otherwise, find the best match for the mouse event's y co-ordinate
            else {
                hoverPoint = _(pointsInXRange).min(function(point) { return Math.abs(point.plotY - eY); });
            }

            // make sure the point that should be hovered is at the correct index in the series tooltipPoints array
            series.tooltipPoints = series.tooltipPoints || [];
            series.tooltipPoints[tooltipIndex] = hoverPoint;
        },

        // Highcharts will create a stateMarkerGraphic to show the selected state of the point
        // per SPL-79730, move that element to show up on top of the existing point but under the mouse tracker
        selectPoint: function(point) {
            var matchingPoint = this.hcSeries.data[point.index],
                matchingSeries = matchingPoint.series;

            if(matchingSeries.stateMarkerGraphic) {
                this.selectedPointGraphic = matchingSeries.stateMarkerGraphic;
                // remove Highcharts's reference so it doesn't try to destroy the marker
                matchingSeries.stateMarkerGraphic = null;
                $(this.selectedPointGraphic.element).insertBefore(matchingSeries.tracker.element);
            }
        },

        getTooltipRows: function(info) {
            var rows = [];
            if(info.isMultiSeries) {
                rows.push([info.labelSeriesName, { text: info.seriesName, color: info.seriesColor }]);
            }
            if(info.markName) {
                rows.push([info.markName, info.markValue]);
            }
            rows.push(
                [info.xAxisName, info.xValue],
                [info.yAxisName, info.yValue]
            );
            return rows;
        }

    });

    return ScatterSeries;

});