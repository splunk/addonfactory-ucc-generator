/* globals assert, Promise */
define([
            'jquery',
            'underscore',
            'js_charting/js_charting',
            'js_charting/util/async_utils',
            'js_charting/util/testing_utils',
            'js_charting/util/color_utils',
            'js_charting/visualizations/charts/Chart',
            'js_charting/series/Series',
            'js_charting/series/ManyShapeSeries',
            'js_charting/series/AreaSeries',
            'js_charting/series/PieSeries',
            'js_charting/components/axes/TimeAxis',
            'js_charting/components/axes/NumericAxis',
            'mocks/mockify',
            'splunk.i18n'
        ],
        function(
            $,
            _,
            jsCharting,
            asyncUtils,
            testingUtils,
            colorUtils,
            Chart,
            Series,
            ManyShapeSeries,
            AreaSeries,
            PieSeries,
            TimeAxis,
            NumericAxis,
            mockify,
            i18n
        ) {

    /**
     * @author sfishel
     *
     * A shared QUnit module for testing charts
     */

    var BaseModule = {

        setup: function() {
            // Set up an event that will allow whatever chart is currently under test to know if a test failure occurs
            // and add itself to the list of failed charts to be displayed after the suite is complete.
            // See drawChart and teardown.
            this.failedCharts = [];

            // QUnit.log(_(function() {
            //   $(this).trigger('qunit-log', arguments);
            // }).bind(this));
            // QUnit.log is no longer available.
            // TODO: replace this (and the matching block in drawChart below) with a Mocha equivalent
            //
            this.clock = sinon.useFakeTimers();
            this.debugMode = false;
            // by default make sure charts do not use progressive draw, but allow customization in an individual test
            this.progressiveDrawThreshold = Infinity;
            this.$container = $('<div />').appendTo('body').css('border', '1px solid black');
            assert.ok(true, 'Chart testing module setup successful');
        },

        // Helpers for drawing test charts under various conditions
        // ------------------------------------------------------------------------

        drawChart: function(data, props, callback) {
            var failure = null;
            $(this).on('qunit-log', function(event, details) {
                if(details.result === false) {
                    failure = details;
                }
            });

            this.onBeforeChartCreate(data, props);
            this.chart = jsCharting.createChart(this.$container[0], props);
            this.chart.PROGRESSIVE_DRAW_THRESHOLD = this.progressiveDrawThreshold;
            this.onAfterChartCreate(data, props);

            //chai wants real promises, some tests require jquery deferred -> fake them
            //TODO: rework this once we've upgraded to jquery 3.x
            var p = new Promise(function(f, r) {
                this.chart.prepareAndDraw(jsCharting.extractChartReadyData(data), props, _(function(chart) {
                    var hcChart = chart.hcChart;
                    if(this.debugMode) {
                        window.hcChart = hcChart;
                    }
                    this.onAfterChartDraw(hcChart);
                    callback.call(this, hcChart);

                    $(this).off('qunit-log');
                    if(failure) {
                        failure.$chart = this.$container.detach();
                        this.$container = $('<div />').appendTo('body').css('border', '1px solid black');
                        this.failedCharts.push(failure);
                        this.chart = null;
                        var i, assertions = QUnit.config.current.assertions;
                        for(i = assertions.length - 1; i >= 0; i--) {
                            if(!assertions[i].result && assertions[i].message.indexOf(failure.message) > -1) {
                                failure.index = i;
                                break;
                            }
                        }
                    }
                    f();
                }).bind(this)).then(function() {
                    p.state = function() {
                        return 'resolved';
                    };
                });
            }.bind(this));

            p.state = function() {
                return 'pending';
            };

            return p;
        },

        // hooks to be used by individual test suites
        onBeforeChartCreate: function() {},
        onAfterChartCreate: function() {},
        onAfterChartDraw: function() {},

        updateInPlace: function(newData, newProps, callback, options) {
            options = options || {};
            var that = this,
                dataSet = jsCharting.extractChartReadyData(newData);

            sinon.spy(this.chart, 'redrawInPlace');
            this.chart.prepareAndDraw(dataSet, newProps || {}, function(chart) {
                if(options.expectRedrawInPlace !== false) {
                    assert.equal(that.chart.redrawInPlace.callCount, 1, 'redrawInPlace was called');
                }
                else {
                    assert.equal(that.chart.redrawInPlace.callCount, 0, 'redrawInPlace was not called');
                }
                that.chart.redrawInPlace.restore();
                callback.call(that, chart.hcChart);
            });
        },

        useSpiedChartComponents: function() {
            this._restoreToChartProto = {
                initializeSeriesList: Chart.prototype.initializeSeriesList,
                initializeYAxisList: Chart.prototype.initializeYAxisList,
                initializeXAxisList: Chart.prototype.initializeXAxisList,
                initializeLegend: Chart.prototype.initializeLegend
            };
            Chart.prototype.initializeSeriesList = _(Chart.prototype.initializeSeriesList).wrap(function(original) {
                original.call(this);
                _(this.seriesList).each(mockify);
            });
            Chart.prototype.initializeXAxisList = _(Chart.prototype.initializeXAxisList).wrap(function(original) {
                original.call(this);
                _(this.xAxisList).each(mockify);
            });

            Chart.prototype.initializeYAxisList = _(Chart.prototype.initializeYAxisList).wrap(function(original) {
                original.call(this);
                _(this.yAxisList).each(mockify);
            });
            Chart.prototype.initializeLegend = _(Chart.prototype.initializeLegend).wrap(function(original) {
                original.call(this);
                mockify(this.legend);
            });
        },

        restoreSpiedChartComponents: function() {
            _(this._restoreToChartProto).each(function(fn, fnName) {
                Chart.prototype[fnName] = fn;
            });
        },

        useFakeFrames: function() {
            sinon.stub(asyncUtils, 'requestFrame', function() {
                return _.uniqueId('frame_');
            });
            sinon.stub(asyncUtils, 'cancelFrame');
            return ({
                advance: function() {
                    asyncUtils.requestFrame.lastCall['yield']();
                },
                restore: function() {
                    asyncUtils.requestFrame.restore();
                    asyncUtils.cancelFrame.restore();
                }
            });
        },

        drawChartProgressive: function(data, props, callback) {
            this.progressiveDrawThreshold = 0;
            var isDone = false,
                frames = this.useFakeFrames();

            this.drawChart(data, props, function() {
                isDone = true;
                frames.restore();
            });

            // important that an exception in the callback will not leave frames un-restored, as this will break later tests
            try {
                callback.call(
                    this,
                    this.chart.hcChart,
                    function() { frames.advance(); },
                    function() { while(!isDone) { frames.advance(); } }
                );
            }
            catch(e) {
                frames.restore();
                throw e;
            }
        },

        // Helpers for executing a test routine against a variety of chart sizes
        // --------------------------------------------------------------------------------

        testWidths: [500, 750, 1000, 1250, 2000],
        testHeights: [300, 400, 500, 600],

        withAllTestWidths: function(data, props, callback) {
            _(this.testWidths).each(function(width) {
                this.$container.width(width);
                assert.ok(true, 'testing with width = ' + width);
                this.drawChart(data, props, function(hcChart) {
                    callback.call(this, hcChart);
                });
            }, this);
        },

        withAllTestHeights: function(data, props, callback) {
            _(this.testHeights).each(function(height) {
                this.$container.height(height);
                assert.ok(true, 'testing with height = ' + height);
                this.drawChart(data, props, function(hcChart) {
                    callback.call(this, hcChart);
                });
            }, this);
        },

        // Helpers for zooming and panning
        // -------------------------------------------------------------------------------

        simulateZoom: function(chart, min, max) {
            var startPointCoords = testingUtils.getPointCoordinates(chart, 0, min),
                endPointCoords = testingUtils.getPointCoordinates(chart, 0, max);

            var startEventData = {
                    pageX: startPointCoords.x + 1,
                    pageY: startPointCoords.y
                },
                endEventData = {
                    pageX: (min === max ? startPointCoords.x + 10 : endPointCoords.x + 1),
                    pageY: (min === max ? startPointCoords.y + 10 : endPointCoords.y)
                };

            $(chart.container).trigger($.Event('mousedown', startEventData));
            this.clock.tick(5);
            $(chart.container).trigger($.Event('mousemove', endEventData));
            this.clock.tick(5);
            $(chart.container).trigger($.Event('mouseup', endEventData));
        },

        simulateZoomOut: function(hcChart) {
            hcChart.zoomOut();
        },

        simulatePan: function(hcChart, direction, action, units){
            var panLeftButton = this.chart.panButtons.panLeftButton,
                panRightButton = this.chart.panButtons.panRightButton;

            if(action === 'click'){
                // units: clicks
                while(units > 0){
                    if(direction === 'left'){
                        panLeftButton.trigger('click');
                    }else if(direction === 'right'){
                        panRightButton.trigger('click');
                    }
                    units -= 1;
                    this.clock.tick(50);
                }
            }else if(action === 'press'){
                // units: milliseconds
                if(direction === 'left'){
                    panLeftButton.trigger('mousedown');
                }else if(direction === 'right'){
                   panRightButton.trigger('mousedown');
                }
                while(units > 0){
                    this.clock.tick(100);
                    units -= 100;
                }
                if(direction === 'left'){
                    panLeftButton.trigger('mouseup');
                }else if(direction === 'right'){
                    panRightButton.trigger('mouseup');
                }
            }
        },

        simulateTouchZoomOut: function(chart) {
            var yCoord = $(chart.container).offset().top + chart.plotHeight - 20;
            // create touches hash on the touch event
            var leftTouchStart = {
                    pageX: chart.plotLeft + 20,
                    pageY: yCoord
                },
                rightTouchStart = {
                    pageX: chart.plotLeft + chart.plotWidth - 20,
                    pageY: yCoord
                },
                leftTouchEnd = {
                    pageX: chart.plotLeft + 440,
                    pageY: yCoord
                },
                rightTouchEnd = {
                    pageX: chart.plotLeft + chart.plotWidth - 440,
                    pageY: yCoord
                },
                touchStart = [ leftTouchStart, rightTouchStart ],
                touchEnd = [ leftTouchEnd, rightTouchEnd ],
                startEventData = {
                    pageX: chart.plotLeft + 20,
                    pageY: yCoord,
                    touches: touchStart
                },
                endEventData = {
                    pageX: chart.plotLeft + 440,
                    pageY: yCoord,
                    touches: touchEnd
                };

            touchStart.item = touchEnd.item = function(i){
                return this[i];
            };

            $(chart.container).trigger(new $.Event('touchstart', startEventData));
            this.clock.tick(50);
            $(chart.container).trigger(new $.Event('touchmove', endEventData));
            this.clock.tick(50);
            $(document).trigger(new $.Event('touchend', endEventData));
            this.clock.tick(50);
        },

        simulateTouchZoomIn: function(chart, min, max) {
            // simulate pinch zoom
            var leftPointCoords = testingUtils.getPointCoordinates(chart, 0, min),
                rightPointCoords,
                yCoord = $(chart.container).offset().top + chart.plotHeight - 20;

            if(min === max){
                rightPointCoords = testingUtils.getPointCoordinates(
                    chart,
                    0,
                    max + (this.axisHasTickmarksBetween(chart.xAxis[0]) ? 1 : 0)
                );
            }else{
                rightPointCoords = testingUtils.getPointCoordinates(chart, 0, max);
            }
            var leftTouchStart = {
                    pageX: leftPointCoords.x - 15,
                    pageY: yCoord
                },
                rightTouchStart = {
                    pageX: rightPointCoords.x + 15,
                    pageY: yCoord
                },
                leftTouchEnd = {
                    pageX: chart.plotLeft + 15,
                    pageY: yCoord
                },
                rightTouchEnd = {
                    pageX: chart.plotLeft + chart.plotWidth - 15,
                    pageY: yCoord
                },
                touchStart = [ leftTouchStart, rightTouchStart ],
                touchEnd = [ leftTouchEnd, rightTouchEnd ],
                startEventData = {
                    pageX: leftPointCoords.x + 1,
                    pageY: yCoord,
                    touches: touchStart
                },
                endEventData = {
                    pageX: chart.plotLeft,
                    pageY: yCoord,
                    touches: touchEnd
                };

            touchStart.item = touchEnd.item = function(i){
                return this[i];
            };

            $(chart.container).trigger(new $.Event('touchstart', startEventData));
            this.clock.tick(50);
            $(chart.container).trigger(new $.Event('touchmove', endEventData));
            this.clock.tick(50);
            $(document).trigger(new $.Event('touchend', endEventData));
            this.clock.tick(50);
        },

        simulateTouchPan: function(chart, direction) {
            var yCoord = $(chart.container).offset().top + chart.plotHeight - 15,
                rightTouchObject = [
                    {
                        pageX: chart.plotLeft + chart.plotWidth - 15,
                        pageY: yCoord
                    }
                ],
                leftTouchObject = [
                    {
                        pageX: chart.plotLeft + 15,
                        pageY: yCoord
                    }
                ];
            // Must provide 'item' method on touch object for Highcharts onContainerTouchStart
            // event normalization that occurs for 1-touch events
            rightTouchObject.item = leftTouchObject.item = function(i){
                return this[i];
            };
            // simulate touch drag and release
            var chartLeft = {
                    pageX: chart.plotLeft + 15,
                    pageY: yCoord,
                    touches: leftTouchObject
                },
                chartRight = {
                    pageX: chart.plotLeft + chart.plotWidth - 15,
                    pageY: yCoord,
                    touches: rightTouchObject
                },
                startEventData = (direction === 'left' ? chartLeft : chartRight),
                endEventData = (direction === 'left' ? chartRight : chartLeft);
            $(chart.container).trigger($.Event('touchstart', startEventData));
            this.clock.tick(50);
            $(chart.container).trigger($.Event('touchmove', endEventData));
            this.clock.tick(50);
            $(chart.container).trigger($.Event('touchend', endEventData));
            this.clock.tick(50);
        },

        // Helpers for asserting legend content or alignment
        // ---------------------------------------------------------------------------------

        assertLegendItems: function(chart, expected, message) {
            var items = [];
            _(chart.series).map(function(series) {
                if(series.legendItem) {
                    items.push(series.legendItem.textStr);
                }
            });
            assert.deepEqual(items, expected, message || 'legend items are correct');

        },

        // Helpers for asserting tooltip content or alignment
        // ----------------------------------------------------------------------------------

        getTooltipValues: function(pointIndex, seriesIndex, hcChart) {
            this.simulatePointMouseOver(hcChart, seriesIndex, pointIndex);
            var values = _($(hcChart.container).find('table.highcharts-tooltip tr')).map(function(tr) {
                return _($(tr).find('td, th')).map(function(td) {
                    return $(td).text().replace(/:\s*$/, '');
                });
            });
            this.simulatePointMouseOut(hcChart, seriesIndex, pointIndex);
            return values;
        },

        getTooltip: function(pointIndex, seriesIndex, hcChart) {
            this.simulatePointMouseOver(hcChart, seriesIndex, pointIndex);
            var $tooltip = this.$container.find('div.highcharts-tooltip').clone();
            this.simulatePointMouseOut(hcChart, seriesIndex, pointIndex);
            return $tooltip;
        },

        getTooltipLabels: function(pointIndex, seriesIndex, hcChart) {
            var $tooltip = this.getTooltip(pointIndex, seriesIndex, hcChart),
                labels = [];

            _($tooltip.find('tr')).each(function(row) {
                var rowLabels = [],
                    $row = $(row);

                rowLabels.push($.trim($row.find('td:first').text().split(':')[0]));
                rowLabels.push($.trim($row.find('td:last').text()));
                labels.push(rowLabels);
            });
            return labels;
        },

        // allow three pixel differences either way
        assertTooltipOffset: function(pointIndex, seriesIndex, hcChart, expected, message) {
            this.simulatePointMouseOver(hcChart, seriesIndex, pointIndex);
            var $tooltip = this.$container.find('div.highcharts-tooltip table');
            var containerOffset = this.$container.offset();
            var tooltipOffset = $tooltip.offset();
            var adjustedOffset = {
                top: Math.round(tooltipOffset.top - containerOffset.top),
                left: Math.round(tooltipOffset.left - containerOffset.left)
            };
            var tolerance = 4;
            if(expected.hasOwnProperty('top')) {
                assert.closeTo(adjustedOffset.top, expected.top, tolerance, 'top: ' + message);
            }
            if(expected.hasOwnProperty('left')) {
                assert.closeTo(adjustedOffset.left, expected.left, tolerance, 'left: ' + message);
            }
            this.simulatePointMouseOut(hcChart, seriesIndex, pointIndex);
        },

        // Helpers for asserting axis content or alignment
        // ----------------------------------------------------------------------------------

        horizontalTickLabelOffset: 0,
        verticalTickLabelOffset: -7,

        axisHasTickmarksBetween: function(axis) {
            return axis.options.tickmarkPlacement === 'between';
        },

        isTimeAxis: function(axis) {
            var matchingSplunkAxis = _.chain(this.chart.xAxisList).union(this.chart.yAxisList).findWhere({ hcAxis: axis }).value();
            return (matchingSplunkAxis instanceof TimeAxis);
        },

        isNumericAxis: function(axis) {
            var matchingSplunkAxis = _.chain(this.chart.xAxisList).union(this.chart.yAxisList).findWhere({ hcAxis: axis }).value();
            return (matchingSplunkAxis instanceof NumericAxis);
        },

        getNextTick: function(currentTick) {
            var ticks = currentTick.axis.ticks;
            return _(ticks)
                .chain()
                .filter(function(tick) { return tick.pos > currentTick.pos; })
                .sortBy('pos')
                .first()
                .value();
        },

        getPreviousTick: function(currentTick) {
            var ticks = currentTick.axis.ticks;
            return _(ticks)
                .chain()
                .filter(function(tick) { return tick.pos < currentTick.pos; })
                .sortBy('pos')
                .last()
                .value();
        },

        assertAxisLabels: function(axis, expected, message) {
            var labels = _(axis.ticks).chain()
                .sortBy(function(tick) { return tick.pos; })
                .filter(this.tickLabelIsVisible)
                .map(function(tick) { return tick.label.textStr; })
                .value();

            assert.deepEqual(labels, expected, message || (axis.coll + ' axis labels are correct'));
        },

        assertAxisTitle: function(axis, expected, message) {
            var title = axis.axisTitle.textStr;

            assert.deepEqual(title, expected, message || (axis.coll + ' axis titles are correct'));
        },

        getTickVerticalBounds: function(tick) {
            var boundsTop, boundsBottom;
            if(this.isTimeAxis(tick.axis) || this.isNumericAxis(tick.axis)) {
                boundsTop = $(tick.mark.element).offset().top;
                if(tick.isLast) {
                    boundsBottom = this.$container.offset().top + tick.axis.chart.plotTop + tick.axis.chart.plotHeight;
                }
                else {
                    var nextTick = this.getNextTick(tick);
                    boundsBottom = $(nextTick.mark.element).offset().top;
                }
            }
            else {
                if(tick.isFirst) {
                    boundsTop = this.$container.offset().top + tick.axis.chart.plotTop;
                }
                else {
                    var previousTick = this.getPreviousTick(tick);
                    boundsTop = $(previousTick.mark.element).offset().top;
                }
                boundsBottom = $(tick.mark.element).offset().top;
            }
            return { top: boundsTop, bottom: boundsBottom };
        },

        assertVerticallyCenteredLabel: function(tick, message) {
            var bounds = this.getTickVerticalBounds(tick),
                boundsCenter = (bounds.top + bounds.bottom) / 2,
                labelCenter = $(tick.label.element).offset().top + ($(tick.label.element).height() / 2);

            assert.closeTo(labelCenter, boundsCenter, 2, message || 'tick ' + tick.pos + ' is vertically centered correctly');
        },

        assertTopAlignedLabel: function(tick, message) {
            var bounds = this.getTickVerticalBounds(tick),
                labelTop = $(tick.label.element).offset().top;
            message = message || 'tick ' + tick.pos + ' is correctly top-aligned';
            assert.closeTo(bounds.top + this.verticalTickLabelOffset, labelTop, 2, message);
        },

        assertHorizontalLabelAlignment: function(tick, tickDescription, expectedLabelOffset) {
            var boundsLeft, boundsRight,
                tickLabelOffset = expectedLabelOffset || this.horizontalTickLabelOffset,
                left = $(tick.label.element).offset().left,
                right = left + $(tick.label.element).width(),
                labelCenter = ($(tick.label.element).width() / 2) + left;

            if(this.axisHasTickmarksBetween(tick.axis) && !this.isTimeAxis(tick.axis) && !this.isNumericAxis(tick.axis)) {
                if(tick.isFirst) {
                    boundsLeft = this.$container.offset().left + tick.axis.chart.plotLeft;
                }
                else {
                    var previousTick = this.getPreviousTick(tick);
                    boundsLeft = $(previousTick.mark.element).offset().left;
                }
                boundsRight = $(tick.mark.element).offset().left;
            }
            else {
                boundsLeft = $(tick.mark.element).offset().left;
                if(tick.isLast) {
                    boundsRight = this.$container.offset().left + tick.axis.chart.plotLeft + tick.axis.chart.plotWidth;
                }
                else {
                    var nextTick = this.getNextTick(tick);
                    boundsRight = $(nextTick.mark.element).offset().left;
                }
            }

            tickDescription = tickDescription || 'tick ' + tick.pos;

            if(this.isTimeAxis(tick.axis)) {
                assert.closeTo(left, boundsLeft + tickLabelOffset, 2.5,
                    tickDescription + ' has the correct left alignment');
            }
            else if (this.isNumericAxis(tick.axis)){
                assert.closeTo(labelCenter, boundsLeft, 3,
                        tickDescription + ' has the correct left alignment');
            }
            else {
                if(this.axisHasTickmarksBetween(tick.axis)){
                    var areaSize = boundsRight - boundsLeft;
                    var areaCenter = (areaSize / 2) + boundsLeft;
                    assert.closeTo(labelCenter, areaCenter, 3,
                                            tickDescription + ' has the correct left alignment');
                }
                else {
                    assert.closeTo(labelCenter, boundsLeft, 3,
                        tickDescription + ' has the correct left alignment');
                }
            }

            // TODO [sff] we're having to code in a lot of wiggle room for this check since it depends on the
            //      accuracy of the text width prediction.
            assert.ok(right <= boundsRight + 1, tickDescription + ' does not overflow its boundary');

        },

        tickLabelIsVisible: function(tick) {
            if(!tick.label) {
                return false;
            }
            return $(tick.label.element).attr('visibility') !== 'hidden';
        },

        // Helpers for dynamically generating chart data sets
        // ------------------------------------------------------------------------------------

        createTimeSeries: function(length) {
            var series = [];
            _.times(length, function(i) {
                var seconds = i % 60, minutes = Math.floor(i / 60);
                series.push('1981-08-18T00:' + i18n.format_number(minutes, '00') + ':' + i18n.format_number(seconds, '00') + '.000-08:00');
            });
            return series;
        },

        createCategorySeries: function(length) {
            var series = [];
            _.times(length, function() { series.push('abc'); });
            return series;
        },

        createDataSeries: function(length, value) {
            var series = [];
            _.times(length, function() { series.push(value || Math.random() * 1000); });
            return series;
        },

        createDataSetFromMinMax: function(minValue, maxValue) {
            return ({
                fields: ['x', 'y'],
                columns: [
                    ['A', 'B', 'C'],
                    [minValue, Math.round((minValue + maxValue) / 2), maxValue]
                ]
            });
        },

        createDataSet: function(numSeries, seriesLength, options) {
            options = options || {};
            var fields = [],
                columns = [];

            if(options.timeSeries) {
                fields.push('_time');
                columns.push(this.createTimeSeries(seriesLength));
                fields.push('_span');
                columns.push(this.createDataSeries(seriesLength, '1'));
            }
            else {
                fields.push('x');
                columns.push(this.createCategorySeries(seriesLength));
            }

            var that = this;
            _.times(numSeries, function(i) {
                fields.push('field-' + (i + 1));
                columns.push(that.createDataSeries(seriesLength));
            });

            return { fields: fields, columns: columns };
        },

        // Helpers for simulating and testing click and hover events
        // ----------------------------------------------------------------------------------------------

        inputSeriesColors: '[0xff0000, 0x00ff00, 0x0000ff]',
        outputSeriesColors: ['rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(0,0,255)'],
        unhighlightedFill: Series.prototype.UNHIGHLIGHTED_BASE_COLOR.replace(/\s/g, ''),
        unhighlightedFillOpacity: Series.prototype.UNHIGHLIGHTED_OPACITY,
        // Pie series have different unhighlighted color/fill because of SPL-72988.
        pieUnhighlightedFill: colorUtils.addAlphaToColor(PieSeries.prototype.UNHIGHLIGHTED_BASE_COLOR.replace(/\s/g, ''), 1),
        pieUnhighlightedFillOpacity: PieSeries.prototype.UNHIGHLIGHTED_OPACITY,
        unhighlightedBorderColor: colorUtils.addAlphaToColor(ManyShapeSeries.prototype.UNHIGHLIGHTED_BORDER_BASE_COLOR.replace(/\s/g, ''), 1),
        unhighlightedStroke: Series.prototype.UNHIGHLIGHTED_BASE_COLOR.replace(/\s/g, ''),
        unhighlightedStrokeOpacity: Series.prototype.UNHIGHLIGHTED_OPACITY,
        areaFillOpacity: AreaSeries.prototype.HIGHLIGHTED_OPACITY,
        areaUnhighlightedStrokeOpacity: AreaSeries.prototype.UNHIGHLIGHTED_LINE_OPACITY,

        activeSeriesVerifiers: {
            column: 'verifyColumnSeriesActive',
            bar: 'verifyColumnSeriesActive',
            line: 'verifyLineSeriesActive',
            area: 'verifyAreaSeriesActive',
            scatter: 'verifyColumnSeriesActive',
            bubble: 'verifyBubbleSeriesActive'
        },
        defaultSeriesVerifiers: {
            column: 'verifyColumnSeriesActive',
            bar: 'verifyColumnSeriesActive',
            line: 'verifyLineSeriesDefault',
            area: 'verifyAreaSeriesDefault',
            scatter: 'verifyColumnSeriesActive',
            bubble: 'verifyBubbleSeriesActive'
        },
        inactiveSeriesVerifiers: {
            column: 'verifyColumnSeriesInactive',
            bar: 'verifyColumnSeriesInactive',
            line: 'verifyLineSeriesInactive',
            area: 'verifyAreaSeriesInactive',
            scatter: 'verifyColumnSeriesInactive',
            bubble: 'verifyBubbleSeriesInactive'
        },
        activePointVerifiers: {
            column: 'verifyColumnPointActive',
            bar: 'verifyColumnPointActive',
            line: 'verifyLinePointActive',
            area: 'verifyAreaPointActive',
            scatter: 'verifyScatterPointActive',
            bubble: 'verifyBubblePointActive'
        },

        verifyShapeAttrs: function(wrapper, attrs, messagePrefix) {
            var $element = $(wrapper.element),
                isEqual;

            if(attrs.fillColor) {
                isEqual = this.isRGBAndRGBAEqual(attrs.fillColor, $element.attr('fill'));
                if (isEqual) {
                    assert.equal (true, isEqual, messagePrefix + ' has the correctFill color');
                } else {
                    assert.equal($element.attr('fill'), attrs.fillColor, messagePrefix + ' has the correct fill color');

                }
            }
            if(attrs.hasOwnProperty('fillOpacity')) {

                var elementFillOpacity = $element.attr('fill-opacity');
                var attrFillOpacity = attrs.fillOpacity;
                var elementFill = $element.attr('fill');
                if (elementFill) {
                    var elementRgb = $element.attr('fill').replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');
                    if (elementRgb.length === 4) {
                        elementFillOpacity = elementRgb[3];
                    }
                } else {
                    elementFillOpacity = $element.attr('fill-opacity');
                }
                elementFillOpacity = parseFloat(elementFillOpacity);
                if (isNaN(elementFillOpacity)){
                    elementFillOpacity = 1;
                }
                assert.equal(
                    elementFillOpacity,
                    attrs.fillOpacity,
                    messagePrefix + ' has the correct fill opacity'
                );
            }
            if(attrs.strokeColor) {
                isEqual = this.isRGBAndRGBAEqual($element.attr('stroke'),attrs.strokeColor);
                if (isEqual) {
                    assert.equal (true, isEqual, messagePrefix + ' has the correct stroke color');
                } else {
                    assert.equal(attrs.strokeColor,$element.attr('stroke'), messagePrefix + ' has the correct stroke color');
                }
            }
            if(attrs.hasOwnProperty('strokeWidth')) {
                assert.closeTo(
                    parseFloat(wrapper['stroke-width']) || 0,
                    attrs.strokeWidth,
                    0.000001,
                    messagePrefix + ' has the correct stroke width'
                );
            }
            if(attrs.hasOwnProperty('strokeOpacity')) {
                var elementStrokeOpacity = $element.attr('stroke-opacity'),
                    attrStrokeOpacity = attrs.strokeOpacity,
                    elementStroke = $element.attr('stroke');

                    if ($element.attr('stroke')){
                        var elementStrokeRgb = $element.attr('stroke').replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');
                        elementStrokeOpacity = elementStrokeRgb[3];
                    }

                assert.equal(parseFloat(elementStrokeOpacity) || 1, attrs.strokeOpacity, ' has the correct stroke opacity');
            }
            _(['x', 'y', 'width', 'height']).each(function(attrName) {
                if(attrs.hasOwnProperty(attrName)) {
                    assert.closeTo(
                        parseInt(wrapper.attr(attrName), 10),
                        parseInt(attrs[attrName], 10),
                        1,
                        messagePrefix + ' has the correct value for ' + attrName
                    );
                }
            });
        },

        waitForTooltipHide: function(hcChart) {
            if(hcChart.tooltip) {
                var hideDelay = hcChart.tooltip.options.hideDelay;
                this.clock.tick(hideDelay);
            }
        },

        simulatePointMouseOver: function(hcChart, seriesIndex, pointIndex) {
            var coords = testingUtils.getPointCoordinates(hcChart, seriesIndex, pointIndex),
                eventData = {
                    pageX: coords.x,
                    pageY: coords.y
                },
                series = hcChart.series[seriesIndex],
                seriesType = series.type;

            if(seriesType === 'pie' || seriesType === 'bubble') {
                $(series.data[pointIndex].graphic.element).trigger($.Event('mouseover', eventData));
            }
            else if(seriesType in { column: true, bar: true, line: true, area: true, scatter: true }) {
                $(series.tracker.element).trigger($.Event('mouseover', eventData));
                // a little bit of a cheat here, Highcharts fires the mouse over before setting the hover state
                // in production the mouse event throttler will take care of the timing issue
                if(seriesType === 'scatter') {
                    series.data[pointIndex].setState('hover');
                }
                $(series.tracker.element).trigger($.Event('mousemove', eventData));
            }
            else {
                throw new Error('unrecognized series type');
            }
        },

        simulatePointMouseOut: function(hcChart, seriesIndex, pointIndex) {
            var series = hcChart.series[seriesIndex],
                seriesType = series.type;

            if(seriesType in { column: true, bar: true, line: true, area: true, scatter: true }) {
                $(series.tracker.element).trigger('mouseout');
            }
            else if(seriesType === 'pie' || seriesType === 'bubble') {
                $(series.data[pointIndex].graphic.element).trigger('mouseout');
            }
            else {
                throw new Error('unrecognized series type');
            }
            this.waitForTooltipHide(hcChart);
        },

        verifyPointMarkerActive: function(hcChart, seriesIndex, pointIndex, seriesColor) {
            var series = hcChart.series[seriesIndex],
                point = series.data[pointIndex],
                marker = series.stateMarkerGraphic,
                markerOffset = $(marker.element).offset(),
                chartOffset = $(hcChart.container).offset();

            assert.ok(marker.attr('visibility'), 'the point marker is visible');
            assert.equal(marker.attr('fill'), seriesColor, 'the marker has the correct color');
            assert.closeTo(
                markerOffset.left,
                chartOffset.left + point.plotX + hcChart.plotLeft,
                10,
                'the marker has the correct x coordinate'
            );
            assert.closeTo(
                markerOffset.top,
                chartOffset.top + point.plotY + hcChart.plotTop,
                10,
                'the marker has the correct y coordinate'
            );
        },

        verifyPointMarkerInactive: function(hcChart, seriesIndex) {
            var series = hcChart.series[seriesIndex],
                marker = series.stateMarkerGraphic;

            assert.ok(!marker || marker.attr('visibility') === 'hidden', 'the point marker is not visible');
        },

        verifyColumnSeriesActive: function(hcChart, seriesIndex, seriesColor) {
            this.verifyShapeAttrs(hcChart.series[seriesIndex].area, {
                fillColor: seriesColor,
                fillOpacity: 1,
                strokeWidth: 0
            }, 'series ' + (seriesIndex + 1));
        },

        verifyColumnSeriesInactive: function(hcChart, seriesIndex) {
            var series = hcChart.series[seriesIndex];
            this.verifyShapeAttrs(series.area, {
                fillColor: this.unhighlightedFill,
                fillOpacity: this.unhighlightedFillOpacity,
                strokeColor: this.unhighlightedBorderColor,
                strokeWidth: 1
            }, 'series ' + (seriesIndex + 1));
            assert.ok(!series.splSeries.selectedPointGraphic, 'the active point graphic was removed');
        },

        verifyColumnPointActive: function(hcChart, seriesIndex, pointIndex, seriesColor) {
            var series = hcChart.series[seriesIndex],
                activePointShapeArgs = series.data[pointIndex].shapeArgs,
                selectedPointGraphic = series.splSeries.selectedPointGraphic;

            this.verifyShapeAttrs(series.area, {
                fillColor: this.unhighlightedFill,
                fillOpacity: this.unhighlightedFillOpacity,
                strokeColor: this.unhighlightedBorderColor,
                strokeWidth: 1
            }, 'series ' + (seriesIndex + 1));

            this.verifyShapeAttrs(selectedPointGraphic, { fillColor: seriesColor }, 'the active point graphic');
            assert.equal(selectedPointGraphic.attr('x'), activePointShapeArgs.x, 'the active graphic x value is correct');
            assert.equal(selectedPointGraphic.attr('y'), activePointShapeArgs.y, 'the active graphic y value is correct');
            assert.equal(selectedPointGraphic.attr('width'), activePointShapeArgs.width, 'the active graphic width value is correct');
            assert.equal(selectedPointGraphic.attr('height'), activePointShapeArgs.height, 'the active graphic height value is correct');
            assert.equal(selectedPointGraphic.attr('zIndex'), 1, 'the active graphic z-index is correct');
        },

        verifyLineSeriesActive: function(hcChart, seriesIndex, seriesColor) {
            var series = hcChart.series[seriesIndex];
            this.verifyShapeAttrs(series.graph, {
                strokeColor: seriesColor,
                strokeOpacity: 1,
                strokeWidth: 3
            }, 'line ' + (seriesIndex + 1));
        },

        verifyLineSeriesInactive: function(hcChart, seriesIndex) {
            var series = hcChart.series[seriesIndex];
            this.verifyPointMarkerInactive(hcChart, seriesIndex);
            this.verifyShapeAttrs(series.graph, {
                strokeColor: this.unhighlightedStroke,
                strokeOpacity: this.unhighlightedStrokeOpacity,
                strokeWidth: 2
            }, 'line ' + (seriesIndex + 1));
        },

        verifyLineSeriesDefault: function(hcChart, seriesIndex, seriesColor) {
            var series = hcChart.series[seriesIndex];
            this.verifyPointMarkerInactive(hcChart, seriesIndex);
            this.verifyShapeAttrs(series.graph, {
                strokeColor: seriesColor,
                strokeOpacity: 1,
                strokeWidth: 2
            }, 'line ' + (seriesIndex + 1));
        },

        verifyLinePointActive: function(hcChart, seriesIndex, pointIndex, seriesColor) {
            this.verifyLineSeriesActive(hcChart, seriesIndex, seriesColor);
            this.verifyPointMarkerActive(hcChart, seriesIndex, pointIndex, seriesColor);
        },

        verifyAreaSeriesActive: function(hcChart, seriesIndex, seriesColor) {
            var series = hcChart.series[seriesIndex];
            this.verifyShapeAttrs(series.graph, {
                strokeColor: seriesColor,
                strokeOpacity: 1,
                strokeWidth: 2
            }, 'line ' + (seriesIndex + 1));
            this.verifyShapeAttrs(series.area, {
                fillColor: seriesColor,
                fillOpacity: this.areaFillOpacity
            }, 'area ' + (seriesIndex + 1));
        },

        verifyAreaSeriesInactive: function(hcChart, seriesIndex) {
            var series = hcChart.series[seriesIndex];
            this.verifyPointMarkerInactive(hcChart, seriesIndex);
            this.verifyShapeAttrs(series.graph, {
                strokeColor: this.unhighlightedStroke,
                strokeOpacity: this.areaUnhighlightedStrokeOpacity,
                strokeWidth: 1
            }, 'line ' + (seriesIndex + 1));
            this.verifyShapeAttrs(series.area, {
                fillColor: this.unhighlightedFill,
                fillOpacity: this.unhighlightedFillOpacity
            }, 'area ' + (seriesIndex + 1));
        },

        verifyAreaSeriesDefault: function(hcChart, seriesIndex, seriesColor) {
            var series = hcChart.series[seriesIndex];
            this.verifyPointMarkerInactive(hcChart, seriesIndex);
            this.verifyShapeAttrs(series.graph, {
                strokeColor: seriesColor,
                strokeOpacity: 1,
                strokeWidth: 1
            }, 'line ' + (seriesIndex + 1));
            this.verifyShapeAttrs(series.area, {
                fillColor: seriesColor,
                fillOpacity: this.areaFillOpacity
            }, 'area ' + (seriesIndex + 1));
        },

        verifyAreaPointActive: function(hcChart, seriesIndex, pointIndex, seriesColor) {
            this.verifyAreaSeriesActive(hcChart, seriesIndex, seriesColor);
            this.verifyPointMarkerActive(hcChart, seriesIndex, pointIndex, seriesColor);
        },

        verifyPiePointHoverState: function(hcChart, pointIndex, pointColor) {
            _(hcChart.series[0].data).each(function(point, i) {
                if(i === pointIndex) {
                    this.verifyShapeAttrs(point.graphic, {
                        fillColor: pointColor,
                        fillOpacity: 1,
                        strokeWidth: 0
                    }, 'slice ' + (i + 1));
                    this.verifyShapeAttrs(point.dataLabel, {
                        fillOpacity: 1
                    }, 'label ' + (i + 1));
                }
                else {
                    this.verifyShapeAttrs(point.graphic, {
                        fillColor: this.pieUnhighlightedFill,
                        fillOpacity: this.pieUnhighlightedFillOpacity,
                        strokeWidth: 1,
                        strokeColor: this.unhighlightedBorderColor
                    }, 'slice ' + (i + 1));
                    this.verifyShapeAttrs(point.dataLabel, {
                        fillOpacity: this.unhighlightedFillOpacity
                    }, 'label ' + (i + 1));
                }
            }, this);
        },

        verifyScatterPointActive: function(hcChart, seriesIndex, pointIndex, seriesColor) {
            var series = hcChart.series[seriesIndex];
            this.verifyShapeAttrs(series.area, {
                fillColor: this.unhighlightedFill,
                fillOpacity: this.unhighlightedFillOpacity,
                strokeColor: this.unhighlightedBorderColor,
                strokeWidth: 1
            }, 'series ' + (seriesIndex + 1));

            var selectedPointGraphic = series.splSeries.selectedPointGraphic;
            this.verifyShapeAttrs(selectedPointGraphic, { fillColor: seriesColor }, 'the active point graphic');
            assert.ok(
                $.contains(series.group.element, selectedPointGraphic.element),
                'the selected point graphic is inside the series group'
            );
            assert.ok(
                $(selectedPointGraphic.element).index() < $(series.tracker.element).index(),
                'the selected point graphic is behind the tracker'
            );
            assert.ok(
                $(selectedPointGraphic.element).index() > $(series.area.element).index(),
                'the selected point graphic is in front of the selected point'
            );
        },

        verifyBubbleSeriesActive: function(hcChart, seriesIndex, seriesColor) {
            var series = hcChart.series[seriesIndex];
            _.each(series.data, function(point) {
                this.verifyShapeAttrs(point.graphic, {
                    fillColor: seriesColor,
                    fillOpacity: 0.5,
                    strokeWidth: 1
                }, 'series ' + (seriesIndex + 1));
            }, this);
        },

        verifyBubbleSeriesInactive: function(hcChart, seriesIndex) {
            var series = hcChart.series[seriesIndex];
            _.each(series.data, function(point) {
                this.verifyShapeAttrs(point.graphic, {
                    fillColor: this.unhighlightedFill,
                    fillOpacity: this.unhighlightedFillOpacity,
                    strokeColor: this.unhighlightedBorderColor,
                    strokeWidth: 1
                }, 'series ' + (seriesIndex + 1));
            }, this);
        },

        verifyBubblePointActive: function(hcChart, seriesIndex, pointIndex, seriesColor) {
            var series = hcChart.series[seriesIndex],
                point = series.data[pointIndex],
                marker = point.graphic,
                markerOffset = $(marker.element).offset(),
                chartOffset = $(hcChart.container).offset();
            assert.ok(series.group.attr('visibility'), 'the point marker & its series are visible');
            this.verifyShapeAttrs(point.graphic, {
                fillColor: seriesColor,
                fillOpacity: 0.5,
                strokeColor: seriesColor,
                strokeWidth: 2
            }, 'point' + (pointIndex + 1));
            assert.closeTo(
                markerOffset.left,
                chartOffset.left + point.plotX + hcChart.plotLeft - marker.attr('r'),
                10,
                'the marker has the correct x coordinate'
            );
            assert.closeTo(
                markerOffset.top,
                chartOffset.top + point.plotY + hcChart.plotTop - marker.attr('r'),
                10,
                'the marker has the correct y coordinate'
            );
        },

        verifyBubblePointInactive: function(hcChart, seriesIndex, pointIndex, seriesColor) {
            var series = hcChart.series[seriesIndex],
                point = series.data[pointIndex],
                marker = point.graphic,
                markerOffset = $(marker.element).offset(),
                chartOffset = $(hcChart.container).offset();
            assert.ok(series.group.attr('visibility'), 'the point marker & its series are visible');
            this.verifyShapeAttrs(point.graphic, {
                fillColor: this.unhighlightedFill,
                fillOpacity: this.unhighlightedFillOpacity,
                strokeColor: this.unhighlightedBorderColor,
                strokeWidth: 1
            }, 'point' + (pointIndex + 1));
            assert.closeTo(
                markerOffset.left,
                chartOffset.left + point.plotX + hcChart.plotLeft - marker.attr('r'),
                10,
                'the marker has the correct x coordinate'
            );
            assert.closeTo(
                markerOffset.top,
                chartOffset.top + point.plotY + hcChart.plotTop - marker.attr('r'),
                10,
                'the marker has the correct y coordinate'
            );
        },

        verifyLegendItemActive: function(hcChart, seriesIndex, seriesColor) {
            var series = hcChart.series[seriesIndex];
            if(series.legendSymbol) {
                var fillOpacity;
                if (series.chart.options.chart.type === "bubble") {
                    fillOpacity = 0.5;
                } else {
                    fillOpacity = 1;
                }
                this.verifyShapeAttrs(series.legendSymbol, {
                    fillColor: seriesColor,
                    fillOpacity: fillOpacity
                }, 'legend item ' + (seriesIndex + 1));
            }
            else {
                this.verifyShapeAttrs(series.legendLine, {
                    strokeColor: seriesColor
                }, 'legend item ' + (seriesIndex + 1));
            }
            this.verifyShapeAttrs(series.legendItem, {
                fillOpacity: 1
            }, 'legend text ' + (seriesIndex + 1));
        },

        verifyLegendItemInactive: function(hcChart, seriesIndex) {
            var series = hcChart.series[seriesIndex];
            if(series.legendSymbol) {
                this.verifyShapeAttrs(series.legendSymbol, {
                    fillColor: this.unhighlightedFill,
                    fillOpacity: 0.3
                }, 'legend item ' + (seriesIndex + 1));
            }
            else {
                this.verifyShapeAttrs(series.legendLine, {
                    strokeColor: this.unhighlightedStroke
                }, 'legend item ' + (seriesIndex + 1));
            }
            this.verifyShapeAttrs(series.legendItem, {
                fillOpacity: this.unhighlightedFillOpacity
            }, 'legend text ' + (seriesIndex + 1));
        },

        verifyPointHoverState: function(hcChart, seriesIndex, pointIndex, seriesColor) {
            _(hcChart.series).each(function(series, i) {
                if(i === seriesIndex) {
                    this[this.activePointVerifiers[series.type]](hcChart, i, pointIndex, seriesColor);
                    if(hcChart.legend.options.enabled) {
                        this.verifyLegendItemActive(hcChart, i, seriesColor);
                    }
                }
                else {
                    this[this.inactiveSeriesVerifiers[series.type]](hcChart, i);
                    if(hcChart.legend.options.enabled) {
                        this.verifyLegendItemInactive(hcChart, i);
                    }
                }
            }, this);
        },

        verifySeriesHoverState: function(hcChart, seriesIndex, seriesColor) {
            _(hcChart.series).each(function(series, i) {
                if(i === seriesIndex) {
                    this[this.activeSeriesVerifiers[series.type]](hcChart, i, seriesColor);
                    if(hcChart.legend.options.enabled) {
                        this.verifyLegendItemActive(hcChart, i, seriesColor);
                    }
                }
                else {
                    this[this.inactiveSeriesVerifiers[series.type]](hcChart, i);
                    if(hcChart.legend.options.enabled) {
                        this.verifyLegendItemInactive(hcChart, i);
                    }
                }
            }, this);
        },

        verifyDefaultState: function(hcChart, seriesColors) {
            _(hcChart.series).each(function(series, i) {
                // support for progressive draw tests, don't check a series that hasn't rendered
                if(!series.group) {
                    return;
                }
                this[this.defaultSeriesVerifiers[series.type]](hcChart, i, seriesColors[i]);
                if(hcChart.legend.options.enabled) {
                    this.verifyLegendItemActive(hcChart, i, seriesColors[i]);
                }
            }, this);
        },

        simulatePointClick: function(hcChart, seriesIndex, pointIndex) {
            var series = hcChart.series[seriesIndex],
                point = series.data[pointIndex];

            if(series.type in { column: true, line: true, area: true, scatter: true, bar: true }) {
                this.simulatePointMouseOver(hcChart, seriesIndex, pointIndex);
                $(series.tracker.element).trigger('click');
                this.simulatePointMouseOut(hcChart, seriesIndex, pointIndex);
            }
            else if(series.type === 'pie' || series.type === 'bubble') {
                this.simulatePointMouseOver(hcChart, seriesIndex, pointIndex);
                $(point.graphic.element).trigger('click');
                this.simulatePointMouseOut(hcChart, seriesIndex, pointIndex);
            }
            else {
                throw new Error('unrecognized series type');
            }
        },

        simulateLegendTextMouseOver: function(hcChart, seriesIndex) {
            $(hcChart.series[seriesIndex].legendItem.element).trigger('mouseover');
        },

        simulateLegendTextMouseOut: function(hcChart, seriesIndex) {
            $(hcChart.series[seriesIndex].legendItem.element).trigger('mouseout');
        },

        simulateLegendIconMouseOver: function(hcChart, seriesIndex) {
            var series = hcChart.series[seriesIndex];
            if(series.legendLine) {
                $(series.legendLine.element).trigger('mouseover');
            }
            else {
                $(series.legendSymbol.element).trigger('mouseover');
            }
        },

        simulateLegendIconMouseOut: function(hcChart, seriesIndex) {
            var series = hcChart.series[seriesIndex];
            if(series.legendLine) {
                $(series.legendLine.element).trigger('mouseout');
            }
            else {
                $(series.legendSymbol.element).trigger('mouseout');
            }
        },

        simulateLegendTextClick: function(hcChart, seriesIndex) {
            $(hcChart.series[seriesIndex].legendItem.element).trigger('click');
        },

        simulateLegendIconClick: function(hcChart, seriesIndex) {
            var series = hcChart.series[seriesIndex];
            if(series.legendLine) {
                $(series.legendLine.element).trigger('click');
            }
            else {
                $(series.legendSymbol.element).trigger('click');
            }
        },

        fullPointHoverTest: function(hcChart, colors) {
            colors = colors || this.outputSeriesColors;
            _(hcChart.series).each(function(series, i) {
                _(series.data).each(function(point, j) {
                    assert.ok(true, 'simulating a hover event on series ' + (i + 1) + ' point ' + (j + 1));
                    this.simulatePointMouseOver(hcChart, i, j);
                    assert.ok(!hcChart.tooltip.isHidden, 'the tooltip is visible');
                    this.verifyPointHoverState(hcChart, i, j, colors[i]);
                    this.simulatePointMouseOut(hcChart, i, j);
                    assert.ok(hcChart.tooltip.isHidden, 'the tooltip is hidden');
                }, this);
            }, this);
        },

        teardown: function() {
            this.clock.restore();
            if(!this.debugMode) {
                if(this.chart) {
                    if(this.chart.hcChart && this.chart.hcChart.pointer) {
                        this.chart.hcChart.pointer.reset();
                    }
                    this.chart.destroy();
                }
                this.$container.remove();
            }

            var displayFailedChart = function(failure) {
                var $testContainer = $('#qunit-tests > li.fail').filter(function() {
                    return (
                        $(this).find('span.module-name:contains(' + failure.module + ')').length > 0 &&
                        $(this).find('span.test-name:contains(' + failure.name + ')').length > 0
                    );
                });

                if($testContainer.length < 1) {
                    return;
                }
                var $assertionItems = $testContainer.find('.qunit-assert-list > li');
                failure.$chart.insertAfter($assertionItems.eq(failure.index));
            };
            setTimeout(_(function() {
                _(this.failedCharts).each(displayFailedChart, this);
            }).bind(this), 100);

            assert.ok(true, 'Chart testing module teardown successful');
        },

        isRGBAndRGBAEqual: function(rgb, rgba, callback) {
            rgb = rgb.replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');
            rgba = rgba.replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');
            for (var i = 0; i < 3; i++) {
                if (rgb[i] !== rgba[i]){
                    return false;
                }
            }
            return true;

        },

        getOpacityFromRGBA: function(rgba) {
            rgba = rgba.replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');
            return rgba[3];
        },

        assertConnectorPathWithinTolerance: function(actual, expected, tolerance, message) {
            var actualParts = actual.split(' '),
                expectedParts = expected.split(' ');

            if (actualParts.length !== expectedParts.length) {
                return false;
            }
            var passes = _(actualParts).all(function(part, i) {
                var floatPart = parseFloat(part);
                if (_.isNaN(floatPart)) {
                    return part === expectedParts[i];
                }
                return Math.abs((floatPart - parseFloat(expectedParts[i]))) <= tolerance;
            });
            assert.ok(passes, message);
        }


    };

    return ({

        BaseModule: BaseModule

    });

});