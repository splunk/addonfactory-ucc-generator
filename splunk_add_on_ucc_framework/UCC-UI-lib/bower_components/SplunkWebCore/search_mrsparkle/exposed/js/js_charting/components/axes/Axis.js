define([
            'jquery',
            'underscore',
            '../../helpers/Formatter',
            '../../util/parsing_utils',
            '../../util/dom_utils'
        ],
        function(
            $,
            _,
            Formatter,
            parsingUtils,
            domUtils
        ) {

    var AxisBase = function(properties) {
        this.properties = properties || {};
        this.id = _.uniqueId('axis_');
        this.isVertical = this.properties['axis.orientation'] === 'vertical';
        this.isZoomed = false;
        this._titleIsDirty = false;
        if(!this.labelRotation){
            this.labelRotation = this.isVertical 
                ? 0 
                : parsingUtils.getRotation(this.properties['axisLabels.majorLabelStyle.rotation']);
        }
    };

    AxisBase.prototype = {

        getZoomed: function(newMin, newMax){
            var axis = this.hcAxis;
            return (newMin !== undefined && newMin > axis.dataMin) 
                    || (newMax !== undefined && newMax < (axis.options.tickmarkPlacement === 'between' ? axis.dataMax : axis.dataMax + 1));
        },

        clone: function() {
            return (new this.constructor($.extend(true, {}, this.properties)));
        },

        getConfig: function() {
            var titleText = null,
                that = this;
            if(!this.properties['isEmpty'] 
                && this.properties['axisTitle.visibility'] !== 'collapsed' 
                && !!this.properties['axisTitle.text'] 
                && !(/^\s+$/.test(this.properties['axisTitle.text']))) 
            {
                titleText = parsingUtils.escapeSVG(this.properties['axisTitle.text']);
            }
            return $.extend(true, this.getOrientationDependentConfig(), {
                id: this.id,
                labels: {
                    enabled: (this.properties['axisLabels.majorLabelVisibility'] !== 'hide'),
                    formatter: function() {
                        var formatInfo = this;
                        return that.formatLabel(formatInfo);
                    },
                    style: {
                        color: this.properties['axis.fontColor'] || '#000000'
                    }
                },
                title: {
                    style: {
                        color: this.properties['axis.fontColor'] || '#000000',
                        fontSize: '12px',
                        // Hack to make sure we can render literal '<' and '>'
                        HcTextStroke: true
                    },
                    text: titleText
                },
                opposite: this.properties['opposite'],

                lineColor: this.properties['axis.foregroundColorSoft'] || '#d9dce0',
                lineWidth: (this.properties['axisLabels.axisVisibility'] === 'hide') ? 0 : 1,
                gridLineColor: this.properties['axis.foregroundColorSofter'] || '#ebedef',

                tickLength: parseInt(this.properties['axisLabels.majorTickSize'], 10) || 6,
                tickColor: this.properties['axis.foregroundColorSoft'] || '#d9dce0',
                tickWidth: (this.properties['axisLabels.majorTickVisibility'] === 'hide') ? 0 : 1 ,
                tickRenderPostHook: _(this.tickRenderPostHook).bind(this),
                tickHandleOverflowOverride: _(this.tickHandleOverflowOverride).bind(this),
                getOffsetPreHook: _(this.getOffsetPreHook).bind(this), 
                zoomOverride: _(this.zoomOverride).bind(this),
                getLabelSizeOverride: _(this.getLabelSizeOverride).bind(this)
            });
        },

        zoomOverride: function(axis, newMin, newMax) {
            axis.displayBtn = false;
            if (axis.dataMin && newMin <= axis.dataMin) {
                newMin = undefined;
            }
            if (axis.dataMax && ((axis.options.tickmarkPlacement === 'between' && newMax >= axis.dataMax)
                    || (axis.options.tickmarkPlacement === 'on' && newMax > axis.dataMax))){
               newMax = undefined;
            }
            this.isZoomed = this.getZoomed(newMin, newMax);
            axis.setExtremes(
                newMin,
                newMax,
                false, 
                undefined, 
                { trigger: 'zoom' }
            );
            return true;
        },

        getOrientationDependentConfig: function() {
            if(this.isVertical) {
                return $.extend(true, {}, this.BASE_VERT_CONFIG, this.getVerticalConfig());
            }
            return $.extend(true, {}, this.BASE_HORIZ_CONFIG, this.getHorizontalConfig());
        },

        onChartLoad: function() {},
        redraw: function(redrawChart) {
            if(!this.hcAxis) {
                throw new Error('cannot redraw an axis that has not been drawn yet');
            }
            if(this.titleIsDirty()) {
                this.hcAxis.setTitle({text: this.properties['axisTitle.text']}, redrawChart);
            }
        },

        titleIsDirty: function() {
            return this._titleIsDirty;
        },

        setTitle: function(title) {
            this.previousAxisTitle = this.properties['axisTitle.text'];
            this.properties['axisTitle.text'] = title;

            if(!_.isEqual(this.properties['axisTitle.text'], this.previousAxisTitle)) {
                this._titleIsDirty = true;
            }
        },

        onChartLoadOrRedraw: function(chart) {
            this.hcAxis = chart.get(this.id);
            this.initializeTicks();
            this._titleIsDirty = false;
        },

        // convert the ticks to an array in ascending order by 'pos'
        initializeTicks: function() {
            var key,
                ticks = this.hcAxis.ticks,
                tickArray = [];

            for(key in ticks) {
                if(ticks.hasOwnProperty(key)) {
                    tickArray.push(ticks[key]);
                }
            }
            tickArray.sort(function(t1, t2) {
                return (t1.pos - t2.pos);
            });
            this.ticks = tickArray;
        },

        tickRenderPostHook: function(tick, index, old, opacity) {
            // Highcharts renders with zero opacity to remove old ticks
            if(!tick.label || opacity === 0) {
                return;
            }
            if(!tick.handleOverflow(index, tick.label.xy, old)) {
                domUtils.hideTickLabel(tick);
            }
            else {
                domUtils.showTickLabel(tick);
            }
        },

        getOffsetPreHook: function(axis) {
            if(axis.userOptions.title.text) {
                var chart = axis.chart,
                    formatter = new Formatter(chart.renderer),
                    axisTitle = axis.userOptions.title.text,
                    fontSize = 12,
                    elidedTitle;

                if(axis.horiz) {
                    elidedTitle = formatter.ellipsize(axisTitle, chart.chartWidth - 100, fontSize, { fontWeight: 'bold' });
                } 
                else {
                    elidedTitle = formatter.ellipsize(axisTitle, chart.chartHeight - 100, fontSize, { fontWeight: 'bold' });
                }
                
                axis.options.title.text = elidedTitle;
                if(axis.axisTitle) {
                    axis.axisTitle.attr({ text: elidedTitle });
                }

                formatter.destroy();
            }
        },

        tickHandleOverflowOverride: function(tick, index, xy) {
            if(tick.isFirst) {
                return this.handleFirstTickOverflow(tick, index, xy);
            }
            var axis = tick.axis,
                axisOptions = axis.options,
                numTicks = axis.tickPositions.length - (axisOptions.tickmarkPlacement === 'between' ? 0 : 1),
                labelStep = axisOptions.labels.step || 1;

            // take the label step into account when identifying the last visible label
            if(tick.isLast || index === (numTicks - (numTicks % labelStep))) {
                return this.handleLastTickOverflow(tick, index, xy);
            }
            return true;
        },

        handleFirstTickOverflow: function(tick, index, xy) {
            // if the axis is horizontal or reversed, the first label is oriented such that it can't overflow
            var axis = tick.axis;
            if(axis.horiz || axis.reversed) {
                return true;
            }
            var labelBottom = this.getTickLabelExtremesY(tick)[1],
                axisBottom = axis.top + axis.len;

            return (xy.y + labelBottom <= axisBottom);
        },

        handleLastTickOverflow: function(tick, index, xy) {
            var axis = tick.axis;
            // if the axis is vertical and not reversed, the last label is oriented such that it can't overflow
            if(!axis.horiz && !axis.reversed) {
                return true;
            }
            // handle the horizontal axis case
            if(axis.horiz) {
                var axisRight = axis.left + axis.len,
                    labelRight = this.getTickLabelExtremesX(tick)[1];

                return (xy.x + labelRight <= axisRight);
            }

            // handle the reversed vertical axis case
            var labelBottom = this.getTickLabelExtremesY(tick)[1],
                axisBottom = axis.top + axis.len;

            return (xy.y + labelBottom <= axisBottom);
        },

        getTickLabelExtremesX: function(tick) {
            return tick.getLabelSides();
        },

        getTickLabelExtremesY: function(tick) {
            var labelTop = -(tick.axis.options.labels.y / 2);
            return [labelTop, labelTop + tick.labelBBox.height];
        },

        // An override of the Highcharts routine for determining a label size perpendicular to its axis,
        // which is used to set axis margins.
        getLabelSizeOverride: function(tick) {
            if (!tick.label) {
                return 0;
            }
            var isHoriz = this.properties['axis.orientation'] === 'horizontal';
            tick.labelBBox = tick.label.getBBox();
            // If this is the last visible tick of a horizontal axis of an area/line chart, then
            // the tick label is not visible (only the tick mark is rendered) so we return 0.
            if (isHoriz && this.properties['axisLabels.tickmarkPlacement'] === 'on' && tick.isLast && !tick.isFirst) {
                return 0;
            }
            return tick.labelBBox[isHoriz ? 'height' : 'width'];
        },

        destroy: function() {
            this.hcAxis = null;
        },

        getVerticalConfig: function() { return {}; },
        getHorizontalConfig: function() { 
            return {    
                labels: {
                    rotation: this.labelRotation
                }
            };
        },

        BASE_HORIZ_CONFIG: {
            title: {
                margin: 6
            },
            labels: {
                y: 15
            }
        },

        BASE_VERT_CONFIG: {
        title: {
                margin: 6
            }
        }

    };

    return AxisBase;
    
});
