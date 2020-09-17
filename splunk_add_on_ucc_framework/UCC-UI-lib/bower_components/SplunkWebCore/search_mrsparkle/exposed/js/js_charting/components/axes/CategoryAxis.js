define([
            'jquery',
            'underscore',
            './Axis',
            '../../helpers/Formatter',
            '../../util/lang_utils',
            '../../util/parsing_utils',
            'helpers/user_agent'
        ],
        function(
            $,
            _,
            Axis,
            Formatter,
            langUtils,
            parsingUtils,
            userAgent
        ) {

    var CategoryAxis = function(properties) {
        Axis.call(this, properties);
        properties = properties || {};
        // the property is exposed for testing only
        this.skipLabelsToAvoidCollisions = parsingUtils.normalizeBoolean(properties['axis.skipLabelsToAvoidCollisions']);
        this.ellipsize = properties['axisLabels.majorLabelStyle.overflowMode'] === 'ellipsisMiddle';
        this.properties['axis.categories'] = this.processCategories(properties['axis.categories']);
        this._categoriesAreDirty = false;
        this.isiOS = userAgent.isiOS();
    };
    langUtils.inherit(CategoryAxis, Axis);

    $.extend(CategoryAxis.prototype, {

        DEFAULT_FONT_SIZE: 12,
        MIN_FONT_SIZE: 9,

        getConfig: function() {
            var that = this,
                config = Axis.prototype.getConfig.apply(this, arguments),
                hideAxis = parsingUtils.normalizeBoolean(this.properties['axisLabels.hideCategories']);

            $.extend(true, config, {
                categories: this.properties['axis.categories'].slice(0),
                labels: {
                    formatter: function() {
                        return that.formatLabel(this.value);
                    },
                    enabled: config.labels.enabled && !hideAxis,
                    maxStaggerLines: 2,
                    style: {
                        // Hack to make sure we can render literal '<' and '>'
                        HcTextStroke: true
                    }
                },
                startOnTick: !this.hasTickmarksBetween(),
                showLastLabel: this.hasTickmarksBetween(),
                tickWidth: hideAxis ? 0 : config.tickWidth,
                tickmarkPlacement: this.properties['axisLabels.tickmarkPlacement'],
                tickPositioner: function(min, max) {
                    // will be called by Highcharts in the scope of the Highcharts axis object
                    return that.tickPositioner(this, min, max);
                },
                gridLineWidth: parsingUtils.normalizeBoolean(this.properties['gridLines.showMajorLines']) ? 1 : 0,
                setTickPositionsPreHook: _(this.setTickPositionsPreHook).bind(this),
                setTickPositionsPostHook: _(this.setTickPositionsPostHook).bind(this)
            });

            return config;
        },

        getVerticalConfig: function() {
            var config = Axis.prototype.getVerticalConfig.call(this);
            return $.extend(true, config, {
                labels: {
                    align: 'right',
                    x: -7
                }
            });
        },

        getHorizontalConfig: function() {
            var config = Axis.prototype.getHorizontalConfig.call(this);
            var minRange;
            if(this.isiOS && this.hasTickmarksBetween() && this.originalCategories.length > 1){
                minRange = 1;
            }
            return $.extend(true, config, {
                labels: {
                    align: 'center'
                },
                endOnTick: !this.hasTickmarksBetween(),
                showLastLabel: false,
                startOnTick: true,
                minRange: minRange || -1
            });
        },

        processCategories: function(categories) {
            this.originalCategories = categories;
            return categories.slice(0);
        },

        getCategories: function() {
            return this.properties['axis.categories'];
        },

        getPreviousCategories: function() {
            return this.previousCategories || [];
        },

        categoriesAreDirty: function() {
            return this._categoriesAreDirty;
        },

        setCategories: function(categories) {
            this.previousCategories = this.properties['axis.categories'];
            this.properties['axis.categories'] = this.processCategories(categories);

            if(!_.isEqual(this.properties['axis.categories'], this.previousCategories)) {
                this._categoriesAreDirty = true;
            }
        },

        redraw: function(redrawChart) {
            Axis.prototype.redraw.apply(this, arguments);
            
            if(this.categoriesAreDirty()) {
                this.hcAxis.setCategories(this.properties['axis.categories'].slice(0), redrawChart);
            }  

            if(this.isiOS && this.hasTickmarksBetween()) {
                var axisConfig = this.getConfig();
                this.hcAxis['minRange'] = axisConfig['minRange'];
            }
        },

        onChartLoadOrRedraw: function() {
            Axis.prototype.onChartLoadOrRedraw.apply(this, arguments);
            this._categoriesAreDirty = false;
        },

        /**
         * @author sfishel
         *
         * Do some intelligent manipulation of axis label step and ellipsization of axis labels (if needed)
         * before the getOffset routine runs.
         */

        getOffsetPreHook: function(axis) {
            // super
            Axis.prototype.getOffsetPreHook.call(this, axis);

            var options = axis.options,
                chart = axis.chart;

            if(!options.labels.enabled) {
                return;
            }

            var maxWidth, tickSpacing, minLabelSpacing, labelStep, labelSpacing,
                formatter = new Formatter(chart.renderer),
                extremes = axis.getExtremes(),
                extremesMin = Math.round(extremes.min),
                extremesMax = Math.round(extremes.max),
                numCategories = extremesMax - extremesMin + (this.hasTickmarksBetween() ? 1 : 0),
                categories = this.originalCategories.slice(extremesMin, extremesMin + numCategories),
                labelLineHeight, i;
            
            if(this.isVertical) {
                maxWidth = Math.floor(chart.chartWidth / 6);

                // Returns a dictionary with new labels as well as font info
                var labelAdjustments = formatter.adjustLabels(categories, maxWidth, this.MIN_FONT_SIZE, this.DEFAULT_FONT_SIZE, 'middle');

                for(i = 0; i < labelAdjustments.labels.length; i++) {
                    options.categories[i] = labelAdjustments.labels[i];
                }

                options.labels.style['font-size'] = labelAdjustments.fontSize + 'px';
                labelLineHeight = formatter.predictTextHeight('Test', labelAdjustments.fontSize);
                var axisHeight = chart.plotHeight;

                tickSpacing = axisHeight / (categories.length || 1);
                minLabelSpacing = 25;
                labelStep = this.skipLabelsToAvoidCollisions ? Math.ceil(minLabelSpacing / tickSpacing) : 1;
                
                // This centers the lables a bit better in all cases.
                // The 3 is essentially determined by trial and error
                options.labels.y = labelLineHeight / 3;
                options.labels.x = - options.tickLength;
                
                options.labels.step = labelStep;
            }
            else {
                var fontSize,
                    tickLabelPadding = 4,
                    labelSpacingUpperBound = 100,
                    axisWidth = chart.plotWidth,
                    maxWidths = formatter.getMaxWidthForFontRange(categories, this.MIN_FONT_SIZE, this.DEFAULT_FONT_SIZE),
                    xDelta = 0, 
                    yDelta = 0;

                tickSpacing = axisWidth / (numCategories || 1);

                // Check the width of the longest label for each font
                // take the largest font size that will make that width less than the tick spacing if possible
                // will return the largest font size that fits in the tick spacing, or zero if none fit
                var subTickSpacingFont = this.findBestFontForSpacing(maxWidths, tickSpacing - 2 * tickLabelPadding);
                if(subTickSpacingFont > 0 && this.labelRotation === 0) {
                    fontSize = subTickSpacingFont;
                    labelStep = 1;
                    labelSpacing = tickSpacing;
                    maxWidth = labelSpacing;
                }
                // Otherwise use the width for smallest font size as minLabelSpacing, with the upper bound
                else {
                    minLabelSpacing = Math.min(maxWidths[this.MIN_FONT_SIZE] + 2 * tickLabelPadding, labelSpacingUpperBound);
                    fontSize = this.MIN_FONT_SIZE;
                    labelStep = this.skipLabelsToAvoidCollisions ? Math.ceil(minLabelSpacing / tickSpacing) : 1;
                    labelSpacing = tickSpacing * labelStep;
                    
                    var yAxisLeft = chart.yAxis[0].left,
                        deg2rad = Math.PI * 2 / 360, 
                        rad = this.labelRotation * deg2rad,
                        cosRad = Math.abs(Math.cos(rad)),
                        tickLabelSpacing = labelSpacing - (2 * tickLabelPadding),
                        maxLabelHeight, maxLabelWidth;

                    switch(this.labelRotation)
                    {
                    case 0:
                        //label length constricted to space between tickmarks as there is no rotation
                        maxWidth = tickLabelSpacing;
                        break;
                    case -45:
                        maxWidth = [];
                        maxLabelHeight = ((chart.chartHeight / 2) / Math.abs(Math.sin(rad)));
                        for(i = 0; i < numCategories; i++){
                            //how far each label has from the leftmost edge of the chart before overflowing
                            maxLabelWidth = (tickSpacing * (i + 1)) / cosRad;
                            //leftmost label only has space to the left of the chart to fill
                            if(i === 0){
                                maxLabelWidth = Math.min(chart.xAxis[0].left, maxLabelWidth);
                            }
                            //how far each label has from the bottom edge of the chart before overflowing
                            //note: permitted margin below x-axis is capped at half of chart height so that chart is still visible
                            //ellipsize to smallest of maxLabelWidth or maxLabelHeight to prevent cut-off on both left and bottom of panel
                            if(this.ellipsize){
                                //if user wants to ellipsize label, then use space between ticks as label length if smallest
                                maxWidth[i] = Math.min(maxLabelWidth, maxLabelHeight, tickLabelSpacing); 
                            }else{
                                maxWidth[i] = Math.min(maxLabelWidth, maxLabelHeight); 
                            }
                        }
                        break;
                    case 45:
                        maxWidth = [];
                        maxLabelHeight = (chart.chartHeight / 2) / Math.abs(Math.sin(rad)); 
                        for(i = 0; i < numCategories; i++){
                            maxLabelWidth = (tickSpacing * (i + 1)) /cosRad;
                            if(this.ellipsize){
                                maxWidth[numCategories - i - 1] = Math.min(maxLabelWidth, maxLabelHeight, tickLabelSpacing);
                            }else{
                                maxWidth[numCategories - i - 1] = Math.min(maxLabelWidth, maxLabelHeight);
                            }
                        }
                        break;
                    default: // this.labelRotation === -90 || 90
                        // label length is capped at half of chart height, so that chart is still visible
                        if(this.ellipsize){
                            maxWidth = Math.min(chart.chartHeight / 2, tickLabelSpacing);
                        }else{
                            maxWidth = chart.chartHeight / 2;
                        }
                        break; 
                    }
                }
                this.ellipsizeLabels(categories, formatter, maxWidth, fontSize);
                _(categories).each(function(category, i) {
                    options.categories[extremesMin + i] = category;
                });
                options.labels.style['font-size'] = fontSize + 'px';

                labelLineHeight = formatter.predictTextHeight('Test', fontSize);

                if (this.labelRotation === -45) {
                    options.labels.align = 'right';
                    xDelta = 0;
                    yDelta = labelLineHeight / 4 + options.tickLength;
                } 
                else if (this.labelRotation === 45) {
                    options.labels.align = 'left';
                    xDelta = 0;
                    yDelta = labelLineHeight / 4 + options.tickLength;
                } 
                else if (this.labelRotation === -90) {
                    options.labels.align = 'right';
                    xDelta = labelLineHeight / 4 ;
                    yDelta = options.tickLength;
                } 
                else if (this.labelRotation === 90) {
                    options.labels.align = 'left';
                    xDelta = - labelLineHeight / 4 ;
                    yDelta = options.tickLength;
                } 
                else {
                    options.labels.align = 'center';
                    xDelta = 0;
                    // Division by 2 is trial and error, adding tick lenghth keeps
                    // the labels at the end of the tick
                    yDelta = labelLineHeight / 2 + options.tickLength;
                }

                // If the labels are on the tick mark we add a little more padding
                if (!this.hasTickmarksBetween()){
                    yDelta = yDelta + 6;
                }
                options.labels.step = labelStep;

                options.labels.x = xDelta;
                options.labels.y = yDelta;
            }
            formatter.destroy();
        },

        findBestFontForSpacing: function(fontWidths, spacing) {
            var bestFontSize = 0;
            _(fontWidths).each(function(width, fontSize) {
                if(width <= spacing) {
                    bestFontSize = Math.max(bestFontSize, parseInt(fontSize, 10));
                }
            });
            return bestFontSize;
        },

        ellipsizeLabels: function(categories, formatter, maxWidth, fontSize) {
            var i,
                adjustedLabels = _(categories).map(function(label, j) {
                    return formatter.ellipsize(label, _.isArray(maxWidth) ? maxWidth[j] : maxWidth, fontSize, {}, 'middle');
                });

            for(i = 0; i < adjustedLabels.length; i++) {
                categories[i] = adjustedLabels[i];
            }
        },

        setTickPositionsPreHook: function(axis) {
            if(!this.hasTickmarksBetween()) {
                // this will make sure Highcharts renders space for the last label
                axis.options.max = this.properties['axis.categories'].length;
            }
        },

        tickPositioner: function(axis, min, max) {
            if(this.shouldHideTicks(axis)) {
                // SPL-80164, return a small array with the correct extremes to avoid a Highcharts "too many ticks" error
                // per SPL-80436, we can't return an empty array here, the tick positions will be emptied in setTickPositionsPostHook
                return [min, max];
            }
            // returning null instructs Highcharts to use its default tick positioning routine
            return null;
        },

        setTickPositionsPostHook: function(axis, secondPass) {
            if(this.shouldHideTicks(axis)) {
                axis.tickPositions = [];
            }
            // Prevent Highcharts' adjustForMinRange from creating floating point axis min and max
            // when attempting to zoom into 1 column on iOS
            if(this.isiOS && this.hasTickmarksBetween() && this.originalCategories.length > 1){
                axis.min = Math.round(axis.min);
                axis.max = Math.round(axis.max);
            }
        },

        shouldHideTicks: function(axis) {
            var threshold = this.isVertical ? 15 : 20,
                extremes = axis.getExtremes(),
                numCategories = extremes.max - extremes.min + (this.hasTickmarksBetween() ? 1 : 0),
                pixelsPerCategory = axis.len / numCategories;

            return (pixelsPerCategory < threshold);
        },

        /**
         * @author sfishel
         *
         * Do a custom enforcement of the label step by removing ticks that don't have a label
         */

        tickRenderPostHook: function(tick, index, old, opacity) {
            var axisOptions = tick.axis.options;
            axisOptions.labels = axisOptions.labels || {};
            if(!axisOptions.labels.enabled || axisOptions.tickWidth === 0) {
                return;
            }
            Axis.prototype.tickRenderPostHook.call(this, tick, index, old, opacity);
            var adjustedPosition = tick.pos + (this.hasTickmarksBetween() ? 1 : 0);
            var labelStep = axisOptions.labels.step || 1;

            if(adjustedPosition % labelStep !== 0) {
                tick.mark.hide();
            }
            else {
                tick.mark.show();
            }
        },

        formatValue: function(value) {
            return value;
        },

        formatLabel: function(info) {
            return parsingUtils.escapeSVG(info);
        },

        hasTickmarksBetween: function() {
            return (this.properties['axisLabels.tickmarkPlacement'] === 'between');
        },

        getTickLabelExtremesY: function(tick) {
            return [-tick.labelBBox.height, 0];
        }

    });

    return CategoryAxis;

});