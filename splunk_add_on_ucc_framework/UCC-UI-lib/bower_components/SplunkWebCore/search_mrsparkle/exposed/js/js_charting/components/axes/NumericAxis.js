define([
            'jquery',
            'underscore',
            './Axis',
            '../../helpers/Formatter',
            '../../util/parsing_utils',
            '../../util/lang_utils',
            '../../util/math_utils',
            'splunk.i18n'
        ],
        function(
            $,
            _,
            Axis,
            Formatter,
            parsingUtils,
            langUtils,
            mathUtils,
            i18n
        ) {

    var NumericAxis = function(properties) {
        Axis.call(this, properties);
        // SPL-72638, always include zero if the axis has log scale
        this.includeZero = this.determineIncludeZero();
        this.hasExplicitMin = this.validateNumericProperty("axis.minimumNumber");
        this.hasExplicitMax = this.validateNumericProperty("axis.maximumNumber");
        this.hasExplicitMajorUnit = this.validateNumericProperty("axisLabels.majorUnit");
    };

    langUtils.inherit(NumericAxis, Axis);
    $.extend(NumericAxis.prototype, {

        getConfig: function() {
            var config = Axis.prototype.getConfig.call(this),
                extendAxisRange = parsingUtils.normalizeBoolean(this.properties['axisLabels.extendsAxisRange'], true),
                showMinorTicks = this.properties['axisLabels.minorTickVisibility'] === 'show',
                showMinorGridLines = parsingUtils.normalizeBoolean(this.properties['gridLines.showMinorLines']);

            $.extend(true, config, {
                tickInterval: (this.properties['isEmpty'] && (this.properties['axis.scale']  ==='log')) ? 10:
                    this.properties['isEmpty'] ? 10 :
                        parseFloat(this.properties['axisLabels.majorUnit']) || null,
                endOnTick: extendAxisRange,
                startOnTick: extendAxisRange,
                tickWidth: (this.properties['axisLabels.majorTickVisibility'] === 'show') ? 1 : 0 ,

                allowDecimals: !parsingUtils.normalizeBoolean(this.properties['axisLabels.integerUnits']),

                minorTickColor: this.properties['axis.foregroundColorSoft'],
                minorTickLength: parseInt(this.properties['axisLabels.minorTickSize'], 10) || 10,
                minorTickInterval: (showMinorTicks || showMinorGridLines) ? 'auto' : null,
                minorTickWidth: showMinorTicks ? 1 : 0,
                minorGridLineWidth: showMinorGridLines ? 1 : 0,
                //FIXME: clear min/max up so that reader can understand why we check for 'isEmpty'
                min: this.properties['isEmpty'] ? 0 : null,
                max: (this.properties['isEmpty'] && (this.properties['axis.scale']  ==='log')) ? 2 : this.properties['isEmpty'] ? 100 : null,
                gridLineWidth: parsingUtils.normalizeBoolean(this.properties['gridLines.showMajorLines'], true) ? 1 : 0,
                getSeriesExtremesPostHook: _(this.getSeriesExtremesPostHook).bind(this),
                setTickPositionsPreHook: _(this.setTickPositionsPreHook).bind(this),
                labels: {
                    maxStaggerLines: 1
                },
                lineWidth: (this.properties['axisLabels.axisVisibility'] === 'show') ? 1 : 0
            });
            
            this.addMinAndMaxToConfig(config);
            return config;
        },

        validateNumericProperty: function(propName) {
            var value = this.properties[propName];
            // Zero is the only falsy value that is a valid numeric property value, so get that out of the way.
            if(value === 0) {
                return true;
            }
            return !!value && !_.isNaN(parseFloat(value));
        },

        addMinAndMaxToConfig: function(config) {
            var min = this.hasExplicitMin ? parseFloat(this.properties['axis.minimumNumber']) : -Infinity,
                max = this.hasExplicitMax ? parseFloat(this.properties['axis.maximumNumber']) :  Infinity;

            if(min > max) {
                var temp = min;
                min = max;
                max = temp;
            }
            if(min > -Infinity) {
                this.addMinToConfig(config, min, this.includeZero);
            }
            if(max < Infinity) {
                this.addMaxToConfig(config, max, this.includeZero);
            }
        },

        addMinToConfig: function(config, min, includeZero) {
            if(includeZero && min > 0) {
                min = 0;
            }
            else if(this.isLogScale()) {
                min = mathUtils.absLogBaseTen(min);
            }
            config.min = min;
            config.minPadding = 0;
            config.startOnTick = false;
        },

        addMaxToConfig: function(config, max, includeZero) {
            if(includeZero && max < 0) {
                max = 0;
            }
            else if(this.isLogScale()) {
                max = mathUtils.absLogBaseTen(max);
            }
            config.max = max;
            config.maxPadding = 0;
            config.endOnTick = false;

        },

        getVerticalConfig: function() {
            var config = Axis.prototype.getVerticalConfig.call(this);

            var tickSizeOffset = parseInt(this.properties['axisLabels.majorTickSize'], 10) || 0;
            var xDelta = tickSizeOffset + 6;
            return $.extend(true, config, {
                labels: {
                    x: this.properties['opposite'] === true ? xDelta : -xDelta,
                    y: 4
                }
            });
        },

        getHorizontalConfig: function() {
            var config = Axis.prototype.getHorizontalConfig.call(this),
                tickSizeOffset = parseInt(this.properties['axisLabels.majorTickSize'], 10) || 0,
                xDelta = null, yDelta = null,
                alignment; 

            // NOTE: Deltas are set here based on experimentation,
            // this code relies on the fact that fontSize for Numeric Axes
            // does not change. 
            if(this.labelRotation === -45){
                alignment = 'right';
                xDelta = 5;
                yDelta = 10;
            }
            else if(this.labelRotation === -90){
                alignment = 'right';
                xDelta = 4; 
                yDelta = 6;
            }
            else if(this.labelRotation === 45){
                alignment = 'left';
                xDelta = 0;
                yDelta = 10;
            }
            else if(this.labelRotation === 90){
                alignment = 'left';
                xDelta = -4; 
                yDelta = 6;
            }
            else{
                alignment = 'center';
                yDelta = 14;
            }
            
            return $.extend(true, config, {
                labels: {
                    align: alignment,
                    x: xDelta,
                    y: this.properties['opposite'] === true 
                        ? -6 - tickSizeOffset // Measurements are a little different on the opposite side
                        : yDelta + tickSizeOffset
                }
            });
        },

        formatLabel: function(info) {
            if(this.isLogScale()) {
                if(this.properties['stackMode'] === 'stacked100'){
                    return NumericAxis.formatNumber(info.value);
                }
                return NumericAxis.formatNumber(mathUtils.absPowerTen(info.value));
            }
            return NumericAxis.formatNumber(info.value);
        },

        formatValue: function(value) {
            // handle the edge case where the value is not a valid number but the nullValueMode property has rendered it as a zero
            var formatted = NumericAxis.formatNumber(value);
            return (formatted !== 'NaN' ? formatted : i18n.format_decimal('0'));
        },

        isLogScale: function() {
            return (this.properties['axis.scale'] === 'log');
        },

        normalizeAxisOptions: function(axis) {
            var options = axis.options,
                extremes = axis.getExtremes(),
                chart = axis.chart;

            if(!this.properties['isEmpty']){
                var formatter = new Formatter(chart.renderer);

                extremes.min = options.min || extremes.dataMin;
                extremes.max = options.max || extremes.dataMax;
                var tickInterval,
                    range = Math.abs(extremes.max - extremes.min);
                    // if we can't read a tickInterval from the options, estimate it from the tick pixel interval
                
                if(this.isVertical) {
                    tickInterval = options.tickInterval || (options.tickPixelInterval / chart.plotHeight) * range;
                }
                else {
                    tickInterval = options.tickInterval || (options.tickPixelInterval / chart.plotWidth) * range;   
                }

                if(this.isLogScale()) {
                    // SPL-72638, always use tick interval of 1 if the axis has log scale, since we will force the axis to start at zero
                    options.tickInterval = 1;
                }
                else {
                    this.checkMajorUnitFit(tickInterval, extremes, options, formatter, chart);
                }

                if(this.includeZero) {
                    this.enforceIncludeZero(options, extremes);
                }
                else {
                    this.adjustAxisRange(options, extremes, tickInterval);
                }

                if(options.allowDecimals !== false) {
                    this.enforceIntegerMajorUnit(options, extremes);
                }
                formatter.destroy();
            }
            else {
                this.handleNoData(options);
            }
        },

        getSeriesExtremesPostHook: function(axis, secondPass) {
            this.normalizeAxisOptions(axis);
        },

        setTickPositionsPreHook: function(axis, secondPass) {
            if(secondPass) {
                this.normalizeAxisOptions(axis);
            }
        },

        checkMajorUnitFit: function(unit, extremes, options, formatter, chart) {
            var range = Math.abs(extremes.max - extremes.min),
                axisLength = (this.isVertical) ? chart.plotHeight : chart.plotWidth,
                tickSpacing = unit * axisLength / range,
                largestExtreme = Math.max(Math.abs(extremes.min), Math.abs(extremes.max)),
                tickLabelPadding = (this.isVertical) ? 5 : 15,
                fontSize = parseInt((options.labels.style.fontSize.split('px'))[0], 10),

                getTickInterval = function(labelSize) {
                    return (labelSize * range / axisLength);
                };

            if(this.isVertical) {
                var maxHeight = formatter.predictTextHeight(this.formatValue(largestExtreme), fontSize);
                if(tickSpacing < (maxHeight + 2 * tickLabelPadding)) {
                    options.tickInterval = Math.ceil(getTickInterval(maxHeight + 2 * tickLabelPadding));
                }
            }
            else {
                var maxWidth = formatter.predictTextWidth(this.formatValue(largestExtreme), fontSize) + 2 * tickLabelPadding;
                if(tickSpacing < maxWidth || (tickSpacing > (2 * maxWidth))) {
                    var tickInterval = getTickInterval(maxWidth),
                        magnitude = Math.pow(10, Math.floor(Math.log(tickInterval) / Math.LN10));

                    options.tickInterval = this.fitTickIntervalToWidth(tickInterval, null, magnitude, options.allowDecimals);
                }
            }
        },

        determineIncludeZero: function() {
            if(parsingUtils.normalizeBoolean(this.properties['axis.includeZero'])) {
                return true;
            }
            // SPL-72638, always include zero if the axis has log scale, unless the user has explicitly set a min or max that contradicts
            if(this.isLogScale()) {
                var userMin = parseFloat(this.properties["axis.minimumNumber"]),
                    userMax = parseFloat(this.properties["axis.maximumNumber"]);

                if((_.isNaN(userMin) || userMin <= 0) && (_.isNaN(userMax) || userMax >= 0)) {
                    return true;
                }
            }
            return false;
        },

        enforceIncludeZero: function(options, extremes) {
            // if there are no extremes (i.e. no meaningful data was extracted), go with 0 to 100
            if(!extremes.min && !extremes.max) {
                this.handleNoData(options);
                return;
            }
            if(extremes.min >= 0) {
                options.min = 0;
                options.minPadding = 0;
            }
            else if(extremes.max <= 0) {
                options.max = 0;
                options.maxPadding = 0;
            }
        },

        // clean up various issues that can arise from the axis extremes
        adjustAxisRange: function(options, extremes, tickInterval) {
            // this method will add artificial min/max values that did not come from the user
            // clear them here so that each run will do the right thing
            if(!this.hasExplicitMin) {
                delete options.min;
            }
            if(!this.hasExplicitMax) {
                delete options.max;
            }
            // if there are no extremes (i.e. no meaningful data was extracted), go with 0 to 100
            if(!extremes.dataMin && !extremes.dataMax && !this.hasExplicitMax && !this.hasExplicitMin) {
                this.handleNoData(options);
                return;
            }
            // if the min or max is such that no data makes it onto the chart, we hard-code some reasonable extremes
            if(extremes.min > extremes.dataMax && extremes.min > 0 && !this.hasExplicitMax) {
                options.max = (this.isLogScale()) ? extremes.min + 2 : extremes.min * 2;
                return;
            }
            if(extremes.max < extremes.dataMin && extremes.max < 0 && !this.hasExplicitMin) {
                options.min = (this.isLogScale()) ? extremes.max - 2 : extremes.max * 2;
                return;
            }
            // if either data extreme within one tick interval of zero,
            // remove the padding on that side so the axis doesn't extend beyond zero
            if(extremes.dataMin >= 0 && extremes.dataMin <= tickInterval) {
                if(!this.hasExplicitMin){
                    options.min = 0;
                }
                options.minPadding = 0;
            }
            if(extremes.dataMax <= 0 && extremes.dataMax >= -1 * tickInterval) {
                if(!this.hasExplicitMax){
                    options.max = 0;
                }
                options.maxPadding = 0;
            }

        },

        handleNoData: function(axisOptions) {
            var logScale = this.isLogScale();
            axisOptions.min = 0;
            axisOptions.max = logScale ? 2 : 100;
            if(logScale) {
                axisOptions.tickInterval = 1;
            }
        },

        enforceIntegerMajorUnit: function(options, extremes) {
            var range = extremes.max - extremes.min;
            // if the axis range is ten or greater, require that the major unit be an integer
            if(range >= 10) {
                options.allowDecimals = false;
            }
        },

        // This is a custom version of Highcharts' normalizeTickInterval method. For some reason, Highcharts
        // wasn't collapsing axis tick intervals early enough (SPL-72905), so we elected to choose one multiple
        // higher than what they would have recommended (e.g. choose 5,000,000 instead of 2,500,000).
        fitTickIntervalToWidth: function(interval, multiples, magnitude, allowDecimals) {
            var normalized = interval / magnitude;

            if (!multiples) {
                multiples = [1, 2, 2.5, 5, 10, 20];
                // the allowDecimals option
                if (allowDecimals === false) {
                    if (magnitude === 1) {
                        multiples = [1, 2, 5, 10];
                    } else if (magnitude <= 0.1) {
                        multiples = [1 / magnitude];
                    }
                }
            }

            if (multiples.length === 1) {
                interval = multiples[0];
            }
            else {
                // normalize the interval to the nearest multiple
                for (var i = 0; i < multiples.length - 1; i++) {
                    interval = multiples[i];
                    if (normalized <= (multiples[i] + (multiples[i + 1] || multiples[i])) / 2) {
                        interval = multiples[i+1];
                        break;
                    }
                }
            }

            // multiply back to the correct magnitude
            interval *= magnitude;
            if(this.hasExplicitMajorUnit) {
                return Math.max(mathUtils.parseFloat(this.properties['axisLabels.majorUnit']), interval);
            }
            return interval;
        }

    });

    $.extend(NumericAxis, {

        formatNumber: function(value) {
            value = mathUtils.parseFloat(value);
            var absValue = Math.abs(value);
            if(absValue > 0 && absValue < 0.000001) {
                return i18n.format_scientific(value, '#.###E0');
            }
            // Hackery to avoid floating point errors...
            // First calculate the decimal precision needed to display the number, then add that many characters after
            // the decimal point to the number format.  Then add a small number to the value, which will be truncated
            // by the formatting logic but prevents a round-down due to floating point errors.
            var precision = mathUtils.getDecimalPrecision(value),
                numberFormat = '#,##0.';

            _(precision).times(function() {
                numberFormat += '#';
            });
            value += Math.pow(10, -1 * precision - 1);
            return i18n.format_decimal(value, numberFormat);
        }

    });

    return NumericAxis;

});
