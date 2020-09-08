define([
            'jquery',
            'underscore',
            './Chart',
            '../../util/lang_utils', 
            '../../util/parsing_utils'
        ],
        function(
            $,
            _,
            Chart,
            langUtils, 
            parsingUtils
        ) {

    var SplitSeriesChart = function(container, properties) {
        Chart.call(this, container, properties);
    };
    langUtils.inherit(SplitSeriesChart, Chart);

    $.extend(SplitSeriesChart.prototype, {

        interAxisSpacing: 10,

        shouldUpdateInPlace: function() {
            if (this.selectionWindow) {
                return this.hcChart && !this.isDirty();
            } else {
                return false;
            }
        },

        processProperties: function() {
            Chart.prototype.processProperties.call(this);
            this.allowIndependentYRanges = parsingUtils.normalizeBoolean(
                this.properties['layout.splitSeries.allowIndependentYRanges'], false
            );
        },

        initializeSeriesPropertiesList: function() {
            var propertiesList = Chart.prototype.initializeSeriesPropertiesList.call(this);
            // give each series its own y-axis
            _(propertiesList).each(function(props, i) {
                props.yAxis = i;
            });
            return propertiesList;
        },

        initializeYAxisProperties: function(axisIndex, isEmpty) {
            // If split-series chart, disable Y2 axes 
            var axisProperties = $.extend(parsingUtils.getYAxisProperties(this.properties, 0), this.axisColorScheme, {
                'axis.orientation': this.axesAreInverted ? 'horizontal' : 'vertical',
                'isEmpty': isEmpty,
                'opposite': false
            });
            return axisProperties; 
        },

        setAllSeriesData: function() {
            Chart.prototype.setAllSeriesData.call(this);
            // memoize the global min and max across all data
            this.globalMin = Infinity;
            this.globalMax = -Infinity;
            _(this.yFields).each(function(field, i) {
                var axis = this.yAxisList[i],
                    data = this.formatAxisData(axis, field);

                this.globalMin = Math.min(this.globalMin, Math.min.apply(Math, data));
                this.globalMax = Math.max(this.globalMax, Math.max.apply(Math, data));
            }, this);
        },

        getYAxisConfig: function() {
            var config = Chart.prototype.getYAxisConfig.call(this);
            _(config).each(function(axisConfig, i) {
                $.extend(axisConfig, {
                    opposite: false,
                    offset: 0,
                    setSizePreHook: _(function(axis) {
                        $.extend(axis.options, this.getAdjustedAxisPosition(axis, i, this.yAxisList.length));
                    }).bind(this)
                });
                var originalExtremesHook = axisConfig.getSeriesExtremesPostHook;
                axisConfig.getSeriesExtremesPostHook = _(function(axis) {
                    //if stackmode is 100, we want to keep the default 0-100 range
                    if (!this.allowIndependentYRanges && this.stackMode !== 'stacked100') {
                        axis.dataMax = Math.max(axis.dataMax, this.globalMax);
                        axis.dataMin = Math.min(axis.dataMin, this.globalMin);
                    }
                    //make sure to invoke the original hook if it's there
                    if(originalExtremesHook) {
                        originalExtremesHook(axis);
                    }
                }).bind(this);
            }, this);
            return config;
        },

        getSeriesConfigList: function() {
            var config = Chart.prototype.getSeriesConfigList.call(this);
            _(config).each(function(seriesConfig) {
                seriesConfig.afterAnimatePostHook = _(this.updateSeriesClipRect).bind(this);
                seriesConfig.renderPostHook = _(this.updateSeriesClipRect).bind(this);
                seriesConfig.destroyPreHook = _(this.destroySplitSeriesClipRect).bind(this);
            }, this);
            return config;
        },

        getAdjustedAxisPosition: function(axis, index, numAxes) {
            var chart = axis.chart;
            if(chart.inverted) {
                var plotWidth = chart.plotWidth,
                    axisWidth = (plotWidth - (this.interAxisSpacing * (numAxes - 1))) / numAxes;

                return ({
                    left: chart.plotLeft + (axisWidth + this.interAxisSpacing) * index,
                    width: axisWidth
                });
            }
            var plotHeight = chart.plotHeight,
                axisHeight = (plotHeight - (this.interAxisSpacing * (numAxes - 1))) / numAxes;

            return ({
                top: chart.plotTop + (axisHeight + this.interAxisSpacing) * index,
                height: axisHeight
            });
        },

        getTooltipConfig: function() {
            var config = Chart.prototype.getTooltipConfig.call(this);
            var that = this; 
            config.getAnchorPostHook = function(points, mouseEvent, anchor) {
                if(that.axesAreInverted){
                    anchor[0] = points.series.yAxis.left + (points.pointWidth || 0);
                }
                return anchor;
            };
            return config;
        },

        updateSeriesClipRect: function(series) {
            var chart = series.chart,
                yAxis = series.yAxis;

            this.destroySplitSeriesClipRect(series);
            if(chart.inverted) {
                // this looks wrong, but this is happening before the 90 degree rotation so x is y and y is x
                series.splitSeriesClipRect = chart.renderer.clipRect(0, -0, chart.plotHeight, yAxis.width);
            }
            else {
                series.splitSeriesClipRect = chart.renderer.clipRect(0, 0, chart.plotWidth, yAxis.height);
            }
            series.group.clip(series.splitSeriesClipRect);
        },

        destroySplitSeriesClipRect: function(series) {
            if(series.hasOwnProperty('splitSeriesClipRect')) {
                series.splitSeriesClipRect.destroy();
            }
        }
    });

    return SplitSeriesChart;

});