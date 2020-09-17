define([
            'jquery',
            'underscore',
            './Chart',
            '../../series/series_factory',
            '../../components/axes/NumericAxis',
            '../../util/lang_utils',
            '../../util/parsing_utils'
        ],
        function(
            $,
            _,
            Chart,
            seriesFactory,
            NumericAxis,
            langUtils,
            parsingUtils
        ) {

    var ScatterChart = function(container, properties) {
        Chart.call(this, container, properties);
        // Nulls should always be treated as zeros for scatter charts (SPL-114835).
        this.properties['chart.nullValueMode'] = 'zero';
    };
    langUtils.inherit(ScatterChart, Chart);

    $.extend(ScatterChart.prototype, {
        NUM_DIMENSION_FIELDS: 2,
        TYPE: 'scatter',

        initializeFields: function() {
            Chart.prototype.initializeFields.call(this);
            // to support the pivot interface, scatter charts ignore the first column if it is the result of a group-by
            var dataFields = this.dataSet.allDataFields();
            if(this.dataSet.fieldIsGroupby(dataFields[0])) {
                this.markField = dataFields[0];
                dataFields = dataFields.slice(1);
            }
            this.initializeNonMarkFields(dataFields);
        },

        initializeNonMarkFields: function(dataFields) {
            if(dataFields.length > this.NUM_DIMENSION_FIELDS) {
                this.isMultiSeries = true;
                this.labelField = dataFields[0];
                this.xField = dataFields[1];
                this.yField = dataFields[2];
                this.hasLegend = (this.properties['legend.placement'] !== 'none');
            }
            else {
                this.isMultiSeries = false;
                this.xField = dataFields[0];
                this.yField = dataFields[1];
                this.hasLegend = false;
            }
        },

        // Override chart data label init. Scatter chart does not support data labels
        initializeDataLabels: function(){
            // Do nothing
        },

        isEmpty: function() {
            return _(this.xField).isUndefined() || _(this.yField).isUndefined();
        },

        hasTimeXAxis: function() {
            return false;
        },

        initializeSeriesPropertiesList: function() {
            var propertiesList;
            if(this.isMultiSeries) {
                propertiesList = _(this.dataSet.getSeries(this.labelField)).chain()
                    .uniq()
                    .compact()
                    .map(function(label) {
                        return ({
                            name: label,
                            type: this.TYPE,
                            clickEnabled: this.chartClickEnabled
                        });
                    }, this)
                    .value();
            }
            else {
                var seriesProps = {
                    name: _.uniqueId(this.TYPE + '_field_'),
                    type: this.TYPE,
                    clickEnabled: this.chartClickEnabled
                };
                propertiesList = [seriesProps];
            }
            return propertiesList;
        },

        initializeXAxisList: function() {
            var axisProps = $.extend(parsingUtils.getXAxisProperties(this.properties), this.axisColorScheme, {
                'axis.orientation': 'horizontal',
                'isEmpty': this.isEmpty()
            });

            axisProps['axisTitle.text'] = this._getComputedXAxisTitle(axisProps, this.xField);

            axisProps['gridLines.showMajorLines'] = false;
            this.xAxisList = [new NumericAxis(axisProps)];
        },

        initializeYAxisList: function() {
            var axisProps = $.extend(parsingUtils.getYAxisProperties(this.properties), this.axisColorScheme, {
                'axis.orientation': 'vertical',
                'isEmpty': this.isEmpty()
            });

            axisProps['axisTitle.text'] = this._getComputedYAxisTitle(axisProps, null);

            this.yAxisList = [new NumericAxis(axisProps)];
        },

        setAllSeriesData: function() {
            var xData = this.formatAxisData(this.xAxisList[0], this.xField),
                yData = this.formatAxisData(this.yAxisList[0], this.yField);

            if(this.isMultiSeries) {
                _(this.seriesList).each(function(series) {
                    var seriesName = series.getName();
                    series.setData({
                        x: this.filterDataByNameMatch(xData, seriesName),
                        y: this.filterDataByNameMatch(yData, seriesName)
                    });
                }, this);
            }
            else {
                this.seriesList[0].setData({
                    x: xData,
                    y: yData
                });
            }
        },

        // Overrides the base class because scatter chart has different
        // default axis label behavior
        _getDefaultYAxisTitle: function(){
            return this.yField;
        },

        // Overrides the base class because scatter chart has different
        // default axis label behavior
        _getDefaultXAxisTitleFromField: function(field){
            return this.xField;
        },

        getPlotOptionsConfig: function() {
            var markerSize = parseInt(this.properties['chart.markerSize'], 10);
            return ({
                scatter: {
                    stickyTracking: false,
                    fillOpacity: 1,
                    trackByArea: true,
                    marker: {
                        radius: markerSize ? Math.ceil(markerSize * 6 / 4) : 6,
                        symbol: 'square'
                    },
                    tooltip: {
                        followPointer: false
                    },
                    cursor: this.chartClickEnabled ? 'pointer' : 'default'
                }
            });
        },

        handlePointClick: function(event, point, series) {
            var pointIndex = point.index,
                seriesName = series.getName(),
                xSeries = this.dataSet.getSeries(this.xField),
                ySeries = this.dataSet.getSeries(this.yField),
                xValue = this.isMultiSeries ? this.filterDataByNameMatch(xSeries, seriesName)[pointIndex] : xSeries[pointIndex],
                yValue = this.isMultiSeries ? this.filterDataByNameMatch(ySeries, seriesName)[pointIndex] : ySeries[pointIndex],
                rowContext = {};

            if(this.markField) {
                var markSeries = this.dataSet.getSeries(this.markField),
                    markValue = this.isMultiSeries ? this.filterDataByNameMatch(markSeries, seriesName)[pointIndex] : markSeries[pointIndex];

                rowContext['row.' + this.markField] = markValue;
            }

            var pointClickEvent = {
                type: 'pointClick',
                modifierKey: event.modifierKey,
                name: this.markField ? this.markField : (this.isMultiSeries ? this.labelField : this.xField),
                value: this.markField ? markValue : (this.isMultiSeries ? seriesName : xValue),
                name2: (this.markField && this.isMultiSeries) ? this.labelField : this.yField,
                value2: (this.markField && this.isMultiSeries) ? seriesName : yValue,
                rowContext: rowContext
            };

            rowContext['row.' + this.xField] = xValue;
            rowContext['row.' + this.yField] = yValue;
            if(this.isMultiSeries) {
                rowContext['row.' + this.labelField] = seriesName;
            }
            this.trigger(pointClickEvent);
        },

        handleLegendClick: function(event, fieldName) {
            var rowContext = {},
                legendClickEvent = {
                    type: 'legendClick',
                    modifierKey: event.modifierKey,
                    name: this.labelField,
                    value: fieldName,
                    rowContext: rowContext
                };

            rowContext['row.' + this.labelField] = fieldName;
            this.trigger(legendClickEvent);
        },

        getSeriesPointInfo: function(series, hcPoint) {
            var pointIndex = hcPoint.index,
                xAxis = this.xAxisList[0],
                yAxis = this.yAxisList[0],
                seriesName = series.getName(),
                xSeries = this.dataSet.getSeries(this.xField),
                ySeries = this.dataSet.getSeries(this.yField),
                xValue = this.isMultiSeries ? this.filterDataByNameMatch(xSeries, seriesName)[pointIndex] : xSeries[pointIndex],
                yValue = this.isMultiSeries ? this.filterDataByNameMatch(ySeries, seriesName)[pointIndex] : ySeries[pointIndex],

                pointInfo = {
                    isMultiSeries: this.isMultiSeries,
                    xAxisName: this.xField,
                    xValue: xAxis.formatValue(xValue),
                    yAxisName: this.yField,
                    yValue: yAxis.formatValue(yValue),
                    markName: null,
                    markValue: null
                };

            if(this.markField) {
                var markSeries = this.dataSet.getSeries(this.markField),
                    markValue = this.isMultiSeries ? this.filterMarkByNameMatch(seriesName)[pointIndex] : markSeries[pointIndex];

                $.extend(pointInfo, {
                    markName: this.markField,
                    markValue: markValue
                });
            }

            if(this.isMultiSeries) {
                $.extend(pointInfo, {
                    labelSeriesName: this.labelField
                });
            }
            return pointInfo;
        },

        filterDataByNameMatch: function(dataSeries, name) {
            var labelData = this.dataSet.getSeries(this.labelField);
            return _(dataSeries).filter(function(point, i) {
                return labelData[i] === name;
            });
        },

        filterMarkByNameMatch: function(name) {
            var labelData = this.dataSet.getSeries(this.labelField),
                markData = this.dataSet.getSeries(this.markField);

            return _(markData).filter(function(point, i) {
                return labelData[i] === name;
            });
        }

    });
            
    return ScatterChart;
            
});