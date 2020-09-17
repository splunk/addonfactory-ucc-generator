define([
            'jquery',
            './FillerGauge',
            '../../util/lang_utils',        
            '../../util/math_utils'        
        ], 
        function(
            $,
            FillerGauge,
            langUtils,
            mathUtils
        ) {

    var VerticalFillerGauge = function(container, properties) {
        FillerGauge.call(this, container, properties);
        this.tickWidth = 1;
    };
    langUtils.inherit(VerticalFillerGauge, FillerGauge);

    $.extend(VerticalFillerGauge.prototype, {

        renderGauge: function() {
            this.tickOffset = mathUtils.roundWithMin(this.height / 100, 3);
            this.tickLength = mathUtils.roundWithMin(this.height / 20, 4);
            this.tickLabelOffset = mathUtils.roundWithMin(this.height / 60, 3);
            this.tickFontSize = mathUtils.roundWithMin(this.height / 20, 10);  // in pixels
            this.minorTickLength = this.tickLength / 2;
            this.backgroundCornerRad = mathUtils.roundWithMin(this.height / 60, 3);
            this.valueBottomPadding = mathUtils.roundWithMin(this.height / 30, 5);
            this.valueFontSize = mathUtils.roundWithMin(this.height / 20, 12);  // in pixels
            FillerGauge.prototype.renderGauge.call(this);
        },

        drawBackground: function() {
            this.verticalPadding = 10 + this.tickFontSize / 2;
            this.backgroundWidth = mathUtils.roundWithMin(this.height / 4, 50);
            this.backgroundHeight = this.height - (2 * this.verticalPadding);

            // rather than trying to dynamically increase the width as the values come in, we
            // provide enough room for an order of magnitude greater than the highest range value
            var maxValueWidth = this.determineMaxValueWidth(this.ranges, this.valueFontSize) + 10;

            this.backgroundWidth = Math.max(this.backgroundWidth, maxValueWidth);

            if(this.isShiny) {
                this.elements.background = this.renderer.rect((this.width - this.backgroundWidth) / 2,
                    this.verticalPadding, this.backgroundWidth, this.backgroundHeight,
                    this.backgroundCornerRad)
                    .attr({
                        fill: '#edede7',
                        stroke: 'silver',
                        'stroke-width': 1
                    })
                    .add();
            }

            // these values depend on the adjusted width of the background
            this.tickStartX = (this.width + this.backgroundWidth) / 2 + this.tickOffset;
            this.tickEndX = this.tickStartX + this.tickLength;
            this.tickLabelStartX = this.tickEndX + this.tickLabelOffset;
        },

        determineMaxValueWidth: function(ranges, fontSize) {
            // in percent mode, we can hard-code what the max-width value can be
            if(this.usePercentageValue) {
                return this.predictTextWidth("100.00%", fontSize);
            }
            var i, valueString,
                maxWidth = 0;

            // loop through all ranges and determine which has the greatest width (because of scientific notation, we can't just look at the extremes)
            // additionally add an extra digit to the min and max ranges to accomodate out-of-range values
            for(i = 0; i < ranges.length; i++) {
                valueString = "" + ranges[i];
                if(i === 0 || i === ranges.length - 1) {
                    valueString += "0";
                }
                maxWidth = Math.max(maxWidth, this.predictTextWidth(valueString, fontSize));
            }
            return maxWidth;
        },

        drawMajorTick: function(height) {
            var tickHeight = this.verticalPadding + this.backgroundHeight - height;

            return this.renderer.path([
                'M', this.tickStartX, tickHeight,
                'L', this.tickEndX, tickHeight
            ])
                .attr({
                    stroke: this.tickColor,
                    'stroke-width': this.tickWidth
                })
                .add();
        },

        drawMajorTickLabel: function(height, text) {
            var tickHeight = this.verticalPadding + this.backgroundHeight - height;

            return this.renderer.text(text,
                this.tickLabelStartX, tickHeight + (this.tickFontSize / 4)
            )
                .attr({
                    align: 'left'
                })
                .css({
                    color: this.tickFontColor,
                    fontSize: this.tickFontSize + 'px',
                    lineHeight: this.tickFontSize + 'px'
                })
                .add();
        },

        drawMinorTick: function(height) {
            var tickHeight = this.verticalPadding + this.backgroundHeight - height;

            return this.renderer.path([
                'M', this.tickStartX, tickHeight,
                'L', this.tickStartX + this.minorTickLength, tickHeight
            ])
                .attr({
                    stroke: this.tickColor,
                    'stroke-width': this.minorTickWidth
                })
                .add();
        },

        drawIndicator: function(val) {
            // TODO: implement calculation of gradient based on user-defined colors
            // for now we are using solid colors

            var //fillGradient = this.getFillGradient(val),
                fillColor = this.getFillColor(val),
                fillHeight = this.normalizedTranslateValue(val),
                fillTopY,
                fillPath;
            if(fillHeight > 0) {
                fillHeight = Math.max(fillHeight, this.backgroundCornerRad);
                fillTopY = this.verticalPadding + this.backgroundHeight - fillHeight;
                if(!this.isShiny) {
                    fillPath = [
                        'M', (this.width - this.backgroundWidth) / 2,
                        this.height - this.verticalPadding,
                        'L', (this.width + this.backgroundWidth) / 2,
                        this.height - this.verticalPadding,
                        (this.width + this.backgroundWidth) / 2,
                        fillTopY,
                        (this.width - this.backgroundWidth) / 2,
                        fillTopY,
                        (this.width - this.backgroundWidth) / 2,
                        this.height - this.verticalPadding
                    ];
                }
                else {
                    fillPath = [
                        'M', (this.width - this.backgroundWidth - 2) / 2,
                        this.height - this.verticalPadding - this.backgroundCornerRad,
                        'C', (this.width - this.backgroundWidth - 2) / 2,
                        this.height - this.verticalPadding - this.backgroundCornerRad,
                        (this.width - this.backgroundWidth - 2) / 2,
                        this.height - this.verticalPadding,
                        (this.width - this.backgroundWidth - 2) / 2 + this.backgroundCornerRad,
                        this.height - this.verticalPadding,
                        'L', (this.width + this.backgroundWidth - 2) / 2 - this.backgroundCornerRad,
                        this.height - this.verticalPadding,
                        'C', (this.width + this.backgroundWidth - 2) / 2 - this.backgroundCornerRad,
                        this.height - this.verticalPadding,
                        (this.width + this.backgroundWidth - 2) / 2,
                        this.height - this.verticalPadding,
                        (this.width + this.backgroundWidth - 2) / 2,
                        this.height - this.verticalPadding - this.backgroundCornerRad,
                        'L', (this.width + this.backgroundWidth - 2) / 2,
                        fillTopY,
                        (this.width - this.backgroundWidth - 2) / 2,
                        fillTopY,
                        (this.width - this.backgroundWidth - 2) / 2,
                        this.height - this.verticalPadding - this.backgroundCornerRad
                    ];
                }
            }
            else {
                fillPath = [];
            }

            if(this.elements.fill) {
                this.elements.fill.destroy();
            }
            this.elements.fill = this.renderer.path(fillPath)
                .attr({
                    fill: fillColor
                })
                .add();
            if(this.showValue) {
                this.drawValueDisplay(val, fillColor);
            }
        },

        drawValueDisplay: function(val, fillColor) {
            var displayVal = this.getDisplayValue(val),
                fillHeight = this.normalizedTranslateValue(val),
                fillTopY = this.verticalPadding + this.backgroundHeight - fillHeight,
                valueTotalHeight = this.valueFontSize + this.valueBottomPadding,

                valueColor = this.getValueColor(fillColor),
                valueBottomY,
                valueText = this.formatValue(displayVal);

            // determine if the value display can (vertically) fit inside the fill,
            // if not orient it to the bottom of the fill
            if(fillHeight >= valueTotalHeight) {
                valueBottomY = fillTopY + valueTotalHeight - this.valueBottomPadding;
            }
            else {
                valueBottomY = fillTopY - this.valueBottomPadding;
                valueColor = this.defaultValueColor;
            }
            if(this.elements.valueDisplay) {
                this.elements.valueDisplay.attr({
                    text: valueText,
                    y: valueBottomY
                })
                    .css({
                        color: valueColor,
                        fontSize: this.valueFontSize + 'px',
                        fontWeight: 'bold'
                    }).toFront();
            }
            else {
                this.elements.valueDisplay = this.renderer.text(
                    valueText, this.width / 2, valueBottomY
                )
                    .css({
                        color: valueColor,
                        fontSize: this.valueFontSize + 'px',
                        lineHeight: this.valueFontSize + 'px',
                        fontWeight: 'bold'
                    })
                    .attr({
                        align: 'center'
                    })
                    .add();
            }
        },

        normalizedTranslateValue: function(val) {
            if(val < this.ranges[0]) {
                return 0;
            }
            if(val > this.ranges[this.ranges.length - 1]) {
                return this.translateValue(this.ranges[this.ranges.length - 1]) + 5;
            }
            return this.translateValue(val);
        },

        translateValue: function(val) {
            var dataRange = this.ranges[this.ranges.length - 1] - this.ranges[0],
                normalizedValue = val - this.ranges[0];

            return Math.round((normalizedValue / dataRange) * this.backgroundHeight);
        }

    });

    return VerticalFillerGauge;
    
});