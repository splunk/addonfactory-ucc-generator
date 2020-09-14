define([
            'jquery',
            'underscore',
            './Series',
            '../util/lang_utils'
        ], 
        function(
            $,
            _,
            Series,
            langUtils
        ) {

    var MultiSeries = function(properties) {
        Series.call(this, properties);
        this.nestedSeriesList = [];
    };
    langUtils.inherit(MultiSeries, Series);

    $.extend(MultiSeries.prototype, {

        // leave any normalization to child series
        normalizeProperties: function(rawProps) {
            return rawProps;
        },

        isDirty: function() {
            return _(this.nestedSeriesList).any(function(series) { return series.isDirty(); });
        },

        dataIsDirty: function() {
            return _(this.nestedSeriesList).any(function(series) { return series.dataIsDirty(); });
        },

        getFieldList: function() {
            return _(this.nestedSeriesList).invoke('getFieldList');
        },

        applyColorMapping: function(colorMapping) {
            _(this.nestedSeriesList).invoke('applyColorMapping', colorMapping);
        },

        matchesName: function(name) {
            return _(this.nestedSeriesList).any(function(series) {
                return series.matchesName(name);
            });
        },

        getConfig: function() {
            return _(this.nestedSeriesList).invoke('getConfig');
        },

        bindNestedSeries: function() {
            var that = this;
            _(this.nestedSeriesList).each(function(series) {
                series.on('mouseover', function(e, point, targetSeries) {
                    that.trigger(e, [point, targetSeries]);
                });
                series.on('mouseout', function(e, point, targetSeries) {
                    that.trigger(e, [point, targetSeries]);
                });
                series.on('click', function(e, point, targetSeries) {
                    that.trigger(e, [point, targetSeries]);
                });
            });
        },

        handlePointMouseOver: function(point) {
            var seriesName = point.seriesName;
            _(this.nestedSeriesList).each(function(series) {
                if(series.matchesName(seriesName)) {
                    series.handlePointMouseOver(point);
                }
                else {
                    series.unHighlight();
                }
            });
        },

        handlePointMouseOut: function(point) {
            var seriesName = point.seriesName;
            _(this.nestedSeriesList).each(function(series) {
                if(series.matchesName(seriesName)) {
                    series.handlePointMouseOut(point);
                }
                else {
                    series.highlight();
                }
            });
        },

        handleLegendMouseOver: function(fieldName) {
            _(this.nestedSeriesList).each(function(series) {
                if(series.matchesName(fieldName)) {
                    series.handleLegendMouseOver(fieldName);
                }
                else {
                    series.unHighlight();
                }
            });
        },

        handleLegendMouseOut: function(fieldName) {
            _(this.nestedSeriesList).each(function(series) {
                if(series.matchesName(fieldName)) {
                    series.handleLegendMouseOut(fieldName);
                }
                else {
                    series.highlight();
                }
            });
        },

        onChartLoad: function(chart) {
            _(this.nestedSeriesList).invoke('onChartLoad', chart);
        },

        onChartLoadOrRedraw: function(chart) {
            _(this.nestedSeriesList).invoke('onChartLoadOrRedraw', chart);
        },

        redraw: function(redrawChart) {
            _(this.nestedSeriesList).invoke('redraw', redrawChart);
        },

        destroy: function() {
            this.off();
            _(this.nestedSeriesList).invoke('destroy');
        },

        bringToFront: function() {
            _(this.nestedSeriesList).invoke('bringToFront');
        },

        highlight: function() {
            _(this.nestedSeriesList).invoke('highlight');
        },

        unHighlight: function() {
            _(this.nestedSeriesList).invoke('unHighlight');
        }

    });

    return MultiSeries;

});