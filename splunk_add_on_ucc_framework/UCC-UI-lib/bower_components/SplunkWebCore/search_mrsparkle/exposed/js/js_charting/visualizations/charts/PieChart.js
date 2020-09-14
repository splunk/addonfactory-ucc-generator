define([
            'jquery',
            'underscore',
            'highcharts',
            'splunk.i18n',
            './Chart',
            'splunk.util',
            '../../components/PieChartDataLabels',
            '../../helpers/HoverEventThrottler',
            '../../series/series_factory',
            '../../util/lang_utils',
            '../../util/parsing_utils',
            'util/general_utils'
        ], 
        function(
            $,
            _,
            Highcharts,
            i18n,
            Chart,
            splunkUtils,
            DataLabels,
            HoverEventThrottler,
            seriesFactory,
            langUtils,
            parsingUtils,
            general_utils
        ) {

    var PieChart = function(container, properties) {
        Chart.call(this, container, properties);
    };
    langUtils.inherit(PieChart, Chart);

    $.extend(PieChart.prototype, {

        SLICE_NAME_FIELD_INDEX: 0,
        SLICE_SIZE_FIELD_INDEX: 1,

        hasLegend: false,
        hasXAxis: false,
        hasYAxis: false,

        shouldUpdateInPlace: function() {
            return false;
        },

        processProperties: function() {
            Chart.prototype.processProperties.call(this);
            this.showLabels = this.isEmpty() ? false : parsingUtils.normalizeBoolean(this.properties['chart.showLabels'], true);
        },

        prepare: function(dataSet, properties) {
            Chart.prototype.prepare.call(this, dataSet, properties);
            if(this.showLabels) {
                this.initializeDataLabels();
            }
        },

        handleDraw: function(callback) {
            this.destroyCustomRenderer();
            if(this.isEmpty()) {
                this.benchmark('Draw Started');
                this.drawEmptyPieChart();
                this.benchmark('Draw Finished');
                callback(this, this.benchmarks);
                return;
            }
            Chart.prototype.handleDraw.call(this, callback);
        },

        initializeFields: function() {
            var dataFields = this.dataSet.allDataFields();
            this.sliceNameField = dataFields[this.SLICE_NAME_FIELD_INDEX];
            this.sliceSizeField = dataFields[this.SLICE_SIZE_FIELD_INDEX];
        },

        isEmpty: function() {
            if(this.dataSet){
                return (!this._sizeValuesAreNumeric() || this.dataSet.allDataFields().length < 2);
            }
            else {
                return false;
            }
        },

        hasTimeXAxis: function() {
            return false;
        },

        _sizeValuesAreNumeric: function() {
            return general_utils.valuesAreNumeric(this.dataSet.seriesList[this.SLICE_SIZE_FIELD_INDEX]);
        },

        _getInvalidDataMessage: function() {
            // If there is not enough data, message is no results
            if(!this.dataSet || this.dataSet.allDataFields().length < 2) {
                return _('No Results').t();
            }
            else{
                // Note: we never expect to return 'Invalid data' it is here for completeness
                return this._sizeValuesAreNumeric() ? _('Invalid Data').t() : _('Numeric Data Required').t();
            }
        },

        shouldProgressiveDraw: function() {
            return false;
        },

        initializeSeriesPropertiesList: function() {
            var seriesProps = $.extend({}, this.properties, {
                name: this.sliceSizeField,
                type: 'pie',
                clickEnabled: this.chartClickEnabled
            });
            return [seriesProps];
        },

        setAllSeriesData: function() {
            var isTimeBased = this.seriesIsTimeBased(this.sliceNameField),
                spans;

            if(isTimeBased) {
                spans = this.dataSet.getSeriesAsFloats("_span");
            }

            this.seriesList[0].setData({
                names: this.dataSet.getSeries(this.sliceNameField),
                sizes: this.dataSet.getSeriesAsFloats(this.sliceSizeField, { nullValueMode: 'zero' }),
                spans: spans,
                isTimeBased: isTimeBased
            });
        },

        handlePointMouseOver: function(targetPoint) {
            this.seriesList[0].handlePointMouseOver(targetPoint);
            if(this.dataLabels) {
                this.dataLabels.selectLabel(targetPoint);
            }
        },

        handlePointMouseOut: function(targetPoint){
            this.seriesList[0].handlePointMouseOut(targetPoint);
            if(this.dataLabels) {
                this.dataLabels.unSelectLabel(targetPoint);
            }
        },

        handlePointClick: function(event, point) {
            var pointIndex = point.index,
                pointData = this.seriesList[0].getData()[pointIndex],
                sliceName = pointData[0],
                sliceSize = pointData[1].toString(),
                collapseFieldName = new RegExp("^" + this.seriesList[0].collapseFieldName),
                rowContext = {},
                pointClickEvent = {
                    type: 'pointClick',
                    modifierKey: event.modifierKey,
                    name: this.sliceNameField,
                    // 'value' will be inserted later based on series type
                    name2: this.sliceSizeField,
                    value2: sliceSize,
                    rowContext: rowContext
                };

            // Clicking on the collapsed slice for a _time based pie chart should just return a normal pointClickEvent,
            // not the special time-based one
            if(this.seriesIsTimeBased(this.sliceNameField) && !collapseFieldName.test(pointData[0])) {
                var isoTimeString = pointData[0];
                pointClickEvent.value = splunkUtils.getEpochTimeFromISO(isoTimeString);
                pointClickEvent._span = pointData[2];
                rowContext['row.' + this.sliceNameField] = pointClickEvent.value;
            }
            else {
                pointClickEvent.value = sliceName;
                rowContext['row.' + this.sliceNameField] = sliceName;
            }

            rowContext['row.' + this.sliceSizeField] = sliceSize;
            this.trigger(pointClickEvent);
        },

        initializeDataLabels: function() {
            var labelProps = {
                fontColor: this.fontColor,
                foregroundColorSoft: this.foregroundColorSoft,
                clickEnabled: parsingUtils.normalizeBoolean(this.properties['chart.clickEnabled'])
                    || parsingUtils.normalizeBoolean(this.properties['enableChartClick'])
            };
            if(this.dataLabels) {
                this.dataLabels.destroy();
            }
            this.dataLabels = new DataLabels(labelProps);
            var that = this,
                properties = {
                    highlightDelay: 75,
                    unhighlightDelay: 50,
                    onMouseOver: function(point){
                        that.seriesList[0].selectPoint(point);
                    },
                    onMouseOut: function(point){
                        that.seriesList[0].unSelectPoint(point);
                    }
                },
                throttle = new HoverEventThrottler(properties);

            this.dataLabels.on('mouseover', function(e, point) {
                throttle.mouseOverHappened(point);
            });
            this.dataLabels.on('mouseout', function(e, point) {
                throttle.mouseOutHappened(point);
            });
            // TODO [sff] add a click handler here for data label drilldown
        },

        getPlotOptionsConfig: function() {
            var that = this;
            return ({
                pie: {
                    dataLabels: $.extend(this.getDataLabelConfig(), {
                        formatter: function() {
                            var formatInfo = this;
                            return parsingUtils.escapeSVG(that.formatDataLabel(formatInfo));
                        }
                    }),
                    borderWidth: 0,
                    stickyTracking: false,
                    cursor: this.chartClickEnabled ? 'pointer' : 'default',
                    states: {
                        hover: {
                            brightness: 0
                        }
                    },
                    tooltip: {
                        followPointer: false
                    }
                }
            });
        },

        getDataLabelConfig: function() {
            if(!this.showLabels) {
                return {
                    enabled: false
                };
            }
            return this.dataLabels.getConfig();
        },

        applyColorPalette: function() {
            // FIXME: this is bad, find a way to encapsulate this in the PieSeries object
            this.BASE_CONFIG = $.extend({}, this.BASE_CONFIG, {
                colors: _(this.getFieldList()).map(this.computeFieldColor, this)
            });
        },

        addPercentToName: function(name, percentage) {
            if(parsingUtils.normalizeBoolean(this.properties['chart.showPercent'])) {
                return name + ', ' + i18n.format_percent(percentage / 100);
            }
            return name;
        },

        formatDataLabel: function(info) {
            return this.addPercentToName(info.point.name, info.percentage);
        },

        getSeriesPointInfo: function(series, hcPoint) {
            var pointIndex = hcPoint.index,
                pointData = series.hasPrettyData ? series.getPrettyData()[pointIndex] : series.getData()[pointIndex],
                pointName = this.addPercentToName(pointData[0], hcPoint.percentage),
                pointValue = pointData[1];

            return ({
                sliceFieldName: this.sliceNameField,
                sliceName: pointName,
                sliceColor: hcPoint.color,
                yValue: i18n.format_decimal(pointValue),
                yPercent: i18n.format_percent(hcPoint.percentage / 100)
            });
        },

        drawEmptyPieChart: function() {
            var width = this.$container.width(),
                height = this.$container.height(),
                // TODO [sff] this logic is duplicated in PieSeries translatePreHook()
                circleRadius = Math.min(height * 0.75, width / 3) / 2;

            this.renderer = new Highcharts.Renderer(this.container, width, height);

            this.renderer.circle(width / 2, height / 2, circleRadius).attr({
                fill: 'rgba(150, 150, 150, 0.3)',
                stroke: 'rgb(200, 200, 200)',
                'stroke-width': 1,
                'title': _('Invalid data: second column must be numeric for a pie chart').t()
            }).add();

            this.renderer.text(this._getInvalidDataMessage(), width / 2, height / 2)
            .attr({
                align: 'center'
            })
            .css({
                fontSize: '20px',
                color: 'rgb(200, 200, 200)'
            }).add();
        },

        setSize: function(width, height) {
            if(this.isEmpty()) {
                this.destroyCustomRenderer();
                this.drawEmptyPieChart();
            }
            else {
                Chart.prototype.setSize.call(this, width, height);    
            }
        },

        destroy: function() {
            this.destroyCustomRenderer();
            Chart.prototype.destroy.call(this);
        },

        destroyCustomRenderer: function() {
            if(this.renderer) {
                this.renderer.destroy();
                this.renderer = null;
                this.$container.empty();
            }
        }
    });

    return PieChart;

});