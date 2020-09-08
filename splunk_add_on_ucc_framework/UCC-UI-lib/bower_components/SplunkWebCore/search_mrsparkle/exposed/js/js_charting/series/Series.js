define([
            'jquery',
            'underscore',
            '../helpers/EventMixin',
            '../helpers/Formatter',
            '../util/color_utils',
            '../util/parsing_utils'
        ],
        function(
            $,
            _,
            EventMixin,
            Formatter,
            colorUtils,
            parsingUtils
        ) {

    var Point = function(hcPoint) {
        this.index = hcPoint.index;
        this.seriesName = hcPoint.series.name;
        this.name = hcPoint.name;
        this.y = hcPoint.y;
    };

    var Series = function(properties) {
        this.properties = this.normalizeProperties(properties || {});
        this.processProperties();
        this.id = _.uniqueId('series_');
        this.data = [];
        this._isDirty = false;
        this._dataIsDirty = false;
        this.UNHIGHLIGHTED_COLOR =
            colorUtils.addAlphaToColor(this.UNHIGHLIGHTED_BASE_COLOR, this.UNHIGHLIGHTED_OPACITY);
        this.UNHIGHLIGHTED_BORDER_COLOR =
            colorUtils.addAlphaToColor(this.UNHIGHLIGHTED_BORDER_BASE_COLOR, this.UNHIGHLIGHTED_OPACITY);
    };

    Series.prototype = $.extend({}, EventMixin, {

        STACK_MODE_MAP: {
            'default': null,
            'stacked': 'normal',
            'stacked100': 'percent'
        },
        CHART_PROPERTY_PREFIX_REGEX: /^chart\./,

        UNHIGHLIGHTED_OPACITY: 0.3,
        UNHIGHLIGHTED_BASE_COLOR: 'rgb(150, 150, 150)',
        UNHIGHLIGHTED_BORDER_BASE_COLOR: 'rgb(200, 200, 200)',
        DEFAULT_STACK_MODE: null,
        CHARTING_PROPERTY_WHITELIST: [],

        // a centralized normalization method for series properties, subclasses override or extend the
        // CHARTING_PROPERTY_WHITELIST with a list of property names (without the leading "chart.")
        // to be parsed from the chart properties passed to the constructor
        normalizeProperties: function(rawProps) {
            var normalizedProps = $.extend(true, {}, rawProps);
            _(normalizedProps).each(function(value, key) {
                if(this.CHART_PROPERTY_PREFIX_REGEX.test(key)) {
                    delete normalizedProps[key];
                    var strippedKey = key.replace(this.CHART_PROPERTY_PREFIX_REGEX, '');
                    if(_(this.CHARTING_PROPERTY_WHITELIST).contains(strippedKey)) {
                        normalizedProps[strippedKey] = value;
                    }
                }
            }, this);
            return normalizedProps;
        },

        // no-op to be overridden by sub-classes
        processProperties: function() { },

        redraw: function(redrawChart) {
            if(!this.hcSeries) {
                // this is not an error state, there are cases where a new series is added dynamically in an update
                return;
            }
            if(this.isDirty()) {
                this.hcSeries.update(this.getConfig(), redrawChart);
            }
            else if(this.dataIsDirty()) {
                this.hcSeries.setData(this.hasPrettyData ? this.prettyData : this.data, redrawChart);
            }
        },

        update: function(properties) {
            var oldProperties = this.properties;
            this.properties = this.normalizeProperties(properties);
            if(!_.isEqual(this.properties, oldProperties)) {
                this.processProperties();
                this._isDirty = true;
            }
        },

        setData: function(inputData) {
            var oldData = this.data;
            if(_(inputData.x).isUndefined()) {
                this.data = inputData.y;
            }
            else {
                this.data = _(inputData.x).map(function(value, i) {
                    return [value, inputData.y[i]];
                });
            }
            if(!_.isEqual(this.data, oldData)) {
                this._dataIsDirty = true;
            }
        },

        getData: function() {
            return this.data;
        },

        isDirty: function() {
            return this._isDirty;
        },

        dataIsDirty: function() {
            return this._dataIsDirty;
        },

        getXAxisIndex: function() {
            return this.properties.xAxis || 0;
        },

        getYAxisIndex: function() {
            return this.properties.yAxis || 0;
        },

        getName: function() {
            return this.properties.name;
        },

        getLegendKey: function() {
            return this.properties.legendKey || this.getName();
        },

        getFieldList: function() {
            return [this.getName()];
        },

        matchesName: function(name) {
            return name === this.getName();
        },

        applyColorMapping: function(colorMapping) {
            var oldColor = this.color;
            this.color = colorMapping[this.getName()];
            if(this.color !== oldColor) {
                this._isDirty = true;
            }
        },

        getColor: function() {
            return this.color;
        },

        getStackMode: function() {
            return this.STACK_MODE_MAP[this.properties['stacking']] || this.DEFAULT_STACK_MODE;
        },

        getType: function() {
            return this.type;
        },

        getConfig: function() {
            return ({
                type: this.type,
                id: this.id,
                name: this.getName(),
                color: this.color,
                data: this.hasPrettyData ? this.prettyData : this.data,
                xAxis: this.getXAxisIndex(),
                yAxis: this.getYAxisIndex(),
                stacking: this.getStackMode()
            });
        },

        onChartLoad: function(chart) { },

        onChartLoadOrRedraw: function(chart) {
            this.hcSeries = chart.get(this.id);
            // create a back-reference so we can get from the HighCharts series to this object
            this.hcSeries.splSeries = this;
            this._isDirty = false;
            this._dataIsDirty = false;
            this.hcSeries.options.states.hover.enabled = true;
            this.addEventHandlers(this.hcSeries);
            // FIXME: would be nice to find a way around this
            _(this.hcSeries.data).each(function(point, i) {
                if(point){
                    point.index = i;
                }
            });
        },

        addEventHandlers: function(hcSeries) {
            hcSeries.options.point.events = hcSeries.options.point.events || {};
            var that = this,
                pointEvents = hcSeries.options.point.events;

            pointEvents.mouseOver = function(e) {
                var hcPoint = this,
                    point = new Point(hcPoint);
                that.trigger('mouseover', [point, that]);
            };
            pointEvents.mouseOut = function(e) {
                var hcPoint = this,
                    point = new Point(hcPoint);
                that.trigger('mouseout', [point, that]);
            };

            if(parsingUtils.normalizeBoolean(this.properties['clickEnabled'])) {
                pointEvents.click = function(e) {
                    var hcPoint = this,
                        point = new Point(hcPoint),
                        clickEvent = {
                            type: 'click',
                            modifierKey: (e.ctrlKey || e.metaKey)
                        };
                    that.trigger(clickEvent, [point, that]);
                };
            }
        },

        destroy: function() {
            this.off();
            // remove the back-reference to avoid any reference loops that might confuse the GC
            if(this.hcSeries && this.hcSeries.splSeries) {
                this.hcSeries.splSeries = null;
            }
            this.hcSeries = null;
        },

        handlePointMouseOver: function(point) {
            this.bringToFront();
        },

        handleLegendMouseOver: function(fieldName) {
            this.bringToFront();
            this.highlight();
        },

        bringToFront: function() {
            if(this.hcSeries.group) {
                this.hcSeries.group.toFront();
            }
            if(this.hcSeries.trackerGroup) {
                this.hcSeries.trackerGroup.toFront();
            }
        },

        estimateMaxColumnWidths: function(hcChart, leftColData, rightColData) {
            var formatter = new Formatter(hcChart.renderer),
                fontSize = hcChart.options.tooltip.style.fontSize.replace("px", "");

            // Use the text in the columns to roughly estimate which column requires more space
            var maxLeftColWidth = -Infinity,
                maxRightColWidth = -Infinity;

            _.each(leftColData, function(datum) {
                var colWidth = formatter.predictTextWidth(datum, fontSize);
                if(colWidth > maxLeftColWidth) {
                    maxLeftColWidth = colWidth;
                }
            });

            _.each(rightColData, function(datum) {
                var colWidth = formatter.predictTextWidth(datum, fontSize);
                if(colWidth > maxRightColWidth) {
                    maxRightColWidth = colWidth;
                }
            });

            formatter.destroy();

            return { maxLeftColWidth: maxLeftColWidth, maxRightColWidth: maxRightColWidth };
        },

        // To be overridden by subclasses
        getTooltipRows: function(info) {
            var rows = [];
            if(info.xAxisIsTime) {
                rows.push([info.xValueDisplay]);
            }
            else {
                rows.push([info.xAxisName, info.xValueDisplay]);
            }
            rows.push([ { color: info.seriesColor, text: info.seriesName }, info.yValueDisplay ]);
            return rows;
        },

        // find a way to send the target series and target point to the handler just like a click event
        getTooltipHtml: function(info, hcChart) {
            info.seriesName = this.getName();
            info.seriesColor = this.getColor();

            var normalizeToText = function(cellInfo) {
                return _(cellInfo).isString() ? cellInfo : cellInfo.text;
            };

            var normalizeToColor = function(cellInfo) {
                return _(cellInfo).isString() ? null : cellInfo.color;
            };

            var tooltipRows = this.getTooltipRows(info),
                maxTooltipWidth = hcChart.chartWidth - 50,
                leftColData = _(tooltipRows).map(function(row) { return normalizeToText(row[0] || ''); }),
                rightColData = _(tooltipRows).map(function(row) { return normalizeToText(row[1] || ''); }),
                colResults = this.estimateMaxColumnWidths(hcChart, leftColData, rightColData),
                leftColRatio = colResults.maxLeftColWidth / (colResults.maxLeftColWidth + colResults.maxRightColWidth);

            // Make sure one column doesn't completely dominate the other
            if(leftColRatio > 0.9) {
                leftColRatio = 0.9;
            }
            else if(leftColRatio < 0.1) {
                leftColRatio = 0.1;
            }

            info.scaledMaxLeftColWidth = (leftColRatio * maxTooltipWidth) + "px";
            info.scaledMaxRightColWidth = ((1 - leftColRatio) * maxTooltipWidth) + "px";
            info.willWrap = (colResults.maxLeftColWidth + colResults.maxRightColWidth > maxTooltipWidth);

            return _(this.tooltipTemplate).template($.extend(info, {
                rows: tooltipRows,
                normalizeToText: normalizeToText,
                normalizeToColor: normalizeToColor
            }));
        },

        // stub methods to be overridden as needed by subclasses
        handlePointMouseOut: function(point) { },
        handleLegendMouseOut: function(fieldName) { },
        highlight: function() { },
        unHighlight: function() { },

        tooltipTemplate: '\
            <table class="highcharts-tooltip"\
                <% if(willWrap) { %>\
                    style="word-wrap: break-word; white-space: normal;"\
                <% } %>>\
                <% _(rows).each(function(row) { %>\
                    <tr>\
                        <% if(row.length === 1) { %>\
                            <td style="text-align: left; color: <%= normalizeToColor(row[0]) || "#ffffff" %>;" colpsan="2"><%- normalizeToText(row[0]) %></td>\
                        <% } else { %>\
                            <td style="text-align: left; color: <%= normalizeToColor(row[0]) || "#cccccc" %>; max-width: <%= scaledMaxLeftColWidth %>;"><%- normalizeToText(row[0]) %>:&nbsp;&nbsp;</td>\
                            <td style="text-align: right; color: <%= normalizeToColor(row[1]) || "#ffffff" %>; max-width: <%= scaledMaxRightColWidth %>;"><%- normalizeToText(row[1]) %></td>\
                        <% } %>\
                    </tr>\
                <% }); %>\
            </table>\
        '

    });

    Series.Point = Point;

    return Series;

});
