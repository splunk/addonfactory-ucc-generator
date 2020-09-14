define([
            'jquery',
            'underscore',
            '../helpers/EventMixin',
            '../helpers/Formatter',
            '../helpers/HoverEventThrottler',
            '../util/parsing_utils',
            '../util/color_utils',
            '../util/dom_utils'
        ],
        function(
            $,
            _,
            EventMixin,
            Formatter,
            HoverEventThrottler,
            parsingUtils,
            colorUtils,
            domUtils
        ) {

    var Legend = function(properties) {
        this.properties = properties || {};
        this.id = _.uniqueId('legend_');
        this.clickEnabled = parsingUtils.normalizeBoolean(this.properties.clickEnabled);
        this.ellipsisMode = this.OVERFLOW_TO_ELLIPSIS_MAP[this.properties['labelStyle.overflowMode']]
            || this.DEFAULT_ELLIPSIS_MODE;
        this.UNHIGHLIGHTED_COLOR =
            colorUtils.addAlphaToColor(this.UNHIGHLIGHTED_BASE_COLOR, this.UNHIGHLIGHTED_OPACITY);
    };

    Legend.prototype = $.extend({}, EventMixin, {

        HIGHLIGHTED_OPACITY: 1.0,
        HIGHLIGHTED_SYMBOL_OPACITY: 1.0,
        UNHIGHLIGHTED_OPACITY: 0.3,
        UNHIGHLIGHTED_BASE_COLOR: 'rgb(150, 150, 150)',
        DEFAULT_PLACEMENT: 'right',
        DEFAULT_ELLIPSIS_MODE: 'middle',

        BASE_CONFIG: {
            borderWidth: 0
        },

        PLACEMENT_OPTIONS: {
            top: true,
            left: true,
            bottom: true,
            right: true,
            none: true
        },

        PLACEMENT_TO_MARGIN_MAP: {
            top: 12,
            left: 15,
            bottom: 2,
            right: 2
        },

        OVERFLOW_TO_ELLIPSIS_MAP: {
            ellipsisStart: 'start',
            ellipsisMiddle: 'middle',
            ellipsisEnd: 'end',
            ellipsisNone: 'none',
            'default': 'start'
        },

        getConfig: function() {
            var placement = this.PLACEMENT_OPTIONS.hasOwnProperty(this.properties['placement']) ?
                    this.properties['placement'] : this.DEFAULT_PLACEMENT,
                isVertical = { left: true, right: true }.hasOwnProperty(placement),
                itemCursorStyle = this.clickEnabled ? 'pointer' : 'default';
            
            return $.extend(true, {}, this.BASE_CONFIG, {
                enabled: this.properties['isEmpty'] ? false : true,
                align: isVertical ? placement : 'center',
                verticalAlign: isVertical ? 'middle' : placement,
                layout: isVertical ? 'vertical' : 'horizontal',
                margin: this.PLACEMENT_TO_MARGIN_MAP[placement],
                itemStyle: {
                    cursor: itemCursorStyle,
                    color: this.properties['fontColor'] || '#000000',
                    fontWeight: 'normal',
                    // Hack to make sure we can render literal '<' and '>'
                    HcTextStroke: true
                },
                itemHoverStyle: {
                    cursor: itemCursorStyle,
                    color: this.properties['fontColor'] || '#000000'
                },
                renderItemsPreHook: _(this.renderItemsPreHook).bind(this),
                renderItemsPostHook: _(this.renderItemsPostHook).bind(this),
                renderPreHook: _(this.renderPreHook).bind(this),
                renderPostHook: _(this.renderPostHook).bind(this)
            });
        },

        onChartLoad: function(chart) {
            // Works but may need to be changed in the future
            this.hcSeriesList = _(chart.series).filter(function(series){
                return series.options.showInLegend !== false;
            });
            this.setSymbolFillOpacity(this.hcSeriesList[0]);
        },

        onChartLoadOrRedraw: function(chart) {
            this.hcSeriesList = _(chart.series).filter(function(series){
                return series.options.showInLegend !== false;
            });            
            this.removeEventHandlers();
            this.addEventHandlers();
        },

        setSymbolFillOpacity: function(series) {
            // Line chart has a "legendLine" instead of a "legendSymbol"
            var symbol = series.legendSymbol || series.legendLine;
            // Highcharts SVG wrapper's 'attr' method returns 0 if fill-opacity attribute is not set (which behaves like fill-opacity = 1)
            var computedOpacity = colorUtils.getComputedOpacity(symbol);
            if (computedOpacity === 0) { 
                //Highcharts attr method when used to set fill-opacity seems to treat fill-opacity 0 as 0, as opposed 1 (as the above would indicate)
                this.HIGHLIGHTED_SYMBOL_OPACITY = 1;
            } else {
                this.HIGHLIGHTED_SYMBOL_OPACITY = computedOpacity;
            }
        },

        addEventHandlers: function() {
            var that = this,
                properties = {
                    highlightDelay: 125,
                    unhighlightDelay: 50,
                    onMouseOver: function(fieldName) {
                        that.selectField(fieldName);
                        that.trigger('mouseover', [fieldName]);
                    },
                    onMouseOut: function(fieldName) {
                        that.unSelectField(fieldName);
                        that.trigger('mouseout', [fieldName]);
                    }
                },
                throttle = new HoverEventThrottler(properties);

            _(this.hcSeriesList).each(function(series) {
                var fieldName = series.name;
                _(this.getSeriesLegendObjects(series)).each(function(graphic) {
                    domUtils.jQueryOn.call($(graphic.element), 'mouseover.' + this.id, function() {
                        throttle.mouseOverHappened(fieldName);
                    });
                    domUtils.jQueryOn.call($(graphic.element), 'mouseout.' + this.id, function() {
                        throttle.mouseOutHappened(fieldName);
                    });
                    if(this.clickEnabled) {
                        domUtils.jQueryOn.call($(graphic.element), 'click.' + this.id, function(e) {
                            var clickEvent = {
                                type: 'click',
                                modifierKey: (e.ctrlKey || e.metaKey)
                            };
                            that.trigger(clickEvent, [fieldName]);
                        });
                    }
                }, this);
            }, this);
        },

        removeEventHandlers: function() {
            _(this.hcSeriesList).each(function(series) {
                _(this.getSeriesLegendObjects(series)).each(function(graphic) {
                    domUtils.jQueryOff.call($(graphic.element), '.' + this.id);
                }, this);
            }, this);
        },

        selectField: function(fieldName) {
            _(this.hcSeriesList).each(function(series) {
                if(series.name !== fieldName) {
                    this.unHighlightField(fieldName, series);
                } else {
                    this.highlightField(fieldName, series);
                }
            }, this);
        },

        unSelectField: function(fieldName) {
            _(this.hcSeriesList).each(function(series) {
                if(series.name !== fieldName) {
                    this.highlightField(fieldName, series);
                }
            }, this);
        },

        highlightField: function(fieldName, series) {
            series = series || this.getSeriesByFieldName(fieldName);
            var objects = this.getSeriesLegendObjects(series),
                seriesColor = series.color;
            if(objects.item) {
                objects.item.attr('fill-opacity', this.HIGHLIGHTED_OPACITY);
            }
            if(objects.line) {
                objects.line.attr('stroke', seriesColor);
            }
            if(objects.symbol) {
                objects.symbol.attr({
                    'fill': seriesColor,
                    'stroke': seriesColor,
                    'fill-opacity': this.HIGHLIGHTED_SYMBOL_OPACITY
                });
            }
        },

        unHighlightField: function(fieldName, series) {
            series = series || this.getSeriesByFieldName(fieldName);
            var objects = this.getSeriesLegendObjects(series);
            if(objects.item) {
                objects.item.attr('fill-opacity', this.UNHIGHLIGHTED_OPACITY);
            }
            if(objects.line) {
                objects.line.attr('stroke', this.UNHIGHLIGHTED_COLOR);
            }
            if(objects.symbol) {
                objects.symbol.attr({
                    'fill': this.UNHIGHLIGHTED_COLOR,
                    'stroke': this.UNHIGHLIGHTED_COLOR,
                    'fill-opacity': this.UNHIGHLIGHTED_OPACITY
                });
            }
        },

        getSeriesByFieldName: function(fieldName) {
            return _(this.hcSeriesList).find(function(series) { return series.name === fieldName; });
        },

        getSeriesLegendObjects: function(series) {
            var objects = {};

            if(series.legendItem) {
                objects.item = series.legendItem;
            }
            if(series.legendSymbol) {
                objects.symbol = series.legendSymbol;
            }
            if(series.legendLine) {
                objects.line = series.legendLine;
            }
            return objects;
        },

        destroy: function() {
            this.off();
            this.removeEventHandlers();
            this.hcSeriesList = null;
        },

        /**
         * @author sfishel
         *
         * Do some intelligent ellipsizing of the legend labels (if needed) before they are rendered.
         */

        renderItemsPreHook: function(legend) {
            var i, adjusted, fixedWidth, maxWidth,
                options = legend.options,
                itemStyle = legend.itemStyle,
                items = legend.allItems,
                chart = legend.chart,
                renderer = chart.renderer,
                spacingBox = chart.spacingBox,
                horizontalLayout = (options.layout === 'horizontal'),
                defaultFontSize = 12,
                minFontSize = 10,
                symbolWidth = legend.symbolWidth,
                symbolPadding = options.symbolPadding,
                boxPadding = legend.padding || 0,
                itemHorizSpacing = 10,
                labels = [],
                formatter = new Formatter(renderer);

            if(horizontalLayout) {
                maxWidth = (items.length > 5) ?
                    // With more than 5 items, don't try to fit them all on one line.
                    Math.floor(spacingBox.width / 6) :
                    // With >= 5 items, determine the width allowed for each item to fit all on one line, taking into account
                    // the space needed for the symbol and padding between items
                    Math.floor(spacingBox.width / items.length) - (symbolWidth + symbolPadding + itemHorizSpacing);
            }
            else {
                maxWidth = Math.floor(spacingBox.width / 6) - (symbolWidth + symbolPadding + boxPadding);
            }

            // make a copy of the original formatting function, since we're going to clobber it
            if(!options.originalFormatter) {
                options.originalFormatter = options.labelFormatter;
            }
            // get all of the legend labels
            for(i = 0; i < items.length; i++) {
                labels.push(options.originalFormatter.call(items[i]));
            }

            adjusted = formatter.adjustLabels(labels, maxWidth, minFontSize, defaultFontSize, this.ellipsisMode);

            // in case of horizontal layout with ellipsized labels, set a fixed width for nice alignment
            if(adjusted.areEllipsized && horizontalLayout && items.length > 5) {
                fixedWidth = maxWidth + symbolWidth + symbolPadding + itemHorizSpacing;
                options.itemWidth = fixedWidth;
            }
            else {
                options.itemWidth = undefined;
            }

            // set the new labels to the name field of each item
            for(i = 0; i < items.length; i++) {
                items[i].ellipsizedName = adjusted.labels[i];
                // if the legendItem is already set this is a resize event, so we need to explicitly reformat the item
                if(items[i].legendItem) {
                    domUtils.setLegendItemText(items[i].legendItem, parsingUtils.escapeSVG(adjusted.labels[i]));
                    items[i].legendItem.css({ 'font-size': adjusted.fontSize + 'px' });
                }
            }
            // now that the ellipsizedName field has the pre-formatted labels, update the label formatter
            options.labelFormatter = function() {
                return parsingUtils.escapeSVG(this.ellipsizedName);
            };
            // adjust the font size
            itemStyle['font-size'] = adjusted.fontSize + 'px';
            legend.itemMarginTop = defaultFontSize - adjusted.fontSize;
            formatter.destroy();
        },

        /**
         * @author sfishel
         *
         * Detect if the legend items will overflow the container (in which case navigation buttons will be shown)
         * and adjust the default values for the vertical positioning and width
         *
         * FIXME: it would be better to do this work after the nav has been rendered instead of
         * hard-coding an expected width
         */

        renderItemsPostHook: function(legend) {
            var NAV_WIDTH = 55,
                options = legend.options,
                padding = legend.padding,
                legendHeight = legend.lastItemY + legend.lastLineHeight,
                availableHeight = legend.chart.spacingBox.height - padding;

            if(legendHeight > availableHeight) {
                options.verticalAlign = 'top';
                options.y = -padding;
                if(legend.offsetWidth < NAV_WIDTH) {
                    options.width = NAV_WIDTH;
                }
            }
            else {
                // SPL-70551, make sure to set things back to defaults in case the chart was resized to a larger height
                var config = this.getConfig();
                $.extend(options, {
                    verticalAlign: config.verticalAlign,
                    y: config.y,
                    width: config.width
                });
            }
        },

        // SPL-88618
        // Highcharts works around some rendering bugs in Firefox and IE 11 by delaying the positioning of legend items.
        // However, this results in a split second where all of the legend items are on top of each other.
        // Some basic testing indicates that these bugs no longer exist in latest versions of Firefox and IE 11,
        // so we trick Highcharts into not delaying by pretending to be in export mode, just for the legend render.
        renderPreHook: function(legend) {
            var renderer = legend.chart.renderer;
            this._rendererForExport = renderer.forExport;
            renderer.forExport = true;
        },

        renderPostHook: function(legend) {
            legend.chart.renderer.forExport = this._rendererForExport;
        }

    });

    return Legend;

});