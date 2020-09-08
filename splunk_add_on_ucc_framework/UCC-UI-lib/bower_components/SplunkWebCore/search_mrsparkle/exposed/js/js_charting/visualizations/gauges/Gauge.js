define([
            'jquery',
            'underscore',
            'highcharts',
            '../Visualization',
            '../../helpers/Formatter',
            '../../components/ColorPalette',
            '../../util/lang_utils',
            '../../util/parsing_utils',
            '../../util/testing_utils',
            '../../util/math_utils',
            '../../util/dom_utils',
            '../../util/color_utils',
            'splunk.i18n'
        ], 
        function(
            $,
            _,
            Highcharts,
            Visualization,
            Formatter,
            ColorPalette,
            langUtils,
            parsingUtils,
            testingUtils,
            mathUtils,
            domUtils,
            colorUtils,
            i18n
        ) {

    var Gauge = function(container, properties) {
        Visualization.call(this, container, properties);
        // for consistency with other chart types, create a <div> inside this container where the gauge will draw
        this.$hcContainer = $('<div />').addClass('highcharts-container').appendTo(this.container);
        this.elements = {};
        this.hasRendered = false;
        this.needsRedraw = true;
    };
    langUtils.inherit(Gauge, Visualization);

    $.extend(Gauge.prototype, {

        WINDOW_RESIZE_DELAY: 100,

        EXPORT_HEIGHT: 400,
        EXPORT_WIDTH: 600,

        MIN_GAUGE_HEIGHT: 25,
        RESIZED_GAUGE_HEIGHT: 200,

        DEFAULT_COLORS: [0x84E900, 0xFFE800, 0xBF3030],
        DEFAULT_RANGES: [0, 30, 70, 100],
        MAX_TICKS_PER_RANGE: 10,

        showValueByDefault: true,
        showMinorTicksByDefault: true,

        getFieldList: function() {
            return [];
        },

        // in export mode we need to set explicit width and height
        // we'll honor the width and height of the parent node, unless they are zero
        getWidth: function() {
            var width = Visualization.prototype.getWidth.call(this);
            if(this.exportMode) {
                return width || this.EXPORT_WIDTH;
            }
            return width;
        },

        getHeight: function() {
            var height = Visualization.prototype.getHeight.call(this);
            if(this.exportMode) {
                return height || this.EXPORT_HEIGHT;
            }
            // Fix for SPL-61657 - make sure the height of the gauge div can't be below a certain threshold
            height = (height < this.MIN_GAUGE_HEIGHT) ? this.RESIZED_GAUGE_HEIGHT : height;
            return height;
        },

        prepare: function(dataSet, properties) {
            var oldRanges = $.extend([], this.ranges);
            Visualization.prototype.prepare.call(this, dataSet, properties);
            if(!parsingUtils.arraysAreEquivalent(oldRanges, this.ranges)) {
                this.needsRedraw = true;
            }
        },

        handleDraw: function(callback) {
            if(this.needsRedraw) {
                this.teardownGauge();
                this.renderer = new Highcharts.Renderer(this.$hcContainer[0], this.getWidth(), this.getHeight());
                this.formatter = new Formatter(this.renderer);
                this.$container.css('backgroundColor', this.backgroundColor);
                this.renderGauge();
                this.hasRendered = true;
                if(this.testMode) {
                    testingUtils.gaugeAddTestingMetadata(this, this.elements, this.getClassName(), this.value);
                    testingUtils.createGlobalReference(this, this.getChartObject());
                }
                this.needsRedraw = false;
                this.cacheDrawnDimensions();
            }
            else {
                this.updateValue(this.previousValue || 0, this.value);
            }
            callback(this);
        },

        setSize: function(width, height) {
            if(!this.hasRendered) {
                return;
            }
            this.teardownGauge();
            this.renderer = new Highcharts.Renderer(this.$hcContainer[0], width, height);
            this.formatter = new Formatter(this.renderer);
            this.renderGauge();
            if(this.testMode) {
                testingUtils.gaugeAddTestingMetadata(this, this.elements, this.getClassName(), this.value);
            }
            this.hasRendered = true;
            this.cacheDrawnDimensions();
        },

        destroy: function() {
            this.teardownGauge();
            this.$hcContainer.remove();
        },

        teardownGauge: function() {
            var key;
            // stop any running animations
            this.stopWobble();
            this.$container.stop();
            for(key in this.elements) {
                if(this.elements.hasOwnProperty(key)) {
                    this.elements[key].destroy();
                }
            }
            if(this.renderer) {
                this.renderer.destroy();
            }
            if(this.formatter) {
                this.formatter.destroy();
            }
            this.elements = {};
            this.$hcContainer.empty();
            this.$container.css('backgroundColor', '');
            this.hasRendered = false;
        },

        getSVG: function() {
            return this.$container.find('svg').eq(0).parent().html();
        },

        processProperties: function() {
            Visualization.prototype.processProperties.call(this);
            this.colors = this.computeColors();
            this.colorPalette = new ColorPalette(this.colors, true);
            this.ranges = this.computeRanges();
            this.previousValue = this.value;
            this.value = this.computeValue();

            this.majorUnit = parseInt(this.properties['chart.majorUnit'], 10) || null;
            this.showMajorTicks = parsingUtils.normalizeBoolean(this.properties['chart.showMajorTicks'], true);
            this.showMinorTicks = parsingUtils.normalizeBoolean(this.properties['chart.showMinorTicks'], this.showMinorTicksByDefault);
            this.showLabels = parsingUtils.normalizeBoolean(this.properties['chart.showLabels'], true);
            this.showValue = parsingUtils.normalizeBoolean(this.properties['chart.showValue'], this.showValueByDefault);
            this.showRangeBand = parsingUtils.normalizeBoolean(this.properties['chart.showRangeBand'], true);
            this.usePercentageRange = parsingUtils.normalizeBoolean(this.properties['chart.usePercentageRange']);
            this.usePercentageValue = parsingUtils.normalizeBoolean(this.properties['chart.usePercentageValue']);
            this.isShiny = this.properties['chart.style'] !== 'minimal';
        },

        computeColors: function() {
            var userColors = parsingUtils.stringToHexArray(this.properties['chart.gaugeColors'] || this.properties['gaugeColors']);
            return (userColors && userColors.length > 0) ? userColors : this.DEFAULT_COLORS;
        },

        computeRanges: function() {
            var ranges,
                userRanges = parsingUtils.stringToArray(this.properties['chart.rangeValues']);
            
            if(userRanges && userRanges.length > 1) {
                ranges = userRanges;
            }
            else {
                var dataFields = this.dataSet.allDataFields();
                ranges = _(dataFields.slice(1)).map(function(field) {
                    return this.dataSet.getSeries(field)[0];
                }, this);
            }
            var prevRange = -Infinity,
                floatRanges = [];

            _(ranges).each(function(range) {
                var floatRange = mathUtils.parseFloat(range);
                if(!_(floatRange).isNaN() && floatRange > prevRange) {
                    floatRanges.push(floatRange);
                    prevRange = floatRange;
                }
            });

            return (floatRanges.length > 1) ? floatRanges : this.DEFAULT_RANGES;
        },

        computeValue: function() {
            var dataFields = this.dataSet.allDataFields();
            return (dataFields.length > 0) ? mathUtils.parseFloat(this.dataSet.getSeries(dataFields[0])[0]) || 0 : 0;
        },

        updateValue: function(oldValue, newValue) {
            // if the value didn't change, do nothing
            if(oldValue === newValue) {
                return;
            }
            if(this.shouldAnimateTransition(oldValue, newValue)) {
                this.stopWobble();
                this.animateTransition(oldValue, newValue, _(this.drawIndicator).bind(this), _(this.onAnimationFinished).bind(this));
            }
            if(this.showValue) {
                var valueText = this.formatValue(newValue);
                this.updateValueDisplay(valueText);
            }
            if(this.testMode) {
                testingUtils.gaugeUpdate(this.$container, newValue);
            }
        },

        shouldAnimateTransition: function(oldValue, newValue) {
            // if we were already out of range, no need to animate the indicator
            return (this.normalizedTranslateValue(oldValue) !== this.normalizedTranslateValue(newValue));
        },

        drawTicks: function() {
            var i, loopTranslation, loopText,
                tickValues = this.calculateTickValues(this.ranges[0], this.ranges[this.ranges.length - 1], this.MAX_TICKS_PER_RANGE);

            for(i = 0; i < tickValues.length; i++) {
                loopTranslation = this.translateValue(tickValues[i]);
                if(this.showMajorTicks) {
                    this.elements['tickMark_' + tickValues[i]] = this.drawMajorTick(loopTranslation);
                }
                if(this.showLabels) {
                    loopText = this.formatTickLabel(tickValues[i]);
                    this.elements['tickLabel_' + tickValues[i]] = this.drawMajorTickLabel(loopTranslation, loopText);
                }
            }
            // if the labels are visible, check for collisions and remove ticks if needed before drawing the minors
            if(this.showLabels) {
                tickValues = this.removeTicksIfOverlap(tickValues);
            }

            if(this.showMinorTicks) {
                var majorInterval = tickValues[1] - tickValues[0],
                    minorInterval = majorInterval / this.minorsPerMajor,
                    startValue = (this.usePercentageRange) ?
                        this.ranges[0] :
                        tickValues[0] - Math.floor((tickValues[0] - this.ranges[0]) / minorInterval) * minorInterval;

                for(i = startValue; i <= this.ranges[this.ranges.length - 1]; i += minorInterval) {
                    if(!this.showMajorTicks || $.inArray(i, tickValues) < 0) {
                        loopTranslation = this.translateValue(i);
                        this.elements['minorTickMark_' + i] = this.drawMinorTick(loopTranslation);
                    }
                }
            }
        },

        removeTicksIfOverlap: function(tickValues) {
            while(tickValues.length > 2 && this.tickLabelsOverlap(tickValues)) {
                tickValues = this.removeEveryOtherTick(tickValues);
            }
            return tickValues;
        },

        tickLabelsOverlap: function(tickValues) {
            var i, labelOne, labelTwo,
                marginX = 3,
                marginY = 1,
                renderer = this.renderer;

            // Highcharts is doing a little too good of a job cache-ing the bounding boxes of numerical text elements.
            // We have to bust the per-renderer cache unless there is per-element cached value (SPL-83393).
            var getBBox = function(wrapper) {
                if(wrapper.bBox) {
                    return wrapper.bBox;
                }
                renderer.cache = {};
                return wrapper.getBBox();
            };

            for(i = 0; i < tickValues.length - 1; i++) {
                labelOne = this.elements['tickLabel_' + tickValues[i]];
                labelTwo = this.elements['tickLabel_' + tickValues[i + 1]];
                if(this.formatter.bBoxesOverlap(getBBox(labelOne), getBBox(labelTwo), marginX, marginY)) {
                    return true;
                }
            }
            return false;
        },

        removeEveryOtherTick: function(tickValues) {
            var i,
                newTickValues = [];

            for(i = 0; i < tickValues.length; i++) {
                if(i % 2 === 0) {
                    newTickValues.push(tickValues[i]);
                }
                else {
                    if(this.elements['tickMark_' + tickValues[i]]) {
                        this.elements['tickMark_' + tickValues[i]].destroy();
                        delete this.elements['tickMark_' + tickValues[i]];
                    }
                    if(this.elements['tickLabel_' + tickValues[i]]) {
                        this.elements['tickLabel_' + tickValues[i]].destroy();
                        delete this.elements['tickLabel_' + tickValues[i]];
                    }
                }
            }
            return newTickValues;
        },

        // we can't use the jQuery animation library explicitly to perform complex SVG animations, but
        // we can take advantage of their implementation using a meaningless css property and a custom step function
        animateTransition: function(startVal, endVal, drawFn, finishCallback) {
            var animationRange = endVal - startVal,
                duration = 500,
                animationProperties = {
                    duration: duration,
                    step: function(now) {
                        drawFn(startVal + now);
                    }.bind(this)
                };

            if(finishCallback) {
                animationProperties.complete = function() {
                    finishCallback(endVal);
                };
            }
            // for the animation start and end values, use 0 and animationRange for consistency with the way jQuery handles
            // css properties that it doesn't recognize
            this.$container
                .stop(true, true)
                .css({'animation-progress': 0})
                .animate({'animation-progress': animationRange}, animationProperties);
        },

        onAnimationFinished: function(val) {
            this.checkOutOfRange(val);
        },

        checkOutOfRange: function(val) {
            var totalRange, wobbleCenter, wobbleRange;

            if(val < this.ranges[0]) {
                totalRange = this.ranges[this.ranges.length - 1] - this.ranges[0];
                wobbleRange = totalRange * 0.005;
                wobbleCenter = this.ranges[0] + wobbleRange;
                this.wobble(wobbleCenter, wobbleRange, this.drawIndicator);
            }
            else if(val > this.ranges[this.ranges.length - 1]) {
                totalRange = this.ranges[this.ranges.length - 1] - this.ranges[0];
                wobbleRange = totalRange * 0.005;
                wobbleCenter = this.ranges[this.ranges.length - 1] - wobbleRange;
                this.wobble(wobbleCenter, wobbleRange, this.drawIndicator);
            }
        },

        formatValue: function(val) {
            return (this.usePercentageValue) ?
                this.formatPercent(((val - this.ranges[0]) / (this.ranges[this.ranges.length - 1] - this.ranges[0]))) :
                this.formatNumber(val);
        },

        formatTickLabel: function(val) {
            return (this.usePercentageRange) ?
                this.formatPercent(((val - this.ranges[0]) / (this.ranges[this.ranges.length - 1] - this.ranges[0]))) :
                this.formatNumber(val);
        },

        formatNumber: function(val) {
            var parsedVal = parseFloat(val),
                absVal = Math.abs(parsedVal);
            // if the magnitude is 1 billion or greater or less than one thousandth (and non-zero), express it in scientific notation
            if(absVal >= 1e9 || (absVal !== 0 && absVal < 1e-3)) {
                return i18n.format_scientific(parsedVal, "#.###E0");
            }
            return i18n.format_decimal(parsedVal);
        },

        formatPercent: function(val) {
            return i18n.format_percent(val);
        },

        wobble: function(center, range, drawFn) {
            var self = this,
                wobbleCounter = 0;

            this.wobbleInterval = setInterval(function() {
                var wobbleVal = center + (wobbleCounter % 3 - 1) * range;
                drawFn.call(self, wobbleVal);
                wobbleCounter = (wobbleCounter + 1) % 3;
            }, 75);

        },

        stopWobble: function() {
            clearInterval(this.wobbleInterval);
        },

        predictTextWidth: function(text, fontSize) {
            return this.formatter.predictTextWidth(text, fontSize);
        },

        calculateTickValues: function(start, end, numTicks) {
            var i, loopStart,
                range = end - start,
                rawTickInterval = range / (numTicks - 1),
                nearestPowerOfTen = mathUtils.nearestPowerOfTen(rawTickInterval),
                roundTickInterval = nearestPowerOfTen,
                tickValues = [];

            if(this.usePercentageRange) {
                roundTickInterval = (this.majorUnit && !isNaN(this.majorUnit)) ? Math.abs(this.majorUnit) : 10;
                for(i = 0; i <= 100; i += roundTickInterval) {
                    tickValues.push(start + (i / 100) * range);
                }
            }
            else {
                if(this.majorUnit && !isNaN(this.majorUnit)) {
                    roundTickInterval = Math.abs(this.majorUnit);
                }
                else {
                    if(range / roundTickInterval > numTicks) {
                        // if the tick interval creates too many ticks, bump up to a factor of two
                        roundTickInterval *= 2;
                    }
                    if(range / roundTickInterval > numTicks) {
                        // if there are still too many ticks, bump up to a factor of five (of the original)
                        roundTickInterval *= (5 / 2);
                    }
                    if(range / roundTickInterval > numTicks) {
                        // if there are still too many ticks, bump up to a factor of ten (of the original)
                        roundTickInterval *= 2;
                    }
                }
                // in normal mode we label in whole numbers, so the tick discovery loop starts at 0 or an appropriate negative number
                // but in percent mode we force it to label the first range value and go from there
                loopStart = (this.usePercentageRange) ?
                    start :
                    (start >= 0) ? 0 : (start - start % roundTickInterval);
                for(i = loopStart; i <= end; i += roundTickInterval) {
                    if(i >= start) {
                        // work-around to deal with floating-point rounding errors
                        tickValues.push(parseFloat(i.toFixed(14)));
                    }
                }
            }
            return tickValues;
        },

        getColorByIndex: function(index) {
            return colorUtils.colorFromHex(this.colorPalette.getColor(null, index, this.ranges.length - 1));
        },

        // this is just creating a stub interface so automated tests won't fail
        getChartObject: function() {
            return {
                series: [
                    {
                        data: [
                               {
                                   y: this.value,
                                   onMouseOver: function() { }
                               }
                        ]
                    }
                ]
            };
        },


        // to be implemented by subclasses
        renderGauge: function() {
            this.updateDimensions();
        },
        translateValue: function() { },
        normalizedTranslateValue: function() { }

    });

    return Gauge;
    
});
