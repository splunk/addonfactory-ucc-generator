define([
            'jquery',
            'underscore',
            './ScatterChart',
            '../../components/axes/NumericAxis',
            '../../util/lang_utils'
        ],
        function(
            $,
            _,
            ScatterChart,
            NumericAxis,
            langUtils
        ) {

    var BubbleChart = function(container, properties) {
        ScatterChart.call(this, container, properties);
    };
    langUtils.inherit(BubbleChart, ScatterChart);

    $.extend(BubbleChart.prototype, {
        NUM_DIMENSION_FIELDS: 3,
        TYPE: 'bubble',

        initializeNonMarkFields: function(dataFields) {
            ScatterChart.prototype.initializeNonMarkFields.call(this, dataFields);
            if(dataFields.length > this.NUM_DIMENSION_FIELDS) {
                this.zField = dataFields[3];
            }
            else {
                this.zField = dataFields[2];
            }
        },

        isEmpty: function() {
            return ScatterChart.prototype.isEmpty.apply(this, arguments) || _(this.zField).isUndefined();
        },

        processProperties: function() {
            ScatterChart.prototype.processProperties.call(this);

            var defaults = { 'bubbleMaximumSize': 50, 'bubbleMinimumSize': 10, 'bubbleSizeBy': 'area' };

            this.bubbleMaximumSize = this.properties['chart.bubbleMaximumSize'] && parseInt(this.properties['chart.bubbleMaximumSize'], 10);
            this.bubbleMinimumSize = this.properties['chart.bubbleMinimumSize'] && parseInt(this.properties['chart.bubbleMinimumSize'], 10);
            this.bubbleSizeBy = this.properties['chart.bubbleSizeBy'] || defaults['bubbleSizeBy'];

            if(isNaN(this.bubbleMaximumSize) || this.bubbleMaximumSize <= 0){
                this.bubbleMaximumSize = defaults['bubbleMaximumSize'];
            }

            if(isNaN(this.bubbleMinimumSize) || this.bubbleMinimumSize <= 0){
                this.bubbleMinimumSize = defaults['bubbleMinimumSize'];
            }
            
            if(this.bubbleSizeBy === 'diameter'){
                this.bubbleSizeBy = 'width';
            }else if(this.bubbleSizeBy !== ('area')){
                this.bubbleSizeBy = defaults['bubbleSizeBy'];
            }
        },

        setAllSeriesData: function() {
            var xData = this.formatAxisData(this.xAxisList[0], this.xField),
                yData = this.formatAxisData(this.yAxisList[0], this.yField),
                zData = this.formatAxisData(this.yAxisList[0], this.zField);

            if(this.isMultiSeries) {
                _(this.seriesList).each(function(series) {
                    var seriesName = series.getName();
                    series.setData({
                        x: this.filterDataByNameMatch(xData, seriesName),
                        y: this.filterDataByNameMatch(yData, seriesName),
                        z: this.filterDataByNameMatch(zData, seriesName)
                    });
                }, this);
            }
            else {
                this.seriesList[0].setData({
                    x: xData,
                    y: yData,
                    z: zData
                });
            }
        },

        getPlotOptionsConfig: function() {
            var minSize = this.bubbleMinimumSize,
                maxSize = this.bubbleMaximumSize,
                sizeBy = this.bubbleSizeBy;
            return ({
                bubble: {
                    stickyTracking: false,
                    minSize: minSize,
                    maxSize: maxSize,
                    sizeBy: sizeBy,
                    tooltip: {
                        followPointer: false
                    },
                    cursor: this.chartClickEnabled ? 'pointer' : 'default'
                }
            });
        },

        getSeriesPointInfo: function(series, hcPoint) {
            var pointInfo = ScatterChart.prototype.getSeriesPointInfo.apply(this, arguments),
                pointIndex = hcPoint.index,
                seriesName = series.getName(),
                zSeries = this.dataSet.getSeries(this.zField),
                zValue = this.isMultiSeries ? this.filterDataByNameMatch(zSeries, seriesName)[pointIndex] : zSeries[pointIndex];

            pointInfo.zAxisName = this.zField;
            pointInfo.zValue = NumericAxis.formatNumber(zValue);
            return pointInfo;
        }


    });

    return BubbleChart;

});