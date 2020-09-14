define([
            'jquery',
            'underscore',
            './Axis',
            './CategoryAxis',
            '../../helpers/Formatter',
            '../../util/lang_utils',
            'util/time',
            '../../util/time_utils',
            '../../util/dom_utils', 
            '../../util/parsing_utils'
        ],
        function(
            $,
            _,
            Axis,
            CategoryAxis,
            Formatter,
            langUtils,
            splunkTimeUtils,
            timeUtils,
            domUtils, 
            parsingUtils
        ) {

    var TimeAxis = function(properties) {
        CategoryAxis.call(this, properties);
        var NO_ROTATION_LABEL_CUTOFF = 6,
            NEG45_ROTATION_LABEL_CUTOFF = 10,
            ROTATION_LABEL_CUTOFF = 15;

        this.numLabelCutoff = (this.labelRotation === 0) ? NO_ROTATION_LABEL_CUTOFF : (this.labelRotation === -45) ? NEG45_ROTATION_LABEL_CUTOFF : ROTATION_LABEL_CUTOFF;
        this.spanData = properties['axis.spanData'];
        
        this.tickLabelPadding = (this.isVertical) ? 2 : 3;
    };
    langUtils.inherit(TimeAxis, CategoryAxis);

    $.extend(TimeAxis.prototype, {

        getConfig: function() {
            var config = CategoryAxis.prototype.getConfig.call(this);
            $.extend(true, config, {
                showLastLabel: true,
                labels: {
                    maxStaggerLines: 1
                }
            });
            return config;
        },

        setCategories: function(categories, spanData) {
            this.previousSpanData = this.spanData;
            this.spanData = spanData;
            CategoryAxis.prototype.setCategories.call(this, categories);
        },

        getSpanData: function() {
            return this.spanData;
        },

        getPreviousSpanData: function() {
            return this.previousSpanData || [];
        },

        formatLabel: function(info) {
            return info;
        },

        formatValue: function(value) {
            return timeUtils.formatIsoStringAsTooltip(value, this.pointSpan) || _('Invalid timestamp').t();
        },

        /**
         * @author sfishel
         *
         * Before the getOffset routine runs, align the axis labels to the right of each tick
         */

        getOffsetPreHook: function(axis) {
            var options = axis.options,
                chart = axis.chart,
                axisLength = (this.isVertical) ? chart.plotHeight : chart.plotWidth,
                extremes = axis.getExtremes(),
                numCategories = Math.round(extremes.max - extremes.min + (this.hasTickmarksBetween() ? 1 : 0)),
                labelFontSize = parseInt((options.labels.style.fontSize.split('px'))[0], 10) || 0,
                tickSpacing = (numCategories > 1) ? (axisLength / numCategories) : axisLength + (this.tickLabelPadding * 2),
                xDelta = 0, yDelta = 0,
                paddingValue;

            options.adjustedTickSpacing = tickSpacing;
            if(this.isVertical) {
                yDelta = (tickSpacing / 2) + (labelFontSize / 3);
                xDelta = - (options.tickLength + 4);
            }
            else {
                if(this.labelRotation === -45){
                    options.labels.align = 'right';
                    xDelta = labelFontSize / 2;
                    yDelta = labelFontSize / 2 + options.tickLength + 4;
                    if(axis.tickPositions.length === 1){
                        xDelta -= 50;
                    }
                }
                else if(this.labelRotation === 45){
                    options.labels.align = 'left';
                    paddingValue = 4 * this.tickLabelPadding;
                    xDelta = - labelFontSize / 2;
                    yDelta = labelFontSize / 2 + options.tickLength + 4;
                }
                else if(this.labelRotation === -90){
                    options.labels.align = 'right';
                    xDelta = labelFontSize / 3;
                    yDelta = options.tickLength + 4;
                }
                else if(this.labelRotation === 90){
                    options.labels.align = 'left';
                    xDelta = - labelFontSize / 2;
                    yDelta = options.tickLength + 4;
                }
                else{
                    options.labels.align = 'left';
                    xDelta = 0;
                    yDelta = labelFontSize + options.tickLength + 2;
                }

                // Bar vs Line
                if(options.tickmarkPlacement !== 'on') {
                    //display 1 column axis label correctly
                    if(numCategories === 1){ 
                        xDelta = -((tickSpacing / 2) + xDelta);
                    }else{
                        xDelta = (tickSpacing / 2) + xDelta;
                    }
                    
                }
            }
            options.labels.x = xDelta;
            options.labels.y = yDelta;
        },

        // The setTickPositionsPostHook will customize the look for a time axis, so our only job here is to make sure we
        // don't let Highcharts generate the "too many ticks" error (SPL-82620 and SPL-83727).
        tickPositioner: function(axis, min, max) {
            // The only edge case here is when the min and max are the same (either there is only one point of data or
            // the chart has been zoomed to a single point), in which case let Highcharts do its default behavior.
            if(min === max) {
                return null;
            }
            return [min, max];
        },

        tickRenderPostHook: function(tick, index, old, opacity) {
            // For the 90 degree label rotation case multi-line labels will end up overflowing to the left of the tick mark.
            // Translate the label to the right by the difference between its width and the pre-existing x-offset.
            // Do this before calling super so that collision detection will be accurate.
            if(tick.label && this.labelRotation === 90) {
                var lineHeight = parseInt(tick.axis.options.labels.style.lineHeight || 14, 0);
                tick.label.translate(tick.labelBBox.width - (lineHeight - this.tickLabelPadding), 0);
            }
            CategoryAxis.prototype.tickRenderPostHook.call(this, tick, index, old, opacity);
        },

        /**
         * @author sfishel
         *
         * Make adjustments to the tick positions to label only the appropriate times
         */

        setTickPositionsPostHook: function(axis, secondPass) {
            var options = axis.options,
                extremes = axis.getExtremes(),
                extremesMin = Math.round(extremes.min),
                extremesMax = Math.round(extremes.max),
                numCategories = Math.round(extremesMax - extremesMin + (this.hasTickmarksBetween() ? 1 : 0)),
                timeCategoryInfo = timeUtils.convertTimeToCategories(
                    this.originalCategories.slice(extremesMin, extremesMin + numCategories),
                    this.numLabelCutoff
                ),
                categories = timeCategoryInfo.categories;

            this.granularity = timeCategoryInfo.granularity;
            this.pointSpan = timeUtils.getPointSpan(this.originalCategories);

            axis.tickPositions = [];
            _(categories).each(function(category, i) {
                if(category !== ' ') {
                    var insertionIndex = extremesMin + i;
                    if(options.tickmarkPlacement === 'between' && numCategories !== 1) {
                        insertionIndex--;
                    }
                    options.categories[insertionIndex] = category;
                    axis.tickPositions.push(insertionIndex);
                }
            }, this);
            // adjust the axis label CSS so that soft-wrapping will not occur
            options.labels.style.whiteSpace = 'nowrap';
        },

        /**
         * @author sfishel
         *
         * Use the handleOverflow override hook to handle any collisions among the axis labels
         */

        tickHandleOverflowOverride: function(tick, index, xy, old) {
            // ignore the -1 tick for the purposes of detecting collisions and overflows, since it is not visible
            // also ignore old ticks, which are being rendered in the wrong place in preparation for animation
            if(index === -1 || old) {
                return true;
            }
            // use the first tick as an indicator that we're starting a new render routine and reset the collisionDetected flag
            // can't do the regular collision detection because the first tick isn't there yet
            if(index === 0) {
                this.collisionDetected = false;
                this.lastTickFits = true;
                return true;
            }
            this.collisionDetected = this.collisionDetected || this.tickOverlapsPrevious(tick, index, xy);
            if(tick.isLast) {
                this.lastTickFits = CategoryAxis.prototype.tickHandleOverflowOverride.call(this, tick, index, xy);
                this.resolveCollisionDetection(tick.axis, this.collisionDetected, this.lastTickFits);
                return this.lastTickFits;
            }
            return true;
        },

        tickOverlapsPrevious: function(tick, index, xy) {
            var axis = tick.axis,
                // assume this won't be called with the first tick
                previous = axis.ticks[axis.tickPositions[index - 1]],
                previousXY;

            if(!previous){
                return false;
            }
            previousXY = previous.getPosition(axis.horiz, previous.pos, axis.tickmarkOffset);
            // check for the vertical axis case
            if(this.isVertical) {
                var previousBottom = previousXY.y + this.getTickLabelExtremesY(previous)[1];
                return (xy.y - axis.options.labels.y < previousBottom + this.tickLabelPadding);
            }

            // otherwise handle the horizontal axis case
            var previousRight = previousXY.x + this.getTickLabelExtremesX(previous)[1];
            if(tick.label.rotation === -90) {
                return (xy.x - (axis.options.labels.x / 2) < previousRight);
            }
            return xy.x < previousRight;
        },

        tickOverlapsNext: function(tick, index, xy) {
            var axis = tick.axis,
                // assume this won't be called with the last tick
                next = axis.ticks[axis.tickPositions[index + 1]], 
                nextXY;

            if(!next) {
                return false;
            }
            nextXY = next.getPosition(axis.horiz, next.pos, axis.tickmarkOffset);

            // check for the vertical axis case
            if(this.isVertical) {
                var myBottom = xy.y + this.getTickLabelExtremesY(tick)[1];
                return (myBottom > nextXY.y);
            }

            // otherwise handle the horizontal case
            var myRight = xy.x + this.getTickLabelExtremesX(tick)[1];
            return (myRight > nextXY.x);
        },

        resolveCollisionDetection: function(axis, hasCollisions, lastLabelFits) {
            var tickPositions = axis.tickPositions,
                collisionTickPositions = tickPositions.slice(1),
                ticks = axis.ticks,
                rawLabels = this.originalCategories,
                labelGranularity = this.granularity,
                positionOffset = this.hasTickmarksBetween() ? 1 : 0;

            if(hasCollisions) {
                _(collisionTickPositions).each(function(pos, i) {
                    i++; // do this because we sliced out the first tick
                    var tick = ticks[pos];
                    if(i % 2 === 0) {
                        var bdTime = splunkTimeUtils.extractBdTime(rawLabels[tick.pos + positionOffset]),
                            prevTick = ticks[tickPositions[i - 2]],
                            prevBdTime = splunkTimeUtils.extractBdTime(rawLabels[prevTick.pos + positionOffset]),
                            newLabel = (timeUtils.formatBdTimeAsAxisLabel(bdTime, prevBdTime, labelGranularity) || ['']).join('<br/>');

                        tick.label.attr({ text: newLabel });
                    }
                    else {
                        tick.label.hide();
                        if(tick.mark) {
                            tick.mark.hide();
                        }
                    }
                });
            }
            else {
                _(collisionTickPositions).each(function(pos, i) {
                    i++; // do this because we sliced out the first tick
                    var tick = ticks[pos];
                    tick.label.show();
                    if(tick.mark) {
                        tick.mark.show();
                    }
                    if(i % 2 === 0) {
                        var bdTime = splunkTimeUtils.extractBdTime(rawLabels[pos + positionOffset]),
                            prevTick = ticks[tickPositions[i - 1]],
                            prevBdTime = splunkTimeUtils.extractBdTime(rawLabels[prevTick.pos + positionOffset]),
                            newLabel = (timeUtils.formatBdTimeAsAxisLabel(bdTime, prevBdTime, labelGranularity) || ['']).join('<br/>');

                        tick.label.attr({ text: newLabel });
                    }
                });
            }
            if(!lastLabelFits && (!hasCollisions || tickPositions.length % 2 !== 0)) {
                axis.ticks[_(tickPositions).last()].label.hide();
            }
        },

        // have to make some adjustments to get the correct answer when tickmarkPlacement = between
        getTickLabelExtremesX: function(tick) {
            var extremes = CategoryAxis.prototype.getTickLabelExtremesX.call(this, tick),
                axisOptions = tick.axis.options;
            if(this.hasTickmarksBetween() && tick.label.rotation === 0) {
                return _(extremes).map(function(extreme) { return extreme - (axisOptions.adjustedTickSpacing / 2); });
            }
            // FIXME: hacky solution: when rotation is -90 and -45, the multiline overflow can overlap not just the nearest label to the right
            // but the nearest two labels to the right - and collision detection only hides the nearest label to the right, 
            // leaving the second label to the right still overlapping. For now, we simplistically pretend the first label is wider
            // than it is, to force an increase in tickSpacing (instead of re-checking for collisions after the first label is fully rendered, 
            // at which point we can increase the NEG45_ROTATION_LABEL_CUTOFF to ROTATION_LABEL_CUTOFF).
            if(tick.isFirst){
                if(tick.label.rotation === -90 || tick.label.rotation === -45 || tick.label.rotation === 90){
                    extremes[1] = tick.labelBBox.width;
                }
            }
            return extremes;
        },

        // inheritance gets a little weird here, the TimeAxis wants to go back to the base Axis behavior for this method
        getTickLabelExtremesY: function(tick) {
            return Axis.prototype.getTickLabelExtremesY.apply(this, arguments);
        }

    });

    return TimeAxis;

});
