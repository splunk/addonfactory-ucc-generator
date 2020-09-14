define([
            'jquery',
            'underscore',
            '../../js_charting/components/DataLabels',
            '../util/lang_utils'
        ],
        function(
            $,
            _,
            DataLabels,
            langUtils
        ) {

    var CartesianDataLabels = function(properties) {
        DataLabels.call(this,properties);
        this.showLabels = properties.showLabels;
        this.splitSeries = properties.splitSeries;
    };

    langUtils.inherit(CartesianDataLabels, DataLabels);

    CartesianDataLabels.prototype = $.extend(CartesianDataLabels.prototype, {

        onChartLoadOrRedraw: function(chart) {
            if (this.showLabels === "minmax") {
                this.displayMinMax(chart.series);
            }
            if (this.showLabels === "all") {
                this.removeRepeatedZeroValues(chart.series);
            }
        },

        destroy: function(chart) {
            this.off();
        },

        onChartLoad: function() {},

        displayMinMax: function(series) {
            
            var points = _.flatten(_.pluck(series, 'points'));
            _.each(points, function(point){
                if (point.dataLabel && point.dataLabel.element) {
                    point.dataLabel.element.setAttribute('display', 'none');
                }
            });
            var i,
                j,
                sc = series.length,
                visiblePointsPerSeries = [],
                visiblePoints = [];

            for (i = 0; i < sc; i++) {
                var seriesExtremes = series[i].xAxis.getExtremes();
                var minIndex = seriesExtremes.userMin || seriesExtremes.dataMin;
                var maxIndex = seriesExtremes.userMax || seriesExtremes.dataMax;
                visiblePoints = [];
                for(j = minIndex; j <= maxIndex; j++){
                    // We have to check if the point exists in this
                    // series because the min and max are not per-series 
                    // as you would expect
                    if (series[i].points[j]) {
                        visiblePoints.push(series[i].points[j]);
                    }
                }
                visiblePointsPerSeries.push(visiblePoints);
            }

            if (!this.splitSeries) {
                // if we dont split the series we don't want to show multiple extrema
                visiblePointsPerSeries = [_.flatten(visiblePointsPerSeries)];
            }

            for (i = 0; i < visiblePointsPerSeries.length; i++) {
                // we only want to find extremas for points with y values
                // that have a dataLabel that could be shown
                var currentVisiblePoints = _.filter(visiblePointsPerSeries[i], function(point) {
                    return !_.isNull(point.y) && point.dataLabel;
                });
                var minPoint = _.min(currentVisiblePoints, function(point) {
                    return point.y;
                });
                var maxPoint = _.max(currentVisiblePoints, function(point) {
                    return point.y;
                });

                maxPoint.dataLabel.element.removeAttribute('display');
                minPoint.dataLabel.element.removeAttribute('display');
            }

        },

        removeRepeatedZeroValues: function(series) {
            var points = _.flatten(_.pluck(series, 'points'));
            _.each(points, function(point){
                if (point.dataLabel && point.dataLabel.element) {
                    point.dataLabel.element.removeAttribute('display');
                }
            });
            var yMin = _.min(_.pluck(points, 'y'));
            if (yMin >= 0) {
                _.each(points, function(point){
                    if (point.y == 0){
                        if (point.dataLabel && point.dataLabel.element) {
                            point.dataLabel.element.setAttribute('display', 'none');
                        }
                    }
                });
            }
        }
    });
    return CartesianDataLabels;
});